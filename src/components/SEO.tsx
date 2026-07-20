"use client";
import { useEffect } from "react";

interface JobPostingData {
  title: string;
  description: string;
  datePosted: string;
  validThrough: string;
  employmentType: string;
  hiringOrganizationName: string;
  hiringOrganizationUrl: string;
  jobLocation: string;
}

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogType?: string;
  ogImage?: string;
  noIndex?: boolean;
  jobPosting?: JobPostingData;
}

/**
 * Client-side SEO component for "use client" pages.
 * Updates document <head> meta tags dynamically.
 *
 * For server components, use Next.js `metadata` export instead.
 */
const SEO = ({ title, description, canonical, ogType, ogImage, noIndex, jobPosting }: SEOProps) => {
  useEffect(() => {
    if (title) {
      document.title = title;
    }

    const setMeta = (name: string, content: string, attr: "name" | "property" = "name") => {
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    if (description) {
      setMeta("description", description);
      setMeta("og:description", description, "property");
    }

    if (title) {
      setMeta("og:title", title, "property");
    }

    if (ogType) {
      setMeta("og:type", ogType, "property");
    }

    if (ogImage) {
      setMeta("og:image", ogImage, "property");
    }

    if (canonical) {
      const fullUrl = canonical.startsWith("http")
        ? canonical
        : `https://rampurnews.com${canonical}`;
      setMeta("og:url", fullUrl, "property");

      let linkEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!linkEl) {
        linkEl = document.createElement("link");
        linkEl.setAttribute("rel", "canonical");
        document.head.appendChild(linkEl);
      }
      linkEl.setAttribute("href", fullUrl);
    }

    if (noIndex) {
      setMeta("robots", "noindex, nofollow");
    }

    // Inject JobPosting structured data
    if (jobPosting) {
      const id = "seo-job-posting-ld";
      let scriptEl = document.getElementById(id) as HTMLScriptElement | null;
      if (!scriptEl) {
        scriptEl = document.createElement("script");
        scriptEl.id = id;
        scriptEl.type = "application/ld+json";
        document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = JSON.stringify({
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
        jobLocation: {
          "@type": "Place",
          address: {
            "@type": "PostalAddress",
            addressRegion: jobPosting.jobLocation,
            addressCountry: "IN",
          },
        },
      });
    }
  }, [title, description, canonical, ogType, ogImage, noIndex, jobPosting]);

  return null;
};

export default SEO;
