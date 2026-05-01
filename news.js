/* ══════════════════════════════════════════════════════════
   news.js — AI 뉴스 모듈
   매일 오전 7시 갱신 · Claude API로 핵심 뉴스 선별 요약
   실제 배포: 백엔드 크롤러 + /api/news 엔드포인트로 교체
══════════════════════════════════════════════════════════ */
"use strict";

/* 오전 7시 갱신 여부 확인 */
function _isFreshToday(){
  const cache = DB.getNewsCache();
  if(!cache) return false;
  const ts   = new Date(cache.ts);
  const now  = new Date();
  // 오늘 오전 7시 이후 캐시가 있으면 신선
  const todayAt7 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 7, 0, 0);
  return ts >= todayAt7 && ts.toDateString() === now.toDateString();
}

/* 데모 뉴스 데이터 (실제 배포 시 백엔드 크롤러로 교체) */
const DEMO_NEWS = [
  {
    id:1, featured:true,
    cat:'생성형 AI',
    title:'GPT-5 공개 — 공공기관 업무 적용 사례 급증',
    summary:'OpenAI가 GPT-5를 발표하며 공공기관 행정 자동화·민원 응대 서비스에 도입 사례가 빠르게 늘고 있습니다. 행안부는 올 하반기 시범 도입 기관을 선정할 계획입니다.',
    source:'전자신문', time:'오전 07:02'
  },
  {
    id:2,
    cat:'공공 디지털',
    title:'행안부, AI 기반 민원 자동분류 서비스 전국 확대',
    summary:'지자체 민원 콜센터에 생성형 AI를 적용해 분류 정확도 94% 달성. 상담사 업무 부담 40% 감소 효과를 확인하고 전국 확대에 나선다.',
    source:'공감코리아', time:'오전 07:15'
  },
  {
    id:3,
    cat:'사회서비스',
    title:'복지부, 사회서비스 바우처 부정수급 AI 탐지 결과 발표',
    summary:'AI 이상징후 탐지 시스템 도입 1년 만에 부정수급 의심 건 12,000건 적발. 연간 절감 효과 350억 원으로 추정.',
    source:'보건복지부', time:'오전 07:30'
  },
  {
    id:4,
    cat:'AI 도구',
    title:'Claude 3.7 — 긴 문서 처리 능력 대폭 향상',
    summary:'Anthropic의 Claude 3.7이 200K 컨텍스트 윈도우를 지원하며 법령·보고서 전문 분석에 강점을 보입니다. 국내 공공 IT 담당자들의 관심이 높아지고 있습니다.',
    source:'AI 타임스', time:'오전 08:00'
  },
  {
    id:5,
    cat:'공모전',
    title:'과기부, "공공 AI 서비스 아이디어 공모전" 5월 개최',
    summary:'과학기술정보통신부가 주관하는 공공 AI 활용 아이디어 공모전이 이달 접수를 시작합니다. 최우수상 상금 1,000만 원.',
    source:'과학기술정보통신부', time:'오전 08:30'
  },
  {
    id:6,
    cat:'AI 트렌드',
    title:'국내 생성형 AI 도입 기업 2년 새 3배 증가',
    summary:'NIA 조사에 따르면 국내 공공기관 및 기업의 생성형 AI 도입률이 2024년 12%에서 2026년 37%로 급증했습니다.',
    source:'NIA 한국지능정보사회진흥원', time:'오전 09:00'
  },
];

async function loadNews(){
  const el    = document.getElementById('newsList');
  const tsEl  = document.getElementById('newsUpdateTime');
  if(!el) return;

  /* 캐시 확인 */
  if(_isFreshToday()){
    const cache = DB.getNewsCache();
    renderNews(cache.data);
    tsEl.textContent = '오늘 오전 7:00 업데이트';
    return;
  }

  el.innerHTML = '<div class="loading-box">AI 뉴스를 선별하는 중...</div>';

  /* ── 실제 배포 시: 백엔드 /api/news 엔드포인트에서 크롤링 결과 수신
     const res  = await fetch('/api/news');
     const news = await res.json();
     ─────────────────────────────────────────────────────────────── */

  /* Claude API를 활용한 뉴스 선별·요약 (데모) */
  let finalNews;
  try {
    finalNews = await _curateWithClaude(DEMO_NEWS);
  } catch {
    finalNews = DEMO_NEWS; // fallback
  }

  DB.setNewsCache(finalNews);
  renderNews(finalNews);

  const now = new Date();
  tsEl.textContent = `오늘 ${now.getHours()}:${String(now.getMinutes()).padStart(2,'0')} 업데이트`;
}

/* Claude API로 뉴스 선별·요약 */
async function _curateWithClaude(rawNews){
  const prompt = `당신은 AI·공공기관·사회서비스 분야 전문 에디터입니다.
아래 뉴스 목록에서 공공기관 IT 담당자와 AI 학습동아리 회원들이 꼭 알아야 할 뉴스를 선별하고,
각 뉴스의 summary를 2~3문장으로 더 명확하게 다듬어 주세요.
JSON 배열 형식으로만 응답하세요. 마크다운 없이 순수 JSON만.

뉴스 목록:
${JSON.stringify(rawNews, null, 2)}`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if(!res.ok) throw new Error('Claude API error');
  const data = await res.json();
  const text = (data.content || []).map(c => c.text || '').join('');
  const clean = text.replace(/```json|```/g,'').trim();
  return JSON.parse(clean);
}

function renderNews(newsList){
  const el = document.getElementById('newsList');
  if(!el) return;
  if(!newsList || !newsList.length){
    el.innerHTML = '<div class="loading-box">뉴스를 불러올 수 없습니다.</div>';
    return;
  }
  el.innerHTML = newsList.map((n,i) => `
    <div class="news-card ${n.featured?'featured':''}" onclick="openNewsLink(${n.id})">
      <span class="nc-cat">${_esc(n.cat)}</span>
      <div class="nc-title">${_esc(n.title)}</div>
      ${n.featured ? `<div class="nc-summary">${_esc(n.summary)}</div>` : ''}
      <div class="nc-footer">
        <span class="nc-source">${_esc(n.source)}</span>
        <span class="nc-time">${_esc(n.time)}</span>
      </div>
    </div>`).join('');
}

function openNewsLink(id){ showToast('실제 배포 시 기사 원문으로 연결됩니다.'); }

function _esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
