import type { Metadata } from "next";
import ShoppingPage from "@/views/lifestyle/Shopping";

export const revalidate = 3600; // 1 hour ISR

export const metadata: Metadata = {
  title: "शॉपिंग मॉल, बाज़ार और मार्केट - रामपुर बरेली मुरादाबाद 2026 | रामपुर न्यूज़",
  description:
    "रामपुर, बरेली, मुरादाबाद, रुद्रपुर और हल्द्वानी के 80+ शॉपिंग मॉल, बाज़ार, मार्केट और प्लाज़ा। पते, समय, सुविधाएं और पार्किंग जानकारी।",
  alternates: {
    canonical: "https://rampurnews.com/food-lifestyle/shopping",
  },
  openGraph: {
    type: "website",
    title: "शॉपिंग मॉल, बाज़ार और मार्केट - रामपुर, बरेली, मुरादाबाद, रुद्रपुर, हल्द्वानी",
    description:
      "80+ शॉपिंग मॉल, बाज़ार और मार्केट की पूरी जानकारी। Wave Mall, Walkway Mall, JAGS City Mall और Butler Plaza।",
    url: "https://rampurnews.com/food-lifestyle/shopping",
    siteName: "रामपुर न्यूज़ | Rampur News",
  },
  twitter: {
    card: "summary_large_image",
    title: "शॉपिंग मॉल और बाज़ार डायरेक्टरी 2026 | रामपुर न्यूज़",
    description:
      "रामपुर, बरेली, मुरादाबाद, रुद्रपुर, हल्द्वानी के शॉपिंग मॉल, बाज़ार और मार्केट।",
  },
};

export default function Page() {
  return <ShoppingPage />;
}


