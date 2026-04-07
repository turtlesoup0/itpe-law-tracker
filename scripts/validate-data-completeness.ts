#!/usr/bin/env npx tsx
/**
 * 데이터 완전성 검증 스크립트
 * 10개 법률 JSON 파일의 조문·신구대조·3단비교 데이터를 검증하고 리포트를 출력한다.
 *
 * 사용법: npx tsx scripts/validate-data-completeness.ts
 */

import * as fs from "fs";
import * as path from "path";

const DATA_DIR = path.resolve(__dirname, "../src/lib/data");
const LAWS = [
  "info-comm", "privacy", "sw-promotion", "ai-basic", "cloud",
  "e-gov", "nat-contract", "credit-info", "public-data", "data-industry",
];

// ① ~ ⑳
const CIRCLED_NUMBERS = /[①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳]/;

interface ArticleData {
  jo: string;
  title: string;
  content: string;
  hang?: { number: string; content: string; ho?: { number: string; content: string }[] }[];
  commentary?: string;
  status?: string;
}

interface LawReport {
  lawId: string;
  articles: {
    total: number;
    active: number;            // 삭제되지 않은 조문
    withContent: number;       // content가 비어있지 않은 조문
    withHang: number;          // hang[] 배열이 있는 조문
    hangNeeded: number;        // content에 ①②③이 있는데 hang이 없는 조문 (문제)
    hangNeededList: string[];  // 해당 조문 목록
    withHo: number;            // ho[]가 하나라도 있는 조문
    withCommentary: number;    // commentary가 있는 조문
    commentaryRate: string;    // commentary 비율 (%)
  };
  compare: {
    exists: boolean;
    entries: number;           // 개정 이력 수
    totalItems: number;        // 전체 변경 항목 수
    emptyEntries: string[];    // items가 비어있는 entry
  };
  threeTier: {
    exists: boolean;
    rows: number;
  };
  score: number;               // 0~100 완전성 점수
  issues: string[];            // 발견된 문제 목록
}

function validateArticles(lawId: string): LawReport["articles"] {
  const filePath = path.join(DATA_DIR, "articles", `${lawId}.json`);
  if (!fs.existsSync(filePath)) {
    return {
      total: 0, active: 0, withContent: 0, withHang: 0,
      hangNeeded: 0, hangNeededList: [], withHo: 0,
      withCommentary: 0, commentaryRate: "0%",
    };
  }

  const articles: ArticleData[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const active = articles.filter(a => a.status !== "삭제");
  const withContent = active.filter(a => a.content && a.content.trim().length > 0);
  const withHang = active.filter(a => a.hang && a.hang.length > 0);

  // ①이 content에 있는데 hang이 없는 경우 = 분리 누락
  const hangNeededList: string[] = [];
  for (const a of active) {
    if (CIRCLED_NUMBERS.test(a.content) && (!a.hang || a.hang.length === 0)) {
      hangNeededList.push(a.jo);
    }
  }

  const withHo = active.filter(a =>
    a.hang?.some(h => h.ho && h.ho.length > 0)
  );
  const withCommentary = active.filter(a => a.commentary && a.commentary.trim().length > 0);
  const rate = active.length > 0
    ? ((withCommentary.length / active.length) * 100).toFixed(1) + "%"
    : "N/A";

  return {
    total: articles.length,
    active: active.length,
    withContent: withContent.length,
    withHang: withHang.length,
    hangNeeded: hangNeededList.length,
    hangNeededList,
    withHo: withHo.length,
    withCommentary: withCommentary.length,
    commentaryRate: rate,
  };
}

function validateCompare(lawId: string): LawReport["compare"] {
  const filePath = path.join(DATA_DIR, "compare", `${lawId}.json`);
  if (!fs.existsSync(filePath)) {
    return { exists: false, entries: 0, totalItems: 0, emptyEntries: [] };
  }

  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const entries = Object.keys(data);
  let totalItems = 0;
  const emptyEntries: string[] = [];

  for (const key of entries) {
    const entry = data[key];
    const items = entry?.items || [];
    totalItems += items.length;
    if (items.length === 0) {
      emptyEntries.push(key);
    }
  }

  return { exists: true, entries: entries.length, totalItems, emptyEntries };
}

function validateThreeTier(lawId: string): LawReport["threeTier"] {
  const filePath = path.join(DATA_DIR, "three-tier", `${lawId}.json`);
  if (!fs.existsSync(filePath)) {
    return { exists: false, rows: 0 };
  }

  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const rows = Array.isArray(data) ? data.length : 0;
  return { exists: true, rows };
}

function calculateScore(report: LawReport): number {
  let score = 0;
  const a = report.articles;
  const c = report.compare;
  const t = report.threeTier;

  // 조문 존재 (20점)
  if (a.total > 0) score += 10;
  if (a.withContent === a.active) score += 10;

  // hang 분리 완전성 (20점)
  if (a.hangNeeded === 0) score += 20;
  else score += Math.max(0, 20 - a.hangNeeded * 2);

  // commentary 커버리지 (30점)
  const commRate = a.active > 0 ? a.withCommentary / a.active : 0;
  score += Math.round(commRate * 30);

  // 신구대조 (15점)
  if (c.exists && c.entries > 0) score += 10;
  if (c.emptyEntries.length === 0) score += 5;

  // 3단비교 (15점)
  if (t.exists && t.rows > 0) score += 15;

  return Math.min(100, Math.max(0, score));
}

function collectIssues(report: LawReport): string[] {
  const issues: string[] = [];
  const a = report.articles;

  if (a.total === 0) issues.push("❌ 조문 데이터 없음");
  if (a.hangNeeded > 0) {
    issues.push(`⚠️  hang 분리 필요: ${a.hangNeededList.join(", ")} (${a.hangNeeded}건)`);
  }
  if (a.withCommentary === 0) {
    issues.push("❌ commentary 전체 누락 (0건)");
  } else if (a.active > 0 && a.withCommentary / a.active < 0.5) {
    issues.push(`⚠️  commentary 부족: ${a.withCommentary}/${a.active} (${a.commentaryRate})`);
  }
  if (!report.compare.exists) {
    issues.push("❌ 신구대조 데이터 없음");
  } else if (report.compare.emptyEntries.length > 0) {
    issues.push(`⚠️  빈 신구대조 항목: ${report.compare.emptyEntries.join(", ")}`);
  }
  if (!report.threeTier.exists) {
    issues.push("⚠️  3단비교 데이터 없음");
  } else if (report.threeTier.rows === 0) {
    issues.push("⚠️  3단비교 행 수 0");
  }

  return issues;
}

// === Main ===
console.log("╔════════════════════════════════════════════════════════╗");
console.log("║       IT Law Tracker — 데이터 완전성 검증 리포트       ║");
console.log("╚════════════════════════════════════════════════════════╝\n");

const reports: LawReport[] = [];
let totalScore = 0;

for (const lawId of LAWS) {
  const articles = validateArticles(lawId);
  const compare = validateCompare(lawId);
  const threeTier = validateThreeTier(lawId);

  const report: LawReport = {
    lawId,
    articles,
    compare,
    threeTier,
    score: 0,
    issues: [],
  };
  report.score = calculateScore(report);
  report.issues = collectIssues(report);
  reports.push(report);
  totalScore += report.score;
}

// 요약 테이블
console.log("┌──────────────────┬───────┬──────────┬──────────┬──────────┬───────────┬───────┐");
console.log("│ 법률             │ 점수  │ 조문(활) │ hang분리 │ comment  │ 신구대조  │ 3단비 │");
console.log("├──────────────────┼───────┼──────────┼──────────┼──────────┼───────────┼───────┤");

for (const r of reports) {
  const scoreIcon = r.score >= 80 ? "🟢" : r.score >= 50 ? "🟡" : "🔴";
  const hangOk = r.articles.hangNeeded === 0 ? "✅" : `❌(${r.articles.hangNeeded})`;
  const commStr = `${r.articles.withCommentary}/${r.articles.active}`;
  const compareStr = r.compare.exists ? `${r.compare.entries}건/${r.compare.totalItems}항` : "없음";
  const tierStr = r.threeTier.exists ? `${r.threeTier.rows}행` : "없음";

  console.log(
    `│ ${r.lawId.padEnd(16)} │ ${scoreIcon}${String(r.score).padStart(3)} │ ${String(r.articles.active).padStart(8)} │ ${hangOk.padEnd(8)} │ ${commStr.padStart(8)} │ ${compareStr.padStart(9)} │ ${tierStr.padStart(5)} │`
  );
}

console.log("└──────────────────┴───────┴──────────┴──────────┴──────────┴───────────┴───────┘");
console.log(`\n📊 전체 평균 점수: ${(totalScore / LAWS.length).toFixed(1)}/100\n`);

// 상세 이슈
const allIssues = reports.filter(r => r.issues.length > 0);
if (allIssues.length > 0) {
  console.log("═══ 발견된 이슈 ═══\n");
  for (const r of allIssues) {
    console.log(`📋 ${r.lawId} (점수: ${r.score}):`);
    for (const issue of r.issues) {
      console.log(`   ${issue}`);
    }
    console.log();
  }
}

// 우선순위 작업 목록
console.log("═══ 우선순위 작업 ═══\n");
const noCommentary = reports.filter(r => r.articles.withCommentary === 0 && r.articles.active > 0);
const lowCommentary = reports.filter(r => r.articles.withCommentary > 0 && r.articles.active > 0 && r.articles.withCommentary / r.articles.active < 0.5);
const hangNeeded = reports.filter(r => r.articles.hangNeeded > 0);
const noThreeTier = reports.filter(r => !r.threeTier.exists || r.threeTier.rows === 0);

if (noCommentary.length > 0) {
  console.log(`🔴 P0: commentary 전체 누락 (${noCommentary.length}개 법률)`);
  for (const r of noCommentary) {
    console.log(`   → ${r.lawId}: ${r.articles.active}개 조문에 commentary 필요`);
  }
}
if (hangNeeded.length > 0) {
  console.log(`\n🟡 P1: hang 분리 누락 (${hangNeeded.length}개 법률)`);
  for (const r of hangNeeded) {
    console.log(`   → ${r.lawId}: ${r.articles.hangNeededList.join(", ")}`);
  }
}
if (lowCommentary.length > 0) {
  console.log(`\n🟡 P2: commentary 부족 (${lowCommentary.length}개 법률)`);
  for (const r of lowCommentary) {
    console.log(`   → ${r.lawId}: ${r.articles.commentaryRate}`);
  }
}
if (noThreeTier.length > 0) {
  console.log(`\n🟡 P3: 3단비교 미수집 (${noThreeTier.length}개 법률)`);
  for (const r of noThreeTier) {
    console.log(`   → ${r.lawId}`);
  }
}

console.log("\n✅ 검증 완료");
