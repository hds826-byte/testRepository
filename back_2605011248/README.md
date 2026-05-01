# 인사동 AI 학습동아리 웹페이지

> 인공지능을 활용한 사회서비스 동기화 | 2026년도 임직원 학습동아리

---

## 📁 프로젝트 구조

```
insadong/
├── index.html          ← 메인 페이지 (프론트엔드)
├── css/
│   └── style.css       ← 스타일시트
├── js/
│   └── app.js          ← 프론트엔드 로직 + API 레이어
├── server.js           ← Node.js 백엔드 서버 (향후 분리)
└── README.md
```

---

## 🚀 로컬 실행

### 방법 1 — 정적 파일만 (백엔드 없이)
```bash
# VS Code Live Server, Python 내장 서버 등 사용
python3 -m http.server 8080
# 브라우저에서 http://localhost:8080 접속
```
> 데이터는 브라우저 localStorage에 저장됩니다.

### 방법 2 — 백엔드 포함 실행
```bash
npm install express cors
node server.js
# 브라우저에서 http://localhost:3001 접속
```
`js/app.js`의 `API.baseURL = "/api"` 확인 후 사용.

---

## 🏗️ 프론트엔드 ↔ 백엔드 분리 구조

현재는 localStorage를 사용하지만, `app.js`의 `API` 객체만 수정하면 바로 실제 백엔드와 연결됩니다.

```
프론트엔드 (정적 호스팅)     백엔드 API 서버
  index.html               server.js (Node/Express)
  js/app.js  ←── fetch ─→  GET/POST /api/posts
                            GET/POST /api/poll
                            GET      /api/trends
```

### 백엔드 교체 방법
`js/app.js`에서 각 API 함수의 `// TODO` 주석 해제 후 localhost URL 변경:

```js
const API = {
  baseURL: "https://your-api-server.com/api",  // ← 이것만 변경
  ...
}
```

---

## 🔌 외부 API 연동 예정

| 기관 | API | 용도 |
|------|-----|------|
| 공공데이터포털 | data.go.kr | AI 정책·뉴스 피드 |
| 행정안전부 | 공공 AI 현황 | 트렌드 위젯 |
| NIA | 디지털정책 | 관련 동향 |
| KISA | 사이버보안 AI | 보안 이슈 |

API 키 발급: https://www.data.go.kr

---

## 🎯 학습동아리 목표

- 월 1개 이상 생성형 AI 결과물 개발
- 중앙행정기관 AI 활용 공모전 수상

## 👥 구성원

| 역할 | 이름 | 부서 | 직위 |
|------|------|------|------|
| 리더 | 지현석 | 정보화팀 | 과장 |
| 매니저 | 최효진 | 시설평가부 | 대리 |
| 회원 | 조유리 | 지역협력부 | 대리 |
| 회원 | 유병찬 | 혁신기획부 | 주임 |
| 회원 | 이찬영 | 시설평가부 | 부장 |
