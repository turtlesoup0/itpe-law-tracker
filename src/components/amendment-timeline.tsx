"use client";

import Link from "next/link";
import type { Amendment } from "@/types/law";

function getStatusColor(enforcementDate: string): { bg: string; text: string; label: string } {
  const today = new Date();
  const enfDate = new Date(enforcementDate);
  const daysUntil = Math.ceil((enfDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntil < 0) return { bg: "bg-green-100 dark:bg-green-900", text: "text-green-700 dark:text-green-300", label: "시행 중" };
  if (daysUntil <= 30) return { bg: "bg-red-100 dark:bg-red-900", text: "text-red-700 dark:text-red-300", label: `D-${daysUntil}` };
  if (daysUntil <= 90) return { bg: "bg-amber-100 dark:bg-amber-900", text: "text-amber-700 dark:text-amber-300", label: `D-${daysUntil}` };
  return { bg: "bg-blue-100 dark:bg-blue-900", text: "text-blue-700 dark:text-blue-300", label: `D-${daysUntil}` };
}

function getTypeColor(type: string): string {
  switch (type) {
    case "전부개정": return "bg-red-500";
    case "일부개정": return "bg-blue-500";
    case "제정": return "bg-green-500";
    case "폐지": return "bg-slate-500";
    default: return "bg-slate-400";
  }
}

function getImportance(amd: Amendment): { level: "high" | "medium" | "low"; label: string } {
  // 전부개정 is always high importance
  if (amd.type === "전부개정") return { level: "high", label: "중요" };
  // 제정 is high
  if (amd.type === "제정") return { level: "high", label: "중요" };
  // 일부개정 with keywords indicating significance
  const highKeywords = ["신설", "삭제", "강화", "과징금", "벌칙", "의무"];
  if (highKeywords.some(kw => amd.summary.includes(kw))) return { level: "high", label: "중요" };
  const medKeywords = ["개정", "변경", "추가", "확대"];
  if (medKeywords.some(kw => amd.summary.includes(kw))) return { level: "medium", label: "주목" };
  return { level: "low", label: "일반" };
}

function renderAmendmentItem(amd: Amendment, lawId: string) {
  const status = getStatusColor(amd.enforcementDate);
  const importance = getImportance(amd);

  return (
    <div key={amd.id} className="relative pl-12">
      {/* 타임라인 점 */}
      <div className={`absolute left-2.5 w-3 h-3 rounded-full ${getTypeColor(amd.type)} ring-4 ring-background`} />

      <div className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="text-sm font-medium text-foreground">{amd.date}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${status.bg} ${status.text}`}>
            {status.label}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            {amd.type}
          </span>
          {importance.level !== "low" && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              importance.level === "high"
                ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                : "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300"
            }`}>
              {importance.label}
            </span>
          )}
        </div>
        <p className="text-sm text-foreground mb-2">{amd.summary}</p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>시행일: {amd.enforcementDate}</span>
          <Link
            href={`/compare?lawId=${lawId}&amdId=${amd.id}`}
            className="text-blue-600 hover:underline"
          >
            신구대조 보기
          </Link>
        </div>
      </div>
    </div>
  );
}

export function AmendmentTimeline({ amendments, lawId }: { amendments: Amendment[]; lawId: string }) {
  const sorted = [...amendments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (sorted.length === 0) {
    return <p className="text-muted-foreground text-center py-8">등록된 개정 이력이 없습니다.</p>;
  }

  const today = new Date();
  const upcoming = sorted.filter(amd => new Date(amd.enforcementDate) > today);
  const past = sorted.filter(amd => new Date(amd.enforcementDate) <= today);

  return (
    <div className="relative">
      {/* 수직 선 */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

      <div className="space-y-6">
        {upcoming.length > 0 && (
          <>
            <div className="relative pl-12">
              <div className="text-sm font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                시행 예정
              </div>
            </div>
            {upcoming.map((amd) => renderAmendmentItem(amd, lawId))}
          </>
        )}

        {upcoming.length > 0 && past.length > 0 && (
          <div className="relative pl-12">
            <div className="border-t border-dashed border-border my-2" />
          </div>
        )}

        {past.length > 0 && (
          <>
            <div className="relative pl-12">
              <div className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
                시행 완료
              </div>
            </div>
            {past.map((amd) => renderAmendmentItem(amd, lawId))}
          </>
        )}
      </div>
    </div>
  );
}
