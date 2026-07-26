import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { User, Globe2, Send } from "lucide-react";
import { getCMSProvider } from "@/services/cms";
import type { CMSAuthor, CMSArticle } from "@/services/cms";
import { stripHtmlToText, truncateText } from "@/lib/utils";
import AuthorArticleTabs from "@/components/AuthorArticleTabs";

const SITE_URL = "https://rampurnews.com";

type PageParams = {
  slug: string;
};

const toSlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const getFarazLongBio = () => [
  "Mohammad Faraz Raza Khan is the Founder & Editor of rampurnews.com and a multidisciplinary professional with a background in law and engineering.",
  "He has over ten years of experience across technology, business growth, EdTech, digital advertising, and digital marketing, focusing on building sustainable, audience-first media products.",
  "His work combines editorial leadership with product strategy, emphasizing credibility, community impact, and accessibility for readers in Rampur and beyond.",
];

const findAuthorBySlug = async (slug: string): Promise<CMSAuthor | null> => {
  const provider = getCMSProvider();
  const authors = await provider.getAuthors();
  const normalized = slug.toLowerCase();

  const direct = authors.find((a) => a.slug && a.slug.toLowerCase() === normalized);
  if (direct) return direct;

  const byEnglish = authors.find(
    (a) => a.name && toSlug(a.name) === normalized,
  );
  if (byEnglish) return byEnglish;

  const byHindi = authors.find(
    (a) => a.nameHindi && toSlug(a.nameHindi) === normalized,
  );
  if (byHindi) return byHindi;

  return null;
};

type AuthorArticlesInfo = {
  articles: CMSArticle[];
  total: number;
  categories: { slug: string; name: string }[];
  publishedSince?: string;
};

const getArticlesByAuthor = async (author: CMSAuthor): Promise<AuthorArticlesInfo> => {
  const provider = getCMSProvider();
  const page = await provider.getArticles({
    author: author.email || author.name,
    limit: 50,
    orderBy: "publishedDate",
    order: "desc",
  });
  const list = (page?.data ?? []).filter(
    (article) =>
      article.author === author.name || article.author === author.nameHindi,
  );

  const articles = list;
  const total = typeof page?.total === "number" ? page.total : list.length;

  const categoriesMap = new Map<string, string>();
  for (const article of list) {
    const slug = article.category?.trim();
    if (!slug) continue;
    const name = article.categoryHindi?.trim() || slug;
    if (!categoriesMap.has(slug)) {
      categoriesMap.set(slug, name);
    }
  }
  const categories = Array.from(categoriesMap.entries()).map(([slug, name]) => ({
    slug,
    name,
  }));

  let publishedSince: string | undefined;
  try {
    const earliest = await provider.getArticles({
      author: author.email || author.name,
      limit: 1,
      orderBy: "publishedDate",
      order: "asc",
    });
    const first = earliest?.data?.[0];
    publishedSince = first?.publishedDate || first?.publishedAt || undefined;
  } catch {
    publishedSince = undefined;
  }

  return { articles, total, categories, publishedSince };
};

export async function generateMetadata(props: { params: Promise<PageParams> }): Promise<Metadata> {
  const { slug } = await props.params;
  const author = await findAuthorBySlug(slug);

  if (!author) {
    return {
      title: "Author not found | Rampur News",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const name = author.name || author.nameHindi || "Author";
  const isFaraz = slug === "mohammad-faraz-raza-khan";

  const title = isFaraz
    ? "Mohammad Faraz Raza Khan – Founder & Editor, rampurnews.com"
    : `${name} – Author at rampurnews.com`;

  const bioText = author.bio ? stripHtmlToText(author.bio) : "";
  const genericDescription =
    bioText || `${name} is an author at rampurnews.com covering news and analysis.`;

  const description = isFaraz
    ? "Author profile of Mohammad Faraz Raza Khan, Founder & Editor of rampurnews.com, advocate, engineer and digital media entrepreneur with 10+ years in tech and media."
    : truncateText(genericDescription, 155);

  const canonicalPath = `/author/${slug}`;
  const canonicalUrl = `${SITE_URL}${canonicalPath}`;

  const keywords = isFaraz
    ? [
        "mohammad faraz raza khan",
        "founder editor rampurnews.com",
        "rampurnews author profile",
        "digital media entrepreneur rampur",
      ]
    : [name, "rampurnews.com author", "Rampur News"];

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    keywords,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      type: "profile",
      title,
      description,
      url: canonicalUrl,
      siteName: "रामपुर न्यूज़ | Rampur News",
      images: author.avatar ? [author.avatar] : [`${SITE_URL}/og-image.png`],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: author.avatar ? [author.avatar] : [`${SITE_URL}/og-image.png`],
    },
  };
}

export const revalidate = 60;

const buildAuthorSchema = (author: CMSAuthor, slug: string) => {
  const isFaraz = slug === "mohammad-faraz-raza-khan";
  const name = author.name || author.nameHindi || "Author";
  const jobTitle =
    author.designation ||
    (isFaraz ? "Founder & Editor, rampurnews.com" : "Author at rampurnews.com");

  const url = `${SITE_URL}/author/${slug}`;

  const description = isFaraz
    ? "Founder and Editor of rampurnews.com, advocate (lawyer), engineer and digital media entrepreneur with more than ten years' experience in technology, business growth, EdTech, digital advertising and digital marketing."
    : author.bio
      ? stripHtmlToText(author.bio)
      : `${name} is an author at rampurnews.com.`;

  const socialCandidates = [
    author.linkedinUrl,
    author.facebookUrl,
    author.instagramUrl,
    author.twitterUrl,
    author.whatsappUrl,
  ];

  const sameAsFromFields = socialCandidates.filter(
    (value): value is string => typeof value === "string" && value.trim().length > 0,
  );

  const sameAsFromJson = Array.isArray(author.socialLinks?.sameAs)
    ? author.socialLinks.sameAs
    : [];

  const sameAs = [...sameAsFromFields, ...sameAsFromJson];

  const knowsAbout = Array.isArray(author.knowsAbout)
    ? author.knowsAbout
    : isFaraz
      ? [
          "Technology",
          "Business growth",
          "EdTech",
          "Digital advertising",
          "Digital marketing",
          "Digital media",
          "Law and legal awareness",
          "Journalism and news publishing",
        ]
      : undefined;

  const hasOccupation = isFaraz
    ? [
        { "@type": "Occupation", name: "Advocate (Lawyer)" },
        { "@type": "Occupation", name: "Engineer" },
        { "@type": "Occupation", name: "Digital Media Entrepreneur" },
        { "@type": "Occupation", name: "Editor" },
        { "@type": "Occupation", name: "Counsellor" },
        { "@type": "Occupation", name: "Social Worker" },
      ]
    : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    jobTitle,
    worksFor: {
      "@type": "Organization",
      name: "rampurnews.com",
      url: SITE_URL,
    },
    url,
    description,
    hasOccupation: hasOccupation,
    knowsAbout,
    sameAs,
    alumniOf: Array.isArray(author.socialLinks?.alumniOf)
      ? author.socialLinks.alumniOf
      : undefined,
  };
};

export default async function Page(props: { params: Promise<PageParams> }) {
  const { slug } = await props.params;
  const author = await findAuthorBySlug(slug);

  if (!author) {
    notFound();
  }

  const isFaraz = slug === "mohammad-faraz-raza-khan";
  const name = author.name || author.nameHindi || "";
  const designation =
    author.designation ||
    (isFaraz ? "Founder & Editor, rampurnews.com" : "Author at rampurnews.com");

  const schema = buildAuthorSchema(author, slug);
  const { articles, total, categories, publishedSince } = await getArticlesByAuthor(author);
  const rawBio = author.bio ? stripHtmlToText(author.bio) : "";

  const publishedSinceDate = publishedSince ? new Date(publishedSince) : null;
  const publishedSinceLabel = publishedSinceDate && !Number.isNaN(publishedSinceDate.getTime())
    ? publishedSinceDate.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })
    : "";

  const fallbackBioParts = [
    `${name} ${designation ? `(${designation})` : ""} लिखते हैं और rampurnews.com के लिए समाचार कवरेज करते हैं।`,
    author.profession ? `पेशा: ${author.profession}.` : "",
    author.experience ? `अनुभव: ${author.experience}.` : "",
    categories.length > 0 ? `कवर की गई श्रेणियां: ${categories.map((c) => c.name).join(", ")}.` : "",
    publishedSinceLabel ? `प्रकाशन से: ${publishedSinceLabel}.` : "",
  ].filter(Boolean);
  let fallbackBio = fallbackBioParts.join(" ");
  if (fallbackBio.length < 200) {
    fallbackBio = `${fallbackBio} लेखक का विस्तृत परिचय संपादकीय अपडेट के लिए लंबित है और शीघ्र अपडेट किया जाएगा।`;
  }

  const shortBio = isFaraz
    ? "Founder & Editor at rampurnews.com, advocate (lawyer), engineer and digital media entrepreneur with more than ten years' experience in technology, business growth, EdTech, digital advertising and digital marketing."
    : truncateText(rawBio || fallbackBio, 200);

  const detailedBioText = rawBio || fallbackBio;
  const detailedBioParagraphs =
    isFaraz && !rawBio
      ? getFarazLongBio()
      : detailedBioText
        ? [detailedBioText]
        : [];

  const socialSources = {
    website: author.websiteUrl,
    linkedin: author.linkedinUrl || author.socialLinks?.linkedin,
    twitter: author.twitterUrl || author.socialLinks?.twitter,
    instagram: author.instagramUrl || author.socialLinks?.instagram,
    facebook: author.facebookUrl || author.socialLinks?.facebook,
    youtube: author.socialLinks?.youtube,
    whatsapp: author.whatsappUrl || author.socialLinks?.whatsapp,
    telegram: author.socialLinks?.telegram,
  };
  const socialEntries = Object.entries(socialSources)
    .filter(([, value]) => typeof value === "string" && value.trim().length > 0)
    .map(([key, value]) => ({ key, url: (value as string).trim() }));
  const socialMap = new Map<string, string>();
  for (const entry of socialEntries) {
    if (!socialMap.has(entry.key)) socialMap.set(entry.key, entry.url);
  }
  const socialLinks = Array.from(socialMap.entries()).map(([key, url]) => ({ key, url }));
  const stats = [
    { label: "कुल लेख", value: String(total) },
    { label: "श्रेणियां", value: String(categories.length) },
    ...(publishedSinceLabel ? [{ label: "प्रकाशन से", value: publishedSinceLabel }] : []),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <main className="bg-background">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-muted/50 via-background to-background" />
          <div className="relative max-w-6xl mx-auto px-4 pt-12 pb-10">
            <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="relative">
                  <div className="w-32 h-32 md:w-36 md:h-36 rounded-full overflow-hidden border-4 border-white/80 bg-muted shadow-xl ring-1 ring-black/5 flex items-center justify-center">
                    {author.avatar ? (
                      <img
                        src={author.avatar}
                        alt={name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-muted-foreground" />
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground/80">
                    Author Profile
                  </p>
                  <div className="space-y-2">
                    <h1 className="text-4xl md:text-[40px] font-bold tracking-tight text-foreground">
                      {name}
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground/80">
                      {designation}
                    </p>
                  </div>
                  {shortBio && (
                    <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl">
                      {shortBio}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-3 text-xs sm:text-sm text-muted-foreground">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/90 px-4 py-2 shadow-sm"
                  >
                    <span className="text-sm font-semibold text-foreground">{stat.value}</span>
                    <span>{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
            {socialLinks.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center gap-2">
                {socialLinks.map((link) => {
                  const getSocialIcon = (key: string) => {
                    const iconClass = "w-4 h-4";
                    switch (key) {
                      case "linkedin":
                        return (
                          <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                        );
                      case "twitter":
                        return (
                          <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                          </svg>
                        );
                      case "instagram":
                        return (
                          <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/>
                          </svg>
                        );
                      case "facebook":
                        return (
                          <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                        );
                      case "youtube":
                        return (
                          <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                          </svg>
                        );
                      case "telegram":
                        return <Send className={iconClass} />;
                      default:
                        return <Globe2 className={iconClass} />;
                    }
                  };

                  const label =
                    link.key === "linkedin"
                      ? "LinkedIn"
                      : link.key === "twitter"
                        ? "Twitter"
                        : link.key === "instagram"
                          ? "Instagram"
                          : link.key === "facebook"
                            ? "Facebook"
                            : link.key === "youtube"
                              ? "YouTube"
                              : link.key === "whatsapp"
                                ? "WhatsApp"
                                : link.key === "telegram"
                                  ? "Telegram"
                                  : "Website";
                  return (
                    <a
                      key={link.key}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-4 py-2 text-xs sm:text-sm text-foreground transition hover:-translate-y-0.5 hover:bg-muted hover:shadow-sm"
                    >
                      {getSocialIcon(link.key)}
                      <span>{label}</span>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {detailedBioParagraphs.length > 0 && (
          <section className="max-w-6xl mx-auto px-4 pb-8">
            <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm space-y-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                  परिचय
                </p>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">लेखक के बारे में</h2>
              </div>
              <div className="space-y-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
                {detailedBioParagraphs.map((paragraph, index) => (
                  <p key={`${slug}-bio-${index}`}>{paragraph}</p>
                ))}
              </div>
            </div>
          </section>
        )}
        <div className="max-w-6xl mx-auto px-4">
          <div className="border-t border-border/70" />
        </div>

        <section className="max-w-6xl mx-auto px-4 pt-8 pb-14">
          <AuthorArticleTabs articles={articles} categories={categories} />
        </section>
      </main>
    </>
  );
}
