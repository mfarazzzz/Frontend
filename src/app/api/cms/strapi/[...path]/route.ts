import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSessionToken } from "@/lib/adminSession";

export const runtime = "nodejs";

const getStrapiOrigin = () => {
  const base = getStrapiApiBaseUrl();
  try {
    const u = new URL(base);
    return `${u.protocol}//${u.host}`;
  } catch {
    return "";
  }
};

const rewriteMediaUrl = (origin: string, url: string) => {
  if (!url) return url;
  if (url.startsWith("data:") || url.startsWith("blob:")) return url;
  if (url.startsWith("//")) return `https:${url}`;

  if (url.startsWith("/uploads/")) return `${origin}${url}`;
  if (url.startsWith("/api/uploads/")) return `${origin}${url.replace(/^\/api/, "")}`;

  if (url.startsWith("http://") || url.startsWith("https://")) {
    try {
      const u = new URL(url);
      const normalizedPath = u.pathname.startsWith("/api/uploads/") ? u.pathname.replace(/^\/api/, "") : u.pathname;
      const isStrapiUpload = normalizedPath.startsWith("/uploads/");
      const isLocalHost = ["localhost", "127.0.0.1", "0.0.0.0"].includes(u.hostname);
      if (origin && isStrapiUpload && isLocalHost) {
        return `${origin}${normalizedPath}${u.search}${u.hash}`;
      }
      return url;
    } catch {
      return url;
    }
  }

  return url;
};

const rewriteMediaInHtml = (origin: string, html: string) => {
  if (!html) return html;
  return html
    .replace(/src="\/api\/uploads\//g, `src="${origin}/uploads/`)
    .replace(/src='\/api\/uploads\//g, `src='${origin}/uploads/`)
    .replace(/src="\/uploads\//g, `src="${origin}/uploads/`)
    .replace(/src='\/uploads\//g, `src='${origin}/uploads/`)
    .replace(/src="https?:\/\/localhost(?::\d+)?\/api\/uploads\//g, `src="${origin}/uploads/`)
    .replace(/src='https?:\/\/localhost(?::\d+)?\/api\/uploads\//g, `src='${origin}/uploads/`)
    .replace(/src="https?:\/\/localhost(?::\d+)?\/uploads\//g, `src="${origin}/uploads/`)
    .replace(/src='https?:\/\/localhost(?::\d+)?\/uploads\//g, `src='${origin}/uploads/`)
    .replace(/src="https?:\/\/127\.0\.0\.1(?::\d+)?\/api\/uploads\//g, `src="${origin}/uploads/`)
    .replace(/src='https?:\/\/127\.0\.0\.1(?::\d+)?\/api\/uploads\//g, `src='${origin}/uploads/`)
    .replace(/src="https?:\/\/127\.0\.0\.1(?::\d+)?\/uploads\//g, `src="${origin}/uploads/`)
    .replace(/src='https?:\/\/127\.0\.0\.1(?::\d+)?\/uploads\//g, `src='${origin}/uploads/`)
    .replace(/src="https?:\/\/0\.0\.0\.0(?::\d+)?\/api\/uploads\//g, `src="${origin}/uploads/`)
    .replace(/src='https?:\/\/0\.0\.0\.0(?::\d+)?\/api\/uploads\//g, `src='${origin}/uploads/`)
    .replace(/src="https?:\/\/0\.0\.0\.0(?::\d+)?\/uploads\//g, `src="${origin}/uploads/`)
    .replace(/src='https?:\/\/0\.0\.0\.0(?::\d+)?\/uploads\//g, `src='${origin}/uploads/`);
};

const rewriteMediaDeep = (origin: string, value: unknown): unknown => {
  if (!origin) return value;
  if (typeof value === "string") {
    const rewritten = rewriteMediaUrl(origin, value);
    if (rewritten !== value) return rewritten;
    if (value.includes('src="/uploads/') || value.includes("src='/uploads/") || value.includes("/api/uploads/")) {
      return rewriteMediaInHtml(origin, value);
    }
    return value;
  }
  if (!value || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map((item) => rewriteMediaDeep(origin, item));
  const obj = value as Record<string, unknown>;
  const next: Record<string, unknown> = {};
  Object.entries(obj).forEach(([key, v]) => {
    next[key] = rewriteMediaDeep(origin, v);
  });
  return next;
};

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
    process.env.NEXT_PUBLIC_STRAPI_URL,
    process.env.NODE_ENV === "production" ? undefined : "http://localhost:1337/api",
    process.env.NODE_ENV === "production" ? undefined : "http://127.0.0.1:1337/api",
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
  // Prefer frontend session secret, fallback to ADMIN_JWT_SECRET for legacy environments
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_JWT_SECRET;
  if (!secret) return null;
  
  const token = request.cookies.get("admin_session")?.value;
  if (!token) return null;
  
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

const proxy = async (request: NextRequest, path: string[]) => {
  const method = request.method.toUpperCase();
  const pathString = path.join("/");
  const isWriteOperation = ["POST", "PUT", "PATCH", "DELETE"].includes(method);

  const isPublic = (method === "GET" || method === "HEAD") && isPublicGetPath(pathString);
  const hasAdminSecrets = Boolean(process.env.ADMIN_JWT_SECRET || process.env.ADMIN_SESSION_SECRET);
  const session = isPublic ? null : getSession(request);

  if (!isPublic && !hasAdminSecrets) {
    return NextResponse.json(
      {
        error:
          "Server configuration error: ADMIN_JWT_SECRET (or ADMIN_SESSION_SECRET) is missing",
      },
      { status: 500 }
    );
  }

  if (!session && !isPublic) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");
  headers.delete("transfer-encoding");

  const jwt = request.cookies.get("strapi_jwt")?.value;
  if (isWriteOperation) {
    if (!jwt) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    headers.set("Authorization", `Bearer ${jwt}`);
  } else {
    if (jwt) {
      headers.set("Authorization", `Bearer ${jwt}`);
    }
  }

  // 5. Strapi v5 Content Manager Routing & URL Rewriting
  const targetUrl = buildTargetUrl(request, path);
  const finalMethod = method;
  let finalBody: BodyInit | undefined;

  // Check if this is a file upload (multipart/form-data)
  // We should NOT touch the body or method for uploads usually, but strictly speaking
  // uploads are POST to /api/upload.
  const isUpload = path[0] === "upload";

  // 6. Request Body Normalization for Strapi v4/v5 REST API
  // Apply to ALL write operations except uploads and DELETE
  if (isWriteOperation && !isUpload && method !== "DELETE") {
    try {
      const rawText = await request.text();
      if (rawText) {
        const rawJson = JSON.parse(rawText);
        // Strapi REST API expects { data: { ...attributes } }
        if (rawJson && typeof rawJson === 'object' && 'data' in rawJson) {
           finalBody = JSON.stringify(rawJson);
        } else {
           // Wrap in { data: body }
           finalBody = JSON.stringify({ data: rawJson });
        }
        headers.set("Content-Type", "application/json");
      }
    } catch (e) {
      console.warn("Failed to parse request body", e);
      // Fallback: send empty data wrapper if parsing fails but it's a write op
      finalBody = JSON.stringify({ data: {} });
      headers.set("Content-Type", "application/json");
    }
  } else if (isWriteOperation) {
    // Pass-through for Uploads or DELETE
    // For uploads, we need the array buffer to preserve binary data
    // For DELETE, usually no body, but we can pass through if present (rare)
    if (method !== "DELETE" || isUpload) {
       const ab = await request.arrayBuffer();
       finalBody = Buffer.from(ab);
    }
  } else {
    // Standard pass-through for read requests
    if (!["GET", "HEAD"].includes(method)) {
      const ab = await request.arrayBuffer();
      finalBody = Buffer.from(ab);
    }
  }

  // 7. Error Transparency & Execution
  try {
    const upstream = await fetch(targetUrl.toString(), {
      method: finalMethod,
      headers,
      body: finalBody,
      redirect: "manual", // Prevent auto-following redirects
    });

    const responseHeaders = new Headers(upstream.headers);
    responseHeaders.delete("set-cookie"); // Don't pass upstream cookies back to client? Usually good practice.
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("content-length");
    responseHeaders.delete("transfer-encoding");

    const contentType = upstream.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const canRewriteBody = finalMethod === "GET" && upstream.ok && isJson;

    if (canRewriteBody) {
      const origin = getStrapiOrigin();
      try {
        const data = await upstream.json();
        const rewritten = rewriteMediaDeep(origin, data);

        // Add cache-control headers for public GET editorial/article responses
        // so CDN and browsers can cache them appropriately.
        const isPublicContentPath =
          pathString.startsWith("editorials") ||
          pathString.startsWith("articles");
        if (isPublicContentPath && upstream.ok && !jwt) {
          responseHeaders.set(
            "Cache-Control",
            "public, s-maxage=300, stale-while-revalidate=60"
          );
        }

        return NextResponse.json(rewritten, {
          status: upstream.status,
          headers: responseHeaders,
        });
      } catch {
        return new NextResponse(upstream.body, {
          status: upstream.status,
          headers: responseHeaders,
        });
      }
    }

    return new NextResponse(upstream.body, { status: upstream.status, headers: responseHeaders });
  } catch (error) {
    console.error("Proxy Error:", error);
    return NextResponse.json({ error: "Internal Proxy Error" }, { status: 500 });
  }
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
