"use client";

import React, { useState, useRef, useCallback } from "react";

const QUICK_TERMS = [
  "클라우드컴퓨팅",
  "개인정보",
  "인공지능",
  "정보보호",
  "소프트웨어",
  "전자정부",
  "블록체인",
  "빅데이터",
  "사물인터넷",
  "메타버스",
];

export function TtaTermWidget() {
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const doSearch = useCallback(
    (term: string) => {
      setQuery(term);
      setSearched(true);
      // hidden form을 통해 POST → iframe에 결과 표시
      setTimeout(() => {
        formRef.current?.submit();
      }, 0);
    },
    [],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length === 0) return;
    doSearch(query.trim());
  };

  return (
    <div className="space-y-4">
      {/* 검색 폼 */}
      <div className="flex flex-col gap-3">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="IT 용어 검색 (예: 클라우드, 인공지능)"
            className="flex-1 px-3 py-2 text-sm border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shrink-0"
          >
            검색
          </button>
        </form>

        {/* 빠른 검색 칩 */}
        <div className="flex flex-wrap gap-1.5">
          {QUICK_TERMS.map((term) => (
            <button
              key={term}
              onClick={() => doSearch(term)}
              className="px-2.5 py-1 text-xs rounded-full border bg-muted/50 text-muted-foreground hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 dark:hover:bg-blue-950 dark:hover:text-blue-300 transition-colors"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* Hidden POST form → iframe */}
      <form
        ref={formRef}
        action="https://terms.tta.or.kr/dictionary/searchList.do"
        method="POST"
        target="tta-frame"
        className="hidden"
      >
        <input type="hidden" name="searchTerm" value={query} />
        <input type="hidden" name="searchCate" value="ALL" />
      </form>

      {/* 결과 iframe */}
      {searched && (
        <div className="relative border rounded-lg overflow-hidden bg-white">
          <iframe
            ref={iframeRef}
            name="tta-frame"
            title="TTA 정보통신용어사전 검색 결과"
            className="w-full border-0"
            style={{ height: "520px" }}
            sandbox="allow-forms allow-scripts allow-same-origin"
          />
          <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white to-transparent pointer-events-none" />
          <div className="text-center py-2 border-t bg-muted/30">
            <a
              href={`https://terms.tta.or.kr/dictionary/searchList.do`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline"
            >
              TTA 정보통신용어사전에서 전체 보기 →
            </a>
          </div>
        </div>
      )}

      {!searched && (
        <div className="text-center py-8 text-muted-foreground border rounded-lg bg-muted/20">
          <p className="text-sm">용어를 검색하면 TTA 정보통신용어사전 결과가 표시됩니다.</p>
          <p className="text-xs mt-1 text-muted-foreground/60">
            출처: 한국정보통신기술협회(TTA) 정보통신용어사전
          </p>
        </div>
      )}
    </div>
  );
}
