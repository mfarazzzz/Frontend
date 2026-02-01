import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    nodeEnv: process.env.NODE_ENV ?? null,
    hasAdminSessionSecret: !!process.env.ADMIN_SESSION_SECRET,
    hasAdminJwtSecret: !!process.env.ADMIN_JWT_SECRET,
    hasStrapiApiToken: !!process.env.STRAPI_API_TOKEN,
    hasStrapiApiUrl: !!process.env.STRAPI_API_URL,
    hasNextPublicStrapiApiUrl: !!process.env.NEXT_PUBLIC_STRAPI_API_URL,
  });
}
