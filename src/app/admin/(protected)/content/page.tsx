import type { Metadata } from "next";
import ContentManager from "@/views/admin/ContentManager";

export const metadata: Metadata = {
  title: "कंटेंट मैनेजर | रामपुर न्यूज़ CMS",
  description: "रामपुर न्यूज़ CMS में समाचार, शिक्षा और लाइफस्टाइल से जुड़ी सभी सामग्री प्रबंधित करें।",
  alternates: {
    canonical: "/admin/content",
  },
  openGraph: {
    type: "website",
    title: "कंटेंट मैनेजर | रामपुर न्यूज़ CMS",
    description: "रामपुर न्यूज़ के लिए समाचार, शिक्षा और लाइफस्टाइल कंटेंट प्रबंधन डैशबोर्ड।",
    url: "/admin/content",
  },
  twitter: {
    card: "summary_large_image",
    title: "कंटेंट मैनेजर | रामपुर न्यूज़ CMS",
    description: "रामपुर न्यूज़ CMS में सभी मॉड्यूल की सामग्री को प्रबंधित करें।",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function ContentPage() {
  return <ContentManager />;
}

