"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { CompareOldNewItem } from "@/types/law";
import { getChangeTypeColor } from "@/lib/colors";
import { highlightDiff } from "@/lib/diff-utils";
import { AISummarySection } from "@/components/diff-summary";

interface DiffViewerProps {
  changes: CompareOldNewItem[];
  lawName: string;
  amendmentDate?: string;
  enforcementDate?: string;
  amendmentReason?: string;
}

export function DiffViewer({ changes, lawName, amendmentDate, enforcementDate, amendmentReason }: DiffViewerProps) {
  const [mode, setMode] = useState<"side-by-side" | "inline">("side-by-side");

  if (changes.length === 0) {
    return <p className="text-muted-foreground text-center py-8">비교할 변경사항이 없습니다.</p>;
  }

  return (
    <div className="space-y-4">
      {/* Header bar with amendment/enforcement dates */}
      {(amendmentDate || enforcementDate) && (
        <div className="flex flex-wrap items-center gap-3 px-4 py-2 rounded-lg bg-muted/50 border text-xs text-muted-foreground">
          <span className="font-semibold text-foreground text-sm">{lawName} 신구대조표</span>
          <span className="text-muted-foreground/50">|</span>
          {amendmentDate && <span>개정일: {amendmentDate}</span>}
          {enforcementDate && (
            <>
              <span className="text-muted-foreground/50">|</span>
              <span>시행일: {enforcementDate}</span>
            </>
          )}
        </div>
      )}

      {/* 제·개정이유 box */}
      {amendmentReason && (
        <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">개정이유 및 주요내용</h4>
          <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed whitespace-pre-line">{amendmentReason}</p>
          <p className="text-xs text-blue-500 dark:text-blue-400 mt-2">출처: 법제처</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">{!amendmentDate && !enforcementDate ? `${lawName} 신구대조표` : ""}</h3>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant={mode === "side-by-side" ? "default" : "outline"}
            onClick={() => setMode("side-by-side")}
          >
            Side-by-side
          </Button>
          <Button
            size="sm"
            variant={mode === "inline" ? "default" : "outline"}
            onClick={() => setMode("inline")}
          >
            Inline
          </Button>
        </div>
      </div>

      {mode === "side-by-side" ? (
        <div className="border rounded-lg overflow-x-auto">
          <div className="grid grid-cols-[auto_1fr_1fr] min-w-[600px] bg-muted border-b">
            <div className="px-4 py-2 font-medium text-sm text-foreground border-r w-28">조문</div>
            <div className="px-4 py-2 font-medium text-sm text-red-700 dark:text-red-400 border-r">개정 전</div>
            <div className="px-4 py-2 font-medium text-sm text-green-700 dark:text-green-400">개정 후</div>
          </div>
          {changes.map((item, i) => {
            const colors = getChangeTypeColor(item.changeType);
            const diff = highlightDiff(item.oldText, item.newText);
            return (
              <div key={i} className={`border-b last:border-b-0 ${colors.bg}`}>
                <div className={`grid grid-cols-[auto_1fr_1fr] min-w-[600px]`}>
                  <div className={`px-4 py-3 border-r w-28 ${colors.border}`}>
                    <div className="font-medium text-sm text-foreground">{item.articleNo}</div>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${colors.badge} mt-1 inline-block`}>
                      {item.changeType}
                    </span>
                    {item.amendmentDate && (
                      <div className="text-xs text-muted-foreground mt-1">{item.amendmentDate}</div>
                    )}
                  </div>
                  <div className="px-4 py-3 text-sm text-foreground border-r" dangerouslySetInnerHTML={{ __html: diff.oldHtml || '<span class="text-muted-foreground italic">없음</span>' }} />
                  <div className="px-4 py-3 text-sm text-foreground" dangerouslySetInnerHTML={{ __html: diff.newHtml || '<span class="text-muted-foreground italic">없음</span>' }} />
                </div>
                <div className="px-4 pb-3">
                  <AISummarySection item={item} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          {changes.map((item, i) => {
            const colors = getChangeTypeColor(item.changeType);
            const diff = highlightDiff(item.oldText, item.newText);
            return (
              <div key={i} className={`border-b last:border-b-0 p-4 ${colors.bg}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-sm text-foreground">{item.articleNo}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${colors.badge}`}>{item.changeType}</span>
                  {item.amendmentDate && (
                    <span className="text-xs text-muted-foreground">개정 {item.amendmentDate}</span>
                  )}
                </div>
                {item.oldText && (
                  <div className="text-sm mb-1">
                    <span className="text-red-600 font-mono mr-1">-</span>
                    <span className="bg-red-100 dark:bg-red-900/30 text-foreground" dangerouslySetInnerHTML={{ __html: diff.oldHtml }} />
                  </div>
                )}
                {item.newText && (
                  <div className="text-sm">
                    <span className="text-green-600 font-mono mr-1">+</span>
                    <span className="bg-green-100 dark:bg-green-900/30 text-foreground" dangerouslySetInnerHTML={{ __html: diff.newHtml }} />
                  </div>
                )}
                <AISummarySection item={item} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
