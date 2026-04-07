"use client";

import { useState } from "react";
import type { AdminRule } from "@/types/law";

const rulesMap: Record<string, AdminRule[]> = {
  "info-comm": [
    {
      id: "r1",
      name: "개인정보의 기술적·관리적 보호조치 기준",
      type: "고시",
      department: "개인정보보호위원회",
      summary: "정보통신서비스 제공자의 개인정보 기술적·관리적 보호조치 세부 기준",
      url: "https://www.law.go.kr/admRulLsInfoP.do?admRulSeq=2100000204678",
      proclamationDate: "2021-09-15",
    },
    {
      id: "r2",
      name: "정보보호 및 개인정보보호 관리체계 인증 등에 관한 고시",
      type: "고시",
      department: "과학기술정보통신부, 개인정보보호위원회",
      summary: "ISMS-P 인증 기준·심사 절차·인증기관 지정 기준",
      url: "https://www.law.go.kr/admRulLsInfoP.do?admRulSeq=2100000244750",
      proclamationDate: "2024-07-24",
    },
  ],
  privacy: [
    {
      id: "r3",
      name: "개인정보의 안전성 확보조치 기준",
      type: "고시",
      department: "개인정보보호위원회",
      summary: "개인정보처리자의 기술적·관리적·물리적 안전성 확보 조치 기준",
      url: "https://www.law.go.kr/admRulLsInfoP.do?admRulSeq=2100000265956",
      proclamationDate: "2025-10-31",
    },
  ],
  "sw-promotion": [
    {
      id: "r4",
      name: "소프트웨어사업 대가의 기준",
      type: "고시",
      department: "과학기술정보통신부",
      summary: "SW 개발·유지보수·재개발 사업의 대가 산정 방법",
      url: "https://www.law.go.kr/admRulInfoP.do?admRulSeq=2000000050947",
      proclamationDate: "2010-02-26",
    },
  ],
  cloud: [
    {
      id: "r5",
      name: "클라우드컴퓨팅서비스 보안인증에 관한 고시",
      type: "고시",
      department: "과학기술정보통신부",
      summary: "CSAP(클라우드 보안인증) 등급·심사 절차·유효기간",
      url: "https://www.law.go.kr/admRulLsInfoP.do?admRulSeq=2100000218804",
      proclamationDate: "2023-01-31",
    },
  ],
  "e-gov": [
    {
      id: "r6",
      name: "전자정부 웹사이트 품질관리 지침",
      type: "고시",
      department: "행정안전부",
      summary: "정부·공공기관 웹사이트의 호환성·접근성·개인정보보호 품질 기준",
      url: "https://www.law.go.kr/admRulLsInfoP.do?admRulSeq=2100000260906",
      proclamationDate: "2025-06-25",
    },
  ],
  "ai-basic": [
    {
      id: "r7",
      name: "인공지능 윤리기준",
      type: "고시",
      department: "과학기술정보통신부",
      summary: "AI 개발·활용 시 준수해야 할 3대 기본원칙 및 10대 핵심요건",
      url: "https://www.msit.go.kr/bbs/view.do?sCode=user&mId=113&mPid=112&bbsSeqNo=94&nttSeqNo=3179742",
      proclamationDate: "2021-05-14",
    },
  ],
  "credit-info": [
    {
      id: "r8",
      name: "신용정보업감독규정",
      type: "고시",
      department: "금융위원회",
      summary: "신용조회업·신용평가업·본인신용정보관리업(마이데이터) 허가·감독 기준",
      url: "https://www.law.go.kr/admRulLsInfoP.do?admRulSeq=2100000254238",
      proclamationDate: "2025-02-05",
    },
  ],
  "nat-contract": [
    {
      id: "r9",
      name: "행정기관 및 공공기관 정보시스템 구축·운영 지침",
      type: "고시",
      department: "행정안전부",
      summary: "공공 정보시스템 구축·운영 사업의 관리·감리·하도급 기준",
      url: "https://www.law.go.kr/admRulLsInfoP.do?admRulSeq=2100000252582",
      proclamationDate: "2025-01-02",
    },
  ],
  "public-data": [
    {
      id: "r10",
      name: "국가데이터처 공공데이터 관리 지침",
      type: "예규",
      department: "국가데이터처",
      summary: "공공데이터 목록 등록·개방 절차·품질 관리 기준",
      url: "https://www.law.go.kr/admRulLsInfoP.do?admRulSeq=2100000272012",
      proclamationDate: "2025-12-05",
    },
  ],
  "data-industry": [
    {
      id: "r11",
      name: "가명정보의 결합 및 반출 등에 관한 고시",
      type: "고시",
      department: "개인정보보호위원회",
      summary: "가명정보 결합 전문기관 지정·결합 절차·반출 심사 기준",
      url: "https://www.law.go.kr/admRulLsInfoP.do?admRulSeq=2100000263732",
      proclamationDate: "2025-09-09",
    },
  ],
};

const typeColors: Record<string, string> = {
  "고시": "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  "예규": "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  "훈령": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  "지침": "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
};

export function AdminRuleList({ lawId, lawShortName }: { lawId: string; lawShortName: string }) {
  const rules = rulesMap[lawId] ?? [];
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (rules.length === 0) {
    return <p className="text-slate-500 dark:text-slate-400 text-center py-4">이 법령의 관련 고시/행정규칙이 아직 등록되지 않았습니다.</p>;
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{lawShortName} 관련 고시 · 행정규칙 {rules.length}건</p>
      {rules.map((rule) => {
        const isExpanded = expandedId === rule.id;
        return (
          <div key={rule.id} className="border rounded-lg overflow-hidden">
            <button
              className="w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              onClick={() => setExpandedId(isExpanded ? null : rule.id)}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs px-2 py-0.5 rounded-full ${typeColors[rule.type] ?? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"}`}>
                  {rule.type}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{rule.department}</span>
                {rule.proclamationDate && (
                  <span className="text-xs text-slate-400 dark:text-slate-500">{rule.proclamationDate}</span>
                )}
                <span className="ml-auto text-xs text-slate-400">{isExpanded ? "▲" : "▼"}</span>
              </div>
              <p className="font-medium text-sm text-slate-900 dark:text-slate-100">{rule.name}</p>
              {rule.summary && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{rule.summary}</p>}
            </button>

            {isExpanded && (
              <div className="border-t px-4 pb-4 pt-3 bg-slate-50/50 dark:bg-slate-800/50">
                {rule.articles && rule.articles.length > 0 && (
                  <div className="space-y-3 mb-3">
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-300">핵심 조문 요약</p>
                    {rule.articles.map((art) => (
                      <div key={art.jo} className="pl-3 border-l-2 border-blue-300 dark:border-blue-700">
                        <p className="text-xs font-medium text-blue-700 dark:text-blue-300">{art.jo} {art.title}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{art.content}</p>
                      </div>
                    ))}
                  </div>
                )}
                {rule.url && (
                  <a
                    href={rule.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    법제처에서 전문 보기 →
                  </a>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
