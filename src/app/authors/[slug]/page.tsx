import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCMSProvider } from "@/services/cms";
import type { CMSAuthor, CMSArticle } from "@/services/cms";
import { stripHtmlToText, truncateText } from "@/lib/utils";

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

const getArticlesByAuthor = async (author: CMSAuthor): Promise<CMSArticle[]> => {
  const provider = getCMSProvider();
  const page = await provider.getArticles({
    author: author.email || author.name,
    limit: 8,
    orderBy: "publishedDate",
    order: "desc",
  });
  const list = page?.data ?? [];
  return list
    .filter(
      (article) =>
        article.author === author.name || article.author === author.nameHindi,
    )
    .slice(0, 8);
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

const getFarazLongBio = () =>
  [
    "Mohammad Faraz Raza Khan is the Founder and Editor of rampurnews.com, a digital news platform focused on contemporary issues, public interest stories and local developments. Combining training in both law and engineering, he works at the intersection of media, technology and civic life. Over more than a decade, he has been active in technology, business growth, EdTech, digital advertising and digital marketing, bringing that experience into the editorial and strategic direction of the publication.",
    "Beginning his professional journey as an engineer, Mohammad Faraz Raza Khan developed an early interest in how digital systems, infrastructure and products can be used to solve practical problems. This technical foundation later informed his work in technology-led businesses and digital ventures, where he contributed to projects involving online platforms, digital services and technology-enabled education. His exposure to EdTech and digital advertising gave him a close view of how audiences consume information online and how media brands can build sustainable digital reach.",
    "Alongside his technical work, he pursued the legal profession as an advocate. As a lawyer, he developed a structured understanding of constitutional principles, rights, due process and regulatory frameworks. This legal background has been important in shaping his approach to journalism and public communication. It informs how he thinks about freedom of expression, responsibility in reporting, and the ethical dimensions of public discourse. The combination of law and engineering has given him a dual perspective on both the systems that power digital media and the legal context in which it operates.",
    "In his role as Founder and Editor of rampurnews.com, Mohammad Faraz Raza Khan oversees editorial strategy, story selection and content standards. He focuses on clarity, neutrality and public relevance in news coverage, with attention to accuracy and verifiable information. He encourages the use of data, on-the-ground context and multi-source verification in the reporting process. His experience in digital marketing and business growth helps guide decisions on audience engagement, platform strategy and long-term sustainability of the news brand.",
    "As a digital media entrepreneur, he has been involved in building rampurnews.com as an independent online news outlet. This involves product decisions, technology stack choices and workflows that allow reporters, editors and contributors to publish efficiently while maintaining editorial checks. His background in digital advertising and marketing is applied to understanding how content is discovered, how audiences interact with headlines and formats, and how to balance reach with editorial responsibility.",
    "Beyond his editorial and entrepreneurial roles, Mohammad Faraz Raza Khan is active as a social worker and counsellor. In these capacities, he engages with individuals and community initiatives on issues such as education, career guidance and social awareness. His counselling experience contributes to a people-centric view of public issues, and often informs the choice of topics that rampurnews.com highlights, especially in areas related to youth, education and local development.",
    "His professional experience of more than ten years spans technology implementation, business growth strategies, EdTech product work, digital advertising campaigns and digital marketing initiatives. This broad exposure to the digital ecosystem has helped him understand how different stakeholders—platforms, advertisers, institutions, and audiences—interact with news and information. It also supports his interest in building a news platform that is technically robust, search-friendly and aligned with modern standards for web performance and accessibility.",
    "Through rampurnews.com, Mohammad Faraz Raza Khan works to combine legal understanding, technical knowledge and community engagement in a single digital news project. His author profile presents verifiable information about his roles and professional experience, with the intent of offering readers clear attribution and accountability for the content associated with his name. The profile emphasizes his responsibilities as Founder and Editor, his professional disciplines as an advocate and engineer, his activities in digital media entrepreneurship, and his work as a social worker and counsellor.",
  ];

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

  const longBioParagraphs = isFaraz
    ? getFarazLongBio()
    : author.bio
      ? [stripHtmlToText(author.bio)]
      : [];

  const shortBio = isFaraz
    ? "Founder & Editor at rampurnews.com, advocate (lawyer), engineer and digital media entrepreneur with more than ten years' experience in technology, business growth, EdTech, digital advertising and digital marketing."
    : author.bio
      ? truncateText(stripHtmlToText(author.bio), 200)
      : "";

  const schema = buildAuthorSchema(author, slug);
  const articles = await getArticlesByAuthor(author);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <header className="flex gap-6 items-start">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-muted shrink-0">
            {author.avatar ? (
              <img
                src={author.avatar}
                alt={name}
                className="w-full h-full object-cover"
              />
            ) : null}
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">{name}</h1>
            <p className="text-lg text-muted-foreground">{designation}</p>
            {shortBio && (
              <p className="text-sm text-muted-foreground max-w-2xl">
                {shortBio}
              </p>
            )}
          </div>
        </header>

        {longBioParagraphs.length > 0 && (
          <section className="prose prose-sm max-w-none prose-headings:scroll-mt-24">
            <h2>Biography</h2>
            {longBioParagraphs.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </section>
        )}

        <section className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Professional Background</h2>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              {isFaraz && (
                <>
                  <li>Advocate (lawyer) with interest in legal awareness and public policy.</li>
                  <li>Engineering background with experience in technology-led projects.</li>
                  <li>
                    10+ years in technology, business growth, EdTech, digital advertising and
                    digital marketing.
                  </li>
                </>
              )}
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Areas of Knowledge</h2>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              {schema.knowsAbout &&
                Array.isArray(schema.knowsAbout) &&
                schema.knowsAbout.map((topic: string, idx: number) => (
                  <li key={idx}>{topic}</li>
                ))}
            </ul>
          </div>
        </section>

        {articles.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">इसी लेखक की खबरें</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {articles.map((article) => (
                <Link
                  key={article.id}
                  href={`/${article.category}/${article.slug}`}
                  className="block p-4 rounded-lg border hover:bg-muted transition-colors"
                >
                  <div className="font-semibold line-clamp-2">
                    {article.title}
                  </div>
                  {article.excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {article.excerpt}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
