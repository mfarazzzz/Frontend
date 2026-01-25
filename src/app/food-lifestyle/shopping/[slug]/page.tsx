import type { Metadata } from "next";
import ShoppingDetail from "@/views/lifestyle/ShoppingDetail";
import { getExtendedCMSProvider } from "@/services/cms/extendedProvider";

const provider = getExtendedCMSProvider();

const typeLabels: Record<string, string> = {
  mall: "मॉल",
  market: "बाज़ार",
  bazaar: "बाज़ार",
  complex: "कॉम्प्लेक्स",
  plaza: "प्लाज़ा",
};

type PageParams = {
  slug: string;
};

export async function generateMetadata(
  props: { params: Promise<PageParams> }
): Promise<Metadata> {
  const { slug } = await props.params;
  const centre = await provider.getShoppingCentreBySlug(slug);

  if (!centre) {
    const title = "शॉपिंग सेंटर नहीं मिला | रामपुर";
    const description = "आपके द्वारा खोजा गया शॉपिंग सेंटर उपलब्ध नहीं है।";
    const canonical = "/food-lifestyle/shopping";

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

  const typeLabel = typeLabels[centre.type] || "शॉपिंग सेंटर";
  const title = `${centre.nameHindi} | ${typeLabel} रामपुर - बेस्ट शॉपिंग डेस्टिनेशन`;
  const description = centre.descriptionHindi;
  const canonical = `/food-lifestyle/shopping/${centre.slug}`;
  const imageUrl = centre.image || centre.gallery?.[0];

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
              alt: centre.nameHindi,
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
  return <ShoppingDetail />;
}


