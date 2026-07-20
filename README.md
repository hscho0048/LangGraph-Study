# LangGraph 학습자료 — 개념부터 활용까지 (인터랙티브 웹)

원본 마크다운 학습자료(`랭그래프.md`, wikidocs.net/261576 시리즈 · 2026)의 **모든 내용을 빠짐없이** 담고, 개념 이해를 돕는 **브라우저 내 인터랙티브 실습(DEMO)** 을 곁들인 정적 학습 웹사이트임. 사용자가 직접 코드를 작성하지 않고, **버튼·슬라이더·토글 등 조작으로 개념을 체험**하도록 설계함.

## 프로젝트 목표
- 방대한 텍스트 학습자료를 가독성 높은 단일 페이지 문서로 재구성
- 추상적인 그래프/에이전트 개념을 시각적 시뮬레이션으로 직관적 이해 지원
- 원문 텍스트(서론·Part1~4·종합 정리)와 표·코드 예시를 100% 보존

## 완료된 기능 (Currently completed features)
- **원문 전체 수록**: 서론, Part 1(1-1~1-7), Part 2(2-1~2-5), Part 3(3-1~3-4), Part 4(4-1~4-2), 종합 정리까지 누락 없이 포함
- **모든 표·코드 스니펫 재현** (구문 색상 하이라이팅 포함, 10개 코드 블록)
- **좌측 고정 사이드바 네비게이션** + 스크롤 스파이(현재 위치 하이라이트) + 상단 진행률 바
- **반응형 디자인** (모바일에서 햄버거 메뉴로 사이드바 토글)
- **16개 인터랙티브 실습(DEMO)**:
  1. 최소 StateGraph 실행 시뮬레이터 (START→inc→END, 상태 병합 시각화)
  2. 리듀서(Reducer) 비교 실험 (덮어쓰기 / operator.add / add_messages)
  3. 조건부 엣지 라우터 (tool_calls 유무에 따른 분기)
  4. thread_id 세션 메모리 체험 (Checkpointer 동작)
  5. ReAct Think→Act→Observe 루프 시뮬레이터 (3가지 시나리오)
  6. recursion_limit 튜너 (슬라이더)
  7. 미들웨어 파이프라인 조립 (PII 마스킹/요약/HITL/비용추적 토글)
  8. HITL interrupt/resume 승인 흐름 (승인·거부·수정)
  9. 3계층 가드레일 필터 (결정론+모델+HITL)
  10. RAG 파이프라인 실행 (Ingestion→Retrieval→Generation, 유사도 점수)
  11. 청킹 시각화 (chunk_size / overlap 슬라이더)
  12. 벡터 DB 선택 마법사
  13. RAGAS 평가 대시보드 (게이지 애니메이션)
  14. 다중 에이전트 패턴 선택 퀴즈
  15. Supervisor 라우팅 데모
  16. Handoffs 단계 이양 시뮬레이터

## 기능별 진입 경로 (Functional entry URIs)
- `index.html` — 단일 페이지 학습자료 (모든 콘텐츠·실습 포함)
- 앵커(해시) 기반 섹션 이동:
  - `#intro` 서론 · 학습 로드맵
  - `#p1`, `#s1-1` ~ `#s1-7` — Part 1. LangGraph 기초
  - `#s2-1` ~ `#s2-5` — Part 2. ReAct 에이전트
  - `#s3-1` ~ `#s3-4` — Part 3. RAG 시스템
  - `#s4-1`, `#s4-2` — Part 4. 다중 에이전트
  - `#wrap` — 종합 정리 · 활용 가이드
- 파라미터 없음(순수 정적 페이지, 서버·DB 미사용)

## 파일 구조
```
index.html          메인 문서 (전체 콘텐츠 + 실습 마크업)
css/style.css       스타일 (다크 테마, 반응형, 실습 컴포넌트)
js/main.js          16개 인터랙티브 실습 로직 + 네비게이션
source/랭그래프.md   원본 학습자료 (참고용)
README.md
```

## 데이터 모델 / 저장소
- **서버·데이터베이스·외부 API를 사용하지 않는 100% 정적 사이트**
- 실습의 상태(예: thread_id별 메모리)는 브라우저 메모리(JS 변수)에만 유지되며 새로고침 시 초기화됨
- 외부 CDN 리소스: Pretendard/Inter/JetBrains Mono 폰트, Font Awesome 6.4 아이콘

## 사용 기술
- HTML5 (시맨틱 태그: `header`, `nav`, `main`, `section`, `footer`)
- CSS3 (Flexbox/Grid, CSS 변수, 반응형 미디어쿼리, 애니메이션)
- Vanilla JavaScript (외부 프레임워크 없음, IntersectionObserver 활용)

## 아직 구현되지 않은 것 / 향후 제안
- 실제 LangGraph 실행 연동 (현재 실습은 개념 설명용 프론트엔드 시뮬레이션)
- 다크/라이트 테마 토글
- 섹션별 학습 완료 체크 및 진도 저장(localStorage)
- 검색 기능 및 인쇄용 스타일시트
- 실습 내용 기반 종합 퀴즈/평가 페이지

## 배포
웹사이트를 실제로 게시하려면 상단 **Publish 탭**에서 원클릭으로 배포할 수 있음.

---
> 실습(DEMO)은 개념 이해를 돕기 위한 브라우저 내 시뮬레이션이며, 실제 LangGraph 실행 결과와 다를 수 있음.
