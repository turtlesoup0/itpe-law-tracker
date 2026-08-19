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

/**
 * 가이드라인 트래커의 카테고리 → 한글 라벨 + 분야 토큰.
 *
 * 라벨과 색은 itpe-guideline-tracker-web 의 lib/categories.ts 와 맞춰 둔다.
 * 여기서 링크를 따라가면 같은 분야가 같은 색으로 이어져야 하는데, 이전에는
 * 이 파일이 Tailwind 원색을 따로 들고 있어서 info_security 가 여기서는 파랑,
 * 저쪽에서는 보라로 보였다.
 */
const GL_CATEGORY: Record<string, { label: string; token: string }> = {
  info_security: { label: "정보보안", token: "cat-infosec" },
  privacy: { label: "개인정보", token: "cat-privacy" },
  ai: { label: "AI", token: "cat-ai" },
  e_gov: { label: "전자정부", token: "cat-egov" },
  data: { label: "데이터", token: "cat-data" },
  software: { label: "SW", token: "cat-software" },
  cloud: { label: "클라우드", token: "cat-cloud" },
  finance: { label: "금융", token: "cat-finance" },
  other: { label: "기타", token: "cat-other" },
};

/** Tailwind JIT 가 템플릿 리터럴을 못 보므로 조합을 한 번 나열해 둔다. */
const GL_CLASS_SAFELIST = [
  "bg-cat-infosec/12 text-cat-infosec",
  "bg-cat-privacy/12 text-cat-privacy",
  "bg-cat-ai/12 text-cat-ai",
  "bg-cat-egov/12 text-cat-egov",
  "bg-cat-data/12 text-cat-data",
  "bg-cat-software/12 text-cat-software",
  "bg-cat-cloud/12 text-cat-cloud",
  "bg-cat-finance/12 text-cat-finance",
  "bg-cat-other/12 text-cat-other",
];
void GL_CLASS_SAFELIST;

export function RelatedGuidelines({
  guidelines,
  stale,
}: {
  guidelines: MatchedGuideline[];
  stale?: boolean;
}) {
  if (guidelines.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
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
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          관련 실무 가이드라인 {guidelines.length}건
          <span className="ml-2 text-xs text-faint">가이드라인 트래커 연동</span>
        </p>
        {stale && <span className="text-xs text-warning">데이터 갱신 필요</span>}
      </div>

      {Array.from(grouped.entries()).map(([ruleTitle, items]) => (
        <div key={ruleTitle} className="space-y-2">
          <p className="border-l-2 pl-2 text-xs font-medium text-muted-foreground">
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
                className="group flex items-start gap-3 rounded-lg border border-dashed p-3 transition-colors hover:border-border-strong hover:bg-muted"
              >
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] bg-${cat.token}/12 text-${cat.token}`}
                >
                  {cat.label}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium transition-colors group-hover:text-primary">
                    {g.title}
                  </p>
                  <p className="mt-0.5 text-xs text-faint">
                    {g.agencyName}
                    {g.latestPublishedDate && ` · ${g.latestPublishedDate}`}
                  </p>
                </div>
                <span className="mt-1 shrink-0 text-xs text-faint transition-colors group-hover:text-primary">
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
