---
name: mcp-law-client
description: "Korean Law MCP 서버와 연동하는 타입 안전한 클라이언트 구현 스킬. MCP 도구 호출 패턴, 응답 타입 매핑, Redis TTL 캐싱, 에러 핸들링을 포함. 법령 API, MCP 클라이언트, 법제처 데이터 연동 작업 시 반드시 사용."
---

# MCP Law Client — Korean Law MCP 연동 스킬

Korean Law MCP 서버의 도구들을 Next.js Server Action / API Route에서 타입 안전하게 호출하기 위한 클라이언트 구현 가이드.

## 대상 법령 (7개)

| 법령명 | 약칭 | 카테고리 |
|--------|------|----------|
| 정보통신망 이용촉진 및 정보보호 등에 관한 법률 | 정보통신망법 | 정보보호 |
| 개인정보 보호법 | 개인정보보호법 | 정보보호 |
| 소프트웨어 진흥법 | SW진흥법 | 산업진흥 |
| 인공지능 산업 육성 및 신뢰 기반 조성 등에 관한 법률 | AI기본법 | 산업진흥 |
| 클라우드컴퓨팅 발전 및 이용자 보호에 관한 법률 | 클라우드발전법 | 산업진흥 |
| 전자정부법 | 전자정부법 | 전자정부 |
| 국가를 당사자로 하는 계약에 관한 법률 | 국가계약법 | 계약 |

## MCP 도구 호출 패턴

### 1단계: 법령 식별자 확보
모든 법령 조회의 시작점. `search_law`로 lawId와 mst를 확보한다.

```typescript
// 패턴: search_law → lawId/mst 확보
const result = await mcpCall('search_law', { query: '개인정보보호법', display: 5 });
// result에서 lawId, mst 추출 → 이후 도구 호출에 사용
```

### 2단계: 도구별 호출 패턴

| 기능 | 도구 | 필수 파라미터 | 선택 파라미터 |
|------|------|-------------|-------------|
| 법령 전문 | `get_law_text` | mst 또는 lawId | jo(조문번호), efYd(시행일) |
| 목차 구조 | `get_law_tree` | mst 또는 lawId | — |
| 3단 비교 | `get_three_tier` | mst 또는 lawId, knd("2"=위임) | — |
| 법령 체계 | `chain_law_system` | query | articles |
| 조문 상세 | `get_article_detail` | jo | mst/lawId, hang, ho, mok |
| 조문+판례 | `get_article_with_precedents` | jo | mst/lawId, includePrecedents |
| 관련 법령 | `get_related_laws` | display | lawId 또는 lawName |
| 신구대조 | `compare_old_new` | mst 또는 lawId | ln, ld |
| 개정 추적 | `chain_amendment_track` | query | mst, lawId |
| 조문 이력 | `get_article_history` | — | jo, lawName/lawId, fromRegDt, toRegDt |
| 변경 이력 | `get_law_history` | regDt | display, page, org |
| AI 검색 | `search_ai_law` | query | search(0-3), display, page, lawTypes |
| 고시 검색 | `search_admin_rule` | query, display | knd(1=훈령,2=예규,3=고시) |
| 고시 전문 | `get_admin_rule` | id | — |
| 별표/서식 | `get_annexes` | lawName | annexNo, bylSeq, knd(1=별표,2=서식) |
| 문서 분석 | `analyze_document` | text | maxClauses(기본15) |
| 판례 요약 | `summarize_precedent` | id | maxLength |
| 조문 비교 | `compare_articles` | law1{jo,mst/lawId}, law2{jo,mst/lawId} | — |
| 용어 변환 | `get_legal_to_daily` | — | (도구 스키마 확인 필요) |

## 캐싱 전략

Redis TTL을 데이터 특성에 따라 차등 적용한다:

```typescript
const CACHE_TTL = {
  LAW_IDENTIFIERS: 7 * 24 * 60 * 60,    // 7일 — lawId/mst는 거의 변동 없음
  LAW_TEXT: 24 * 60 * 60,                // 24시간 — 개정 시 갱신 필요
  LAW_TREE: 24 * 60 * 60,               // 24시간
  THREE_TIER: 24 * 60 * 60,             // 24시간
  AI_SEARCH: 60 * 60,                   // 1시간 — 동적 결과
  COMPARE_OLD_NEW: 30 * 24 * 60 * 60,   // 30일 — 과거 이력은 불변
  LLM_SUMMARY: 7 * 24 * 60 * 60,        // 7일 — 버전 키로 구분
  ADMIN_RULE: 24 * 60 * 60,             // 24시간
  ANNEXES: 7 * 24 * 60 * 60,            // 7일
} as const;
```

캐시 키 패턴: `law:{tool}:{params_hash}` (예: `law:get_law_text:abc123`)

## 에러 핸들링

```typescript
// MCP 호출 에러 처리 패턴
try {
  const result = await mcpCall(tool, params);
  await cacheSet(cacheKey, result, ttl);
  return result;
} catch (error) {
  // 1차: 캐시 폴백
  const cached = await cacheGet(cacheKey);
  if (cached) return { ...cached, _stale: true };
  // 2차: 에러 전파
  throw new McpError(tool, error);
}
```

## 개정 감지 Cron 패턴

일일 Cron (`/api/cron/check-amendments`)에서 사용하는 패턴:

```
1. get_law_history(regDt: today) 호출
2. 결과에서 7개 대상 법령 필터링
3. 변경 감지 시 DB amendments 테이블에 저장
4. 시행일(enforcementDate) 기준 90/60/30/7일 전 → 구독자 알림 발송
```

## 참고
- MCP 도구 상세 스키마: `references/mcp-tool-schemas.md`
