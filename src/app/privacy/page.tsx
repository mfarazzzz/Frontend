import type { Metadata } from "next";
import { PrivacyPolicy } from "@/views/legal";

export const metadata: Metadata = {
  title: "गोपनीयता नीति | रामपुर न्यूज़ - Privacy Policy",
  description:
    "रामपुर न्यूज़ की गोपनीयता नीति - डेटा संग्रह, कुकीज़, तृतीय-पक्ष सेवाएं और उपयोगकर्ता अधिकारों के बारे में जानकारी।",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    type: "website",
    title: "गोपनीयता नीति | रामपुर न्यूज़",
    description:
      "रामपुर न्यूज़ आपकी गोपनीयता का सम्मान करता है। जानें हम आपके डेटा को कैसे संभालते हैं।",
    url: "/privacy",
    siteName: "रामपुर न्यूज़ | Rampur News",
  },
  twitter: {
    card: "summary",
    title: "गोपनीयता नीति | रामपुर न्यूज़",
    description:
      "रामपुर न्यूज़ आपकी गोपनीयता का सम्मान करता है। जानें हम आपके डेटा को कैसे संभालते हैं।",
  },
};

export default function Page() {
  return <PrivacyPolicy />;
}


