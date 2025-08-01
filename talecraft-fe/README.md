# TaleCraft Frontend

TaleCraft 프로젝트의 프론트엔드 애플리케이션입니다.

## 기능

- 로그인 페이지 (`/auth/login`)
- 회원가입 페이지 (`/auth/signup`)
- 아이디/비밀번호 찾기 페이지 (`/auth/find-account`)

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 애플리케이션을 확인하세요.

## 페이지 구조

- `/` - 메인 페이지 (로그인/회원가입 버튼 포함)
- `/auth/login` - 로그인 페이지
- `/auth/signup` - 회원가입 페이지
- `/auth/find-account` - 아이디/비밀번호 찾기 페이지

## 기술 스택

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS

## 백엔드 연동

이 프론트엔드는 TaleCraft 백엔드 API와 연동됩니다. 백엔드 서버가 실행 중이어야 정상적으로 작동합니다.

### API 엔드포인트

- `POST /api/auth/login` - 로그인
- `POST /api/auth/signup` - 회원가입

## 빌드

프로덕션 빌드를 위해:

```bash
npm run build
npm start
```
