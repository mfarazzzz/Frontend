import type { Metadata } from "next";
import InstitutionDetailPage from "@/views/education/InstitutionDetail";
import { getExtendedCMSProvider } from "@/services/cms/extendedProvider";

const provider = getExtendedCMSProvider();

const typeLabels: Record<string, string> = {
  college: "कॉलेज",
  school: "स्कूल",
  university: "विश्वविद्यालय",
  coaching: "कोचिंग",
  vocational: "पॉलिटेक्निक",
  iti: "आईटीआई",
};

type PageParams = { slug: string };

export async function generateMetadata(
  props: { params: Promise<PageParams> }
): Promise<Metadata> {
  const { slug } = await props.params;
  let institution = null;
  try {
    institution = await provider.getInstitutionBySlug(slug);
  } catch {
    institution = null;
  }

  if (!institution) {
    return {
      title: "संस्थान नहीं मिला | रामपुर न्यूज़",
      description: "आपके द्वारा खोजा गया संस्थान उपलब्ध नहीं है।",
      alternates: { canonical: "/education-jobs/institutions" },
    };
  }

  const typeLabel = typeLabels[institution.type] || "संस्थान";
  const cityName = institution.city;
  const title = `${institution.nameHindi} | ${typeLabel} ${cityName} - कोर्स, फीस, एडमिशन 2026`;
  const description = `${institution.nameHindi} (${institution.name}) - ${institution.descriptionHindi || ''} ${institution.city}, ${institution.district}। कोर्स: ${institution.courses?.slice(0, 4).join(', ') || 'विभिन्न'}। फीस: ${institution.fees || 'संपर्क करें'}।`;
  const canonical = `https://rampurnews.com/education-jobs/institutions/${institution.slug}`;

  return {
    title,
    description: description.slice(0, 160),
    alternates: { canonical },
    openGraph: {
      type: "article",
      title,
      description: description.slice(0, 160),
      url: canonical,
      siteName: "रामपुर न्यूज़ | Rampur News",
      images: institution.image ? [{ url: institution.image, width: 1200, height: 630, alt: institution.nameHindi }] : undefined,
      locale: "hi_IN",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: description.slice(0, 160),
      images: institution.image ? [institution.image] : undefined,
    },
  };
}

export const revalidate = 3600; // 1 hour ISR

export default function Page() {
  return <InstitutionDetailPage />;
}
