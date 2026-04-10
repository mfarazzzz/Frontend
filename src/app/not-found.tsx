import type { Metadata } from "next";
import NotFound from "@/views/NotFound";

export const metadata: Metadata = {
  title: "पेज नहीं मिला | 404 | रामपुर न्यूज़",
  description: "यह पेज उपलब्ध नहीं है। रामपुर न्यूज़ पर वापस जाएं और ताज़ा खबरें पढ़ें।",
  robots: { index: false, follow: true },
};

export default function NotFoundPage() {
  return <NotFound />;
}
