import type { Metadata } from "next";
import { Disclaimer } from "@/views/legal";

export const metadata: Metadata = {
  title: "अस्वीकरण | रामपुर न्यूज़ - Disclaimer",
  description:
    "रामपुर न्यूज़ का अस्वीकरण - समाचार सटीकता, बाहरी लिंक, राय और विचार, तथा पेशेवर सलाह के बारे में महत्वपूर्ण जानकारी।",
  alternates: {
    canonical: "/disclaimer",
  },
  openGraph: {
    type: "website",
    title: "अस्वीकरण | रामपुर न्यूज़",
    description: "रामपुर न्यूज़ की सामग्री के बारे में महत्वपूर्ण अस्वीकरण।",
    url: "/disclaimer",
    siteName: "रामपुर न्यूज़ | Rampur News",
  },
  twitter: {
    card: "summary",
    title: "अस्वीकरण | रामपुर न्यूज़",
    description: "रामपुर न्यूज़ की सामग्री के बारे में महत्वपूर्ण अस्वीकरण।",
  },
};

export default function Page() {
  return <Disclaimer />;
}


