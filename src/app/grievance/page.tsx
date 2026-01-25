import type { Metadata } from "next";
import { GrievanceRedressal } from "@/views/legal";

export const metadata: Metadata = {
  title: "शिकायत निवारण नीति | रामपुर न्यूज़ - Grievance Redressal",
  description:
    "रामपुर न्यूज़ की शिकायत निवारण नीति - शिकायत अधिकारी, शिकायत प्रक्रिया, प्रतिक्रिया समयसीमा। भारतीय IT नियम 2021 के अनुसार।",
  alternates: {
    canonical: "/grievance",
  },
  openGraph: {
    type: "website",
    title: "शिकायत निवारण नीति | रामपुर न्यूज़",
    description: "रामपुर न्यूज़ की शिकायत निवारण तंत्र और प्रक्रिया।",
    url: "/grievance",
  },
  twitter: {
    card: "summary_large_image",
    title: "शिकायत निवारण नीति | रामपुर न्यूज़ - Grievance Redressal",
    description:
      "रामपुर न्यूज़ की शिकायत निवारण नीति - शिकायत अधिकारी, शिकायत प्रक्रिया, प्रतिक्रिया समयसीमा। भारतीय IT नियम 2021 के अनुसार।",
  },
};

export default function Page() {
  return <GrievanceRedressal />;
}


