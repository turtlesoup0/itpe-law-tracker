export type LawCategory = "정보보호" | "산업진흥" | "전자정부" | "계약" | "데이터";

export interface Law {
  id: string;
  lawId: string;
  mst: string;
  name: string;
  shortName: string;
  category: LawCategory;
  description: string;
  color: string;
  enforcementDate?: string;
  lastAmendedDate?: string;
}

export interface Article {
  jo: string;
  title: string;
  content: string;
  hang?: ArticleHang[];
  commentary?: string;
}

export interface ArticleHang {
  number: string;
  content: string;
  ho?: ArticleHo[];
}

export interface ArticleHo {
  number: string;
  content: string;
}

export interface Amendment {
  id: string;
  lawId: string;
  date: string;
  type: "전부개정" | "일부개정" | "제정" | "폐지" | "타법개정";
  summary: string;
  enforcementDate: string;
}

export interface ThreeTierItem {
  lawArticle: string;
  enforcementDecreeArticle?: string;
  enforcementRuleArticle?: string;
}

export interface LawTreeNode {
  id: string;
  title: string;
  type: "편" | "장" | "절" | "관" | "조";
  children?: LawTreeNode[];
}

// ---------------------------------------------------------------------------
// Server Action 반환 타입
// ---------------------------------------------------------------------------

export interface HierarchyNode {
  id: string;
  name: string;
  fullName: string;
  type: "법률" | "시행령" | "시행규칙" | "고시" | "연관법" | "기관";
  color: string;
  children: HierarchyNode[];
  /** 엣지 라벨에 표시할 관계 설명 (예: "위임", "참조", "소관") */
  relation?: string;
  /** 연관법인 경우 해당 법의 lawId (링크용) */
  lawId?: string;
}

export interface ThreeTierRow {
  lawJo: string;
  lawContent: string;
  decreeJo?: string;
  decreeContent?: string;
  ruleJo?: string;
  ruleContent?: string;
}

export interface SearchResult {
  lawName: string;
  lawId: string;
  jo: string;
  title: string;
  content: string;
  relevance: number;
}

// ---------------------------------------------------------------------------
// Phase 3: 개정 추적 + 알림
// ---------------------------------------------------------------------------

export interface CompareOldNewItem {
  articleNo: string;
  oldText: string;
  newText: string;
  changeType: "신설" | "삭제" | "변경";
  amendmentDate?: string;  // 개정일
  enforcementDate?: string; // 시행일
  amendmentReason?: string; // 제·개정이유
  summary?: string;         // 캐싱된 AI 요약 (Opus 1회 생성)
}

export interface CompareApiResponse {
  lawName: string;
  amendmentType: string;     // 일부개정, 전부개정, 제정
  amendmentDate: string;     // 공포일
  enforcementDate: string;   // 시행일
  amendmentReason: string;   // 제·개정이유 전문
  items: CompareOldNewItem[];
  changeMeta: Record<string, { tags: string[]; affectedParties: string[] }>;
}

export interface AmendmentDetail {
  id: string;
  lawId: string;
  date: string;
  type: "전부개정" | "일부개정" | "제정" | "폐지" | "타법개정";
  summary: string;
  enforcementDate: string;
  daysUntilEnforcement?: number; // 시행까지 남은 일수
  changes?: CompareOldNewItem[];
}

export interface Subscription {
  id: string;
  email: string;
  lawIds: string[];
  alertDays: number[]; // [90, 60, 30, 7]
  active: boolean;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Phase 4: AI 해설 + 고시/행정규칙 + 별표/서식 + 문서분석
// ---------------------------------------------------------------------------

export interface ArticleCommentary {
  jo: string;
  title: string;
  originalText: string;
  commentary: string; // AI 생성 쉬운 해설
  keywords: string[]; // 법률 용어 키워드
  generatedAt: string;
}

export interface LegalTerm {
  term: string;
  dailyMeaning: string; // 일상어 변환
  definition: string;
}

export interface AdminRuleArticle {
  jo: string;       // "제1조", "제2조" 등
  title: string;    // 조문 제목
  content: string;  // 조문 요약 또는 핵심 내용
}

export interface AdminRule {
  id: string;
  name: string;
  type: "훈령" | "예규" | "고시" | "공고" | "지침";
  department: string;
  relatedLawId?: string;
  summary?: string;
  url?: string;                  // 법제처 상세 링크
  proclamationDate?: string;     // 공포일 (YYYY-MM-DD)
  articles?: AdminRuleArticle[]; // 핵심 조문 요약
}

export interface AnnexItem {
  id: string;
  lawName: string;
  annexNo: string;
  title: string;
  type: "별표" | "서식";
  content?: string;
}

export interface DocumentAnalysisClause {
  clauseNo: string;
  text: string;
  riskLevel: "high" | "medium" | "low";
  issue: string;
  relatedLaw: string;
  relatedArticle: string;
}

export interface DocumentAnalysisResult {
  totalClauses: number;
  highRisk: number;
  mediumRisk: number;
  lowRisk: number;
  clauses: DocumentAnalysisClause[];
  analyzedAt: string;
}
