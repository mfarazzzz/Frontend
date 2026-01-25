import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type AiSeoEntityType = "Person" | "Place" | "Organization" | "Thing";

export type AiSeoEntity = {
  name: string;
  type: AiSeoEntityType;
  score: number;
};

export type AiSeoSignals = {
  primaryEntity?: AiSeoEntity;
  mentions: AiSeoEntity[];
  keywords: string[];
  readTimeMinutes: number;
  freshnessScore: number;
  trendingScore: number;
  geoRelevance: { region: "rampur" | "up" | "india" | "unknown"; score: number };
};

export function stripHtmlToText(input: string) {
  if (!input) return "";
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function truncateText(input: string, maxChars: number) {
  const text = (input || "").trim();
  if (!text) return "";
  if (text.length <= maxChars) return text;
  const clipped = text.slice(0, maxChars);
  const lastSpace = clipped.lastIndexOf(" ");
  if (lastSpace >= Math.max(0, maxChars - 30)) return `${clipped.slice(0, lastSpace).trim()}…`;
  return `${clipped.trim()}…`;
}

export function computeReadTimeMinutes(text: string) {
  const words = (text || "").trim().split(/\s+/).filter(Boolean).length;
  if (words <= 0) return 1;
  return Math.max(1, Math.ceil(words / 200));
}

export function computeFreshnessScore(publishedIso: string, modifiedIso?: string) {
  const basis = modifiedIso || publishedIso;
  const t = Date.parse(basis);
  if (!Number.isFinite(t)) return 0;
  const ageHours = Math.max(0, (Date.now() - t) / (1000 * 60 * 60));
  if (ageHours <= 6) return 1;
  if (ageHours <= 24) return 0.85;
  if (ageHours <= 72) return 0.65;
  if (ageHours <= 168) return 0.45;
  if (ageHours <= 720) return 0.2;
  return 0.1;
}

export function computeTrendingScore(views: number | undefined, publishedIso: string) {
  const v = typeof views === "number" && Number.isFinite(views) ? Math.max(0, views) : 0;
  const t = Date.parse(publishedIso);
  if (!Number.isFinite(t)) return v > 0 ? 0.2 : 0;
  const ageHours = Math.max(1, (Date.now() - t) / (1000 * 60 * 60));
  const velocity = v / ageHours;
  if (ageHours <= 6 && v >= 200) return 1;
  if (ageHours <= 24 && v >= 500) return 0.9;
  if (velocity >= 100) return 0.85;
  if (velocity >= 40) return 0.65;
  if (velocity >= 15) return 0.45;
  if (v >= 100) return 0.3;
  return 0.1;
}

const uniq = <T,>(items: T[]) => {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    const key = typeof item === "string" ? item.toLowerCase() : JSON.stringify(item);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
};

const toTokenKeywords = (text: string) => {
  const cleaned = (text || "")
    .replace(/[^\p{L}\p{N}\s-]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return [];

  const stop = new Set([
    "और",
    "का",
    "की",
    "के",
    "में",
    "से",
    "पर",
    "को",
    "लिए",
    "यह",
    "वह",
    "था",
    "थे",
    "है",
    "हैं",
    "ने",
    "भी",
    "तो",
    "कि",
    "as",
    "at",
    "be",
    "by",
    "for",
    "from",
    "in",
    "is",
    "it",
    "of",
    "on",
    "or",
    "the",
    "to",
    "with",
  ]);

  const tokens = cleaned.split(" ").filter((t) => t.length >= 3);
  return tokens.filter((t) => !stop.has(t.toLowerCase()));
};

const extractHindiPhrases = (text: string) => {
  const matches = (text || "").match(/[\p{Script=Devanagari}]{2,}(?:\s+[\p{Script=Devanagari}]{2,}){0,2}/gu) || [];
  return matches.map((m) => m.trim()).filter(Boolean);
};

const extractEnglishProperNouns = (text: string) => {
  const matches =
    (text || "").match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2}\b/g) || [];
  return matches.map((m) => m.trim()).filter(Boolean);
};

export function deriveAiSeoSignals(input: {
  title: string;
  excerpt?: string;
  content?: string;
  category?: string;
  categoryHindi?: string;
  tags?: string[];
  views?: number;
  publishedDate?: string;
  modifiedDate?: string;
}): AiSeoSignals {
  const title = input.title || "";
  const body = stripHtmlToText(input.content || input.excerpt || "");
  const corpus = `${title} ${body}`.trim();

  const publishedDate = input.publishedDate || "";
  const readTimeMinutes = computeReadTimeMinutes(corpus);
  const freshnessScore = computeFreshnessScore(publishedDate, input.modifiedDate);
  const trendingScore = computeTrendingScore(input.views, publishedDate);

  const geoTokens = [
    "रामपुर",
    "Rampur",
    "उत्तर प्रदेश",
    "यूपी",
    "Uttar Pradesh",
    "UP",
    "भारत",
    "India",
  ];

  const geoHits = geoTokens.reduce((acc, token) => acc + (corpus.includes(token) ? 1 : 0), 0);
  const geoRelevance =
    corpus.includes("रामपुर") || corpus.includes("Rampur") || input.category === "rampur"
      ? { region: "rampur" as const, score: 1 }
      : corpus.includes("उत्तर प्रदेश") || corpus.includes("यूपी") || corpus.includes("Uttar Pradesh") || input.category === "up"
        ? { region: "up" as const, score: 0.7 }
        : corpus.includes("भारत") || corpus.includes("India")
          ? { region: "india" as const, score: 0.45 }
          : { region: "unknown" as const, score: Math.min(0.35, geoHits * 0.1) };

  const rawEntities: AiSeoEntity[] = [];
  const orgHints = ["सरकार", "पुलिस", "कोर्ट", "न्यायालय", "मंत्रालय", "विभाग", "कमेटी", "संगठन"];
  const hasOrgHint = orgHints.some((h) => corpus.includes(h));

  const hindiPhrases = uniq(extractHindiPhrases(title)).slice(0, 8);
  for (const p of hindiPhrases) {
    const type: AiSeoEntityType =
      p.includes("सरकार") || p.includes("पुलिस") || p.includes("कोर्ट") || p.includes("मंत्रालय")
        ? "Organization"
        : geoTokens.includes(p)
          ? "Place"
          : "Thing";
    rawEntities.push({ name: p, type, score: 0.6 });
  }

  const englishProper = uniq(extractEnglishProperNouns(title)).slice(0, 6);
  for (const p of englishProper) {
    rawEntities.push({ name: p, type: "Person", score: 0.55 });
  }

  for (const token of geoTokens) {
    if (corpus.includes(token)) {
      rawEntities.push({ name: token, type: token === "India" || token === "भारत" ? "Place" : "Place", score: 0.7 });
    }
  }

  if (input.categoryHindi) rawEntities.push({ name: input.categoryHindi, type: "Thing", score: 0.45 });
  if (input.category) rawEntities.push({ name: input.category, type: "Thing", score: 0.35 });
  if (Array.isArray(input.tags)) {
    input.tags.slice(0, 8).forEach((t) => rawEntities.push({ name: t, type: "Thing", score: 0.4 }));
  }

  const entities = uniq(rawEntities)
    .filter((e) => e.name.length >= 2)
    .sort((a, b) => b.score - a.score);

  let primaryEntity: AiSeoEntity | undefined = entities[0];
  if (hasOrgHint && primaryEntity) {
    primaryEntity =
      primaryEntity.type === "Place"
        ? { ...primaryEntity, type: "Organization", score: Math.min(1, primaryEntity.score + 0.15) }
        : primaryEntity;
  }

  const mentions = entities.filter((e) => !primaryEntity || e.name !== primaryEntity.name).slice(0, 8);

  const tokens = uniq([
    ...(input.categoryHindi ? [input.categoryHindi] : []),
    ...(input.category ? [input.category] : []),
    ...toTokenKeywords(title).slice(0, 12),
    ...toTokenKeywords(body).slice(0, 20),
    ...(primaryEntity ? [primaryEntity.name] : []),
    ...mentions.map((m) => m.name),
    "Rampur News",
    "रामपुर न्यूज़",
  ])
    .map((k) => k.trim())
    .filter(Boolean)
    .slice(0, 30);

  return {
    primaryEntity,
    mentions,
    keywords: tokens,
    readTimeMinutes,
    freshnessScore,
    trendingScore,
    geoRelevance,
  };
}

export const VALID_NEWS_CATEGORIES = [
  "rampur",
  "up",
  "national",
  "politics",
  "crime",
  "education-jobs",
  "business",
  "entertainment",
  "sports",
  "health",
  "religion-culture",
  "food-lifestyle",
  "nearby",
];

export function getCategoryHindi(category: string): string {
  const categoryMap: Record<string, string> = {
    rampur: "रामपुर",
    up: "उत्तर प्रदेश",
    national: "देश",
    politics: "राजनीति",
    crime: "अपराध",
    "education-jobs": "शिक्षा और नौकरियां",
    business: "व्यापार",
    entertainment: "मनोरंजन",
    sports: "खेल",
    health: "स्वास्थ्य",
    "religion-culture": "धर्म-संस्कृति",
    "food-lifestyle": "खान-पान और जीवनशैली",
    nearby: "आस-पास",
  };
  return categoryMap[category] || category;
}
