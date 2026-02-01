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

const normalizeRoleType = (value: unknown) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return null;
  if (trimmed === "administrator") return "admin";
  return trimmed;
};

export async function GET(request: NextRequest) {
  const token = request.cookies.get("admin_session")?.value;
  // Prefer ADMIN_JWT_SECRET, fallback to ADMIN_SESSION_SECRET
  const secret = process.env.ADMIN_JWT_SECRET || process.env.ADMIN_SESSION_SECRET;
  if (!token || !secret) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const session = verifyAdminSessionToken(token, secret);
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const jwt = request.cookies.get("strapi_jwt")?.value;
  if (!jwt) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  try {
    const upstream = await fetch(`${getStrapiApiBaseUrl()}/users/me`, {
      method: "GET",
      headers: { Authorization: `Bearer ${jwt}` },
    });

    if (!upstream.ok) {
      return NextResponse.json({
        user: {
          id: session.id,
          name: session.name,
          email: session.email,
          role: normalizeRoleType(session.role) ?? "author",
        },
      });
    }

    const me = (await upstream.json()) as any;
    const roleType =
      normalizeRoleType(me?.role?.type) ?? normalizeRoleType(me?.role?.name) ?? normalizeRoleType(session.role) ?? "author";

    return NextResponse.json({
      user: {
        id: typeof me?.id === "number" || typeof me?.id === "string" ? String(me.id) : session.id,
        name: typeof me?.username === "string" ? me.username : session.name,
        email: typeof me?.email === "string" ? me.email : session.email,
        role: roleType,
      },
    });
  } catch {
    return NextResponse.json({
      user: {
        id: session.id,
        name: session.name,
        email: session.email,
        role: normalizeRoleType(session.role) ?? "author",
      },
    });
  }
}

