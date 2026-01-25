import type { Metadata } from "next";
import FashionDetail from "@/views/lifestyle/FashionDetail";
import { getExtendedCMSProvider } from "@/services/cms/extendedProvider";

const provider = getExtendedCMSProvider();

const typeLabels: Record<string, string> = {
  clothing: "कपड़े",
  jewelry: "ज्वेलरी",
  footwear: "जूते-चप्पल",
  accessories: "एक्सेसरीज़",
  tailor: "दर्जी",
  boutique: "बुटीक",
};

type PageParams = {
  slug: string;
};

export async function generateMetadata(
  props: { params: Promise<PageParams> }
): Promise<Metadata> {
  const { slug } = await props.params;
  const store = await provider.getFashionStoreBySlug(slug);

  if (!store) {
    const title = "फैशन स्टोर नहीं मिला | रामपुर";
    const description = "आपके द्वारा खोजी गई फैशन दुकान उपलब्ध नहीं है।";
    const canonical = "/food-lifestyle/fashion";

    return {
      title,
      description,
      alternates: {
        canonical,
      },
      openGraph: {
        type: "website",
        title,
        description,
        url: canonical,
      },
      twitter: {
        card: "summary",
        title,
        description,
      },
    };
  }

  const typeLabel = typeLabels[store.type] || "फैशन स्टोर";
  const title = `${store.nameHindi} | ${typeLabel} रामपुर - बेस्ट फैशन स्टोर`;
  const description = store.descriptionHindi;
  const canonical = `/food-lifestyle/fashion/${store.slug}`;
  const imageUrl = store.image || store.gallery?.[0];

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      type: "article",
      title,
      description,
      url: canonical,
      siteName: "रामपुर न्यूज़ | Rampur News",
      images: imageUrl
        ? [
            {
              url: imageUrl,
              width: 1200,
              height: 630,
              alt: store.nameHindi,
            },
          ]
        : undefined,
      locale: "hi_IN",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default function Page() {
  return <FashionDetail />;
}


