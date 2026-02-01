import { NextRequest, NextResponse } from "next/server";
import { createAdminSessionToken } from "@/lib/adminSession";

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

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  // CRITICAL FIX: Use ADMIN_JWT_SECRET for consistency with proxy
  const sessionSecret = process.env.ADMIN_JWT_SECRET;

  if (!sessionSecret) {
    return NextResponse.json(
      { error: "Server configuration error: ADMIN_JWT_SECRET is missing" },
      { status: 500 },
    );
  }

  const inputEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  const inputPassword = typeof password === "string" ? password.trim() : "";

  if (!inputEmail || !inputPassword) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 },
    );
  }

  let jwt: string | null = null;
  let user: any = null;
  try {
    const upstream = await fetch(`${getStrapiApiBaseUrl()}/auth/local`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: inputEmail, password: inputPassword }),
    });

    if (!upstream.ok) {
      if (upstream.status === 400 || upstream.status === 401 || upstream.status === 403) {
        return NextResponse.json(
          {
            error:
              "This account does not exist in CMS users. Please create the user under Strapi → Users & Permissions.",
          },
          { status: 401 },
        );
      }
      const text = await upstream.text().catch(() => "");
      return NextResponse.json(
        { error: text || `Strapi login failed (${upstream.status})` },
        { status: 502 },
      );
    }

    const data = (await upstream.json()) as any;
    jwt = typeof data?.jwt === "string" ? data.jwt : null;
    user = data?.user ?? null;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Strapi login failed" },
      { status: 502 },
    );
  }

  if (!jwt || !user) {
    return NextResponse.json(
      {
        error:
          "This account does not exist in CMS users. Please create the user under Strapi → Users & Permissions.",
      },
      { status: 401 },
    );
  }

  if (user?.blocked === true) {
    return NextResponse.json({ error: "User is disabled" }, { status: 403 });
  }

  const roleType =
    normalizeRoleType(user?.role?.type) ?? normalizeRoleType(user?.role?.name) ?? "author";
  const allowed = new Set(["admin", "editor", "author", "contributor"]);
  if (!allowed.has(roleType)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const sessionUser = {
    id: typeof user?.id === "number" || typeof user?.id === "string" ? String(user.id) : "",
    name: typeof user?.username === "string" ? user.username : "User",
    email: typeof user?.email === "string" ? user.email : inputEmail,
    role: roleType,
  };

  const token = createAdminSessionToken(
    {
      id: sessionUser.id,
      email: sessionUser.email,
      role: sessionUser.role,
      name: sessionUser.name,
    },
    sessionSecret,
    24 * 60 * 60,
  );

  const response = NextResponse.json({ user: sessionUser });
  response.cookies.set("admin_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 24 * 60 * 60,
  });
  response.cookies.set("strapi_jwt", jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 24 * 60 * 60,
  });
  return response;
}
