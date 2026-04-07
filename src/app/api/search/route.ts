import { NextRequest, NextResponse } from "next/server";
import { getMockArticles } from "@/lib/mcp/mock-data";
import { IT_LAWS } from "@/lib/laws-data";
import type { SearchResult } from "@/types/law";

/**
 * GET /api/search?q=검색어
 * 10개 법률의 전체 조문 본문(content + hang + ho)을 검색하여 매칭 결과 반환
 */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q) {
    return NextResponse.json({ results: [] });
  }

  const keywords = q.toLowerCase().split(/\s+/).filter(Boolean);
  const results: SearchResult[] = [];

  for (const law of IT_LAWS) {
    const articles = getMockArticles(law.id);

    for (const article of articles) {
      // Skip deleted articles
      const raw = article as unknown as Record<string, unknown>;
      if (raw.status === "deleted") continue;

      // Build searchable text from all fields
      const parts: string[] = [
        article.jo,
        article.title || "",
        article.content || "",
        article.commentary || "",
      ];

      // Include hang content
      if (article.hang) {
        for (const h of article.hang) {
          parts.push(h.content || "");
          if (h.ho) {
            for (const ho of h.ho) {
              parts.push(ho.content || "");
            }
          }
        }
      }

      // Include top-level ho content (some articles have ho at root level, e.g. 제2조)
      const hoArr = raw.ho as Array<{ content?: string }> | undefined;
      if (hoArr) {
        for (const ho of hoArr) {
          parts.push(ho.content || "");
        }
      }

      const fullText = parts.join(" ").toLowerCase();

      // Calculate relevance: how many keywords match
      const matchCount = keywords.filter((kw) => fullText.includes(kw)).length;
      if (matchCount === 0) continue;

      const relevance = Math.round((matchCount / keywords.length) * 100);

      // Find the best matching snippet
      let snippet = article.content || "";
      for (const kw of keywords) {
        const idx = fullText.indexOf(kw);
        if (idx >= 0) {
          const rawText = parts.join(" ");
          const start = Math.max(0, idx - 30);
          const end = Math.min(rawText.length, idx + kw.length + 60);
          snippet = (start > 0 ? "..." : "") + rawText.slice(start, end) + (end < rawText.length ? "..." : "");
          break;
        }
      }

      results.push({
        lawName: law.shortName,
        lawId: law.id,
        jo: article.jo,
        title: article.title || "",
        content: snippet,
        relevance,
      });
    }
  }

  // Sort by relevance desc, then by law name
  results.sort((a, b) => b.relevance - a.relevance || a.lawName.localeCompare(b.lawName));

  // Limit to top 50
  return NextResponse.json({ results: results.slice(0, 50) });
}
