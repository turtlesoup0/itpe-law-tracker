"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { IT_LAWS, type LawCategory } from "@/lib/laws-data";
import { LawCard } from "@/components/law-card";
import { useCustomLaws, AddLawDialog } from "@/components/add-law-dialog";
import { CATEGORY_ORDER, categorySectionClass } from "@/lib/colors";

const filterTabs: { label: string; value: LawCategory | "전체" }[] = [
  { label: "전체", value: "전체" },
  ...CATEGORY_ORDER.map((c) => ({ label: c, value: c })),
];

export default function LawsPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<LawCategory | "전체">("전체");
  const [customLaws, addCustomLaw, removeCustomLaw] = useCustomLaws();

  const allLaws = [...IT_LAWS, ...customLaws];

  const filtered = allLaws.filter((law) => {
    const matchSearch = search === "" || law.name.includes(search) || law.shortName.includes(search);
    const matchCategory = activeCategory === "전체" || law.category === activeCategory;
    return matchSearch && matchCategory;
  });

  const isCustom = (id: string) => customLaws.some((l) => l.id === id);

  // 카테고리별 그룹핑 (CATEGORIES 순서 유지)
  const grouped = useMemo(() => {
    const categoryOrder = CATEGORY_ORDER;
    const groups: { category: LawCategory; laws: typeof filtered }[] = [];
    for (const cat of categoryOrder) {
      const laws = filtered.filter((l) => l.category === cat);
      if (laws.length > 0) groups.push({ category: cat, laws });
    }
    // 카테고리에 속하지 않는 커스텀 법령
    const uncategorized = filtered.filter(
      (l) => !categoryOrder.includes(l.category)
    );
    if (uncategorized.length > 0) {
      groups.push({ category: "기타" as LawCategory, laws: uncategorized });
    }
    return groups;
  }, [filtered]);

  const showGroupHeaders = activeCategory === "전체" && !search.trim();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-[23px] font-semibold tracking-tight">법령 목록</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            IT 관련 주요 법령을 분야별로 탐색합니다.
          </p>
        </div>
        <AddLawDialog onAdd={addCustomLaw} />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <Input
          placeholder="법령명 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:max-w-sm"
        />
        <div className="flex gap-2 flex-wrap">
          {filterTabs.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              aria-pressed={activeCategory === cat.value}
              className={`rounded-full border px-3 py-1.5 text-[13px] transition-colors ${
                activeCategory === cat.value
                  ? "border-primary/30 bg-primary-soft font-medium text-primary"
                  : "bg-card text-muted-foreground hover:border-border-strong hover:bg-muted hover:text-foreground"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {showGroupHeaders ? (
        <div className="space-y-8">
          {grouped.map(({ category, laws }) => (
            <section key={category}>
              <h2 className={`mb-3 border-l-2 pl-3 text-[15px] font-semibold tracking-tight ${categorySectionClass(category)}`}>
                {category}
                <span className="ml-2 text-xs font-normal text-faint">{laws.length}건</span>
              </h2>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                {laws.map((law) => (
                  <div key={law.id} className="relative group">
                    <LawCard law={law} />
                    {isCustom(law.id) && (
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); removeCustomLaw(law.id); }}
                        className="absolute top-2 right-2 rounded bg-destructive px-2 py-0.5 text-xs text-background opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((law) => (
            <div key={law.id} className="relative group">
              <LawCard law={law} />
              {isCustom(law.id) && (
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); removeCustomLaw(law.id); }}
                  className="absolute top-2 right-2 rounded bg-destructive px-2 py-0.5 text-xs text-background opacity-0 transition-opacity group-hover:opacity-100"
                >
                  삭제
                </button>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full py-12 text-center text-sm text-muted-foreground">
              검색 결과가 없습니다.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
