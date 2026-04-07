"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { IT_LAWS } from "@/lib/laws-data";
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

    // Mock search -- will be replaced with Server Action in later phase
    const mockResults: SearchResult[] = [];
    for (const law of IT_LAWS) {
      if (
        law.name.includes(query) ||
        law.shortName.includes(query) ||
        law.description.includes(query)
      ) {
        mockResults.push({
          lawName: law.shortName,
          lawId: law.id,
          jo: "제1조",
          title: "목적",
          content: law.description,
          relevance: 90,
        });
      }
    }

    // If no results, return all laws with lower relevance
    if (mockResults.length === 0) {
      for (const law of IT_LAWS) {
        mockResults.push({
          lawName: law.shortName,
          lawId: law.id,
          jo: "제1조",
          title: "목적",
          content: law.description,
          relevance: 50,
        });
      }
    }

    setResults(mockResults.sort((a, b) => b.relevance - a.relevance));
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          AI 법령 검색
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          자연어로 IT 관련 법령을 검색하세요. (예: &quot;클라우드 보안 인증
          기준&quot;)
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
          <p className="text-sm text-slate-500 dark:text-slate-400">{results.length}개 결과</p>
          {results.map((result, i) => (
            <Link key={i} href={`/laws/${result.lawId}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer dark:bg-slate-800 dark:border-slate-700">
                <CardContent className="py-4">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {result.lawName}
                    </span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {result.jo} {result.title}
                    </span>
                    <span className="ml-auto text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                      관련도 {result.relevance}%
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                    {result.content}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
