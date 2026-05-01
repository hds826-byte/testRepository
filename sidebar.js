/* ════════════════════════════════
   sidebar.js — 공용 사이드바 렌더
════════════════════════════════ */
"use strict";

(function injectSidebar(){
  const isRoot = !location.pathname.includes('/pages/');
  const root   = isRoot ? '' : '../';

  const html = `
  <aside class="sidebar" id="sidebar">
    <div class="sb-logo">
      <a href="${root}index.html" class="sb-badge">IN</a>
      <div>
        <div class="sb-title">인사동</div>
        <div class="sb-sub">AI 학습동아리</div>
      </div>
    </div>
    <nav class="sb-nav">
      <a href="${root}index.html"             class="sb-link" data-p="index.html">     <span class="sb-ico">◈</span> 홈</a>
      <a href="${root}pages/schedule.html"    class="sb-link" data-p="schedule.html">  <span class="sb-ico">◷</span> 운영 일정</a>
      <a href="${root}pages/board.html"       class="sb-link" data-p="board.html">     <span class="sb-ico">◧</span> 게시판</a>
      <a href="${root}pages/news.html"        class="sb-link" data-p="news.html">      <span class="sb-ico">◐</span> AI 뉴스</a>
      <a href="${root}pages/contest.html"     class="sb-link" data-p="contest.html">   <span class="sb-ico">◆</span> 공모전</a>
      <a href="${root}pages/register.html"    class="sb-link" data-p="register.html">  <span class="sb-ico">◉</span> 회원가입</a>
    </nav>
    <div class="sb-bot" id="sbAuth">
      <!-- filled by shared.js renderSbAuth() -->
    </div>
  </aside>

  <!-- Mobile header -->
  <header class="mob-hd">
    <button class="hamburger" onclick="toggleSb()">☰</button>
    <span class="mob-title">인사동 AI동아리</span>
    <button class="btn btn-accent btn-sm" onclick="openModal('loginModal')">로그인</button>
  </header>
  <div class="mob-ovl" id="mobOvl" onclick="toggleSb()"></div>

  <!-- Login Modal -->
  <div id="loginModal" class="modal-ov" onclick="closeOuter(event,'loginModal')">
    <div class="modal-box">
      <div class="modal-hd"><h3>로그인</h3><button class="modal-close" onclick="closeModal('loginModal')">✕</button></div>
      <div class="modal-body">
        <input id="loginId" class="inp" placeholder="아이디"/>
        <input id="loginPw" class="inp" type="password" placeholder="비밀번호"/>
        <div id="loginErr" class="form-err"></div>
        <button class="btn btn-primary btn-full" onclick="doLogin()">로그인</button>
        <p class="modal-ft">계정이 없으신가요? <a href="${root}pages/register.html">회원가입</a></p>
      </div>
    </div>
  </div>

  <!-- Admin Modal -->
  <div id="adminModal" class="modal-ov" onclick="closeOuter(event,'adminModal')">
    <div class="modal-box wide">
      <div class="modal-hd"><h3>⚙ 관리자 패널</h3><button class="modal-close" onclick="closeModal('adminModal')">✕</button></div>
      <div class="modal-body">
        <div class="adm-tabs">
          <button class="adm-tab active" onclick="switchAdmTab('Pending',this)">가입 승인 대기</button>
          <button class="adm-tab" onclick="switchAdmTab('Members',this)">회원 관리</button>
        </div>
        <div id="adminPending" class="adm-list" style="display:flex;flex-direction:column;gap:8px"></div>
        <div id="adminMembers" class="adm-list" style="display:none;flex-direction:column;gap:8px"></div>
      </div>
    </div>
  </div>

  <div id="toast" class="toast"></div>`;

  document.body.insertAdjacentHTML('afterbegin', html);

  /* active link */
  const cur = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.sb-link[data-p]').forEach(a => {
    if(a.dataset.p === cur) a.classList.add('active');
  });
})();
