/* ══════════════════════════════
   schedule.js — 운영 일정 모듈
   5월~12월 격주 (홀수 주 토요일 기준)
══════════════════════════════ */
"use strict";

const SESSIONS = [
  /* 5월 */
  { date:'2026-05-08', month:'MAY', session:1,  title:'킥오프 & AI 도구 대탐험',
    sub:'ChatGPT·Claude·Gemini 기능 비교 및 업무 적용 가능성 탐색. 각자 가장 쓰고 싶은 AI 툴 발표' },
  { date:'2026-05-22', month:'MAY', session:2,  title:'프롬프트 엔지니어링 실습',
    sub:'업무 보고서·공문·기획서를 AI로 초안 작성하는 프롬프트 패턴 학습 및 실습' },
  /* 6월 */
  { date:'2026-06-05', month:'JUN', session:3,  title:'AI로 데이터 분석하기',
    sub:'Excel 대신 ChatGPT·Claude로 통계·차트·인사이트 추출. 사회서비스 데이터 샘플 실습' },
  { date:'2026-06-19', month:'JUN', session:4,  title:'AI 이미지·영상 제작 실습',
    sub:'Midjourney·DALL-E·Sora 활용 홍보물·카드뉴스·교육영상 제작 실습' },
  /* 7월 */
  { date:'2026-07-03', month:'JUL', session:5,  title:'업무 자동화 — n8n·Zapier',
    sub:'반복 업무(이메일 분류·보고서 자동생성·슬랙 알림)를 AI 워크플로우로 자동화하는 실습' },
  { date:'2026-07-17', month:'JUL', session:6,  title:'AI 챗봇 만들기 (노코드)',
    sub:'부서 내부용 FAQ 챗봇을 노코드 도구(Dify·Flowise)로 직접 구축해보는 실습' },
  /* 8월 */
  { date:'2026-08-07', month:'AUG', session:7,  title:'생성형 AI로 기획서 작성',
    sub:'사회서비스 개선 기획서를 AI와 공동 작성. 구조·논리·데이터 인용 자동화 방법론' },
  { date:'2026-08-21', month:'AUG', session:8,  title:'AI 전문가 초빙 특강',
    sub:'공공·사회서비스 분야 생성형 AI 최신 도입 사례 및 2026 트렌드 외부 강의' },
  /* 9월 */
  { date:'2026-09-04', month:'SEP', session:9,  title:'공모전 아이디어 워크숍',
    sub:'하이브레인넷 공모전 분석 → 팀별 아이디어 발산 → 출품 주제 선정 투표' },
  { date:'2026-09-18', month:'SEP', session:10, title:'AI 활용 결과물 중간 발표',
    sub:'지난 4개월간 각자 만든 AI 결과물 데모 및 피드백. 개선점 도출' },
  /* 10월 */
  { date:'2026-10-02', month:'OCT', session:11, title:'공모전 출품작 제작 스프린트',
    sub:'팀 편성 후 공모전 출품작 초안 작성. AI 툴 풀활용 (글·이미지·분석 보조)' },
  { date:'2026-10-16', month:'OCT', session:12, title:'개인 AI 프로젝트 공유',
    sub:'개인 업무에 AI를 적용한 사례 공유 및 팁 교환. 월 1개 결과물 점검' },
  /* 11월 */
  { date:'2026-11-06', month:'NOV', session:13, title:'공모전 출품작 최종 검토',
    sub:'출품 전 최종 피드백 및 보완. AI 기반 퇴고·디자인·프레젠테이션 완성' },
  { date:'2026-11-20', month:'NOV', session:14, title:'AI 보안·윤리·법규 이해',
    sub:'공공기관 AI 활용 시 주의사항, 개인정보·저작권·KISA 가이드라인 스터디' },
  /* 12월 */
  { date:'2026-12-04', month:'DEC', session:15, title:'연간 성과 정리 & 발표',
    sub:'2026년 동아리 활동 결과물 전체 정리. 공모전 결과 공유 및 2027 계획 논의' },
  { date:'2026-12-18', month:'DEC', session:16, title:'종강 파티 & 2027 계획',
    sub:'한 해 마무리 회식 겸 네트워킹. 내년 주제·일정·리더십 논의' },
];

function renderSchedule(){
  const today = new Date();
  const grid  = document.getElementById('scheduleGrid');
  if(!grid) return;

  grid.innerHTML = SESSIONS.map(s => {
    const d     = new Date(s.date);
    const isPast = d < today && d.toDateString() !== today.toDateString();
    const isToday = d.toDateString() === today.toDateString();
    const dateStr = `${d.getMonth()+1}월 ${d.getDate()}일 (${['일','월','화','수','목','금','토'][d.getDay()]})`;

    return `<div class="sc-card ${isPast?'past':''} ${isToday?'today':''}">
      <div class="sc-month">${s.month}</div>
      <div class="sc-date">${dateStr}</div>
      <div class="sc-session">${s.session}회차</div>
      <div class="sc-title">${s.title}</div>
      <div class="sc-sub">${s.sub}</div>
    </div>`;
  }).join('');
}
