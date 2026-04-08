---
name: data-completeness-validator
description: "IT Law Tracker 법령 데이터 추가 필수 체크리스트 + 완전성 검증. 새 법령 추가 시 반드시 이 스킬을 참조하여 6가지 필수 항목을 모두 수집해야 한다. 데이터 수집 후 품질 검증도 이 스킬로 수행."
---

# Data Completeness Validator — IT Law Tracker

## [HARD] 법령 추가 필수 체크리스트

**새 법령을 추가하거나 기존 법령 데이터를 보충할 때, 아래 6가지 항목이 모두 완료되어야 "법령 추가 완료"로 간주한다. 하나라도 누락된 상태에서 커밋/배포하지 않는다.**

### 필수 6항목

| # | 항목 | 파일 | MCP 도구 | 완료 기준 |
|---|------|------|----------|----------|
| 1 | **조문 전체 수집** | `src/lib/data/articles/{lawId}.json` | `get_batch_articles(mst)` 30건씩 전체 | 모든 조문(제1조~마지막조) 포함. 삭제조문은 `{"jo":"제N조","title":"삭제","content":"삭제"}` |
| 2 | **hang/ho 분리** | 위 동일 파일 | `get_article_detail(mst, jo)` | content에 ①②③ 있는 조문은 반드시 `hang[]` 배열 분리. ho도 `ho[]` 배열로 분리 |
| 3 | **조문별 commentary** | 위 동일 파일 | LLM 생성 (조문 원문 기반) | 삭제조문 제외 모든 활성 조문에 commentary 필드 존재. `[AI 생성]` 태그 포함. LR-002: MCP 미검증 허위 내용 금지 |
| 4 | **개정이력** | `src/lib/mcp/mock-data.ts` 인라인 배열 | `search_law(query)` + `get_law_text(mst)` 부칙 파싱 | 최소 1건 (제정 or 최신 개정). date, type, summary, enforcementDate 필수 |
| 5 | **3단비교 (위임조문)** | `src/lib/data/three-tier/{lawId}.json` | `get_three_tier(mst, knd="2")` + batch 우회 | 위임조문 전체 수집. MCP가 5건만 반환 시 → `get_batch_articles`로 "대통령령으로 정한다" 패턴 매칭하여 보충 |
| 6 | **신구대조** | `src/lib/data/compare/{lawId}.json` | `compare_old_new(mst)` 또는 `chain_amendment_track(query)` | 최소 1개정분. 제정법률은 신구대조 없을 수 있음 → 그 경우 빈 객체 `{}` 파일 생성 |

### 등록 필수 (코드 연결)

위 데이터 파일을 생성한 후, 반드시 코드에 등록해야 한다:

| 항목 | 등록 위치 | 등록 방법 |
|------|----------|----------|
| 법령 상수 | `src/lib/utils/law-constants.ts` | `IT_LAWS` 배열에 id, lawId, mst, name, shortName, category, description, color 추가 |
| 조문 import | `src/lib/mcp/mock-data.ts` | `require()` + `articlesMap` 등록 |
| 개정이력 | `src/lib/mcp/mock-data.ts` | 인라인 배열 + `amendmentsMap` 등록 |
| 3단비교 import | `src/lib/mcp/mock-data.ts` | `require()` + `threeTierMap` 등록 |
| 신구대조 import | `src/lib/mcp/mock-data.ts` | `require()` + `compareMap` 등록 |
| 법령 계층 | `src/lib/data/hierarchy-data.ts` | `baseLawHierarchy` (법률→시행령→시행규칙), `relatedLawsMap`, `agencyHierarchyData` |

### 작업 순서 (권장)

```
1. search_law → lawId, mst 확보
2. get_batch_articles → 조문 전체 수집 + hang/ho 분리
3. 조문별 commentary 생성 (LLM, 원문 기반)
4. get_three_tier + batch 우회 → 3단비교
5. compare_old_new → 신구대조
6. 개정이력 수집 (search_law + 부칙 파싱)
7. hierarchy-data.ts 계층/연관법/기관 추가
8. mock-data.ts에 전체 등록
9. law-constants.ts에 법령 상수 추가
10. 빌드 검증 → data-completeness-validator 실행
```

### 서브태스크 분할 가이드 (CLAUDE.md Rule 2: 3파일 제한)

법령 1개 추가는 보통 5~7개 파일을 변경하므로, 다음과 같이 2~3개 서브태스크로 분할:

- **Sub-task A**: 조문 JSON + commentary + law-constants.ts + mock-data.ts 조문등록 (3파일)
- **Sub-task B**: 3단비교 JSON + 신구대조 JSON + mock-data.ts 나머지 등록 (3파일)
- **Sub-task C**: hierarchy-data.ts 계층/연관법/기관 (1파일)

---

## 트리거 조건

이 스킬은 다음 상황에서 **반드시** 참조/실행된다:

1. 사용자가 "법령 추가", "법 추가", "새 법률 등록" 등을 요청할 때 → 체크리스트로 활용
2. 데이터 수집 작업이 완료된 직후 → 검증으로 활용
3. 사용자가 "검증해줘", "데이터 확인" 요청 시
4. 커밋/배포 직전 → 품질 게이트로 활용

---

## 대상 법령 (12개)

| # | ID | 약칭 | MST | 카테고리 |
|---|---|---|---|---|
| 1 | info-comm | 정보통신망법 | 277377 | 정보보호 |
| 2 | privacy | 개인정보보호법 | — | 정보보호 |
| 3 | sw-promotion | SW진흥법 | — | 산업진흥 |
| 4 | ai-basic | AI기본법 | — | 산업진흥 |
| 5 | cloud | 클라우드발전법 | — | 산업진흥 |
| 6 | e-gov | 전자정부법 | — | 전자정부 |
| 7 | nat-contract | 국가계약법 | — | 계약 |
| 8 | credit-info | 신용정보법 | — | 정보보호 |
| 9 | public-data | 공공데이터법 | — | 전자정부 |
| 10 | data-industry | 데이터산업법 | — | 산업진흥 |
| 11 | intelligent-info | 지능정보화기본법 | 268535 | 전자정부 |
| 12 | quantum | 양자법 | 258511 | 산업진흥 |

---

## 검증 점수 (5대 축, 100점 만점)

### 1. 조문 데이터 (articles/*.json) — 20점
- 모든 조문에 content가 존재하는가
- 삭제된 조문(title: "삭제")은 제외하고 카운트

### 2. hang 분리 완전성 — 20점
- content에 ①②③ 등 원문자가 포함된 조문은 반드시 `hang[]` 배열로 분리되어야 함
- 미분리 조문이 있으면 조문번호 목록과 함께 경고

### 3. commentary 커버리지 — 30점 (최대 가중치)
- 활성 조문 대비 commentary 존재 비율
- 100% = 30점, 50% = 15점, 0% = 0점
- **LR-002 준수**: MCP/LLM으로 검증되지 않은 허위 commentary 생성 금지
- commentary 생성 시 반드시 `[AI 생성]` 태그 포함

### 4. 신구대조 (compare/*.json) — 15점
- 파일 존재 + entry가 1개 이상 = 10점
- 모든 entry에 items[]가 비어있지 않으면 +5점
- 제정법률(신구대조 불가)은 빈 파일 `{}` 존재 시 10점

### 5. 3단비교 (three-tier/*.json) — 15점
- 파일 존재 + rows > 0 = 15점
- MCP가 5건만 반환하는 제한은 알려진 이슈 → batch 우회로 보충했는지 확인

## 점수 기준

| 점수 | 등급 | 의미 |
|------|------|------|
| 80+ | PASS | 데이터 충분, 커밋/배포 가능 |
| 50-79 | WARN | 일부 누락, 보충 후 커밋 |
| 0-49 | FAIL | 심각한 누락, 커밋 금지 |

## 우선순위 규칙

1. **P0** — commentary 전체 누락: 사용자가 가장 먼저 체감하는 품질 문제
2. **P0** — 신구대조 미수집: 핵심 비교 기능 불가
3. **P1** — hang 분리 누락: 조문 구조 정확성 문제
4. **P2** — 3단비교 5건 미만: 위임조문 batch 우회 미수행
5. **P3** — commentary 부족 (<50%): 부분적 품질 문제

## Commentary 생성 가이드

commentary가 누락된 법률에 대해 보충할 때:

1. MCP `get_batch_articles`로 조문 원문 조회
2. 조문 내용을 기반으로 LLM에게 해설 생성 요청
3. 생성된 해설 앞에 `[AI 생성]` 태그 부착
4. 절대 MCP 검증 없이 추측성 해설을 작성하지 않음 (LR-002)
5. 해설은 비법률 전공자가 이해할 수 있는 수준으로 작성
6. "이 조항은 ~에 대해 규정합니다" 같은 의미없는 반복 금지 → 구체적 의의/영향/적용사례 포함
