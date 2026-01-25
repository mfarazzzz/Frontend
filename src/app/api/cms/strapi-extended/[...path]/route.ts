import { NextRequest, NextResponse } from "next/server";
import type { PaginatedResponse } from "@/services/cms/types";
import { __strapiExtendedInternal } from "@/services/cms/strapiExtendedProvider";

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
    process.env.NEXT_PUBLIC_STRAPI_URL,
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

const getReadToken = () =>
  process.env.STRAPI_API_TOKEN ||
  process.env.NEXT_PUBLIC_STRAPI_API_TOKEN ||
  process.env.NEXT_PUBLIC_STRAPI_API_KEY ||
  undefined;

const buildTargetUrl = (request: NextRequest, path: string[]) => {
  const targetUrl = new URL(`${getStrapiApiBaseUrl()}/${path.join("/")}`);
  request.nextUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.append(key, value);
  });
  if (!targetUrl.searchParams.has("publicationState")) {
    targetUrl.searchParams.set("publicationState", "live");
  }
  return targetUrl;
};

const toPaginatedResponse = (raw: any, origin: string): PaginatedResponse<any> => {
  const list = Array.isArray(raw?.data) ? raw.data : [];
  const data = list.map((entity: any) => __strapiExtendedInternal.normalizeEntity(entity, origin));
  const pagination = raw?.meta?.pagination;
  const total = typeof pagination?.total === "number" ? pagination.total : data.length;
  const pageSize = typeof pagination?.pageSize === "number" ? pagination.pageSize : data.length;
  const page = typeof pagination?.page === "number" ? pagination.page : 1;
  const totalPages =
    typeof pagination?.pageCount === "number"
      ? pagination.pageCount
      : pageSize > 0
        ? Math.max(1, Math.ceil(total / pageSize))
        : 1;
  return { data, total, page, pageSize, totalPages };
};

const toSingle = (raw: any, origin: string) => {
  if (raw?.data && typeof raw.data === "object") {
    return __strapiExtendedInternal.normalizeEntity(raw.data, origin);
  }
  const first = Array.isArray(raw?.data) ? raw.data[0] : null;
  if (first && typeof first === "object") return __strapiExtendedInternal.normalizeEntity(first, origin);
  return null;
};

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const targetUrl = buildTargetUrl(request, path);
  const token = getReadToken();
  const forceSingle = ["1", "true", "yes"].includes((request.nextUrl.searchParams.get("single") || "").toLowerCase());

  const headers = new Headers();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const upstream = await fetch(targetUrl.toString(), { method: "GET", headers });
  const contentType = upstream.headers.get("content-type") || "";
  const body = contentType.includes("application/json") ? await upstream.json() : await upstream.text();

  if (!upstream.ok) {
    return NextResponse.json(body, { status: upstream.status });
  }

  const origin = __strapiExtendedInternal.getOrigin(getStrapiApiBaseUrl());
  const normalized = Array.isArray((body as any)?.data)
    ? forceSingle
      ? toSingle(body, origin)
      : toPaginatedResponse(body, origin)
    : toSingle(body, origin);
  return NextResponse.json(normalized, { status: 200 });
}
