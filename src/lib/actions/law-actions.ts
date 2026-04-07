"use server";

import { IT_LAWS, getLawById } from "@/lib/utils/law-constants";
import { getMockArticles, getMockAmendments } from "@/lib/mcp/mock-data";
import type {
  Law,
  Article,
  Amendment,
  HierarchyNode,
  ThreeTierRow,
  SearchResult,
} from "@/types/law";

// ---------------------------------------------------------------------------
// 법령 목록 조회
// ---------------------------------------------------------------------------
export async function fetchLaws(): Promise<Law[]> {
  return IT_LAWS;
}

// ---------------------------------------------------------------------------
// 법령 상세 조회
// ---------------------------------------------------------------------------
export async function fetchLawDetail(
  lawId: string,
): Promise<{ law: Law; articles: Article[]; amendments: Amendment[] } | null> {
  const law = getLawById(lawId);
  if (!law) return null;

  const articles = getMockArticles(lawId);
  const amendments = getMockAmendments(lawId);

  return { law, articles, amendments };
}

// ---------------------------------------------------------------------------
// 법령 계층 구조 (법 -> 시행령 -> 시행규칙 -> 고시) -- mock 데이터
// ---------------------------------------------------------------------------
export async function fetchLawHierarchy(
  lawId: string,
): Promise<HierarchyNode[]> {
  const law = getLawById(lawId);
  if (!law) return [];

  return [
    {
      id: lawId,
      name: law.shortName,
      fullName: law.name,
      type: "법률" as const,
      color: "blue",
      children: [
        {
          id: `${lawId}-decree`,
          name: `${law.shortName} 시행령`,
          fullName: `${law.name} 시행령`,
          type: "시행령" as const,
          color: "emerald",
          children: [
            {
              id: `${lawId}-rule`,
              name: `${law.shortName} 시행규칙`,
              fullName: `${law.name} 시행규칙`,
              type: "시행규칙" as const,
              color: "amber",
              children: [],
            },
          ],
        },
        {
          id: `${lawId}-notice`,
          name: `${law.shortName} 관련 고시`,
          fullName: `관련 고시·지침`,
          type: "고시" as const,
          color: "purple",
          children: [],
        },
      ],
    },
  ];
}

// ---------------------------------------------------------------------------
// 3단 비교 데이터 (법률-시행령-시행규칙) -- mock
// ---------------------------------------------------------------------------
export async function fetchThreeTier(
  lawId: string,
): Promise<ThreeTierRow[]> {
  const law = getLawById(lawId);
  if (!law) return [];

  return [
    {
      lawJo: "제2조(정의)",
      lawContent: "이 법에서 사용하는 용어의 뜻은 다음과 같다.",
      decreeJo: "제2조(정의)",
      decreeContent: "법 제2조에 따른 용어의 세부 정의는 다음과 같다.",
      ruleJo: "제2조",
      ruleContent: "시행령 제2조에 따른 세부사항을 정한다.",
    },
    {
      lawJo: "제3조(적용범위)",
      lawContent: `이 법은 대한민국에서 ${law.shortName}의 적용을 받는 자에게 적용한다.`,
      decreeJo: "제3조",
      decreeContent: "법 제3조의 적용범위에 관한 세부사항.",
      ruleJo: undefined,
      ruleContent: undefined,
    },
    {
      lawJo: "제6조(인증)",
      lawContent:
        "대통령령으로 정하는 기준에 따라 인증을 받아야 한다.",
      decreeJo: "제7조(인증기준)",
      decreeContent: "법 제6조에 따른 인증의 기준은 다음과 같다.",
      ruleJo: "제3조(인증절차)",
      ruleContent: "시행령 제7조에 따른 인증 절차를 정한다.",
    },
  ];
}

// ---------------------------------------------------------------------------
// AI 자연어 검색 -- mock
// ---------------------------------------------------------------------------
export async function searchLaws(query: string): Promise<SearchResult[]> {
  const results: SearchResult[] = [];

  for (const law of IT_LAWS) {
    const articles = getMockArticles(law.id);
    for (const article of articles) {
      if (
        article.title.includes(query) ||
        article.content.includes(query) ||
        law.shortName.includes(query)
      ) {
        results.push({
          lawName: law.shortName,
          lawId: law.id,
          jo: article.jo,
          title: article.title,
          content: article.content.substring(0, 200),
          relevance: article.title.includes(query) ? 95 : 70,
        });
      }
    }
  }

  // 검색 결과가 없으면 모든 법령의 제1조를 반환
  if (results.length === 0) {
    for (const law of IT_LAWS) {
      const articles = getMockArticles(law.id);
      if (articles.length > 0) {
        results.push({
          lawName: law.shortName,
          lawId: law.id,
          jo: articles[0].jo,
          title: articles[0].title,
          content: articles[0].content.substring(0, 200),
          relevance: 50,
        });
      }
    }
  }

  return results.sort((a, b) => b.relevance - a.relevance);
}
