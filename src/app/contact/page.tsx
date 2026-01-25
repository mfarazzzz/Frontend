import type { Metadata } from "next";
import { ContactUs } from "@/views/legal";

export const metadata: Metadata = {
  title: "संपर्क करें | रामपुर न्यूज़ - Contact Us",
  description:
    "रामपुर न्यूज़ से संपर्क करें - कार्यालय पता, फ़ोन नंबर, ईमेल और संपर्क फ़ॉर्म। हम आपकी सहायता के लिए उपलब्ध हैं।",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    type: "website",
    title: "संपर्क करें | रामपुर न्यूज़",
    description:
      "रामपुर न्यूज़ से संपर्क करें। हम आपकी सहायता के लिए उपलब्ध हैं।",
    url: "/contact",
    siteName: "रामपुर न्यूज़ | Rampur News",
  },
  twitter: {
    card: "summary",
    title: "संपर्क करें | रामपुर न्यूज़",
    description:
      "रामपुर न्यूज़ से संपर्क करें। हम आपकी सहायता के लिए उपलब्ध हैं।",
  },
};

export default function Page() {
  return <ContactUs />;
}


