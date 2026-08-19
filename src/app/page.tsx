import Link from "next/link";
import { IT_LAWS } from "@/lib/laws-data";
import { getPendingEnforcementDate } from "@/lib/utils/law-constants";
import { getMockAmendments, getMockArticles } from "@/lib/mcp/mock-data";
import { LawCard } from "@/components/law-card";
import { Card } from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";
import { CATEGORY_ORDER, categorySectionClass } from "@/lib/colors";

/**
 * D-day 를 서버에서 계산하므로 정적 프리렌더로 굳으면 안 된다.
 * 이전에는 `new Date("2026-04-06")` 하드코딩으로 이 문제를 피해 두었는데,
 * 그 결과 시행 예정 목록이 그 날짜에 4개월간 멈춰 있었다.
 * 한 시간마다 재생성해 D-day 가 따라가게 한다.
 */
export const revalidate = 3600;

const categoryDescriptions: Record<string, string> = {
  "정보보호": "개인정보 보호, 정보통신망 보안, 신용정보 관리",
  "산업진흥": "소프트웨어·인공지능·클라우드·양자 등 IT 산업 육성",
  "전자정부": "행정업무의 전자적 처리 및 공공 시스템 운영",
  "데이터": "공공데이터 개방, 데이터 거래·활용 촉진",
  "계약": "국가 조달·계약의 기본 원칙과 입찰 절차",
};

function Tile({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: number | string;
  hint: string;
  accent?: boolean;
}) {
  return (
    <Card className="flex flex-col gap-1.5 px-4 py-3.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span
        className={`text-[30px] leading-none font-semibold tracking-tighter tabular-nums ${
          accent ? "text-primary" : ""
        }`}
      >
        {value}
      </span>
      <span className="text-[11.5px] text-faint">{hint}</span>
    </Card>
  );
}

export default function DashboardPage() {
  const today = new Date();
  const ninetyDaysLater = new Date(today);
  ninetyDaysLater.setDate(ninetyDaysLater.getDate() + 90);

  const upcomingAmendments = IT_LAWS.flatMap((law) =>
    getMockAmendments(law.id)
      .filter((a) => {
        const enforcement = new Date(a.enforcementDate);
        return enforcement > today && enforcement <= ninetyDaysLater;
      })
      .map((a) => {
        const enforcement = new Date(a.enforcementDate);
        const dDay = Math.ceil(
          (enforcement.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
        );
        return { law, amendment: a, dDay };
      }),
  ).sort((a, b) => a.dDay - b.dDay);

  const pendingLaws = IT_LAWS.filter((l) => getPendingEnforcementDate(l));
  const articleCount = IT_LAWS.reduce(
    (sum, l) => sum + getMockArticles(l.id).length,
    0,
  );

  const grouped = CATEGORY_ORDER.map((category) => ({
    category,
    laws: IT_LAWS.filter((l) => l.category === category),
  })).filter((g) => g.laws.length > 0);

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-[23px] font-semibold tracking-tight">대시보드</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          법률 → 시행령 → 고시의 위임 구조, 개정 이유, 관련 제도를 한눈에 확인합니다.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tile
          label="추적 법령"
          value={IT_LAWS.length}
          hint={`${grouped.length}개 분야`}
        />
        <Tile
          label="수집 조문"
          value={articleCount.toLocaleString("ko-KR")}
          hint="해설·항호 분리 포함"
        />
        <Tile
          label="90일 내 시행"
          value={upcomingAmendments.length}
          hint={upcomingAmendments.length > 0 ? `가장 임박 D-${upcomingAmendments[0].dDay}` : "예정 없음"}
          accent={upcomingAmendments.length > 0}
        />
        <Tile
          label="시행 전 법령"
          value={pendingLaws.length}
          hint={pendingLaws.length > 0 ? pendingLaws.map((l) => l.shortName).join(", ") : "없음"}
        />
      </div>

      {upcomingAmendments.length > 0 && (
        <section>
          <h2 className="mb-2.5 text-sm font-semibold tracking-tight">
            시행 예정 개정사항
            <span className="ml-2 text-xs font-normal text-faint">
              앞으로 90일
            </span>
          </h2>
          <Card className="gap-0 py-0">
            <ul className="divide-y">
              {upcomingAmendments.map(({ law, amendment, dDay }) => (
                <li key={amendment.id}>
                  <Link
                    href={`/compare/${law.id}`}
                    className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted"
                  >
                    <span className="w-11 shrink-0 pt-0.5 text-[13px] font-semibold tabular-nums text-warning">
                      D-{dDay}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[13.5px] font-medium">{law.shortName}</span>
                        <Tag>{amendment.type}</Tag>
                        <span className="text-[11.5px] text-faint">
                          {amendment.enforcementDate} 시행
                        </span>
                      </span>
                      <span className="mt-0.5 block text-[13px] leading-relaxed text-muted-foreground">
                        {amendment.summary}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      )}

      {grouped.map(({ category, laws }) => (
        <section key={category}>
          <div
            className={`mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-l-2 pl-3 ${categorySectionClass(category)}`}
          >
            <h2 className="text-[15px] font-semibold tracking-tight">{category}</h2>
            <span className="text-xs text-faint">{laws.length}건</span>
            <span className="text-xs text-muted-foreground">
              {categoryDescriptions[category] ?? ""}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {laws.map((law) => (
              <LawCard key={law.id} law={law} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
