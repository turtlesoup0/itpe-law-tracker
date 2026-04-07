import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CategoryBadge } from "@/components/category-badge";
import type { LawInfo } from "@/lib/laws-data";

import { LAW_BORDER_COLORS } from "@/lib/colors";

const relevanceMap: Record<string, string[]> = {
  "info-comm": ["웹서비스 운영", "개인정보 처리", "스팸 방지"],
  "privacy": ["개인정보 수집·이용", "CCTV 운영", "마케팅 동의"],
  "sw-promotion": ["SW 사업 입찰", "SW 대가 산정", "기술성 평가"],
  "ai-basic": ["AI 서비스 개발", "AI 윤리", "고위험 AI"],
  "cloud": ["클라우드 도입", "SaaS 계약", "보안인증(CSAP)"],
  "e-gov": ["공공 시스템", "전자문서", "행정정보 공유"],
  "nat-contract": ["공공 입찰", "계약 절차", "하도급 관리"],
  "credit-info": ["마이데이터", "신용평가", "금융 API"],
  "public-data": ["공공API 활용", "데이터 품질", "민간 개방"],
  "data-industry": ["데이터 거래", "데이터 결합", "데이터 자산"],
};

export function LawCard({ law }: { law: LawInfo }) {
  const tags = relevanceMap[law.id];

  return (
    <Link href={`/laws/${law.id}`}>
      <Card className={`border-l-4 ${LAW_BORDER_COLORS[law.color] || ""} hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 cursor-pointer h-full`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between mb-1">
            <CategoryBadge category={law.category} />
          </div>
          <CardTitle className="text-lg leading-tight">{law.shortName}</CardTitle>
          <CardDescription className="text-xs leading-snug">{law.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{law.description}</p>
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.map((tag) => (
                <span key={tag} className="text-xs px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
