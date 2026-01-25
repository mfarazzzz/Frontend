import type { Metadata } from "next";
import { CorrectionsPolicy } from "@/views/legal";

export const metadata: Metadata = {
  title: "सुधार नीति | रामपुर न्यूज़ - Corrections Policy",
  description:
    "रामपुर न्यूज़ की सुधार नीति - त्रुटियों की रिपोर्टिंग, सुधार प्रकाशन प्रक्रिया और पारदर्शिता प्रतिबद्धता के बारे में जानें।",
  alternates: {
    canonical: "/corrections-policy",
  },
  openGraph: {
    type: "website",
    title: "सुधार नीति | रामपुर न्यूज़",
    description:
      "रामपुर न्यूज़ गलतियों को स्वीकार करता है और उन्हें पारदर्शी तरीके से सुधारता है।",
    url: "/corrections-policy",
    siteName: "रामपुर न्यूज़ | Rampur News",
  },
  twitter: {
    card: "summary",
    title: "सुधार नीति | रामपुर न्यूज़",
    description:
      "रामपुर न्यूज़ गलतियों को स्वीकार करता है और उन्हें पारदर्शी तरीके से सुधारता है।",
  },
};

export default function Page() {
  return <CorrectionsPolicy />;
}


