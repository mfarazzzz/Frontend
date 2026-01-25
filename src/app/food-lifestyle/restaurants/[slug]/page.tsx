import type { Metadata } from "next";
import RestaurantDetail from "@/views/lifestyle/RestaurantDetail";
import { getExtendedCMSProvider } from "@/services/cms/extendedProvider";

const provider = getExtendedCMSProvider();

const typeLabels: Record<string, string> = {
  restaurant: "रेस्तरां",
  cafe: "कैफे",
  "street-food": "स्ट्रीट फूड",
  "sweet-shop": "मिठाई की दुकान",
  dhaba: "ढाबा",
  "fine-dining": "फाइन डाइनिंग",
};

type PageParams = {
  slug: string;
};

export async function generateMetadata(
  props: { params: Promise<PageParams> }
): Promise<Metadata> {
  const { slug } = await props.params;
  const restaurant = await provider.getRestaurantBySlug(slug);

  if (!restaurant) {
    const title = "रेस्तरां नहीं मिला | रामपुर";
    const description = "आपके द्वारा खोजा गया रेस्तरां उपलब्ध नहीं है।";
    const canonical = "/food-lifestyle/restaurants";

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

  const typeLabel = typeLabels[restaurant.type] || "रेस्तरां";
  const title = `${restaurant.nameHindi} | ${typeLabel} रामपुर - खाने का बेस्ट स्थान`;
  const description = restaurant.descriptionHindi;
  const canonical = `/food-lifestyle/restaurants/${restaurant.slug}`;
  const imageUrl = restaurant.image || restaurant.gallery?.[0];

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
              alt: restaurant.nameHindi,
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
  return <RestaurantDetail />;
}


