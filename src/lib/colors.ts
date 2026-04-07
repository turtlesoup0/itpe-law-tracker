/**
 * 통합 색상 유틸리티
 * 프로젝트 전체에서 사용되는 색상 매핑을 한 곳에서 관리합니다.
 */

// ---------------------------------------------------------------------------
// 카테고리 색상 (정보보호, 산업진흥, 전자정부, 계약, 데이터)
// ---------------------------------------------------------------------------

/** CategoryBadge 용 — Badge 배경+텍스트 */
export const CATEGORY_BADGE_COLORS: Record<string, string> = {
  "정보보호": "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-900",
  "산업진흥": "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900 dark:text-emerald-200 dark:hover:bg-emerald-900",
  "전자정부": "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900 dark:text-amber-200 dark:hover:bg-amber-900",
  "계약": "bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-900 dark:text-purple-200 dark:hover:bg-purple-900",
  "데이터": "bg-cyan-100 text-cyan-800 hover:bg-cyan-100 dark:bg-cyan-900 dark:text-cyan-200 dark:hover:bg-cyan-900",
};

/** 카테고리 섹션 헤더 — 좌측 border + 텍스트 */
export const CATEGORY_SECTION_COLORS: Record<string, string> = {
  "정보보호": "border-blue-500 text-blue-700 dark:text-blue-300",
  "산업진흥": "border-emerald-500 text-emerald-700 dark:text-emerald-300",
  "전자정부": "border-amber-500 text-amber-700 dark:text-amber-300",
  "계약": "border-purple-500 text-purple-700 dark:text-purple-300",
  "데이터": "border-cyan-500 text-cyan-700 dark:text-cyan-300",
};

// ---------------------------------------------------------------------------
// LawCard border 색상 (Law.color 기반)
// ---------------------------------------------------------------------------

export const LAW_BORDER_COLORS: Record<string, string> = {
  blue: "border-l-blue-500",
  emerald: "border-l-emerald-500",
  amber: "border-l-amber-500",
  purple: "border-l-purple-500",
  cyan: "border-l-cyan-500",
};

// ---------------------------------------------------------------------------
// 개정 유형·상태 색상
// ---------------------------------------------------------------------------

/** 개정 유형 (전부개정, 일부개정, ...) → 타임라인 도트 색상 */
export function getAmendmentTypeColor(type: string): string {
  switch (type) {
    case "전부개정": return "bg-red-500";
    case "일부개정": return "bg-blue-500";
    case "제정": return "bg-green-500";
    case "폐지": return "bg-slate-500";
    default: return "bg-slate-400";
  }
}

/** 시행일 기준 상태 색상 */
export function getEnforcementStatusColor(enforcementDate: string): {
  bg: string;
  text: string;
  label: string;
} {
  const today = new Date();
  const enfDate = new Date(enforcementDate);
  const daysUntil = Math.ceil(
    (enfDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (daysUntil < 0)
    return { bg: "bg-green-100 dark:bg-green-900", text: "text-green-700 dark:text-green-300", label: "시행 중" };
  if (daysUntil <= 30)
    return { bg: "bg-red-100 dark:bg-red-900", text: "text-red-700 dark:text-red-300", label: `D-${daysUntil}` };
  if (daysUntil <= 90)
    return { bg: "bg-amber-100 dark:bg-amber-900", text: "text-amber-700 dark:text-amber-300", label: `D-${daysUntil}` };
  return { bg: "bg-blue-100 dark:bg-blue-900", text: "text-blue-700 dark:text-blue-300", label: `D-${daysUntil}` };
}

// ---------------------------------------------------------------------------
// 신구대조 변경 유형 색상
// ---------------------------------------------------------------------------

export function getChangeTypeColor(type: string): {
  bg: string;
  border: string;
  badge: string;
} {
  switch (type) {
    case "신설":
      return {
        bg: "bg-green-50 dark:bg-green-950",
        border: "border-green-200 dark:border-green-800",
        badge: "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300",
      };
    case "삭제":
      return {
        bg: "bg-red-50 dark:bg-red-950",
        border: "border-red-200 dark:border-red-800",
        badge: "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300",
      };
    case "변경":
      return {
        bg: "bg-amber-50 dark:bg-amber-950",
        border: "border-amber-200 dark:border-amber-800",
        badge: "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300",
      };
    default:
      return {
        bg: "bg-slate-50 dark:bg-slate-900",
        border: "border-slate-200 dark:border-slate-700",
        badge: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
      };
  }
}

// ---------------------------------------------------------------------------
// 행정규칙 유형 색상
// ---------------------------------------------------------------------------

export const ADMIN_RULE_TYPE_COLORS: Record<string, string> = {
  "고시": "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  "예규": "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  "훈령": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  "지침": "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
};
