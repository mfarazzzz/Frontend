import type { MetadataRoute } from "next";

const BASE_URL = "https://rampurnews.com";

type WPPost = {
  slug: string;
  date: string;
  _embedded?: {
    "wp:term"?: Array<Array<{ slug: string }>>;
  };
};

const getWordPressBaseUrl = () => {
  const baseUrl = process.env.WORDPRESS_BASE_URL;
  if (!baseUrl) return null;
  return baseUrl.replace(/\/+$/, "");
};

const fetchPostsPage = async (page: number): Promise<{ posts: WPPost[]; totalPages: number }> => {
  const baseUrl = getWordPressBaseUrl();
  if (!baseUrl) return { posts: [], totalPages: 0 };
  try {
    const response = await fetch(`${baseUrl}/wp-json/wp/v2/posts?per_page=100&page=${page}&_embed=true`, {
      next: { revalidate: 300 },
    });
    if (!response.ok) return { posts: [], totalPages: 0 };
    const totalPages = Number(response.headers.get("X-WP-TotalPages") || "0");
    const posts = (await response.json()) as WPPost[];
    return { posts, totalPages };
  } catch {
    return { posts: [], totalPages: 0 };
  }
};

const fetchPostsForSitemap = async (): Promise<WPPost[]> => {
  const all: WPPost[] = [];
  const first = await fetchPostsPage(1);
  all.push(...first.posts);
  const totalPages = Math.min(first.totalPages || 0, 5);
  for (let page = 2; page <= totalPages; page += 1) {
    const next = await fetchPostsPage(page);
    all.push(...next.posts);
  }
  return all;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPaths = [
    "",
    "/rampur",
    "/up",
    "/national",
    "/politics",
    "/crime",
    "/education-jobs",
    "/business",
    "/entertainment",
    "/sports",
    "/health",
    "/religion-culture",
    "/food-lifestyle",
    "/nearby",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
    "/disclaimer",
    "/ownership",
    "/editorial-policy",
    "/corrections-policy",
    "/grievance",
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: path === "" ? 1 : 0.7,
  }));

  const posts = await fetchPostsForSitemap();
  const articleEntries: MetadataRoute.Sitemap = posts.map((post) => {
    const categories = post._embedded?.["wp:term"]?.[0] || [];
    const category = categories[0]?.slug || "uncategorized";
    return {
      url: `${BASE_URL}/${category}/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "hourly",
      priority: 0.9,
    };
  });

  return [...staticEntries, ...articleEntries];
}
