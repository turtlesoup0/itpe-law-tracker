"use server";

import type { AdminRule, AnnexItem } from "@/types/law";

// 고시/행정규칙 검색 (mock)
export async function searchAdminRules(query: string): Promise<AdminRule[]> {
  const allRules: AdminRule[] = [
    {
      id: "rule-1",
      name: "개인정보의 기술적·관리적 보호조치 기준",
      type: "고시",
      department: "개인정보보호위원회",
      relatedLawId: "info-comm",
      summary:
        "정보통신서비스 제공자가 준수해야 할 개인정보 기술적 보호조치의 세부 기준",
    },
    {
      id: "rule-2",
      name: "개인정보의 안전성 확보조치 기준",
      type: "고시",
      department: "개인정보보호위원회",
      relatedLawId: "privacy",
      summary:
        "개인정보처리자가 준수해야 할 안전성 확보조치의 세부 기준",
    },
    {
      id: "rule-3",
      name: "정보보호 및 개인정보보호 관리체계 인증 등에 관한 고시",
      type: "고시",
      department: "과학기술정보통신부",
      relatedLawId: "info-comm",
      summary: "ISMS-P 인증 기준 및 절차",
    },
    {
      id: "rule-4",
      name: "소프트웨어사업 대가의 기준",
      type: "고시",
      department: "과학기술정보통신부",
      relatedLawId: "sw-promotion",
      summary: "SW 사업 대가 산정의 세부 기준 (기능점수, 투입공수 등)",
    },
    {
      id: "rule-5",
      name: "소프트웨어 진흥법 시행령에 따른 소프트웨어사업의 하도급에 관한 기준",
      type: "예규",
      department: "과학기술정보통신부",
      relatedLawId: "sw-promotion",
      summary: "SW 사업 하도급 관련 세부 기준",
    },
    {
      id: "rule-6",
      name: "클라우드컴퓨팅서비스 보안인증에 관한 고시",
      type: "고시",
      department: "과학기술정보통신부",
      relatedLawId: "cloud",
      summary: "CSAP(클라우드 보안인증) 기준 및 절차",
    },
    {
      id: "rule-7",
      name: "행정기관 및 공공기관의 클라우드컴퓨팅 이용 안내서",
      type: "지침",
      department: "과학기술정보통신부",
      relatedLawId: "cloud",
      summary: "공공기관 클라우드 도입 가이드",
    },
    {
      id: "rule-8",
      name: "전자정부서비스 호환성 준수지침",
      type: "지침",
      department: "행정안전부",
      relatedLawId: "e-gov",
      summary: "전자정부서비스의 웹 호환성 및 접근성 기준",
    },
    {
      id: "rule-9",
      name: "행정기관 정보시스템 접근권한 관리 규정",
      type: "훈령",
      department: "행정안전부",
      relatedLawId: "e-gov",
      summary: "정부 정보시스템 접근권한의 부여·변경·말소 기준",
    },
    {
      id: "rule-10",
      name: "인공지능 윤리기준",
      type: "고시",
      department: "과학기술정보통신부",
      relatedLawId: "ai-basic",
      summary: "AI 개발·활용 시 준수해야 할 윤리 원칙",
    },
  ];

  if (!query.trim()) return allRules;
  return allRules.filter(
    (r) =>
      r.name.includes(query) ||
      r.department.includes(query) ||
      (r.summary?.includes(query) ?? false)
  );
}

// 관련 법령의 고시 조회
export async function fetchAdminRulesByLaw(
  lawId: string
): Promise<AdminRule[]> {
  const all = await searchAdminRules("");
  return all.filter((r) => r.relatedLawId === lawId);
}

// 별표/서식 조회 (mock)
export async function fetchAnnexes(lawName: string): Promise<AnnexItem[]> {
  const annexMap: Record<string, AnnexItem[]> = {
    정보통신망법: [
      {
        id: "annex-1",
        lawName: "정보통신망법",
        annexNo: "별표 1",
        title: "과징금의 부과기준(제64조의3 관련)",
        type: "별표",
      },
      {
        id: "annex-2",
        lawName: "정보통신망법",
        annexNo: "별표 2",
        title: "과태료의 부과기준(제76조 관련)",
        type: "별표",
      },
      {
        id: "annex-3",
        lawName: "정보통신망법 시행규칙",
        annexNo: "서식 제1호",
        title: "정보보호 관리체계 인증 신청서",
        type: "서식",
      },
    ],
    개인정보보호법: [
      {
        id: "annex-4",
        lawName: "개인정보보호법",
        annexNo: "별표 1",
        title: "과징금의 부과기준(제64조의2 관련)",
        type: "별표",
      },
      {
        id: "annex-5",
        lawName: "개인정보보호법",
        annexNo: "별표 2",
        title: "과태료의 부과기준(제75조 관련)",
        type: "별표",
      },
      {
        id: "annex-6",
        lawName: "개인정보보호법 시행규칙",
        annexNo: "서식 제1호",
        title: "개인정보 처리방침 공개 서식",
        type: "서식",
      },
    ],
    SW진흥법: [
      {
        id: "annex-7",
        lawName: "소프트웨어 진흥법",
        annexNo: "별표 1",
        title: "소프트웨어사업의 대가 기준(제26조 관련)",
        type: "별표",
      },
    ],
    클라우드발전법: [
      {
        id: "annex-8",
        lawName: "클라우드발전법",
        annexNo: "별표 1",
        title: "보안인증 기준(제23조 관련)",
        type: "별표",
      },
    ],
  };

  return annexMap[lawName] ?? [];
}
