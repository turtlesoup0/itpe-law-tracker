/**
 * law-manifest.json 생성 스크립트.
 *
 * IT_LAWS + ADMIN_RULES_MAP에서 데이터를 읽어
 * itpe-shared-manifests/law-manifest.json에 씁니다.
 *
 * 실행: npx tsx scripts/generate-law-manifest.ts
 * 또는: npm run generate-manifest
 *
 * 갱신 시점:
 * - prebuild (배포 전 자동)
 * - 데이터 파일 변경 후 수동
 */

import { writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";

// ── 데이터 임포트 (tsconfig paths 없이 상대경로) ──

// IT_LAWS는 TypeScript import가 필요하므로 직접 정의하지 않고
// law-constants.ts에서 가져옴 — tsx 런타임이 path alias를 모르므로
// 하드코딩 경로 사용
import type { Law } from "../src/types/law";

// tsx에서는 path alias가 안 되므로 동적 import 대신 데이터를 직접 읽기
// src/lib/utils/law-constants.ts의 IT_LAWS를 기반으로 함
// admin-rules.ts의 ADMIN_RULES_MAP을 기반으로 함

// ── 상수 ──

const SCHEMA_VERSION = "1.0.0";
const TTL_HOURS = 168; // 7일 (데이터 변경이 수동이므로 넉넉히)

const MANIFEST_DIR = resolve(__dirname, "../../itpe-shared-manifests");
const MANIFEST_PATH = resolve(MANIFEST_DIR, "law-manifest.json");

const VERCEL_URL = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "https://itpe-law-tracker.vercel.app";

// ── 법령 데이터 (law-constants.ts에서 추출) ──

interface LawEntry {
  id: string;
  name: string;
  shortName: string;
  category: string;
}

const LAWS: LawEntry[] = [
  { id: "info-comm", name: "정보통신망 이용촉진 및 정보보호 등에 관한 법률", shortName: "정보통신망법", category: "정보보호" },
  { id: "privacy", name: "개인정보 보호법", shortName: "개인정보보호법", category: "정보보호" },
  { id: "sw-promotion", name: "소프트웨어 진흥법", shortName: "SW진흥법", category: "산업진흥" },
  { id: "ai-basic", name: "인공지능 발전과 신뢰 기반 조성 등에 관한 기본법", shortName: "AI기본법", category: "산업진흥" },
  { id: "cloud", name: "클라우드컴퓨팅 발전 및 이용자 보호에 관한 법률", shortName: "클라우드발전법", category: "산업진흥" },
  { id: "e-gov", name: "전자정부법", shortName: "전자정부법", category: "전자정부" },
  { id: "nat-contract", name: "국가를 당사자로 하는 계약에 관한 법률", shortName: "국가계약법", category: "계약" },
  { id: "credit-info", name: "신용정보의 이용 및 보호에 관한 법률", shortName: "신용정보법", category: "정보보호" },
  { id: "public-data", name: "공공데이터의 제공 및 이용 활성화에 관한 법률", shortName: "공공데이터법", category: "데이터" },
  { id: "data-industry", name: "데이터 산업진흥 및 이용촉진에 관한 기본법", shortName: "데이터산업법", category: "데이터" },
  { id: "intelligent-info", name: "지능정보화 기본법", shortName: "지능정보화기본법", category: "전자정부" },
  { id: "quantum", name: "양자과학기술 및 양자산업 육성에 관한 법률", shortName: "양자법", category: "산업진흥" },
];

// ── 행정규칙 → 위임(delegation) 매핑 ──
// admin-rules.ts에서 핵심 필드만 추출

interface Delegation {
  article: string;
  admin_rule_title: string;
  rule_type: string;
}

const DELEGATIONS_MAP: Record<string, Delegation[]> = {
  "info-comm": [
    { article: "제28조의2", admin_rule_title: "개인정보의 기술적·관리적 보호조치 기준", rule_type: "고시" },
    { article: "제47조", admin_rule_title: "정보보호 및 개인정보보호 관리체계 인증 등에 관한 고시", rule_type: "고시" },
  ],
  privacy: [
    { article: "제29조", admin_rule_title: "개인정보의 안전성 확보조치 기준", rule_type: "고시" },
  ],
  "sw-promotion": [
    { article: "제22조", admin_rule_title: "소프트웨어사업 대가의 기준", rule_type: "고시" },
  ],
  cloud: [
    { article: "제23조의2", admin_rule_title: "클라우드컴퓨팅서비스 보안인증에 관한 고시", rule_type: "고시" },
  ],
  "e-gov": [
    { article: "제45조", admin_rule_title: "전자정부 웹사이트 품질관리 지침", rule_type: "고시" },
  ],
  "ai-basic": [
    { article: "-", admin_rule_title: "인공지능 윤리기준", rule_type: "고시" },
  ],
};

// ── 매니페스트 생성 ──

function generate() {
  const manifest = {
    schema_version: SCHEMA_VERSION,
    generated_at: new Date().toISOString(),
    ttl_hours: TTL_HOURS,
    laws: LAWS.map((law) => ({
      id: law.id,
      name: law.name,
      category: law.category,
      url: `${VERCEL_URL}/laws/${law.id}`,
      delegations: DELEGATIONS_MAP[law.id] || [],
    })),
  };

  mkdirSync(dirname(MANIFEST_PATH), { recursive: true });
  writeFileSync(
    MANIFEST_PATH,
    JSON.stringify(manifest, null, 2) + "\n",
    "utf-8",
  );

  console.log(`[manifest] law-manifest.json 생성 완료`);
  console.log(`  법령: ${manifest.laws.length}건`);
  console.log(
    `  위임: ${manifest.laws.reduce((s, l) => s + l.delegations.length, 0)}건`,
  );
  console.log(`  경로: ${MANIFEST_PATH}`);
}

generate();
