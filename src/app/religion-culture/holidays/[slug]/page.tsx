import type { Metadata } from "next";
import HolidayDetailPage from "@/views/culture/HolidayDetail";
import { getExtendedCMSProvider } from "@/services/cms/extendedProvider";
import { cache } from "react";

const SITE_URL = "https://rampurnews.com";

const fetchHoliday = cache(async (slug: string) => {
  try {
    const provider = getExtendedCMSProvider();
    return await provider.getHolidayBySlug(slug);
  } catch {
    return null;
  }
});

export const revalidate = 3600; // 1 hour ISR

type PageParams = { slug: string };

export async function generateMetadata(props: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const holiday = await fetchHoliday(slug);

  if (!holiday) {
    return {
      title: "छुट्टी नहीं मिली | रामपुर न्यूज़",
      robots: { index: false, follow: false },
    };
  }

  const title = `${holiday.nameHindi || holiday.name} - तारीख, महत्व और जानकारी | रामपुर न्यूज़`;
  const description =
    holiday.descriptionHindi ||
    holiday.description ||
    `${holiday.nameHindi || holiday.name} ${holiday.date ? new Date(holiday.date).getFullYear() : "2026"} की तारीख और जानकारी। रामपुर न्यूज़ पर पढ़ें।`;
  const canonical = `${SITE_URL}/religion-culture/holidays/${slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: "article",
      title,
      description,
      url: canonical,
      siteName: "रामपुर न्यूज़ | Rampur News",
      locale: "hi_IN",
      images: holiday.image
        ? [{ url: holiday.image, width: 1200, height: 630, alt: holiday.nameHindi || holiday.name }]
        : [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    other: {
      "article:section": "धर्म और संस्कृति",
      "googlebot-news": "index, follow",
    },
  };
}

export default function Page() {
  return <HolidayDetailPage />;
}
