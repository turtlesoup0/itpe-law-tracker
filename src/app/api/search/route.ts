import { NextRequest, NextResponse } from "next/server";
import { getMockArticles } from "@/lib/mcp/mock-data";
import { IT_LAWS } from "@/lib/laws-data";
import type { SearchResult } from "@/types/law";

/** JSON 조문 데이터에는 Article 타입에 없는 status, ho 필드가 존재할 수 있음 */
interface RawArticle {
  jo: string;
  title: string;
  content: string;
  commentary?: string;
  status?: string;
  hang?: { content: string; ho?: { content: string }[] }[];
  ho?: { content: string }[];
}

/**
 * 조문에서 검색 가능한 텍스트를 빌드합니다.
 */
function buildSearchableText(article: RawArticle): string[] {
  const parts: string[] = [
    article.jo,
    article.title || "",
    article.content || "",
    article.commentary || "",
  ];

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

  // 일부 조문(제2조 등)은 최상위 ho를 가질 수 있음
  if (article.ho) {
    for (const ho of article.ho) {
      parts.push(ho.content || "");
    }
  }

  return parts;
}

/**
 * 검색어가 포함된 최적의 스니펫을 추출합니다.
 */
function extractSnippet(parts: string[], keywords: string[], fullText: string, fallback: string): string {
  for (const kw of keywords) {
    const idx = fullText.indexOf(kw);
    if (idx >= 0) {
      const rawText = parts.join(" ");
      const start = Math.max(0, idx - 30);
      const end = Math.min(rawText.length, idx + kw.length + 60);
      return (start > 0 ? "..." : "") + rawText.slice(start, end) + (end < rawText.length ? "..." : "");
    }
  }
  return fallback;
}

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
    const articles = getMockArticles(law.id) as RawArticle[];

    for (const article of articles) {
      if (article.status === "deleted" || article.status === "삭제") continue;

      const parts = buildSearchableText(article);
      const fullText = parts.join(" ").toLowerCase();

      const matchCount = keywords.filter((kw) => fullText.includes(kw)).length;
      if (matchCount === 0) continue;

      results.push({
        lawName: law.shortName,
        lawId: law.id,
        jo: article.jo,
        title: article.title || "",
        content: extractSnippet(parts, keywords, fullText, article.content || ""),
        relevance: Math.round((matchCount / keywords.length) * 100),
      });
    }
  }

  results.sort((a, b) => b.relevance - a.relevance || a.lawName.localeCompare(b.lawName));
  return NextResponse.json({ results: results.slice(0, 50) });
}
