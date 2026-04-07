"use client";

import { useState, useCallback } from "react";
import type { CompareOldNewItem } from "@/types/law";
import { useLLMSettings } from "@/lib/llm-settings";

/**
 * 캐싱된 요약 우선 표시, 없으면 실시간 LLM 버튼 fallback
 */
export function AISummarySection({ item }: { item: CompareOldNewItem }) {
  if (item.summary) {
    return (
      <div className="mt-2 p-2.5 bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded text-xs text-purple-800 dark:text-purple-200 leading-relaxed">
        <span className="font-semibold">📋 요약:</span> {item.summary}
      </div>
    );
  }

  return <LiveSummaryButton item={item} />;
}

/**
 * 실시간 LLM 요약 버튼 — 사용자의 LLM 설정(provider/apiKey/model)으로 호출
 */
function LiveSummaryButton({ item }: { item: CompareOldNewItem }) {
  const [llmSettings] = useLLMSettings();
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSummarize = useCallback(async () => {
    if (!llmSettings?.apiKey) {
      setError("설정 > API 키를 먼저 등록하세요");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/llm/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldText: item.oldText,
          newText: item.newText,
          articleNo: item.articleNo,
          provider: llmSettings.provider,
          apiKey: llmSettings.apiKey,
          model: llmSettings.model,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSummary(data.summary);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "요약 실패");
    } finally {
      setLoading(false);
    }
  }, [item, llmSettings]);

  if (summary) {
    return (
      <div className="mt-2 p-2.5 bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded text-xs text-purple-800 dark:text-purple-200 leading-relaxed">
        <span className="font-semibold">AI 요약:</span> {summary}
      </div>
    );
  }

  return (
    <div className="mt-1.5 flex items-center gap-2">
      <button
        onClick={handleSummarize}
        disabled={loading}
        className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200 underline underline-offset-2 disabled:opacity-50"
      >
        {loading ? "요약 중..." : "✨ AI 요약"}
      </button>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
