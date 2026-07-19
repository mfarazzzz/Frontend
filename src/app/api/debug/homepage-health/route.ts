/**
 * Homepage Health API: /api/debug/homepage-health
 * 
 * Returns structured health check of:
 * - Every section: article counts, sources, timing
 * - Deduplication stats
 * - CMS availability
 * - Consistency between homepage and category pages
 * - Content warnings (missing images, SEO, etc.)
 */
import { NextResponse } from "next/server";
import { getHomepageSections } from "@/services/content/homepageConfig";
import { getHomepageData } from "@/services/content/homepageService";
import { getAggregatedList } from "@/services/cms/aggregator";
import { CATEGORY_PAGE_SIZE } from "@/lib/constants";

export const dynamic = "force-dynamic";

interface ArticleWarning {
  slug: string;
  title: string;
  category: string;
  issues: string[];
}

export async function GET() {
  const startTime = Date.now();

  try {
    // Fetch full homepage data (same as what page.tsx uses)
    const homepageData = await getHomepageData();

    // Analyze each section
    const sectionReports = [];
    for (const { config, data } of homepageData.sections) {
      const articles = data.articles;
      
      // Check category page consistency
      let categoryPageTotal = 0;
      if (config.category) {
        try {
          const catResult = await getAggregatedList("articles", {
            category: config.category,
            pageSize: 25,
            page: 1,
          });
          categoryPageTotal = catResult.meta.pagination.total;
        } catch (_e) { /* category page fetch failed */ }
      }

      // Content quality warnings per article
      const warnings: ArticleWarning[] = [];
      for (const article of articles) {
        const issues: string[] = [];
        if (!article.image) issues.push("missing_image");
        if (!article.excerpt) issues.push("missing_excerpt");
        if (!article.category) issues.push("missing_category");
        if (!article.publishedAt && !article.publishedDate) issues.push("missing_date");
        if (!article.author) issues.push("missing_author");
        if (article.title && article.title.length < 10) issues.push("title_too_short");
        if (issues.length > 0) {
          warnings.push({
            slug: article.slug,
            title: article.title?.substring(0, 50) || "untitled",
            category: article.category,
            issues,
          });
        }
      }

      sectionReports.push({
        id: config.id,
        title: config.title,
        category: config.category,
        template: config.template,
        source: data.source,
        articleCount: articles.length,
        configuredCount: config.articleCount,
        categoryPageTotal,
        consistency: !config.category || (articles.length > 0 && categoryPageTotal > 0) || (articles.length === 0 && categoryPageTotal === 0),
        error: data.error || null,
        contentWarnings: warnings,
        articles: articles.slice(0, 3).map((a) => ({
          slug: a.slug,
          title: a.title?.substring(0, 60),
          category: a.category,
          hasImage: !!a.image,
          source: (a as any)._source || "unknown",
        })),
      });
    }

    // Hero analysis
    const heroArticles = homepageData.heroArticles;
    const heroAnalysis = {
      count: heroArticles.length,
      featured: heroArticles.filter((a) => a.isFeatured).length,
      breaking: heroArticles.filter((a) => a.isBreaking).length,
      withImages: heroArticles.filter((a) => !!a.image).length,
      categories: [...new Set(heroArticles.map((a) => a.category))],
      sources: [...new Set(heroArticles.map((a) => (a as any)._source || "unknown"))],
    };

    // Overall health
    const totalSections = sectionReports.length;
    const sectionsWithContent = sectionReports.filter((s) => s.articleCount > 0).length;
    const sectionsWithErrors = sectionReports.filter((s) => s.error).length;
    const inconsistentSections = sectionReports.filter((s) => !s.consistency).length;
    const totalWarnings = sectionReports.reduce((sum, s) => sum + s.contentWarnings.length, 0);

    const healthScore = Math.round(
      ((sectionsWithContent / Math.max(totalSections, 1)) * 50 +
        ((totalSections - sectionsWithErrors) / Math.max(totalSections, 1)) * 30 +
        ((totalSections - inconsistentSections) / Math.max(totalSections, 1)) * 20)
    );

    const totalTime = Date.now() - startTime;

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      healthScore,
      timing: `${totalTime}ms`,
      summary: {
        totalSections,
        sectionsWithContent,
        sectionsWithErrors,
        inconsistentSections,
        totalArticlesOnHomepage: sectionReports.reduce((sum, s) => sum + s.articleCount, 0) + heroArticles.length,
        totalContentWarnings: totalWarnings,
        heroArticles: heroArticles.length,
      },
      hero: heroAnalysis,
      sections: sectionReports,
      sidebar: {
        trending: homepageData.trendingArticles.length,
        todaysTop: homepageData.todaysTop.length,
        mostRead: homepageData.mostRead24h.length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        healthScore: 0,
        error: (error as Error).message,
        timing: `${Date.now() - startTime}ms`,
      },
      { status: 500 }
    );
  }
}
