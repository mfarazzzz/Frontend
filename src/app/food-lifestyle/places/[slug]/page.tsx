import type { Metadata } from "next";
import PlaceDetail from "@/views/lifestyle/PlaceDetail";
import { getExtendedCMSProvider } from "@/services/cms/extendedProvider";

const provider = getExtendedCMSProvider();

const typeLabels: Record<string, string> = {
  historical: "ऐतिहासिक",
  religious: "धार्मिक",
  recreational: "मनोरंजन",
  market: "बाज़ार",
  landmark: "लैंडमार्क",
  "food-hub": "फूड हब",
};

type PageParams = {
  slug: string;
};

export async function generateMetadata(
  props: { params: Promise<PageParams> }
): Promise<Metadata> {
  const { slug } = await props.params;
  const place = await provider.getFamousPlaceBySlug(slug);

  if (!place) {
    const title = "स्थान नहीं मिला | रामपुर";
    const description = "आपके द्वारा खोजा गया स्थान उपलब्ध नहीं है।";
    const canonical = "/food-lifestyle/places";

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

  const typeLabel = typeLabels[place.type] || "स्थान";
  const title = `${place.nameHindi} | ${typeLabel} स्थान रामपुर - घूमने की जगह`;
  const description = place.descriptionHindi;
  const canonical = `/food-lifestyle/places/${place.slug}`;
  const imageUrl = place.image || place.gallery?.[0];

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
              alt: place.nameHindi,
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

export default async function Page(props: { params: Promise<PageParams> }) {
  const { slug } = await props.params;
  const place = await provider.getFamousPlaceBySlug(slug);

  const schema = place
    ? {
        "@context": "https://schema.org",
        "@type": "TouristAttraction",
        name: place.nameHindi || place.name,
        description: place.descriptionHindi || place.description,
        image: [place.image, ...(place.gallery || [])].filter(Boolean),
        address: {
          "@type": "PostalAddress",
          streetAddress: place.addressHindi || place.address,
          addressLocality: place.city,
          addressRegion: place.district,
          addressCountry: "IN",
        },
      }
    : null;

  return (
    <>
      {schema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ) : null}
      <PlaceDetail />
    </>
  );
}
