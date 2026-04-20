import { NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

// ---------------------------------------------------------------------------
// Opus 요약 생성 Cron
//
// compare JSON에서 summary가 없는 항목을 찾아 Anthropic Opus로 1회 요약 생성.
// - Vercel 프로덕션: 결과를 응답 body로 반환 (파일 쓰기 불가)
// - 로컬/CI: JSON 파일에 직접 기록
//
// 환경변수:
//   ANTHROPIC_API_KEY — Opus 호출용 (필수)
//   CRON_SECRET — Vercel Cron 인증
//   ALLOW_FILE_WRITE — "true"면 JSON 파일에 기록
// ---------------------------------------------------------------------------

const COMPARE_DIR = path.join(process.cwd(), "src/lib/data/compare");
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";
const MODEL = "claude-sonnet-4-20250514"; // 비용 최적화: 요약은 Sonnet으로도 충분. Opus가 필요하면 교체

interface CompareItem {
  articleNo: string;
  oldText: string;
  newText: string;
  changeType: string;
  amendmentDate?: string;
  enforcementDate?: string;
  summary?: string;
}

interface CompareEntry {
  amendmentDate: string;
  enforcementDate: string;
  amendmentType: string;
  amendmentReason?: string;
  lawNo?: string;
  mst?: string;
  items: CompareItem[];
}

// ---------------------------------------------------------------------------
// Anthropic API 호출
// ---------------------------------------------------------------------------

async function generateSummary(item: CompareItem): Promise<string> {
  const prompt = `당신은 한국 IT법 전문 해설가입니다. 다음 법률 조문 변경 사항을 비전문가(IT 기술사 수험생)가 이해할 수 있도록 요약해주세요.

요구사항:
- 2-3문장으로 핵심 변경 내용과 실무 영향을 설명
- "~합니다" 체로 작성
- 법률 용어는 괄호 안에 쉬운 설명 추가

조문: ${item.articleNo}
변경유형: ${item.changeType}
개정 전: ${item.oldText || "(신설)"}
개정 후: ${item.newText || "(삭제)"}

변경 요약:`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 400,
      temperature: 0.2,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Anthropic API ${res.status}: ${errText}`);
  }

  const data = await res.json();
  return data.content?.[0]?.text || "";
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

export async function GET(request: Request) {
  // 인증 — CRON_SECRET 필수
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET not configured" },
      { status: 503 },
    );
  }
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured" },
      { status: 500 },
    );
  }

  const isWritable =
    process.env.NODE_ENV === "development" ||
    process.env.ALLOW_FILE_WRITE === "true";

  const results: {
    lawId: string;
    amdId: string;
    articleNo: string;
    summary: string;
    status: "generated" | "error";
  }[] = [];

  let totalGenerated = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  // compare 디렉토리의 모든 JSON 파일 순회
  const files = fs.readdirSync(COMPARE_DIR).filter((f) => f.endsWith(".json"));

  for (const file of files) {
    const lawId = file.replace(".json", "");
    const filePath = path.join(COMPARE_DIR, file);

    let data: Record<string, CompareEntry>;
    try {
      data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch {
      continue;
    }

    let fileModified = false;

    for (const [amdId, entry] of Object.entries(data)) {
      if (!entry.items || !Array.isArray(entry.items)) continue;

      for (const item of entry.items) {
        // 이미 요약이 있으면 스킵
        if (item.summary) {
          totalSkipped++;
          continue;
        }

        // 신설/삭제 중 텍스트가 둘 다 없으면 스킵
        if (!item.oldText && !item.newText) {
          totalSkipped++;
          continue;
        }

        try {
          const summary = await generateSummary(item);
          item.summary = summary;
          fileModified = true;
          totalGenerated++;

          results.push({
            lawId,
            amdId,
            articleNo: item.articleNo,
            summary,
            status: "generated",
          });
        } catch (err) {
          totalErrors++;
          results.push({
            lawId,
            amdId,
            articleNo: item.articleNo,
            summary: "",
            status: "error",
          });

          // Rate limit 시 중단
          if (err instanceof Error && err.message.includes("429")) {
            return NextResponse.json({
              status: "rate_limited",
              generated: totalGenerated,
              skipped: totalSkipped,
              errors: totalErrors,
              results,
              message: "Rate limited — partial progress saved",
            });
          }
        }
      }
    }

    // 파일 쓰기 (로컬/CI만)
    if (fileModified && isWritable) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    }
  }

  return NextResponse.json({
    completedAt: new Date().toISOString(),
    generated: totalGenerated,
    skipped: totalSkipped,
    errors: totalErrors,
    fileWritten: isWritable,
    results,
  });
}
