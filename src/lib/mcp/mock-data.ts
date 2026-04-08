import { Article, Amendment, ThreeTierRow, CompareOldNewItem } from "@/types/law";

// ---------------------------------------------------------------------------
// 조문 데이터 — JSON 파일에서 로드 (전체 조문 + 정적 해설 포함)
// ---------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-require-imports
const infoCommArticles: Article[] = require("@/lib/data/articles/info-comm.json") as Article[];
// eslint-disable-next-line @typescript-eslint/no-require-imports
const privacyArticles: Article[] = require("@/lib/data/articles/privacy.json") as Article[];
// eslint-disable-next-line @typescript-eslint/no-require-imports
const swPromotionArticles: Article[] = require("@/lib/data/articles/sw-promotion.json") as Article[];
// eslint-disable-next-line @typescript-eslint/no-require-imports
const aiBasicArticles: Article[] = require("@/lib/data/articles/ai-basic.json") as Article[];
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cloudArticles: Article[] = require("@/lib/data/articles/cloud.json") as Article[];
// eslint-disable-next-line @typescript-eslint/no-require-imports
const eGovArticles: Article[] = require("@/lib/data/articles/e-gov.json") as Article[];
// eslint-disable-next-line @typescript-eslint/no-require-imports
const natContractArticles: Article[] = require("@/lib/data/articles/nat-contract.json") as Article[];
// eslint-disable-next-line @typescript-eslint/no-require-imports
const creditInfoArticles: Article[] = require("@/lib/data/articles/credit-info.json") as Article[];
// eslint-disable-next-line @typescript-eslint/no-require-imports
const publicDataArticles: Article[] = require("@/lib/data/articles/public-data.json") as Article[];
// eslint-disable-next-line @typescript-eslint/no-require-imports
const dataIndustryArticles: Article[] = require("@/lib/data/articles/data-industry.json") as Article[];
// eslint-disable-next-line @typescript-eslint/no-require-imports
const intelligentInfoArticles: Article[] = require("@/lib/data/articles/intelligent-info.json") as Article[];
// eslint-disable-next-line @typescript-eslint/no-require-imports
const quantumArticles: Article[] = require("@/lib/data/articles/quantum.json") as Article[];

// ---------------------------------------------------------------------------
// 제·개정이유 데이터 — 법제처 API 실데이터
// ---------------------------------------------------------------------------

// 정보통신망법 — 8개 MST 버전 (2024~2026)
const infoCommAmendments: Amendment[] = [
  {
    id: "amd-info-009",
    lawId: "info-comm",
    date: "2026-03-31",
    type: "일부개정",
    summary: "[법률 제21500호 2단계] 정보통신망 침해사고 대응체계 고도화 — 제48조의7~10(침해사고 보고 의무 강화), 제50조의9~10(불법 광고 규제 확대) 중 일부 조문 시행",
    enforcementDate: "2027-04-01",
  },
  {
    id: "amd-info-008",
    lawId: "info-comm",
    date: "2026-03-31",
    type: "일부개정",
    summary: "[법률 제21500호 1단계] 정보통신망 침해사고 대응체계 고도화 — 제48조의7~10(침해사고 보고 의무 강화), 제50조의9~10(불법 광고 규제 확대) 신설",
    enforcementDate: "2026-10-01",
  },
  {
    id: "amd-info-007",
    lawId: "info-comm",
    date: "2026-03-10",
    type: "타법개정",
    summary: "정부조직법 개정에 따른 관계 기관명칭 정비 반영",
    enforcementDate: "2026-03-10",
  },
  {
    id: "amd-info-006",
    lawId: "info-comm",
    date: "2026-01-06",
    type: "일부개정",
    summary: "온라인 불법콘텐츠 대응 강화 — 제44조의11~26(플랫폼 사업자 자율규제 의무, 불법정보 유통방지 체계 확대) 16개 조문 신설",
    enforcementDate: "2026-07-07",
  },
  {
    id: "amd-info-005",
    lawId: "info-comm",
    date: "2025-10-01",
    type: "타법개정",
    summary: "방송통신위원회의 설치 및 운영에 관한 법률 제정에 따라 법률상 '방송통신위원회' 명칭을 '방송미디어통신위원회'로 일괄 변경",
    enforcementDate: "2025-10-01",
  },
  {
    id: "amd-info-004",
    lawId: "info-comm",
    date: "2025-01-21",
    type: "일부개정",
    summary: "인공지능 기본법 제정에 따른 정보통신망법 연계 조항 정비 — AI 서비스 관련 이용자 보호 규정 반영",
    enforcementDate: "2026-01-22",
  },
  {
    id: "amd-info-003",
    lawId: "info-comm",
    date: "2024-12-03",
    type: "일부개정",
    summary: "대화형 AI 서비스의 아동 보호 조항(제44조의8) 신설, 합성영상 피해 예방 시책(제4조의2) 신설 등 디지털 안전 강화",
    enforcementDate: "2025-06-04",
  },
  {
    id: "amd-info-002",
    lawId: "info-comm",
    date: "2024-02-13",
    type: "일부개정",
    summary: "연계정보(CI) 생성·처리 제도 정비(제23조의5~6), 국내대리인 제도 강화(제32조의5), 통신과금서비스 이용자 보호 확대",
    enforcementDate: "2024-08-14",
  },
  {
    id: "amd-info-001",
    lawId: "info-comm",
    date: "2024-01-23",
    type: "일부개정",
    summary: "집적정보통신시설 보호조치 강화(제46조 개정) 및 IoT 기기 정보보호인증(제48조의6) 신설, 침해사고 신고체계 개편(제48조의3)",
    enforcementDate: "2024-07-24",
  },
];

// 개인정보보호법
const privacyAmendments: Amendment[] = [
  {
    id: "amd-priv-001",
    lawId: "privacy",
    date: "2025-04-01",
    type: "일부개정",
    summary: "국내대리인 지정 의무 강화 — 국내 자회사 지정 의무화(제31조의2 제2항 후단·제1호·제2호 신설), 관리·감독 의무 신설(제3항), 항번호 재배열(구 제3항→제4항, 구 제4항→제5항), 과태료 조항 정비(제75조 제3항 제3호·제4호, 제4항 제9호의2 신설)",
    enforcementDate: "2025-10-02",
  },
  {
    id: "amd-priv-002",
    lawId: "privacy",
    date: "2023-03-14",
    type: "일부개정",
    summary: "개인정보 전송요구권(이동권) 도입(제35조의2·제35조의3 신설), 자동화된 의사결정에 대한 정보주체 권리 신설(제37조의2), 개인정보 보호위원회의 긴급조치명령권 도입, 과징금 상한 전체 매출액의 3%로 상향, 국외 이전 규정 정비(제28조의8~제28조의13)",
    enforcementDate: "2024-03-15",
  },
  {
    id: "amd-priv-003",
    lawId: "privacy",
    date: "2020-08-05",
    type: "일부개정",
    summary: "데이터 3법 개정 — 가명정보 개념 도입 및 처리 근거 마련(제2조 제1호의2, 제28조의2~제28조의7), 개인정보 보호위원회 중앙행정기관 격상(독립 감독기구), 데이터 결합 전문기관 제도 신설, 과징금 부과 기준 개선",
    enforcementDate: "2020-08-05",
  },
  {
    id: "amd-priv-004",
    lawId: "privacy",
    date: "2017-10-19",
    type: "일부개정",
    summary: "주민등록번호 처리 제한 강화(제24조의2), 개인정보 유출 통지 기준 구체화(제34조), 손해배상 입증책임 전환(제39조), 법정손해배상 제도 도입(제39조의2)",
    enforcementDate: "2017-10-19",
  },
  {
    id: "amd-priv-005",
    lawId: "privacy",
    date: "2011-03-29",
    type: "제정",
    summary: "개인정보 보호법 제정 — 공공·민간 통합 개인정보 보호 체계 수립, 개인정보 보호위원회 설치, 개인정보 수집·이용·제공·파기 원칙 수립, 영상정보처리기기 규율, 분쟁조정위원회 및 집단분쟁조정 제도 도입",
    enforcementDate: "2011-09-30",
  },
];

// SW진흥법
const swPromotionAmendments: Amendment[] = [
  {
    id: "amd-sw-001",
    lawId: "sw-promotion",
    date: "2024-10-22",
    type: "일부개정",
    summary: "소프트웨어산업의 건전한 발전 도모를 위한 벌칙 규정 강화 및 부정 인증 표시에 대한 과태료 조항 신설",
    enforcementDate: "2025-04-23",
  },
];

// AI기본법
const aiBasicAmendments: Amendment[] = [
  {
    id: "amd-ai-002",
    lawId: "ai-basic",
    date: "2026-01-20",
    type: "일부개정",
    summary: "국가인공지능위원회를 국가인공지능전략위원회로 개편·확대하고, 학습용데이터 지원체계 강화 및 인공지능취약계층 지원 제도 신설",
    enforcementDate: "2026-01-22",
  },
  {
    id: "amd-ai-001",
    lawId: "ai-basic",
    date: "2025-01-21",
    type: "제정",
    summary: "인공지능 발전과 신뢰 기반 조성 등에 관한 기본법 제정 — 고영향 AI 규율, 인공지능위원회 설치, AI 윤리원칙 법제화",
    enforcementDate: "2026-01-22",
  },
];

// 클라우드발전법
const cloudAmendments: Amendment[] = [
  {
    id: "amd-cloud-001",
    lawId: "cloud",
    date: "2025-10-01",
    type: "타법개정",
    summary: "방송미디어통신위원회 신설에 따른 법률상 기관 명칭 변경(방송통신위원회 → 방송미디어통신위원회) 반영",
    enforcementDate: "2025-10-01",
  },
];

// 전자정부법
const eGovAmendments: Amendment[] = [
  {
    id: "amd-egov-001",
    lawId: "e-gov",
    date: "2025-01-07",
    type: "일부개정",
    summary: "정보시스템 장애관리 체계 강화 및 등급 관리 제도 신설 — '정보자원' 정의 확대, 장애관리계획 수립지침·현황조사 권한 규정 마련",
    enforcementDate: "2025-07-08",
  },
];

// 국가계약법
const natContractAmendments: Amendment[] = [
  {
    id: "amd-nat-001",
    lawId: "nat-contract",
    date: "2025-10-01",
    type: "타법개정",
    summary: "정부조직 재설계에 따른 관련 기관명 변경 — 기획재정부 분리(기획예산처·재정경제부), 검찰청 폐지·공소청 신설 등 정부 기능 개편 반영",
    enforcementDate: "2026-01-02",
  },
];

// 신용정보법
const creditInfoAmendments: Amendment[] = [
  {
    id: "amd-credit-001",
    lawId: "credit-info",
    date: "2024-02-13",
    type: "일부개정",
    summary: "개인신용평가회사·개인사업자신용평가회사·기업신용조회회사의 허가 출자요건 완화 — 금융기관 출자비율 기준을 100분의 50에서 100분의 33 이상으로 조정",
    enforcementDate: "2024-08-14",
  },
];

// 공공데이터법
const publicDataAmendments: Amendment[] = [
  {
    id: "amd-pubdata-001",
    lawId: "public-data",
    date: "2023-05-16",
    type: "타법개정",
    summary: "데이터기반행정 활성화 위원회를 공공데이터전략위원회의 분과위원회로 통합하고, 제공거부 조정기능을 공공데이터분쟁조정위원회로 이관",
    enforcementDate: "2023-11-17",
  },
];

// 데이터산업법
const dataIndustryAmendments: Amendment[] = [
  {
    id: "amd-dataindu-001",
    lawId: "data-industry",
    date: "2025-10-01",
    type: "타법개정",
    summary: "방송미디어통신위원회 신설에 따른 기관명 변경 반영 — 미디어 환경 변화 대응을 위한 정책 추진체계 이원화 개선",
    enforcementDate: "2025-10-01",
  },
];

// 지능정보화기본법
const intelligentInfoAmendments: Amendment[] = [
  {
    id: "amd-intinfo-001",
    lawId: "intelligent-info",
    date: "2025-01-21",
    type: "타법개정",
    summary: "인공지능 기본법 제정에 따른 지능정보화 기본법 연계 조항 정비",
    enforcementDate: "2026-01-22",
  },
];

// 양자법
const quantumAmendments: Amendment[] = [
  {
    id: "amd-quantum-001",
    lawId: "quantum",
    date: "2024-01-09",
    type: "제정",
    summary: "양자과학기술 및 양자산업 육성에 관한 법률 제정 — 양자전략위원회 설치, 종합계획 수립, 양자연구센터·클러스터 지원, 양자인력 양성 등 양자산업 체계적 육성 기반 마련",
    enforcementDate: "2024-11-01",
  },
];

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------
const articlesMap: Record<string, Article[]> = {
  "info-comm": infoCommArticles,
  privacy: privacyArticles,
  "sw-promotion": swPromotionArticles,
  "ai-basic": aiBasicArticles,
  cloud: cloudArticles,
  "e-gov": eGovArticles,
  "nat-contract": natContractArticles,
  "credit-info": creditInfoArticles,
  "public-data": publicDataArticles,
  "data-industry": dataIndustryArticles,
  "intelligent-info": intelligentInfoArticles,
  quantum: quantumArticles,
};

const amendmentsMap: Record<string, Amendment[]> = {
  "info-comm": infoCommAmendments,
  privacy: privacyAmendments,
  "sw-promotion": swPromotionAmendments,
  "ai-basic": aiBasicAmendments,
  cloud: cloudAmendments,
  "e-gov": eGovAmendments,
  "nat-contract": natContractAmendments,
  "credit-info": creditInfoAmendments,
  "public-data": publicDataAmendments,
  "data-industry": dataIndustryAmendments,
  "intelligent-info": intelligentInfoAmendments,
  quantum: quantumAmendments,
};

export function getMockArticles(lawId: string): Article[] {
  return articlesMap[lawId] ?? [];
}

export function getMockAmendments(lawId: string): Amendment[] {
  return amendmentsMap[lawId] ?? [];
}

// ---------------------------------------------------------------------------
// 3단비교 데이터 — JSON 파일에서 로드
// ---------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-require-imports
const infoCommThreeTier: ThreeTierRow[] = require("@/lib/data/three-tier/info-comm.json") as ThreeTierRow[];
// eslint-disable-next-line @typescript-eslint/no-require-imports
const privacyThreeTier: ThreeTierRow[] = require("@/lib/data/three-tier/privacy.json") as ThreeTierRow[];
// eslint-disable-next-line @typescript-eslint/no-require-imports
const swPromotionThreeTier: ThreeTierRow[] = require("@/lib/data/three-tier/sw-promotion.json") as ThreeTierRow[];
// eslint-disable-next-line @typescript-eslint/no-require-imports
const aiBasicThreeTier: ThreeTierRow[] = require("@/lib/data/three-tier/ai-basic.json") as ThreeTierRow[];
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cloudThreeTier: ThreeTierRow[] = require("@/lib/data/three-tier/cloud.json") as ThreeTierRow[];
// eslint-disable-next-line @typescript-eslint/no-require-imports
const eGovThreeTier: ThreeTierRow[] = require("@/lib/data/three-tier/e-gov.json") as ThreeTierRow[];
// eslint-disable-next-line @typescript-eslint/no-require-imports
const natContractThreeTier: ThreeTierRow[] = require("@/lib/data/three-tier/nat-contract.json") as ThreeTierRow[];
// eslint-disable-next-line @typescript-eslint/no-require-imports
const creditInfoThreeTier: ThreeTierRow[] = require("@/lib/data/three-tier/credit-info.json") as ThreeTierRow[];
// eslint-disable-next-line @typescript-eslint/no-require-imports
const publicDataThreeTier: ThreeTierRow[] = require("@/lib/data/three-tier/public-data.json") as ThreeTierRow[];
// eslint-disable-next-line @typescript-eslint/no-require-imports
const dataIndustryThreeTier: ThreeTierRow[] = require("@/lib/data/three-tier/data-industry.json") as ThreeTierRow[];
// eslint-disable-next-line @typescript-eslint/no-require-imports
const intelligentInfoThreeTier: ThreeTierRow[] = require("@/lib/data/three-tier/intelligent-info.json") as ThreeTierRow[];
// eslint-disable-next-line @typescript-eslint/no-require-imports
const quantumThreeTier: ThreeTierRow[] = require("@/lib/data/three-tier/quantum.json") as ThreeTierRow[];

const threeTierMap: Record<string, ThreeTierRow[]> = {
  "info-comm": infoCommThreeTier,
  privacy: privacyThreeTier,
  "sw-promotion": swPromotionThreeTier,
  "ai-basic": aiBasicThreeTier,
  cloud: cloudThreeTier,
  "e-gov": eGovThreeTier,
  "nat-contract": natContractThreeTier,
  "credit-info": creditInfoThreeTier,
  "public-data": publicDataThreeTier,
  "data-industry": dataIndustryThreeTier,
  "intelligent-info": intelligentInfoThreeTier,
  quantum: quantumThreeTier,
};

export function getMockThreeTier(lawId: string): ThreeTierRow[] {
  return threeTierMap[lawId] ?? [];
}

// ---------------------------------------------------------------------------
// 신구대조 데이터 — JSON 파일에서 로드
// ---------------------------------------------------------------------------
interface CompareEntry {
  amendmentDate: string;
  enforcementDate: string;
  amendmentReason?: string;
  items: CompareOldNewItem[];
  changeMeta: Record<string, { tags: string[]; affectedParties: string[] }>;
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const infoCommCompare: Record<string, CompareEntry> = require("@/lib/data/compare/info-comm.json") as Record<string, CompareEntry>;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const privacyCompare: Record<string, CompareEntry> = require("@/lib/data/compare/privacy.json") as Record<string, CompareEntry>;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const swPromotionCompare: Record<string, CompareEntry> = require("@/lib/data/compare/sw-promotion.json") as Record<string, CompareEntry>;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const aiBasicCompare: Record<string, CompareEntry> = require("@/lib/data/compare/ai-basic.json") as Record<string, CompareEntry>;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cloudCompare: Record<string, CompareEntry> = require("@/lib/data/compare/cloud.json") as Record<string, CompareEntry>;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const eGovCompare: Record<string, CompareEntry> = require("@/lib/data/compare/e-gov.json") as Record<string, CompareEntry>;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const natContractCompare: Record<string, CompareEntry> = require("@/lib/data/compare/nat-contract.json") as Record<string, CompareEntry>;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const creditInfoCompare: Record<string, CompareEntry> = require("@/lib/data/compare/credit-info.json") as Record<string, CompareEntry>;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const publicDataCompare: Record<string, CompareEntry> = require("@/lib/data/compare/public-data.json") as Record<string, CompareEntry>;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const dataIndustryCompare: Record<string, CompareEntry> = require("@/lib/data/compare/data-industry.json") as Record<string, CompareEntry>;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const intelligentInfoCompare: Record<string, CompareEntry> = require("@/lib/data/compare/intelligent-info.json") as Record<string, CompareEntry>;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const quantumCompare: Record<string, CompareEntry> = require("@/lib/data/compare/quantum.json") as Record<string, CompareEntry>;

const compareMap: Record<string, Record<string, CompareEntry>> = {
  "info-comm": infoCommCompare,
  privacy: privacyCompare,
  "sw-promotion": swPromotionCompare,
  "ai-basic": aiBasicCompare,
  cloud: cloudCompare,
  "e-gov": eGovCompare,
  "nat-contract": natContractCompare,
  "credit-info": creditInfoCompare,
  "public-data": publicDataCompare,
  "data-industry": dataIndustryCompare,
  "intelligent-info": intelligentInfoCompare,
  quantum: quantumCompare,
};

export function getMockCompareData(lawId: string, amdId?: string): CompareEntry | null {
  const lawData = compareMap[lawId];
  if (!lawData) return null;
  if (amdId) return lawData[amdId] ?? null;
  // amdId 미지정 시 가장 최근 개정 반환
  const keys = Object.keys(lawData).sort().reverse();
  return keys.length > 0 ? lawData[keys[0]] : null;
}

export function getMockCompareEntries(lawId: string): { amdId: string; entry: CompareEntry }[] {
  const lawData = compareMap[lawId];
  if (!lawData) return [];
  return Object.entries(lawData)
    .map(([amdId, entry]) => ({ amdId, entry }))
    .sort((a, b) => b.entry.amendmentDate.localeCompare(a.entry.amendmentDate));
}
