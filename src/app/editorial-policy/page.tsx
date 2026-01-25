import type { Metadata } from "next";
import { EditorialPolicy } from "@/views/legal";

export const metadata: Metadata = {
  title: "संपादकीय नीति | रामपुर न्यूज़ - Editorial Policy",
  description:
    "रामपुर न्यूज़ की संपादकीय नीति - समाचार स्रोत मानक, तथ्य-जांच प्रक्रिया, संपादकीय स्वतंत्रता और सामग्री वर्गीकरण के बारे में जानें।",
  alternates: {
    canonical: "/editorial-policy",
  },
  openGraph: {
    type: "website",
    title: "संपादकीय नीति | रामपुर न्यूज़",
    description:
      "रामपुर न्यूज़ की संपादकीय नीति और पत्रकारिता मानकों के बारे में जानकारी।",
    url: "/editorial-policy",
    siteName: "रामपुर न्यूज़ | Rampur News",
  },
  twitter: {
    card: "summary",
    title: "संपादकीय नीति | रामपुर न्यूज़",
    description:
      "रामपुर न्यूज़ की संपादकीय नीति और पत्रकारिता मानकों के बारे में जानकारी।",
  },
};

export default function Page() {
  return <EditorialPolicy />;
}


