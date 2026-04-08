@AGENTS.md

# 법령 데이터 추가 규칙

## LR-003: 법령 추가 시 6가지 필수 항목 완전 수집 (2026-04-08)

- [HARD] 새 법령을 추가할 때, 아래 6가지 데이터가 **모두** 수집·등록되어야 "완료"로 간주한다
- 하나라도 누락된 상태에서 커밋/배포 금지
- 반드시 `data-completeness-validator` 스킬의 체크리스트를 참조할 것

### 필수 6항목
1. **조문 전체** — `articles/{lawId}.json`, MCP `get_batch_articles`로 전체 수집
2. **hang/ho 분리** — ①②③ 포함 조문은 `hang[]` 배열 분리 필수
3. **조문별 commentary** — 삭제조문 제외 모든 활성 조문에 해설 필수 (LR-002 준수)
4. **개정이력** — `mock-data.ts` 인라인 배열, 최소 1건 (제정 or 최신 개정)
5. **3단비교** — `three-tier/{lawId}.json`, 위임조문 전체 (5건 제한 시 batch 우회)
6. **신구대조** — `compare/{lawId}.json`, 최소 1개정분 (제정법은 빈 `{}`)

### 코드 등록 (데이터 파일 생성 후)
- `law-constants.ts` — IT_LAWS 배열
- `mock-data.ts` — articles/amendments/threeTier/compare 모든 map 등록
- `hierarchy-data.ts` — baseLawHierarchy + relatedLawsMap + agencyHierarchyData

### 근거
- 2026-04-08: 지능정보화기본법+양자법 추가 시 commentary 전체 누락, 신구대조 미수집, 조문 hang 미분리 상태로 배포됨
- 동일 실수 반복 방지를 위해 체크리스트 강제화
