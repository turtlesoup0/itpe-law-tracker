"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DiffViewer } from "@/components/diff-viewer";
import { IT_LAWS, getLawById } from "@/lib/laws-data";
import { getMockCompareData, getMockCompareEntries, getMockAmendments } from "@/lib/mcp/mock-data";

function CompareContent() {
  const searchParams = useSearchParams();
  const [selectedLawId, setSelectedLawId] = useState<string>("");
  const [selectedAmdId, setSelectedAmdId] = useState<string>("");
  const [apiData, setApiData] = useState<{ amendmentReason?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // URL 쿼리 파라미터에서 lawId, amdId 읽기
  useEffect(() => {
    const lawIdParam = searchParams.get("lawId");
    const amdIdParam = searchParams.get("amdId");
    if (lawIdParam && !selectedLawId) {
      setSelectedLawId(lawIdParam);
    }
    if (amdIdParam && !selectedAmdId) {
      setSelectedAmdId(amdIdParam);
    }
  }, [searchParams, selectedLawId, selectedAmdId]);

  // 법제처 API에서 개정이유 fetch
  useEffect(() => {
    if (!selectedLawId) return;
    setLoading(true);
    fetch(`/api/compare?lawId=${selectedLawId}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) setApiData(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedLawId]);

  const law = selectedLawId ? getLawById(selectedLawId) : null;
  const amendments = selectedLawId ? getMockAmendments(selectedLawId) : [];
  const compareEntries = selectedLawId ? getMockCompareEntries(selectedLawId) : [];
  const changeData = selectedLawId
    ? getMockCompareData(selectedLawId, selectedAmdId || undefined)
    : null;

  // 선택된 amendment의 메타 정보
  const selectedAmendment = amendments.find(a => a.id === selectedAmdId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">신구법 비교</h1>
        <p className="text-slate-600 dark:text-slate-400">개정 전후 법령 조문을 비교합니다.</p>
      </div>

      {/* 법령 선택 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">법령 선택</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {IT_LAWS.map((l) => (
              <Button
                key={l.id}
                size="sm"
                variant={selectedLawId === l.id ? "default" : "outline"}
                onClick={() => {
                  setSelectedLawId(l.id);
                  setSelectedAmdId("");
                }}
              >
                {l.shortName}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 개정 회차 선택 */}
      {law && compareEntries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">개정 회차 선택</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {compareEntries.map(({ amdId, entry }) => {
                const amd = amendments.find(a => a.id === amdId);
                const isActive = selectedAmdId === amdId || (!selectedAmdId && compareEntries[0].amdId === amdId);
                return (
                  <Button
                    key={amdId}
                    size="sm"
                    variant={isActive ? "default" : "outline"}
                    onClick={() => setSelectedAmdId(amdId)}
                    className="text-xs"
                  >
                    <span>{entry.amendmentDate}</span>
                    {amd && (
                      <span className="ml-1 opacity-70">{amd.type}</span>
                    )}
                    <span className="ml-1 text-muted-foreground">({entry.items.length}건)</span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 변경 메타 정보 */}
      {law && changeData && changeData.changeMeta && Object.keys(changeData.changeMeta).length > 0 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="text-sm font-medium text-foreground">변경 유형:</span>
              {[...new Set(Object.values(changeData.changeMeta).flatMap((m) => m.tags))].map((tag) => (
                <span key={tag} className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-foreground">영향 대상:</span>
              {[...new Set(Object.values(changeData.changeMeta).flatMap((m) => m.affectedParties))].map((party) => (
                <span key={party} className="text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                  {party}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Diff 뷰어 */}
      {law && changeData && changeData.items.length > 0 && (
        <>
          {loading && (
            <p className="text-sm text-muted-foreground animate-pulse">법제처 데이터 로딩 중...</p>
          )}
          <DiffViewer
            changes={changeData.items}
            lawName={law.shortName}
            amendmentDate={changeData.amendmentDate}
            enforcementDate={changeData.enforcementDate}
            amendmentReason={changeData.amendmentReason || apiData?.amendmentReason}
          />
        </>
      )}

      {/* 데이터 없음 */}
      {selectedLawId && !changeData && (
        <Card>
          <CardContent className="py-12 text-center text-slate-500 dark:text-slate-400">
            이 법령의 신구대조 데이터가 아직 준비되지 않았습니다.
          </CardContent>
        </Card>
      )}

      {law && changeData && changeData.items.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-slate-500 dark:text-slate-400">
            {selectedAmendment?.summary || "이 개정의 신구대조 항목이 없습니다."}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-slate-500 dark:text-slate-400">Loading...</div>}>
      <CompareContent />
    </Suspense>
  );
}
