import type { Metadata } from "next";
import { Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-noto-sans-devanagari",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://rampurnews.com"),
  title: "रामपुर न्यूज़ | Rampur News",
  description:
    "रामपुर और उत्तर प्रदेश की ताज़ा खबरें: स्थानीय, शिक्षा, खेल, मनोरंजन और अधिक।",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  other: {
    "googlebot-news": "index, follow",
    "ai-content-declaration": "human-written",
    "perplexity-indexable": "true",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "रामपुर न्यूज़ | Rampur News",
    title: "रामपुर न्यूज़ | Rampur News",
    description:
      "रामपुर और उत्तर प्रदेश की ताज़ा खबरें: स्थानीय, शिक्षा, खेल, मनोरंजन और अधिक।",
    url: "https://rampurnews.com/",
    locale: "hi_IN",
    images: [
      {
        url: "https://rampurnews.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "रामपुर न्यूज़ | Rampur News",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@RampurNews",
    creator: "@RampurNews",
    title: "रामपुर न्यूज़ | Rampur News",
    description:
      "रामपुर और उत्तर प्रदेश की ताज़ा खबरें: स्थानीय, शिक्षा, खेल, मनोरंजन और अधिक।",
    images: ["https://rampurnews.com/og-image.jpg"],
  },
  icons: {
    icon: "/logo.png",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "रामपुर न्यूज़ | Rampur News",
  url: "https://rampurnews.com",
  logo: "https://rampurnews.com/logo.png",
  sameAs: [
    "https://www.facebook.com/rampurnews",
    "https://twitter.com/RampurNews",
    "https://www.instagram.com/rampurnews"
  ],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+91-1234567890",
    contactType: "customer service",
    areaServed: "IN",
    availableLanguage: "Hindi"
  },
  foundingDate: "2020",
  description: "रामपुर और उत्तर प्रदेश की ताज़ा खबरें: स्थानीय, शिक्षा, खेल, मनोरंजन और अधिक।"
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "रामपुर न्यूज़ | Rampur News",
  url: "https://rampurnews.com",
  description: "रामपुर और उत्तर प्रदेश की ताज़ा खबरें: स्थानीय, शिक्षा, खेल, मनोरंजन और अधिक।",
  inLanguage: "hi-IN",
  publisher: {
    "@type": "Organization",
    name: "रामपुर न्यूज़ | Rampur News",
    logo: "https://rampurnews.com/logo.png"
  },
  potentialAction: {
    "@type": "SearchAction",
    target: "https://rampurnews.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hi" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className={`min-h-screen bg-background ${notoSansDevanagari.variable} font-sans`} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
