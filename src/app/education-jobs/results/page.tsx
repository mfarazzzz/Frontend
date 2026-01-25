import type { Metadata } from "next";
import ResultCalendarPage from "@/views/education/ResultCalendar";

export const metadata: Metadata = {
  title: "रिजल्ट कैलेंडर 2026 | बोर्ड और प्रतियोगी परिणाम - रामपुर न्यूज़",
  description:
    "बोर्ड परीक्षा, सरकारी भर्ती और प्रतियोगी परीक्षाओं के परिणामों की तिथियां और अपडेट। रिजल्ट कैलेंडर 2026 - रामपुर न्यूज़।",
  alternates: {
    canonical: "/education-jobs/results",
  },
  openGraph: {
    type: "website",
    title: "रिजल्ट कैलेंडर 2026 | बोर्ड और प्रतियोगी परिणाम - रामपुर न्यूज़",
    description:
      "बोर्ड परीक्षा, सरकारी भर्ती और प्रतियोगी परीक्षाओं के परिणामों की तिथियां और अपडेट। रिजल्ट कैलेंडर 2026 - रामपुर न्यूज़।",
    url: "/education-jobs/results",
  },
  twitter: {
    card: "summary_large_image",
    title: "रिजल्ट कैलेंडर 2026 | बोर्ड और प्रतियोगी परिणाम - रामपुर न्यूज़",
    description:
      "बोर्ड परीक्षा, सरकारी भर्ती और प्रतियोगी परीक्षाओं के परिणामों की तिथियां और अपडेट। रिजल्ट कैलेंडर 2026 - रामपुर न्यूज़।",
  },
};

export default function Page() {
  return <ResultCalendarPage />;
}


