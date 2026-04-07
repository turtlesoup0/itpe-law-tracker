import { NextResponse } from "next/server";
import { IT_LAWS } from "@/lib/utils/law-constants";
import { getMockAmendments } from "@/lib/mcp/mock-data";

// Vercel Cron 또는 수동 호출로 개정 감지
// 실제로는 MCP get_law_history를 호출하여 변경 감지
export async function GET(request: Request) {
  // Cron 인증 (Vercel Cron header)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  const alerts: {
    lawId: string;
    lawName: string;
    type: string;
    message: string;
  }[] = [];

  for (const law of IT_LAWS) {
    const amendments = getMockAmendments(law.id);

    for (const amd of amendments) {
      const enfDate = new Date(amd.enforcementDate);
      const daysUntil = Math.ceil(
        (enfDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );

      // 시행 예정 알림 (90, 60, 30, 7일 전)
      if ([90, 60, 30, 7].includes(daysUntil)) {
        alerts.push({
          lawId: law.id,
          lawName: law.shortName,
          type: "enforcement_upcoming",
          message: `${law.shortName} ${amd.type} 시행 D-${daysUntil} (${amd.enforcementDate})`,
        });
      }
    }
  }

  // TODO: 실제 알림 발송 (Resend 이메일, Web Push)
  // 지금은 감지 결과만 반환

  return NextResponse.json({
    checkedAt: today.toISOString(),
    lawsChecked: IT_LAWS.length,
    alertsGenerated: alerts.length,
    alerts,
  });
}
