/**
 * MCP (Korean Law MCP Server) 클라이언트
 * 모든 MCP 도구 호출을 통합하는 타입 안전한 래퍼
 */

const MCP_BASE = process.env.MCP_BASE_URL || "https://korean-law-mcp.fly.dev";
const MCP_API_KEY = process.env.MCP_API_KEY || "itpe_law_follower";

// ---------------------------------------------------------------------------
// 범용 MCP 도구 호출
// ---------------------------------------------------------------------------

/**
 * MCP JSON-RPC tools/call을 실행하고 결과를 파싱하여 반환합니다.
 * MCP 서버 응답 형식: { result: { content: [{ text: "..." }] } }
 */
export async function callMcpTool<T>(
  toolName: string,
  args: Record<string, unknown>,
): Promise<T | null> {
  try {
    const res = await fetch(`${MCP_BASE}/mcp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": MCP_API_KEY,
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: {
          name: toolName,
          arguments: args,
        },
      }),
    });

    if (!res.ok) return null;

    const json = await res.json();
    const content = json?.result?.content;
    if (!content?.[0]?.text) return null;

    return JSON.parse(content[0].text) as T;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// 타입 정의 — MCP 응답 형태
// ---------------------------------------------------------------------------

export interface McpHistoryItem {
  lawMst: string;
  amendmentDate: string;
  enforcementDate: string;
  amendmentType: string;
  lawNo: string;
  amendmentReason?: string;
}

export interface McpCompareResult {
  amendmentDate: string;
  enforcementDate: string;
  amendmentType: string;
  amendmentReason: string;
  lawNo: string;
  items: {
    articleNo: string;
    oldText: string;
    newText: string;
    changeType: string;
  }[];
}

// ---------------------------------------------------------------------------
// 편의 함수 — 자주 쓰는 도구 호출
// ---------------------------------------------------------------------------

/** 법률 개정이력 조회 */
export async function getLawHistory(mst: string): Promise<McpHistoryItem[]> {
  const result = await callMcpTool<McpHistoryItem[] | { items?: McpHistoryItem[]; history?: McpHistoryItem[] }>(
    "get_law_history",
    { mst },
  );

  if (!result) return [];
  if (Array.isArray(result)) return result;
  return result.items || result.history || [];
}

/** 신구대조표 조회 */
export async function compareOldNew(mst: string): Promise<McpCompareResult | null> {
  return callMcpTool<McpCompareResult>("compare_old_new", { mst });
}
