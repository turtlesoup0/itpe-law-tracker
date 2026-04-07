import { Badge } from "@/components/ui/badge";

const categoryColors: Record<string, string> = {
  "정보보호": "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-900",
  "산업진흥": "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900 dark:text-emerald-200 dark:hover:bg-emerald-900",
  "전자정부": "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900 dark:text-amber-200 dark:hover:bg-amber-900",
  "계약": "bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-900 dark:text-purple-200 dark:hover:bg-purple-900",
  "데이터": "bg-cyan-100 text-cyan-800 hover:bg-cyan-100 dark:bg-cyan-900 dark:text-cyan-200 dark:hover:bg-cyan-900",
};

export function CategoryBadge({ category }: { category: string }) {
  return (
    <Badge variant="secondary" className={categoryColors[category] || ""}>
      {category}
    </Badge>
  );
}
