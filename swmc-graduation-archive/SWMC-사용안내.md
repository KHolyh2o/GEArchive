# SWMC 졸업전시 아카이브 소스

서원대학교 미디어콘텐츠학부 졸업전시 아카이브의 전체 소스 파일입니다.

## 주요 파일

- `app/page.tsx`: 메인 페이지 구조와 링크
- `app/globals.css`: 전체 디자인, 색상, 반응형 스타일
- `app/archive-data.ts`: 2015–2026 졸업전시 예시 데이터
- `public/assets/swmc-logo.png`: 상단 학부 로고
- `public/catalogues/sample-catalogue.pdf`: 도록 보기 예시 PDF
- `package.json`: 실행 및 빌드 설정

## 로컬 실행

Node.js 22.13 이상이 필요합니다.

```bash
npm install
npm run dev
```

개발 서버가 시작되면 터미널에 표시되는 주소를 브라우저에서 열어 확인할 수 있습니다.

## 실제 자료로 교체하기

- 연도별 전시명과 설명: `app/archive-data.ts`
- 졸전 사이트 주소: `app/page.tsx`의 `graduationSiteUrl`
- 도록 PDF: `public/catalogues/`
- 상단 로고: `public/assets/swmc-logo.png`

현재 2015–2025 기록과 도록 PDF는 아카이브 기능 확인을 위한 예시입니다.
