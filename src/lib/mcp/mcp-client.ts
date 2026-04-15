/**
 * MCP (Korean Law MCP Server) 클라이언트
 * 모든 MCP 도구 호출을 통합하는 타입 안전한 래퍼
 */

const MCP_BASE = process.env.MCP_BASE_URL || "https://korean-law-mcp.fly.dev";
const MCP_API_KEY = process.env.MCP_API_KEY || "itpe_law_follower";

// ---------------------------------------------------------------------------
// MCP Streamable HTTP 세션 관리
// ---------------------------------------------------------------------------

let cachedSessionId: string | null = null;

/**
 * MCP 서버와 세션을 초기화하고 세션 ID를 반환합니다.
 * Streamable HTTP 프로토콜: initialize → mcp-session-id 헤더 수신
 */
async function ensureSession(): Promise<string> {
  if (cachedSessionId) return cachedSessionId;

  const res = await fetch(`${MCP_BASE}/mcp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json, text/event-stream",
      "x-api-key": MCP_API_KEY,
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 0,
      method: "initialize",
      params: {
        protocolVersion: "2025-03-26",
        capabilities: {},
        clientInfo: { name: "itpe-law-tracker", version: "1.0" },
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`[MCP] initialize HTTP ${res.status}: ${res.statusText}`);
  }

  const sessionId = res.headers.get("mcp-session-id");
  if (!sessionId) {
    throw new Error("[MCP] initialize: no mcp-session-id in response headers");
  }

  cachedSessionId = sessionId;
  console.log(`[MCP] session initialized: ${sessionId.slice(0, 8)}...`);
  return sessionId;
}

/** 세션 캐시 무효화 (재연결 필요 시) */
export function resetMcpSession(): void {
  cachedSessionId = null;
}

// ---------------------------------------------------------------------------
// 범용 MCP 도구 호출
// ---------------------------------------------------------------------------

/**
 * MCP JSON-RPC tools/call을 실행하고 결과 텍스트를 반환합니다.
 * 세션이 없으면 자동으로 initialize합니다.
 * 세션 만료 시 한 번 재시도합니다.
 */
export async function callMcpToolRaw(
  toolName: string,
  args: Record<string, unknown>,
): Promise<string | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const sessionId = await ensureSession();

    const res = await fetch(`${MCP_BASE}/mcp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json, text/event-stream",
        "x-api-key": MCP_API_KEY,
        "mcp-session-id": sessionId,
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: Date.now(),
        method: "tools/call",
        params: {
          name: toolName,
          arguments: args,
        },
      }),
    });

    if (!res.ok) {
      console.error(`[MCP] ${toolName} HTTP ${res.status}: ${res.statusText}`);
      if (res.status === 400 && attempt === 0) {
        // 세션 만료 — 재연결 시도
        console.log(`[MCP] session expired, reconnecting...`);
        resetMcpSession();
        continue;
      }
      return null;
    }

    const json = await res.json();

    if (json?.error) {
      const errMsg = json.error.message || JSON.stringify(json.error);
      // 세션 관련 에러면 재시도
      if (errMsg.includes("session") && attempt === 0) {
        console.log(`[MCP] session error, reconnecting: ${errMsg}`);
        resetMcpSession();
        continue;
      }
      console.error(`[MCP] ${toolName} error: ${errMsg}`);
      return null;
    }

    const text = json?.result?.content?.[0]?.text;
    if (!text) {
      console.error(`[MCP] ${toolName}: empty content in response`);
      return null;
    }

    return text;
  }

  return null;
}

/**
 * MCP 도구를 호출하고 JSON으로 파싱하여 반환합니다.
 * 파싱 실패 시 null을 반환합니다.
 */
export async function callMcpTool<T>(
  toolName: string,
  args: Record<string, unknown>,
): Promise<T | null> {
  const text = await callMcpToolRaw(toolName, args);
  if (!text) return null;

  try {
    return JSON.parse(text) as T;
  } catch {
    console.error(`[MCP] ${toolName}: response is not JSON, use callMcpToolRaw`);
    return null;
  }
}

// ---------------------------------------------------------------------------
// 타입 정의 — MCP 응답 형태
// ---------------------------------------------------------------------------

/** get_law_history 응답의 개별 항목 */
export interface McpHistoryItem {
  lawName: string;
  lawId: string;
  mst: string;
  lawType: string;       // 법률, 대통령령, 부령 등
  status: string;        // 현행, 연혁
  promulgationNo: string;
  amendmentType: string; // 일부개정, 타법개정, 전부개정
  promulgationDate: string; // YYYYMMDD
  enforcementDate: string;  // YYYYMMDD
  agency: string;        // 소관부처
}

/** compare_old_new 응답의 개별 조문 변경 항목 */
export interface McpCompareArticle {
  articleNo: string;
  oldText: string;
  newText: string;
}

/** compare_old_new 파싱 결과 */
export interface McpCompareResult {
  lawName: string;
  amendmentType: string;
  oldPromulgationDate: string;
  newPromulgationDate: string;
  articles: McpCompareArticle[];
}

// ---------------------------------------------------------------------------
// 편의 함수 — 자주 쓰는 도구 호출
// ---------------------------------------------------------------------------

/**
 * 특정 날짜 이후 변경된 법령 목록을 조회합니다.
 * get_law_history는 regDt(YYYYMMDD) 필수 — 해당 날짜 이후 변경된 *전체* 법령을 반환합니다.
 * 특정 법령의 이력이 아닌, 날짜 기준 전체 변경 목록입니다.
 */
export async function getLawHistory(regDt: string): Promise<McpHistoryItem[]> {
  const text = await callMcpToolRaw("get_law_history", { regDt });
  if (!text) return [];

  // MCP 응답은 텍스트 형태 — 구조화된 파싱 시도
  const items: McpHistoryItem[] = [];
  const blocks = text.split(/\n\d+\.\s+/).filter(Boolean);

  for (const block of blocks) {
    const get = (label: string): string => {
      const m = block.match(new RegExp(`${label}:\\s*(.+)`));
      return m?.[1]?.trim() ?? "";
    };

    const lawName = block.split("\n")[0]?.trim() ?? "";
    const mst = get("MST");
    if (!mst) continue;

    items.push({
      lawName,
      lawId: get("법령ID"),
      mst,
      lawType: get("법령구분"),
      status: get("상태"),
      promulgationNo: get("공포번호"),
      amendmentType: get("개정구분"),
      promulgationDate: get("공포일").split(",")[0]?.trim() ?? "",
      enforcementDate: get("시행일").split(",")[0]?.replace(/\s.*/, "")?.trim() ?? "",
      agency: get("소관부처"),
    });
  }

  return items;
}

/**
 * 특정 법령의 신구법 대조표를 조회합니다.
 * 텍스트 응답을 파싱하여 조문별 변경 내역을 반환합니다.
 */
export async function compareOldNew(mst: string): Promise<McpCompareResult | null> {
  const text = await callMcpToolRaw("compare_old_new", { mst });
  if (!text) return null;

  // 메타 정보 추출
  const lawNameMatch = text.match(/법령명:\s*(.+)/);
  const amdTypeMatch = text.match(/개정구분:\s*(.+)/);
  const oldDateMatch = text.match(/구법 공포일:\s*(\d+)/);
  const newDateMatch = text.match(/신법 공포일:\s*(\d+)/);

  // 조문별 분리 — "---\n제N조..." 패턴
  const articles: McpCompareArticle[] = [];
  const articleBlocks = text.split(/\n---\n/).filter((b) => b.startsWith("제"));

  for (const block of articleBlocks) {
    const titleLine = block.split("\n")[0]?.trim() ?? "";
    const oldMatch = block.match(/\[개정 전\]\n([\s\S]*?)\n\n\[개정 후\]/);
    const newMatch = block.match(/\[개정 후\]\n([\s\S]*?)(?:\n\n---|\n*$)/);

    if (oldMatch && newMatch) {
      articles.push({
        articleNo: titleLine,
        oldText: oldMatch[1].trim(),
        newText: newMatch[1].trim(),
      });
    }
  }

  return {
    lawName: lawNameMatch?.[1]?.trim() ?? "",
    amendmentType: amdTypeMatch?.[1]?.trim() ?? "",
    oldPromulgationDate: oldDateMatch?.[1] ?? "",
    newPromulgationDate: newDateMatch?.[1] ?? "",
    articles,
  };
}
