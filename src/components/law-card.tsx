import Link from "next/link";
import { Card } from "@/components/ui/card";
import { CategoryBadge } from "@/components/category-badge";
import { Tag } from "@/components/ui/tag";
import type { LawInfo } from "@/lib/laws-data";
import { getPendingEnforcementDate } from "@/lib/utils/law-constants";
import { categoryDotClass } from "@/lib/colors";

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
  "intelligent-info": ["지능정보사회", "데이터센터", "정보격차 해소"],
  "quantum": ["양자컴퓨팅", "양자통신", "양자팹"],
  "aidc": ["AIDC 인허가", "전력·용수 확보", "AIDC 특구"],
};

export function LawCard({ law }: { law: LawInfo }) {
  const tags = relevanceMap[law.id];
  const pendingDate = getPendingEnforcementDate(law);

  return (
    <Link href={`/laws/${law.id}`} className="group/law block h-full">
      <Card
        size="sm"
        className="h-full gap-2.5 transition-colors group-hover/law:ring-foreground/25"
      >
        <div className="flex items-start gap-2.5 px-3">
          {/* 분야 점 — 그리드에 깔렸을 때 색만으로 분야를 훑게 한다 */}
          <span
            aria-hidden
            className={`mt-[7px] inline-block size-1.5 shrink-0 rounded-full ${categoryDotClass(law.category)}`}
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <h3 className="text-[15px] leading-snug font-semibold tracking-tight group-hover/law:text-primary">
                {law.shortName}
              </h3>
              {pendingDate && <Tag tone="warning">{pendingDate} 시행예정</Tag>}
            </div>
            <p className="mt-0.5 truncate text-[11.5px] text-faint">{law.name}</p>
          </div>
          <CategoryBadge category={law.category} />
        </div>

        <div className="px-3">
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            {law.description}
          </p>
          {tags && tags.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1">
              {tags.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
