/* ─── 1. 전역 상태 및 초기화 ─── */
document.addEventListener("DOMContentLoaded", () => {
    // 페이지 초기화
    renderSchedule();
    loadPosts();
    initNavigation();
    
    // 게시글 작성 버튼 이벤트 리스너 (ID가 submitPost인 경우)
    const postBtn = document.getElementById('submitPost');
    if(postBtn) postBtn.onclick = handlePostSubmit;
});

/* ─── 2. 네비게이션 (메뉴 이동) ─── */
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('data-section');

            // 활성 메뉴 스타일 변경
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // 페이지 전환
            pages.forEach(page => {
                page.classList.remove('active');
                if (page.id === targetId) {
                    page.classList.add('active');
                }
            });

            // 모바일일 경우 메뉴 클릭 시 상단으로 스크롤
            window.scrollTo(0, 0);
        });
    });
}

/* ─── 3. 회원가입 기능 ─── */
function handleRegister() {
    const id = document.getElementById('regId').value;
    const pw = document.getElementById('regPw').value;
    const name = document.getElementById('regName').value;
    const agree = document.getElementById('privacyAgree').checked;

    if (!id || !pw || !name) {
        alert("모든 필드를 입력해주세요.");
        return;
    }

    if (!agree) {
        alert("개인정보 수집 및 이용에 동의해야 가입이 가능합니다.");
        return;
    }

    // 로컬 스토리지 저장 (데모용)
    const user = { id, name, regDate: new Date().toLocaleDateString() };
    localStorage.setItem(`user_${id}`, JSON.stringify(user));

    alert(`${name}님, 인사동 AI 학습동아리 가입을 환영합니다!`);
    
    // 가입 후 홈으로 이동
    document.querySelector('[data-section="home"]').click();
}

/* ─── 4. 자유게시판 기능 ─── */
function handlePostSubmit() {
    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;

    if (!title || !content) {
        alert("제목과 내용을 입력해주세요.");
        return;
    }

    const posts = JSON.parse(localStorage.getItem('board_posts') || '[]');
    const newPost = {
        id: Date.now(),
        title,
        content,
        author: "익명회원",
        date: new Date().toLocaleString()
    };

    posts.unshift(newPost); // 최신글이 위로
    localStorage.setItem('board_posts', JSON.stringify(posts));

    // 입력창 비우기
    document.getElementById('postTitle').value = '';
    document.getElementById('postContent').value = '';

    alert("게시글이 등록되었습니다.");
    loadPosts();
}

function loadPosts() {
    const postList = document.getElementById('postList');
    if (!postList) return;

    const posts = JSON.parse(localStorage.getItem('board_posts') || '[]');
    
    if (posts.length === 0) {
        postList.innerHTML = "<p style='color:var(--muted); text-align:center;'>첫 게시글을 남겨보세요!</p>";
        return;
    }

    postList.innerHTML = posts.map(post => `
        <div class="post-card" style="background:var(--bg2); padding:20px; border-radius:12px; margin-bottom:15px; border:1px solid var(--border);">
            <h3 style="margin-bottom:10px; color:var(--primary);">${post.title}</h3>
            <p style="font-size:14px; margin-bottom:15px;">${post.content}</p>
            <div style="font-size:12px; color:var(--muted); display:flex; justify-content:space-between;">
                <span>작성자: ${post.author}</span>
                <span>${post.date}</span>
            </div>
        </div>
    `).join("");
}

/* ─── 5. 운영 일정 렌더링 ─── */
function renderSchedule() {
    const topics = [
        "생성형 AI 기초 및 프롬프트 전략", "Claude vs ChatGPT 실무 활용",
        "AI 문서 요약 및 자동화", "이미지 생성 AI 실습",
        "GPTs 커스텀 봇 만들기", "AI 윤리와 저작권",
        "중간 성과 공유회", "공모전 준비 및 팀 빌딩"
    ];

    const container = document.getElementById("scheduleBody");
    if (!container) return;

    let html = "";
    const startDate = new Date("2026-05-07");

    for (let i = 0; i < topics.length; i++) {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + (i * 14));
        html += `
            <tr>
                <td>${i + 1}회차</td>
                <td>${d.toISOString().split('T')[0]}</td>
                <td><strong>${topics[i]}</strong></td>
                <td>정기 세션</td>
            </tr>
        `;
    }
    container.innerHTML = html;
}

/* ─── 6. 투표 기능 ─── */
function submitPoll() {
    const selected = document.querySelector('input[name="poll"]:checked');
    if (!selected) {
        alert("항목을 선택해주세요.");
        return;
    }
    alert(`'${selected.value}'에 투표하셨습니다. 결과는 다음 모임에서 공개됩니다!`);
}