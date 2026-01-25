import type { Metadata } from "next";
import { AboutUs } from "@/views/legal";

export const metadata: Metadata = {
  title: "हमारे बारे में | रामपुर न्यूज़ - Rampur News",
  description:
    "रामपुर न्यूज़ उत्तर प्रदेश के रामपुर जिले का प्रमुख डिजिटल समाचार पोर्टल है। हमारी टीम, मिशन और विज़न के बारे में जानें।",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    type: "website",
    title: "हमारे बारे में | रामपुर न्यूज़",
    description:
      "रामपुर न्यूज़ - रामपुर जिले का विश्वसनीय डिजिटल समाचार पोर्टल। स्थानीय पत्रकारिता के प्रति प्रतिबद्ध।",
    url: "/about",
    siteName: "रामपुर न्यूज़ | Rampur News",
  },
  twitter: {
    card: "summary",
    title: "हमारे बारे में | रामपुर न्यूज़",
    description:
      "रामपुर न्यूज़ - रामपुर जिले का विश्वसनीय डिजिटल समाचार पोर्टल। स्थानीय पत्रकारिता के प्रति प्रतिबद्ध।",
  },
};

export default function Page() {
  return <AboutUs />;
}


