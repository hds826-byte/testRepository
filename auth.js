/* ══════════════════════════════
   auth.js — 인증 모듈
══════════════════════════════ */
"use strict";

/* ── 모달 유틸 ── */
function openModal(id){ document.getElementById(id).classList.add('open'); }
function closeModal(id){ document.getElementById(id).classList.remove('open'); }
function switchModal(from, to){ closeModal(from); openModal(to); }
function closeModalOutside(e, id){ if(e.target.id === id) closeModal(id); }

/* ── 토스트 ── */
function showToast(msg, type='success'){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast show ${type}`;
  setTimeout(() => t.className = 'toast', 2800);
}

/* ── 로그인 ── */
function doLogin(){
  const id = document.getElementById('loginId').value.trim();
  const pw = document.getElementById('loginPw').value;
  const err = document.getElementById('loginErr');

  if(!id || !pw){ err.textContent = '아이디와 비밀번호를 입력해 주세요.'; return; }

  const user = DB.findUser(id);
  if(!user){ err.textContent = '존재하지 않는 계정입니다.'; return; }
  if(user.pw !== DB.hashPw(pw)){ err.textContent = '비밀번호가 올바르지 않습니다.'; return; }
  if(user.status === 'pending'){ err.textContent = '관리자 승인 대기 중입니다.'; return; }

  DB.setSession(user);
  closeModal('loginModal');
  err.textContent = '';
  renderAuthArea();
  showToast(`${user.name}님, 환영합니다!`);
  renderPosts();
}

/* ── 로그아웃 ── */
function doLogout(){
  DB.clearSession();
  renderAuthArea();
  renderPosts();
  showToast('로그아웃 되었습니다.', 'success');
}

/* ── 회원가입 ── */
function doRegister(){
  const id    = document.getElementById('regId').value.trim();
  const name  = document.getElementById('regName').value.trim();
  const dept  = document.getElementById('regDept').value.trim();
  const role  = document.getElementById('regRole').value;
  const email = document.getElementById('regEmail').value.trim();
  const pw    = document.getElementById('regPw').value;
  const pw2   = document.getElementById('regPw2').value;
  const err   = document.getElementById('regErr');

  if(!id || !name || !dept || !role || !email || !pw){ err.textContent = '모든 항목을 입력해 주세요.'; return; }
  if(!/^[a-z0-9]{4,20}$/.test(id)){ err.textContent = '아이디는 영문 소문자·숫자 4~20자입니다.'; return; }
  if(pw.length < 8){ err.textContent = '비밀번호는 8자 이상이어야 합니다.'; return; }
  if(pw !== pw2){ err.textContent = '비밀번호가 일치하지 않습니다.'; return; }
  if(DB.findUser(id)){ err.textContent = '이미 사용 중인 아이디입니다.'; return; }

  DB.addUser({ id, name, dept, role, email, pw: DB.hashPw(pw), status: 'pending', isAdmin: false, joinedAt: new Date().toISOString() });
  err.textContent = '';
  closeModal('registerModal');
  showToast('가입 신청이 완료됐습니다. 관리자 승인 후 이용 가능합니다.');
  ['regId','regName','regDept','regEmail','regPw','regPw2'].forEach(i => document.getElementById(i).value = '');
  document.getElementById('regRole').value = '';
}

/* ── 사이드바 유저 영역 렌더링 ── */
function renderAuthArea(){
  const session = DB.getSession();
  const el = document.getElementById('sbUserArea');
  if(session){
    el.innerHTML = `
      <div class="sb-user-info"><strong>${session.name}</strong>${session.dept}</div>
      ${session.isAdmin ? `<button id="sbAdminBtn" onclick="openAdminPanel()">⚙ 관리자 패널</button>` : ''}
      <button class="sb-auth-btn outline" onclick="doLogout()">로그아웃</button>`;
  } else {
    el.innerHTML = `
      <button class="sb-auth-btn" onclick="openModal('loginModal')">로그인</button>
      <button class="sb-auth-btn outline" onclick="openModal('registerModal')">회원가입</button>`;
  }
  // 글쓰기 폼 노출 제어
  const writeForm = document.getElementById('writeForm');
  const loginReq  = document.getElementById('loginRequired');
  if(writeForm && loginReq){
    writeForm.style.display = session ? 'block' : 'none';
    loginReq.style.display  = session ? 'none' : 'flex';
  }
}

/* ── 관리자 패널 ── */
function openAdminPanel(){
  renderAdminPending();
  renderAdminMembers();
  openModal('adminModal');
}

function switchAdminTab(tab, btn){
  document.querySelectorAll('.adm-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('adminPending').style.display = tab === 'pending' ? 'flex' : 'none';
  document.getElementById('adminMembers').style.display = tab === 'members' ? 'flex' : 'none';
}

function renderAdminPending(){
  const el = document.getElementById('adminPending');
  const pending = DB.getUsers().filter(u => u.status === 'pending');
  if(!pending.length){ el.innerHTML = '<div style="color:var(--muted);font-size:13px;padding:12px 0">승인 대기 중인 회원이 없습니다.</div>'; return; }
  el.innerHTML = pending.map(u => `
    <div class="adm-user-row">
      <div class="adm-user-info">
        <div class="adm-user-name">${_esc(u.name)} <span class="adm-status status-pending">대기중</span></div>
        <div class="adm-user-meta">${_esc(u.id)} · ${_esc(u.dept)} · ${_esc(u.role)} · ${_esc(u.email)}</div>
      </div>
      <div class="adm-actions">
        <button class="btn-success" onclick="approveUser('${u.id}')">승인</button>
        <button class="btn-danger"  onclick="rejectUser('${u.id}')">거부</button>
      </div>
    </div>`).join('');
}

function renderAdminMembers(){
  const el = document.getElementById('adminMembers');
  const members = DB.getUsers().filter(u => u.status === 'active' && !u.isAdmin);
  if(!members.length){ el.innerHTML = '<div style="color:var(--muted);font-size:13px;padding:12px 0">등록된 회원이 없습니다.</div>'; return; }
  el.innerHTML = members.map(u => `
    <div class="adm-user-row">
      <div class="adm-user-info">
        <div class="adm-user-name">${_esc(u.name)} <span class="adm-status status-active">활성</span></div>
        <div class="adm-user-meta">${_esc(u.id)} · ${_esc(u.dept)} · ${_esc(u.role)}</div>
      </div>
      <div class="adm-actions">
        <button class="btn-danger" onclick="rejectUser('${u.id}')">삭제</button>
      </div>
    </div>`).join('');
}

function approveUser(id){
  DB.approveUser(id);
  renderAdminPending();
  renderAdminMembers();
  showToast('회원 승인이 완료됐습니다.');
}
function rejectUser(id){
  if(!confirm('정말 삭제/거부 하시겠습니까?')) return;
  DB.rejectUser(id);
  renderAdminPending();
  renderAdminMembers();
  showToast('처리 완료됐습니다.', 'error');
}

function _esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
