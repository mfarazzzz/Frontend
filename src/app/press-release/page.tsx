import type { Metadata } from "next";
import { PressRelease } from "@/views/legal";

export const metadata: Metadata = {
  title: "Press Release | रामपुर न्यूज़",
  description: "रामपुर न्यूज़ के प्रेस रिलीज़ और मीडिया अपडेट्स।",
  alternates: {
    canonical: "/press-release",
  },
  openGraph: {
    type: "website",
    title: "Press Release | रामपुर न्यूज़",
    description: "रामपुर न्यूज़ के प्रेस रिलीज़ और मीडिया अपडेट्स।",
    url: "/press-release",
    siteName: "रामपुर न्यूज़ | Rampur News",
  },
  twitter: {
    card: "summary_large_image",
    title: "Press Release | रामपुर न्यूज़",
    description: "रामपुर न्यूज़ के प्रेस रिलीज़ और मीडिया अपडेट्स।",
  },
};

export default function Page() {
  return <PressRelease />;
}

