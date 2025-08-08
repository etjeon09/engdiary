# 📔 영어 일기장 (English Diary App)

AI 선생님과 함께 영어 실력을 향상시키는 스마트 일기장 애플리케이션입니다.

## ✨ 주요 기능

- **📅 달력 기반 일기 관리**: 월별 달력으로 일기 작성 현황을 한눈에 확인
- **😊 감정 상태 선택**: 30가지 다양한 감정을 이모지와 함께 선택
- **🤖 AI 피드백 시스템**: 문장별 상세한 영어 문법 및 표현 피드백
- **📊 학습 통계**: 작성한 일기 수, 단어 수, 문법 오류 등 상세한 통계
- **🌟 학습 정리**: 매일 배운 내용을 정리하여 학습 효과 극대화
- **👥 다중 사용자 지원**: 회원가입/로그인을 통한 개인별 데이터 관리

## 🚀 기술 스택

### Frontend
- **React 18** - 사용자 인터페이스
- **Tailwind CSS** - 스타일링
- **JavaScript ES6+** - 모던 자바스크립트

### Backend
- **Node.js** - 서버 런타임
- **Express.js** - 웹 프레임워크
- **MongoDB** - 데이터베이스
- **Mongoose** - ODM
- **JWT** - 인증
- **bcryptjs** - 비밀번호 해싱

### DevOps
- **Docker** - 컨테이너화
- **Docker Compose** - 멀티 컨테이너 관리
- **Nginx** - 리버스 프록시

## 📦 설치 및 실행

### 1. 개발 환경 설정

```bash
# 저장소 클론
git clone <repository-url>
cd english-diary-app

# 프론트엔드 의존성 설치
npm install

# 백엔드 의존성 설치
cd server
npm install
cd ..
```

### 2. 환경 변수 설정

```bash
# 백엔드 환경 변수 설정
cd server
cp env.example .env
# .env 파일을 편집하여 필요한 설정을 입력
```

### 3. 데이터베이스 설정

MongoDB가 설치되어 있어야 합니다. 또는 Docker를 사용할 수 있습니다:

```bash
# MongoDB Docker 컨테이너 실행
docker run -d --name mongodb -p 27017:27017 mongo:6.0
```

### 4. 애플리케이션 실행

#### 개발 모드
```bash
# 백엔드 서버 실행 (새 터미널)
cd server
npm run dev

# 프론트엔드 실행 (새 터미널)
npm start
```

#### Docker를 사용한 실행
```bash
# 전체 애플리케이션 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f
```

## 🌐 배포

### 1. 프로덕션 빌드

```bash
# 프론트엔드 빌드
npm run build

# 백엔드 빌드
cd server
npm run build
```

### 2. Docker 배포

```bash
# 프로덕션 환경 변수 설정
export NODE_ENV=production
export JWT_SECRET=your-super-secret-jwt-key
export MONGODB_URI=your-mongodb-connection-string

# Docker Compose로 배포
docker-compose -f docker-compose.prod.yml up -d
```

### 3. 클라우드 배포

#### Heroku
```bash
# Heroku CLI 설치 후
heroku create your-app-name
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret
heroku config:set MONGODB_URI=your-mongodb-uri
git push heroku main
```

#### AWS
```bash
# AWS ECS 또는 EC2에 배포
# docker-compose.yml 파일을 사용하여 컨테이너 배포
```

## 📊 API 문서

### 인증 API

#### 회원가입
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "user123",
  "email": "user@example.com",
  "password": "password123",
  "name": "홍길동"
}
```

#### 로그인
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### 일기 API

#### 일기 작성/수정
```
POST /api/diary/entries
Authorization: Bearer <token>
Content-Type: application/json

{
  "date": "2024-01-15",
  "mood": "Happy",
  "entry": "Today was a great day...",
  "learningSummary": "오늘 배운 내용..."
}
```

#### 일기 목록 조회
```
GET /api/diary/entries?year=2024&month=1
Authorization: Bearer <token>
```

## 🔧 개발 가이드

### 프로젝트 구조
```
english-diary-app/
├── src/                    # 프론트엔드 소스
│   ├── components/         # React 컴포넌트
│   ├── services/          # API 서비스
│   └── utils/             # 유틸리티 함수
├── server/                # 백엔드 소스
│   ├── models/            # 데이터베이스 모델
│   ├── routes/            # API 라우터
│   ├── middleware/        # 미들웨어
│   └── utils/             # 유틸리티 함수
├── public/                # 정적 파일
└── docs/                  # 문서
```

### 코드 컨벤션
- **JavaScript**: ES6+ 문법 사용
- **React**: 함수형 컴포넌트와 Hooks 사용
- **CSS**: Tailwind CSS 클래스 사용
- **API**: RESTful API 설계 원칙 준수

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 지원

문제가 있거나 제안사항이 있으시면 이슈를 생성해주세요.

## 🙏 감사의 말

이 프로젝트는 영어 학습을 돕고자 하는 마음으로 만들어졌습니다. 
모든 사용자분들의 영어 실력 향상을 응원합니다! 🚀
