/**
 * /api/og — Dynamic OG Image Generator
 *
 * Generates a 1200×630 PNG using Next.js ImageResponse (next/og).
 * Used as the fallback OG image for every article and page.
 *
 * Usage:
 *   /api/og?title=Article+Title
 *   /api/og?title=Article+Title&category=national&author=Rampur+Desk
 *
 * Cached at the CDN edge for 24h (s-maxage=86400).
 */
import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

const SITE_NAME = "रामपुर न्यूज़ | Rampur News";
const SITE_URL = "https://rampurnews.com";
const BRAND_RED = "#dc2626";
const BG_DARK = "#0f172a";
const BG_CARD = "#1e293b";
const TEXT_WHITE = "#f8fafc";
const TEXT_MUTED = "#94a3b8";
const TEXT_ACCENT = "#e2e8f0";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const rawTitle = (searchParams.get("title") || "").trim();
  const title = rawTitle.slice(0, 120) || SITE_NAME;
  const category = (searchParams.get("category") || "").trim();
  const author = (searchParams.get("author") || "Rampur News Desk").trim();

  // Fetch logo as base64 for embedding in the image
  let logoSrc: string | undefined;
  try {
    const logoRes = await fetch(`${SITE_URL}/logo.png`);
    if (logoRes.ok) {
      const buf = await logoRes.arrayBuffer();
      logoSrc = `data:image/png;base64,${Buffer.from(buf).toString("base64")}`;
    }
  } catch {
    // Non-fatal — render without logo
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          backgroundColor: BG_DARK,
          fontFamily: "'Noto Sans', 'Segoe UI', sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Top red accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "8px",
            backgroundColor: BRAND_RED,
          }}
        />

        {/* Card background */}
        <div
          style={{
            position: "absolute",
            top: "40px",
            left: "60px",
            right: "60px",
            bottom: "40px",
            backgroundColor: BG_CARD,
            borderRadius: "20px",
            display: "flex",
          }}
        />

        {/* Left red accent stripe */}
        <div
          style={{
            position: "absolute",
            top: "80px",
            left: "100px",
            width: "6px",
            height: "460px",
            backgroundColor: BRAND_RED,
            borderRadius: "3px",
          }}
        />

        {/* Content area */}
        <div
          style={{
            position: "absolute",
            top: "80px",
            left: "130px",
            right: "80px",
            bottom: "80px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "40px 40px 40px 20px",
          }}
        >
          {/* Category badge */}
          {category && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  backgroundColor: BRAND_RED,
                  color: TEXT_WHITE,
                  fontSize: "22px",
                  fontWeight: 700,
                  padding: "6px 18px",
                  borderRadius: "6px",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                {category}
              </div>
            </div>
          )}

          {/* Article title */}
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
            }}
          >
            <div
              style={{
                color: TEXT_WHITE,
                fontSize: title.length > 60 ? "38px" : "48px",
                fontWeight: 700,
                lineHeight: 1.3,
                maxWidth: "900px",
              }}
            >
              {title}
            </div>
          </div>

          {/* Footer: author + site name + logo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: `1px solid #334155`,
              paddingTop: "20px",
              marginTop: "20px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ color: TEXT_ACCENT, fontSize: "22px", fontWeight: 600 }}>
                {author}
              </div>
              <div style={{ color: TEXT_MUTED, fontSize: "18px" }}>
                {SITE_URL.replace("https://", "")}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {logoSrc && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoSrc}
                  alt="logo"
                  width={56}
                  height={56}
                  style={{ borderRadius: "8px" }}
                />
              )}
              <div
                style={{
                  color: TEXT_WHITE,
                  fontSize: "24px",
                  fontWeight: 700,
                }}
              >
                {SITE_NAME}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom red accent bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "8px",
            backgroundColor: BRAND_RED,
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
