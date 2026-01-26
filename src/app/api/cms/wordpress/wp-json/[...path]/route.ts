import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionSecret, verifyAdminSessionToken } from "@/lib/adminSession";

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

const getAdminSession = (request: NextRequest) => {
  const token = request.cookies.get("admin_session")?.value;
  const secret = getAdminSessionSecret();
  if (!token || !secret) return null;
  return verifyAdminSessionToken(token, secret);
};

const isPublicGetPath = (path: string) => {
  if (!path.startsWith("wp/v2/")) return false;
  const rest = path.slice("wp/v2/".length);
  if (rest.startsWith("posts")) return true;
  if (rest.startsWith("categories")) return true;
  if (rest.startsWith("media")) return true;
  return false;
};

const buildTargetUrl = (request: NextRequest, path: string[]) => {
  const targetUrl = new URL(`${getTargetBaseUrl()}/wp-json/${path.join("/")}`);
  request.nextUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.append(key, value);
  });
  return targetUrl;
};

const buildHeaders = (request: NextRequest, includeAuth: boolean) => {
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");
  headers.delete("cookie");
  headers.delete("authorization");

  const auth = getWordPressAuthHeader();
  if (includeAuth && auth) {
    headers.set("Authorization", auth);
  }
  return headers;
};

const proxy = async (request: NextRequest, path: string[]) => {
  const method = request.method.toUpperCase();
  const targetUrl = buildTargetUrl(request, path);
  const pathString = path.join("/");
  const session = getAdminSession(request);

  const allowWithoutSession = method === "GET" && isPublicGetPath(pathString);
  const includeAuth = !!session;

  if (!session && !allowWithoutSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const headers = buildHeaders(request, includeAuth);
  const body = method === "GET" || method === "HEAD" ? undefined : await request.arrayBuffer();

  const upstream = await fetch(targetUrl.toString(), {
    method,
    headers,
    body: body ? Buffer.from(body) : undefined,
  });

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
  try {
    const { path } = await context.params;
    return await proxy(request, path);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Proxy error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  try {
    const { path } = await context.params;
    return await proxy(request, path);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Proxy error" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  try {
    const { path } = await context.params;
    return await proxy(request, path);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Proxy error" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  try {
    const { path } = await context.params;
    return await proxy(request, path);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Proxy error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  try {
    const { path } = await context.params;
    return await proxy(request, path);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Proxy error" },
      { status: 500 },
    );
  }
}
