import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { User, Globe2, Linkedin, Twitter, Instagram, Facebook, Youtube, Send } from "lucide-react";
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

  const canonicalPath = `/authors/${slug}`;
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
      images: author.avatar ? [author.avatar] : [`${SITE_URL}/og-image.jpg`],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: author.avatar ? [author.avatar] : [`${SITE_URL}/og-image.jpg`],
    },
  };
}

const buildAuthorSchema = (author: CMSAuthor, slug: string) => {
  const isFaraz = slug === "mohammad-faraz-raza-khan";
  const name = author.name || author.nameHindi || "Author";
  const jobTitle =
    author.designation ||
    (isFaraz ? "Founder & Editor, rampurnews.com" : "Author at rampurnews.com");

  const url = `${SITE_URL}/authors/${slug}`;

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
  const coverImage =
    typeof author.coverImage === "string" && author.coverImage.trim().length > 0
      ? author.coverImage.trim()
      : typeof author.socialLinks?.coverImage === "string"
        ? author.socialLinks.coverImage.trim()
        : typeof author.socialLinks?.banner === "string"
          ? author.socialLinks.banner.trim()
          : `${SITE_URL}/og-image.jpg`;
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
        <section className="relative">
          <div className="relative h-48 md:h-64 w-full overflow-hidden">
            <img
              src={coverImage}
              alt={`${name} cover`}
              className="w-full h-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          </div>
          <div className="max-w-6xl mx-auto px-4">
            <div className="-mt-16 md:-mt-20 pb-8 flex flex-col md:flex-row gap-6 items-start">
              <div className="relative">
                <div className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden border-4 border-background bg-muted shadow-lg flex items-center justify-center">
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
              <div className="flex-1 w-full space-y-4">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                  <div className="space-y-1">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{name}</h1>
                    <p className="text-base md:text-lg text-muted-foreground">{designation}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs sm:text-sm text-muted-foreground">
                    {stats.map((stat) => (
                      <div
                        key={stat.label}
                        className="inline-flex items-center gap-2 rounded-full border border-border bg-background/90 px-3 py-1.5"
                      >
                        <span className="font-semibold text-foreground">{stat.value}</span>
                        <span>{stat.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {shortBio && (
                  <p className="text-sm sm:text-base text-muted-foreground max-w-3xl leading-relaxed">
                    {shortBio}
                  </p>
                )}
                {socialLinks.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    {socialLinks.map((link) => {
                      const icon =
                        link.key === "linkedin"
                          ? <Linkedin className="w-4 h-4" />
                          : link.key === "twitter"
                            ? <Twitter className="w-4 h-4" />
                            : link.key === "instagram"
                              ? <Instagram className="w-4 h-4" />
                              : link.key === "facebook"
                                ? <Facebook className="w-4 h-4" />
                                : link.key === "youtube"
                                  ? <Youtube className="w-4 h-4" />
                                  : link.key === "telegram"
                                    ? <Send className="w-4 h-4" />
                                    : <Globe2 className="w-4 h-4" />;
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
                          className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs sm:text-sm text-foreground transition hover:bg-muted"
                        >
                          {icon}
                          <span>{label}</span>
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {detailedBioParagraphs.length > 0 && (
          <section className="max-w-6xl mx-auto px-4 pb-6">
            <div className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-4">
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

        <section className="max-w-6xl mx-auto px-4 pb-12">
          <AuthorArticleTabs articles={articles} categories={categories} />
        </section>
      </main>
    </>
  );
}
