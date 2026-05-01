/* ══════════════════════════════════════
   data.js — 데이터 레이어 (localStorage)
   향후 fetch('/api/...') REST API로 교체
══════════════════════════════════════ */
"use strict";

/* ── 초기 관리자 계정 시딩 ── */
(function seedAdmin(){
  const users = JSON.parse(localStorage.getItem('ins_users') || '[]');
  if (!users.find(u => u.id === 'admin')) {
    users.push({
      id: 'admin', name: '관리자', dept: '정보화팀', role: '과장',
      email: 'admin@insadong.kr',
      pw: _hashPw('a1234567!'),
      status: 'active', isAdmin: true,
      joinedAt: new Date().toISOString()
    });
    localStorage.setItem('ins_users', JSON.stringify(users));
  }
})();

/* ── 간단한 해시 (실제 배포 시 bcrypt 서버사이드로 교체) ── */
function _hashPw(pw){
  let h = 0;
  for(let i = 0; i < pw.length; i++) h = (Math.imul(31, h) + pw.charCodeAt(i)) | 0;
  return 'H' + Math.abs(h).toString(36) + pw.length;
}

/* ════════════════════════════════════════
   DB 네임스페이스
════════════════════════════════════════ */
const DB = {

  /* ── Users ── */
  getUsers(){ return JSON.parse(localStorage.getItem('ins_users') || '[]'); },
  saveUsers(u){ localStorage.setItem('ins_users', JSON.stringify(u)); },
  findUser(id){ return this.getUsers().find(u => u.id === id); },
  addUser(u){
    const users = this.getUsers();
    users.push(u);
    this.saveUsers(users);
  },
  approveUser(id){
    const users = this.getUsers();
    const u = users.find(u => u.id === id);
    if(u){ u.status = 'active'; this.saveUsers(users); }
    return u;
  },
  rejectUser(id){
    const users = this.getUsers().filter(u => u.id !== id);
    this.saveUsers(users);
  },

  /* ── Session ── */
  getSession(){ return JSON.parse(sessionStorage.getItem('ins_session') || 'null'); },
  setSession(u){ sessionStorage.setItem('ins_session', JSON.stringify({id:u.id,name:u.name,isAdmin:u.isAdmin,dept:u.dept})); },
  clearSession(){ sessionStorage.removeItem('ins_session'); },

  /* ── Posts ── */
  getPosts(){ return JSON.parse(localStorage.getItem('ins_posts') || '[]'); },
  savePosts(p){ localStorage.setItem('ins_posts', JSON.stringify(p)); },
  addPost(p){
    const posts = this.getPosts();
    posts.unshift({ ...p, id: Date.now(), likes: 0, likedBy: [], createdAt: new Date().toISOString() });
    this.savePosts(posts);
    return posts[0];
  },
  likePost(postId, userId){
    const posts = this.getPosts();
    const p = posts.find(x => x.id === postId);
    if(!p) return null;
    const idx = p.likedBy.indexOf(userId);
    if(idx === -1){ p.likedBy.push(userId); p.likes++; }
    else { p.likedBy.splice(idx, 1); p.likes--; }
    this.savePosts(posts);
    return p;
  },

  /* ── News cache ── */
  getNewsCache(){ return JSON.parse(localStorage.getItem('ins_news_cache') || 'null'); },
  setNewsCache(data){ localStorage.setItem('ins_news_cache', JSON.stringify({ data, ts: Date.now() })); },

  /* ── Poll ── */
  getPollVotes(){ return JSON.parse(localStorage.getItem('ins_poll') || '[]'); },
  addPollVote(v){
    const votes = this.getPollVotes();
    votes.push(v);
    localStorage.setItem('ins_poll', JSON.stringify(votes));
  },

  /* helpers */
  hashPw: _hashPw
};
