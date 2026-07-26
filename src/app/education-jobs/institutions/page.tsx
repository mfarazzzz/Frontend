import type { Metadata } from "next";
import InstitutionsPage from "@/views/education/Institutions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "कॉलेज, स्कूल और संस्थान डायरेक्टरी रामपुर बरेली मुरादाबाद 2026 | रामपुर न्यूज़",
  description:
    "रामपुर, बरेली, मुरादाबाद, रुद्रपुर और हल्द्वानी के 250+ कॉलेज, स्कूल, यूनिवर्सिटी, कोचिंग और ITI की पूरी जानकारी। एड्रेस, कोर्स, फीस, सुविधाएं और संपर्क।",
  alternates: {
    canonical: "https://rampurnews.com/education-jobs/institutions",
  },
  openGraph: {
    type: "website",
    title: "कॉलेज, स्कूल और संस्थान डायरेक्टरी - रामपुर, बरेली, मुरादाबाद, रुद्रपुर, हल्द्वानी",
    description:
      "रामपुर, बरेली, मुरादाबाद, रुद्रपुर और हल्द्वानी के 250+ शैक्षणिक संस्थानों की पूरी जानकारी।",
    url: "https://rampurnews.com/education-jobs/institutions",
    siteName: "रामपुर न्यूज़ | Rampur News",
  },
  twitter: {
    card: "summary_large_image",
    title: "कॉलेज, स्कूल और संस्थान डायरेक्टरी 2026 | रामपुर न्यूज़",
    description:
      "रामपुर, बरेली, मुरादाबाद, रुद्रपुर और हल्द्वानी के 250+ कॉलेज, स्कूल, कोचिंग की जानकारी।",
  },
};

export default function Page() {
  return <InstitutionsPage />;
}


