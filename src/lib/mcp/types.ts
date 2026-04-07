export interface SearchLawResult {
  lawId: string;
  mst: string;
  lawName: string;
  lawType: string;
}

export interface SearchLawResponse {
  results: SearchLawResult[];
  totalCount: number;
}

export interface LawTextArticle {
  jo: string;
  joTitle: string;
  joContent: string;
}

export interface LawTextResponse {
  lawName: string;
  articles: LawTextArticle[];
}

export interface ThreeTierRow {
  lawJo: string;
  lawContent: string;
  decreeJo?: string;
  decreeContent?: string;
  ruleJo?: string;
  ruleContent?: string;
}

export interface ThreeTierResponse {
  lawName: string;
  rows: ThreeTierRow[];
}

export interface LawTreeItem {
  id: string;
  title: string;
  type: string;
  depth: number;
  children?: LawTreeItem[];
}

export interface LawTreeResponse {
  lawName: string;
  tree: LawTreeItem[];
}

export interface ArticleDetailResponse {
  jo: string;
  title: string;
  content: string;
  hang: {
    number: string;
    content: string;
    ho: {
      number: string;
      content: string;
    }[];
  }[];
}

export interface CompareOldNewItem {
  articleNo: string;
  oldText: string;
  newText: string;
  changeType: "신설" | "삭제" | "변경";
}

export interface CompareOldNewResponse {
  lawName: string;
  items: CompareOldNewItem[];
}

export interface AiSearchResultItem {
  lawName: string;
  jo: string;
  content: string;
  relevance: number;
}

export interface AiSearchResponse {
  results: AiSearchResultItem[];
  totalCount: number;
}

export interface AdminRuleItem {
  id: string;
  name: string;
  type: string;
  department: string;
}

export interface AdminRuleSearchResponse {
  results: AdminRuleItem[];
  totalCount: number;
}
