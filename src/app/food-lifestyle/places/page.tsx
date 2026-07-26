import type { Metadata } from "next";
import PlacesPage from "@/views/lifestyle/PlacesPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "प्रसिद्ध स्थान और दर्शनीय स्थल - रामपुर बरेली मुरादाबाद 2026 | रामपुर न्यूज़",
  description:
    "रामपुर, बरेली, मुरादाबाद, रुद्रपुर, हल्द्वानी के 50+ ऐतिहासिक, धार्मिक और दर्शनीय स्थल। रज़ा लाइब्रेरी, कोठी ख़ास बाग़, दरगाह-ए-आला हज़रत, गौतम बुद्ध पार्क।",
  alternates: {
    canonical: "https://rampurnews.com/food-lifestyle/places",
  },
  openGraph: {
    type: "website",
    title: "प्रसिद्ध स्थान - रामपुर, बरेली, मुरादाबाद, रुद्रपुर, हल्द्वानी",
    description:
      "50+ ऐतिहासिक, धार्मिक और प्राकृतिक स्थलों की जानकारी - समय, प्रवेश शुल्क, इतिहास।",
    url: "https://rampurnews.com/food-lifestyle/places",
    siteName: "रामपुर न्यूज़ | Rampur News",
  },
  twitter: {
    card: "summary_large_image",
    title: "प्रसिद्ध स्थान डायरेक्टरी 2026 | रामपुर न्यूज़",
    description:
      "रामपुर, बरेली, मुरादाबाद, रुद्रपुर, हल्द्वानी के ऐतिहासिक और दर्शनीय स्थल।",
  },
};

export default function Page() {
  return <PlacesPage />;
}


