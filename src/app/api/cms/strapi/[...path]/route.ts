import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSessionToken } from "@/lib/adminSession";

export const runtime = "nodejs";

const normalizeStrapiApiUrl = (value: string) => {
  const trimmed = value.trim().replace(/\/+$/, "");
  if (!trimmed) return "";
  if (trimmed.endsWith("/api")) return trimmed;
  if (/^https?:\/\/[^/]+$/i.test(trimmed)) return `${trimmed}/api`;
  return trimmed;
};

const getStrapiApiBaseUrl = () => {
  const candidates = [
    process.env.STRAPI_API_URL,
    process.env.NEXT_PUBLIC_STRAPI_API_URL,
    process.env.NEXT_PUBLIC_STRAPI_BASE_URL,
    "http://localhost:1337/api",
    "http://127.0.0.1:1337/api",
  ]
    .filter((value) => typeof value === "string")
    .map((value) => normalizeStrapiApiUrl(String(value)))
    .filter(Boolean);

  if (candidates.length === 0) {
    throw new Error("Strapi API URL is not configured");
  }

  return candidates[0]!;
};

const getSession = (request: NextRequest) => {
  const token = request.cookies.get("admin_session")?.value;
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!token || !secret) return null;
  return verifyAdminSessionToken(token, secret);
};

const isPublicGetPath = (path: string) => {
  if (path.startsWith("admin/")) return false;
  const parts = path.split("/").filter(Boolean);
  if (parts.includes("admin")) return false;
  if (parts[0] === "upload") return false;
  if (parts[0] === "users") return false;
  if (parts[0] === "auth") return false;
  return true;
};

const buildTargetUrl = (request: NextRequest, path: string[]) => {
  const targetUrl = new URL(`${getStrapiApiBaseUrl()}/${path.join("/")}`);
  request.nextUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.append(key, value);
  });
  return targetUrl;
};

const buildHeaders = (request: NextRequest, includeAuth: boolean, jwt: string | null) => {
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");
  headers.delete("cookie");
  headers.delete("authorization");
  headers.delete("origin");
  headers.delete("referer");

  if (includeAuth && jwt) {
    headers.set("Authorization", `Bearer ${jwt}`);
  }
  return headers;
};

const proxy = async (request: NextRequest, path: string[]) => {
  const method = request.method.toUpperCase();
  const targetUrl = buildTargetUrl(request, path);
  const pathString = path.join("/");

  const session = getSession(request);
  const allowWithoutSession = (method === "GET" || method === "HEAD") && isPublicGetPath(pathString);

  if (!session && !allowWithoutSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const jwt = request.cookies.get("strapi_jwt")?.value ?? null;
  if (session && !jwt) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const headers = buildHeaders(request, !!session, jwt);
  const body = method === "GET" || method === "HEAD" ? undefined : await request.arrayBuffer();

  let upstream: Response;
  try {
    upstream = await fetch(targetUrl.toString(), {
      method,
      headers,
      body: body ? Buffer.from(body) : undefined,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upstream request failed" },
      { status: 502 },
    );
  }

  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.delete("set-cookie");
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("content-length");
  responseHeaders.delete("transfer-encoding");

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
};

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return proxy(request, path);
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return proxy(request, path);
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return proxy(request, path);
}

export async function PUT(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return proxy(request, path);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return proxy(request, path);
}
