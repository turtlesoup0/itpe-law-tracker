---
name: qa-law-verification
description: "IT Law Tracker 프로젝트의 QA 검증 스킬. MCP 응답↔API 래퍼 타입, API↔프론트엔드 경계면, 라우팅 정합성, 데이터 흐름을 교차 비교로 검증한다. 코드 검증, 테스트, QA, 정합성 확인 시 사용."
---

# QA Law Verification — IT Law Tracker 검증 스킬

IT Law Tracker 프로젝트에 특화된 통합 정합성 검증 절차.

## 검증 영역

### 1. MCP 도구 응답 ↔ TypeScript 타입 정합성

MCP 도구의 실제 응답 구조가 `src/lib/mcp/tools.ts`의 타입 정의와 일치하는지 검증.

```
검증 단계:
1. src/lib/mcp/tools.ts에서 각 도구의 반환 타입 추출
2. 해당 MCP 도구를 실제 호출하여 응답 shape 확인
3. 타입 정의와 실제 응답의 필드명, 중첩 구조, 옵셔널 여부 비교
4. 특히 주의:
   - search_law 결과의 lawId/mst 필드명과 타입
   - get_law_text의 조문 배열 구조
   - chain_law_system의 중첩된 법령 계층 구조
   - compare_old_new의 신구 대조 데이터 형식
```

### 2. API Route ↔ 프론트엔드 경계면

```
검증 단계:
1. src/app/api/ 하위 route.ts에서 NextResponse.json()에 전달하는 객체 shape 추출
2. 해당 API를 호출하는 페이지/컴포넌트에서 데이터 사용 방식 확인
3. shape 비교 — 특히:
   - 배열 vs 래핑 객체 ({items: [...]} vs [...])
   - 필드명 일치 (camelCase 일관성)
   - 옵셔널 필드의 null/undefined 처리
```

### 3. 법령 데이터 흐름 추적

IT Law Tracker의 핵심 데이터 흐름:

```
MCP 도구 → lib/mcp/tools.ts (래퍼) → API route / Server Action → 페이지 컴포넌트 → UI

검증 포인트:
[MCP] lawId/mst → [래퍼] LawIdentifier → [API] { law: {...} } → [UI] law.name 표시
[MCP] articles[] → [래퍼] Article[] → [API] { articles } → [UI] 조문 목록 렌더링
[MCP] threeTier → [래퍼] ThreeTierData → [API] { tiers } → [UI] React Flow 노드
```

### 4. 라우팅 정합성

```
예상 라우트 구조:
/                              → src/app/page.tsx (대시보드)
/laws                          → src/app/laws/page.tsx
/laws/[lawId]                  → src/app/laws/[lawId]/page.tsx
/laws/[lawId]/articles/[jo]    → src/app/laws/[lawId]/articles/[jo]/page.tsx
/laws/[lawId]/amendments       → src/app/laws/[lawId]/amendments/page.tsx
/search                        → src/app/search/page.tsx
/compare                       → src/app/compare/page.tsx
/analyze                       → src/app/analyze/page.tsx

검증: 모든 Link/href가 위 라우트에 매핑되는지 확인
```

### 5. 캐시 키 일관성

```
검증:
1. lib/mcp/tools.ts에서 캐시 키 생성 패턴 추출
2. 동일 데이터에 대해 서로 다른 캐시 키가 생성되지 않는지 확인
3. TTL이 CACHE_TTL 상수에 정의된 값과 일치하는지 확인
```

## 검증 리포트 형식

```markdown
# QA 검증 리포트 — Phase {N}

## 요약
- 총 검증 항목: {N}
- 통과: {N} | 실패: {N} | 미검증: {N}
- 블로커: {있음/없음}

## 실패 항목

### [실패-1] API 응답 shape 불일치
- 위치: src/app/api/laws/[lawId]/route.ts:25
- 예상: { articles: Article[] }
- 실제: { data: { articles: Article[] } }
- 영향: 프론트엔드에서 articles 접근 시 undefined
- 수정: route.ts에서 래핑 제거, 또는 프론트에서 .data 추가

## 통과 항목
- [통과-1] search_law 응답 타입 일치
- [통과-2] 라우팅 경로 매핑 정상
...
```

## 점진적 검증 타이밍

| 시점 | 검증 범위 |
|------|----------|
| MCP 래퍼 완성 후 | MCP 응답 ↔ 래퍼 타입 |
| API route 완성 후 | 래퍼 → API 응답 shape |
| 페이지 완성 후 | API → 프론트 경계면 + 라우팅 |
| Phase 완료 시 | 전체 데이터 흐름 + 캐시 일관성 |
