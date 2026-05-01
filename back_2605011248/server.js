/**
 * 인사동 AI 학습동아리 | 백엔드 API 서버 (server.js)
 *
 * ─ 현재: 인메모리 데이터 저장 (재시작 시 초기화)
 * ─ 향후: PostgreSQL / MongoDB 연결로 교체
 * ─ 실행: node server.js  (포트 3001)
 * ─ 프론트엔드: API.baseURL = "http://localhost:3001/api" 로 변경
 *
 * 패키지 설치: npm install express cors
 */

const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(".")); // index.html 서빙

/* ─── 인메모리 DB (향후 ORM/DB로 교체) ─── */
let posts = [];
let pollVotes = [];
let postIdSeq = 1;

/* ─── POSTS API ─── */

// GET /api/posts — 전체 게시글 목록
app.get("/api/posts", (req, res) => {
  res.json(posts.slice().reverse());
});

// POST /api/posts — 게시글 작성
app.post("/api/posts", (req, res) => {
  const { name, content, category } = req.body;
  if (!name || !content || !category) return res.status(400).json({ error: "필수 필드 누락" });
  const post = { id: postIdSeq++, name, content, category, likes: 0, createdAt: new Date().toISOString() };
  posts.push(post);
  res.status(201).json(post);
});

// POST /api/posts/:id/like — 좋아요
app.post("/api/posts/:id/like", (req, res) => {
  const post = posts.find(p => p.id === parseInt(req.params.id));
  if (!post) return res.status(404).json({ error: "게시글 없음" });
  post.likes++;
  res.json(post);
});

/* ─── POLL API ─── */

// GET /api/poll — 투표 결과 조회
app.get("/api/poll", (req, res) => {
  res.json(pollVotes);
});

// POST /api/poll — 투표 제출
app.post("/api/poll", (req, res) => {
  const { name, day, time } = req.body;
  if (!name || !day || !time) return res.status(400).json({ error: "필수 필드 누락" });
  pollVotes.push({ name, day, time, ts: Date.now() });
  res.status(201).json(pollVotes);
});

/* ─── AI 트렌드 API (외부 프록시) ─── */
// GET /api/trends — 공공데이터포털 등 외부 API 프록시
app.get("/api/trends", async (req, res) => {
  try {
    // TODO: 실제 외부 API 연동
    // const DATA_GO_KR_KEY = process.env.DATA_GO_KR_KEY;
    // const response = await fetch(`https://api.odcloud.kr/api/.../v1/...?serviceKey=${DATA_GO_KR_KEY}`);
    // const data = await response.json();
    // res.json(data);

    /* 데모 데이터 */
    res.json([
      { title: "행안부, 2026년 공공 AI 서비스 도입 전략 발표", date: "2026-04-25", source: "행정안전부" },
      { title: "과기부, 생성형 AI 사회서비스 적용 가이드라인 공개", date: "2026-04-22", source: "과학기술정보통신부" },
      { title: "NIA, 공공 AI 윤리 검증 프레임워크 업데이트", date: "2026-04-18", source: "NIA 한국지능정보사회진흥원" },
      { title: "사회서비스 전자바우처 AI 기반 부정수급 탐지 시범 적용", date: "2026-04-15", source: "사회서비스원" },
    ]);
  } catch (err) {
    res.status(500).json({ error: "외부 API 오류" });
  }
});

/* ─── 서버 시작 ─── */
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n인사동 AI 학습동아리 서버 실행 중`);
  console.log(`  로컬:   http://localhost:${PORT}`);
  console.log(`  API:    http://localhost:${PORT}/api/posts`);
  console.log(`          http://localhost:${PORT}/api/poll`);
  console.log(`          http://localhost:${PORT}/api/trends\n`);
});
