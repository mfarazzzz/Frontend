import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSessionToken } from "@/lib/adminSession";

export const runtime = "nodejs";

const getTargetBaseUrl = () => {
  const baseUrl = process.env.WORDPRESS_BASE_URL;
  if (!baseUrl) {
    throw new Error("WORDPRESS_BASE_URL is not configured");
  }
  return baseUrl.replace(/\/+$/, "");
};

const getWordPressAuthHeader = () => {
  const jwt = process.env.WORDPRESS_JWT_TOKEN || process.env.WORDPRESS_API_KEY;
  if (jwt) {
    return `Bearer ${jwt}`;
  }
  const username = process.env.WORDPRESS_USERNAME;
  const password = process.env.WORDPRESS_APP_PASSWORD || process.env.WORDPRESS_PASSWORD;
  if (username && password) {
    const encoded = Buffer.from(`${username}:${password}`, "utf8").toString("base64");
    return `Basic ${encoded}`;
  }
  return null;
};

const hasAdminSession = (request: NextRequest) => {
  const token = request.cookies.get("admin_session")?.value;
  // CRITICAL FIX: Use ADMIN_JWT_SECRET for consistency, fallback to ADMIN_SESSION_SECRET
  const secret = process.env.ADMIN_JWT_SECRET || process.env.ADMIN_SESSION_SECRET;
  if (!token || !secret) return false;
  return !!verifyAdminSessionToken(token, secret);
};

export async function GET(request: NextRequest) {
  try {
    const targetUrl = new URL(`${getTargetBaseUrl()}/wp-json`);
    request.nextUrl.searchParams.forEach((value, key) => {
      targetUrl.searchParams.set(key, value);
    });

    const headers = new Headers();
    const auth = getWordPressAuthHeader();
    if (auth && hasAdminSession(request)) {
      headers.set("Authorization", auth);
    }

    const upstream = await fetch(targetUrl.toString(), { method: "GET", headers });
    const responseHeaders = new Headers(upstream.headers);
    responseHeaders.delete("set-cookie");
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("content-length");
    responseHeaders.delete("transfer-encoding");

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Proxy error" },
      { status: 500 },
    );
  }
}
