import type { Metadata } from "next";
import ExamCalendarPage from "@/views/education/ExamCalendar";

export const metadata: Metadata = {
  title: "परीक्षा कैलेंडर 2026 | शिक्षा और नौकरियां - रामपुर न्यूज़",
  description:
    "यूपी बोर्ड, सरकारी नौकरी और प्रतियोगी परीक्षाओं की तारीखें। परीक्षा कैलेंडर 2026 - रामपुर न्यूज़।",
  alternates: {
    canonical: "/education-jobs/exams",
  },
  openGraph: {
    type: "website",
    title: "परीक्षा कैलेंडर 2026 | शिक्षा और नौकरियां - रामपुर न्यूज़",
    description:
      "यूपी बोर्ड, सरकारी नौकरी और प्रतियोगी परीक्षाओं की तारीखें। परीक्षा कैलेंडर 2026 - रामपुर न्यूज़।",
    url: "/education-jobs/exams",
  },
  twitter: {
    card: "summary_large_image",
    title: "परीक्षा कैलेंडर 2026 | शिक्षा और नौकरियां - रामपुर न्यूज़",
    description:
      "यूपी बोर्ड, सरकारी नौकरी और प्रतियोगी परीक्षाओं की तारीखें। परीक्षा कैलेंडर 2026 - रामपुर न्यूज़।",
  },
};

export default function Page() {
  return <ExamCalendarPage />;
}


