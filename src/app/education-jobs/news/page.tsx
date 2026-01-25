import type { Metadata } from "next";
import EducationNewsSection from "@/views/education/NewsSection";

export const metadata: Metadata = {
  title: "शिक्षा समाचार - परीक्षा अपडेट, छात्रवृत्ति, एडमिशन | रामपुर न्यूज़",
  description:
    "ताज़ा शिक्षा समाचार - यूपी बोर्ड, परीक्षा अपडेट, रिजल्ट न्यूज़, छात्रवृत्ति और एडमिशन की सभी जानकारी एक जगह।",
  alternates: {
    canonical: "/education-jobs/news",
  },
  openGraph: {
    type: "website",
    title: "शिक्षा समाचार - परीक्षा अपडेट, छात्रवृत्ति, एडमिशन | रामपुर न्यूज़",
    description:
      "ताज़ा शिक्षा समाचार - यूपी बोर्ड, परीक्षा अपडेट, रिजल्ट न्यूज़, छात्रवृत्ति और एडमिशन की सभी जानकारी एक जगह।",
    url: "/education-jobs/news",
  },
  twitter: {
    card: "summary_large_image",
    title: "शिक्षा समाचार - परीक्षा अपडेट, छात्रवृत्ति, एडमिशन | रामपुर न्यूज़",
    description:
      "ताज़ा शिक्षा समाचार - यूपी बोर्ड, परीक्षा अपडेट, रिजल्ट न्यूज़, छात्रवृत्ति और एडमिशन की सभी जानकारी एक जगह।",
  },
};

export default function Page() {
  return <EducationNewsSection />;
}


