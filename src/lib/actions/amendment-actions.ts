"use server";

import { getMockAmendments } from "@/lib/mcp/mock-data";
import { getLawById, IT_LAWS } from "@/lib/utils/law-constants";
import type { AmendmentDetail, CompareOldNewItem } from "@/types/law";

// ---------------------------------------------------------------------------
// 법령의 개정 이력 조회 (타임라인용)
// ---------------------------------------------------------------------------
export async function fetchAmendmentTimeline(
  lawId: string,
): Promise<AmendmentDetail[]> {
  const amendments = getMockAmendments(lawId);
  const today = new Date();

  return amendments
    .map((amd) => {
      const enfDate = new Date(amd.enforcementDate);
      const diffTime = enfDate.getTime() - today.getTime();
      const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        ...amd,
        daysUntilEnforcement: daysUntil,
        changes: getMockChanges(lawId, amd.id),
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// ---------------------------------------------------------------------------
// 신구법 대조 데이터 (mock)
// ---------------------------------------------------------------------------
export async function fetchCompareOldNew(
  lawId: string,
  _amendmentId: string,
): Promise<CompareOldNewItem[]> {
  return getMockChanges(lawId, _amendmentId);
}

// ---------------------------------------------------------------------------
// 모든 법령의 최근 개정 현황 (대시보드용)
// ---------------------------------------------------------------------------
export async function fetchRecentAmendments(): Promise<AmendmentDetail[]> {
  const all: AmendmentDetail[] = [];
  const today = new Date();

  for (const law of IT_LAWS) {
    const amendments = getMockAmendments(law.id);
    for (const amd of amendments) {
      const enfDate = new Date(amd.enforcementDate);
      const daysUntil = Math.ceil(
        (enfDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );
      all.push({ ...amd, daysUntilEnforcement: daysUntil });
    }
  }

  return all.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

// ---------------------------------------------------------------------------
// Mock 신구대조 데이터 생성
// ---------------------------------------------------------------------------
function getMockChanges(
  lawId: string,
  _amendmentId: string,
): CompareOldNewItem[] {
  const law = getLawById(lawId);
  if (!law) return [];

  // 각 법률별로 다른 mock 변경사항 반환
  const changesMap: Record<string, CompareOldNewItem[]> = {
    "info-comm": [
      {
        articleNo: "제22조의2",
        oldText: "",
        newText:
          "온라인 플랫폼 중개서비스 사업자는 중개서비스를 이용하는 자의 피해를 예방하기 위하여 필요한 조치를 하여야 한다.",
        changeType: "신설",
      },
      {
        articleNo: "제44조",
        oldText:
          "정보통신서비스 제공자는 자신이 운영·관리하는 정보통신망에 유통되는 정보가 이 법에 위반되는 내용을 포함하는 것을 알게 된 때에는 지체 없이 그 정보의 처리를 거부·정지 또는 제한하는 등의 필요한 조치를 하여야 한다.",
        newText:
          "정보통신서비스 제공자는 자신이 운영·관리하는 정보통신망에 유통되는 정보가 이 법에 위반되는 내용을 포함하는 것을 알게 된 때에는 즉시 그 정보의 처리를 거부·정지 또는 제한하는 등의 필요한 조치를 하여야 한다. 이 경우 정보통신서비스 제공자는 해당 정보를 제공한 자에게 그 사유를 통지하여야 한다.",
        changeType: "변경",
      },
    ],
    privacy: [
      {
        articleNo: "제28조의8",
        oldText: "",
        newText:
          "개인정보처리자는 개인정보의 국외 이전 시 정보주체에게 다음 각 호의 사항을 알리고 동의를 받아야 한다.",
        changeType: "신설",
      },
      {
        articleNo: "제37조의2",
        oldText: "",
        newText:
          "정보주체는 자동화된 의사결정에 대하여 거부하거나 그에 대한 설명을 요구할 수 있다.",
        changeType: "신설",
      },
      {
        articleNo: "제39조",
        oldText:
          "보호위원회는 개인정보처리자가 처리하는 주민등록번호가 분실·도난·유출·위조·변조 또는 훼손된 경우에는 5억원 이하의 과징금을 부과·징수할 수 있다.",
        newText:
          "보호위원회는 개인정보처리자가 처리하는 주민등록번호가 분실·도난·유출·위조·변조 또는 훼손된 경우에는 전체 매출액의 100분의 3 이하에 해당하는 금액을 과징금으로 부과·징수할 수 있다.",
        changeType: "변경",
      },
    ],
  };

  return (
    changesMap[lawId] ?? [
      {
        articleNo: "제1조",
        oldText:
          "이 법은 " +
          (law?.shortName || "해당 법률") +
          "에 관한 사항을 정한다.",
        newText:
          "이 법은 " +
          (law?.shortName || "해당 법률") +
          "에 관한 기본적인 사항을 정한다.",
        changeType: "변경",
      },
    ]
  );
}
