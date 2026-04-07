/**
 * 행정규칙(고시/훈령/예규) 데이터
 * 10개 법률별 관련 행정규칙 매핑
 */

import type { AdminRule } from "@/types/law";

export const ADMIN_RULES_MAP: Record<string, AdminRule[]> = {
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
