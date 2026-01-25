import type { Metadata } from "next";
import ShoppingPage from "@/views/lifestyle/Shopping";

export const metadata: Metadata = {
  title: "रामपुर के शॉपिंग सेंटर, मॉल और प्रसिद्ध स्थान | रामपुर न्यूज़",
  description:
    "रामपुर के सभी शॉपिंग मॉल, बाजार, मार्केट और प्रसिद्ध ऐतिहासिक स्थानों की जानकारी। पते, समय और सुविधाएं।",
  alternates: {
    canonical: "/food-lifestyle/shopping",
  },
  openGraph: {
    type: "website",
    title: "रामपुर के शॉपिंग सेंटर, मॉल और प्रसिद्ध स्थान | रामपुर न्यूज़",
    description:
      "रामपुर के सभी शॉपिंग मॉल, बाजार, मार्केट और प्रसिद्ध ऐतिहासिक स्थानों की जानकारी। पते, समय और सुविधाएं।",
    url: "/food-lifestyle/shopping",
    siteName: "रामपुर न्यूज़ | Rampur News",
  },
  twitter: {
    card: "summary_large_image",
    title: "रामपुर के शॉपिंग सेंटर, मॉल और प्रसिद्ध स्थान | रामपुर न्यूज़",
    description:
      "रामपुर के सभी शॉपिंग मॉल, बाजार, मार्केट और प्रसिद्ध ऐतिहासिक स्थानों की जानकारी। पते, समय और सुविधाएं।",
  },
};

export default function Page() {
  return <ShoppingPage />;
}


