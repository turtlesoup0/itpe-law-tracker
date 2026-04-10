# 법령 개정 자동 업데이트 프롬프트

이 프롬프트는 amendment-detector.py가 새 개정을 감지했을 때,
check-amendments.sh가 Claude Code CLI에 전달하는 작업 지시서입니다.

---

다음 법령에서 새 개정이 감지되었습니다: {{LAWS}}

## 작업 지시

각 법령에 대해 아래 순서로 데이터를 업데이트하세요.
data-completeness-validator 스킬의 체크리스트를 반드시 준수하세요.

### 1단계: 신구대조 업데이트
- MCP `compare_old_new(mst)` 호출
- `src/lib/data/compare/{lawId}.json`에 새 개정분 추가
- 기존 데이터는 유지하고 새 entry만 append

### 2단계: 조문 업데이트
- MCP `get_batch_articles(mst)` 호출하여 전체 조문 재수집
- 기존 commentary는 보존 (변경된 조문만 commentary 재생성)
- hang/ho 분리 확인, "다음 각 목" 포함 시 mok[] 교차검증 (LR-004)
- hang.number는 숫자 문자열 형식 ("1", "2")

### 3단계: 3단비교 갱신
- MCP `get_three_tier(mst)` + "대통령령으로 정한다" 패턴 스캔
- `src/lib/data/three-tier/{lawId}.json` 갱신

### 4단계: 개정이력 추가
- `src/lib/mcp/mock-data.ts`의 amendments 배열에 새 개정 항목 추가

### 5단계: 검증
- 전체 빌드 (`npx next build`) 통과 확인
- "다음 각 목" 패턴 스캔으로 mok 누락 0건 확인

### 6단계: 커밋 및 배포
- 커밋 메시지: `fix: {법령명} {개정유형} 반영 ({개정일})`
- `git push origin main`
- `npx vercel --prod`

## 주의사항
- LR-002: MCP로 검증되지 않은 데이터 생성 금지
- LR-003: 6가지 필수 항목 완전 수집 후 커밋
- LR-004: "다음 각 목" → mok[] 필수
- 3파일 제한: Sub-task 분할 필요 시 자체 판단
