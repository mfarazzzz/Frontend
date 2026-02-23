import type { Metadata } from "next";
import { OwnershipDisclosure } from "@/views/legal";

export const metadata: Metadata = {
  title: "Ownership Disclosure | रामपुर न्यूज़",
  description: "रामपुर न्यूज़ का स्वामित्व और वित्तीय प्रकटीकरण।",
  alternates: {
    canonical: "/ownership-disclosure",
  },
  openGraph: {
    type: "website",
    title: "Ownership Disclosure | रामपुर न्यूज़",
    description: "रामपुर न्यूज़ का स्वामित्व और वित्तीय प्रकटीकरण।",
    url: "/ownership-disclosure",
    siteName: "रामपुर न्यूज़ | Rampur News",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ownership Disclosure | रामपुर न्यूज़",
    description: "रामपुर न्यूज़ का स्वामित्व और वित्तीय प्रकटीकरण।",
  },
};

export default function Page() {
  return <OwnershipDisclosure />;
}

