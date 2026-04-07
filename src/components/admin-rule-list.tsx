"use client";

import { useState } from "react";
import { ADMIN_RULE_TYPE_COLORS } from "@/lib/colors";
import { ADMIN_RULES_MAP } from "@/lib/data/admin-rules";

export function AdminRuleList({ lawId, lawShortName }: { lawId: string; lawShortName: string }) {
  const rules = ADMIN_RULES_MAP[lawId] ?? [];
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (rules.length === 0) {
    return <p className="text-slate-500 dark:text-slate-400 text-center py-4">이 법령의 관련 고시/행정규칙이 아직 등록되지 않았습니다.</p>;
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{lawShortName} 관련 고시 · 행정규칙 {rules.length}건</p>
      {rules.map((rule) => {
        const isExpanded = expandedId === rule.id;
        return (
          <div key={rule.id} className="border rounded-lg overflow-hidden">
            <button
              className="w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              onClick={() => setExpandedId(isExpanded ? null : rule.id)}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs px-2 py-0.5 rounded-full ${ADMIN_RULE_TYPE_COLORS[rule.type] ?? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"}`}>
                  {rule.type}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{rule.department}</span>
                {rule.proclamationDate && (
                  <span className="text-xs text-slate-400 dark:text-slate-500">{rule.proclamationDate}</span>
                )}
                <span className="ml-auto text-xs text-slate-400">{isExpanded ? "▲" : "▼"}</span>
              </div>
              <p className="font-medium text-sm text-slate-900 dark:text-slate-100">{rule.name}</p>
              {rule.summary && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{rule.summary}</p>}
            </button>

            {isExpanded && (
              <div className="border-t px-4 pb-4 pt-3 bg-slate-50/50 dark:bg-slate-800/50">
                {rule.articles && rule.articles.length > 0 && (
                  <div className="space-y-3 mb-3">
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-300">핵심 조문 요약</p>
                    {rule.articles.map((art) => (
                      <div key={art.jo} className="pl-3 border-l-2 border-blue-300 dark:border-blue-700">
                        <p className="text-xs font-medium text-blue-700 dark:text-blue-300">{art.jo} {art.title}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{art.content}</p>
                      </div>
                    ))}
                  </div>
                )}
                {rule.url && (
                  <a
                    href={rule.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    법제처에서 전문 보기 →
                  </a>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
