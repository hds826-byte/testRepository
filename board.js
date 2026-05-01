/* ══════════════════════════════════════
   board.js — 게시판 모듈
   파일 첨부 (base64) · 페이지네이션 · 검색
══════════════════════════════════════ */
"use strict";

let _boardFilter = '전체';
let _boardSearch = '';
let _boardPage   = 1;
const PAGE_SIZE  = 8;
let _attachedFiles = []; // { name, size, data(base64) }

/* ── 파일 첨부 ── */
function updateFileList(){
  const input = document.getElementById('postFile');
  const list  = document.getElementById('fileList');
  _attachedFiles = [];

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB per file

  Array.from(input.files).forEach(file => {
    if(file.size > MAX_FILE_SIZE){ showToast(`${file.name}: 5MB 이하 파일만 첨부 가능합니다.`, 'error'); return; }
    const reader = new FileReader();
    reader.onload = e => {
      _attachedFiles.push({ name: file.name, size: file.size, data: e.target.result });
      renderFileChips();
    };
    reader.readAsDataURL(file);
  });
}

function renderFileChips(){
  const list = document.getElementById('fileList');
  if(!list) return;
  list.innerHTML = _attachedFiles.map((f,i) => `
    <span class="file-chip">
      📎 ${_esc(f.name)} <span style="color:var(--dim)">(${_fmtSize(f.size)})</span>
      <button onclick="removeFile(${i})">✕</button>
    </span>`).join('');
}

function removeFile(i){
  _attachedFiles.splice(i, 1);
  renderFileChips();
}

function _fmtSize(bytes){
  if(bytes < 1024) return bytes + 'B';
  if(bytes < 1024*1024) return (bytes/1024).toFixed(1) + 'KB';
  return (bytes/1024/1024).toFixed(1) + 'MB';
}

/* ── 게시글 작성 ── */
function submitPost(){
  const session = DB.getSession();
  if(!session){ showToast('로그인 후 이용해 주세요.', 'error'); return; }

  const cat   = document.getElementById('postCat').value;
  const title = document.getElementById('postTitle').value.trim();
  const body  = document.getElementById('postBody').value.trim();

  if(!title){ showToast('제목을 입력해 주세요.', 'error'); return; }
  if(!body || body.length < 5){ showToast('내용을 5자 이상 입력해 주세요.', 'error'); return; }

  const post = DB.addPost({
    cat, title, body,
    author: session.name,
    authorId: session.id,
    dept: session.dept,
    files: [..._attachedFiles]
  });

  // 초기화
  document.getElementById('postTitle').value = '';
  document.getElementById('postBody').value = '';
  document.getElementById('postFile').value = '';
  _attachedFiles = [];
  renderFileChips();

  _boardFilter = '전체';
  _boardSearch = '';
  _boardPage   = 1;
  renderPosts();
  showToast('게시글이 등록됐습니다!');
}

/* ── 필터 & 검색 ── */
function filterBoard(cat, btn){
  _boardFilter = cat;
  _boardPage   = 1;
  document.querySelectorAll('.bc-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderPosts();
}
function searchBoard(q){
  _boardSearch = q.trim();
  _boardPage   = 1;
  renderPosts();
}

/* ── 게시글 렌더링 ── */
function renderPosts(){
  const session = DB.getSession();
  let posts = DB.getPosts();

  if(_boardFilter !== '전체') posts = posts.filter(p => p.cat === _boardFilter);
  if(_boardSearch) posts = posts.filter(p =>
    p.title.includes(_boardSearch) || p.body.includes(_boardSearch) || p.author.includes(_boardSearch));

  const total = posts.length;
  const start = (_boardPage - 1) * PAGE_SIZE;
  const page  = posts.slice(start, start + PAGE_SIZE);

  const el = document.getElementById('postList');
  if(!el) return;

  if(!page.length){
    el.innerHTML = `<div class="loading-box">게시글이 없습니다.</div>`;
    document.getElementById('boardPaging').innerHTML = '';
    return;
  }

  el.innerHTML = page.map(p => {
    const dt   = new Date(p.createdAt);
    const time = `${dt.getMonth()+1}/${dt.getDate()} ${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}`;
    const liked = session && p.likedBy && p.likedBy.includes(session.id);
    return `
    <div class="post-item" onclick="openPost(${p.id})">
      <div class="pi-header">
        <span class="pi-cat">${_esc(p.cat)}</span>
        <span class="pi-title">${_esc(p.title)}</span>
      </div>
      <div class="pi-preview">${_esc(p.body)}</div>
      <div class="pi-meta">
        <span>${_esc(p.author)} · ${_esc(p.dept||'')}</span>
        <span>${time}</span>
      </div>
      <div class="pi-footer" onclick="event.stopPropagation()">
        <button class="pi-like ${liked?'liked':''}" onclick="toggleLike(${p.id})">
          ♥ ${p.likes||0}
        </button>
        ${p.files && p.files.length ? `<span class="pi-attach">📎 ${p.files.length}개 첨부</span>` : ''}
      </div>
    </div>`;
  }).join('');

  // 페이징
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const paging = document.getElementById('boardPaging');
  if(totalPages <= 1){ paging.innerHTML = ''; return; }
  paging.innerHTML = Array.from({length:totalPages}, (_,i) =>
    `<button class="page-btn ${i+1===_boardPage?'active':''}" onclick="goPage(${i+1})">${i+1}</button>`
  ).join('');
}

function goPage(n){ _boardPage = n; renderPosts(); window.location.hash='board'; }

/* ── 좋아요 ── */
function toggleLike(postId){
  const session = DB.getSession();
  if(!session){ showToast('로그인 후 이용해 주세요.', 'error'); return; }
  DB.likePost(postId, session.id);
  renderPosts();
}

/* ── 상세 모달 ── */
function openPost(postId){
  const posts = DB.getPosts();
  const p = posts.find(x => x.id === postId);
  if(!p) return;

  const dt   = new Date(p.createdAt);
  const time = `${dt.getFullYear()}.${dt.getMonth()+1}.${dt.getDate()} ${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}`;

  document.getElementById('postModalTitle').textContent = p.title;

  const filesHtml = p.files && p.files.length
    ? `<div class="pd-files">
        <div class="pd-files-title">첨부파일 (${p.files.length}개)</div>
        ${p.files.map(f => `
          <a class="pd-file-item" href="${f.data}" download="${_esc(f.name)}">
            📎 ${_esc(f.name)} (${_fmtSize(f.size)})
          </a>`).join('')}
       </div>` : '';

  document.getElementById('postModalBody').innerHTML = `
    <div class="pd-meta">
      ${_esc(p.cat)} · ${_esc(p.author)} (${_esc(p.dept||'')}) · ${time}
    </div>
    <div class="pd-body">${_esc(p.body)}</div>
    ${filesHtml}`;

  openModal('postModal');
}

function _esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
