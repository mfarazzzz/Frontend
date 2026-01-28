import Index from "@/views/Index";
import type { Metadata } from "next";
import { getCMSProvider } from "@/services/cms";

export const metadata: Metadata = {
  title: "रामपुर की ताज़ा खबरें | रामपुर न्यूज़ | Rampur News",
  description: "रामपुर न्यूज़ - रामपुर जिले और उत्तर प्रदेश की ताज़ा, विश्वसनीय खबरें। राजनीति, अपराध, शिक्षा, खेल, मनोरंजन और स्थानीय समाचार।",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    title: "रामपुर की ताज़ा खबरें | रामपुर न्यूज़ | Rampur News",
    description: "रामपुर न्यूज़ - रामपुर जिले और उत्तर प्रदेश की ताज़ा, विश्वसनीय खबरें। राजनीति, अपराध, शिक्षा, खेल, मनोरंजन और स्थानीय समाचार。",
    siteName: "रामपुर न्यूज़ | Rampur News",
    images: [
      {
        url: "https://rampurnews.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Rampur News",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@RampurNews",
    creator: "@RampurNews",
  },
};

export default async function Page() {
  const siteUrl = "https://rampurnews.com";
  const siteName = "रामपुर न्यूज़ | Rampur News";

  // Pre-fetch critical LCP data (Featured Articles)
  const featuredArticles = await getCMSProvider().getFeaturedArticles(3).catch(() => []);
  
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    alternateName: ["Rampur News", "रामपुर न्यूज़", "RampurNews.com"],
    url: siteUrl,
    description: "रामपुर न्यूज़ - रामपुर जिले और उत्तर प्रदेश की ताज़ा, विश्वसनीय खबरें। Breaking News, Local Updates, Education, Sports, Entertainment.",
    inLanguage: "hi-IN",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    publisher: {
      "@type": "Organization",
      name: siteName,
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo.png`,
        width: 768,
        height: 768,
      },
    },
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    "@id": `${siteUrl}/#organization`,
    name: siteName,
    alternateName: "Rampur News",
    url: siteUrl,
    logo: {
      "@type": "ImageObject",
      url: `${siteUrl}/logo.png`,
      width: 768,
      height: 768,
    },
    sameAs: [
      "https://www.facebook.com/profile.php?id=61586930678729",
      "https://twitter.com/RampurNews",
      "https://instagram.com/RampurNews",
      "https://www.youtube.com/@rampurnewsdotcom",
      "https://whatsapp.com/channel/0029Vb7TEPsLI8Yg4gbsqe3O",
      "https://t.me/rampurnewsofficial",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      areaServed: "IN",
      availableLanguage: ["Hindi", "English"],
    },
    foundingDate: "2024-01-01",
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "रामपुर न्यूज़ क्या है?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "रामपुर न्यूज़ उत्तर प्रदेश के रामपुर जिले की प्रमुख हिंदी समाचार वेबसाइट है। यहां आपको ताज़ा खबरें, स्थानीय समाचार, शिक्षा, खेल, मनोरंजन और व्यापार की जानकारी मिलती है।",
        },
      },
      {
        "@type": "Question",
        name: "रामपुर की ताज़ा खबरें कहां पढ़ें?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "रामपुर की ताज़ा खबरें RampurNews.com पर पढ़ें। हम 24/7 ब्रेकिंग न्यूज़, स्थानीय समाचार, और जिले की हर महत्वपूर्ण खबर प्रदान करते हैं।",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Index initialFeaturedArticles={featuredArticles} />
    </>
  );
}


