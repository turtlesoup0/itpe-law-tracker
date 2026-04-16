/**
 * 관련 실무 가이드라인 표시 컴포넌트.
 *
 * guideline-manifest.json에서 매칭된 가이드라인을
 * 법령 상세 페이지의 "관련 법령" 탭에 표시합니다.
 */

import {
  type MatchedGuideline,
  getGuidelineTrackerUrl,
} from "@/lib/data/guideline-manifest-reader";

// 가이드라인 트래커의 카테고리 → 한글 라벨 + 색상
const GL_CATEGORY: Record<string, { label: string; color: string }> = {
  info_security: { label: "정보보안", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  privacy: { label: "개인정보", color: "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300" },
  software: { label: "SW", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" },
  data: { label: "데이터", color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300" },
  cloud: { label: "클라우드", color: "bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300" },
  ai: { label: "AI", color: "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300" },
  e_gov: { label: "전자정부", color: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" },
  finance: { label: "금융", color: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300" },
  other: { label: "기타", color: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
};

export function RelatedGuidelines({
  guidelines,
  stale,
}: {
  guidelines: MatchedGuideline[];
  stale?: boolean;
}) {
  if (guidelines.length === 0) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
        매칭되는 실무 가이드라인이 없습니다.
      </p>
    );
  }

  // matchedBy 기준으로 그룹핑
  const grouped = new Map<string, MatchedGuideline[]>();
  for (const g of guidelines) {
    const group = grouped.get(g.matchedBy) ?? [];
    group.push(g);
    grouped.set(g.matchedBy, group);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          관련 실무 가이드라인 {guidelines.length}건
          <span className="text-xs ml-2 text-slate-400 dark:text-slate-500">
            가이드라인 트래커 연동
          </span>
        </p>
        {stale && (
          <span className="text-xs text-amber-600 dark:text-amber-400">
            데이터 갱신 필요
          </span>
        )}
      </div>

      {Array.from(grouped.entries()).map(([ruleTitle, items]) => (
        <div key={ruleTitle} className="space-y-2">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 border-l-2 border-slate-300 dark:border-slate-600 pl-2">
            {ruleTitle}
          </p>
          {items.map((g) => {
            const cat = GL_CATEGORY[g.category] ?? GL_CATEGORY.other;
            const href = getGuidelineTrackerUrl(g.url);

            return (
              <a
                key={g.id}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 p-3 rounded-lg border border-dashed border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
              >
                <span className={`shrink-0 text-[11px] px-2 py-0.5 rounded-full ${cat.color}`}>
                  {cat.label}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {g.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {g.agencyName}
                    {g.latestPublishedDate && ` · ${g.latestPublishedDate}`}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-slate-400 group-hover:text-blue-500 transition-colors mt-1">
                  →
                </span>
              </a>
            );
          })}
        </div>
      ))}
    </div>
  );
}
