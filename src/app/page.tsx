import Link from "next/link";
import { IT_LAWS, CATEGORIES } from "@/lib/laws-data";
import { getMockAmendments } from "@/lib/mcp/mock-data";
import { LawCard } from "@/components/law-card";
import { CATEGORY_SECTION_COLORS } from "@/lib/colors";

const categoryDescriptions: Record<string, string> = {
  "정보보호": "개인정보 보호, 정보통신망 보안, 신용정보 관리 등",
  "산업진흥": "소프트웨어, 인공지능, 클라우드 등 IT 산업 육성",
  "전자정부": "행정업무의 전자적 처리 및 공공 시스템 운영",
  "계약": "국가 조달·계약의 기본 원칙과 입찰 절차",
  "데이터": "공공데이터 개방, 데이터 거래·활용 촉진",
};

export default function DashboardPage() {
  const today = new Date("2026-04-06");
  const ninetyDaysLater = new Date(today);
  ninetyDaysLater.setDate(ninetyDaysLater.getDate() + 90);

  const upcomingAmendments = IT_LAWS.flatMap((law) => {
    const amendments = getMockAmendments(law.id);
    return amendments
      .filter((a) => {
        const enforcement = new Date(a.enforcementDate);
        return enforcement > today && enforcement <= ninetyDaysLater;
      })
      .map((a) => {
        const enforcement = new Date(a.enforcementDate);
        const diffMs = enforcement.getTime() - today.getTime();
        const dDay = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        return { law, amendment: a, dDay };
      });
  });

  // 카테고리별 그룹핑
  const grouped = CATEGORIES.map((cat) => ({
    category: cat.value,
    laws: IT_LAWS.filter((l) => l.category === cat.value),
  })).filter((g) => g.laws.length > 0);

  return (
    <div className="space-y-6 sm:space-y-8 px-4 sm:px-0">
      {upcomingAmendments.length > 0 && (
        <section className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">시행 예정 개정사항</h3>
          <ul className="space-y-1">
            {upcomingAmendments.map(({ law, amendment, dDay }) => (
              <li key={amendment.id} className="text-sm text-amber-900 dark:text-amber-100 flex items-center justify-between gap-2">
                <Link
                  href={`/compare/${law.id}`}
                  className="hover:underline flex-1"
                >
                  <span className="font-medium">{law.shortName}</span>
                  <span className="mx-1">—</span>
                  <span>{amendment.summary}</span>
                </Link>
                <span className="shrink-0 text-xs font-semibold text-amber-700 dark:text-amber-300">
                  D-{dDay}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="text-center py-6 sm:py-8">
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-2 sm:mb-3">
          IT 법령, 쉽게 이해하세요
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          법률 → 시행령 → 고시의 위임 구조, 개정 이유, 관련 제도를 한눈에 파악하고 실무에 활용하세요.
        </p>
      </section>

      {grouped.map(({ category, laws }) => (
        <section key={category}>
          <div className={`flex items-baseline gap-3 mb-3 border-l-4 pl-3 ${CATEGORY_SECTION_COLORS[category] ?? ""}`}>
            <h2 className="text-lg sm:text-xl font-semibold">{category}</h2>
            <span className="text-sm text-muted-foreground">{categoryDescriptions[category] ?? ""}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {laws.map((law) => (
              <LawCard key={law.id} law={law} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
