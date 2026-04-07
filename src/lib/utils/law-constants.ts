import { Law, LawCategory } from "@/types/law";

export const IT_LAWS: Law[] = [
  {
    id: "info-comm",
    lawId: "000030",
    mst: "277377",
    name: "정보통신망 이용촉진 및 정보보호 등에 관한 법률",
    shortName: "정보통신망법",
    category: "정보보호",
    description: "정보통신망의 이용 촉진과 정보통신서비스 제공자의 정보보호 의무를 규정",
    color: "blue",
  },
  {
    id: "privacy",
    lawId: "011357",
    mst: "270351",
    name: "개인정보 보호법",
    shortName: "개인정보보호법",
    category: "정보보호",
    description: "개인정보의 수집·이용·제공 및 보호에 관한 기본 사항을 규정",
    color: "blue",
  },
  {
    id: "sw-promotion",
    lawId: "000751",
    mst: "265845",
    name: "소프트웨어 진흥법",
    shortName: "SW진흥법",
    category: "산업진흥",
    description: "소프트웨어산업의 기반 조성과 경쟁력 강화에 관한 사항",
    color: "emerald",
  },
  {
    id: "ai-basic",
    lawId: "014820",
    mst: "282791",
    name: "인공지능 발전과 신뢰 기반 조성 등에 관한 기본법",
    shortName: "AI기본법",
    category: "산업진흥",
    description: "인공지능 기술의 개발·활용 촉진 및 신뢰 기반 조성",
    color: "emerald",
  },
  {
    id: "cloud",
    lawId: "012266",
    mst: "277387",
    name: "클라우드컴퓨팅 발전 및 이용자 보호에 관한 법률",
    shortName: "클라우드발전법",
    category: "산업진흥",
    description: "클라우드컴퓨팅의 발전과 이용자 보호에 관한 기본 사항",
    color: "emerald",
  },
  {
    id: "e-gov",
    lawId: "009199",
    mst: "268103",
    name: "전자정부법",
    shortName: "전자정부법",
    category: "전자정부",
    description: "행정업무의 전자적 처리를 위한 기본 원칙과 절차",
    color: "amber",
  },
  {
    id: "nat-contract",
    lawId: "000695",
    mst: "277151",
    name: "국가를 당사자로 하는 계약에 관한 법률",
    shortName: "국가계약법",
    category: "계약",
    description: "국가 조달·계약의 기본 원칙, 입찰 및 계약 절차",
    color: "purple",
  },
  {
    id: "credit-info",
    lawId: "001540",
    mst: "260423",
    name: "신용정보의 이용 및 보호에 관한 법률",
    shortName: "신용정보법",
    category: "정보보호",
    description: "개인신용정보의 수집·이용·보호 및 마이데이터 사업에 관한 사항",
    color: "blue",
  },
  {
    id: "public-data",
    lawId: "011895",
    mst: "251023",
    name: "공공데이터의 제공 및 이용 활성화에 관한 법률",
    shortName: "공공데이터법",
    category: "데이터",
    description: "공공데이터의 제공·이용 촉진 및 품질 관리에 관한 기본 사항",
    color: "cyan",
  },
  {
    id: "data-industry",
    lawId: "014168",
    mst: "277325",
    name: "데이터 산업진흥 및 이용촉진에 관한 기본법",
    shortName: "데이터산업법",
    category: "데이터",
    description: "데이터의 생산·거래·활용 촉진 및 데이터산업 발전에 관한 기본 사항",
    color: "cyan",
  },
];

export function getLawById(id: string): Law | undefined {
  return IT_LAWS.find((law) => law.id === id);
}

export function getLawsByCategory(category: LawCategory): Law[] {
  return IT_LAWS.filter((law) => law.category === category);
}

export const CATEGORIES: { label: string; value: LawCategory; color: string }[] = [
  { label: "정보보호", value: "정보보호", color: "blue" },
  { label: "산업진흥", value: "산업진흥", color: "emerald" },
  { label: "전자정부", value: "전자정부", color: "amber" },
  { label: "계약", value: "계약", color: "purple" },
  { label: "데이터", value: "데이터", color: "cyan" },
];
