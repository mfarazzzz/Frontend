import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCMSProvider } from "@/services/cms";

export const runtime = "nodejs";

const getToken = (request: NextRequest, body: any) => {
  const headerToken = request.headers.get("x-revalidate-token");
  const queryToken = request.nextUrl.searchParams.get("secret");
  const bodyToken = typeof body?.secret === "string" ? body.secret : null;
  return headerToken || queryToken || bodyToken || "";
};

export async function POST(request: NextRequest) {
  let payload: any = null;
  try {
    payload = await request.json();
  } catch {
    payload = null;
  }

  const secret = process.env.REVALIDATE_SECRET;
  if (secret) {
    const token = getToken(request, payload);
    if (!token || token !== secret) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
  }

  const slug = typeof payload?.slug === "string" ? payload.slug.trim() : "";
  const type = typeof payload?.type === "string" ? payload.type.trim() : "";
  const category = typeof payload?.category === "string" ? payload.category.trim() : "";

  // Always revalidate base paths
  const paths = new Set<string>(["/", "/sitemap.xml", "/sitemap-news.xml", "/news-sitemap.xml"]);

  // Accept explicit paths array from publish handler (single-source revalidation)
  if (Array.isArray(payload?.paths)) {
    for (const p of payload.paths) {
      if (typeof p === "string" && p.trim()) paths.add(p.trim());
    }
  }

  // Fallback: derive paths from slug + category if no explicit paths provided
  if (type === "article" && slug && !Array.isArray(payload?.paths)) {
    let categorySlug = category;
    if (!categorySlug) {
      try {
        const provider = getCMSProvider();
        const article = await provider.getArticleBySlug(slug);
        if (article?.category) categorySlug = article.category;
      } catch {
        categorySlug = "";
      }
    }
    if (categorySlug) {
      paths.add(`/${categorySlug}/${slug}`);
      paths.add(`/${categorySlug}`);
    } else if (slug) {
      paths.add(`/${slug}`);
    }
  }

  const revalidated: string[] = [];
  for (const path of paths) {
    try {
      revalidatePath(path);
      revalidated.push(path);
    } catch {
      void 0;
    }
  }

  return NextResponse.json(
    { ok: true, revalidated },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}

