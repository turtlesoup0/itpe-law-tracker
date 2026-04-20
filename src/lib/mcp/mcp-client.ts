/**
 * MCP (Korean Law MCP Server) 클라이언트
 *
 * Streamable HTTP 프로토콜 기반 세션 관리 + 범용 도구 호출.
 * 현재 cron은 법제처 웹 엔드포인트(law-api.ts)를 사용하므로,
 * 이 모듈은 향후 MCP 도구 직접 호출이 필요할 때를 위해 유지합니다.
 */

const MCP_BASE = process.env.MCP_BASE_URL || "https://korean-law-mcp.fly.dev";
const MCP_API_KEY = process.env.MCP_API_KEY || "";

if (!MCP_API_KEY && process.env.NODE_ENV === "production") {
  console.warn("[mcp-client] MCP_API_KEY 미설정 — MCP 호출이 실패할 수 있습니다");
}

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
 *
 * ⚠️ 주의: Fly.dev MCP HTTP 엔드포인트에서 법제처 API 아웃바운드 호출이
 * 실패하는 것이 확인됨 (2026-04-15). Claude MCP 네이티브 연결에서는 정상 동작.
 * cron 등 서버사이드에서는 law-api.ts의 직접 호출을 사용할 것.
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
        console.log(`[MCP] session expired, reconnecting...`);
        resetMcpSession();
        continue;
      }
      return null;
    }

    const json = await res.json();

    if (json?.error) {
      const errMsg = json.error.message || JSON.stringify(json.error);
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
 * 텍스트 응답인 경우 callMcpToolRaw를 직접 사용하세요.
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
