/**
 * 법제처 Open API 호출 레이어
 * - 법령 검색, 신구대조표, 제·개정이유 조회
 */

import type { CompareApiResponse, CompareOldNewItem } from "@/types/law";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** 내부 law ID → 법제처 검색어 매핑 */
const LAW_SEARCH_MAP: Record<string, string> = {
  "info-comm": "정보통신망 이용촉진",
  "privacy": "개인정보 보호법",
  "sw-promotion": "소프트웨어 진흥법",
  "ai-basic": "인공지능산업 육성",
  "cloud": "클라우드컴퓨팅 발전",
  "e-gov": "전자정부법",
  "nat-contract": "국가를 당사자로 하는 계약",
  "credit-info": "신용정보의 이용",
  "public-data": "공공데이터",
  "data-industry": "데이터 산업진흥",
};

const OC = "itpe_law_follower";
const BASE_URL = "http://www.law.go.kr/DRF";

// ---------------------------------------------------------------------------
// Types (internal)
// ---------------------------------------------------------------------------

interface LawMeta {
  lawApiId: string;
  mst: string;
  promulgationDate: string;
}

// ---------------------------------------------------------------------------
// (a) searchLawMeta — 법령 검색 → lawApiId, mst, 공포일
// ---------------------------------------------------------------------------

export async function searchLawMeta(
  lawId: string,
): Promise<LawMeta | null> {
  const searchTerm = LAW_SEARCH_MAP[lawId];
  if (!searchTerm) return null;

  try {
    const url = `${BASE_URL}/lawSearch.do?OC=${OC}&target=law&type=JSON&query=${encodeURIComponent(searchTerm)}&display=5`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;

    const json = await res.json();

    // 법제처 응답 구조: { LawSearch: { law: [ ... ] } } 또는 단일 객체
    const laws = json?.LawSearch?.law;
    if (!laws) return null;

    const lawList = Array.isArray(laws) ? laws : [laws];

    // "법률" 타입인 첫 번째 결과를 사용
    const match = lawList.find(
      (l: Record<string, string>) =>
        l["법종구분"] === "법률" || l["법종구분코드"] === "001",
    ) ?? lawList[0];

    if (!match) return null;

    return {
      lawApiId: String(match["법령일련번호"] ?? match["법령ID"] ?? ""),
      mst: String(match["법령MST"] ?? match["법령일련번호"] ?? ""),
      promulgationDate: String(match["공포일자"] ?? ""),
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// (b) fetchCompareOldNew — 신구대조표 데이터 조회
// ---------------------------------------------------------------------------

export async function fetchCompareOldNew(
  mst: string,
): Promise<{
  amendmentReason: string;
  amendmentDate: string;
  enforcementDate: string;
  amendmentType: string;
  lawName: string;
} | null> {
  try {
    const url = `${BASE_URL}/lawService.do?OC=${OC}&target=law&MST=${mst}&type=JSON`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;

    const json = await res.json();

    const law = json?.법령 ?? json?.data?.법령 ?? json;

    // 기본 정보 추출
    const lawName = String(law?.기본정보?.법령명_한글 ?? law?.법령명_한글 ?? "");
    const amendmentType = String(
      law?.기본정보?.제개정구분명 ?? law?.제개정구분명 ?? "",
    );
    const amendmentDate = String(
      law?.기본정보?.공포일자 ?? law?.공포일자 ?? "",
    );
    const enforcementDate = String(
      law?.기본정보?.시행일자 ?? law?.시행일자 ?? "",
    );

    // 제·개정이유 추출
    const reasonBlock = law?.제개정이유 ?? law?.["제개정이유"];
    let amendmentReason = "";
    if (reasonBlock) {
      const content =
        reasonBlock?.제개정이유내용 ?? reasonBlock?.["제개정이유내용"];
      if (Array.isArray(content)) {
        amendmentReason = content
          .flat(Infinity)
          .filter(Boolean)
          .join("\n");
      } else if (typeof content === "string") {
        amendmentReason = content;
      }
    }

    return {
      lawName,
      amendmentType,
      amendmentDate,
      enforcementDate,
      amendmentReason,
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// (c) fetchAmendmentReason — 제·개정이유 텍스트만 조회
// ---------------------------------------------------------------------------

export async function fetchAmendmentReason(
  mst: string,
): Promise<string | null> {
  try {
    const url = `${BASE_URL}/lawService.do?OC=${OC}&target=law&MST=${mst}&type=JSON`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;

    const json = await res.json();

    const law = json?.법령 ?? json?.data?.법령 ?? json;
    const reasonBlock = law?.제개정이유 ?? law?.["제개정이유"];
    if (!reasonBlock) return null;

    const content =
      reasonBlock?.제개정이유내용 ?? reasonBlock?.["제개정이유내용"];

    if (Array.isArray(content)) {
      return content.flat(Infinity).filter(Boolean).join("\n");
    }
    if (typeof content === "string") {
      return content;
    }

    return null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// (d) fetchCompareData — 메인: lawId → CompareApiResponse
// ---------------------------------------------------------------------------

export async function fetchCompareData(
  lawId: string,
): Promise<CompareApiResponse | null> {
  // 1. 법령 검색 → mst 획득
  const meta = await searchLawMeta(lawId);
  if (!meta) return null;

  // 2. 법령 상세 + 제·개정이유 조회
  const detail = await fetchCompareOldNew(meta.mst);
  if (!detail) return null;

  // 3. 신구대조 items는 나중에 mock-data 또는 MCP로 채움 — 빈 배열 반환
  const items: CompareOldNewItem[] = [];

  return {
    lawName: detail.lawName,
    amendmentType: detail.amendmentType,
    amendmentDate: detail.amendmentDate,
    enforcementDate: detail.enforcementDate,
    amendmentReason: detail.amendmentReason,
    items,
    changeMeta: {},
  };
}

// ---------------------------------------------------------------------------
// (e) fetchLatestLawInfo — cron용: MST로 최신 공포일·개정구분 조회
// ---------------------------------------------------------------------------

export interface LatestLawInfo {
  lawName: string;
  amendmentType: string;  // 일부개정, 타법개정, 전부개정 등
  promulgationDate: string; // YYYYMMDD
  enforcementDate: string;  // YYYYMMDD
  promulgationNo: string;
}

/**
 * 법제처 웹 엔드포인트로 법령의 현행 최신 정보를 조회합니다.
 * OC 키/IP 인증이 불필요한 lsRvsDocInfoR.do를 사용합니다.
 * cron에서 저장된 공포일과 비교하여 새 개정 여부를 판단합니다.
 *
 * @param lawId - 법령ID (예: "000030")
 * @param mst - 법령MST/lsiSeq (예: "277377")
 */
export async function fetchLatestLawInfo(
  lawId: string,
  mst: string,
): Promise<LatestLawInfo | null> {
  const url = `https://www.law.go.kr/LSW/lsRvsDocInfoR.do?lsId=${lawId}&lsiSeq=${mst}`;

  // 최대 2회 재시도 (법제처 rate limit 대응)
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      if (attempt > 0) {
        await new Promise((r) => setTimeout(r, 1000 * attempt));
      }

      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) {
        console.error(`[law-api] fetchLatestLawInfo HTTP ${res.status} for lawId=${lawId} (attempt ${attempt + 1})`);
        continue;
      }

      const html = await res.text();

    // hidden input에서 메타데이터 추출
    const get = (id: string): string => {
      const m = html.match(new RegExp(`id="${id}"\\s+value="([^"]*)"`));
      return m?.[1] ?? "";
    };

    const lawName = get("lsNm");
    const promulgationDate = get("ancYd");   // 공포일 YYYYMMDD
    const enforcementDate = get("efYd");     // 시행일 YYYYMMDD
    const promulgationNo = get("ancNo");     // 공포번호

    if (!promulgationDate) {
      console.error(`[law-api] fetchLatestLawInfo: no ancYd for lawId=${lawId}`);
      return null;
    }

      return {
        lawName,
        amendmentType: "",  // 이 엔드포인트에서는 개정구분 미제공
        promulgationDate,
        enforcementDate,
        promulgationNo,
      };
    } catch (err) {
      console.error(`[law-api] fetchLatestLawInfo error for lawId=${lawId} (attempt ${attempt + 1}):`, err);
      if (attempt === 2) return null;
    }
  }

  return null;
}
