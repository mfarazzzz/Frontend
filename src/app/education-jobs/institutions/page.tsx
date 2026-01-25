import type { Metadata } from "next";
import InstitutionsPage from "@/views/education/Institutions";

export const metadata: Metadata = {
  title: "संस्थान और कॉलेज डायरेक्टरी | शिक्षा - रामपुर न्यूज़",
  description:
    "रामपुर और आसपास के कॉलेज, स्कूल, यूनिवर्सिटी और कोचिंग की जानकारी। एड्रेस, संपर्क, कोर्स और सुविधाएं।",
  alternates: {
    canonical: "/education-jobs/institutions",
  },
  openGraph: {
    type: "website",
    title: "संस्थान और कॉलेज डायरेक्टरी | शिक्षा - रामपुर न्यूज़",
    description:
      "रामपुर और आसपास के कॉलेज, स्कूल, यूनिवर्सिटी और कोचिंग की जानकारी। एड्रेस, संपर्क, कोर्स और सुविधाएं।",
    url: "/education-jobs/institutions",
  },
  twitter: {
    card: "summary_large_image",
    title: "संस्थान और कॉलेज डायरेक्टरी | शिक्षा - रामपुर न्यूज़",
    description:
      "रामपुर और आसपास के कॉलेज, स्कूल, यूनिवर्सिटी और कोचिंग की जानकारी। एड्रेस, संपर्क, कोर्स और सुविधाएं।",
  },
};

export default function Page() {
  return <InstitutionsPage />;
}


