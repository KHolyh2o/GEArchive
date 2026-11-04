# 아카이브 CMS

`/admin`에서 졸업전시(연도, 제목, 포스터, 도록)를 추가·수정합니다.
서버 계정으로 로그인하며, `sudo`(또는 `wheel`) 그룹 계정만 허용됩니다.

## 동작
- 로그인: 서버 SSH에 해당 계정/비밀번호로 접속해 보고, `id -nG` 결과에 sudo/wheel이 있으면 통과
- 저장: `cms/data/site.json` → 공개 페이지용 `data.js`를 자동 재생성
- 업로드: `assets/posters/<연도>_poster.*`, `assets/catalogs/<연도>_catalog.pdf`

## 환경변수
| 이름 | 기본값 | 설명 |
|---|---|---|
| PORT / HOST | 3000 / 127.0.0.1 | CMS 리슨 주소 (nginx 뒤에서만 노출) |
| SSH_PORT | 22 | 인증에 쓸 SSH 포트 (서버가 8288이면 8288) |
| SSH_HOST | 127.0.0.1 | |
| ADMIN_GROUPS | sudo,wheel | 허용 그룹 |
| SITE_ROOT | 상위 폴더 | index.html/data.js/assets 위치 (서버에서는 /var/www/html/archive 등) |
| COOKIE_SECURE | true | HTTP로 로컬 테스트할 때만 false |

## 서버 설치 (예시)
```
cd cms && npm ci --omit=dev
SSH_PORT=8288 SITE_ROOT=/var/www/html PORT=3000 pm2 start server.js --name archive-cms
```
`SITE_ROOT` 폴더에 CMS를 실행하는 사용자의 쓰기 권한이 필요합니다(data.js, assets/).

## nginx (기존 설정은 덮어쓰지 말고 server 블록 안에 추가만)
```
location /admin/ {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header X-Forwarded-For $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
    client_max_body_size 300m;
}
```
