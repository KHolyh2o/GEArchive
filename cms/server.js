// 졸업전시 아카이브 CMS
// - 서버 계정(SSH 로그인)으로 인증하고, sudo/wheel 그룹 소속일 때만 접근을 허용합니다.
// - 연도별 데이터는 cms/data/site.json에 저장하고, 공개 페이지용 data.js를 자동으로 다시 만듭니다.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import express from 'express';
import multer from 'multer';
import { Client } from 'ssh2';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.resolve(process.env.SITE_ROOT || path.join(__dirname, '..'));
const DATA_FILE = path.join(__dirname, 'data', 'site.json');
const TMP_DIR = path.join(__dirname, 'tmp');
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '127.0.0.1';
const SSH_HOST = process.env.SSH_HOST || '127.0.0.1';
const SSH_PORT = Number(process.env.SSH_PORT || 22);
const ADMIN_GROUPS = (process.env.ADMIN_GROUPS || 'sudo,wheel').split(',').map((s) => s.trim());
const COOKIE_SECURE = process.env.COOKIE_SECURE !== 'false';
const SESSION_MS = 8 * 60 * 60 * 1000;

fs.mkdirSync(TMP_DIR, { recursive: true });
fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
fs.mkdirSync(path.join(SITE_ROOT, 'assets', 'posters'), { recursive: true });
fs.mkdirSync(path.join(SITE_ROOT, 'assets', 'catalogs'), { recursive: true });

// ---------- 데이터 ----------
const GRADIENTS = [
  'linear-gradient(135deg, #FF4500, #FF8E53)',
  'linear-gradient(135deg, #4FACFE, #00F2FE)',
  'linear-gradient(135deg, #43E97B, #38F9D7)',
  'linear-gradient(135deg, #FA709A, #FEE140)',
  'linear-gradient(135deg, #A18CD1, #FBC2EB)',
  'linear-gradient(135deg, #F6D365, #FDA085)',
];

function loadSite() {
  if (fs.existsSync(DATA_FILE)) return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  // 최초 실행: 기존 data.js 내용을 가져와 시작합니다.
  const src = fs.readFileSync(path.join(SITE_ROOT, 'data.js'), 'utf8');
  const ctx = {};
  vm.runInNewContext(`${src}\nthis.departmentInfo = departmentInfo; this.archives = archives;`, ctx);
  const site = { departmentInfo: ctx.departmentInfo, archives: ctx.archives };
  saveSite(site, false);
  return site;
}

function writeAtomic(file, content) {
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, content);
  fs.renameSync(tmp, file);
}

function saveSite(site, regenerate = true) {
  site.archives.sort((a, b) => Number(b.year) - Number(a.year));
  writeAtomic(DATA_FILE, JSON.stringify(site, null, 2));
  if (regenerate) {
    const js =
      '// 이 파일은 CMS(/admin)가 자동으로 생성합니다. 직접 수정하지 마세요.\n' +
      `const departmentInfo = ${JSON.stringify(site.departmentInfo, null, 4)};\n\n` +
      `const archives = ${JSON.stringify(site.archives, null, 4)};\n`;
    writeAtomic(path.join(SITE_ROOT, 'data.js'), js);
  }
}

// ---------- 인증 ----------
const sessions = new Map(); // sid -> { user, csrf, expires }
const failures = new Map(); // key -> { count, resetAt }

function tooMany(key, limit) {
  const f = failures.get(key);
  if (!f || f.resetAt < Date.now()) return false;
  return f.count >= limit;
}
function recordFailure(key) {
  const f = failures.get(key);
  if (!f || f.resetAt < Date.now()) failures.set(key, { count: 1, resetAt: Date.now() + 15 * 60 * 1000 });
  else f.count += 1;
}

// 서버(SSH)에 로그인해 보고, 계정이 관리자 그룹에 속하는지 확인합니다.
function checkServerAccount(username, password) {
  return new Promise((resolve) => {
    const conn = new Client();
    let done = false;
    const finish = (ok) => {
      if (done) return;
      done = true;
      conn.end();
      resolve(ok);
    };
    conn
      .on('ready', () => {
        conn.exec('id -nG', (err, stream) => {
          if (err) return finish(false);
          let out = '';
          stream.on('data', (d) => (out += d)).on('close', () => {
            const groups = out.trim().split(/\s+/);
            finish(groups.some((g) => ADMIN_GROUPS.includes(g)));
          });
        });
      })
      .on('keyboard-interactive', (_n, _i, _l, prompts, reply) => reply(prompts.map(() => password)))
      .on('error', () => finish(false))
      .connect({
        host: SSH_HOST,
        port: SSH_PORT,
        username,
        password,
        tryKeyboard: true,
        readyTimeout: 10000,
      });
  });
}

function parseCookies(req) {
  const out = {};
  for (const part of (req.headers.cookie || '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

function requireAuth(req, res, next) {
  const sid = parseCookies(req).sid;
  const s = sid && sessions.get(sid);
  if (!s || s.expires < Date.now()) {
    if (sid) sessions.delete(sid);
    return res.status(401).json({ error: '로그인이 필요합니다.' });
  }
  if (req.method !== 'GET' && req.get('x-csrf-token') !== s.csrf) {
    return res.status(403).json({ error: '잘못된 요청입니다.' });
  }
  req.session = s;
  next();
}

setInterval(() => {
  const now = Date.now();
  for (const [k, v] of sessions) if (v.expires < now) sessions.delete(k);
  for (const [k, v] of failures) if (v.resetAt < now) failures.delete(k);
}, 10 * 60 * 1000).unref();

// ---------- 업로드 ----------
const upload = multer({
  storage: multer.diskStorage({
    destination: TMP_DIR,
    filename: (_req, _file, cb) => cb(null, crypto.randomBytes(12).toString('hex')),
  }),
  limits: { fileSize: 300 * 1024 * 1024, files: 2 },
}).fields([{ name: 'poster', maxCount: 1 }, { name: 'catalog', maxCount: 1 }]);

function sniff(file) {
  const fd = fs.openSync(file, 'r');
  const buf = Buffer.alloc(12);
  fs.readSync(fd, buf, 0, 12, 0);
  fs.closeSync(fd);
  if (buf.slice(0, 4).toString() === '%PDF') return 'pdf';
  if (buf.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  if (buf[0] === 0xff && buf[1] === 0xd8) return 'jpg';
  if (buf.slice(0, 4).toString() === 'RIFF' && buf.slice(8, 12).toString() === 'WEBP') return 'webp';
  return null;
}

const clean = (v, max) => String(v ?? '').trim().slice(0, max);
const isDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));
const isHttpUrl = (u) => /^https?:\/\/[^\s"'<>]+$/i.test(u);

// ---------- 앱 ----------
const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 'loopback');
app.use((_req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'same-origin',
    'Cache-Control': 'no-store',
  });
  next();
});

const api = express.Router();

api.post('/login', express.json({ limit: '2kb' }), async (req, res) => {
  const username = clean(req.body?.username, 40);
  const password = String(req.body?.password ?? '').slice(0, 256);
  const ipKey = `ip:${req.ip}`;
  const userKey = `user:${username.toLowerCase()}`;
  if (tooMany(ipKey, 20) || tooMany(userKey, 5)) {
    return res.status(429).json({ error: '시도 횟수가 많습니다. 15분 후 다시 시도해 주세요.' });
  }
  const valid = /^[a-z_][a-z0-9_.-]{0,31}$/i.test(username) && password.length > 0;
  const ok = valid && (await checkServerAccount(username, password));
  if (!ok) {
    recordFailure(ipKey);
    recordFailure(userKey);
    return res.status(401).json({ error: '아이디/비밀번호가 틀렸거나 관리자 권한이 없습니다.' });
  }
  const sid = crypto.randomBytes(32).toString('hex');
  const csrf = crypto.randomBytes(16).toString('hex');
  sessions.set(sid, { user: username, csrf, expires: Date.now() + SESSION_MS });
  res.cookie('sid', sid, {
    httpOnly: true,
    sameSite: 'strict',
    secure: COOKIE_SECURE,
    path: '/admin',
    maxAge: SESSION_MS,
  });
  res.json({ user: username, csrf });
});

api.post('/logout', requireAuth, (req, res) => {
  sessions.delete(parseCookies(req).sid);
  res.clearCookie('sid', { path: '/admin' });
  res.json({ ok: true });
});

api.get('/me', requireAuth, (req, res) => res.json({ user: req.session.user, csrf: req.session.csrf }));

api.get('/site', requireAuth, (_req, res) => res.json(loadSite()));

api.put('/department', requireAuth, express.json({ limit: '10kb' }), (req, res) => {
  const site = loadSite();
  const b = req.body || {};
  const info = {
    homepage: clean(b.homepage, 300),
    instagram: clean(b.instagram, 300),
    address: clean(b.address, 300),
    tel: clean(b.tel, 40),
    lastUpdated: new Date().toISOString().slice(0, 7).replace('-', '.'),
    nextExhibitionDate: clean(b.nextExhibitionDate, 10) || 'MM-DD',
  };
  if (info.nextExhibitionDate !== 'MM-DD' && !isDate(info.nextExhibitionDate)) {
    return res.status(400).json({ error: '다음 전시 예정일 형식이 올바르지 않습니다.' });
  }
  for (const k of ['homepage', 'instagram']) {
    if (info[k] && !isHttpUrl(info[k])) return res.status(400).json({ error: `${k} 주소 형식이 올바르지 않습니다.` });
  }
  site.departmentInfo = info;
  saveSite(site);
  res.json(site);
});

// 연도 추가/수정 (같은 연도가 있으면 수정)
api.post('/archives', requireAuth, (req, res) => {
  upload(req, res, (uploadErr) => {
    const files = Object.values(req.files || {}).flat();
    const discard = () => files.forEach((f) => fs.rmSync(f.path, { force: true }));
    if (uploadErr) {
      discard();
      return res.status(400).json({ error: uploadErr.code === 'LIMIT_FILE_SIZE' ? '파일이 너무 큽니다(최대 300MB).' : '업로드에 실패했습니다.' });
    }
    try {
      const b = req.body;
      const year = clean(b.year, 4);
      const title = clean(b.title, 100);
      const link = clean(b.link, 300);
      if (!/^20\d{2}$/.test(year)) throw new Error('연도는 20XX 형식의 4자리여야 합니다.');
      if (!title) throw new Error('전시 제목을 입력해 주세요.');
      if (link && !isHttpUrl(link)) throw new Error('전시 사이트 주소는 http(s)로 시작해야 합니다.');

      const startDate = clean(b.startDate, 10);
      const endDate = clean(b.endDate, 10);
      for (const d of [startDate, endDate]) if (d && !isDate(d)) throw new Error('전시 날짜 형식이 올바르지 않습니다.');
      if (startDate && endDate && endDate < startDate) throw new Error('종료일이 시작일보다 빠릅니다.');

      const site = loadSite();
      const idx = site.archives.findIndex((a) => a.year === year);
      const prev = idx >= 0 ? site.archives[idx] : null;
      const entry = {
        year,
        title,
        desc: clean(b.desc, 200) || '서원대학교 미디어콘텐츠학부 졸업전시',
        link,
        startDate,
        endDate,
        poster: prev?.poster || '',
        catalog: prev?.catalog || '',
        placeholderGradient:
          prev?.placeholderGradient || GRADIENTS[Number(year) % GRADIENTS.length],
      };

      const poster = req.files?.poster?.[0];
      if (poster) {
        const type = sniff(poster.path);
        if (!['png', 'jpg', 'webp'].includes(type)) throw new Error('포스터는 PNG/JPG/WEBP 이미지만 가능합니다.');
        const rel = `assets/posters/${year}_poster.${type}`;
        fs.renameSync(poster.path, path.join(SITE_ROOT, rel));
        if (prev?.poster && prev.poster !== rel) fs.rmSync(path.join(SITE_ROOT, prev.poster), { force: true });
        entry.poster = rel;
      } else if (b.removePoster === 'true' && prev?.poster) {
        fs.rmSync(path.join(SITE_ROOT, prev.poster), { force: true });
        entry.poster = '';
      }

      const catalog = req.files?.catalog?.[0];
      if (catalog) {
        if (sniff(catalog.path) !== 'pdf') throw new Error('도록은 PDF 파일만 가능합니다.');
        const rel = `assets/catalogs/${year}_catalog.pdf`;
        fs.renameSync(catalog.path, path.join(SITE_ROOT, rel));
        entry.catalog = rel;
      }

      if (idx >= 0) site.archives[idx] = entry;
      else site.archives.push(entry);
      saveSite(site);
      discard();
      res.json(site);
    } catch (e) {
      discard();
      res.status(400).json({ error: e.message });
    }
  });
});

// 목록에서만 삭제합니다(업로드된 파일은 남겨 둡니다).
api.delete('/archives/:year', requireAuth, (req, res) => {
  const site = loadSite();
  site.archives = site.archives.filter((a) => a.year !== req.params.year);
  saveSite(site);
  res.json(site);
});

app.use('/admin/api', api);
app.use('/admin', express.static(path.join(__dirname, 'public'), { index: 'admin.html' }));

// 로컬 개발용: 공개 페이지도 같이 서빙합니다(운영에서는 nginx가 담당).
if (process.env.SERVE_SITE === 'true') {
  app.use((req, res, next) => (/^\/cms(\/|$)/.test(req.path) ? res.sendStatus(404) : next()));
  app.use(express.static(SITE_ROOT, { index: 'index.html', dotfiles: 'deny' }));
}

loadSite();
app.listen(PORT, HOST, () => console.log(`CMS listening on http://${HOST}:${PORT}/admin/ (SSH auth ${SSH_HOST}:${SSH_PORT})`));
