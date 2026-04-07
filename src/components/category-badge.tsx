import { Badge } from "@/components/ui/badge";
import { CATEGORY_BADGE_COLORS } from "@/lib/colors";

export function CategoryBadge({ category }: { category: string }) {
  return (
    <Badge variant="secondary" className={CATEGORY_BADGE_COLORS[category] || ""}>
      {category}
    </Badge>
  );
}
