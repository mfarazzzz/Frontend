import type { Metadata } from "next";
import { TermsConditions } from "@/views/legal";

export const metadata: Metadata = {
  title: "नियम और शर्तें | रामपुर न्यूज़ - Terms & Conditions",
  description:
    "रामपुर न्यूज़ की उपयोग की शर्तें - सामग्री उपयोग, उपयोगकर्ता जिम्मेदारियां, दायित्व सीमाएं और शासी कानून।",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    type: "website",
    title: "नियम और शर्तें | रामपुर न्यूज़",
    description: "रामपुर न्यूज़ वेबसाइट के उपयोग की शर्तें और नियम।",
    url: "/terms",
    siteName: "रामपुर न्यूज़ | Rampur News",
  },
  twitter: {
    card: "summary",
    title: "नियम और शर्तें | रामपुर न्यूज़",
    description: "रामपुर न्यूज़ वेबसाइट के उपयोग की शर्तें और नियम।",
  },
};

export default function Page() {
  return <TermsConditions />;
}


