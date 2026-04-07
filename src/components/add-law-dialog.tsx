"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Law, LawCategory } from "@/types/law";

// ---------------------------------------------------------------------------
// Hook: read / add / remove custom laws from localStorage
// ---------------------------------------------------------------------------

export function useCustomLaws(): [Law[], (law: Law) => void, (id: string) => void] {
  const [customLaws, setCustomLaws] = useState<Law[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("customLaws");
      if (stored) setCustomLaws(JSON.parse(stored));
    } catch {
      /* ignore corrupt data */
    }
  }, []);

  const addLaw = useCallback(
    (law: Law) => {
      const updated = [...customLaws, law];
      localStorage.setItem("customLaws", JSON.stringify(updated));
      setCustomLaws(updated);
    },
    [customLaws],
  );

  const removeLaw = useCallback(
    (id: string) => {
      const updated = customLaws.filter((l) => l.id !== id);
      localStorage.setItem("customLaws", JSON.stringify(updated));
      setCustomLaws(updated);
    },
    [customLaws],
  );

  return [customLaws, addLaw, removeLaw];
}

// ---------------------------------------------------------------------------
// Helper: generate kebab-case id from shortName
// ---------------------------------------------------------------------------

function toKebab(str: string): string {
  return str
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^가-힣a-zA-Z0-9-]/g, "")
    .toLowerCase();
}

// ---------------------------------------------------------------------------
// Category options shown in the dialog
// ---------------------------------------------------------------------------

const CATEGORY_OPTIONS: { label: string; value: LawCategory }[] = [
  { label: "정보보호", value: "정보보호" },
  { label: "산업진흥", value: "산업진흥" },
  { label: "전자정부", value: "전자정부" },
  { label: "계약", value: "계약" },
  { label: "데이터", value: "데이터" },
  { label: "기타", value: "산업진흥" }, // 기타 maps to 산업진흥
];

// ---------------------------------------------------------------------------
// AddLawDialog component
// ---------------------------------------------------------------------------

export function AddLawDialog({ onAdd }: { onAdd: (law: Law) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [category, setCategory] = useState<LawCategory>("산업진흥");
  const [description, setDescription] = useState("");
  const firstInputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setName("");
    setShortName("");
    setCategory("산업진흥");
    setDescription("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !shortName.trim()) return;

    const id = `custom-${toKebab(shortName)}`;
    const law: Law = {
      id,
      lawId: id,
      mst: "",
      name: name.trim(),
      shortName: shortName.trim(),
      category,
      description: description.trim(),
      color: "slate",
    };

    onAdd(law);
    reset();
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-4 py-2 text-sm font-medium rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
      >
        + 법령 추가
      </button>

      {open && (
        /* backdrop */
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
        >
          {/* modal */}
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-law-dialog-title"
            className="relative w-full max-w-md mx-4 rounded-xl border border-border bg-card text-foreground shadow-xl p-6"
            onClick={(e) => e.stopPropagation()}
            ref={(node) => {
              // Focus the first input when the modal mounts
              if (node) {
                requestAnimationFrame(() => firstInputRef.current?.focus());
              }
            }}
          >
            {/* close button */}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="닫기"
            >
              ✕
            </button>

            <h2 id="add-law-dialog-title" className="text-lg font-semibold mb-4">법령 추가</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 법령명 */}
              <div>
                <label htmlFor="name-input" className="block text-sm font-medium mb-1">법령명</label>
                <input
                  id="name-input"
                  ref={firstInputRef}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="예: 개인정보 보호법"
                  required
                  aria-required="true"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* 약칭 */}
              <div>
                <label htmlFor="shortname-input" className="block text-sm font-medium mb-1">약칭</label>
                <input
                  id="shortname-input"
                  type="text"
                  value={shortName}
                  onChange={(e) => setShortName(e.target.value)}
                  placeholder="예: 개보법"
                  required
                  aria-required="true"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* 카테고리 */}
              <div>
                <label htmlFor="category-input" className="block text-sm font-medium mb-1">카테고리</label>
                <select
                  id="category-input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as LawCategory)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.label} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 설명 */}
              <div>
                <label htmlFor="description-input" className="block text-sm font-medium mb-1">설명</label>
                <textarea
                  id="description-input"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="이 법령에 대한 간단한 설명..."
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 text-sm rounded-md border border-border text-foreground hover:bg-accent transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium rounded-md bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
                >
                  추가
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
