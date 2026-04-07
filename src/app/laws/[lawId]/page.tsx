import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryBadge } from "@/components/category-badge";
import { getLawById } from "@/lib/laws-data";
import { getMockArticles, getMockAmendments, getMockThreeTier } from "@/lib/mcp/mock-data";
import { AmendmentTimeline } from "@/components/amendment-timeline";
import { LawHierarchyGraph } from "@/components/law-hierarchy-graph";
import { ThreeTierView } from "@/components/three-tier-view";
import { ArticleViewer } from "@/components/article-viewer";
import { AdminRuleList } from "@/components/admin-rule-list";
import { TtaTermWidget } from "@/components/tta-term-widget";
import type { HierarchyNode } from "@/types/law";

// ---------------------------------------------------------------------------
// Cross-reference map: related laws within IT_LAWS
// ---------------------------------------------------------------------------
const relatedLawsMap: Record<string, { lawId: string; relation: string }[]> = {
  "info-comm": [
    { lawId: "privacy", relation: "개인정보 처리 시 개인정보보호법 적용 (제23조의5·6 연계정보, 제45조의3 CISO 겸직)" },
    { lawId: "e-gov", relation: "전자정부서비스 연계정보 활용 (제23조의5)" },
    { lawId: "sw-promotion", relation: "소프트웨어 보안취약점 패치 고지 의무 (제47조의4)" },
    { lawId: "cloud", relation: "클라우드 기반 정보통신서비스의 정보보호 (제45조, 제46조)" },
    { lawId: "credit-info", relation: "온라인 금융서비스의 신용정보 처리" },
  ],
  "privacy": [
    { lawId: "info-comm", relation: "정보통신망에서의 개인정보 특례" },
    { lawId: "credit-info", relation: "신용정보와 개인정보의 관계" },
    { lawId: "ai-basic", relation: "AI 자동화 의사결정과 정보주체 권리" },
  ],
  "sw-promotion": [
    { lawId: "nat-contract", relation: "공공 SW사업 계약 절차" },
    { lawId: "cloud", relation: "클라우드 기반 SW 서비스" },
  ],
  "ai-basic": [
    { lawId: "privacy", relation: "AI의 개인정보 처리 규제" },
    { lawId: "info-comm", relation: "AI 서비스의 정보통신망 이용" },
    { lawId: "data-industry", relation: "AI 학습용 데이터 활용" },
  ],
  "cloud": [
    { lawId: "e-gov", relation: "공공기관 클라우드 우선 도입" },
    { lawId: "sw-promotion", relation: "클라우드 SW 대가 산정" },
    { lawId: "info-comm", relation: "클라우드 서비스의 정보보호" },
  ],
  "e-gov": [
    { lawId: "cloud", relation: "전자정부 클라우드 전환" },
    { lawId: "public-data", relation: "행정정보의 공공데이터 제공" },
    { lawId: "info-comm", relation: "전자정부 서비스 정보보호" },
  ],
  "nat-contract": [
    { lawId: "sw-promotion", relation: "SW사업 대가 기준 적용" },
    { lawId: "cloud", relation: "클라우드 서비스 조달" },
  ],
  "credit-info": [
    { lawId: "privacy", relation: "신용정보 중 개인정보 보호" },
    { lawId: "info-comm", relation: "온라인 신용정보 서비스" },
    { lawId: "data-industry", relation: "마이데이터와 데이터 산업" },
  ],
  "public-data": [
    { lawId: "e-gov", relation: "전자정부 데이터 개방" },
    { lawId: "data-industry", relation: "공공데이터 기반 데이터 산업" },
  ],
  "data-industry": [
    { lawId: "public-data", relation: "공공데이터 활용" },
    { lawId: "privacy", relation: "데이터 결합 시 개인정보 보호" },
    { lawId: "credit-info", relation: "금융데이터 활용" },
  ],
};

// ---------------------------------------------------------------------------
// Inline mock data -- will be replaced by Server Actions / MCP calls
// ---------------------------------------------------------------------------
const hierarchyMap: Record<string, HierarchyNode[]> = {
  "info-comm": [
    {
      id: "info-comm-law",
      name: "정보통신망법",
      fullName: "정보통신망 이용촉진 및 정보보호 등에 관한 법률",
      type: "법률",
      color: "blue",
      children: [
        {
          id: "info-comm-decree",
          name: "정보통신망법 시행령",
          fullName: "정보통신망 이용촉진 및 정보보호 등에 관한 법률 시행령",
          type: "시행령",
          color: "emerald",
          children: [
            {
              id: "info-comm-rule",
              name: "정보통신망법 시행규칙",
              fullName:
                "정보통신망 이용촉진 및 정보보호 등에 관한 법률 시행규칙",
              type: "시행규칙",
              color: "amber",
              children: [],
            },
          ],
        },
        {
          id: "info-comm-notice",
          name: "개인정보의 기술적·관리적 보호조치 기준",
          fullName: "개인정보의 기술적·관리적 보호조치 기준 (고시)",
          type: "고시",
          color: "purple",
          children: [],
        },
      ],
    },
  ],
  privacy: [
    {
      id: "privacy-law",
      name: "개인정보보호법",
      fullName: "개인정보 보호법",
      type: "법률",
      color: "blue",
      children: [
        {
          id: "privacy-decree",
          name: "개인정보보호법 시행령",
          fullName: "개인정보 보호법 시행령",
          type: "시행령",
          color: "emerald",
          children: [
            {
              id: "privacy-rule",
              name: "개인정보보호법 시행규칙",
              fullName: "개인정보 보호법 시행규칙",
              type: "시행규칙",
              color: "amber",
              children: [],
            },
          ],
        },
        {
          id: "privacy-notice",
          name: "개인정보의 안전성 확보조치 기준",
          fullName: "개인정보의 안전성 확보조치 기준 (고시)",
          type: "고시",
          color: "purple",
          children: [],
        },
      ],
    },
  ],
};

// Fallback: generate a default hierarchy for any law
function getHierarchy(lawId: string, shortName: string): HierarchyNode[] {
  if (hierarchyMap[lawId]) return hierarchyMap[lawId];
  return [
    {
      id: `${lawId}-law`,
      name: shortName,
      fullName: shortName,
      type: "법률",
      color: "blue",
      children: [
        {
          id: `${lawId}-decree`,
          name: `${shortName} 시행령`,
          fullName: `${shortName} 시행령`,
          type: "시행령",
          color: "emerald",
          children: [],
        },
      ],
    },
  ];
}

export default async function LawDetailPage({
  params,
}: {
  params: Promise<{ lawId: string }>;
}) {
  const { lawId } = await params;
  const law = getLawById(lawId);

  if (!law) {
    notFound();
  }

  const articles = getMockArticles(lawId);
  const amendments = getMockAmendments(lawId);
  const hierarchy = getHierarchy(lawId, law.shortName);
  const threeTierRows = getMockThreeTier(lawId);
  const relatedLaws = relatedLawsMap[lawId] ?? [];

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div className="flex items-center gap-4">
        <Link href="/laws">
          <Button variant="ghost" size="sm">
            &larr; 법령 목록
          </Button>
        </Link>
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
            {law.shortName}
          </h1>
          <CategoryBadge category={law.category} />
        </div>
        <p className="text-slate-600 dark:text-slate-400">{law.name}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{law.description}</p>
      </div>

      <Tabs defaultValue="hierarchy" className="w-full">
        <TabsList className="overflow-x-auto w-full justify-start sm:justify-center">
          <TabsTrigger value="hierarchy">법령 계층</TabsTrigger>
          <TabsTrigger value="articles">조문</TabsTrigger>
          <TabsTrigger value="three-tier">3단 비교</TabsTrigger>
          <TabsTrigger value="related">관련 법령</TabsTrigger>
          <TabsTrigger value="amendments">개정 이력</TabsTrigger>
          <TabsTrigger value="terms">용어사전</TabsTrigger>
        </TabsList>

        <TabsContent value="hierarchy">
          <Card>
            <CardHeader>
              <CardTitle>법령 계층 구조</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                이 법이 어떤 시행령·시행규칙·고시로 구체화되는지 한눈에 파악할 수 있습니다.
              </p>
            </CardHeader>
            <CardContent>
              <LawHierarchyGraph hierarchy={hierarchy} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="articles">
          {articles.length > 0 ? (
            <ArticleViewer articles={articles} lawName={law.shortName} />
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-slate-500 dark:text-slate-400">
                등록된 조문 데이터가 없습니다.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="three-tier">
          {threeTierRows.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>3단 위임조문 비교</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  법률의 조문이 시행령·시행규칙으로 어떻게 위임되는지 대조합니다.
                </p>
              </CardHeader>
              <CardContent>
                <ThreeTierView rows={threeTierRows} />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-slate-500 dark:text-slate-400">
                이 법령의 3단 비교 데이터가 아직 준비되지 않았습니다.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="related">
          <div className="space-y-6">
            {relatedLaws.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>관련 법령 참조</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    이 법과 함께 적용되거나 참조해야 하는 법령입니다.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {relatedLaws.map((rel) => {
                      const relLaw = getLawById(rel.lawId);
                      if (!relLaw) return null;
                      return (
                        <Link key={rel.lawId} href={`/laws/${rel.lawId}`} className="block">
                          <div className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent transition-colors">
                            <div className="shrink-0 mt-0.5">
                              <CategoryBadge category={relLaw.category} />
                            </div>
                            <div>
                              <p className="font-medium text-sm text-foreground">{relLaw.shortName}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{rel.relation}</p>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>관련 고시 · 행정규칙</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  이 법에 근거한 세부 기준(고시·훈령·예규)을 확인합니다.
                </p>
              </CardHeader>
              <CardContent>
                <AdminRuleList lawId={lawId} lawShortName={law.shortName} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="amendments">
          <Card>
            <CardHeader>
              <CardTitle>개정 이력</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                이 법이 언제, 왜 바뀌었는지 시간순으로 확인합니다.
              </p>
            </CardHeader>
            <CardContent>
              <AmendmentTimeline amendments={amendments} lawId={lawId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="terms">
          <Card>
            <CardHeader>
              <CardTitle>정보통신 용어사전</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                TTA 정보통신용어사전에서 IT 전문 용어의 정의를 검색합니다.
              </p>
            </CardHeader>
            <CardContent>
              <TtaTermWidget />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
