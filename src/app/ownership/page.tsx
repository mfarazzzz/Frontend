import type { Metadata } from "next";
import { OwnershipDisclosure } from "@/views/legal";

export const metadata: Metadata = {
  title: "स्वामित्व और वित्तीय प्रकटीकरण | रामपुर न्यूज़",
  description:
    "रामपुर न्यूज़ का स्वामित्व और वित्तीय प्रकटीकरण - स्वामित्व विवरण, राजस्व स्रोत, और संपादकीय स्वतंत्रता के बारे में पूरी जानकारी।",
  alternates: {
    canonical: "/ownership",
  },
  openGraph: {
    type: "website",
    title: "स्वामित्व और वित्तीय प्रकटीकरण | रामपुर न्यूज़",
    description:
      "रामपुर न्यूज़ की स्वामित्व संरचना और वित्तीय पारदर्शिता।",
    url: "/ownership",
    siteName: "रामपुर न्यूज़ | Rampur News",
  },
  twitter: {
    card: "summary",
    title: "स्वामित्व और वित्तीय प्रकटीकरण | रामपुर न्यूज़",
    description:
      "रामपुर न्यूज़ की स्वामित्व संरचना और वित्तीय पारदर्शिता।",
  },
};

export default function Page() {
  return <OwnershipDisclosure />;
}


