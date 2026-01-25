import type { Metadata } from "next";
import PlacesPage from "@/views/lifestyle/PlacesPage";

export const metadata: Metadata = {
  title:
    "रामपुर के प्रसिद्ध स्थान - ऐतिहासिक, धार्मिक और दर्शनीय स्थल | रामपुर न्यूज़",
  description:
    "रामपुर के सभी प्रसिद्ध स्थान - रज़ा पुस्तकालय, जामा मस्जिद, ऐतिहासिक इमारतें और दर्शनीय स्थलों की पूरी जानकारी।",
  alternates: {
    canonical: "/food-lifestyle/places",
  },
  openGraph: {
    type: "website",
    title:
      "रामपुर के प्रसिद्ध स्थान - ऐतिहासिक, धार्मिक और दर्शनीय स्थल | रामपुर न्यूज़",
    description:
      "रामपुर के सभी प्रसिद्ध स्थान - रज़ा पुस्तकालय, जामा मस्जिद, ऐतिहासिक इमारतें और दर्शनीय स्थलों की पूरी जानकारी।",
    url: "/food-lifestyle/places",
    siteName: "रामपुर न्यूज़ | Rampur News",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "रामपुर के प्रसिद्ध स्थान - ऐतिहासिक, धार्मिक और दर्शनीय स्थल | रामपुर न्यूज़",
    description:
      "रामपुर के सभी प्रसिद्ध स्थान - रज़ा पुस्तकालय, जामा मस्जिद, ऐतिहासिक इमारतें और दर्शनीय स्थलों की पूरी जानकारी।",
  },
};

export default function Page() {
  return <PlacesPage />;
}


