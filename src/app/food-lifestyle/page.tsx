import type { Metadata } from "next";
import LifestyleHub from "@/views/lifestyle/LifestyleHub";

export const metadata: Metadata = {
  title: "खान-पान और लाइफस्टाइल - रेस्तरां, शॉपिंग, इवेंट्स | रामपुर न्यूज़",
  description:
    "रामपुर के बेहतरीन रेस्तरां, फैशन स्टोर, शॉपिंग मॉल, प्रसिद्ध स्थान और आगामी इवेंट्स की पूरी जानकारी।",
  alternates: {
    canonical: "https://rampurnews.com/food-lifestyle",
  },
  openGraph: {
    type: "website",
    title: "खान-पान और लाइफस्टाइल - रेस्तरां, शॉपिंग, इवेंट्स | रामपुर न्यूज़",
    description:
      "रामपुर के बेहतरीन रेस्तरां, फैशन स्टोर, शॉपिंग मॉल, प्रसिद्ध स्थान और आगामी इवेंट्स की पूरी जानकारी।",
    url: "https://rampurnews.com/food-lifestyle",
    siteName: "रामपुर न्यूज़ | Rampur News",
  },
  twitter: {
    card: "summary_large_image",
    title: "खान-पान और लाइफस्टाइल - रेस्तरां, शॉपिंग, इवेंट्स | रामपुर न्यूज़",
    description:
      "रामपुर के बेहतरीन रेस्तरां, फैशन स्टोर, शॉपिंग मॉल, प्रसिद्ध स्थान और आगामी इवेंट्स की पूरी जानकारी।",
  },
};

export const revalidate = 30;

export default function Page() {
  return <LifestyleHub />;
}


