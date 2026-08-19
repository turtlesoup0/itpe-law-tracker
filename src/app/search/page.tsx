"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { SearchResult } from "@/types/law";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch() {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      setResults(data.results ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function highlightQuery(text: string) {
    if (!query.trim()) return text;
    const keywords = query.trim().split(/\s+/).filter(Boolean);
    let result = text;
    for (const kw of keywords) {
      const regex = new RegExp(`(${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
      result = result.replace(regex, "**$1**");
    }
    // Convert **text** to bold spans
    const parts = result.split(/\*\*(.*?)\*\*/g);
    return parts;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[23px] font-semibold tracking-tight">
          법령 조문 검색
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          10개 IT 법률의 전체 조문을 검색합니다. (예: &quot;클라우드 보안
          인증&quot;, &quot;개인정보 처리&quot;)
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="검색어를 입력하세요..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="w-full sm:max-w-xl"
        />
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? "검색 중..." : "검색"}
        </Button>
      </div>

      {searched && (
        <div className="space-y-3">
          <p className="text-sm text-faint">
            {results.length}개 결과
            {results.length === 50 && " (상위 50건)"}
          </p>
          {results.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              검색 결과가 없습니다.
            </p>
          )}
          {results.map((result, i) => {
            const parts = highlightQuery(result.content);
            return (
              <Link key={i} href={`/laws/${result.lawId}`}>
                <Card className="cursor-pointer transition-colors hover:ring-foreground/25">
                  <CardContent className="py-4">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-semibold text-foreground">
                        {result.lawName}
                      </span>
                      <span className="text-sm text-primary">
                        {result.jo} {result.title}
                      </span>
                      <span className="ml-auto rounded-full bg-primary-soft px-2 py-0.5 text-xs text-primary">
                        {result.relevance}%
                      </span>
                    </div>
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {Array.isArray(parts)
                        ? parts.map((part, j) =>
                            j % 2 === 1 ? (
                              <mark
                                key={j}
                                className="rounded bg-warning/25 px-0.5 text-foreground"
                              >
                                {part}
                              </mark>
                            ) : (
                              <span key={j}>{part}</span>
                            )
                          )
                        : parts}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
