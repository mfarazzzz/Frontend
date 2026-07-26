import type { Metadata } from "next";
import FashionPage from "@/views/lifestyle/Fashion";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "फैशन स्टोर, कपड़े और ज्वेलरी शॉप - रामपुर बरेली मुरादाबाद 2026 | रामपुर न्यूज़",
  description:
    "रामपुर, बरेली, मुरादाबाद, रुद्रपुर, हल्द्वानी की 50+ फैशन दुकानें - Raymond, Tanishq, Bata, बुटीक और ज्वेलरी शॉप। पते, ब्रांड, रेटिंग।",
  alternates: {
    canonical: "https://rampurnews.com/food-lifestyle/fashion",
  },
  openGraph: {
    type: "website",
    title: "फैशन स्टोर डायरेक्टरी - रामपुर, बरेली, मुरादाबाद, रुद्रपुर, हल्द्वानी",
    description:
      "50+ ब्रांडेड शोरूम, ज्वेलरी शॉप, बुटीक और जूतों की दुकानों की जानकारी।",
    url: "https://rampurnews.com/food-lifestyle/fashion",
    siteName: "रामपुर न्यूज़ | Rampur News",
  },
  twitter: {
    card: "summary_large_image",
    title: "फैशन स्टोर डायरेक्टरी 2026 | रामपुर न्यूज़",
    description:
      "रामपुर, बरेली, मुरादाबाद, रुद्रपुर, हल्द्वानी की फैशन दुकानें और ब्रांडेड शोरूम।",
  },
};

export default function Page() {
  return <FashionPage />;
}


