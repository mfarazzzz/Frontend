import type { Metadata } from "next";
import { getCategoryBySlug } from "@/data/categories";

const SITE_URL = "https://rampurnews.com";

export const buildCategoryMetadata = (slug: string): Metadata => {
  const category = getCategoryBySlug(slug);
  const path = category?.path || `/${slug}`;
  const title = category ? `${category.titleHindi} समाचार | रामपुर न्यूज़` : "रामपुर न्यूज़ | Rampur News";
  const description =
    category?.description ||
    "रामपुर और उत्तर प्रदेश की ताज़ा खबरें: स्थानीय, शिक्षा, खेल, मनोरंजन और अधिक।";
  const absolute = `${SITE_URL}${path}`;
  return {
    title,
    description,
    alternates: { canonical: absolute },
    openGraph: {
      type: "website",
      title,
      description,
      url: absolute,
      siteName: "रामपुर न्यूज़ | Rampur News",
      images: [
        {
          url: `${SITE_URL}/og-image.svg`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${SITE_URL}/og-image.svg`],
    },
  };
};
