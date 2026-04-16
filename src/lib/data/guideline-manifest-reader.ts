/**
 * guideline-manifest.json 읽기 + 위임 고시 ↔ 가이드라인 매칭.
 *
 * itpe-shared-manifests/guideline-manifest.json을 빌드 타임에 읽어서
 * 법령별로 관련 가이드라인을 매칭합니다.
 *
 * 런타임 의존성: 없음 (파일이 없으면 빈 배열 반환)
 */

import { readFileSync } from "fs";
import { resolve } from "path";
import { ADMIN_RULES_MAP } from "./admin-rules";

// ── 타입 ──

export interface MatchedGuideline {
  id: number;
  title: string;
  category: string;
  agencyCode: string;
  agencyName: string;
  latestPublishedDate: string | null;
  /** 가이드라인 트래커 URL */
  url: string;
  /** 매칭 근거 (위임 고시 제목) */
  matchedBy: string;
}

interface GuidelineManifest {
  schema_version: string;
  generated_at: string;
  ttl_hours: number;
  legal_bases: {
    id: number;
    title: string;
    basis_type: string;
    agency_code: string;
    agency_name: string;
    parent_law_name: string | null;
    url: string;
  }[];
  guidelines: {
    id: number;
    title: string;
    category: string;
    agency_code: string;
    agency_name: string;
    latest_published_date: string | null;
    url: string;
  }[];
}

// ── 매니페스트 로드 (빌드 타임, 실패 시 null) ──

const MANIFEST_PATH = resolve(
  process.cwd(),
  "../itpe-shared-manifests/guideline-manifest.json",
);

let _cached: GuidelineManifest | null | undefined;

function loadManifest(): GuidelineManifest | null {
  if (_cached !== undefined) return _cached;
  try {
    const raw = readFileSync(MANIFEST_PATH, "utf-8");
    _cached = JSON.parse(raw) as GuidelineManifest;
    return _cached;
  } catch {
    _cached = null;
    return null;
  }
}

export function getManifestMeta(): { generatedAt: string; stale: boolean } | null {
  const m = loadManifest();
  if (!m) return null;
  const age = (Date.now() - new Date(m.generated_at).getTime()) / 3600_000;
  return {
    generatedAt: m.generated_at,
    stale: age > m.ttl_hours,
  };
}

// ── 매칭 로직 ──

/**
 * 법령 ID로 관련 가이드라인(실무 문서)을 찾습니다.
 *
 * 매칭 전략:
 * 1. admin-rules.ts의 고시 제목에서 핵심 키워드 추출
 * 2. guideline-manifest의 guidelines에서 키워드 포함 여부로 매칭
 * 3. 중복 제거 후 반환
 */
export function getRelatedGuidelines(lawId: string): MatchedGuideline[] {
  const manifest = loadManifest();
  if (!manifest) return [];

  const adminRules = ADMIN_RULES_MAP[lawId] ?? [];
  if (adminRules.length === 0) return [];

  const matched: MatchedGuideline[] = [];
  const seenIds = new Set<number>();

  for (const rule of adminRules) {
    // 고시 제목에서 매칭 키워드 생성 (여러 전략)
    const keywords = generateMatchKeywords(rule.name);

    for (const g of manifest.guidelines) {
      if (seenIds.has(g.id)) continue;

      for (const kw of keywords) {
        if (g.title.includes(kw)) {
          seenIds.add(g.id);
          matched.push({
            id: g.id,
            title: g.title,
            category: g.category,
            agencyCode: g.agency_code,
            agencyName: g.agency_name,
            latestPublishedDate: g.latest_published_date,
            url: g.url,
            matchedBy: rule.name,
          });
          break;
        }
      }
    }
  }

  return matched;
}

/**
 * 고시 제목에서 매칭용 키워드를 생성합니다.
 *
 * 예: "개인정보의 안전성 확보조치 기준"
 *   → ["안전성 확보조치", "안전성 확보", "확보조치 기준"]
 *
 * 예: "정보보호 및 개인정보보호 관리체계 인증 등에 관한 고시"
 *   → ["관리체계 인증", "ISMS"]
 */
function generateMatchKeywords(title: string): string[] {
  const keywords: string[] = [];

  // 원문 핵심부 (조사/접미사 제거)
  const core = title
    .replace(/\s*등에\s*관한\s*고시$/g, "")
    .replace(/\s*에\s*관한\s*고시$/g, "")
    .replace(/\s*기준$/g, "")
    .replace(/\s*지침$/g, "")
    .trim();

  // 2-3단어 n-gram 생성
  const words = core.split(/\s+/).filter((w) => w.length >= 2);
  for (let i = 0; i < words.length; i++) {
    if (i + 1 < words.length) {
      keywords.push(words[i] + " " + words[i + 1]);
    }
    // 단독 키워드 (3자 이상만)
    if (words[i].length >= 3) {
      keywords.push(words[i]);
    }
  }

  // 특수 매핑 (약어/별칭)
  const ALIAS_MAP: Record<string, string[]> = {
    "관리체계 인증": ["ISMS-P"],
    "보안인증": ["CSAP"],
    "안전성 확보조치": ["안전성 확보조치"],
    "대가의 기준": ["대가산정"],
    "윤리기준": ["인공지능 윤리"],
    "웹사이트 품질관리": ["웹사이트 품질", "공공웹사이트 품질"],
  };

  for (const [pattern, aliases] of Object.entries(ALIAS_MAP)) {
    if (title.includes(pattern)) {
      keywords.push(...aliases);
    }
  }

  // 너무 짧은 단독 키워드 제거 (오매칭 방지)
  return keywords.filter((kw) => kw.length >= 4);
}

// ── 가이드라인 트래커 Base URL ──

const GUIDELINE_TRACKER_URL =
  process.env.GUIDELINE_TRACKER_URL || "https://itpe-guideline-tracker-web.vercel.app";

export function getGuidelineTrackerUrl(path: string): string {
  return `${GUIDELINE_TRACKER_URL}${path}`;
}
