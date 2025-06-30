# 상속세 계산기

한국의 상속세 계산을 위한 웹 애플리케이션입니다.

## 기능

- 상속재산 입력 및 계산
- 상속세 자동 계산
- 전문가 상담 신청 (Google Sheets 연동)
- 반응형 디자인

## 설치 및 실행

1. 의존성 설치:
\`\`\`bash
npm install
# 또는
pnpm install
\`\`\`

2. 환경변수 설정:
`.env.local` 파일을 생성하고 Google Apps Script URL을 설정하세요.

3. 개발 서버 실행:
\`\`\`bash
npm run dev
# 또는
pnpm dev
\`\`\`

4. 브라우저에서 `http://localhost:3000` 접속

## Google Sheets 연동 설정

1. Google Apps Script에서 새 프로젝트 생성
2. `scripts/google-apps-script-final.js` 코드 복사
3. 스프레드시트 ID 설정
4. 웹 앱으로 배포
5. `.env.local`에 웹 앱 URL 설정

## 기술 스택

- Next.js 15
- TypeScript
- Tailwind CSS
- shadcn/ui
- Google Apps Script
- Google Sheets
