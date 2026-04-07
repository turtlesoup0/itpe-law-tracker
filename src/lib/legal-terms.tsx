/**
 * 법률 용어 사전 + 하이라이팅 컴포넌트
 *
 * 조문 본문 내 법률 용어를 자동 감지하여 인라인 해설과 툴팁을 표시합니다.
 */

import React from "react";

// ---------------------------------------------------------------------------
// 용어 사전 — 새 용어 추가 시 여기만 수정
// ---------------------------------------------------------------------------

export const LEGAL_TERMS: Record<string, string> = {
  "정보통신망": "인터넷/네트워크",
  "정보통신서비스": "인터넷 서비스",
  "개인정보처리자": "개인정보를 다루는 회사/기관",
  "정보주체": "개인정보의 주인(본인)",
  "대통령령": "시행령(세부 규정)",
  "클라우드컴퓨팅": "클라우드 서비스",
  "행정규칙": "고시/훈령/예규 등 세부규정",
  "정보보호": "해킹·유출 방지 체계",
  "과징금": "위반 시 부과되는 금전적 제재",
  "시행령": "법률의 세부 실행 규정",
  "시행규칙": "시행령의 하위 규정",
};

// 긴 용어 우선 매칭 (e.g. "정보통신서비스" > "정보통신")
const SORTED_TERM_KEYS = Object.keys(LEGAL_TERMS).sort(
  (a, b) => b.length - a.length,
);

// ---------------------------------------------------------------------------
// highlightTerms — 텍스트 내 법률 용어를 React 노드로 변환
// ---------------------------------------------------------------------------

export function highlightTerms(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    let earliest = -1;
    let earliestTerm = "";

    for (const term of SORTED_TERM_KEYS) {
      const idx = remaining.indexOf(term);
      if (idx !== -1 && (earliest === -1 || idx < earliest)) {
        earliest = idx;
        earliestTerm = term;
      }
    }

    if (earliest === -1) {
      parts.push(remaining);
      break;
    }

    if (earliest > 0) {
      parts.push(remaining.substring(0, earliest));
    }

    const shortExplanation = LEGAL_TERMS[earliestTerm];
    parts.push(
      <span key={key++} className="relative group inline-block">
        <span
          className="underline decoration-dotted decoration-blue-400 cursor-help"
          tabIndex={0}
        >
          {earliestTerm}
          <span className="text-[10px] text-blue-500 dark:text-blue-400 no-underline ml-0.5">
            ({shortExplanation})
          </span>
        </span>
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-3 py-1.5 bg-slate-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
          <span className="font-semibold">{earliestTerm}</span>
          <span className="mx-1">—</span>
          {shortExplanation}
        </span>
      </span>,
    );

    remaining = remaining.substring(earliest + earliestTerm.length);
  }

  return <>{parts}</>;
}
