"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { MobileNav } from "@/app/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "대시보드" },
  { href: "/laws", label: "법령 목록" },
  { href: "/search", label: "AI 검색" },
  { href: "/compare", label: "신구법 비교" },
];

export function NavBar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b bg-card">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:gap-7">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          {/* 법전(겹친 문서) 마크 — 가이드라인 트래커의 레이어 마크와 같은 계열 */}
          <span className="grid size-[22px] place-items-center rounded-md bg-primary text-primary-foreground">
            <svg
              className="size-[13px]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.1}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 4.5h6a2.5 2.5 0 0 1 2 1 2.5 2.5 0 0 1 2-1h6v13h-6a2.5 2.5 0 0 0-2 1 2.5 2.5 0 0 0-2-1H4v-13z" />
              <path d="M12 5.5v13" />
            </svg>
          </span>
          <span className="truncate text-[14.5px] font-semibold tracking-tight">
            IT 법령 트래커
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-0.5 sm:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "rounded-md px-2.5 py-1.5 text-[13px] whitespace-nowrap transition-colors",
                isActive(item.href)
                  ? "bg-primary-soft font-medium text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <Link
            href="/settings"
            aria-label="설정"
            aria-current={isActive("/settings") ? "page" : undefined}
            className={cn(
              "grid size-8 place-items-center rounded-lg border transition-colors",
              isActive("/settings")
                ? "border-primary/30 bg-primary-soft text-primary"
                : "bg-card text-muted-foreground hover:border-border-strong hover:bg-muted hover:text-foreground",
            )}
          >
            <svg
              className="size-[15px]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </Link>
          <ThemeToggle />
          <div className="sm:hidden">
            <MobileNav items={NAV_ITEMS} />
          </div>
        </div>
      </div>
    </header>
  );
}
