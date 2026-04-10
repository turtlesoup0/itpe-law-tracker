#!/usr/bin/env python3
"""
법령 개정 감지 스크립트 (경량)
- MCP 서버에 12개 법령의 개정이력을 조회
- 로컬 compare JSON의 최신 개정일과 비교
- 새 개정이 감지되면 법령 ID와 상세 정보를 stdout으로 출력
- 종료코드: 0=변경없음, 1=새 개정 감지, 2=에러
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path

import urllib.request

# ---------------------------------------------------------------------------
# 설정
# ---------------------------------------------------------------------------

MCP_BASE = os.environ.get("MCP_BASE_URL", "https://korean-law-mcp.fly.dev")
MCP_API_KEY = os.environ.get("MCP_API_KEY", "itpe_law_follower")

PROJECT_ROOT = Path(__file__).resolve().parent.parent
COMPARE_DIR = PROJECT_ROOT / "src" / "lib" / "data" / "compare"
LOG_DIR = PROJECT_ROOT / "scripts" / "logs"

# 12개 법령 (law-constants.ts 동기)
LAWS = [
    {"id": "info-comm", "mst": "277377", "name": "정보통신망법"},
    {"id": "privacy", "mst": "270351", "name": "개인정보보호법"},
    {"id": "sw-promotion", "mst": "265845", "name": "SW진흥법"},
    {"id": "ai-basic", "mst": "282791", "name": "AI기본법"},
    {"id": "cloud", "mst": "277387", "name": "클라우드발전법"},
    {"id": "e-gov", "mst": "268103", "name": "전자정부법"},
    {"id": "nat-contract", "mst": "277151", "name": "국가계약법"},
    {"id": "credit-info", "mst": "260423", "name": "신용정보법"},
    {"id": "public-data", "mst": "251023", "name": "공공데이터법"},
    {"id": "data-industry", "mst": "277325", "name": "데이터산업법"},
    {"id": "intelligent-info", "mst": "268535", "name": "지능정보화기본법"},
    {"id": "quantum", "mst": "258511", "name": "양자법"},
]


# ---------------------------------------------------------------------------
# MCP 호출
# ---------------------------------------------------------------------------

class McpSession:
    """MCP Streamable HTTP 세션 관리"""

    def __init__(self):
        self.session_id: str | None = None
        self._req_id = 0

    def _next_id(self) -> int:
        self._req_id += 1
        return self._req_id

    def _request(self, method: str, params: dict | None = None) -> dict | None:
        payload = json.dumps({
            "jsonrpc": "2.0",
            "id": self._next_id(),
            "method": method,
            **({"params": params} if params else {}),
        }).encode()

        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json, text/event-stream",
            "x-api-key": MCP_API_KEY,
        }
        if self.session_id:
            headers["mcp-session-id"] = self.session_id

        req = urllib.request.Request(f"{MCP_BASE}/mcp", data=payload, headers=headers)

        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                # 세션 ID 추출
                sid = resp.headers.get("mcp-session-id")
                if sid:
                    self.session_id = sid

                body = resp.read().decode()

                # SSE 응답인 경우 마지막 data: 줄에서 JSON 추출
                if body.startswith("event:") or body.startswith("data:"):
                    lines = body.strip().split("\n")
                    for line in reversed(lines):
                        if line.startswith("data:"):
                            return json.loads(line[5:].strip())
                    return None

                return json.loads(body)
        except Exception as e:
            print(f"  MCP 요청 실패 ({method}): {e}", file=sys.stderr)
            return None

    def initialize(self, retries: int = 3) -> bool:
        import time
        for attempt in range(retries):
            result = self._request("initialize", {
                "protocolVersion": "2024-11-05",
                "capabilities": {},
                "clientInfo": {"name": "amendment-detector", "version": "1.0"},
            })
            if result and "result" in result:
                self._request("notifications/initialized")
                return True
            if attempt < retries - 1:
                wait = 30 * (attempt + 1)  # 30초, 60초 대기
                print(f"  MCP 초기화 실패, {wait}초 후 재시도 ({attempt + 1}/{retries})", file=sys.stderr)
                time.sleep(wait)
        print("  MCP 초기화 최종 실패 — 법제처 API 폴백 사용", file=sys.stderr)
        return False

    def call_tool(self, tool_name: str, args: dict) -> dict | None:
        result = self._request("tools/call", {"name": tool_name, "arguments": args})
        if not result:
            return None
        text = (
            result.get("result", {}).get("content", [{}])[0].get("text", "")
        )
        try:
            return json.loads(text) if text else None
        except json.JSONDecodeError:
            return None


# 전역 세션 (한 번만 초기화 시도)
_session: McpSession | None = None
_session_tried = False


def get_session() -> McpSession | None:
    global _session, _session_tried
    if _session_tried:
        return _session
    _session_tried = True
    _session = McpSession()
    if not _session.initialize():
        _session = None
    return _session


def call_mcp(tool_name: str, args: dict) -> dict | None:
    session = get_session()
    if not session:
        return None
    return session.call_tool(tool_name, args)


def get_law_history(mst: str) -> list[dict]:
    """MCP로 개정이력 조회. 실패 시 법제처 API 폴백."""
    result = call_mcp("get_law_history", {"mst": mst})
    if result:
        if isinstance(result, list):
            return result
        return result.get("items") or result.get("history") or []

    # 폴백: 법제처 공개 API (연혁 조회)
    return _fallback_law_history(mst)


def _fallback_law_history(mst: str) -> list[dict]:
    """법제처 Open API 폴백 (OC 키 필요 - 환경변수 LAW_API_OC 설정)"""
    oc = os.environ.get("LAW_API_OC", "")
    if not oc:
        print("  법제처 API 폴백 불가 (LAW_API_OC 미설정)", file=sys.stderr)
        return []

    url = f"https://www.law.go.kr/DRF/lawService.do?OC={oc}&target=law&MST={mst}&type=JSON"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read())

        law_info = data.get("법령", {})
        amendment_date = law_info.get("공포일자", "")
        enforcement_date = law_info.get("시행일자", "")
        amendment_type = law_info.get("제개정구분명", "")

        if amendment_date:
            if len(amendment_date) == 8:
                amendment_date = f"{amendment_date[:4]}-{amendment_date[4:6]}-{amendment_date[6:]}"
            if len(enforcement_date) == 8:
                enforcement_date = f"{enforcement_date[:4]}-{enforcement_date[4:6]}-{enforcement_date[6:]}"
            return [{
                "amendmentDate": amendment_date,
                "enforcementDate": enforcement_date,
                "amendmentType": amendment_type,
            }]
    except Exception as e:
        print(f"  법제처 API 폴백 실패: {e}", file=sys.stderr)

    return []


# ---------------------------------------------------------------------------
# 로컬 compare JSON 최신 개정일 조회
# ---------------------------------------------------------------------------

def get_local_latest_date(law_id: str) -> str | None:
    fp = COMPARE_DIR / f"{law_id}.json"
    if not fp.exists():
        return None
    try:
        data = json.loads(fp.read_text())
        dates = [
            e.get("amendmentDate", "")
            for e in data.values()
            if isinstance(e, dict)
        ]
        return max(dates) if dates else None
    except Exception:
        return None


# ---------------------------------------------------------------------------
# 메인 로직
# ---------------------------------------------------------------------------

def main():
    LOG_DIR.mkdir(exist_ok=True)
    now = datetime.now()
    log_file = LOG_DIR / f"check-{now.strftime('%Y%m%d-%H%M%S')}.json"

    print(f"[{now.isoformat()}] 법령 개정 감지 시작 ({len(LAWS)}개 법령)")

    detected = []
    results = []

    for law in LAWS:
        local_latest = get_local_latest_date(law["id"])
        history = get_law_history(law["mst"])

        if not history:
            results.append({
                "id": law["id"],
                "name": law["name"],
                "status": "no_history",
                "local_latest": local_latest,
            })
            print(f"  {law['name']}: MCP 이력 없음")
            continue

        # MCP에서 최신 개정일 추출
        mcp_dates = sorted(
            [h.get("amendmentDate", "") for h in history if h.get("amendmentDate")],
            reverse=True,
        )
        mcp_latest = mcp_dates[0] if mcp_dates else None

        if not mcp_latest:
            results.append({
                "id": law["id"],
                "name": law["name"],
                "status": "no_date",
                "local_latest": local_latest,
            })
            print(f"  {law['name']}: 개정일 없음")
            continue

        if local_latest and mcp_latest <= local_latest:
            results.append({
                "id": law["id"],
                "name": law["name"],
                "status": "no_change",
                "local_latest": local_latest,
                "mcp_latest": mcp_latest,
            })
            print(f"  {law['name']}: 변경 없음 (로컬={local_latest}, MCP={mcp_latest})")
        else:
            # 새 개정 감지!
            amendment_info = next(
                (h for h in history if h.get("amendmentDate") == mcp_latest),
                {},
            )
            entry = {
                "id": law["id"],
                "mst": law["mst"],
                "name": law["name"],
                "status": "new_amendment",
                "local_latest": local_latest,
                "mcp_latest": mcp_latest,
                "amendment_type": amendment_info.get("amendmentType", ""),
                "enforcement_date": amendment_info.get("enforcementDate", ""),
            }
            detected.append(entry)
            results.append(entry)
            print(f"  ** {law['name']}: 새 개정 감지! ({mcp_latest}, {entry['amendment_type']})")

    # 로그 저장
    log_data = {
        "checked_at": now.isoformat(),
        "laws_checked": len(LAWS),
        "new_amendments": len(detected),
        "results": results,
        "detected": detected,
    }
    log_file.write_text(json.dumps(log_data, ensure_ascii=False, indent=2))
    print(f"\n로그 저장: {log_file}")

    # 감지된 법령 목록을 stdout으로 출력 (check-amendments.sh가 파싱)
    if detected:
        print(f"\n=== {len(detected)}건 새 개정 감지 ===")
        # 감지 결과를 JSON 한줄로 출력 (쉘 스크립트에서 파싱용)
        print(f"DETECTED:{json.dumps([d['id'] for d in detected])}")
        sys.exit(1)  # 새 개정 있음
    else:
        print("\n변경 없음.")
        sys.exit(0)


if __name__ == "__main__":
    main()
