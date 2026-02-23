import { NextResponse } from "next/server";

const SITE_NAME = "रामपुर न्यूज़";

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawTitle = searchParams.get("title") || SITE_NAME;
  const title = escapeXml(rawTitle.trim().slice(0, 140) || SITE_NAME);
  const subtitle = escapeXml(searchParams.get("subtitle") || "RampurNews.com");

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="70" y="70" width="1060" height="490" rx="28" fill="#0b1220" opacity="0.75"/>
  <text x="120" y="210" fill="#f8fafc" font-family="Noto Sans Devanagari, sans-serif" font-size="44" font-weight="700">
    ${title}
  </text>
  <text x="120" y="300" fill="#e2e8f0" font-family="Noto Sans Devanagari, sans-serif" font-size="28" font-weight="500">
    ${subtitle}
  </text>
  <text x="120" y="520" fill="#94a3b8" font-family="Noto Sans Devanagari, sans-serif" font-size="24" font-weight="600">
    ${SITE_NAME}
  </text>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
    },
  });
}

