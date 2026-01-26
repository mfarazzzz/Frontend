import Head from "next/head";

interface ArticleData {
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
}

interface NewsArticleSchema {
  headline: string;
  description: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
  author?: string;
  section?: string;
  articleBody?: string;
}

interface JobPostingSchema {
  title: string;
  description: string;
  datePosted: string;
  validThrough?: string;
  employmentType?: string;
  hiringOrganizationName: string;
  hiringOrganizationUrl?: string;
  jobLocation?: string;
}

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: "website" | "article";
  article?: ArticleData;
  newsArticle?: NewsArticleSchema;
  jobPosting?: JobPostingSchema;
  isHomepage?: boolean;
  keywords?: string[];
  isAMP?: boolean;
  speakable?: string[];
}

const SEO = ({
  title,
  description,
  canonical,
  ogImage = "https://rampurnews.com/og-image.jpg",
  ogType = "website",
  article,
  newsArticle,
  jobPosting,
  isHomepage = false,
  keywords = [],
  isAMP = false,
  speakable = [],
}: SEOProps) => {
  const siteName = "रामपुर न्यूज़ | Rampur News";
  const fullTitle = `${title} | ${siteName}`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://rampurnews.com";
  const canonicalUrl = canonical ? `${siteUrl}${canonical}` : siteUrl;
  const googleSiteVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
  const contactPhone = process.env.NEXT_PUBLIC_CONTACT_PHONE;

  // Default keywords for Hindi news
  const defaultKeywords = [
    "रामपुर", "रामपुर न्यूज़", "Rampur News", "उत्तर प्रदेश",
    "हिंदी समाचार", "ताज़ा खबरें", "Hindi News", "UP News",
    "रामपुर समाचार", "लोकल न्यूज़", "ब्रेकिंग न्यूज़"
  ];
  const allKeywords = defaultKeywords.slice();
  keywords.forEach((keyword) => {
    if (!allKeywords.includes(keyword)) {
      allKeywords.push(keyword);
    }
  });

  // Website Schema (for homepage) - Enhanced for Google Discover
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    alternateName: ["Rampur News", "रामपुर न्यूज़", "RampurNews.com"],
    url: siteUrl,
    description: "रामपुर न्यूज़ - रामपुर जिले और उत्तर प्रदेश की ताज़ा, विश्वसनीय खबरें। Breaking News, Local Updates, Education, Sports, Entertainment.",
    inLanguage: "hi-IN",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    publisher: {
      "@type": "Organization",
      name: siteName,
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo.png`,
        width: 768,
        height: 768,
      },
    },
  };

  // News Media Organization Schema - Enhanced for Google News
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    "@id": `${siteUrl}/#organization`,
    name: siteName,
    alternateName: "Rampur News",
    url: siteUrl,
    logo: {
      "@type": "ImageObject",
      url: `${siteUrl}/logo.png`,
      width: 768,
      height: 768,
    },
    sameAs: [
      "https://www.facebook.com/profile.php?id=61586930678729",
      "https://twitter.com/RampurNews",
      "https://instagram.com/RampurNews",
      "https://www.youtube.com/@rampurnewsdotcom",
      "https://whatsapp.com/channel/0029Vb7TEPsLI8Yg4gbsqe3O",
      "https://t.me/rampurnewsofficial",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: contactPhone || undefined,
      contactType: "customer service",
      areaServed: "IN",
      availableLanguage: ["Hindi", "English"],
    },
    foundingDate: "2024-01-01",
    publishingPrinciples: `${siteUrl}/editorial-policy`,
    masthead: `${siteUrl}/about`,
    ownershipFundingInfo: `${siteUrl}/ownership`,
    actionableFeedbackPolicy: `${siteUrl}/contact`,
    correctionsPolicy: `${siteUrl}/corrections-policy`,
    ethicsPolicy: `${siteUrl}/editorial-policy`,
    unnamedSourcesPolicy: `${siteUrl}/editorial-policy`,
  };

  // NewsArticle Schema - Enhanced for AI/Perplexity/Google Discover
  const newsArticleSchema = newsArticle
    ? {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "@id": `${canonicalUrl}#article`,
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": canonicalUrl,
        },
        headline: newsArticle.headline,
        name: newsArticle.headline,
        description: newsArticle.description,
        articleBody: newsArticle.articleBody || newsArticle.description,
        image: {
          "@type": "ImageObject",
          url: newsArticle.image || ogImage,
          width: 1200,
          height: 630,
        },
        thumbnailUrl: newsArticle.image || ogImage,
        datePublished: newsArticle.datePublished,
        dateModified: newsArticle.dateModified || newsArticle.datePublished,
        author: {
          "@type": "Person",
          name: newsArticle.author || "रामपुर न्यूज़ संवाददाता",
          url: `${siteUrl}/author/${encodeURIComponent(newsArticle.author || "rampur-news")}`,
        },
        publisher: {
          "@type": "NewsMediaOrganization",
          "@id": `${siteUrl}/#organization`,
          name: siteName,
          logo: {
            "@type": "ImageObject",
            url: `${siteUrl}/logo.png`,
            width: 768,
            height: 768,
          },
        },
        articleSection: newsArticle.section || "समाचार",
        inLanguage: "hi-IN",
        isAccessibleForFree: true,
        wordCount: (newsArticle.articleBody || newsArticle.description).split(/\s+/).filter(Boolean).length,
        isPartOf: {
          "@type": "WebSite",
          "@id": `${siteUrl}/#website`,
          name: siteName,
        },
        keywords: allKeywords.join(", "),
        copyrightYear: new Date().getFullYear(),
        copyrightHolder: {
          "@type": "Organization",
          name: siteName,
        },
      }
    : null;

  const jobPostingSchema = jobPosting
    ? {
        "@context": "https://schema.org",
        "@type": "JobPosting",
        title: jobPosting.title,
        description: jobPosting.description,
        datePosted: jobPosting.datePosted,
        validThrough: jobPosting.validThrough,
        employmentType: jobPosting.employmentType,
        hiringOrganization: {
          "@type": "Organization",
          name: jobPosting.hiringOrganizationName,
          sameAs: jobPosting.hiringOrganizationUrl,
        },
        jobLocation: jobPosting.jobLocation
          ? {
              "@type": "Place",
              address: {
                "@type": "PostalAddress",
                addressLocality: jobPosting.jobLocation,
                addressRegion: "Uttar Pradesh",
                addressCountry: "IN",
              },
            }
          : undefined,
      }
    : null;

  // Speakable Schema for Google Assistant / Voice Search
  const speakableSchema = speakable.length > 0 || newsArticle
    ? {
        "@context": "https://schema.org",
        "@type": "WebPage",
        speakable: {
          "@type": "SpeakableSpecification",
          cssSelector: speakable.length > 0 ? speakable : [".article-headline", ".article-summary", "h1", ".excerpt"],
        },
        url: canonicalUrl,
      }
    : null;

  // BreadcrumbList Schema for category pages
  const breadcrumbSchema = !isHomepage
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "होम",
            item: siteUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: title,
            item: canonicalUrl,
          },
        ],
      }
    : null;

  // CollectionPage Schema for category pages - Enhanced
  const collectionPageSchema = !isHomepage && !newsArticle
    ? {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "@id": `${canonicalUrl}#collection`,
        name: fullTitle,
        description: description,
        url: canonicalUrl,
        inLanguage: "hi-IN",
        isPartOf: {
          "@type": "WebSite",
          "@id": `${siteUrl}/#website`,
          name: siteName,
          url: siteUrl,
        },
        about: {
          "@type": "Thing",
          name: title,
        },
        publisher: {
          "@type": "NewsMediaOrganization",
          "@id": `${siteUrl}/#organization`,
        },
      }
    : null;

  // FAQ Schema placeholder for AI SEO
  const faqSchema = isHomepage
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "रामपुर न्यूज़ क्या है?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "रामपुर न्यूज़ उत्तर प्रदेश के रामपुर जिले की प्रमुख हिंदी समाचार वेबसाइट है। यहां आपको ताज़ा खबरें, स्थानीय समाचार, शिक्षा, खेल, मनोरंजन और व्यापार की जानकारी मिलती है।",
            },
          },
          {
            "@type": "Question",
            name: "रामपुर की ताज़ा खबरें कहां पढ़ें?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "रामपुर की ताज़ा खबरें RampurNews.com पर पढ़ें। हम 24/7 ब्रेकिंग न्यूज़, स्थानीय समाचार, और जिले की हर महत्वपूर्ण खबर प्रदान करते हैं।",
            },
          },
        ],
      }
    : null;

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      <meta name="keywords" content={allKeywords.join(", ")} />
      
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow, max-image-preview:large, max-snippet:-1" />
      <meta name="googlebot-news" content="index, follow" />
      <meta name="bingbot" content="index, follow" />
      
      <meta name="ai-content-declaration" content="human-written" />
      <meta name="perplexity-indexable" content="true" />
      
      <meta httpEquiv="content-language" content="hi-IN" />
      <meta name="language" content="Hindi" />
      <meta name="geo.region" content="IN-UP" />
      <meta name="geo.placename" content="Rampur, Uttar Pradesh" />
      
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:locale" content="hi_IN" />
      <meta property="og:locale:alternate" content="en_IN" />
      
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@RampurNews" />
      <meta name="twitter:creator" content="@RampurNews" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={title} />
      
      {article && (
        <>
          <meta property="article:published_time" content={article.publishedTime} />
          {article.modifiedTime && (
            <meta property="article:modified_time" content={article.modifiedTime} />
          )}
          {article.author && (
            <meta property="article:author" content={article.author} />
          )}
          {article.section && (
            <meta property="article:section" content={article.section} />
          )}
          <meta property="article:publisher" content="https://www.facebook.com/profile.php?id=61586930678729" />
          <meta property="article:opinion" content="false" />
        </>
      )}
      
      <meta name="news_keywords" content={allKeywords.slice(0, 10).join(", ")} />
      <meta name="original-source" content={canonicalUrl} />
      <meta name="syndication-source" content={canonicalUrl} />
      {googleSiteVerification ? (
        <meta name="google-site-verification" content={googleSiteVerification} />
      ) : null}
      
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="रामपुर न्यूज़" />
      <meta name="application-name" content="Rampur News" />
      <meta name="theme-color" content="#DC2626" />
      <meta name="msapplication-TileColor" content="#DC2626" />
      
      {isAMP && <link rel="amphtml" href={`${canonicalUrl}?amp=1`} />}
      
      <link rel="alternate" type="application/rss+xml" title="रामपुर न्यूज़ RSS" href={`${siteUrl}/feed.xml`} />
      <link rel="alternate" type="application/atom+xml" title="रामपुर न्यूज़ Atom" href={`${siteUrl}/atom.xml`} />
      
      {isHomepage && (
        <script type="application/ld+json">
          {JSON.stringify(websiteSchema)}
        </script>
      )}
      
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
      
      {newsArticleSchema && (
        <script type="application/ld+json">
          {JSON.stringify(newsArticleSchema)}
        </script>
      )}
      
      {speakableSchema && (
        <script type="application/ld+json">
          {JSON.stringify(speakableSchema)}
        </script>
      )}
      
      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}
      
      {collectionPageSchema && (
        <script type="application/ld+json">
          {JSON.stringify(collectionPageSchema)}
        </script>
      )}
      
      {faqSchema && (
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      )}
    </Head>
  );
};

export default SEO;
