import type { Metadata } from "next";
import RestaurantsPage from "@/views/lifestyle/Restaurants";

export const revalidate = 3600; // 1 hour ISR

export const metadata: Metadata = {
  title: "बेस्ट रेस्तरां और खाने की जगहें रामपुर बरेली मुरादाबाद 2026 | रामपुर न्यूज़",
  description:
    "रामपुर, बरेली, मुरादाबाद, रुद्रपुर, हल्द्वानी के 100+ रेस्तरां, ढाबे, कैफे, मिठाई की दुकानें। मुगलई, पंजाबी, स्ट्रीट फूड - पते, रेटिंग, फोन नंबर।",
  alternates: {
    canonical: "https://rampurnews.com/food-lifestyle/restaurants",
  },
  openGraph: {
    type: "website",
    title: "बेस्ट रेस्तरां - रामपुर, बरेली, मुरादाबाद, रुद्रपुर, हल्द्वानी 2026",
    description:
      "100+ रेस्तरां, कैफे, ढाबे और मिठाई की दुकानों की पूरी जानकारी। Zaika Darbar, Karim's, Arun Sweets और अधिक।",
    url: "https://rampurnews.com/food-lifestyle/restaurants",
    siteName: "रामपुर न्यूज़ | Rampur News",
  },
  twitter: {
    card: "summary_large_image",
    title: "रेस्तरां डायरेक्टरी 2026 - रामपुर, बरेली, मुरादाबाद | रामपुर न्यूज़",
    description:
      "रामपुर, बरेली, मुरादाबाद, रुद्रपुर, हल्द्वानी के 100+ रेस्तरां और खाने की जगहें।",
  },
};

export default function Page() {
  return <RestaurantsPage />;
}


