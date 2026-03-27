/**
 * /api/cms/strapi/[...path]
 *
 * Transparent proxy from the Next.js frontend to the Strapi API.
 * Used by client-side fetches (browser navigation, React Query refetches)
 * so the Strapi URL and API token are never exposed to the browser.
 *
 * Server-side (SSR) fetches bypass this and call Strapi directly via
 * buildDirectUrl() in the CMS service layer.
 */
import { NextRequest, NextResponse } from "next/server";

const STRAPI_API_URL = (
  process.env.STRAPI_API_URL ||
  process.env.NEXT_PUBLIC_STRAPI_API_URL ||
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  "https://api.rampur.cloud/api"
).replace(/\/+$/, "");

const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN || process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

// Methods that mutate data — forward the Authorization header from the client
const MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

// Public read-only paths that never need an auth header forwarded
const isPublicReadPath = (path: string) =>
  path.startsWith("/articles") ||
  path.startsWith("/categories") ||
  path.startsWith("/authors") ||
  path.startsWith("/tags") ||
  path.startsWith("/editorials") ||
  path.startsWith("/settings");

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, await params, "GET");
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, await params, "POST");
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, await params, "PUT");
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, await params, "PATCH");
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, await params, "DELETE");
}

async function proxyRequest(
  request: NextRequest,
  params: { path: string[] },
  method: string
): Promise<NextResponse> {
  const pathSegments = params.path ?? [];
  const strapiPath = "/" + pathSegments.join("/");
  const search = request.nextUrl.search;
  const targetUrl = `${STRAPI_API_URL}${strapiPath}${search}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const isMutation = MUTATION_METHODS.has(method);

  if (isMutation) {
    // For mutations, prefer the client's Authorization header (JWT from users-permissions).
    // Fall back to the server-side API token so write operations from SSR/admin work too.
    const clientAuth = request.headers.get("authorization");
    if (clientAuth) {
      headers["Authorization"] = clientAuth;
    } else if (STRAPI_API_TOKEN) {
      headers["Authorization"] = `Bearer ${STRAPI_API_TOKEN}`;
    }
  } else if (STRAPI_API_TOKEN && !isPublicReadPath(strapiPath)) {
    // For non-public reads, attach the server-side API token
    headers["Authorization"] = `Bearer ${STRAPI_API_TOKEN}`;
  }

  let body: string | undefined;
  if (isMutation) {
    try {
      body = await request.text();
    } catch {
      body = undefined;
    }
  }

  try {
    const upstream = await fetch(targetUrl, {
      method,
      headers,
      body,
      // Proxy requests are always fresh — caching is handled by the caller
      cache: "no-store",
    });

    const contentType = upstream.headers.get("content-type") || "";
    const responseBody = await upstream.text();

    return new NextResponse(responseBody, {
      status: upstream.status,
      headers: {
        "Content-Type": contentType || "application/json",
        // Don't cache proxy responses in the browser — let the CMS service
        // layer control caching via next: { revalidate } on the server side.
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error(`[cms-proxy] Failed to reach Strapi at ${targetUrl}:`, error);
    return NextResponse.json(
      { error: "CMS unavailable", upstream: targetUrl },
      { status: 502 }
    );
  }
}
