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
      summary: "정보통신서비스 제공자가 이용자의 개인정보를 취급함에 있어 기술적·관리적 보호조치의 세부 기준",
      url: "https://www.law.go.kr/admRulLsInfoP.do?admRulSeq=2100000265957",
      proclamationDate: "2024-09-12",
      articles: [
        { jo: "제3조", title: "내부관리계획의 수립·시행", content: "개인정보 보호책임자 지정, 내부관리계획 수립 및 시행, 정기적 자체 감사(반기 1회 이상)" },
        { jo: "제4조", title: "접근통제", content: "개인정보처리시스템에 대한 접근권한 차등 부여, 5회 이상 인증실패 시 접근 제한, 외부에서 접속 시 VPN 등 안전한 접속수단 적용" },
        { jo: "제5조", title: "접속기록의 보관 및 점검", content: "접속기록 1년 이상 보관(5만명 이상: 2년), 월 1회 이상 점검, 위·변조 방지 조치" },
        { jo: "제6조", title: "개인정보의 암호화", content: "비밀번호 일방향 암호화, 주민등록번호·바이오정보 등 고유식별정보 암호화 저장, 정보통신망 전송 시 SSL/TLS 적용" },
        { jo: "제7조", title: "악성프로그램 등 방지", content: "백신 소프트웨어 설치·운영, 자동 업데이트 또는 일 1회 이상 업데이트, 월 1회 이상 점검" },
        { jo: "제8조", title: "물리적 접근 방지", content: "전산실·자료보관실 등 출입통제 절차 수립·운영, 개인정보가 포함된 보조저장매체 반출·입 통제" },
      ],
    },
    {
      id: "r2",
      name: "정보보호 및 개인정보보호 관리체계 인증 등에 관한 고시",
      type: "고시",
      department: "과학기술정보통신부, 개인정보보호위원회",
      summary: "ISMS-P 인증 기준, 인증심사 절차, 인증기관·심사기관 지정 기준 등",
      url: "https://www.law.go.kr/admRulLsInfoP.do?admRulSeq=2100000244750",
      proclamationDate: "2024-07-24",
      articles: [
        { jo: "제4조", title: "인증기준", content: "관리체계 수립·운영(16개 항목), 보호대책 요구사항(64개 항목), 개인정보 처리단계별 요구사항(22개 항목) — 총 102개 인증기준" },
        { jo: "제8조", title: "인증 유효기간 및 사후관리", content: "인증 유효기간 3년, 매년 사후심사 실시, 중대한 변경 시 사후심사 조기 실시" },
        { jo: "제12조", title: "인증심사원 자격 요건", content: "정보보호·개인정보보호 분야 경력 7년 이상(석사 5년, 박사 3년), 인증심사원 자격시험 합격" },
        { jo: "제15조", title: "인증심사 수수료", content: "인증심사원 투입 인원수×일수 기반 산정, 최초 심사·갱신 심사·사후 심사별 차등 적용" },
      ],
    },
  ],
  privacy: [
    {
      id: "r3",
      name: "개인정보의 안전성 확보조치 기준",
      type: "고시",
      department: "개인정보보호위원회",
      summary: "개인정보처리자가 안전성 확보를 위해 이행해야 할 기술적·관리적·물리적 조치 기준",
      url: "https://www.law.go.kr/admRulLsInfoP.do?admRulSeq=2100000265956",
      proclamationDate: "2025-10-31",
      articles: [
        { jo: "제4조", title: "접근 권한의 관리", content: "개인정보처리시스템 접근 권한을 업무 수행에 필요한 최소한으로 차등 부여, 인사이동 시 지체 없이 변경·말소" },
        { jo: "제5조", title: "접근통제", content: "권한 없는 접근 방지를 위한 IP 제한, VPN 등 조치. 5회 이상 인증실패 시 접근 제한" },
        { jo: "제7조", title: "개인정보의 암호화", content: "고유식별정보·비밀번호·바이오정보 암호화 저장, 정보통신망 전송 시 암호화 필수" },
        { jo: "제8조", title: "접속기록의 보관 및 점검", content: "최소 1년 이상 보관(5만명 이상 처리: 2년), 월 1회 이상 점검" },
      ],
    },
  ],
  "sw-promotion": [
    {
      id: "r4",
      name: "소프트웨어사업 대가의 기준",
      type: "고시",
      department: "과학기술정보통신부",
      summary: "SW 개발·유지보수·재개발 사업의 대가 산정 방법 (기능점수, 투입공수 등)",
      url: "https://www.law.go.kr/admRulLsInfoP.do?admRulSeq=2100000263389",
      proclamationDate: "2025-09-23",
      articles: [
        { jo: "제5조", title: "소프트웨어 개발비", content: "기능점수(FP) 방식: 개발원가 = 기능점수 × 기능점수당 단가 × 보정계수. 투입공수 방식: 개발원가 = 투입 M/M × 노임단가 × 보정계수" },
        { jo: "제11조", title: "소프트웨어 유지관리비", content: "유지관리비 = 연간 유지관리비율 × 해당 SW 개발비. 기본요율 18%, 성격에 따라 차등" },
        { jo: "제18조", title: "재개발비", content: "재개발비 = 개발비 산정방식 적용. 기존 기능 재활용 시 감액 가능" },
      ],
    },
  ],
  cloud: [
    {
      id: "r5",
      name: "클라우드컴퓨팅서비스 보안인증에 관한 고시",
      type: "고시",
      department: "과학기술정보통신부",
      summary: "CSAP(클라우드 보안인증) 등급 기준, 인증심사 절차, 인증 유효기간 등",
      url: "https://www.law.go.kr/admRulLsInfoP.do?admRulSeq=2100000218804",
      proclamationDate: "2023-01-31",
      articles: [
        { jo: "제5조", title: "인증 등급", content: "상(공공기관 중요 정보), 중(일반 공공 업무), 하(비민감 업무) 3등급 분류" },
        { jo: "제7조", title: "보안인증 기준", content: "관리적 보호조치(14개), 물리적 보호조치(6개), 기술적 보호조치(58개), 공공기관 추가(8개) 등 총 86개 항목" },
        { jo: "제10조", title: "인증 유효기간", content: "유효기간 5년, 매년 사후평가 실시. 중대 보안사고 발생 시 인증 취소 가능" },
      ],
    },
  ],
  "e-gov": [
    {
      id: "r6",
      name: "전자정부 웹사이트 품질관리 지침",
      type: "고시",
      department: "행정안전부",
      summary: "정부·공공기관 웹사이트의 웹 호환성, 접근성, 개인정보보호 등 품질 기준",
      url: "https://www.law.go.kr/admRulLsInfoP.do?admRulSeq=2100000260906",
      proclamationDate: "2025-06-25",
      articles: [
        { jo: "제6조", title: "웹 호환성", content: "한국형 웹 콘텐츠 접근성 지침(KWCAG) 2.2 준수, 다양한 브라우저·운영체제 환경 지원" },
        { jo: "제7조", title: "웹 접근성", content: "장애인·고령자 등 정보 취약계층의 이용 편의 보장, 웹 접근성 품질인증 마크 획득 권장" },
        { jo: "제10조", title: "개인정보보호", content: "개인정보 수집·이용 동의 절차, 개인정보처리방침 공개, SSL 인증서 적용 필수" },
      ],
    },
  ],
  "ai-basic": [
    {
      id: "r7",
      name: "인공지능 윤리기준",
      type: "고시",
      department: "과학기술정보통신부",
      summary: "AI 개발·활용 시 준수해야 할 10대 윤리 원칙 — 인간성, 투명성, 책임성 등",
      url: "https://www.law.go.kr/admRulLsInfoP.do?admRulSeq=2100000207580",
      proclamationDate: "2021-05-14",
      articles: [
        { jo: "3대 기본원칙", title: "인간 존엄성, 사회 공공선, 기술 합목적성", content: "AI는 인간의 존엄성을 보장하고, 사회의 공공선에 기여하며, 목적에 맞는 기술로 활용되어야 한다" },
        { jo: "10대 핵심요건", title: "인권보장, 프라이버시, 다양성, 침해금지, 공공성, 연대성, 데이터관리, 책임성, 안전성, 투명성", content: "개발자·공급자·이용자가 각 역할에 따라 10개 핵심요건을 이행해야 한다" },
      ],
    },
  ],
  "credit-info": [
    {
      id: "r8",
      name: "신용정보업감독규정",
      type: "고시",
      department: "금융위원회",
      summary: "신용조회업, 신용평가업, 본인신용정보관리업(마이데이터)의 허가·감독 기준",
      url: "https://www.law.go.kr/admRulLsInfoP.do?admRulSeq=2100000258832",
      proclamationDate: "2025-06-30",
      articles: [
        { jo: "제16조의7", title: "본인신용정보관리업 허가 기준", content: "자본금 5억원 이상, 정보보호위원회 설치, 전담인력 10명 이상, 정보보호 관리체계 수립" },
        { jo: "제34조", title: "개인신용정보 전송요구권", content: "정보주체가 보유 금융기관에 개인신용정보를 마이데이터 사업자에게 전송하도록 요구할 수 있는 권리" },
      ],
    },
  ],
  "nat-contract": [
    {
      id: "r9",
      name: "정보시스템 구축·운영 지침",
      type: "고시",
      department: "행정안전부",
      summary: "공공 정보시스템 구축·운영 사업의 관리 기준 — 사업관리, 감리, 하도급 관리 등",
      url: "https://www.law.go.kr/admRulLsInfoP.do?admRulSeq=2100000241700",
      proclamationDate: "2024-03-29",
      articles: [
        { jo: "제14조", title: "제안서 평가 기준", content: "기술능력(60점 이상), 가격(배점 한도 내 자동 산출), 발표평가 포함 여부는 발주기관 결정" },
        { jo: "제30조", title: "하도급 관리", content: "핵심 사업 부분의 하도급 제한, 하도급 대금 30일 이내 지급, 하도급 비율 50% 초과 금지" },
      ],
    },
  ],
  "public-data": [
    {
      id: "r10",
      name: "공공데이터 제공 및 이용 활성화에 관한 지침",
      type: "고시",
      department: "행정안전부",
      summary: "공공데이터 목록 등록, 개방 절차, 이용 불편 신고 및 분쟁조정 절차",
      url: "https://www.law.go.kr/admRulLsInfoP.do?admRulSeq=2100000222704",
      proclamationDate: "2023-01-06",
      articles: [
        { jo: "제10조", title: "공공데이터 제공 형태", content: "파일 데이터, Open API, 표준데이터 형태로 제공. 기계판독 가능한 형태(CSV, JSON, XML) 우선" },
        { jo: "제15조", title: "제공 거부의 사유", content: "국가안보, 개인정보, 지식재산권 침해 등 법령상 비공개 사유에 해당하는 경우에만 제한" },
      ],
    },
  ],
  "data-industry": [
    {
      id: "r11",
      name: "데이터 결합 및 반출에 관한 고시",
      type: "고시",
      department: "개인정보보호위원회",
      summary: "가명정보 결합 전문기관 지정, 결합 절차, 반출 심사 기준",
      url: "https://www.law.go.kr/admRulLsInfoP.do?admRulSeq=2100000220668",
      proclamationDate: "2022-11-17",
      articles: [
        { jo: "제4조", title: "결합 전문기관 지정", content: "데이터 결합 전문기관은 물리적·기술적 보호조치를 갖추고 개인정보보호위원회에서 지정" },
        { jo: "제8조", title: "결합 절차", content: "결합 신청 → 결합키 생성 → 데이터 결합 수행 → 반출 심사 → 가명처리 적정성 검토 후 반출" },
        { jo: "제10조", title: "반출 심사", content: "재식별 위험성 평가(k-익명성 등), 이용 목적 적합성 심사. 부적합 시 추가 가명처리 요구" },
      ],
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
