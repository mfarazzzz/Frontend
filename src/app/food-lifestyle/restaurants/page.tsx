import type { Metadata } from "next";
import RestaurantsPage from "@/views/lifestyle/Restaurants";

export const metadata: Metadata = {
  title: "रामपुर के बेहतरीन रेस्तरां और खाने की जगहें | रामपुर न्यूज़",
  description:
    "रामपुर के सभी प्रसिद्ध रेस्तरां, ढाबे, मिठाई की दुकानें और स्ट्रीट फूड की पूरी जानकारी। पते, फोन नंबर, रेटिंग और विशेषताएं।",
  alternates: {
    canonical: "/food-lifestyle/restaurants",
  },
  openGraph: {
    type: "website",
    title: "रामपुर के बेहतरीन रेस्तरां और खाने की जगहें | रामपुर न्यूज़",
    description:
      "रामपुर के सभी प्रसिद्ध रेस्तरां, ढाबे, मिठाई की दुकानें और स्ट्रीट फूड की पूरी जानकारी। पते, फोन नंबर, रेटिंग और विशेषताएं।",
    url: "/food-lifestyle/restaurants",
    siteName: "रामपुर न्यूज़ | Rampur News",
  },
  twitter: {
    card: "summary_large_image",
    title: "रामपुर के बेहतरीन रेस्तरां और खाने की जगहें | रामपुर न्यूज़",
    description:
      "रामपुर के सभी प्रसिद्ध रेस्तरां, ढाबे, मिठाई की दुकानें और स्ट्रीट फूड की पूरी जानकारी। पते, फोन नंबर, रेटिंग और विशेषताएं।",
  },
};

export default function Page() {
  return <RestaurantsPage />;
}


