import type { Metadata } from "next";
import HolidaysCalendarPage from "@/views/culture/HolidaysCalendar";

export const metadata: Metadata = {
  title: "छुट्टियों का कैलेंडर 2026 | धार्मिक त्योहार और राष्ट्रीय अवकाश - रामपुर न्यूज़",
  description:
    "2026 के सभी धार्मिक त्योहार, राष्ट्रीय अवकाश और सार्वजनिक छुट्टियों की पूरी सूची। होली, दिवाली, ईद, क्रिसमस और अन्य महत्वपूर्ण त्योहारों की तारीखें।",
  alternates: {
    canonical: "/religion-culture/holidays",
  },
  openGraph: {
    type: "website",
    title:
      "छुट्टियों का कैलेंडर 2026 | धार्मिक त्योहार और राष्ट्रीय अवकाश - रामपुर न्यूज़",
    description:
      "2026 के सभी धार्मिक त्योहार, राष्ट्रीय अवकाश और सार्वजनिक छुट्टियों की पूरी सूची। होली, दिवाली, ईद, क्रिसमस और अन्य महत्वपूर्ण त्योहारों की तारीखें।",
    url: "/religion-culture/holidays",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "छुट्टियों का कैलेंडर 2026 | धार्मिक त्योहार और राष्ट्रीय अवकाश - रामपुर न्यूज़",
    description:
      "2026 के सभी धार्मिक त्योहार, राष्ट्रीय अवकाश और सार्वजनिक छुट्टियों की पूरी सूची। होली, दिवाली, ईद, क्रिसमस और अन्य महत्वपूर्ण त्योहारों की तारीखें।",
  },
};

export default function Page() {
  return <HolidaysCalendarPage />;
}


