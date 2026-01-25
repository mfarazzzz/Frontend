import type { Metadata } from "next";
import EventsPage from "@/views/lifestyle/Events";

export const metadata: Metadata = {
  title: "रामपुर के आगामी कार्यक्रम और इवेंट्स | रामपुर न्यूज़",
  description:
    "रामपुर के सभी आगामी सांस्कृतिक, धार्मिक, खेल और मनोरंजन कार्यक्रमों की जानकारी। तारीख, समय, स्थान और टिकट की जानकारी।",
  alternates: {
    canonical: "/food-lifestyle/events",
  },
  openGraph: {
    type: "website",
    title: "रामपुर के आगामी कार्यक्रम और इवेंट्स | रामपुर न्यूज़",
    description:
      "रामपुर के सभी आगामी सांस्कृतिक, धार्मिक, खेल और मनोरंजन कार्यक्रमों की जानकारी। तारीख, समय, स्थान और टिकट की जानकारी。",
    url: "/food-lifestyle/events",
    siteName: "रामपुर न्यूज़ | Rampur News",
  },
  twitter: {
    card: "summary_large_image",
    title: "रामपुर के आगामी कार्यक्रम और इवेंट्स | रामपुर न्यूज़",
    description:
      "रामपुर के सभी आगामी सांस्कृतिक, धार्मिक, खेल और मनोरंजन कार्यक्रमों की जानकारी। तारीख, समय, स्थान और टिकट की जानकारी।",
  },
};

export default function Page() {
  return <EventsPage />;
}


