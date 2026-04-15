import { NextResponse } from "next/server";
import { IT_LAWS } from "@/lib/utils/law-constants";
import { fetchLatestLawInfo } from "@/lib/mcp/law-api";
import type { LatestLawInfo } from "@/lib/mcp/law-api";
import * as fs from "fs";
import * as path from "path";

// ---------------------------------------------------------------------------
// Compare JSON 파일 관리 (읽기 전용 — 저장된 최신 공포일 확인용)
// ---------------------------------------------------------------------------

const COMPARE_DIR = path.join(process.cwd(), "src/lib/data/compare");

/** compare JSON에서 가장 최근 개정의 공포일(YYYY-MM-DD)을 반환 */
function getStoredLatestDate(lawId: string): string | null {
  const filePath = path.join(COMPARE_DIR, `${lawId}.json`);
  try {
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    let latest: string | null = null;
    for (const entry of Object.values(data)) {
      const e = entry as { amendmentDate?: string };
      if (e.amendmentDate && (!latest || e.amendmentDate > latest)) {
        latest = e.amendmentDate;
      }
    }
    return latest;
  } catch {
    return null;
  }
}

/** YYYYMMDD → YYYY-MM-DD */
function formatDate(ymd: string): string {
  if (ymd.length !== 8) return ymd;
  return `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}`;
}

// ---------------------------------------------------------------------------
// 결과 타입
// ---------------------------------------------------------------------------

interface CheckResult {
  lawId: string;
  lawName: string;
  status: "no_change" | "new_amendment_detected" | "error";
  storedLatest?: string;
  apiLatest?: string;
  amendmentType?: string;
  message?: string;
}

interface Alert {
  lawId: string;
  lawName: string;
  type: "new_amendment";
  message: string;
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
  const results: CheckResult[] = [];
  const alerts: Alert[] = [];

  /** 법제처 rate limit 방지용 딜레이 */
  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

  // -----------------------------------------------------------------------
  // 각 IT법에 대해 법제처 API로 최신 공포일 조회 → 저장된 날짜와 비교
  // 법제처 서버 rate limit 방지를 위해 요청 간 500ms 딜레이
  // -----------------------------------------------------------------------
  for (let i = 0; i < IT_LAWS.length; i++) {
    if (i > 0) await delay(500);
    const law = IT_LAWS[i];
    try {
      const info: LatestLawInfo | null = await fetchLatestLawInfo(law.lawId, law.mst);

      if (!info) {
        results.push({
          lawId: law.id,
          lawName: law.shortName,
          status: "error",
          message: "법제처 API 응답 없음",
        });
        continue;
      }

      // 법제처 최신 공포일 (YYYYMMDD → YYYY-MM-DD)
      const apiLatest = formatDate(info.promulgationDate);
      const storedLatest = getStoredLatestDate(law.id);

      if (storedLatest && apiLatest <= storedLatest) {
        // 변경 없음
        results.push({
          lawId: law.id,
          lawName: law.shortName,
          status: "no_change",
          storedLatest,
          apiLatest,
        });
      } else {
        // 새 개정 감지!
        results.push({
          lawId: law.id,
          lawName: law.shortName,
          status: "new_amendment_detected",
          storedLatest: storedLatest ?? "(없음)",
          apiLatest,
          amendmentType: info.amendmentType,
          message: `${info.amendmentType} (공포일 ${apiLatest}, 시행일 ${formatDate(info.enforcementDate)})`,
        });

        alerts.push({
          lawId: law.id,
          lawName: law.shortName,
          type: "new_amendment",
          message: `${law.shortName} 새 개정 감지: ${info.amendmentType} (공포일 ${apiLatest}), 저장된 최신: ${storedLatest ?? "없음"}`,
        });

        console.log(`[check-amendments] 🔔 ${law.shortName}: ${info.amendmentType}, 공포일 ${apiLatest} (저장된 최신: ${storedLatest ?? "없음"})`);
      }
    } catch (err) {
      console.error(`[check-amendments] ${law.shortName} 실패:`, err);
      results.push({
        lawId: law.id,
        lawName: law.shortName,
        status: "error",
        message: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  // -----------------------------------------------------------------------
  // 응답
  // -----------------------------------------------------------------------
  const response = {
    checkedAt: today.toISOString(),
    lawsChecked: IT_LAWS.length,
    newAmendments: results.filter((r) => r.status === "new_amendment_detected").length,
    errors: results.filter((r) => r.status === "error").length,
    alertsGenerated: alerts.length,
    results,
    alerts,
  };

  console.log(`[check-amendments] 완료: ${IT_LAWS.length}개 법령 체크, 새 개정 ${response.newAmendments}건, 에러 ${response.errors}건`);
  return NextResponse.json(response);
}
