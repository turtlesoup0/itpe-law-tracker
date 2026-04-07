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
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          법령 조문 검색
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
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
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {results.length}개 결과
            {results.length === 50 && " (상위 50건)"}
          </p>
          {results.length === 0 && (
            <p className="text-slate-500 dark:text-slate-400 py-8 text-center">
              검색 결과가 없습니다.
            </p>
          )}
          {results.map((result, i) => {
            const parts = highlightQuery(result.content);
            return (
              <Link key={i} href={`/laws/${result.lawId}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer dark:bg-slate-800 dark:border-slate-700">
                  <CardContent className="py-4">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {result.lawName}
                      </span>
                      <span className="text-sm text-blue-600 dark:text-blue-400">
                        {result.jo} {result.title}
                      </span>
                      <span className="ml-auto text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                        {result.relevance}%
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                      {Array.isArray(parts)
                        ? parts.map((part, j) =>
                            j % 2 === 1 ? (
                              <mark
                                key={j}
                                className="bg-yellow-200 dark:bg-yellow-800 text-slate-900 dark:text-slate-100 rounded px-0.5"
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
