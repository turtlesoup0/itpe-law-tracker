/**
 * 통합 색상 유틸리티
 *
 * 색은 globals.css 의 디자인 토큰에서만 온다. Tailwind 원색 유틸리티
 * (bg-blue-100, dark:bg-amber-900 …)를 여기에 다시 쓰지 말 것 —
 * 라이트/다크 쌍을 손으로 관리해야 하고, 화면마다 같은 분야가 다른
 * 색으로 보이던 원인이었다.
 *
 * 두 축을 구분해서 쓴다:
 *   - cat-*      분야 구분. 밝기·채도 고정, hue 만 회전 (5개가 나란히
 *                놓여도 하나만 튀지 않는다). 의미 없음, 구분만.
 *   - success/warning/destructive  상태. 시행 여부·개정 유형처럼
 *                "좋다/급하다/사라졌다"를 말할 때만.
 */

import type { LawCategory } from "@/types/law";

// ---------------------------------------------------------------------------
// 카테고리 색상
// ---------------------------------------------------------------------------

/** 분야 → cat-* 토큰 이름 (Tailwind 클래스 접미사) */
const CATEGORY_TOKEN: Record<string, string> = {
  "정보보호": "cat-infosec",
  "산업진흥": "cat-industry",
  "전자정부": "cat-egov",
  "계약": "cat-contract",
  "데이터": "cat-data",
};

function token(category: string): string {
  return CATEGORY_TOKEN[category] ?? "cat-other";
}

/**
 * CategoryBadge 용 — 분야색을 배경 12%/테두리 25%/텍스트로 쓴다.
 * 채워진 원색 배지 대신 옅은 칩으로 두어, 카드 안에서 제목보다
 * 앞서 읽히지 않게 한다.
 */
export function categoryBadgeClass(category: string): string {
  const t = token(category);
  return `bg-${t}/12 text-${t} ring-1 ring-inset ring-${t}/25`;
}

/** 카테고리 섹션 헤더 — 좌측 border + 텍스트 */
export function categorySectionClass(category: string): string {
  const t = token(category);
  return `border-${t} text-${t}`;
}

/** 분야 점(dot) — 목록에서 색만으로 분야를 구분할 때 */
export function categoryDotClass(category: string): string {
  return `bg-${token(category)}`;
}

/**
 * Tailwind JIT 가 위 템플릿 리터럴 클래스를 발견하지 못하므로,
 * 생성 가능한 조합을 여기 한 번 나열해 둔다. 이 배열 자체는 런타임에
 * 쓰이지 않지만 지우면 색이 전부 빠진다.
 */
export const CATEGORY_CLASS_SAFELIST = [
  "bg-cat-infosec/12 text-cat-infosec ring-cat-infosec/25 border-cat-infosec bg-cat-infosec",
  "bg-cat-industry/12 text-cat-industry ring-cat-industry/25 border-cat-industry bg-cat-industry",
  "bg-cat-egov/12 text-cat-egov ring-cat-egov/25 border-cat-egov bg-cat-egov",
  "bg-cat-contract/12 text-cat-contract ring-cat-contract/25 border-cat-contract bg-cat-contract",
  "bg-cat-data/12 text-cat-data ring-cat-data/25 border-cat-data bg-cat-data",
  "bg-cat-other/12 text-cat-other ring-cat-other/25 border-cat-other bg-cat-other",
];

/** 분야 순서 — 목록·필터에서 이 순서를 유지한다 */
export const CATEGORY_ORDER: LawCategory[] = [
  "정보보호",
  "산업진흥",
  "전자정부",
  "데이터",
  "계약",
];

// ---------------------------------------------------------------------------
// LawCard 좌측 border — Law.color 대신 분야를 직접 쓴다
// ---------------------------------------------------------------------------

export function lawBorderClass(category: string): string {
  return `border-l-${token(category)}`;
}

export const LAW_BORDER_SAFELIST = [
  "border-l-cat-infosec",
  "border-l-cat-industry",
  "border-l-cat-egov",
  "border-l-cat-contract",
  "border-l-cat-data",
  "border-l-cat-other",
];

// ---------------------------------------------------------------------------
// 개정 유형·시행 상태
// ---------------------------------------------------------------------------

/** 개정 유형 → 타임라인 도트 색상 */
export function getAmendmentTypeColor(type: string): string {
  switch (type) {
    case "제정": return "bg-success";
    case "전부개정": return "bg-destructive";
    case "일부개정": return "bg-primary";
    case "폐지": return "bg-faint";
    case "타법개정": return "bg-border-strong";
    default: return "bg-faint";
  }
}

/**
 * 시행일 기준 상태.
 * 남은 일수가 적을수록 강한 색 — 시행 중은 조용한 success,
 * 30일 이내는 destructive 로 눈에 걸리게 한다.
 */
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
    return { bg: "bg-success/12", text: "text-success", label: "시행 중" };
  if (daysUntil <= 30)
    return { bg: "bg-destructive/12", text: "text-destructive", label: `D-${daysUntil}` };
  if (daysUntil <= 90)
    return { bg: "bg-warning/15", text: "text-warning", label: `D-${daysUntil}` };
  return { bg: "bg-primary-soft", text: "text-primary", label: `D-${daysUntil}` };
}

// ---------------------------------------------------------------------------
// 신구대조 변경 유형
// ---------------------------------------------------------------------------

export function getChangeTypeColor(type: string): {
  bg: string;
  border: string;
  badge: string;
} {
  switch (type) {
    case "신설":
      return {
        bg: "bg-success/8",
        border: "border-success/30",
        badge: "bg-success/12 text-success",
      };
    case "삭제":
      return {
        bg: "bg-destructive/8",
        border: "border-destructive/30",
        badge: "bg-destructive/12 text-destructive",
      };
    case "변경":
      return {
        bg: "bg-warning/10",
        border: "border-warning/30",
        badge: "bg-warning/15 text-warning",
      };
    default:
      return {
        bg: "bg-muted",
        border: "border-border",
        badge: "bg-muted text-muted-foreground",
      };
  }
}

// ---------------------------------------------------------------------------
// 행정규칙 유형
// ---------------------------------------------------------------------------

export const ADMIN_RULE_TYPE_COLORS: Record<string, string> = {
  "고시": "bg-cat-infosec/12 text-cat-infosec",
  "예규": "bg-cat-data/12 text-cat-data",
  "훈령": "bg-cat-egov/12 text-cat-egov",
  "지침": "bg-cat-industry/12 text-cat-industry",
  "공고": "bg-muted text-muted-foreground",
};

// ---------------------------------------------------------------------------
// 하위 호환 — 기존 import 를 깨지 않기 위한 레코드 형태 재노출.
// 신규 코드는 위 함수를 쓸 것.
// ---------------------------------------------------------------------------

export const CATEGORY_BADGE_COLORS: Record<string, string> = Object.fromEntries(
  Object.keys(CATEGORY_TOKEN).map((c) => [c, categoryBadgeClass(c)]),
);

export const CATEGORY_SECTION_COLORS: Record<string, string> = Object.fromEntries(
  Object.keys(CATEGORY_TOKEN).map((c) => [c, categorySectionClass(c)]),
);
