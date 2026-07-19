import type { Metadata } from "next";
import { CategoryPageServer } from "@/lib/categoryPage";

export const metadata: Metadata = {
  title: "करियर - शिक्षा एवं नौकरियां | रामपुर न्यूज़",
  description: "करियर गाइडेंस, नौकरी अपडेट, तैयारी टिप्स और उपयोगी जानकारी।",
  alternates: {
    canonical: "/education-jobs/career",
  },
  openGraph: {
    type: "website",
    title: "करियर - शिक्षा एवं नौकरियां | रामपुर न्यूज़",
    description: "करियर गाइडेंस, नौकरी अपडेट, तैयारी टिप्स और उपयोगी जानकारी।",
    url: "/education-jobs/career",
  },
  twitter: {
    card: "summary_large_image",
    title: "करियर - शिक्षा एवं नौकरियां | रामपुर न्यूज़",
    description: "करियर गाइडेंस, नौकरी अपडेट, तैयारी टिप्स और उपयोगी जानकारी।",
  },
};

export const revalidate = 30;

export default function Page() {
  return <CategoryPageServer categorySlug="career" />;
}
