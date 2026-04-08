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
import { HierarchyViewToggle } from "@/components/hierarchy-view-toggle";
import { getLawHierarchy, getAgencyHierarchy, getRelatedLaws } from "@/lib/data/hierarchy-data";

// ---------------------------------------------------------------------------
// Data is now imported from @/lib/data/hierarchy-data
// ---------------------------------------------------------------------------

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
  const hierarchy = getLawHierarchy(lawId);
  const agencyHierarchy = getAgencyHierarchy(lawId);
  const threeTierRows = getMockThreeTier(lawId);
  const relatedLaws = getRelatedLaws(lawId);

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
          <HierarchyViewToggle
            lawHierarchy={hierarchy}
            agencyHierarchy={agencyHierarchy}
          />
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
