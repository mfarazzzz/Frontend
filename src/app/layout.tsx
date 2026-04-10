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
      "application/rss+xml": [{ url: "/rss.xml", title: "Rampur News RSS" }],
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
    apple: "/logo.png",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION_TOKEN,
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "रामपुर न्यूज़ | Rampur News",
  url: "https://rampurnews.com",
  logo: {
    "@type": "ImageObject",
    url: "https://rampurnews.com/logo.png",
    width: 768,
    height: 768,
  },
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hi" suppressHydrationWarning>
      <head>
        {/* Preconnect to Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* JSON-LD Schema — Organization only. WebSite schema lives in page.tsx (homepage) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
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
