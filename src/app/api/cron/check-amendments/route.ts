import { NextResponse } from "next/server";
import { IT_LAWS } from "@/lib/utils/law-constants";
import * as fs from "fs";
import * as path from "path";

// ---------------------------------------------------------------------------
// MCP Helper — get_law_history 호출
// ---------------------------------------------------------------------------

const MCP_BASE = "https://korean-law-mcp.fly.dev";
const MCP_API_KEY = process.env.MCP_API_KEY || "itpe_law_follower";

interface McpHistoryItem {
  lawMst: string;
  amendmentDate: string;
  enforcementDate: string;
  amendmentType: string;
  lawNo: string;
  amendmentReason?: string;
}

async function mcpGetLawHistory(mst: string): Promise<McpHistoryItem[]> {
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
          name: "get_law_history",
          arguments: { mst },
        },
      }),
    });

    if (!res.ok) return [];

    const json = await res.json();
    const content = json?.result?.content;
    if (!content?.[0]?.text) return [];

    const parsed = JSON.parse(content[0].text);
    return Array.isArray(parsed) ? parsed : parsed?.items || parsed?.history || [];
  } catch {
    return [];
  }
}

async function mcpCompareOldNew(mst: string): Promise<{
  amendmentDate: string;
  enforcementDate: string;
  amendmentType: string;
  amendmentReason: string;
  lawNo: string;
  items: { articleNo: string; oldText: string; newText: string; changeType: string }[];
} | null> {
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
          name: "compare_old_new",
          arguments: { mst },
        },
      }),
    });

    if (!res.ok) return null;

    const json = await res.json();
    const content = json?.result?.content;
    if (!content?.[0]?.text) return null;

    return JSON.parse(content[0].text);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Compare JSON 파일 관리
// ---------------------------------------------------------------------------

const COMPARE_DIR = path.join(process.cwd(), "src/lib/data/compare");

function readCompareJson(lawId: string): Record<string, unknown> {
  const filePath = path.join(COMPARE_DIR, `${lawId}.json`);
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return {};
  }
}

function getLatestAmendmentDate(data: Record<string, unknown>): string | null {
  let latest: string | null = null;
  for (const entry of Object.values(data)) {
    const e = entry as { amendmentDate?: string };
    if (e.amendmentDate && (!latest || e.amendmentDate > latest)) {
      latest = e.amendmentDate;
    }
  }
  return latest;
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

export async function GET(request: Request) {
  // Cron 인증 (Vercel Cron header)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  const results: {
    lawId: string;
    lawName: string;
    status: "no_change" | "new_amendment_detected" | "error";
    latestDate?: string;
    message?: string;
  }[] = [];

  const alerts: {
    lawId: string;
    lawName: string;
    type: string;
    message: string;
  }[] = [];

  for (const law of IT_LAWS) {
    try {
      // 1. 현재 저장된 최신 개정일
      const currentData = readCompareJson(law.id);
      const savedLatest = getLatestAmendmentDate(currentData);

      // 2. MCP에서 최신 개정이력 조회
      const history = await mcpGetLawHistory(law.mst);

      if (history.length === 0) {
        results.push({
          lawId: law.id,
          lawName: law.shortName,
          status: "no_change",
          latestDate: savedLatest || undefined,
          message: "MCP 이력 조회 결과 없음",
        });
        continue;
      }

      // 3. MCP 최신 개정일 vs 저장된 최신 개정일 비교
      const mcpLatest = history
        .map((h) => h.amendmentDate)
        .filter(Boolean)
        .sort()
        .reverse()[0];

      if (!mcpLatest || (savedLatest && mcpLatest <= savedLatest)) {
        // 변경 없음 — 시행 예정 알림만 체크
        for (const h of history) {
          if (!h.enforcementDate) continue;
          const enfDate = new Date(h.enforcementDate);
          const daysUntil = Math.ceil(
            (enfDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
          );
          if ([90, 60, 30, 7].includes(daysUntil)) {
            alerts.push({
              lawId: law.id,
              lawName: law.shortName,
              type: "enforcement_upcoming",
              message: `${law.shortName} ${h.amendmentType} 시행 D-${daysUntil} (${h.enforcementDate})`,
            });
          }
        }

        results.push({
          lawId: law.id,
          lawName: law.shortName,
          status: "no_change",
          latestDate: savedLatest || undefined,
        });
      } else {
        // 4. 새 개정 감지! → compare_old_new로 상세 데이터 수집
        const compareData = await mcpCompareOldNew(law.mst);

        if (compareData && compareData.items?.length > 0) {
          // 새 entry ID 생성
          const amdId = `amd-${law.id.split("-")[0]}-${String(Object.keys(currentData).length + 1).padStart(3, "0")}`;

          const newEntry = {
            amendmentDate: compareData.amendmentDate,
            enforcementDate: compareData.enforcementDate,
            lawNo: compareData.lawNo,
            mst: law.mst,
            amendmentType: compareData.amendmentType,
            amendmentReason: compareData.amendmentReason || "",
            items: compareData.items.map((item) => ({
              articleNo: item.articleNo,
              oldText: item.oldText,
              newText: item.newText,
              changeType: item.changeType as "신설" | "삭제" | "변경",
              amendmentDate: compareData.amendmentDate,
              enforcementDate: compareData.enforcementDate,
              // summary 필드는 Phase 2의 generate-summaries cron이 채움
            })),
          };

          // JSON 파일 업데이트 (Vercel에서는 read-only이므로 로그만 남김)
          // 로컬 개발/수동 실행 시에만 파일 쓰기
          const isWritable = process.env.NODE_ENV === "development" || process.env.ALLOW_FILE_WRITE === "true";
          if (isWritable) {
            const updated = { ...currentData, [amdId]: newEntry };
            const filePath = path.join(COMPARE_DIR, `${law.id}.json`);
            fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), "utf-8");
          }

          alerts.push({
            lawId: law.id,
            lawName: law.shortName,
            type: "new_amendment",
            message: `${law.shortName} 새 개정 감지: ${compareData.amendmentType} (${compareData.amendmentDate}), ${compareData.items.length}개 조문 변경`,
          });

          results.push({
            lawId: law.id,
            lawName: law.shortName,
            status: "new_amendment_detected",
            latestDate: mcpLatest,
            message: `${compareData.items.length}개 조문 변경 감지 (${amdId})`,
          });
        } else {
          results.push({
            lawId: law.id,
            lawName: law.shortName,
            status: "no_change",
            latestDate: mcpLatest,
            message: "새 개정일자 발견했으나 compare 데이터 없음",
          });
        }
      }
    } catch (err) {
      results.push({
        lawId: law.id,
        lawName: law.shortName,
        status: "error",
        message: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  // TODO Phase 2: 새 개정 감지 시 알림 발송 (Resend 이메일, Web Push)

  return NextResponse.json({
    checkedAt: today.toISOString(),
    lawsChecked: IT_LAWS.length,
    newAmendments: results.filter((r) => r.status === "new_amendment_detected").length,
    alertsGenerated: alerts.length,
    results,
    alerts,
  });
}
