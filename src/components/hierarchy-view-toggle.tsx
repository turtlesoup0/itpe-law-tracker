"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LawHierarchyGraph } from "@/components/law-hierarchy-graph";
import type { HierarchyNode } from "@/types/law";

type ViewMode = "law" | "agency";

export function HierarchyViewToggle({
  lawHierarchy,
  agencyHierarchy,
}: {
  lawHierarchy: HierarchyNode[];
  agencyHierarchy: HierarchyNode[];
}) {
  const [mode, setMode] = useState<ViewMode>("law");
  const hasAgency = agencyHierarchy.length > 0;

  const descriptions: Record<ViewMode, { title: string; desc: string }> = {
    law: {
      title: "법령 계층 구조",
      desc: "법률 → 시행령 → 시행규칙 → 고시, 그리고 연관 법령의 관계를 시각화합니다.",
    },
    agency: {
      title: "유관기관 계층",
      desc: "이 법에서 규정하는 소관 부처·산하기관·위원회 간의 관계를 보여줍니다.",
    },
  };

  const current = descriptions[mode];

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <CardTitle>{current.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{current.desc}</p>
          </div>
          {hasAgency && (
            <div className="flex rounded-lg border bg-muted p-1 shrink-0">
              <button
                onClick={() => setMode("law")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  mode === "law"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                법령 계층
              </button>
              <button
                onClick={() => setMode("agency")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  mode === "agency"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                유관기관
              </button>
            </div>
          )}
        </div>

        {/* 범례 */}
        <div className="flex flex-wrap gap-3 mt-4">
          {mode === "law" ? (
            <>
              <Legend color="#2563EB" label="법률" />
              <Legend color="#059669" label="시행령" />
              <Legend color="#D97706" label="시행규칙" />
              <Legend color="#9333EA" label="고시" />
              <Legend color="#6366F1" label="연관법" dashed />
            </>
          ) : (
            <Legend color="#E11D48" label="기관" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <LawHierarchyGraph
          hierarchy={mode === "law" ? lawHierarchy : agencyHierarchy}
        />
      </CardContent>
    </Card>
  );
}

function Legend({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span
        className="inline-block w-3 h-3 rounded-sm"
        style={{
          backgroundColor: color + "22",
          border: `2px ${dashed ? "dashed" : "solid"} ${color}`,
        }}
      />
      {label}
    </div>
  );
}
