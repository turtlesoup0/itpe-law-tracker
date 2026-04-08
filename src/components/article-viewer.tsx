"use client";

import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Article, ArticleHang, ArticleHo } from "@/types/law";
import { highlightTerms } from "@/lib/legal-terms";

// ---------------------------------------------------------------------------
// 한글 원문 숫자 매핑
// ---------------------------------------------------------------------------
const CIRCLED_NUMBERS = [
  "①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨", "⑩",
  "⑪", "⑫", "⑬", "⑭", "⑮", "⑯", "⑰", "⑱", "⑲", "⑳",
];

const HO_LABELS = [
  "가", "나", "다", "라", "마", "바", "사", "아", "자", "차",
  "카", "타", "파", "하",
];

function circledNumber(n: number): string {
  return CIRCLED_NUMBERS[n - 1] ?? `${n}`;
}

function hoLabel(n: number): string {
  return HO_LABELS[n - 1] ?? `${n}`;
}

/** 원문자(①②...) 또는 숫자 문자열 → 정수 변환 */
function parseHangNumber(raw: string): number {
  // 원문자 → 인덱스
  const idx = CIRCLED_NUMBERS.indexOf(raw);
  if (idx >= 0) return idx + 1;
  // 숫자 문자열
  const n = parseInt(raw, 10);
  return isNaN(n) ? 1 : n;
}

/** 호 라벨(가나다...) 또는 숫자 문자열 → 정수 변환 */
function parseHoNumber(raw: string): number {
  const idx = HO_LABELS.indexOf(raw);
  if (idx >= 0) return idx + 1;
  const n = parseInt(raw, 10);
  return isNaN(n) ? 1 : n;
}

export function ArticleViewer({
  articles,
  lawName,
}: {
  articles: Article[];
  lawName: string;
}) {
  const [activeJo, setActiveJo] = useState<string>(articles[0]?.jo || "");
  const [showCommentary, setShowCommentary] = useState(true);
  const [tocFilter, setTocFilter] = useState("");

  // refs
  const contentRef = useRef<HTMLDivElement>(null);
  const tocRef = useRef<HTMLDivElement>(null);
  const articleRefs = useRef<Map<string, HTMLElement>>(new Map());
  const tocItemRefs = useRef<Map<string, HTMLElement>>(new Map());
  const isClickScrolling = useRef(false);

  // 필터링된 조문 목록
  const filteredArticles = useMemo(() => {
    if (!tocFilter.trim()) return articles;
    const q = tocFilter.trim().toLowerCase();
    return articles.filter(
      (a) =>
        a.jo.toLowerCase().includes(q) ||
        a.title.toLowerCase().includes(q)
    );
  }, [articles, tocFilter]);

  // IntersectionObserver: 현재 보이는 조문 감지
  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isClickScrolling.current) return;
        // 가장 위에 보이는 조문을 active로 설정
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          const jo = visible[0].target.getAttribute("data-jo");
          if (jo) setActiveJo(jo);
        }
      },
      {
        root: container,
        rootMargin: "-10% 0px -70% 0px",
        threshold: 0,
      }
    );

    articleRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [filteredArticles]);

  // 목차에서 active 항목 자동 스크롤
  useEffect(() => {
    const tocItem = tocItemRefs.current.get(activeJo);
    if (tocItem && tocRef.current) {
      const tocRect = tocRef.current.getBoundingClientRect();
      const itemRect = tocItem.getBoundingClientRect();
      // 목차 뷰포트 밖에 있을 때만 스크롤
      if (itemRect.top < tocRect.top || itemRect.bottom > tocRect.bottom) {
        tocItem.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    }
  }, [activeJo]);

  // 목차 클릭 → 본문 스크롤
  const scrollToArticle = useCallback((jo: string) => {
    setActiveJo(jo);
    const el = articleRefs.current.get(jo);
    if (el && contentRef.current) {
      isClickScrolling.current = true;
      el.scrollIntoView({ block: "start", behavior: "smooth" });
      // 스크롤 완료 후 observer 재활성화
      setTimeout(() => { isClickScrolling.current = false; }, 600);
    }
  }, []);

  return (
    <div className="relative flex flex-col md:flex-row gap-4" style={{ height: "calc(100vh - 280px)", minHeight: "500px" }}>
      {/* 좌측 목차 — 독립 스크롤 (모바일: 최대 40vh) */}
      <div className="w-full max-h-[40vh] md:max-h-none md:w-64 md:shrink-0 border rounded-lg bg-card flex flex-col overflow-hidden">
        <div className="p-3 border-b bg-muted shrink-0">
          <h3 className="font-semibold text-sm text-foreground">
            {lawName} 조문
          </h3>
          <div className="mt-2">
            <input
              type="text"
              value={tocFilter}
              onChange={(e) => setTocFilter(e.target.value)}
              placeholder="조문 검색…"
              className="w-full px-2 py-1 text-xs border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
            {tocFilter.trim() && (
              <p className="text-[10px] text-muted-foreground mt-1">
                {filteredArticles.length}/{articles.length}건
              </p>
            )}
          </div>
        </div>
        <nav ref={tocRef} className="flex-1 overflow-y-auto p-2">
          {filteredArticles.map((article) => (
            <button
              key={article.jo}
              ref={(el) => { if (el) tocItemRefs.current.set(article.jo, el); }}
              onClick={() => scrollToArticle(article.jo)}
              className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                activeJo === article.jo
                  ? "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold"
                  : "text-muted-foreground hover:bg-muted font-normal"
              }`}
            >
              {article.jo} {article.title}
            </button>
          ))}
        </nav>
      </div>

      {/* 우측 본문 — 전체 조문 스크롤 (모바일: 최소 높이 확보) */}
      <div ref={contentRef} className="flex-1 min-h-[50vh] md:min-h-0 overflow-y-auto space-y-6 pr-1">
        {filteredArticles.map((article) => (
          <div
            key={article.jo}
            data-jo={article.jo}
            ref={(el) => { if (el) articleRefs.current.set(article.jo, el); }}
          >
            <Card className={activeJo === article.jo ? "ring-2 ring-blue-400/50" : ""}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  {article.jo} {article.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap text-foreground leading-relaxed">
                    {highlightTerms(article.content)}
                  </p>
                  {article.hang && article.hang.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {article.hang.map((h) => (
                        <HangItem key={h.number} hang={h} />
                      ))}
                    </div>
                  )}
                  {/* 항 없이 바로 호가 오는 경우 (예: 제2조 정의) */}
                  {article.ho && article.ho.length > 0 && (
                    <ol className="mt-3 space-y-1 list-none pl-0">
                      {article.ho.map((ho) => (
                        <HoItem key={ho.number} ho={ho} />
                      ))}
                    </ol>
                  )}
                </div>
                {/* 조문 해설 토글 */}
                {showCommentary && article.commentary && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                      {article.commentary}
                    </p>
                    <p className="text-xs text-blue-500 mt-2">* 조문 해설 (참고용)</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ))}

        {filteredArticles.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              검색 결과가 없습니다.
            </CardContent>
          </Card>
        )}
      </div>

      {/* 해설 토글 — 우측 본문 영역 하단 고정 */}
      <div className="absolute bottom-3 right-4 z-10">
        <button
          onClick={() => setShowCommentary(!showCommentary)}
          className="flex items-center gap-2 px-4 py-2 rounded-full shadow-lg border bg-background text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
          title={showCommentary ? "해설 접기" : "해설 보기"}
        >
          <span>{showCommentary ? "💡" : "💬"}</span>
          <span className="hidden sm:inline">{showCommentary ? "해설 접기" : "해설 보기"}</span>
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 항(Hang) 렌더링 컴포넌트
// ---------------------------------------------------------------------------
function HangItem({ hang }: { hang: ArticleHang }) {
  const hasHo = hang.ho && hang.ho.length > 0;
  const hasMok = hang.mok && hang.mok.length > 0;
  const num = parseHangNumber(hang.number);

  return (
    <div className="pl-4 border-l-2 border-blue-200 dark:border-blue-800">
      <div className="text-sm text-foreground/80 dark:text-foreground/90">
        <span className="font-medium text-foreground">
          {circledNumber(num)}
        </span>{" "}
        {highlightTerms(hang.content)}
      </div>
      {hasHo && (
        <ol className="mt-1 ml-4 space-y-1 list-none pl-0">
          {hang.ho!.map((ho) => (
            <HoItem key={ho.number} ho={ho} />
          ))}
        </ol>
      )}
      {hasMok && (
        <ol className="mt-1 ml-6 space-y-0.5 list-none pl-0">
          {hang.mok!.map((m) => (
            <MokItem key={m.number} mok={m} />
          ))}
        </ol>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 호(Ho) 렌더링 컴포넌트
// ---------------------------------------------------------------------------
function HoItem({ ho }: { ho: ArticleHo }) {
  const hoNum = parseHoNumber(ho.number);
  const hasMok = ho.mok && ho.mok.length > 0;
  // 숫자형 호번호인 경우 (1, 2, 3...) 숫자 라벨, 한글형(가,나,다)인 경우 한글 라벨
  const isNumeric = /^\d/.test(ho.number);
  const label = isNumeric ? `${ho.number}.` : `${hoLabel(hoNum)}.`;

  return (
    <li className="text-sm text-foreground/75 dark:text-foreground/85 pl-3 border-l border-slate-300 dark:border-slate-600">
      <span className="font-medium text-foreground">{label}</span>{" "}
      {highlightTerms(ho.content)}
      {hasMok && (
        <ol className="mt-1 ml-4 space-y-0.5 list-none pl-0">
          {ho.mok!.map((m) => (
            <MokItem key={m.number} mok={m} />
          ))}
        </ol>
      )}
    </li>
  );
}

// ---------------------------------------------------------------------------
// 목(Mok) 렌더링 컴포넌트
// ---------------------------------------------------------------------------
function MokItem({ mok }: { mok: { number: string; content: string } }) {
  return (
    <li className="text-sm text-foreground/65 dark:text-foreground/75 pl-3 border-l border-dashed border-slate-300 dark:border-slate-600">
      <span className="font-medium text-foreground/80">{mok.number}.</span>{" "}
      {highlightTerms(mok.content)}
    </li>
  );
}

// highlightTerms는 @/lib/legal-terms에서 임포트
