"use client";

import { useState } from "react";
import { ADMIN_RULE_TYPE_COLORS } from "@/lib/colors";
import { ADMIN_RULES_MAP } from "@/lib/data/admin-rules";

export function AdminRuleList({ lawId, lawShortName }: { lawId: string; lawShortName: string }) {
  const rules = ADMIN_RULES_MAP[lawId] ?? [];
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (rules.length === 0) {
    return <p className="py-4 text-center text-sm text-muted-foreground">이 법령의 관련 고시/행정규칙이 아직 등록되지 않았습니다.</p>;
  }

  return (
    <div className="space-y-3">
      <p className="mb-4 text-sm text-muted-foreground">{lawShortName} 관련 고시 · 행정규칙 {rules.length}건</p>
      {rules.map((rule) => {
        const isExpanded = expandedId === rule.id;
        return (
          <div key={rule.id} className="border rounded-lg overflow-hidden">
            <button
              className="w-full p-4 text-left transition-colors hover:bg-muted"
              onClick={() => setExpandedId(isExpanded ? null : rule.id)}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs px-2 py-0.5 rounded-full ${ADMIN_RULE_TYPE_COLORS[rule.type] ?? "bg-muted text-muted-foreground"}`}>
                  {rule.type}
                </span>
                <span className="text-xs text-muted-foreground">{rule.department}</span>
                {rule.proclamationDate && (
                  <span className="text-xs text-faint">{rule.proclamationDate}</span>
                )}
                <span className="ml-auto text-xs text-faint">{isExpanded ? "▲" : "▼"}</span>
              </div>
              <p className="text-sm font-medium text-foreground">{rule.name}</p>
              {rule.summary && <p className="mt-1 text-xs text-muted-foreground">{rule.summary}</p>}
            </button>

            {isExpanded && (
              <div className="border-t bg-muted/50 px-4 pt-3 pb-4">
                {rule.articles && rule.articles.length > 0 && (
                  <div className="space-y-3 mb-3">
                    <p className="text-xs font-medium text-muted-foreground">핵심 조문 요약</p>
                    {rule.articles.map((art) => (
                      <div key={art.jo} className="border-l-2 border-primary/35 pl-3">
                        <p className="text-xs font-medium text-primary">{art.jo} {art.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{art.content}</p>
                      </div>
                    ))}
                  </div>
                )}
                {rule.url && (
                  <a
                    href={rule.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
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
