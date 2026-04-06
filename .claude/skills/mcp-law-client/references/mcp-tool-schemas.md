# Korean Law MCP — 도구 스키마 상세

## 목차
1. [법령 검색/조회](#법령-검색조회)
2. [법령 구조/계층](#법령-구조계층)
3. [조문 상세](#조문-상세)
4. [개정/비교](#개정비교)
5. [AI 검색](#ai-검색)
6. [행정규칙/고시](#행정규칙고시)
7. [별표/서식](#별표서식)
8. [판례](#판례)
9. [문서 분석](#문서-분석)
10. [체인 도구](#체인-도구)
11. [용어](#용어)

---

## 법령 검색/조회

### search_law
법률명 키워드 검색. lawId와 mst 식별자 확보용.
- `query` (string, 필수): 검색할 법률명
- `display` (number, 필수, 기본 20): 최대 결과 수
- `apiKey` (string, 선택): 법제처 Open API 키

### get_law_text
조문 전문 조회. mst 또는 lawId 필수.
- `mst` (string, 선택): 법률일련번호
- `lawId` (string, 선택): 법률ID
- `jo` (string, 선택): 조문번호 (예: '제38조' 또는 '003800')
- `efYd` (string, 선택): 시행일자 (YYYYMMDD)
- `apiKey` (string, 선택)

### get_related_laws
용어 관련 법령 목록.
- `display` (number, 필수, 기본 20, 최대 100)
- `lawId` (string, 선택)
- `lawName` (string, 선택)
- `apiKey` (string, 선택)

---

## 법령 구조/계층

### get_law_tree
법령 목차 구조 (편/장/절).
- `mst` (string, 선택)
- `lawId` (string, 선택)
- `apiKey` (string, 선택)

### get_three_tier
3단비교 (법률-시행령-시행규칙) 위임/인용 조문.
- `knd` (string, 필수, 기본 "2"): "1"=인용조문, "2"=위임조문
- `mst` (string, 선택)
- `lawId` (string, 선택)
- `apiKey` (string, 선택)

### get_delegated_laws
위임법령 목록. 소관부처별.
- `query` (string, 필수): 부처명
- `display` (number, 필수, 기본 20, 최대 100)
- `page` (number, 필수, 기본 1)
- `apiKey` (string, 선택)

---

## 조문 상세

### get_article_detail
조문호명 단위 정밀 조회. 항/호/목 지정 가능.
- `jo` (string, 필수): 조문번호
- `mst` (string, 선택)
- `lawId` (string, 선택)
- `hang` (string, 선택): 항 번호
- `ho` (string, 선택): 호 번호
- `mok` (string, 선택): 목 번호
- `apiKey` (string, 선택)

### get_article_with_precedents
조문 + 관련 판례 동시 조회.
- `jo` (string, 필수)
- `includePrecedents` (boolean, 기본 true)
- `mst` (string, 선택)
- `lawId` (string, 선택)
- `efYd` (string, 선택)
- `apiKey` (string, 선택)

---

## 개정/비교

### compare_old_new
신구법 대조표.
- `mst` (string, 선택)
- `lawId` (string, 선택)
- `ln` (string, 선택): 공포번호
- `ld` (string, 선택): 공포일자 (YYYYMMDD)
- `apiKey` (string, 선택)

### compare_articles
두 법령 조문 비교.
- `law1` (object, 필수): { jo, mst?, lawId? }
- `law2` (object, 필수): { jo, mst?, lawId? }
- `apiKey` (string, 선택)

### compare_admin_rule_old_new
행정규칙 신구 대조표.
- (스키마 확인 필요 — discover_tools로 조회)

### get_article_history
조문별 개정 이력.
- `jo` (string, 선택)
- `lawName` (string, 선택)
- `lawId` (string, 선택)
- `mst` (string, 선택)
- `regDt` (string, 선택): YYYYMMDD
- `fromRegDt` (string, 선택)
- `toRegDt` (string, 선택)
- `org` (string, 선택): 소관부처코드
- `page` (number, 기본 1)
- `apiKey` (string, 선택)

### get_law_history
법률 변경이력 목록.
- `regDt` (string, 필수): YYYYMMDD
- `display` (number, 필수, 기본 20, 최대 100)
- `page` (number, 필수, 기본 1)
- `org` (string, 선택)
- `apiKey` (string, 선택)

---

## AI 검색

### search_ai_law
자연어 의미 검색.
- `query` (string, 필수): 자연어 질문
- `search` (string, 기본 "0"): "0"=법률조문, "1"=법률 별표, "2"=행정규칙 조문, "3"=행정규칙 별표
- `display` (number, 필수, 기본 20, 최대 100)
- `page` (number, 필수, 기본 1)
- `lawTypes` (string[], 선택): 법령종류 필터 (예: ['법률', '대통령령'])
- `apiKey` (string, 선택)

### suggest_law_names
법령명 자동완성.
- (스키마 확인 필요)

---

## 행정규칙/고시

### search_admin_rule
훈령/예규/고시/지침 검색.
- `query` (string, 필수)
- `display` (number, 필수)
- `knd` (string, 선택): "1"=훈령, "2"=예규, "3"=고시, "4"=공고, "5"=일반
- `apiKey` (string, 선택)

### get_admin_rule
행정규칙 전문 조회.
- `id` (string, 필수): 행정규칙ID
- `apiKey` (string, 선택)

---

## 별표/서식

### get_annexes
별표/서식 조회.
- `lawName` (string, 필수)
- `annexNo` (string, 선택): 별표번호
- `bylSeq` (string, 선택): 별표번호 (코드)
- `knd` (string, 선택): "1"=별표, "2"=서식, "3"=부충별표, "4"=부충서식, "5"=전체
- `apiKey` (string, 선택)

---

## 판례

### summarize_precedent
판례 요약 생성.
- `id` (string, 필수): 판례일련번호
- `maxLength` (number, 기본 500)
- `apiKey` (string, 선택)

---

## 문서 분석

### analyze_document
계약서/약관 법적 리스크 분석.
- `text` (string, 필수): 분석할 문서 텍스트
- `maxClauses` (number, 기본 15, 최소 1, 최대 30)
- `apiKey` (string, 선택)

---

## 체인 도구

### chain_law_system
법령 구조/계층 자동 연쇄 분석. 법률→시행령→시행규칙→별표.
- `query` (string, 필수): 법령명 또는 키워드
- `articles` (string[], 선택): 조회할 조문번호
- `apiKey` (string, 선택)

### chain_amendment_track
법령 개정/변경/연혁 자동 연쇄. 신구대조 + 조문이력.
- `query` (string, 필수): 법령명
- `mst` (string, 선택)
- `lawId` (string, 선택)
- `apiKey` (string, 선택)

---

## 용어

### get_legal_to_daily
법률용어 → 일상용어 변환.
- (스키마 확인 필요 — discover_tools로 조회)

### get_daily_to_legal
일상용어 → 법률용어 변환.
- (스키마 확인 필요)
