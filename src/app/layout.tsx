import type { Metadata } from "next";
import Script from "next/script";
import { Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { GA4Analytics } from "./analytics";

// Read from env — set NEXT_PUBLIC_GA_MEASUREMENT_ID in .env.local
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari", "latin"],
  weight: ["400", "600", "700"],
  variable: "--font-noto-sans-devanagari",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
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
    robots: "max-image-preview:large",
  },
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": [
        { url: "/rss.xml", title: "Rampur News RSS" },
        { url: "/feed.xml", title: "Rampur News Feed" },
      ],
      "application/atom+xml": [{ url: "/atom.xml", title: "Rampur News Atom" }],
    },
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
        url: "https://rampurnews.com/og-image.png",
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
    images: ["https://rampurnews.com/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/logo.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/logo.png", sizes: "180x180", type: "image/png" },
    ],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION_TOKEN,
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "NewsMediaOrganization",
  "@id": "https://rampurnews.com/#organization",
  name: "रामपुर न्यूज़ | Rampur News",
  alternateName: ["Rampur News", "रामपुर न्यूज़", "RampurNews"],
  url: "https://rampurnews.com",
  logo: {
    "@type": "ImageObject",
    url: "https://rampurnews.com/logo.png",
    width: 768,
    height: 768,
  },
  sameAs: [
    "https://www.facebook.com/profile.php?id=61586930678729",
    "https://twitter.com/RampurNews",
    "https://www.instagram.com/rampurnewsdotcom",
    "https://www.youtube.com/@rampurnewsdotcom",
    "https://whatsapp.com/channel/0029Vb7TEPsLI8Yg4gbsqe3O",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    areaServed: "IN",
    availableLanguage: ["Hindi", "English"],
  },
  foundingDate: "2024",
  description: "रामपुर और रोहिलखंड क्षेत्र (मुरादाबाद, बरेली, अमरोहा, संभल, बिजनौर, पीलीभीत, शाहजहाँपुर, बदायूं) की ताज़ा, विश्वसनीय हिंदी खबरें।",
  areaServed: [
    { "@type": "City", name: "Rampur, Uttar Pradesh" },
    { "@type": "City", name: "Moradabad, Uttar Pradesh" },
    { "@type": "City", name: "Bareilly, Uttar Pradesh" },
    { "@type": "City", name: "Amroha, Uttar Pradesh" },
    { "@type": "City", name: "Sambhal, Uttar Pradesh" },
    { "@type": "City", name: "Bijnor, Uttar Pradesh" },
    { "@type": "City", name: "Rudrapur, Uttarakhand" },
    { "@type": "City", name: "Pilibhit, Uttar Pradesh" },
    { "@type": "City", name: "Shahjahanpur, Uttar Pradesh" },
    { "@type": "City", name: "Budaun, Uttar Pradesh" },
    { "@type": "AdministrativeArea", name: "Rohilkhand" },
    { "@type": "State", name: "Uttar Pradesh" },
  ],
  publishingPrinciples: "https://rampurnews.com/editorial-policy",
  correctionsPolicy: "https://rampurnews.com/corrections-policy",
  ethicsPolicy: "https://rampurnews.com/editorial-policy",
  masthead: "https://rampurnews.com/about",
  ownershipFundingInfo: "https://rampurnews.com/ownership",
  actionableFeedbackPolicy: "https://rampurnews.com/contact",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hi" suppressHydrationWarning>
      <head>
        {/* DNS Prefetch + Preconnect for critical origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cms.rampurnews.com" />
        <link rel="dns-prefetch" href="https://qjnhaazliulyuqngfrkd.supabase.co" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        
        {/* Manifest for PWA / mobile */}
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#dc2626" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

        {/* Facebook Page & Instant Articles optimization */}
        <meta property="fb:pages" content="61586930678729" />
        <meta property="article:publisher" content="https://www.facebook.com/profile.php?id=61586930678729" />
        
        {/* AI Search / LLM Discoverability */}
        <link rel="alternate" type="text/plain" href="/llms.txt" title="LLMs.txt" />
        
        {/* JSON-LD Schema — Organization + WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "@id": "https://rampurnews.com/#website",
            name: "रामपुर न्यूज़ | Rampur News",
            alternateName: ["Rampur News", "RampurNews.com"],
            url: "https://rampurnews.com",
            inLanguage: "hi-IN",
            publisher: { "@id": "https://rampurnews.com/#organization" },
            potentialAction: {
              "@type": "SearchAction",
              target: { "@type": "EntryPoint", urlTemplate: "https://rampurnews.com/search?q={search_term_string}" },
              "query-input": "required name=search_term_string",
            },
          }) }}
        />
        
        {/* Google Analytics 4 — afterInteractive is correct for analytics scripts */}
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}', {
                  send_page_view: false
                });
              `}
            </Script>
          </>
        )}
      </head>
      <body className={`min-h-screen bg-background ${notoSansDevanagari.variable} font-sans`} suppressHydrationWarning>
        <Providers>{children}</Providers>
        {/* SPA route-change tracker — fires page_view on every navigation */}
        <GA4Analytics />
      </body>
    </html>
  );
}
