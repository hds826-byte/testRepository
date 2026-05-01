/* ══════════════════════════════════════════════════════════
   contest.js — 공모전 모듈
   하이브레인넷 연동 (실제 배포: 백엔드 크롤러 → /api/contests)
══════════════════════════════════════════════════════════ */
"use strict";

let _allContests   = [];
let _contestFilter = 'all';

/* D-Day 계산 */
function _dday(dateStr){
  const diff = Math.ceil((new Date(dateStr) - new Date()) / 86400000);
  if(diff < 0)  return { text:'마감', cls:'dday-ok', val:diff };
  if(diff === 0) return { text:'D-DAY', cls:'dday-urgent', val:0 };
  if(diff <= 7)  return { text:`D-${diff}`, cls:'dday-urgent', val:diff };
  if(diff <= 14) return { text:`D-${diff}`, cls:'dday-soon', val:diff };
  return { text:`D-${diff}`, cls:'dday-ok', val:diff };
}

/* 하이브레인넷 공모전 데이터 (실제 배포 시 크롤러로 교체) */
const DEMO_CONTESTS = [
  { id:1, type:'ai',     title:'2026 공공 AI 서비스 아이디어 공모전',      host:'과학기술정보통신부',   deadline:'2026-06-30', url:'https://www.hirebrainet.com/contest/list.do' },
  { id:2, type:'gov',    title:'디지털정부 혁신 아이디어 공모전',           host:'행정안전부',           deadline:'2026-07-15', url:'https://www.hirebrainet.com/contest/list.do' },
  { id:3, type:'social', title:'사회서비스 혁신 우수사례 공모전',           host:'보건복지부',           deadline:'2026-07-31', url:'https://www.hirebrainet.com/contest/list.do' },
  { id:4, type:'ai',     title:'국가 AI 데이터 활용 경진대회',             host:'NIA 한국지능정보사회진흥원', deadline:'2026-08-22', url:'https://www.hirebrainet.com/contest/list.do' },
  { id:5, type:'gov',    title:'전자정부 서비스 개선 아이디어 공모',         host:'행정안전부',           deadline:'2026-09-05', url:'https://www.hirebrainet.com/contest/list.do' },
  { id:6, type:'ai',     title:'생성형 AI 활용 업무혁신 사례 공모전',       host:'KISA 한국인터넷진흥원', deadline:'2026-09-20', url:'https://www.hirebrainet.com/contest/list.do' },
  { id:7, type:'social', title:'복지 현장 디지털 전환 아이디어 공모',       host:'한국사회보장정보원',   deadline:'2026-10-10', url:'https://www.hirebrainet.com/contest/list.do' },
  { id:8, type:'ai',     title:'AI 기반 공공서비스 챗봇 개발 경진대회',    host:'정보통신산업진흥원',   deadline:'2026-10-31', url:'https://www.hirebrainet.com/contest/list.do' },
];

const TYPE_LABELS = { ai:'AI·데이터', gov:'공공·행정', social:'사회서비스' };
const TYPE_BADGE  = { ai:'badge-ai',  gov:'badge-gov', social:'badge-social' };

async function loadContests(){
  const el = document.getElementById('contestList');
  if(!el) return;
  el.innerHTML = '<div class="loading-box">공모전 정보를 불러오는 중...</div>';

  /* ── 실제 배포 시:
     const res  = await fetch('/api/contests');
     _allContests = await res.json();
     ────────────────────────────────── */
  await new Promise(r => setTimeout(r, 600)); // simulate network
  _allContests = DEMO_CONTESTS;
  renderContests();
}

function filterContest(type, btn){
  _contestFilter = type;
  document.querySelectorAll('.c-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderContests();
}

function renderContests(){
  const el = document.getElementById('contestList');
  if(!el) return;

  let list = _allContests;
  if(_contestFilter !== 'all') list = list.filter(c => c.type === _contestFilter);

  // D-Day 기준 정렬 (가까운 마감 먼저)
  list = list.slice().sort((a,b) => new Date(a.deadline) - new Date(b.deadline));

  if(!list.length){ el.innerHTML = '<div class="loading-box">해당 공모전이 없습니다.</div>'; return; }

  el.innerHTML = list.map(c => {
    const dd  = _dday(c.deadline);
    const ded = new Date(c.deadline);
    const dedStr = `${ded.getMonth()+1}/${ded.getDate()} 마감`;
    return `
    <div class="contest-item" onclick="window.open('${c.url}','_blank')">
      <div class="ci-badge ${TYPE_BADGE[c.type]}">${TYPE_LABELS[c.type]}</div>
      <div class="ci-main">
        <div class="ci-title">${_esc(c.title)}</div>
        <div class="ci-meta">${_esc(c.host)} · ${dedStr}</div>
      </div>
      <div class="ci-dday ${dd.cls}">${dd.text}</div>
    </div>`;
  }).join('');
}

function _esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
