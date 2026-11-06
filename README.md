# 서원대학교 미디어콘텐츠학부 졸업전시 아카이브

역대 졸업전시(연도·제목·포스터·전시 사이트·도록 PDF)를 한곳에 모아 보여 주는 웹사이트입니다.
이 저장소에는 **공개 페이지**, **관리 도구(CMS)**, **자동 배포 설정**이 모두 들어 있습니다.

| 구분 | 주소 |
|---|---|
| 아카이브 (공개 페이지) | https://media.seowon.ac.kr/archive/ |
| 관리 화면 (CMS) | https://media.seowon.ac.kr/admin/ |
| 관리 가이드 (화면 설명) | https://media.seowon.ac.kr/admin/ 로그인 후 상단 가이드 링크 (파일: `cms/public/guide.html`) |
| 각 연도 졸업전시 사이트 | https://media.seowon.ac.kr/2026/ (연도만 바꿔서 `/2027/` …) |
| 소스 저장소 | https://github.com/KHolyh2o/GEArchive |

---

## 1. 다음 해 졸업전시를 추가하는 방법 (가장 중요)

**코드를 고치거나 GitHub에 올릴 필요가 없습니다.** 관리 화면에서 입력만 하면 바로 반영됩니다.

1. https://media.seowon.ac.kr/admin/ 접속
2. 서버 아이디/비밀번호로 로그인 (관리자 `sudo` 권한이 있는 서버 계정만 가능. 5번 틀리면 15분 잠김, 8시간 뒤 자동 로그아웃)
3. 아래쪽 **전시 추가 / 수정** 칸 입력
   - 연도 (예: `2027`), 전시 제목 — 필수
   - 전시 시작일·종료일
   - 전시 사이트 주소 (예: `https://media.seowon.ac.kr/2027/`) — 카드를 누르면 이동
   - 포스터 이미지(PNG/JPG/WEBP, 세로형 권장), 도록 PDF — 없으면 비워 두고 나중에 올려도 됨
4. **저장** → 아카이브 페이지를 새로고침하면 바로 보임 (별도 배포 없음)

자세한 내용(수정·삭제, 학과 정보 변경, 문제 해결)은 `cms/public/guide.html` 을 보세요.

### 도록 PDF 용량
인디자인 원본은 수백 MB라서 그대로는 300MB 업로드 한도를 넘기 쉽습니다. 150MB 안팎을 권장합니다.
`scripts/compress-catalog.sh` 또는 가이드의 복사-붙여넣기 명령(Ghostscript)으로 줄이세요. (2026: 773MB → 약 141MB)

```bash
brew install ghostscript                      # 맥, 처음 한 번
scripts/compress-catalog.sh 도록.pdf          # → 도록_압축.pdf 생성, 원본은 그대로
```

### 화면 표시 규칙
- 도록이 없는 연도는 **"도록 보기" 버튼이 자동으로 숨겨집니다.** (서버에 PDF가 없으면 숨김)
- 포스터가 없으면 연도·제목이 적힌 색 그라데이션 카드로 표시됩니다.
- THIS YEAR / LATEST: 올해 전시가 있으면 THIS YEAR, 없으면 가장 최근 전시를 LATEST로 표시
- NEXT: 아직 끝나지 않은 가장 가까운 전시 날짜가 자동 표시, 없으면 학과 정보의 "다음 졸업전시 예정일"

---

## 2. 어떻게 만들어졌나 (구조)

```
GEArchaive/
├─ index.html              공개 페이지 (HTML/CSS/JS 한 파일, 빌드 과정 없음)
├─ data.js                 전시 데이터 (연도·제목·링크·포스터·도록 경로). CMS가 자동 생성
├─ assets/
│  ├─ posters/             연도별 포스터   (예: 2026_poster.png)
│  ├─ catalogs/            연도별 도록 PDF (예: 2026_catalog.pdf)
│  ├─ ui/                  파비콘, 푸터 아이콘
│  └─ swmc-logo.png
├─ cms/                    관리 도구 (Node.js + Express)
│  ├─ server.js            로그인, 업로드, data.js 생성
│  ├─ public/admin.html    관리 화면
│  ├─ public/guide.html    사용 가이드
│  └─ README.md            CMS 환경변수·서버 설치·nginx 설정
├─ scripts/compress-catalog.sh   도록 PDF 압축 스크립트
├─ .github/workflows/deploy.yml  main에 push하면 서버로 자동 배포
├─ archive-editorial-preview.html  디자인 시안 (배포되지 않음, 참고용)
└─ swmc-graduation-archive/        초기 실험용 프로토타입 (사용·배포하지 않음, 무시해도 됨)
```

### 공개 페이지
`index.html` 이 `data.js`(`departmentInfo`, `archives`)를 읽어 카드 목록을 그립니다.
`data.js` 는 캐시를 피해 불러오므로 CMS에서 수정하면 바로 보입니다. 서버에 도록 PDF가 실제로 있는지 `HEAD` 요청으로 확인해, 없으면 버튼을 숨깁니다.

### 관리 도구 (CMS)
- **로그인**: 별도 회원가입 없음. 입력한 아이디/비밀번호로 서버에 SSH 접속을 시도하고, 계정이 `sudo`/`wheel` 그룹이면 통과합니다. 로그인 실패 제한, CSRF 토큰, 8시간 세션 적용.
- **저장**: 서버의 `cms/data/site.json` 에 저장한 뒤 `data.js` 를 다시 만듭니다.
- **업로드**: 파일 내용을 검사해 이미지/PDF만 허용하고 `assets/posters/<연도>_poster.*`, `assets/catalogs/<연도>_catalog.pdf` 로 저장합니다.
- 환경변수, nginx 설정, 서버 설치법은 [cms/README.md](cms/README.md) 참고.

### 서버 배치
| 위치 (서버) | 내용 |
|---|---|
| `/var/www/html/archive` | 공개 페이지 + data.js + assets (nginx가 서비스) |
| `/var/www/archive-cms` | CMS 코드와 `data/site.json` (웹 루트 밖) |
| systemd 서비스 `archive-cms` | CMS 실행 (nginx `/admin/` → `127.0.0.1:3000` 프록시) |

### 자동 배포 (`.github/workflows/deploy.yml`)
`main` 브랜치에 push 하면 GitHub Actions가 서버로 올립니다.

- **코드는 매번 덮어씀**: `index.html`, `assets/ui`, 로고, CMS 코드
- **데이터는 서버 것을 보호**: `data.js`, `assets/posters`, `assets/catalogs` 는 서버에 **이미 있으면 덮어쓰지 않음** (CMS에서 올린 내용 보호). 그래서 저장소의 `data.js` 를 고쳐도 서버에는 반영되지 않습니다. **전시 데이터는 반드시 CMS에서 수정하세요.**
- 서버 접속 정보는 GitHub **Settings → Secrets and variables → Actions** 의 `SERVER_HOST`, `SERVER_PORT`, `USERNAME`, `PASSWORD` 에 저장되어 있습니다. (저장소가 공개여도 Secrets는 노출되지 않습니다.)

---

## 3. 코드를 수정하고 싶을 때 (개발자용)

디자인·기능을 바꾸려면 `index.html` 을 수정하고 `main` 에 push 하면 됩니다.

로컬에서 확인:
```bash
# 공개 페이지만: 아무 정적 서버로 열기
python3 -m http.server 8000        # → http://localhost:8000

# CMS까지 (로컬 테스트용)
cd cms && npm ci
COOKIE_SECURE=false node server.js # → http://127.0.0.1:3000
```
로컬에서는 SSH 로그인 인증이 서버 계정에 의존하므로, 로그인까지 시험하려면 `SSH_HOST`, `SSH_PORT` 환경변수를 서버로 지정해야 합니다. 화면 확인만 필요하면 공개 페이지만 열어도 충분합니다.

---

## 4. 권한 정책 (누가 수정할 수 있나)

- 저장소는 **공개(Public)** 입니다. 누구나 보고, 폴더 전체를 **다운로드(Code → Download ZIP) 또는 `git clone`** 해서 구조를 공부할 수 있습니다.
- **수정(push)은 소유자와 소유자가 Collaborator로 초대한 사람만** 가능합니다. 그 외 사람은 Fork 해서 자기 복사본에서만 고칠 수 있고, 이 저장소와 서버에는 영향을 줄 수 없습니다.
- 서버의 전시 데이터는 이 저장소가 아니라 **CMS(서버 `sudo` 계정)** 로만 바뀝니다.
- `main` 에 push 하면 곧바로 서버에 배포되므로, 코드 수정 권한(Collaborator)은 신뢰하는 사람에게만 주세요.

### 새 졸전 위원에게 권한 주기 / 회수하기
- 주기: GitHub 저장소 → **Settings → Collaborators → Add people** → 아이디 입력 (권한: Write)
- 회수: 같은 화면에서 해당 사람 **Remove**
- 그냥 구경·공부만 할 사람에게는 아무것도 할 필요 없이 저장소 주소만 알려 주면 됩니다.
- 전시 추가 권한은 GitHub와 별개입니다. 서버 관리자에게 해당 계정의 `sudo` 그룹 추가를 요청해야 합니다.

---

## 5. 인수인계 체크리스트 (매년)
- [ ] 새 담당자에게 GitHub Collaborator 초대 (코드 수정이 필요한 경우만)
- [ ] 새 담당자가 CMS에 로그인할 서버 `sudo` 계정이 있는지 확인
- [ ] 졸업한 담당자의 Collaborator 권한 제거
- [ ] 서버 비밀번호가 바뀌었다면 GitHub Secrets의 `PASSWORD` 갱신 (안 하면 자동 배포 실패)
- [ ] 전시가 끝나면: 관리 화면에서 새 연도 추가 → 포스터/도록 업로드 → 학과 정보의 "다음 졸업전시 예정일" 갱신

---

## 6. 문의
사용 중 궁금한 점이 있으면 **교수님께 2026년도 졸업전시위원회에서 개발을 맡았던 남학생의 연락처를 문의**해서 연락하세요.
