import type { Metadata } from "next";
import FashionPage from "@/views/lifestyle/Fashion";

export const metadata: Metadata = {
  title: "रामपुर की बेहतरीन कपड़े और फैशन की दुकानें | रामपुर न्यूज़",
  description:
    "रामपुर की सभी प्रसिद्ध कपड़े की दुकानें, साड़ी एम्पोरियम, ब्रांडेड शोरूम और फैशन बुटीक की जानकारी। पते, फोन नंबर और विशेषताएं।",
  alternates: {
    canonical: "/food-lifestyle/fashion",
  },
  openGraph: {
    type: "website",
    title: "रामपुर की बेहतरीन कपड़े और फैशन की दुकानें | रामपुर न्यूज़",
    description:
      "रामपुर की सभी प्रसिद्ध कपड़े की दुकानें, साड़ी एम्पोरियम, ब्रांडेड शोरूम और फैशन बुटीक की जानकारी। पते, फोन नंबर और विशेषताएं।",
    url: "/food-lifestyle/fashion",
    siteName: "रामपुर न्यूज़ | Rampur News",
  },
  twitter: {
    card: "summary_large_image",
    title: "रामपुर की बेहतरीन कपड़े और फैशन की दुकानें | रामपुर न्यूज़",
    description:
      "रामपुर की सभी प्रसिद्ध कपड़े की दुकानें, साड़ी एम्पोरियम, ब्रांडेड शोरूम और फैशन बुटीक की जानकारी। पते, फोन नंबर और विशेषताएं।",
  },
};

export default function Page() {
  return <FashionPage />;
}


