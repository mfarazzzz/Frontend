import type { Metadata } from "next";
import { AboutUs } from "@/views/legal";

export const metadata: Metadata = {
  title: "हमारे बारे में | रामपुर न्यूज़",
  description: "रामपुर न्यूज़ का परिचय, मिशन और दृष्टि।",
  alternates: {
    canonical: "/about-us",
  },
  openGraph: {
    type: "website",
    title: "हमारे बारे में | रामपुर न्यूज़",
    description: "रामपुर न्यूज़ का परिचय, मिशन और दृष्टि।",
    url: "/about-us",
    siteName: "रामपुर न्यूज़ | Rampur News",
  },
  twitter: {
    card: "summary_large_image",
    title: "हमारे बारे में | रामपुर न्यूज़",
    description: "रामपुर न्यूज़ का परिचय, मिशन और दृष्टि।",
  },
};

export default function Page() {
  return <AboutUs />;
}

