/**
 * 법령 계층 구조 + 유관기관 계층 데이터
 * 10개 IT 법률별 법령체계 및 소관 기관 트리
 */

import type { HierarchyNode } from "@/types/law";
import { ADMIN_RULES_MAP } from "@/lib/data/admin-rules";
import { getLawById } from "@/lib/utils/law-constants";

// ---------------------------------------------------------------------------
// 1. 법령 계층 데이터 (법률 → 시행령 → 시행규칙 → 고시 + 연관법)
// ---------------------------------------------------------------------------

const baseLawHierarchy: Record<string, HierarchyNode[]> = {
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
              fullName: "정보통신망 이용촉진 및 정보보호 등에 관한 법률 시행규칙",
              type: "시행규칙",
              color: "amber",
              children: [],
            },
          ],
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
      ],
    },
  ],
  "sw-promotion": [
    {
      id: "sw-promotion-law",
      name: "SW진흥법",
      fullName: "소프트웨어 진흥법",
      type: "법률",
      color: "blue",
      children: [
        {
          id: "sw-promotion-decree",
          name: "SW진흥법 시행령",
          fullName: "소프트웨어 진흥법 시행령",
          type: "시행령",
          color: "emerald",
          children: [],
        },
      ],
    },
  ],
  "ai-basic": [
    {
      id: "ai-basic-law",
      name: "AI기본법",
      fullName: "인공지능 발전과 신뢰 기반 조성 등에 관한 기본법",
      type: "법률",
      color: "blue",
      children: [
        {
          id: "ai-basic-decree",
          name: "AI기본법 시행령",
          fullName: "인공지능 발전과 신뢰 기반 조성 등에 관한 기본법 시행령",
          type: "시행령",
          color: "emerald",
          children: [],
        },
      ],
    },
  ],
  cloud: [
    {
      id: "cloud-law",
      name: "클라우드발전법",
      fullName: "클라우드컴퓨팅 발전 및 이용자 보호에 관한 법률",
      type: "법률",
      color: "blue",
      children: [
        {
          id: "cloud-decree",
          name: "클라우드발전법 시행령",
          fullName: "클라우드컴퓨팅 발전 및 이용자 보호에 관한 법률 시행령",
          type: "시행령",
          color: "emerald",
          children: [],
        },
      ],
    },
  ],
  "e-gov": [
    {
      id: "e-gov-law",
      name: "전자정부법",
      fullName: "전자정부법",
      type: "법률",
      color: "blue",
      children: [
        {
          id: "e-gov-decree",
          name: "전자정부법 시행령",
          fullName: "전자정부법 시행령",
          type: "시행령",
          color: "emerald",
          children: [
            {
              id: "e-gov-rule",
              name: "전자정부법 시행규칙",
              fullName: "전자정부법 시행규칙",
              type: "시행규칙",
              color: "amber",
              children: [],
            },
          ],
        },
      ],
    },
  ],
  "nat-contract": [
    {
      id: "nat-contract-law",
      name: "국가계약법",
      fullName: "국가를 당사자로 하는 계약에 관한 법률",
      type: "법률",
      color: "blue",
      children: [
        {
          id: "nat-contract-decree",
          name: "국가계약법 시행령",
          fullName: "국가를 당사자로 하는 계약에 관한 법률 시행령",
          type: "시행령",
          color: "emerald",
          children: [
            {
              id: "nat-contract-rule",
              name: "국가계약법 시행규칙",
              fullName: "국가를 당사자로 하는 계약에 관한 법률 시행규칙",
              type: "시행규칙",
              color: "amber",
              children: [],
            },
          ],
        },
      ],
    },
  ],
  "credit-info": [
    {
      id: "credit-info-law",
      name: "신용정보법",
      fullName: "신용정보의 이용 및 보호에 관한 법률",
      type: "법률",
      color: "blue",
      children: [
        {
          id: "credit-info-decree",
          name: "신용정보법 시행령",
          fullName: "신용정보의 이용 및 보호에 관한 법률 시행령",
          type: "시행령",
          color: "emerald",
          children: [],
        },
      ],
    },
  ],
  "public-data": [
    {
      id: "public-data-law",
      name: "공공데이터법",
      fullName: "공공데이터의 제공 및 이용 활성화에 관한 법률",
      type: "법률",
      color: "blue",
      children: [
        {
          id: "public-data-decree",
          name: "공공데이터법 시행령",
          fullName: "공공데이터의 제공 및 이용 활성화에 관한 법률 시행령",
          type: "시행령",
          color: "emerald",
          children: [],
        },
      ],
    },
  ],
  "data-industry": [
    {
      id: "data-industry-law",
      name: "데이터산업법",
      fullName: "데이터 산업진흥 및 이용촉진에 관한 기본법",
      type: "법률",
      color: "blue",
      children: [
        {
          id: "data-industry-decree",
          name: "데이터산업법 시행령",
          fullName: "데이터 산업진흥 및 이용촉진에 관한 기본법 시행령",
          type: "시행령",
          color: "emerald",
          children: [],
        },
      ],
    },
  ],
  "intelligent-info": [
    {
      id: "intelligent-info-law",
      name: "지능정보화기본법",
      fullName: "지능정보화 기본법",
      type: "법률",
      color: "blue",
      children: [
        {
          id: "intelligent-info-decree",
          name: "지능정보화기본법 시행령",
          fullName: "지능정보화 기본법 시행령",
          type: "시행령",
          color: "emerald",
          children: [
            {
              id: "intelligent-info-rule",
              name: "지능정보화기본법 시행규칙",
              fullName: "지능정보화 기본법 시행규칙",
              type: "시행규칙",
              color: "amber",
              children: [],
            },
          ],
        },
      ],
    },
  ],
  quantum: [
    {
      id: "quantum-law",
      name: "양자법",
      fullName: "양자과학기술 및 양자산업 육성에 관한 법률",
      type: "법률",
      color: "blue",
      children: [
        {
          id: "quantum-decree",
          name: "양자법 시행령",
          fullName: "양자과학기술 및 양자산업 육성에 관한 법률 시행령",
          type: "시행령",
          color: "emerald",
          children: [
            {
              id: "quantum-rule",
              name: "양자법 시행규칙",
              fullName: "양자과학기술 및 양자산업 육성에 관한 법률 시행규칙",
              type: "시행규칙",
              color: "amber",
              children: [],
            },
          ],
        },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// 연관 법령 관계 맵
// ---------------------------------------------------------------------------

const relatedLawsMap: Record<string, { lawId: string; relation: string }[]> = {
  "info-comm": [
    { lawId: "privacy", relation: "개인정보 처리 시 적용" },
    { lawId: "e-gov", relation: "전자정부서비스 연계" },
    { lawId: "sw-promotion", relation: "SW 보안취약점 고지" },
    { lawId: "cloud", relation: "클라우드 정보보호" },
    { lawId: "credit-info", relation: "온라인 금융서비스" },
  ],
  privacy: [
    { lawId: "info-comm", relation: "정보통신망 특례" },
    { lawId: "credit-info", relation: "신용정보 관계" },
    { lawId: "ai-basic", relation: "AI 자동의사결정" },
  ],
  "sw-promotion": [
    { lawId: "nat-contract", relation: "공공 SW사업 계약" },
    { lawId: "cloud", relation: "클라우드 기반 SW" },
  ],
  "ai-basic": [
    { lawId: "privacy", relation: "AI 개인정보 규제" },
    { lawId: "info-comm", relation: "AI 서비스 정보보호" },
    { lawId: "data-industry", relation: "AI 학습 데이터" },
  ],
  cloud: [
    { lawId: "e-gov", relation: "공공기관 클라우드 도입" },
    { lawId: "sw-promotion", relation: "클라우드 SW 대가" },
    { lawId: "info-comm", relation: "클라우드 정보보호" },
  ],
  "e-gov": [
    { lawId: "cloud", relation: "전자정부 클라우드 전환" },
    { lawId: "public-data", relation: "행정정보 공공데이터" },
    { lawId: "info-comm", relation: "전자정부 정보보호" },
    { lawId: "intelligent-info", relation: "지능정보화기본법 특례 (제5조③)" },
  ],
  "nat-contract": [
    { lawId: "sw-promotion", relation: "SW사업 대가 기준" },
    { lawId: "cloud", relation: "클라우드 서비스 조달" },
  ],
  "credit-info": [
    { lawId: "privacy", relation: "신용정보 중 개인정보" },
    { lawId: "info-comm", relation: "온라인 신용정보 서비스" },
    { lawId: "data-industry", relation: "마이데이터 산업" },
  ],
  "public-data": [
    { lawId: "e-gov", relation: "전자정부 데이터 개방" },
    { lawId: "data-industry", relation: "공공데이터 산업 활용" },
  ],
  "data-industry": [
    { lawId: "public-data", relation: "공공데이터 활용" },
    { lawId: "privacy", relation: "데이터 결합 시 보호" },
    { lawId: "credit-info", relation: "금융데이터 활용" },
  ],
  "intelligent-info": [
    { lawId: "e-gov", relation: "전자정부 특례 (제5조③)" },
    { lawId: "cloud", relation: "클라우드컴퓨팅기술 정의 참조 (제2조)" },
    { lawId: "public-data", relation: "공공데이터 시책 연계 (제42조)" },
    { lawId: "info-comm", relation: "정보통신망 정의 참조 (제2조)" },
  ],
  quantum: [
    { lawId: "sw-promotion", relation: "소프트웨어 정의 참조 (제2조)" },
    { lawId: "intelligent-info", relation: "지능정보기술 연계" },
  ],
};

// ---------------------------------------------------------------------------
// 고시 + 연관법을 법령 계층에 자동 병합
// ---------------------------------------------------------------------------

function buildFullHierarchy(lawId: string): HierarchyNode[] {
  const base = baseLawHierarchy[lawId];
  if (!base) {
    const law = getLawById(lawId);
    const name = law?.shortName ?? lawId;
    return [
      {
        id: `${lawId}-law`,
        name,
        fullName: law?.name ?? name,
        type: "법률",
        color: "blue",
        children: [
          {
            id: `${lawId}-decree`,
            name: `${name} 시행령`,
            fullName: `${name} 시행령`,
            type: "시행령",
            color: "emerald",
            children: [],
          },
        ],
      },
    ];
  }

  // Deep clone to avoid mutation
  const hierarchy = JSON.parse(JSON.stringify(base)) as HierarchyNode[];
  const rootNode = hierarchy[0];
  if (!rootNode) return hierarchy;

  // 고시 추가 (ADMIN_RULES_MAP에서)
  const adminRules = ADMIN_RULES_MAP[lawId] ?? [];
  for (const rule of adminRules) {
    rootNode.children.push({
      id: `${lawId}-admin-${rule.id}`,
      name: rule.name.length > 20 ? rule.name.slice(0, 18) + "…" : rule.name,
      fullName: `${rule.name} (${rule.type})`,
      type: "고시",
      color: "purple",
      relation: `${rule.department} 소관 ${rule.type}`,
      children: [],
    });
  }

  // 연관법 추가
  const related = relatedLawsMap[lawId] ?? [];
  for (const rel of related) {
    const relLaw = getLawById(rel.lawId);
    if (!relLaw) continue;
    rootNode.children.push({
      id: `${lawId}-rel-${rel.lawId}`,
      name: relLaw.shortName,
      fullName: relLaw.name,
      type: "연관법",
      color: "indigo",
      relation: rel.relation,
      lawId: rel.lawId,
      children: [],
    });
  }

  return hierarchy;
}

// ---------------------------------------------------------------------------
// 2. 유관기관 계층 데이터
// ---------------------------------------------------------------------------

const agencyHierarchyData: Record<string, HierarchyNode[]> = {
  "info-comm": [
    {
      id: "agency-msit",
      name: "과기정통부장관",
      fullName: "과학기술정보통신부장관 (34개 조문)",
      type: "기관",
      color: "rose",
      children: [
        {
          id: "agency-kisa",
          name: "KISA",
          fullName: "한국인터넷진흥원",
          type: "기관",
          color: "rose",
          relation: "위탁 (제52조, 제65조③)",
          children: [],
        },
        {
          id: "agency-nia-ic",
          name: "NIA",
          fullName: "한국지능정보사회진흥원",
          type: "기관",
          color: "rose",
          relation: "이용촉진 사업 위탁 (제65조②)",
          children: [],
        },
      ],
    },
    {
      id: "agency-bmtc",
      name: "방송미디어통신위원회",
      fullName: "방송미디어통신위원회 (제44조의7)",
      type: "기관",
      color: "rose",
      children: [
        {
          id: "agency-review-committee",
          name: "심의위원회",
          fullName: "방송통신심의위원회",
          type: "기관",
          color: "rose",
          relation: "불법정보 심의 (제44조의7②③)",
          children: [
            {
              id: "agency-defamation-mediation",
              name: "명예훼손 분쟁조정부",
              fullName: "명예훼손 분쟁조정부",
              type: "기관",
              color: "rose",
              relation: "명예훼손 분쟁 조정 (제44조의10)",
              children: [],
            },
          ],
        },
      ],
    },
  ],
  // 개인정보보호법: 보호위원회 42건, 분쟁조정위원회 10건, 전문기관 9건
  privacy: [
    {
      id: "agency-pipc",
      name: "개인정보보호위원회",
      fullName: "개인정보보호위원회 (42개 조문)",
      type: "기관",
      color: "rose",
      children: [
        {
          id: "agency-pipc-mediation",
          name: "분쟁조정위원회",
          fullName: "개인정보 분쟁조정위원회",
          type: "기관",
          color: "rose",
          relation: "분쟁 조정 (제40~46조)",
          children: [],
        },
        {
          id: "agency-pipc-expert",
          name: "전문기관",
          fullName: "개인정보 보호 전문기관",
          type: "기관",
          color: "rose",
          relation: "영향평가·안전성검토 (제28조의3, 제34조)",
          children: [],
        },
      ],
    },
  ],
  // SW진흥법: 과기정통부장관 49건, 행안부장관 5건, NIPA 1건, 품질인증기관 4건
  "sw-promotion": [
    {
      id: "agency-msit-sw",
      name: "과기정통부장관",
      fullName: "과학기술정보통신부장관 (49개 조문)",
      type: "기관",
      color: "rose",
      children: [
        {
          id: "agency-nipa",
          name: "NIPA",
          fullName: "정보통신산업진흥원",
          type: "기관",
          color: "rose",
          relation: "SW산업 진흥·지원 (제8조)",
          children: [],
        },
        {
          id: "agency-sw-cert",
          name: "품질인증기관",
          fullName: "SW 품질인증기관",
          type: "기관",
          color: "rose",
          relation: "SW 품질인증 수행 (제20~21조)",
          children: [],
        },
      ],
    },
    {
      id: "agency-mois-sw",
      name: "행안부장관",
      fullName: "행정안전부장관 (5개 조문)",
      type: "기관",
      color: "rose",
      relation: "공공SW사업 관리 (제38조, 제44~45조)",
      children: [],
    },
  ],
  // AI기본법: 과기정통부장관 20건, 인공지능위원회 1건, 안전연구소 1건
  "ai-basic": [
    {
      id: "agency-msit-ai",
      name: "과기정통부장관",
      fullName: "과학기술정보통신부장관 (20개 조문)",
      type: "기관",
      color: "rose",
      children: [
        {
          id: "agency-ai-committee",
          name: "인공지능위원회",
          fullName: "인공지능위원회",
          type: "기관",
          color: "rose",
          relation: "AI 정책 심의·조정 (제7조)",
          children: [],
        },
        {
          id: "agency-ai-safety",
          name: "AI안전연구소",
          fullName: "인공지능안전연구소",
          type: "기관",
          color: "rose",
          relation: "고영향 AI 안전성 평가 (제12조)",
          children: [],
        },
        {
          id: "agency-nia-ai",
          name: "NIA",
          fullName: "한국지능정보사회진흥원",
          type: "기관",
          color: "rose",
          relation: "AI 산업 지원 (제11조)",
          children: [],
        },
      ],
    },
  ],
  // 클라우드발전법: 과기정통부장관 19건, 방미통위 3건, KISA 1건, NIPA 1건
  cloud: [
    {
      id: "agency-msit-cloud",
      name: "과기정통부장관",
      fullName: "과학기술정보통신부장관 (19개 조문)",
      type: "기관",
      color: "rose",
      children: [
        {
          id: "agency-kisa-cloud",
          name: "KISA",
          fullName: "한국인터넷진흥원",
          type: "기관",
          color: "rose",
          relation: "CSAP 보안인증 (제23조의2)",
          children: [],
        },
        {
          id: "agency-nipa-cloud",
          name: "NIPA",
          fullName: "정보통신산업진흥원",
          type: "기관",
          color: "rose",
          relation: "클라우드 이용 촉진 (제19조)",
          children: [],
        },
      ],
    },
    {
      id: "agency-bmtc-cloud",
      name: "방송미디어통신위원회",
      fullName: "방송미디어통신위원회 (3개 조문)",
      type: "기관",
      color: "rose",
      relation: "이용자 보호 (제23~24조, 제26조)",
      children: [],
    },
  ],
  // 전자정부법: 행안부장관 34건, 국가정보원장 3건, NIA 1건
  "e-gov": [
    {
      id: "agency-mois-eg",
      name: "행안부장관",
      fullName: "행정안전부장관 (34개 조문)",
      type: "기관",
      color: "rose",
      children: [
        {
          id: "agency-nia-eg",
          name: "NIA",
          fullName: "한국지능정보사회진흥원",
          type: "기관",
          color: "rose",
          relation: "전자정부 지원 (제71조)",
          children: [],
        },
      ],
    },
    {
      id: "agency-nis-eg",
      name: "국가정보원장",
      fullName: "국가정보원장 (3개 조문)",
      type: "기관",
      color: "rose",
      relation: "정보보안 정책 협의 (제24조, 제56조)",
      children: [],
    },
  ],
  // 국가계약법: 각 중앙관서의 장 34건, 계약담당공무원 31건, 조달청 1건, 분쟁조정위 5건
  "nat-contract": [
    {
      id: "agency-central-nc",
      name: "각 중앙관서의 장",
      fullName: "각 중앙관서의 장 (34개 조문)",
      type: "기관",
      color: "rose",
      children: [
        {
          id: "agency-contract-officer",
          name: "계약담당공무원",
          fullName: "계약담당공무원 (31개 조문)",
          type: "기관",
          color: "rose",
          relation: "계약 체결·이행 (제4~7조 등)",
          children: [],
        },
        {
          id: "agency-pps-nc",
          name: "조달청장",
          fullName: "조달청장",
          type: "기관",
          color: "rose",
          relation: "조달 계약 위임 (제6조)",
          children: [],
        },
      ],
    },
    {
      id: "agency-dispute-nc",
      name: "국가계약분쟁조정위원회",
      fullName: "국가계약분쟁조정위원회 (5개 조문)",
      type: "기관",
      color: "rose",
      relation: "계약 분쟁 조정 (제27~29조)",
      children: [],
    },
  ],
  // 신용정보법: 금융위원회 42건, 금융감독원 6건, 한국신용정보원 2건, 개보위 1건
  "credit-info": [
    {
      id: "agency-fsc",
      name: "금융위원회",
      fullName: "금융위원회 (42개 조문)",
      type: "기관",
      color: "rose",
      children: [
        {
          id: "agency-fss",
          name: "금융감독원",
          fullName: "금융감독원 (6개 조문)",
          type: "기관",
          color: "rose",
          relation: "검사·감독 (제45~47조)",
          children: [],
        },
        {
          id: "agency-kcis",
          name: "한국신용정보원",
          fullName: "한국신용정보원",
          type: "기관",
          color: "rose",
          relation: "신용정보 집중관리 (제25조)",
          children: [],
        },
      ],
    },
    {
      id: "agency-pipc-ci",
      name: "개인정보보호위원회",
      fullName: "개인정보보호위원회 (제45조의3)",
      type: "기관",
      color: "rose",
      relation: "개인신용정보 보호 감독",
      children: [],
    },
  ],
  // 공공데이터법: 행안부장관 21건, 과기정통부장관 4건, 전략위 1건, 분쟁조정위 8건
  "public-data": [
    {
      id: "agency-mois-pd",
      name: "행안부장관",
      fullName: "행정안전부장관 (21개 조문)",
      type: "기관",
      color: "rose",
      children: [
        {
          id: "agency-data-strategy",
          name: "공공데이터전략위원회",
          fullName: "공공데이터전략위원회",
          type: "기관",
          color: "rose",
          relation: "정책 심의 (제5조)",
          children: [],
        },
        {
          id: "agency-data-support",
          name: "활용지원센터",
          fullName: "공공데이터활용지원센터",
          type: "기관",
          color: "rose",
          relation: "활용 지원·상담 (제12~13조)",
          children: [],
        },
        {
          id: "agency-data-mediation-pd",
          name: "분쟁조정위원회",
          fullName: "공공데이터 제공 분쟁조정위원회",
          type: "기관",
          color: "rose",
          relation: "제공 거부 분쟁 조정 (제28~34조)",
          children: [],
        },
      ],
    },
  ],
  // 데이터산업법: 과기정통부장관 24건, 행안부장관 6건, 분쟁조정위 3건
  "data-industry": [
    {
      id: "agency-msit-di",
      name: "과기정통부장관",
      fullName: "과학기술정보통신부장관 (24개 조문)",
      type: "기관",
      color: "rose",
      children: [
        {
          id: "agency-data-expert",
          name: "전문기관",
          fullName: "데이터 전문기관",
          type: "기관",
          color: "rose",
          relation: "데이터 산업 지원 (제25조, 제27조)",
          children: [],
        },
        {
          id: "agency-di-dispute",
          name: "분쟁조정위원회",
          fullName: "데이터 분쟁조정위원회",
          type: "기관",
          color: "rose",
          relation: "데이터 거래 분쟁 조정 (제34~38조)",
          children: [],
        },
      ],
    },
    {
      id: "agency-mois-di",
      name: "행안부장관",
      fullName: "행정안전부장관 (6개 조문)",
      type: "기관",
      color: "rose",
      relation: "공공데이터 관련 (제5조, 제10조, 제20조)",
      children: [],
    },
  ],
  // ── 지능정보화기본법: 조문 분석 기반 ──
  "intelligent-info": [
    {
      id: "intelligent-info-agency-msit",
      name: "과기정통부장관",
      fullName: "과학기술정보통신부장관 (다수 조문)",
      type: "기관",
      color: "rose",
      relation: "종합계획 수립, 기술기준 고시, 전담기관 지정 등",
      children: [
        {
          id: "intelligent-info-agency-nia",
          name: "지능정보사회원(NIA)",
          fullName: "한국지능정보사회진흥원 (제12조)",
          type: "기관",
          color: "rose",
          relation: "지능정보사회 시책·사업 지원 (제12조)",
          children: [],
        },
        {
          id: "intelligent-info-agency-ict-cio",
          name: "지능정보화책임관",
          fullName: "지능정보화책임관 협의회 (제8조, 제9조)",
          type: "기관",
          color: "rose",
          relation: "시책 수립·시행 총괄 (제8조)",
          children: [],
        },
        {
          id: "intelligent-info-agency-overuse",
          name: "과의존 대응센터",
          fullName: "지능정보서비스 과의존 대응센터 (제52조)",
          type: "기관",
          color: "rose",
          relation: "과의존 상담·치유 (제52조)",
          children: [],
        },
      ],
    },
    {
      id: "intelligent-info-agency-mois",
      name: "행안부장관",
      fullName: "행정안전부장관 (제7조, 제40조, 제68조, 제69조)",
      type: "기관",
      color: "rose",
      relation: "실행계획 점검, 공공 데이터센터 (제7조, 제40조③)",
      children: [
        {
          id: "intelligent-info-agency-klid",
          name: "한국지역정보개발원",
          fullName: "한국지역정보개발원 (제69조③)",
          type: "기관",
          color: "rose",
          relation: "지역지능정보화 위탁 (제69조③)",
          children: [],
        },
      ],
    },
    {
      id: "intelligent-info-agency-nec",
      name: "국가교육위원회",
      fullName: "국가교육위원회 (제44조③)",
      type: "기관",
      color: "rose",
      relation: "정보문화 교육과정 협의 (제44조③)",
      children: [],
    },
  ],
  // ── 양자법: 조문 분석 기반 ──
  quantum: [
    {
      id: "quantum-agency-pm",
      name: "국무총리",
      fullName: "국무총리 (제7조)",
      type: "기관",
      color: "rose",
      relation: "양자전략위원회 위원장 (제7조②)",
      children: [
        {
          id: "quantum-agency-committee",
          name: "양자전략위원회",
          fullName: "양자전략위원회 (제7조)",
          type: "기관",
          color: "rose",
          relation: "종합계획·클러스터 심의 (제7조①)",
          children: [
            {
              id: "quantum-agency-working",
              name: "실무위원회",
              fullName: "실무위원회 (제7조④)",
              type: "기관",
              color: "rose",
              relation: "사전검토 및 위임 안건 심의",
              children: [],
            },
            {
              id: "quantum-agency-expert",
              name: "전문위원회",
              fullName: "전문위원회 (제7조⑤)",
              type: "기관",
              color: "rose",
              relation: "전문가 자문 지원",
              children: [],
            },
          ],
        },
      ],
    },
    {
      id: "quantum-agency-msit",
      name: "과기정통부장관",
      fullName: "과학기술정보통신부장관 (다수 조문)",
      type: "기관",
      color: "rose",
      relation: "양자종합계획 수립, 양자팹·클러스터 지원 등",
      children: [
        {
          id: "quantum-agency-research-center",
          name: "양자연구센터",
          fullName: "양자과학기술 연구센터 (제18조)",
          type: "기관",
          color: "rose",
          relation: "원천기술 확보·산업 연계 (제18조)",
          children: [],
        },
      ],
    },
    {
      id: "quantum-agency-nis",
      name: "국가정보원장",
      fullName: "국가정보원장 (제10조③)",
      type: "기관",
      color: "rose",
      relation: "보안위협 기밀 유지 판단 (제10조③ 단서)",
      children: [],
    },
  ],
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** 법령 계층 트리 반환 (법률→시행령→시행규칙 + 고시 + 연관법) */
export function getLawHierarchy(lawId: string): HierarchyNode[] {
  return buildFullHierarchy(lawId);
}

/** 유관기관 계층 트리 반환 */
export function getAgencyHierarchy(lawId: string): HierarchyNode[] {
  return agencyHierarchyData[lawId] ?? [];
}

/** 관련 법령 목록 (관련 법령 탭용) */
export function getRelatedLaws(lawId: string): { lawId: string; relation: string }[] {
  return relatedLawsMap[lawId] ?? [];
}
