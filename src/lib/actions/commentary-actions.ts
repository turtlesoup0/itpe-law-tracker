"use server";

import { getMockArticles } from "@/lib/mcp/mock-data";
import { getLawById } from "@/lib/utils/law-constants";
import type { ArticleCommentary, LegalTerm } from "@/types/law";

// 조문 AI 해설 생성 (mock — 실제로는 Claude API 호출)
export async function fetchArticleCommentary(
  lawId: string,
  jo: string
): Promise<ArticleCommentary | null> {
  const law = getLawById(lawId);
  if (!law) return null;

  const articles = getMockArticles(lawId);
  const article = articles.find((a) => a.jo === jo);
  if (!article) return null;

  // Mock AI 해설 생성
  const commentaryMap: Record<string, Record<string, string>> = {
    "info-comm": {
      "제1조":
        "이 법은 인터넷과 같은 정보통신망을 안전하게 사용할 수 있도록 만드는 것이 목적입니다. 웹사이트나 앱을 운영하는 회사가 사용자의 개인정보를 잘 보호하고, 해킹이나 불법 정보 유통을 방지해야 한다는 내용을 담고 있습니다.",
      "제2조":
        "이 법에서 자주 쓰이는 핵심 용어들을 설명합니다. '정보통신망'은 인터넷, 모바일 네트워크 등 데이터를 주고받는 모든 통신 체계를 말하고, '정보통신서비스'는 이런 통신망을 이용해 정보를 제공하는 것을 말합니다.",
      "제3조":
        "인터넷 서비스를 제공하는 회사(네이버, 카카오 등)는 사용자의 개인정보를 보호하고, 건전한 인터넷 환경을 만들어야 할 의무가 있습니다. 이용자도 건전한 인터넷 사용에 책임이 있습니다.",
    },
    privacy: {
      "제1조":
        "개인정보보호법은 이름, 주민번호 등 개인을 식별할 수 있는 정보를 보호하기 위한 법입니다. 개인의 자유와 권리를 보호하면서도 개인정보를 적절히 활용할 수 있는 균형을 찾는 것이 목적입니다.",
      "제2조":
        "'개인정보'란 이름, 주민번호, 사진 등 특정 개인을 알아볼 수 있는 모든 정보입니다. '처리'란 개인정보를 수집하고, 저장하고, 사용하고, 삭제하는 등의 모든 행위를 말합니다.",
      "제3조":
        "개인정보를 다루는 사람이나 회사는 꼭 필요한 최소한의 정보만 수집해야 하며, 수집 목적을 명확히 해야 합니다. 또한 정보가 도난당하거나 유출되지 않도록 안전하게 관리해야 합니다.",
    },
  };

  const commentary =
    commentaryMap[lawId]?.[jo] ??
    `${law.shortName} ${jo}는 ${article.title}에 관한 조항입니다. 이 조문은 ${law.description}과 관련된 구체적인 내용을 규정하고 있습니다. IT 실무자 관점에서 이 조항의 적용 범위와 의무 사항을 파악하는 것이 중요합니다.`;

  return {
    jo: article.jo,
    title: article.title,
    originalText: article.content,
    commentary,
    keywords: extractKeywords(article.content),
    generatedAt: new Date().toISOString(),
  };
}

// 법률 용어 → 일상 용어 변환 (mock)
export async function fetchLegalTerms(text: string): Promise<LegalTerm[]> {
  const termMap: Record<string, { daily: string; def: string }> = {
    정보통신망: {
      daily: "인터넷/네트워크",
      def: "컴퓨터와 통신설비를 활용하여 정보를 주고받는 체계",
    },
    정보통신서비스: {
      daily: "인터넷 서비스",
      def: "통신망을 이용해 정보를 제공하거나 매개하는 것",
    },
    개인정보처리자: {
      daily: "개인정보를 다루는 회사/기관",
      def: "업무 목적으로 개인정보를 처리하는 공공기관, 법인, 단체, 개인",
    },
    정보주체: {
      daily: "개인정보의 주인(본인)",
      def: "처리되는 정보에 의하여 알아볼 수 있는 사람",
    },
    대통령령: {
      daily: "시행령(세부 규정)",
      def: "대통령이 법률의 위임을 받아 제정하는 명령",
    },
    과징금: {
      daily: "벌금(행정 제재)",
      def: "법 위반으로 얻은 경제적 이익을 환수하기 위해 부과하는 금전적 제재",
    },
    전기통신사업법: {
      daily: "통신사업 관련 법",
      def: "전기통신사업의 운영과 규제에 관한 법률",
    },
    클라우드컴퓨팅: {
      daily: "클라우드 서비스",
      def: "인터넷을 통해 IT 자원을 필요에 따라 빌려 쓰는 방식",
    },
    인공지능: {
      daily: "AI",
      def: "인간의 학습, 추론, 지각, 판단 등의 지적 능력을 구현하는 기술",
    },
    "고영향 인공지능": {
      daily: "고위험 AI",
      def: "사람의 생명·안전 및 기본권에 중대한 영향을 미치는 AI",
    },
  };

  const found: LegalTerm[] = [];
  for (const [term, info] of Object.entries(termMap)) {
    if (text.includes(term)) {
      found.push({ term, dailyMeaning: info.daily, definition: info.def });
    }
  }
  return found;
}

function extractKeywords(text: string): string[] {
  const keywords = [
    "정보통신망",
    "개인정보",
    "정보통신서비스",
    "전기통신",
    "클라우드컴퓨팅",
    "인공지능",
    "소프트웨어",
    "전자정부",
    "계약",
    "과징금",
    "대통령령",
    "정보주체",
  ];
  return keywords.filter((k) => text.includes(k));
}
