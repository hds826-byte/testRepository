/* ══════════════════════════════════════
   app.js — 앱 초기화 & 내비게이션
══════════════════════════════════════ */
"use strict";

/* ── 사이드바 토글 (모바일) ── */
function toggleSidebar(){
  const sb  = document.getElementById('sidebar');
  const ov  = document.getElementById('sidebarOverlay');
  sb.classList.toggle('open');
  ov.classList.toggle('open');
}

/* ── 활성 섹션 하이라이트 ── */
function initScrollSpy(){
  const sections = document.querySelectorAll('.section[id]');
  const links    = document.querySelectorAll('.sb-link[data-section]');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if(e.isIntersecting){
        const id = e.target.id;
        links.forEach(l => {
          l.classList.toggle('active', l.dataset.section === id);
        });
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(s => observer.observe(s));
}

/* ── 사이드바 링크 클릭 시 모바일 닫기 ── */
function initSidebarLinks(){
  document.querySelectorAll('.sb-link').forEach(link => {
    link.addEventListener('click', () => {
      if(window.innerWidth <= 768){
        document.getElementById('sidebar').classList.remove('open');
        const ov = document.getElementById('sidebarOverlay');
        if(ov) ov.classList.remove('open');
      }
    });
  });
}

/* ── 오전 7시 뉴스 자동 로드 체크 ── */
function initNewsAutoLoad(){
  const now = new Date();
  const isAfter7 = now.getHours() >= 7;
  if(isAfter7 && !DB.getNewsCache()){
    loadNews();
  } else {
    loadNews(); // 데모 환경에서는 항상 로드
  }
}

/* ── 초기화 ── */
document.addEventListener('DOMContentLoaded', () => {
  /* 사이드바 오버레이 동적 생성 */
  const ov = document.createElement('div');
  ov.id = 'sidebarOverlay';
  ov.className = 'sidebar-overlay';
  ov.onclick = toggleSidebar;
  document.body.appendChild(ov);

  /* 각 모듈 초기화 */
  renderAuthArea();
  renderSchedule();
  renderPosts();
  loadContests();
  initNewsAutoLoad();
  initScrollSpy();
  initSidebarLinks();

  /* 엔터키 로그인 */
  ['loginId','loginPw'].forEach(id => {
    const el = document.getElementById(id);
    if(el) el.addEventListener('keydown', e => { if(e.key === 'Enter') doLogin(); });
  });

  /* 해시 앵커 처리 */
  if(location.hash){
    const target = document.querySelector(location.hash);
    if(target) setTimeout(() => target.scrollIntoView({behavior:'smooth'}), 300);
  }
});
