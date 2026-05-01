/* =============================================
   인사동 AI 학습동아리 | app.js
   Architecture: 로컬 SPA (향후 REST API 분리 예정)
   ============================================= */

"use strict";

/* ─── 학습동아리 5월-12월 격주 일정 생성기 by gemini(260501)─── */
const generateSchedule = () => {
  const schedule = [];
  const startDate = new Date("2026-05-07"); // 5월 첫 모임 시작일
  const topics = [
    "생성형 AI의 이해와 프롬프트 엔지니어링 기초",
    "Claude 3.5와 ChatGPT 비교 분석 및 실습",
    "AI를 활용한 문서 작성 및 데이터 요약 기술",
    "이미지 생성 AI (Midjourney, DALL-E) 활용법",
    "AI 기반 업무 자동화 입문 (Zapier, Make)",
    "나만의 맞춤형 GPTs 제작 실습",
    "AI 윤리와 저작권 이슈 토론",
    "중간 프로젝트 결과물 공유 및 피드백",
    "공공데이터와 AI 결합 분석 전략",
    "AI를 활용한 프레젠테이션 및 보고서 제작",
    "LLM 파인튜닝과 RAG 기술의 이해",
    "멀티모달 AI 활용 영상 제작 실습",
    "공모전 아이디어 빌딩 및 팀 구성",
    "공모전 출품작 집중 개발 세션 1",
    "공모전 출품작 고도화 및 최종 점검",
    "연간 활동 성과 공유 및 우수회원 시상"
  ];

  for (let i = 0; i < 16; i++) {
    const meetingDate = new Date(startDate);
    meetingDate.setDate(startDate.getDate() + (i * 14)); // 14일(2주) 간격
    schedule.push({
      round: i + 1,
      date: meetingDate.toISOString().split('T')[0],
      topic: topics[i],
      detail: "격주 정기 모임 및 실습 세션"
    });
  }
  return schedule;
};

/* 일정 렌더링 함수 by gemini(260501) */
function renderSchedule() {
  const scheduleData = generateSchedule();
  const container = document.getElementById("scheduleBody");
  if(!container) return;
  
  container.innerHTML = scheduleData.map(s => `
    <tr>
      <td><span class="sch-num">${s.round}회차</span></td>
      <td><span class="sch-date">${s.date}</span></td>
      <td><div class="sch-title">${s.topic}</div></td>
      <td><div class="sch-sub">${s.detail}</div></td>
      <td><span class="sch-badge">확정</span></td>
    </tr>
  `).join("");
}

/* 초기화 시 호출 by gemini(260501) */
document.addEventListener("DOMContentLoaded", () => {
  renderSchedule();
  // ... 기타 게시판 로드 로직
});

/* ─── 데이터 레이어 (localStorage → 향후 백엔드 API로 교체) ─── */
const DB = {
  KEY_POLL: "insadong_poll_votes",
  KEY_POSTS: "insadong_posts",

  getPollVotes() {
    try { return JSON.parse(localStorage.getItem(this.KEY_POLL) || "[]"); }
    catch { return []; }
  },
  savePollVote(vote) {
    const votes = this.getPollVotes();
    votes.push(vote);
    localStorage.setItem(this.KEY_POLL, JSON.stringify(votes));
  },
  getPosts() {
    try { return JSON.parse(localStorage.getItem(this.KEY_POSTS) || "[]"); }
    catch { return []; }
  },
  savePost(post) {
    const posts = this.getPosts();
    posts.unshift(post);
    localStorage.setItem(this.KEY_POSTS, JSON.stringify(posts));
    return posts;
  },
  likePost(postId) {
    const posts = this.getPosts();
    const p = posts.find(x => x.id === postId);
    if (p) {
      p.likes = (p.likes || 0) + 1;
      localStorage.setItem(this.KEY_POSTS, JSON.stringify(posts));
    }
    return p;
  }
};

/* ─── API 레이어 (향후 fetch('/api/...') 로 교체) ─── */
const API = {
  baseURL: "/api",           // 배포 시 실제 백엔드 URL로 변경

  async createPost(payload) {
    // TODO: return await fetch(`${this.baseURL}/posts`, { method: 'POST', body: JSON.stringify(payload), headers: {'Content-Type':'application/json'} }).then(r => r.json());
    return DB.savePost({ ...payload, id: Date.now(), likes: 0, createdAt: new Date().toISOString() });
  },
  async getPosts() {
    // TODO: return await fetch(`${this.baseURL}/posts`).then(r => r.json());
    return DB.getPosts();
  },
  async likePost(postId) {
    // TODO: return await fetch(`${this.baseURL}/posts/${postId}/like`, { method: 'POST' }).then(r => r.json());
    return DB.likePost(postId);
  },
  async submitPollVote(payload) {
    // TODO: return await fetch(`${this.baseURL}/poll`, { method: 'POST', body: JSON.stringify(payload), headers: {'Content-Type':'application/json'} }).then(r => r.json());
    DB.savePollVote(payload);
    return DB.getPollVotes();
  },
  async getPollResults() {
    // TODO: return await fetch(`${this.baseURL}/poll`).then(r => r.json());
    return DB.getPollVotes();
  },
  /* 외부 공공데이터 API 연동 예시 (data.go.kr) */
  async fetchAITrends() {
    // TODO: 실제 API 키 발급 후 아래 URL 사용
    // const res = await fetch(`https://api.odcloud.kr/api/.../...?serviceKey=YOUR_KEY`);
    // return res.json();

    /* 데모용 목업 데이터 */
    return [
      { title: "행안부, 2026년 공공 AI 서비스 도입 전략 발표", date: "2026-04-25", source: "행정안전부" },
      { title: "과기부, 생성형 AI 사회서비스 적용 가이드라인 공개", date: "2026-04-22", source: "과학기술정보통신부" },
      { title: "NIA, 공공 AI 윤리 검증 프레임워크 업데이트", date: "2026-04-18", source: "NIA 한국지능정보사회진흥원" },
      { title: "사회서비스 전자바우처 AI 기반 부정수급 탐지 시범 적용", date: "2026-04-15", source: "사회서비스원" },
      { title: "ChatGPT·Claude 공공부문 도입 현황 및 사례집 발간", date: "2026-04-10", source: "KISA" },
    ];
  }
};

/* ─── 투표 기능 ─── */
const selectedPoll = { day: null, time: null };

document.querySelectorAll(".poll-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const group = btn.dataset.group;
    document.querySelectorAll(`.poll-btn[data-group="${group}"]`).forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    selectedPoll[group] = btn.dataset.value;
  });
});

async function submitPoll() {
  const name = document.getElementById("pollName").value.trim();
  if (!name) { alert("이름을 입력해 주세요."); return; }
  if (!selectedPoll.day) { alert("선호 요일을 선택해 주세요."); return; }
  if (!selectedPoll.time) { alert("선호 시간대를 선택해 주세요."); return; }

  const vote = { name, day: selectedPoll.day, time: selectedPoll.time, ts: Date.now() };
  const allVotes = await API.submitPollVote(vote);
  renderPollResults(allVotes);
  document.getElementById("pollName").value = "";
}

function renderPollResults(votes) {
  const el = document.getElementById("pollResults");
  el.classList.remove("hidden");

  const days = ["월", "화", "수", "목", "금"];
  const times = ["점심", "오후", "저녁"];
  const timeLabels = { 점심: "점심시간 (12~13시)", 오후: "업무 후 (18~19시)", 저녁: "저녁 (19~20시)" };

  const dayCounts = {};
  const timeCounts = {};
  days.forEach(d => dayCounts[d] = 0);
  times.forEach(t => timeCounts[t] = 0);
  votes.forEach(v => { if (dayCounts[v.day] !== undefined) dayCounts[v.day]++; if (timeCounts[v.time] !== undefined) timeCounts[v.time]++; });

  const maxDay = Math.max(...Object.values(dayCounts), 1);
  const maxTime = Math.max(...Object.values(timeCounts), 1);

  const dayBars = days.map(d => {
    const pct = Math.round((dayCounts[d] / maxDay) * 100);
    return `<div class="poll-result-bar-wrap">
      <div class="poll-result-label"><span>${d}요일</span><span>${dayCounts[d]}표</span></div>
      <div class="poll-result-bar"><div class="poll-result-fill" style="width:${pct}%"></div></div>
    </div>`;
  }).join("");

  const timeBars = times.map(t => {
    const pct = Math.round((timeCounts[t] / maxTime) * 100);
    return `<div class="poll-result-bar-wrap">
      <div class="poll-result-label"><span>${timeLabels[t]}</span><span>${timeCounts[t]}표</span></div>
      <div class="poll-result-bar"><div class="poll-result-fill" style="width:${pct}%"></div></div>
    </div>`;
  }).join("");

  el.innerHTML = `
    <div class="result-title">투표 결과 (총 ${votes.length}표)</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:8px">
      <div><div style="font-size:12px;color:var(--c-muted);margin-bottom:10px;font-weight:500">요일</div>${dayBars}</div>
      <div><div style="font-size:12px;color:var(--c-muted);margin-bottom:10px;font-weight:500">시간대</div>${timeBars}</div>
    </div>`;
}

/* ─── 게시판 기능 ─── */
async function submitPost() {
  const name = document.getElementById("postName").value.trim();
  const content = document.getElementById("postContent").value.trim();
  const category = document.getElementById("postCategory").value;

  if (!name) { alert("작성자를 입력해 주세요."); return; }
  if (!content) { alert("내용을 입력해 주세요."); return; }
  if (content.length < 5) { alert("더 자세한 내용을 작성해 주세요."); return; }

  await API.createPost({ name, content, category });

  document.getElementById("postName").value = "";
  document.getElementById("postContent").value = "";

  const posts = await API.getPosts();
  renderPosts(posts);
}

function renderPosts(posts) {
  const el = document.getElementById("postList");
  if (!posts.length) {
    el.innerHTML = `<div style="text-align:center;padding:40px;color:var(--c-dim);font-size:13px">아직 게시글이 없습니다. 첫 번째로 의견을 남겨보세요!</div>`;
    return;
  }
  el.innerHTML = posts.map(p => {
    const dt = new Date(p.createdAt);
    const timeStr = `${dt.getFullYear()}.${String(dt.getMonth()+1).padStart(2,'0')}.${String(dt.getDate()).padStart(2,'0')} ${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}`;
    return `<div class="post-item" data-id="${p.id}">
      <div class="post-header">
        <div class="post-meta">
          <span class="post-author">${escapeHtml(p.name)}</span>
          <span class="post-cat">${escapeHtml(p.category)}</span>
        </div>
        <div style="display:flex;align-items:center;gap:10px">
          <span class="post-time">${timeStr}</span>
          <button class="post-like ${p.likedByMe ? 'liked' : ''}" onclick="likePost(${p.id}, this)">♥ ${p.likes || 0}</button>
        </div>
      </div>
      <div class="post-body">${escapeHtml(p.content).replace(/\n/g, '<br>')}</div>
    </div>`;
  }).join("");
}

async function likePost(postId, btn) {
  const updated = await API.likePost(postId);
  if (updated) {
    btn.textContent = `♥ ${updated.likes}`;
    btn.classList.add("liked");
  }
}

function escapeHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ─── AI 트렌드 ─── */
async function loadTrends() {
  const el = document.getElementById("trendContent");
  el.innerHTML = `<div style="text-align:center;padding:24px;color:var(--c-muted);font-size:13px">불러오는 중...</div>`;
  try {
    const items = await API.fetchAITrends();
    el.innerHTML = items.map(item => `
      <div class="trend-item">
        <div class="trend-item-title">${escapeHtml(item.title)}</div>
        <div class="trend-item-meta">${escapeHtml(item.source)} · ${escapeHtml(item.date)}</div>
      </div>`).join("");
  } catch {
    el.innerHTML = `<div style="text-align:center;padding:20px;color:var(--c-muted);font-size:13px">데이터를 불러오지 못했습니다.</div>`;
  }
}

/* ─── 초기화 ─── */
(async () => {
  // 게시판 초기 로드
  const posts = await API.getPosts();
  renderPosts(posts);

  // 이전 투표 결과 표시
  const votes = await API.getPollResults();
  if (votes.length > 0) renderPollResults(votes);
})();
