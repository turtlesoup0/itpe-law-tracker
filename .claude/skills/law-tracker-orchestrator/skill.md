---
name: law-tracker-orchestrator
description: "IT Law Tracker 에이전트 팀 오케스트레이터. 백엔드(MCP 연동), 프론트엔드(법령 UI), QA(정합성 검증) 3인 팀을 조율하여 5단계로 웹서비스를 구축한다. '법령 트래커 구현', 'IT법 서비스 만들어', '다음 Phase 진행' 등의 요청 시 사용."
---

# IT Law Tracker Orchestrator

Korean Law MCP 기반 IT 법령 분석 웹서비스를 에이전트 팀으로 구축하는 오케스트레이터.

## 실행 모드: 에이전트 팀

## 에이전트 구성

| 팀원 | 에이전트 타입 | 역할 | 스킬 | 주요 출력 |
|------|-------------|------|------|----------|
| backend | backend-engineer | MCP 연동, API, DB | mcp-law-client | src/lib/, src/app/api/ |
| frontend | frontend-engineer | UI 컴포넌트, 페이지 | law-ui-components | src/app/, src/components/ |
| qa | qa-inspector | 통합 정합성 검증 | qa-law-verification | _workspace/qa_report.md |

## 워크플로우

### Phase 0: 준비
1. 계획서 확인: `_workspace/00_plan.md` (= `.claude/plans/parallel-spinning-reef.md`)
2. `_workspace/` 디렉토리 생성
3. 현재 프로젝트 상태 확인 (이전 Phase 산출물 존재 여부)

### Phase 1: 기반 — 프로젝트 셋업 + MCP 연동 + 기본 페이지

**팀 구성:**
```
TeamCreate(
  team_name: "law-tracker-team",
  members: [
    {
      name: "backend",
      agent: "backend-engineer",
      model: "opus",
      prompt: "Phase 1 작업: (1) Next.js 15 프로젝트 초기화 (App Router, TypeScript, Tailwind v4, shadcn/ui), (2) src/lib/mcp/client.ts — MCP 클라이언트 싱글톤 구현, (3) src/lib/mcp/tools.ts — 핵심 MCP 도구 타입 래퍼 (search_law, get_law_text, get_law_tree, get_three_tier), (4) src/lib/utils/law-constants.ts — 7개 대상법 상수 정의 (search_law로 lawId/mst 확보), (5) src/lib/db/schema.ts — Drizzle 스키마 (laws, amendments, subscriptions). mcp-law-client 스킬을 참조하라."
    },
    {
      name: "frontend",
      agent: "frontend-engineer",
      model: "opus",
      prompt: "Phase 1 작업: backend가 프로젝트 초기화와 MCP 래퍼를 완성하면, (1) src/app/layout.tsx — 루트 레이아웃 (네비게이션, Pretendard 폰트), (2) src/app/page.tsx — 대시보드 (7개 법령 카드 목록), (3) src/app/laws/page.tsx — 법령 목록 페이지, (4) src/app/laws/[lawId]/page.tsx — 법령 상세 기본 페이지. law-ui-components 스킬을 참조하라. backend에게 API 응답 shape을 확인 후 구현 시작."
    },
    {
      name: "qa",
      agent: "qa-inspector",
      model: "opus",
      prompt: "Phase 1 QA: backend가 MCP 래퍼 완성 알림 시 즉시 (1) MCP 도구 실제 호출 → 래퍼 타입 일치 검증, (2) law-constants.ts의 7개 법령 lawId/mst 유효성 확인. frontend 완성 후 (3) 라우팅 정합성, (4) API→프론트 데이터 흐름 검증. qa-law-verification 스킬을 참조하라."
    }
  ]
)
```

**작업 등록:**
```
TaskCreate(tasks: [
  { title: "프로젝트 초기화", assignee: "backend", description: "Next.js 15 + Tailwind + shadcn 셋업" },
  { title: "MCP 클라이언트 래퍼", assignee: "backend", description: "client.ts + tools.ts 구현" },
  { title: "법령 상수 부트스트랩", assignee: "backend", description: "7개 법령 lawId/mst 확보", depends_on: ["MCP 클라이언트 래퍼"] },
  { title: "DB 스키마", assignee: "backend", description: "Drizzle 스키마 정의" },
  { title: "루트 레이아웃 + 대시보드", assignee: "frontend", depends_on: ["프로젝트 초기화"] },
  { title: "법령 목록/상세 페이지", assignee: "frontend", depends_on: ["MCP 클라이언트 래퍼"] },
  { title: "MCP 래퍼 타입 검증", assignee: "qa", depends_on: ["MCP 클라이언트 래퍼"] },
  { title: "Phase 1 통합 검증", assignee: "qa", depends_on: ["법령 목록/상세 페이지"] }
])
```

**팀원 간 통신:**
- backend → frontend: 프로젝트 초기화 완료 알림, MCP 래퍼 타입 정의 공유
- backend → qa: MCP 래퍼 완성 알림
- frontend → qa: 페이지 완성 알림
- qa → backend/frontend: 경계면 불일치 발견 시 즉시 수정 요청

### Phase 2: 핵심 뷰 — 계층뷰 + 조문탐색기 + AI 검색

이전 팀 유지 (팀 재구성 불필요).

**추가 작업 등록:**
```
TaskCreate(tasks: [
  { title: "계층 그래프 API", assignee: "backend", description: "chain_law_system + get_three_tier + get_law_tree 래퍼 및 API route" },
  { title: "조문 탐색 API", assignee: "backend", description: "get_article_detail + get_article_with_precedents + get_related_laws 래퍼" },
  { title: "AI 검색 API", assignee: "backend", description: "search_ai_law + suggest_law_names 래퍼" },
  { title: "React Flow 계층 그래프", assignee: "frontend", depends_on: ["계층 그래프 API"] },
  { title: "3단 위임조문 비교 뷰", assignee: "frontend", depends_on: ["계층 그래프 API"] },
  { title: "조문 탐색기 UI", assignee: "frontend", depends_on: ["조문 탐색 API"] },
  { title: "AI 검색 페이지", assignee: "frontend", depends_on: ["AI 검색 API"] },
  { title: "Phase 2 경계면 검증", assignee: "qa", depends_on: ["React Flow 계층 그래프", "조문 탐색기 UI"] }
])
```

### Phase 3: 개정 추적 — 타임라인 + 비교 + 알림

```
TaskCreate(tasks: [
  { title: "개정 추적 API", assignee: "backend", description: "chain_amendment_track + compare_old_new + get_article_history 래퍼" },
  { title: "Cron 개정 감지", assignee: "backend", description: "/api/cron/check-amendments + 알림 발송" },
  { title: "개정 타임라인 UI", assignee: "frontend", depends_on: ["개정 추적 API"] },
  { title: "diff2html 비교 뷰어", assignee: "frontend", depends_on: ["개정 추적 API"] },
  { title: "알림 구독 UI", assignee: "frontend" },
  { title: "Phase 3 경계면 검증", assignee: "qa", depends_on: ["diff2html 비교 뷰어", "Cron 개정 감지"] }
])
```

### Phase 4: AI 해설 — 요약 + 문서분석 + 고시 + 별표

```
TaskCreate(tasks: [
  { title: "LLM 해설 API", assignee: "backend", description: "Claude API 연동, 조문 해설 생성 + 캐시" },
  { title: "고시/행정규칙 API", assignee: "backend", description: "search_admin_rule + get_admin_rule 래퍼" },
  { title: "별표/서식 API", assignee: "backend", description: "get_annexes 래퍼" },
  { title: "문서 분석 API", assignee: "backend", description: "analyze_document 래퍼" },
  { title: "AI 해설 토글 패널", assignee: "frontend", depends_on: ["LLM 해설 API"] },
  { title: "고시 통합 탐색 UI", assignee: "frontend", depends_on: ["고시/행정규칙 API"] },
  { title: "별표/서식 뷰어", assignee: "frontend", depends_on: ["별표/서식 API"] },
  { title: "문서 분석 페이지", assignee: "frontend", depends_on: ["문서 분석 API"] },
  { title: "Phase 4 통합 검증", assignee: "qa", depends_on: ["문서 분석 페이지", "고시 통합 탐색 UI"] }
])
```

### Phase 5: 마무리 — 모바일 + 다크모드 + 성능 + 배포

```
TaskCreate(tasks: [
  { title: "반응형 모바일 UI", assignee: "frontend", description: "모든 페이지 모바일 최적화" },
  { title: "다크모드", assignee: "frontend", description: "Tailwind dark: 변수 + 토글" },
  { title: "성능 최적화", assignee: "backend", description: "RSC 스트리밍, Suspense, 캐시 최적화" },
  { title: "전체 통합 테스트", assignee: "qa", depends_on: ["반응형 모바일 UI", "성능 최적화"] },
  { title: "배포 설정", assignee: "backend", description: "Vercel 배포 + Cron 설정 + 환경변수" }
])
```

### 각 Phase 완료 후
1. qa의 검증 리포트 확인 (`_workspace/{phase}_qa_report.md`)
2. 블로커 발견 시 해당 에이전트에게 수정 지시
3. 모든 항목 통과 후 다음 Phase 진행
4. 사용자에게 Phase 완료 요약 보고

### 최종 정리
1. 팀원들에게 종료 요청
2. TeamDelete
3. `_workspace/` 보존
4. 최종 결과 요약 보고

## 데이터 흐름

```
[리더] → TeamCreate → [backend] ←SendMessage→ [frontend]
                          │                       │
                          ↓                       ↓
                    src/lib/mcp/             src/app/
                    src/app/api/             src/components/
                          │                       │
                          └──── [qa] 교차 검증 ────┘
                                    │
                                    ↓
                          _workspace/qa_report.md
```

## 에러 핸들링

| 상황 | 전략 |
|------|------|
| MCP 서버 응답 없음 | backend가 리더에게 보고 → 사용자에게 MCP 서버 상태 확인 요청 |
| 팀원 1명 중지 | SendMessage로 상태 확인 → 재시작 시도 → 실패 시 리더가 대체 수행 |
| QA에서 블로커 발견 | 해당 팀원에게 즉시 수정 요청 → 수정 후 재검증 |
| Phase 간 산출물 누락 | 이전 Phase 재실행 또는 수동 보완 |

## 테스트 시나리오

### 정상 흐름
1. 사용자가 "Phase 1 시작" 요청
2. 팀 구성 (3명 + Phase 1 작업 8개)
3. backend: 프로젝트 초기화 → MCP 래퍼 → 법령 상수 → DB 스키마
4. frontend: 레이아웃 → 대시보드 → 법령 목록/상세
5. qa: MCP 래퍼 검증 → 통합 검증
6. Phase 1 완료 보고
7. 예상 결과: Next.js 앱이 실행되고, 7개 법령 목록이 MCP에서 로드되어 표시

### 에러 흐름
1. Phase 1에서 MCP search_law 호출 실패
2. backend가 리더에게 보고
3. 리더가 사용자에게 MCP 서버 상태 확인 요청
4. MCP 서버 복구 후 backend가 재시도
5. 래퍼 타입은 하드코딩된 테스트 데이터로 우선 구현
6. MCP 복구 후 실제 데이터로 전환
