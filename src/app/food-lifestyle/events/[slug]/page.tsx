import type { Metadata } from "next";
import EventDetail from "@/views/lifestyle/EventDetail";
import { getExtendedCMSProvider } from "@/services/cms/extendedProvider";

const provider = getExtendedCMSProvider();

const categoryLabels: Record<string, string> = {
  cultural: "सांस्कृतिक",
  religious: "धार्मिक",
  sports: "खेल",
  educational: "शैक्षिक",
  business: "व्यापार",
  entertainment: "मनोरंजन",
  food: "खाना",
  fashion: "फैशन",
};

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await props.params;
  const event = await provider.getEventBySlug(slug);

  if (!event) {
    const title = "इवेंट नहीं मिला | कार्यक्रम रामपुर";
    const description = "आपके द्वारा खोजा गया कार्यक्रम उपलब्ध नहीं है।";
    const canonical = "/food-lifestyle/events";

    return {
      title,
      description,
      alternates: {
        canonical,
      },
      openGraph: {
        title,
        description,
        url: canonical,
        type: "website",
      },
      twitter: {
        card: "summary",
        title,
        description,
      },
    };
  }

  const categoryLabel = categoryLabels[event.category] || "कार्यक्रम";
  const title = `${event.titleHindi} | ${categoryLabel} कार्यक्रम रामपुर`;
  const description = event.descriptionHindi;
  const canonical = `/food-lifestyle/events/${event.slug}`;
  const imageUrl = event.image;

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
              alt: event.titleHindi,
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

export default async function Page(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const event = await provider.getEventBySlug(slug);

  const statusMap: Record<string, string> = {
    upcoming: "https://schema.org/EventScheduled",
    ongoing: "https://schema.org/EventScheduled",
    completed: "https://schema.org/EventCompleted",
    cancelled: "https://schema.org/EventCancelled",
  };

  const schema = event
    ? {
        "@context": "https://schema.org",
        "@type": "Event",
        name: event.titleHindi || event.title,
        description: event.descriptionHindi || event.description,
        startDate: event.date,
        endDate: event.endDate,
        eventStatus: statusMap[event.status] || "https://schema.org/EventScheduled",
        image: event.image ? [event.image] : undefined,
        location: {
          "@type": "Place",
          name: event.venueHindi || event.venue,
          address: {
            "@type": "PostalAddress",
            streetAddress: event.address,
            addressLocality: event.city,
            addressRegion: event.district,
            addressCountry: "IN",
          },
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
      <EventDetail />
    </>
  );
}
