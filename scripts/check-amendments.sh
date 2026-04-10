#!/bin/bash
# ---------------------------------------------------------------------------
# 법령 개정 감지 + Claude Code 자동 업데이트
#
# crontab 등록 예시 (매일 오전 9시):
#   0 9 * * * /Users/turtlesoup0-macmini/Projects/itpe-law-tracker/scripts/check-amendments.sh >> /tmp/law-tracker-cron.log 2>&1
#
# 동작:
#   1. amendment-detector.py 실행 → MCP에서 12개 법령 개정이력 조회
#   2. 새 개정 감지 시 → Claude Code CLI 호출하여 자동 업데이트
#   3. 변경 없으면 → 로그만 남기고 종료
# ---------------------------------------------------------------------------

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_DIR="$SCRIPT_DIR/logs"
PROMPT_TEMPLATE="$SCRIPT_DIR/claude-update-prompt.md"

# NVM 환경 로드
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
export PATH="$HOME/.nvm/versions/node/v20.20.0/bin:$PATH"

mkdir -p "$LOG_DIR"

echo "============================================"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 법령 개정 감지 시작"
echo "============================================"

cd "$PROJECT_DIR"

# ---------------------------------------------------------------------------
# 1단계: 감지
# ---------------------------------------------------------------------------

DETECT_OUTPUT=$(python3 "$SCRIPT_DIR/amendment-detector.py" 2>&1) || true
DETECT_EXIT=$?

echo "$DETECT_OUTPUT"

if [ $DETECT_EXIT -eq 0 ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 변경 없음. 종료."
    exit 0
elif [ $DETECT_EXIT -eq 2 ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 에러 발생. 로그 확인 필요."
    exit 2
fi

# ---------------------------------------------------------------------------
# 2단계: 감지된 법령 ID 추출
# ---------------------------------------------------------------------------

DETECTED_LINE=$(echo "$DETECT_OUTPUT" | grep "^DETECTED:" | head -1)
if [ -z "$DETECTED_LINE" ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 감지 결과 파싱 실패."
    exit 2
fi

DETECTED_JSON="${DETECTED_LINE#DETECTED:}"
DETECTED_LAWS=$(echo "$DETECTED_JSON" | python3 -c "import sys,json; print(', '.join(json.load(sys.stdin)))")

echo ""
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 감지된 법령: $DETECTED_LAWS"
echo ""

# ---------------------------------------------------------------------------
# 3단계: 프롬프트 생성 + Claude Code 호출
# ---------------------------------------------------------------------------

# 프롬프트 템플릿에서 {{LAWS}} 치환
PROMPT=$(sed "s/{{LAWS}}/$DETECTED_LAWS/g" "$PROMPT_TEMPLATE")

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Claude Code 호출 시작..."

# Claude Code CLI 호출 (비대화형 모드)
# --yes: 모든 승인 자동 수락
# --max-turns: 최대 턴 수 제한 (안전장치)
claude --yes \
    --max-turns 30 \
    --print \
    -p "$PROMPT" \
    2>&1 | tee "$LOG_DIR/claude-update-$(date '+%Y%m%d-%H%M%S').log"

CLAUDE_EXIT=$?

if [ $CLAUDE_EXIT -eq 0 ]; then
    echo ""
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Claude Code 업데이트 완료."
else
    echo ""
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Claude Code 실행 실패 (exit=$CLAUDE_EXIT)."
    exit 1
fi
