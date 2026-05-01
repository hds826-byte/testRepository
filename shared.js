/* ════════════════════════════════════════
   shared.js — 공용 모듈
   data · auth · sidebar · toast
════════════════════════════════════════ */
"use strict";

/* ── 해시 (서버사이드 교체용) ── */
function _hp(pw){let h=0;for(let i=0;i<pw.length;i++)h=(Math.imul(31,h)+pw.charCodeAt(i))|0;return'H'+Math.abs(h).toString(36)+pw.length;}

/* ── DB ── */
const DB={
  _g(k){try{return JSON.parse(localStorage.getItem(k)||'null')}catch{return null}},
  _s(k,v){localStorage.setItem(k,JSON.stringify(v))},
  /* users */
  users(){return this._g('ins_users')||[]},
  saveUsers(u){this._s('ins_users',u)},
  findUser(id){return this.users().find(u=>u.id===id)},
  addUser(u){const a=this.users();a.push(u);this.saveUsers(a)},
  approveUser(id){const a=this.users();const u=a.find(x=>x.id===id);if(u){u.status='active';this.saveUsers(a);}return u},
  removeUser(id){this.saveUsers(this.users().filter(u=>u.id!==id))},
  /* session */
  session(){return this._g('ins_sess')},
  setSession(u){this._s('ins_sess',{id:u.id,name:u.name,isAdmin:!!u.isAdmin,dept:u.dept})},
  clearSession(){localStorage.removeItem('ins_sess')},
  /* posts */
  posts(){return this._g('ins_posts')||[]},
  savePosts(p){this._s('ins_posts',p)},
  addPost(p){const a=this.posts();const np={...p,id:Date.now(),likes:0,likedBy:[],views:0,createdAt:new Date().toISOString()};a.unshift(np);this.savePosts(a);return np},
  likePost(id,uid){const a=this.posts();const p=a.find(x=>x.id===id);if(!p)return null;const i=p.likedBy.indexOf(uid);if(i===-1){p.likedBy.push(uid);p.likes++;}else{p.likedBy.splice(i,1);p.likes--;}this.savePosts(a);return p},
  /* news cache */
  newsCache(){return this._g('ins_news')},
  setNews(d){this._s('ins_news',{data:d,ts:Date.now()})},
  /* hash */
  hash:_hp
};

/* ── Seed admin ── */
(function(){
  if(!DB.findUser('admin')){
    DB.addUser({id:'admin',name:'관리자',dept:'정보화팀',role:'과장',email:'admin@insadong.kr',
      pw:DB.hash('a1234567!'),status:'active',isAdmin:true,joinedAt:new Date().toISOString()});
  }
})();

/* ── Toast ── */
function toast(msg,type='ok'){
  const t=document.getElementById('toast');
  if(!t)return;
  t.textContent=msg;t.className=`toast show ${type}`;
  clearTimeout(t._tid);t._tid=setTimeout(()=>t.className='toast',2800);
}

/* ── Modal ── */
function openModal(id){document.getElementById(id)?.classList.add('open')}
function closeModal(id){document.getElementById(id)?.classList.remove('open')}
function closeOuter(e,id){if(e.target.id===id)closeModal(id)}
function swapModal(a,b){closeModal(a);openModal(b)}

/* ── HTML escape ── */
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
function fmtDate(iso){const d=new Date(iso);return`${d.getFullYear()}.${d.getMonth()+1}.${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`}
function fmtSize(b){if(b<1024)return b+'B';if(b<1048576)return(b/1024).toFixed(1)+'KB';return(b/1048576).toFixed(1)+'MB'}

/* ── Auth actions ── */
function doLogin(){
  const id=document.getElementById('loginId')?.value.trim();
  const pw=document.getElementById('loginPw')?.value;
  const err=document.getElementById('loginErr');
  if(!id||!pw){if(err)err.textContent='아이디와 비밀번호를 입력해 주세요.';return}
  const u=DB.findUser(id);
  if(!u){if(err)err.textContent='존재하지 않는 계정입니다.';return}
  if(u.pw!==DB.hash(pw)){if(err)err.textContent='비밀번호가 올바르지 않습니다.';return}
  if(u.status==='pending'){if(err)err.textContent='관리자 승인 대기 중입니다.';return}
  DB.setSession(u);closeModal('loginModal');if(err)err.textContent='';
  renderSbAuth();toast(`${u.name}님, 환영합니다!`);
  if(typeof afterLogin==='function')afterLogin();
}
function doLogout(){DB.clearSession();renderSbAuth();toast('로그아웃 됐습니다.');if(typeof afterLogout==='function')afterLogout();}

/* ── Sidebar auth render ── */
function renderSbAuth(){
  const el=document.getElementById('sbAuth');if(!el)return;
  const s=DB.session();
  if(s){
    el.innerHTML=`<div class="sb-user"><strong>${esc(s.name)}</strong>${esc(s.dept||'')}</div>
    ${s.isAdmin?`<button class="sb-admin-btn" onclick="openAdminPanel()">⚙ 관리자 패널</button>`:''}
    <button class="btn btn-outline btn-sm btn-full" onclick="doLogout()">로그아웃</button>`;
  } else {
    el.innerHTML=`<a href="pages/register.html" class="btn btn-accent btn-full btn-sm">회원가입</a>
    <button class="btn btn-outline btn-sm btn-full" onclick="openModal('loginModal')">로그인</button>`;
  }
}

/* ── Admin panel ── */
function openAdminPanel(){
  renderAdminPending();renderAdminMembers();openModal('adminModal');
}
function switchAdmTab(tab,btn){
  document.querySelectorAll('.adm-tab').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  ['adminPending','adminMembers'].forEach(id=>{
    document.getElementById(id).style.display=id.includes(tab)?'flex':'none';
  });
}
function renderAdminPending(){
  const el=document.getElementById('adminPending');if(!el)return;
  const list=DB.users().filter(u=>u.status==='pending');
  el.innerHTML=list.length?list.map(u=>`<div class="adm-row">
    <div class="adm-info"><b>${esc(u.name)}</b> <span class="pill pill-amber">대기중</span><br><small>${esc(u.id)} · ${esc(u.dept)} · ${esc(u.role)} · ${esc(u.email)}</small></div>
    <div class="adm-acts"><button class="btn btn-success btn-sm" onclick="admApprove('${u.id}')">승인</button><button class="btn btn-danger btn-sm" onclick="admReject('${u.id}')">거부</button></div>
  </div>`).join(''):'<p style="color:var(--muted);font-size:13px">대기 중인 회원이 없습니다.</p>';
}
function renderAdminMembers(){
  const el=document.getElementById('adminMembers');if(!el)return;
  const list=DB.users().filter(u=>u.status==='active'&&!u.isAdmin);
  el.innerHTML=list.length?list.map(u=>`<div class="adm-row">
    <div class="adm-info"><b>${esc(u.name)}</b> <span class="pill pill-green">활성</span><br><small>${esc(u.id)} · ${esc(u.dept)} · ${esc(u.role)}</small></div>
    <div class="adm-acts"><button class="btn btn-danger btn-sm" onclick="admReject('${u.id}')">삭제</button></div>
  </div>`).join(''):'<p style="color:var(--muted);font-size:13px">등록된 회원이 없습니다.</p>';
}
function admApprove(id){DB.approveUser(id);renderAdminPending();renderAdminMembers();toast('승인 완료됐습니다.')}
function admReject(id){if(!confirm('삭제/거부 하시겠습니까?'))return;DB.removeUser(id);renderAdminPending();renderAdminMembers();toast('처리 완료됐습니다.','err')}

/* ── Sidebar toggle (mobile) ── */
function toggleSb(){
  const sb=document.getElementById('sidebar'),ov=document.getElementById('mobOvl');
  sb?.classList.toggle('open');ov?.classList.toggle('open');
}

/* ── Enter key login ── */
document.addEventListener('DOMContentLoaded',()=>{
  ['loginId','loginPw'].forEach(id=>{document.getElementById(id)?.addEventListener('keydown',e=>{if(e.key==='Enter')doLogin()})});
  renderSbAuth();
  /* set active nav link */
  const page=location.pathname.split('/').pop()||'index.html';
  document.querySelectorAll('.sb-link').forEach(a=>{
    if(a.getAttribute('href')&&a.getAttribute('href').includes(page))a.classList.add('active');
  });
});
