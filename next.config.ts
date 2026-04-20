import type { NextConfig } from "next";

// ── 보안 헤더 (OWASP 권장) ──
const securityHeaders = [
  // MIME 타입 스니핑 방지
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Clickjacking 방지
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Referrer 정책 (origin만 전송)
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // HTTPS 강제 (2년, preload 제외)
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
  // 권한 정책 (불필요한 브라우저 API 차단)
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  // CSP — Next.js inline 스크립트 허용하되 외부 도메인 제한
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
      "font-src 'self' fonts.gstatic.com data:",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://www.law.go.kr https://korean-law-mcp.fly.dev https://api.anthropic.com https://itpe-guideline-tracker-web.vercel.app",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },

  // 모든 경로에 보안 헤더 적용
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },

  // 프로덕션에서 X-Powered-By 제거 (Next.js 정보 노출 감소)
  poweredByHeader: false,
};

export default nextConfig;
