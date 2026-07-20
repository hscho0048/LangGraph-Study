/* =========================================================
   LangGraph 학습자료 — 인터랙티브 스크립트
   ========================================================= */
'use strict';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

/* ---------- 네비게이션: 스크롤 스파이 & 진행바 ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const links = [...document.querySelectorAll('.nav a')];
  const sections = links
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);
  const progress = document.querySelector('.progress-bar > span');
  const backTop = document.querySelector('.back-top');

  function onScroll() {
    const st = window.scrollY;
    const h = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = (st / h * 100) + '%';
    if (backTop) backTop.classList.toggle('show', st > 500);

    let current = sections[0];
    for (const sec of sections) {
      if (sec.getBoundingClientRect().top <= 120) current = sec;
    }
    links.forEach(a => a.classList.toggle('active',
      current && a.getAttribute('href') === '#' + current.id));
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // 모바일 사이드바
  const toggle = document.querySelector('.menu-toggle');
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  if (toggle) toggle.addEventListener('click', () => sidebar.classList.toggle('open'));
  if (overlay) overlay.addEventListener('click', () => sidebar.classList.remove('open'));
  links.forEach(a => a.addEventListener('click', () => {
    if (window.innerWidth <= 1000) sidebar.classList.remove('open');
  }));
  if (backTop) backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // 테마 토글 (라이트 모드가 기본값)
  const themeBtn = document.getElementById('theme-toggle');
  function syncThemeButton() {
    if (!themeBtn) return;
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const icon = themeBtn.querySelector('i');
    const label = themeBtn.querySelector('.tt-label');
    if (isDark) {
      icon.className = 'fa-solid fa-sun';
      if (label) label.textContent = '라이트 모드';
      themeBtn.setAttribute('aria-label', '라이트 모드로 전환');
    } else {
      icon.className = 'fa-solid fa-moon';
      if (label) label.textContent = '다크 모드';
      themeBtn.setAttribute('aria-label', '다크 모드로 전환');
    }
  }
  if (themeBtn) {
    syncThemeButton();
    themeBtn.addEventListener('click', () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        try { localStorage.setItem('lg-theme', 'light'); } catch (e) {}
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        try { localStorage.setItem('lg-theme', 'dark'); } catch (e) {}
      }
      syncThemeButton();
    });
  }
});

/* =========================================================
   실습 1 — 최소 StateGraph 시뮬레이터 (counter)
   ========================================================= */
async function runMinGraph() {
  const btn = document.getElementById('mg-run');
  const nodes = [...document.querySelectorAll('#mg-canvas .gnode')];
  const edges = [...document.querySelectorAll('#mg-canvas .gedge')];
  const statePanel = document.getElementById('mg-state');
  const log = document.getElementById('mg-log');
  const startVal = parseInt(document.getElementById('mg-input').value) || 0;

  btn.disabled = true;
  log.innerHTML = ''; edges.forEach(e => e.classList.remove('flow'));
  nodes.forEach(n => n.classList.remove('active', 'done'));

  let counter = startVal;
  const render = (upd) => {
    statePanel.innerHTML = `{ <span class="key">"counter"</span>: <span class="${upd ? 'upd' : 'val'}">${counter}</span> }`;
  };
  const addLog = (t, cls = 'sys') => { log.innerHTML += `<div class="line ${cls}">${t}</div>`; log.scrollTop = log.scrollHeight; };

  render(false);
  addLog(`invoke({counter: ${startVal}}) 호출`, 'sys');

  // START
  nodes[0].classList.add('active'); await sleep(500); nodes[0].classList.replace('active', 'done');
  edges[0].classList.add('flow'); await sleep(300);

  // inc 노드
  nodes[1].classList.add('active');
  addLog(`노드 "inc" 실행 → 부분 상태 {counter: ${counter}+1} 반환`, 'act');
  await sleep(700);
  counter += 1; render(true);
  addLog(`LangGraph가 병합 → counter = ${counter}`, 'obs');
  nodes[1].classList.replace('active', 'done');
  edges[1].classList.add('flow'); await sleep(300);

  // END
  nodes[2].classList.add('active'); await sleep(400); nodes[2].classList.replace('active', 'done');
  addLog(`실행 종료 → 최종 상태 {counter: ${counter}}`, 'done');
  render(false);
  btn.disabled = false;
}

/* =========================================================
   실습 2 — 리듀서(Reducer) 비교 실험
   ========================================================= */
function runReducer() {
  const type = document.getElementById('rd-type').value;
  const out = document.getElementById('rd-out');
  const nodeA = [1, 2];      // 노드 A 반환
  const nodeB = [3, 4];      // 노드 B 반환
  let result, explain;
  if (type === 'override') {
    result = JSON.stringify(nodeB);
    explain = '기본(덮어쓰기): 마지막 노드 B의 값이 A를 완전히 대체함.';
  } else if (type === 'add') {
    result = JSON.stringify(nodeA.concat(nodeB));
    explain = 'operator.add: 두 리스트가 연결(concat)되어 누적됨.';
  } else {
    const merged = [...new Set(nodeA.concat(nodeB))];
    result = JSON.stringify(merged) + '  (append + 중복 제거)';
    explain = 'add_messages: 메시지를 append하고 중복 id는 제거함 (대화 히스토리 표준).';
  }
  out.innerHTML =
    `<div>노드 A 반환: <span class="tag">${JSON.stringify(nodeA)}</span></div>` +
    `<div>노드 B 반환: <span class="tag">${JSON.stringify(nodeB)}</span></div>` +
    `<div style="margin-top:8px;color:var(--accent-2)">병합 결과 → ${result}</div>` +
    `<div style="margin-top:6px;color:var(--text-dim)">${explain}</div>`;
}

/* =========================================================
   실습 3 — 조건부 엣지 라우터 (ReAct 분기)
   ========================================================= */
function runRouter(hasToolCall) {
  const nAgent = document.getElementById('rt-agent');
  const nTools = document.getElementById('rt-tools');
  const nEnd = document.getElementById('rt-end');
  const eTools = document.getElementById('rt-e-tools');
  const eEnd = document.getElementById('rt-e-end');
  const out = document.getElementById('rt-out');
  [nAgent, nTools, nEnd].forEach(n => n.classList.remove('active', 'done'));
  [eTools, eEnd].forEach(e => e.classList.remove('flow'));

  nAgent.classList.add('active');
  setTimeout(() => {
    nAgent.classList.replace('active', 'done');
    if (hasToolCall) {
      eTools.classList.add('flow'); nTools.classList.add('active');
      out.innerHTML = `route(state) 검사: <b>last.tool_calls 존재 ✓</b><br>→ 반환값 <span style="color:var(--accent-3)">"tools"</span> → tools 노드 실행 후 다시 agent로 순환(loop)함.`;
    } else {
      eEnd.classList.add('flow'); nEnd.classList.add('active');
      out.innerHTML = `route(state) 검사: <b>tool_calls 없음</b><br>→ 반환값 <span style="color:var(--green)">END</span> → 그래프 종료, 최종 답변 반환.`;
    }
  }, 500);
}

/* =========================================================
   실습 4 — 메모리 / thread_id 세션 시뮬레이터
   ========================================================= */
const memStore = {}; // { thread_id: [messages] }
function memSend() {
  const tid = document.getElementById('mem-thread').value.trim() || 'user-1';
  const msg = document.getElementById('mem-msg').value.trim();
  if (!msg) return;
  if (!memStore[tid]) memStore[tid] = [];
  memStore[tid].push(msg);
  document.getElementById('mem-msg').value = '';
  memRender(tid);
}
function memRender(tid) {
  const box = document.getElementById('mem-history');
  const hist = memStore[tid] || [];
  const info = document.getElementById('mem-info');
  info.innerHTML = `현재 세션 <b style="color:var(--accent)">thread_id="${tid}"</b> · 저장된 메시지 ${hist.length}개 (Checkpointer가 이 thread의 상태를 보존함)`;
  box.innerHTML = hist.length
    ? hist.map((m, i) => `<div class="line sys">[turn ${i + 1}] ${m}</div>`).join('')
    : '<div class="line sys" style="opacity:.6">아직 이 thread에 메시지가 없음. 동일 thread_id로 이어서 보내면 이전 대화를 기억함.</div>';
}
function memSwitch() {
  const tid = document.getElementById('mem-thread').value.trim() || 'user-1';
  memRender(tid);
}

/* =========================================================
   실습 5 — ReAct Think→Act→Observe 루프
   ========================================================= */
const reactScenarios = {
  calc: {
    q: '(15 * 4) + 8 은 얼마야?',
    steps: [
      ['think', 'LLM: 계산이 필요함. calculator 도구를 호출해야겠음.'],
      ['act', 'Act: calculator(expr="(15*4)+8") 호출'],
      ['obs', 'Observe: 도구 결과 → "68"'],
      ['think', 'LLM: 결과를 확보함. 추가 도구 불필요.'],
      ['done', '최종 답변: (15 × 4) + 8 = 68 입니다.']
    ]
  },
  search: {
    q: '2026년 현재 LangGraph 최신 권장 모델 초기화 방법은?',
    steps: [
      ['think', 'LLM: 최신 정보가 필요함. 내 지식만으로는 불확실 → 검색 도구 사용.'],
      ['act', 'Act: tavily_search("LangGraph init_chat_model 2026") 호출'],
      ['obs', 'Observe: 검색 결과 → "init_chat_model 사용 권장, provider 접두어로 교체"'],
      ['think', 'LLM: 근거 확보됨. 답변 생성 가능.'],
      ['done', '최종 답변: init_chat_model 사용이 권장되며 provider 접두어로 손쉽게 교체합니다.']
    ]
  },
  multi: {
    q: '파리 날씨를 알려주고, 섭씨를 화씨로 변환해줘',
    steps: [
      ['think', 'LLM: 두 가지 작업 필요 → 먼저 날씨 검색.'],
      ['act', 'Act: weather_search("Paris") 호출'],
      ['obs', 'Observe: 결과 → "파리 20°C"'],
      ['think', 'LLM: 이제 단위 변환 필요 → 계산 도구 사용.'],
      ['act', 'Act: calculator("20*9/5+32") 호출'],
      ['obs', 'Observe: 결과 → "68"'],
      ['think', 'LLM: 두 결과 모두 확보. 종료.'],
      ['done', '최종 답변: 파리는 20°C(=68°F)입니다.']
    ]
  }
};
async function runReact() {
  const key = document.getElementById('react-scenario').value;
  const sc = reactScenarios[key];
  const log = document.getElementById('react-log');
  const btn = document.getElementById('react-run');
  const cAgent = document.getElementById('react-agent');
  const cTools = document.getElementById('react-tools');
  btn.disabled = true; log.innerHTML = '';
  const addLog = (cls, t) => { log.innerHTML += `<div class="line ${cls}">${t}</div>`; log.scrollTop = log.scrollHeight; };
  addLog('sys', `👤 사용자: ${sc.q}`);
  await sleep(400);
  let loops = 0;
  for (const [cls, txt] of sc.steps) {
    if (cls === 'think') { cAgent.classList.add('active'); cTools.classList.remove('active'); }
    if (cls === 'act') { cTools.classList.add('active'); cAgent.classList.remove('active'); loops++; }
    if (cls === 'obs') { cTools.classList.add('active'); }
    if (cls === 'done') { cAgent.classList.remove('active'); cTools.classList.remove('active'); }
    addLog(cls, txt);
    await sleep(850);
  }
  addLog('sys', `↺ 사이클 반복 횟수: ${loops}  (recursion_limit 이내에서 종료됨)`);
  btn.disabled = false;
}

/* =========================================================
   실습 6 — recursion_limit 튜너
   ========================================================= */
function updateRecursion(v) {
  document.getElementById('rec-val').textContent = v;
  const out = document.getElementById('rec-advice');
  v = parseInt(v);
  let label, color;
  if (v <= 15) { label = '간단 질의 (단순 Q&A, 1~2회 도구 호출) 에 적합'; color = 'var(--green)'; }
  else if (v <= 50) { label = '중간 복잡도 (일반 에이전트 작업) 에 적합 — 기본값 25 포함'; color = 'var(--accent-2)'; }
  else { label = '복잡한 리서치 (다단계 검색·추론) 에 적합 — 비용·시간 주의'; color = 'var(--accent-3)'; }
  out.innerHTML = `<span style="color:${color}">최대 ${v}회 반복 허용 → ${label}</span>`;
}

/* =========================================================
   실습 7 — 미들웨어 파이프라인 토글
   ========================================================= */
const middlewareDefs = {
  pii: { label: 'PII 마스킹', apply: (t) => t.replace(/[\w.]+@[\w.]+/g, '[REDACTED]').replace(/\d{3}-\d{4}-\d{4}/g, '[REDACTED]'), note: 'before_model: 이메일/전화번호 치환' },
  summary: { label: '대화 요약', apply: (t) => t, note: 'before_model: 긴 히스토리 자동 요약(길면 압축)' },
  hitl: { label: 'HITL 승인', apply: (t) => t, note: 'before_tool: 민감 도구 실행 전 사람 승인 요구' },
  cost: { label: '비용 추적', apply: (t) => t, note: 'after_model: 토큰·호출 수 계측' }
};
function toggleMw(el, key) {
  el.classList.toggle('on');
  runMiddleware();
}
function runMiddleware() {
  const raw = document.getElementById('mw-input').value;
  const out = document.getElementById('mw-out');
  const active = [...document.querySelectorAll('.toggle-item.on')].map(e => e.dataset.mw);
  let processed = raw;
  let lines = [`👤 원본 입력: ${raw}`];
  const order = ['pii', 'summary', 'hitl', 'cost'];
  order.forEach(k => {
    if (active.includes(k)) {
      const d = middlewareDefs[k];
      if (k === 'pii') processed = d.apply(processed);
      lines.push(`<span class="tag">[${d.label}]</span> ${d.note}`);
    }
  });
  if (active.includes('hitl')) {
    lines.push(`⏸ <span style="color:var(--accent-3)">interrupt() 발생 → 사용자 승인 대기 후 재개</span>`);
  }
  lines.push(`🤖 모델로 전달되는 최종 입력: <span style="color:var(--accent-2)">${processed}</span>`);
  if (active.includes('cost')) lines.push(`💰 [비용 추적] 예상 토큰 ≈ ${Math.ceil(processed.length / 4)} tok`);
  if (active.length === 0) lines.push('<span style="color:var(--text-dim)">활성화된 미들웨어 없음 — 코어 로직에 입력이 그대로 전달됨.</span>');
  out.innerHTML = lines.map(l => `<div>${l}</div>`).join('');
}

/* =========================================================
   실습 8 — HITL: interrupt / resume
   ========================================================= */
let hitlState = 'idle';
function hitlStart() {
  const log = document.getElementById('hitl-log');
  const controls = document.getElementById('hitl-decision');
  log.innerHTML = '';
  const add = (cls, t) => log.innerHTML += `<div class="line ${cls}">${t}</div>`;
  add('sys', '👤 요청: "고객에게 환불 이메일 보내줘"');
  add('think', 'agent 노드: send_email 도구 호출 준비 (고위험 작업)');
  add('act', 'interrupt({action:"send_email", to:"customer@..."}) 호출');
  add('sys', '⏸ 그래프 실행 중단 — Checkpointer가 상태 저장, 사람 결정 대기');
  controls.style.display = 'flex';
  hitlState = 'waiting';
}
function hitlResume(decision) {
  if (hitlState !== 'waiting') return;
  const log = document.getElementById('hitl-log');
  const add = (cls, t) => log.innerHTML += `<div class="line ${cls}">${t}</div>`;
  document.getElementById('hitl-decision').style.display = 'none';
  add('sys', `👤 사람 결정: Command(resume="${decision}") 전달`);
  if (decision === 'approve') {
    add('obs', '중단 지점에서 정확히 재개 → send_email 실행됨');
    add('done', '✓ 이메일 발송 완료 (승인 흐름)');
  } else if (decision === 'reject') {
    add('obs', '재개 → 도구 실행 건너뜀, 거부 경로로 라우팅');
    add('done', '✗ 발송 취소됨 (거부 흐름)');
  } else {
    add('obs', '재개 → 수정된 내용으로 다시 검토 단계로 이동');
    add('done', '✎ 내용 수정 후 재승인 대기 (수정 흐름)');
  }
  hitlState = 'idle';
}

/* =========================================================
   실습 9 — 가드레일 3계층 필터
   ========================================================= */
function runGuardrail() {
  const text = document.getElementById('gr-input').value;
  const out = document.getElementById('gr-out');
  let lines = [];
  let blocked = false;
  // 1) 결정론적
  const injection = /(ignore .*instructions|시스템 프롬프트|무시하고)/i.test(text);
  const pii = /[\w.]+@[\w.]+/.test(text);
  lines.push(`<b style="color:var(--accent)">① 결정론적 계층</b>`);
  if (injection) { lines.push('　⛔ Prompt Injection 패턴 감지 → 즉시 차단'); blocked = true; }
  else if (pii) { lines.push('　⚠ PII(이메일) 감지 → [REDACTED]로 마스킹 후 통과'); }
  else lines.push('　✓ 명백한 위험 없음');

  if (!blocked) {
    // 2) 모델 기반
    const risky = /(폭탄|해킹|불법|자살)/.test(text);
    lines.push(`<b style="color:var(--accent-2)">② 모델 기반 (LLM-as-Judge)</b>`);
    if (risky) { lines.push('　⛔ 정책 위반 분류 → 차단'); blocked = true; }
    else lines.push('　✓ 정책 위반 아님 (판정 통과)');
  }
  if (!blocked) {
    // 3) HITL
    const ambiguous = /(결제|송금|삭제|환불)/.test(text);
    lines.push(`<b style="color:var(--accent-3)">③ HITL 계층</b>`);
    if (ambiguous) lines.push('　⏸ 애매·고위험 → interrupt로 사람 승인 요청');
    else lines.push('　✓ 자동 통과 → 에이전트 정상 처리');
  }
  out.innerHTML = lines.map(l => `<div>${l}</div>`).join('') +
    `<div style="margin-top:10px;font-weight:700;color:${blocked ? 'var(--red)' : 'var(--green)'}">최종 판정: ${blocked ? '요청 차단됨 🛑' : '요청 허용 (필요 시 승인 대기) ✅'}</div>`;
}

/* =========================================================
   실습 10 — RAG 파이프라인 (Ingestion→Retrieval→Generation)
   ========================================================= */
async function runRag() {
  const q = document.getElementById('rag-q').value.trim() || 'LangGraph의 체크포인터란?';
  const stages = [...document.querySelectorAll('#rag-stages .stage')];
  const out = document.getElementById('rag-out');
  const btn = document.getElementById('rag-run');
  btn.disabled = true;
  stages.forEach(s => s.classList.remove('active'));
  out.innerHTML = '';
  const addOut = (t) => { out.innerHTML += `<div>${t}</div>`; };

  // 가짜 문서 코퍼스
  const corpus = [
    { t: '체크포인터는 thread_id별 대화 상태를 저장하는 단기 메모리다.', score: 0.92 },
    { t: 'Store는 사용자·조직 전역 네임스페이스의 장기 메모리다.', score: 0.61 },
    { t: 'StateGraph는 State/Node/Edge로 구성된다.', score: 0.44 }
  ];

  stages[0].classList.add('active');
  addOut('<span class="tag">① Ingestion</span> 문서 로드 → 청킹 → 임베딩 → 벡터 DB 저장 (사전 완료)');
  await sleep(900); stages[0].classList.remove('active');

  stages[1].classList.add('active');
  addOut(`<span class="tag">② Retrieval</span> 질문 "${q}" 임베딩 → 유사 청크 검색`);
  await sleep(700);
  corpus.forEach(c => addOut(`　· (score ${c.score}) ${c.t}`));
  const top = corpus.filter(c => c.score >= 0.6);
  addOut(`　→ 임계값(0.6) 이상 ${top.length}개 청크 선택`);
  await sleep(900); stages[1].classList.remove('active');

  stages[2].classList.add('active');
  addOut('<span class="tag">③ Generation</span> 선택된 컨텍스트를 프롬프트에 주입 → LLM 답변 생성');
  await sleep(800);
  addOut('<span style="color:var(--accent-2)">🤖 답변: 체크포인터는 thread_id 단위로 대화 세션 상태를 보존하는 단기 메모리이며, InMemorySaver·SqliteSaver·PostgresSaver 등으로 구현합니다.</span>');
  await sleep(400); stages[2].classList.remove('active');
  btn.disabled = false;
}

/* =========================================================
   실습 11 — 청킹 시각화 (chunk_size / overlap)
   ========================================================= */
function renderChunks() {
  const size = parseInt(document.getElementById('chunk-size').value);
  const overlap = parseInt(document.getElementById('chunk-overlap').value);
  document.getElementById('chunk-size-val').textContent = size;
  document.getElementById('chunk-overlap-val').textContent = overlap + '%';
  const text = 'LangGraph는 상태와 노드와 엣지로 그래프를 구성하는 LLM 오케스트레이션 프레임워크로서 복잡한 에이전트와 RAG 시스템을 만들 수 있는 강력한 도구이다. '.repeat(2);
  const ov = Math.floor(size * overlap / 100);
  const step = Math.max(1, size - ov);
  const box = document.getElementById('chunk-out');
  const colors = ['rgba(124,156,255,.25)', 'rgba(88,230,197,.25)', 'rgba(255,180,84,.25)', 'rgba(184,146,255,.25)', 'rgba(255,123,156,.25)'];
  let html = ''; let idx = 0; let ci = 0;
  while (idx < text.length && ci < 6) {
    const chunk = text.slice(idx, idx + size);
    html += `<span style="background:${colors[ci % colors.length]};padding:2px 4px;border-radius:4px;margin:2px;display:inline-block">${chunk}</span>`;
    idx += step; ci++;
  }
  box.innerHTML = `<div style="font-size:.7rem;color:var(--text-dim);margin-bottom:6px">청크 ${ci}개 · 청크당 ${size}자 · 겹침 ${ov}자 (중복 영역이 문맥 손실을 방지함)</div>` + html;
}

/* =========================================================
   실습 12 — 벡터 DB 선택 마법사
   ========================================================= */
function recommendDB() {
  const scale = document.getElementById('db-scale').value;
  const env = document.getElementById('db-env').value;
  const out = document.getElementById('db-out');
  let rec, why;
  if (scale === 'small' && env === 'local') { rec = 'Chroma'; why = '가볍고 로컬 파일 저장 — 프로토타입/소규모 앱에 최적.'; }
  else if (scale === 'static') { rec = 'FAISS'; why = '인메모리 초고속 검색 — 정적 데이터/배치 검색에 최적.'; }
  else if (env === 'managed') { rec = 'Pinecone'; why = '매니지드·자동 확장 — 프로덕션 SaaS에 최적.'; }
  else if (env === 'rdb') { rec = 'pgvector'; why = 'PostgreSQL 확장 — 기존 RDB와 통합 관리 시 최적.'; }
  else { rec = 'Weaviate / Qdrant'; why = '오픈소스 하이브리드 검색 — 온프레미스 프로덕션에 최적.'; }
  out.innerHTML = `<div style="font-size:1.1rem;font-weight:800;color:var(--accent-2)">추천 → ${rec}</div><div style="color:var(--text-soft);margin-top:4px">${why}</div>`;
}

/* =========================================================
   실습 13 — RAGAS 평가 메트릭 게이지
   ========================================================= */
function animateMetrics() {
  const vals = { faith: 88, relev: 92, cprec: 74, crec: 81 };
  Object.entries(vals).forEach(([k, v]) => {
    const bar = document.querySelector(`#metric-${k} .gauge > span`);
    const num = document.querySelector(`#metric-${k} .m-num`);
    setTimeout(() => { bar.style.width = v + '%'; }, 50);
    let cur = 0;
    const t = setInterval(() => { cur += 2; if (cur >= v) { cur = v; clearInterval(t); } num.textContent = cur + '%'; }, 20);
  });
}

/* =========================================================
   실습 14 — 다중 에이전트 패턴 선택 퀴즈
   ========================================================= */
const patternQuiz = [
  { q: '여러 리서치 도구(웹·위키·사내문서)를 하나의 관리자가 조율해야 한다.', a: 'supervisor' },
  { q: '고객 지원에서 접수→분류→해결 순으로 담당자가 바뀌는 대화 흐름이다.', a: 'handoffs' },
  { q: '여러 에이전트가 하나의 공유 State에서 병렬로 협업해야 한다.', a: 'stategraph' }
];
let quizIdx = 0;
function loadQuiz() {
  const item = patternQuiz[quizIdx];
  document.getElementById('quiz-q').textContent = item.q;
  document.querySelectorAll('#quiz-choices .choice').forEach(c => c.classList.remove('correct', 'wrong', 'selected'));
  document.getElementById('quiz-result').classList.remove('show', 'ok', 'no');
}
function answerQuiz(el, val) {
  const item = patternQuiz[quizIdx];
  const res = document.getElementById('quiz-result');
  document.querySelectorAll('#quiz-choices .choice').forEach(c => c.style.pointerEvents = 'none');
  const names = { supervisor: 'Supervisor(Subagents)', handoffs: 'Handoffs', stategraph: 'StateGraph 커스텀' };
  if (val === item.a) {
    el.classList.add('correct');
    res.className = 'result-box show ok';
    res.textContent = `정답! → ${names[val]} 패턴이 적합합니다.`;
  } else {
    el.classList.add('wrong');
    document.querySelector(`#quiz-choices .choice[data-v="${item.a}"]`).classList.add('correct');
    res.className = 'result-box show no';
    res.textContent = `아쉬워요. 정답은 ${names[item.a]} 패턴입니다.`;
  }
}
function nextQuiz() {
  quizIdx = (quizIdx + 1) % patternQuiz.length;
  document.querySelectorAll('#quiz-choices .choice').forEach(c => c.style.pointerEvents = 'auto');
  loadQuiz();
}

/* =========================================================
   실습 15 — Supervisor 라우팅 데모
   ========================================================= */
function runSupervisor(worker) {
  const out = document.getElementById('sup-out');
  const map = {
    web: ['call_web', 'tavily_search', '웹 검색으로 최신 정보를 찾음', '2026년 최신 뉴스 3건을 요약했습니다.'],
    wiki: ['call_wiki', 'wikipedia_query', 'Wikipedia로 배경 지식을 찾음', '해당 주제의 정의와 역사를 정리했습니다.']
  };
  const [tool, src, desc, result] = map[worker];
  out.innerHTML =
    `<div>👤 요청 접수 → <b style="color:var(--accent)">Supervisor</b>가 분석</div>` +
    `<div>🧭 라우팅 결정 → <span class="tag">${tool}()</span> 도구 호출 (${desc})</div>` +
    `<div>↳ 워커 에이전트가 <span class="tag">${src}</span> 원천 도구 실행</div>` +
    `<div style="color:var(--accent-2)">🤖 워커 결과 → Supervisor에 반환: "${result}"</div>` +
    `<div style="color:var(--text-dim);margin-top:4px">Supervisor는 소유권을 항상 유지하며 결과를 종합함.</div>`;
}

/* =========================================================
   실습 16 — Handoffs 단계 이양 시뮬레이터
   ========================================================= */
const handoffStages = [
  { agent: 'warranty_collector', role: '보증 ID를 요청·수집함', ask: '보증 ID를 알려주세요.', next: '보증 ID 수집 완료 → 다음 단계로 소유권 이양' },
  { agent: 'issue_classifier', role: '문제 유형(HW/SW)을 분류함', ask: '어떤 문제가 발생했나요?', next: '문제 유형 분류 완료 → 다음 단계로 이양' },
  { agent: 'resolution_specialist', role: '해결 방안을 안내함', ask: '무상 수리를 안내드립니다.', next: '해결 완료 → 대화 종료' }
];
let handoffStep = 0;
function handoffNext() {
  const log = document.getElementById('handoff-log');
  const badge = document.getElementById('handoff-badge');
  const btn = document.getElementById('handoff-btn');
  if (handoffStep === 0) log.innerHTML = '';
  const s = handoffStages[handoffStep];
  badge.textContent = `Turn ${handoffStep + 1} · ${s.agent}`;
  log.innerHTML += `<div class="line act">[${s.agent}] ${s.role}</div>`;
  log.innerHTML += `<div class="line sys">🤖 "${s.ask}"</div>`;
  log.innerHTML += `<div class="line obs">↪ ${s.next}</div>`;
  log.scrollTop = log.scrollHeight;
  handoffStep++;
  if (handoffStep >= handoffStages.length) {
    btn.textContent = '처음부터 다시';
    btn.onclick = () => { handoffStep = 0; badge.textContent = '대기중'; btn.textContent = '다음 단계로 이양 ▶'; btn.onclick = handoffNext; log.innerHTML = '<div class="line sys" style="opacity:.6">버튼을 눌러 단계별 소유권 이양을 확인하세요.</div>'; };
  }
}

/* 초기화 */
window.addEventListener('load', () => {
  if (document.getElementById('rd-out')) runReducer();
  if (document.getElementById('mem-history')) memRender('user-1');
  if (document.getElementById('rec-advice')) updateRecursion(25);
  if (document.getElementById('mw-out')) runMiddleware();
  if (document.getElementById('chunk-out')) renderChunks();
  if (document.getElementById('db-out')) recommendDB();
  if (document.getElementById('quiz-q')) loadQuiz();
  // 메트릭 게이지: 화면 진입 시 애니메이션
  const mObs = document.getElementById('metric-faith');
  if (mObs) {
    const io = new IntersectionObserver((ents) => {
      ents.forEach(e => { if (e.isIntersecting) { animateMetrics(); io.disconnect(); } });
    }, { threshold: .4 });
    io.observe(document.getElementById('metrics-demo'));
  }
});
