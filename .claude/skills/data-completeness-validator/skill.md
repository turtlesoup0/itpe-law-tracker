---
name: data-completeness-validator
description: "IT Law Tracker 데이터 완전성 검증 스킬. 10개 법률의 조문·신구대조·3단비교 JSON을 자동 검사하여 누락 필드, hang 미분리, commentary 부재를 리포트한다. 데이터 수집 후, 품질 확인 시, '검증해줘' 요청 시 사용."
---

# Data Completeness Validator — IT Law Tracker

데이터 수집 후 자동으로 실행하여 완전성을 점수화하고 누락 항목을 식별하는 검증 스킬.

## 실행 방법

```bash
npx tsx scripts/validate-data-completeness.ts
```

## 검증 항목 (5대 축)

### 1. 조문 데이터 (articles/*.json) — 20점
- 모든 조문에 content가 존재하는가
- 삭제된 조문(status: "삭제")은 제외하고 카운트

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

### 5. 3단비교 (three-tier/*.json) — 15점
- 파일 존재 + rows > 0 = 15점

## 점수 기준

| 점수 | 등급 | 의미 |
|------|------|------|
| 80+ | 🟢 | 데이터 충분, 서비스 가능 |
| 50-79 | 🟡 | 일부 누락, 보충 필요 |
| 0-49 | 🔴 | 심각한 누락, 서비스 불가 |

## 우선순위 규칙

1. **P0** — commentary 전체 누락: 사용자가 가장 먼저 체감하는 품질 문제
2. **P1** — hang 분리 누락: 조문 구조 정확성 문제
3. **P2** — commentary 부족 (<50%): 부분적 품질 문제
4. **P3** — 3단비교 미수집: 부가 기능 데이터

## 사용 시점

- 데이터 수집 에이전트 작업 완료 직후
- 사용자가 "검증해줘", "데이터 확인" 요청 시
- 배포 전 품질 게이트로 활용

## Commentary 생성 가이드

commentary가 누락된 법률에 대해 보충할 때:

1. MCP `get_batch_articles`로 조문 원문 조회
2. 조문 내용을 기반으로 LLM에게 해설 생성 요청
3. 생성된 해설 앞에 `[AI 생성]` 태그 부착
4. 절대 MCP 검증 없이 추측성 해설을 작성하지 않음 (LR-002)
