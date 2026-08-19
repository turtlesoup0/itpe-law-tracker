"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="grid size-8 place-items-center rounded-lg border bg-card text-muted-foreground transition-colors hover:border-border-strong hover:bg-muted hover:text-foreground"
      aria-label={dark ? "라이트 모드로 전환" : "다크 모드로 전환"}
      title="테마 전환"
    >
      {/* 반쯤 채운 원 — 라이트/다크 어느 쪽에서도 같은 무게로 읽힌다 */}
      <svg
        className="size-[15px]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 3.5a8.5 8.5 0 0 1 0 17V3.5z" fill="currentColor" stroke="none" />
      </svg>
    </button>
  );
}
