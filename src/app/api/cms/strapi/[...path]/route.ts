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
    "https://api.rampur.cloud/api",
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
  // 1. Environment Consistency Check
  if (!process.env.ADMIN_SESSION_SECRET && !process.env.ADMIN_JWT_SECRET) {
    return NextResponse.json(
      {
        error:
          "Server configuration error: ADMIN_SESSION_SECRET (or ADMIN_JWT_SECRET) is missing",
      },
      { status: 500 }
    );
  }

  const method = request.method.toUpperCase();
  const pathString = path.join("/");
  const isWriteOperation = ["POST", "PUT", "PATCH", "DELETE"].includes(method);

  // 2. Session Handling: Verify admin_session cookie only for UI access control
  const session = getSession(request);
  const isPublic = (method === "GET" || method === "HEAD") && isPublicGetPath(pathString);

  // Access Control: Must have session unless public GET/HEAD OR it is a write operation (which uses server token)
  // We explicitly allow write operations to proceed without admin_session because we force-attach the STRAPI_API_TOKEN.
  // This ensures that Uploads, Deletes, and Article Writes work even if the UI session is unstable.
  if (!session && !isPublic && !isWriteOperation) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 3. Header Hygiene
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");
  headers.delete("transfer-encoding");

  // 4. Authentication Strategy & Cookie Handling
  if (isWriteOperation) {
    // Write Ops: Completely ignore browser cookies, use STRAPI_API_TOKEN
    headers.delete("cookie");
    
    const apiToken = process.env.STRAPI_API_TOKEN;
    if (!apiToken) {
      return NextResponse.json(
        { error: "Server configuration error: STRAPI_API_TOKEN is missing" },
        { status: 500 }
      );
    }
    // Always replace authorization
    headers.set("Authorization", `Bearer ${apiToken}`);
  } else {
    // Read Ops: Use strapi_jwt from cookies
    // Keep "cookie" header intact (do not delete) so we can extract if needed, 
    // but primarily we extract strapi_jwt and set Authorization.
    const jwt = request.cookies.get("strapi_jwt")?.value;
    if (jwt) {
      headers.set("Authorization", `Bearer ${jwt}`);
    }
    // We do NOT delete the cookie header here, per requirements.
  }

  // 5. Strapi v5 Content Manager Routing & URL Rewriting
  let targetUrl = buildTargetUrl(request, path);
  let finalMethod = method;
  let finalBody: BodyInit | undefined;

  // Handle Article Write Operations - Use REST API (not Content Manager)
  // API tokens work with /api/articles, NOT /content-manager endpoints
  if (isWriteOperation && path[0] === "articles") {
    // targetUrl is already correct: /api/articles or /api/articles/:id
    // No URL rewriting needed for REST API

    // 6. Request Body Normalization for Strapi v4/v5 REST API
    if (method !== "DELETE") {
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
    }
  } else if (isWriteOperation) {
    // Other write operations (non-articles) - pass through body as-is
    const ab = await request.arrayBuffer();
    finalBody = Buffer.from(ab);
  } else {
    // Standard pass-through for non-article-write requests
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

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
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
