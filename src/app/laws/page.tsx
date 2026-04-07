"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { IT_LAWS, type LawCategory, CATEGORIES } from "@/lib/laws-data";
import { LawCard } from "@/components/law-card";
import { useCustomLaws, AddLawDialog } from "@/components/add-law-dialog";
import { CATEGORY_SECTION_COLORS } from "@/lib/colors";

const filterTabs: { label: string; value: LawCategory | "전체" }[] = [
  { label: "전체", value: "전체" },
  ...CATEGORIES.map((c) => ({ label: c.label, value: c.value })),
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
    const categoryOrder = CATEGORIES.map((c) => c.value);
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
    <div className="space-y-6 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">법령 목록</h1>
          <p className="text-slate-600 dark:text-slate-400">IT 관련 주요 법령을 탐색하세요.</p>
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
              className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                activeCategory === cat.value
                  ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-400"
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
              <h2 className={`text-sm font-semibold uppercase tracking-wider mb-3 pl-1 border-l-4 pl-3 ${CATEGORY_SECTION_COLORS[category] ?? "border-slate-400 text-slate-600 dark:text-slate-400"}`}>
                {category}
                <span className="ml-2 text-xs font-normal text-muted-foreground">{laws.length}건</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {laws.map((law) => (
                  <div key={law.id} className="relative group">
                    <LawCard law={law} />
                    {isCustom(law.id) && (
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); removeCustomLaw(law.id); }}
                        className="absolute top-2 right-2 px-2 py-0.5 text-xs rounded bg-red-500/90 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filtered.map((law) => (
            <div key={law.id} className="relative group">
              <LawCard law={law} />
              {isCustom(law.id) && (
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); removeCustomLaw(law.id); }}
                  className="absolute top-2 right-2 px-2 py-0.5 text-xs rounded bg-red-500/90 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  삭제
                </button>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full text-center text-slate-500 dark:text-slate-400 py-12">
              검색 결과가 없습니다.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
