import type { PaginatedResponse } from "./types";
import type {
  CMSExam,
  CMSEvent,
  CMSFashionStore,
  CMSFamousPlace,
  CMSHoliday,
  CMSInstitution,
  CMSRestaurant,
  CMSResult,
  CMSShoppingCentre,
  CMSEducationNews,
  ExtendedQueryParams,
} from "./extendedTypes";
import type { ExtendedCMSProvider } from "./extendedProvider";

type StrapiEntity<T> = { id: string | number; attributes?: T } & Partial<T>;
type StrapiCollectionResponse<T> = {
  data: Array<StrapiEntity<T>> | null;
  meta?: {
    pagination?: {
      page?: number;
      pageSize?: number;
      pageCount?: number;
      total?: number;
      start?: number;
      limit?: number;
    };
  };
};
type StrapiSingleResponse<T> = { data: StrapiEntity<T> | null };

export type StrapiExtendedProviderConfig = {
  baseUrl: string;
  apiToken?: string;
  revalidateSeconds?: number;
};

const normalizeStrapiApiUrl = (value: string) => {
  const trimmed = value.trim().replace(/\/+$/, "");
  if (!trimmed) return "";
  if (trimmed.endsWith("/api")) return trimmed;
  if (/^https?:\/\/[^/]+$/i.test(trimmed)) return `${trimmed}/api`;
  return trimmed;
};

const getOrigin = (apiUrl: string) => {
  try {
    const u = new URL(apiUrl);
    return `${u.protocol}//${u.host}`;
  } catch {
    return "";
  }
};

const toAbsoluteUrl = (origin: string, url: string) => {
  if (!url) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const normalizedPath = url.startsWith("/api/uploads/") ? url.replace(/^\/api/, "") : url;
  if (!origin) return url;
  try {
    return new URL(normalizedPath, origin).toString();
  } catch {
    return normalizedPath;
  }
};

const extractMediaUrl = (value: unknown, origin: string): string | undefined => {
  if (!value || typeof value !== "object") return undefined;
  const anyValue = value as any;

  const fromAttributes =
    typeof anyValue?.url === "string"
      ? anyValue.url
      : typeof anyValue?.attributes?.url === "string"
        ? anyValue.attributes.url
        : undefined;

  if (fromAttributes) return toAbsoluteUrl(origin, fromAttributes);

  const nestedData = anyValue?.data;
  if (!nestedData) return undefined;
  if (Array.isArray(nestedData)) {
    const first = nestedData[0];
    if (!first) return undefined;
    return extractMediaUrl(first, origin);
  }
  return extractMediaUrl(nestedData, origin);
};

const extractMediaUrls = (value: unknown, origin: string): string[] | undefined => {
  if (!value || typeof value !== "object") return undefined;
  const anyValue = value as any;
  const nestedData = anyValue?.data;
  if (!nestedData) {
    const single = extractMediaUrl(value, origin);
    return single ? [single] : undefined;
  }
  if (Array.isArray(nestedData)) {
    const urls = nestedData.map((item) => extractMediaUrl(item, origin)).filter(Boolean) as string[];
    return urls.length ? urls : undefined;
  }
  const single = extractMediaUrl(nestedData, origin);
  return single ? [single] : undefined;
};

const normalizeEntity = <T extends Record<string, any>>(entity: StrapiEntity<T>, origin: string): T & { id: string } => {
  const attributes = (entity.attributes && typeof entity.attributes === "object" ? entity.attributes : entity) as T;
  const normalized: any = { id: String((entity as any).id), ...(attributes as any) };

  if (normalized.image) {
    if (typeof normalized.image === "string") {
      normalized.image = toAbsoluteUrl(origin, normalized.image);
    } else {
      const url = extractMediaUrl(normalized.image, origin);
      if (url) normalized.image = url;
    }
  }

  if (normalized.gallery) {
    if (Array.isArray(normalized.gallery)) {
      const urls = normalized.gallery
        .filter((v: unknown) => typeof v === "string")
        .map((v: string) => toAbsoluteUrl(origin, v));
      if (urls.length) normalized.gallery = urls;
    } else {
      const urls = extractMediaUrls(normalized.gallery, origin);
      if (urls) normalized.gallery = urls;
    }
  }

  if (normalized.seo && typeof normalized.seo === "object") {
    const seo: any = normalized.seo;
    const maybeTitle = typeof seo.title === "string" ? seo.title : typeof seo.metaTitle === "string" ? seo.metaTitle : undefined;
    const maybeDescription =
      typeof seo.description === "string"
        ? seo.description
        : typeof seo.metaDescription === "string"
          ? seo.metaDescription
          : undefined;
    const maybeKeywords = typeof seo.keywords === "string" ? seo.keywords.split(",").map((v: string) => v.trim()).filter(Boolean) : undefined;
    const seoImageUrl = extractMediaUrl(seo.image ?? seo.metaImage, origin);
    normalized.seo = {
      title: maybeTitle,
      description: maybeDescription,
      keywords: maybeKeywords,
      canonical: typeof seo.canonical === "string" ? seo.canonical : undefined,
      imageUrl: seoImageUrl,
    };
    if (maybeTitle && !normalized.seoTitle) normalized.seoTitle = maybeTitle;
    if (maybeDescription && !normalized.seoDescription) normalized.seoDescription = maybeDescription;
  }

  return normalized as T & { id: string };
};

const encodeStrapiQuery = (params: Array<[string, string | number | boolean | undefined]>) => {
  const sp = new URLSearchParams();
  for (const [key, value] of params) {
    if (value === undefined) continue;
    sp.append(key, String(value));
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
};

const contentTypeConfig = {
  exams: { path: "/exams", dateField: "examDate", searchFields: ["titleHindi", "title", "organizationHindi", "organization"] },
  results: { path: "/results", dateField: "resultDate", searchFields: ["titleHindi", "title", "organizationHindi", "organization"] },
  institutions: { path: "/institutions", searchFields: ["nameHindi", "name", "address][street", "address][streetHindi", "address][city", "address][district", "address][state"] },
  educationNews: { path: "/education-news", dateField: "publishedAt", searchFields: ["titleHindi", "title", "excerptHindi", "excerpt", "contentHindi", "content"] },
  holidays: { path: "/holidays", dateField: "date", searchFields: ["nameHindi", "name", "descriptionHindi", "description"] },
  restaurants: { path: "/restaurants", searchFields: ["nameHindi", "name", "address][street", "address][streetHindi", "address][city", "address][district", "descriptionHindi", "description"] },
  fashionStores: { path: "/fashion-stores", searchFields: ["nameHindi", "name", "city", "district", "descriptionHindi", "description"] },
  shoppingCentres: { path: "/shopping-centres", searchFields: ["nameHindi", "name", "city", "district", "descriptionHindi", "description"] },
  places: { path: "/places", searchFields: ["nameHindi", "name", "city", "district", "descriptionHindi", "description"] },
  events: {
    path: "/events",
    dateField: "date",
    backendDateField: "startDate",
    searchFields: ["titleHindi", "title", "city", "district", "venueHindi", "venue", "descriptionHindi", "description"],
  },
} as const;

type ContentTypeKey = keyof typeof contentTypeConfig;

  const buildListQuery = (contentType: ContentTypeKey, params?: ExtendedQueryParams) => {
  const query: Array<[string, string | number | boolean | undefined]> = [];
  const limit = params?.limit ?? 10;
  const offset = params?.offset ?? 0;

  query.push(["publicationState", "live"]);
  query.push(["filters[publishedAt][$notNull]", true]);
  query.push(["pagination[withCount]", true]);
  query.push(["pagination[start]", offset]);
  query.push(["pagination[limit]", limit]);

  if (params?.orderBy) {
    const order = params?.order || "desc";
    query.push(["sort[0]", `${params.orderBy}:${order}`]);
  }

  if (params?.category) query.push(["filters[category][$eq]", params.category]);
  if (params?.subcategory) query.push(["filters[subcategory][$eq]", params.subcategory]);
  if (params?.type) query.push(["filters[type][$eq]", params.type]);
  if (params?.city) {
    if (contentType === "institutions" || contentType === "restaurants") {
      query.push(["filters[address][city][$eq]", params.city]);
    } else {
      query.push(["filters[city][$eq]", params.city]);
    }
  }
  if (params?.district) {
    if (contentType === "institutions" || contentType === "restaurants") {
      query.push(["filters[address][district][$eq]", params.district]);
    } else {
      query.push(["filters[district][$eq]", params.district]);
    }
  }
  if (params?.status) query.push(["filters[status][$eq]", params.status]);
  if (params?.applicationStatus) query.push(["filters[applicationStatus][$eq]", params.applicationStatus]);
  if (params?.resultStatus) query.push(["filters[resultStatus][$eq]", params.resultStatus]);
  if (params?.featured !== undefined) query.push(["filters[isFeatured][$eq]", params.featured]);
  if (params?.popular !== undefined) query.push(["filters[isPopular][$eq]", params.popular]);

  const cfg: any = contentTypeConfig[contentType] as any;
  const dateField = (cfg.backendDateField || cfg.dateField) as string | undefined;
  if (dateField) {
    if (params?.dateFrom) query.push([`filters[${dateField}][$gte]`, params.dateFrom]);
    if (params?.dateTo) query.push([`filters[${dateField}][$lte]`, params.dateTo]);
  }

  if (params?.search) {
    const fields = contentTypeConfig[contentType].searchFields;
    fields.forEach((field, index) => {
      query.push([`filters[$or][${index}][${field}][$containsi]`, params.search!]);
    });
  }

  query.push(["populate", "*"]);

  return query;
};

const buildSlugQuery = (contentType: ContentTypeKey, slug: string) => {
  const query: Array<[string, string | number | boolean | undefined]> = [];
  query.push(["publicationState", "live"]);
  query.push(["filters[publishedAt][$notNull]", true]);
  query.push(["filters[slug][$eq]", slug]);
  query.push(["pagination[withCount]", false]);
  query.push(["pagination[start]", 0]);
  query.push(["pagination[limit]", 1]);
  query.push(["populate", "*"]);
  return query;
};

export const __strapiExtendedInternal = {
  normalizeStrapiApiUrl,
  getOrigin,
  normalizeEntity,
};

export const createStrapiExtendedProvider = (config: StrapiExtendedProviderConfig): ExtendedCMSProvider => {
  const baseUrl = normalizeStrapiApiUrl(config.baseUrl);
  const origin = getOrigin(baseUrl);
  const revalidateSeconds = config.revalidateSeconds ?? 120;

  const buildDirectUrl = (path: string, query?: Array<[string, string | number | boolean | undefined]>) =>
    `${baseUrl}${path}${query ? encodeStrapiQuery(query) : ""}`;

  const buildProxyUrl = (path: string, query?: Array<[string, string | number | boolean | undefined]>) =>
    `/api/cms/strapi${path}${query ? encodeStrapiQuery(query) : ""}`;

  const fetchJson = async <T>(
    input: RequestInfo,
    init?: RequestInit,
    options?: { allowNotFound?: boolean; revalidate?: number },
  ) => {
    const nextOptions =
      typeof window === "undefined" && options?.revalidate !== undefined ? { next: { revalidate: options.revalidate } } : {};
    const response = await fetch(input, { ...init, ...nextOptions });
    if (response.status === 204) return null as T;
    if (!response.ok) {
      if (response.status === 404 && options?.allowNotFound !== false) return null as T;
      let message = `Request failed with status ${response.status}`;
      try {
        const body = await response.json();
        const maybeMessage = (body as any)?.error?.message || (body as any)?.message;
        if (typeof maybeMessage === "string" && maybeMessage.trim()) message = maybeMessage;
      } catch {
        void 0;
      }
      const err: any = new Error(message);
      err.status = response.status;
      throw err;
    }
    return (await response.json()) as T;
  };

  const getPublicHeaders = () => {
    const headers: Record<string, string> = {};
    if (config.apiToken) headers.Authorization = `Bearer ${config.apiToken}`;
    return headers;
  };

  const toPaginated = <T extends Record<string, any>>(
    rawItems: Array<T & { id: string }>,
    contentType: ContentTypeKey,
    params?: ExtendedQueryParams,
  ): PaginatedResponse<T & { id: string }> => {
    let items = [...rawItems];

    if (params?.category) items = items.filter((item: any) => item?.category === params.category);
    if (params?.subcategory) items = items.filter((item: any) => item?.subcategory === params.subcategory);
    if (params?.type) items = items.filter((item: any) => item?.type === params.type);
    if (params?.city) items = items.filter((item: any) => item?.city === params.city);
    if (params?.district) items = items.filter((item: any) => item?.district === params.district);
    if (params?.status) items = items.filter((item: any) => item?.status === params.status);
    if (params?.applicationStatus) items = items.filter((item: any) => item?.applicationStatus === params.applicationStatus);
    if (params?.resultStatus) items = items.filter((item: any) => item?.resultStatus === params.resultStatus);
    if (params?.featured !== undefined) items = items.filter((item: any) => Boolean(item?.isFeatured) === params.featured);
    if (params?.popular !== undefined) items = items.filter((item: any) => Boolean(item?.isPopular) === params.popular);

    const cfg: any = contentTypeConfig[contentType] as any;
    const dateField = cfg.dateField as string | undefined;
    if (dateField && (params?.dateFrom || params?.dateTo)) {
      const from = params?.dateFrom ? new Date(params.dateFrom).getTime() : undefined;
      const to = params?.dateTo ? new Date(params.dateTo).getTime() : undefined;
      items = items.filter((item: any) => {
        const raw = item?.[dateField];
        if (!raw) return false;
        const t = new Date(raw).getTime();
        if (from !== undefined && t < from) return false;
        if (to !== undefined && t > to) return false;
        return true;
      });
    }

    if (params?.search) {
      const q = params.search.toLowerCase();
      const fields = contentTypeConfig[contentType].searchFields;
      items = items.filter((item: any) =>
        fields.some((field) => {
          const value = item?.[field];
          if (typeof value !== "string") return false;
          return value.toLowerCase().includes(q);
        }),
      );
    }

    if (params?.orderBy) {
      const dir = (params.order || "desc").toLowerCase() === "asc" ? 1 : -1;
      const key = params.orderBy;
      items.sort((a: any, b: any) => {
        const av = a?.[key];
        const bv = b?.[key];
        if (av === bv) return 0;
        if (av === undefined || av === null) return 1;
        if (bv === undefined || bv === null) return -1;
        if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
        return String(av).localeCompare(String(bv)) * dir;
      });
    }

    const limit = params?.limit ?? 10;
    const offset = params?.offset ?? 0;
    const total = items.length;
    const data = items.slice(offset, offset + limit);
    const page = Math.floor(offset / limit) + 1;
    const pageSize = limit;
    const totalPages = Math.ceil(total / limit);

    return { data, total, page, pageSize, totalPages };
  };

  const stripPublishedFilter = (query: Array<[string, string | number | boolean | undefined]>) =>
    query.filter(([key]) => key !== "filters[publishedAt][$notNull]");

  const deriveStatus = (iso: string, todayIso: string) => {
    const dateOnly = iso.slice(0, 10);
    if (dateOnly > todayIso) return "upcoming";
    if (dateOnly < todayIso) return "completed";
    return "ongoing";
  };

  const applyDerivedFields = <T extends Record<string, any>>(contentType: ContentTypeKey, item: T) => {
    const todayIso = new Date().toISOString().slice(0, 10);
    const next: any = { ...item };

    if (contentType === "events") {
      if (!next.date && typeof next.startDate === "string") {
        next.date = next.startDate;
      }
      if (!next.status && typeof next.date === "string") {
        next.status = deriveStatus(next.date, todayIso);
      }
      return next as T;
    }

    if (contentType === "institutions") {
      const address = next.address && typeof next.address === "object" ? (next.address as any) : null;
      if (address) {
        if (!next.address) next.address = address.street || address.streetHindi || "";
        if (!next.addressHindi) next.addressHindi = address.streetHindi || address.street || "";
        if (!next.city) next.city = address.city;
        if (!next.district) next.district = address.district;
        if (!next.state) next.state = address.state;
        if (!next.pincode) next.pincode = address.pincode;
      }
      if (next.reviewCount !== undefined && next.reviews === undefined) {
        next.reviews = next.reviewCount;
      }
      return next as T;
    }

    if (contentType === "restaurants") {
      const address = next.address && typeof next.address === "object" ? (next.address as any) : null;
      if (address) {
        if (!next.address) next.address = address.street || address.streetHindi || "";
        if (!next.addressHindi) next.addressHindi = address.streetHindi || address.street || "";
        if (!next.city) next.city = address.city;
        if (!next.district) next.district = address.district;
        if (!next.state) next.state = address.state;
        if (!next.pincode) next.pincode = address.pincode;
      }
      const contact = next.contact && typeof next.contact === "object" ? (next.contact as any) : null;
      if (contact) {
        if (!next.phone) next.phone = contact.phone || contact.alternatePhone;
        if (!next.email) next.email = contact.email;
        if (!next.website) next.website = contact.website;
        if (!next.whatsapp) next.whatsapp = contact.whatsapp;
      }
      if (next.reviewCount !== undefined && next.reviews === undefined) {
        next.reviews = next.reviewCount;
      }
      return next as T;
    }

    if (contentType === "exams" && !next.examStatus && typeof next.examDate === "string") {
      next.examStatus = deriveStatus(next.examDate, todayIso);
    }
    if (contentType === "results" && !next.status && typeof next.resultDate === "string") {
      next.status = deriveStatus(next.resultDate, todayIso);
    }
    return next as T;
  };

  const extractList = <T extends Record<string, any>>(
    result: any,
  ): Array<StrapiEntity<T>> => {
    if (!result) return [];
    if (Array.isArray(result)) return result as Array<StrapiEntity<T>>;
    if (Array.isArray(result?.data)) return result.data as Array<StrapiEntity<T>>;
    return [];
  };

  const list = async <T extends Record<string, any>>(
    contentType: ContentTypeKey,
    params?: ExtendedQueryParams,
  ): Promise<PaginatedResponse<T & { id: string }>> => {
    const query = buildListQuery(contentType, params);
    if (typeof window !== "undefined") {
      const url = buildProxyUrl(contentTypeConfig[contentType].path, query);
      let result: any = null;
      try {
        result = await fetchJson<any>(url, { method: "GET" }, { allowNotFound: true });
      } catch (error: any) {
        if (error?.status === 400) {
          result = await fetchJson<any>(
            buildProxyUrl(contentTypeConfig[contentType].path, stripPublishedFilter(query)),
            { method: "GET" },
            { allowNotFound: true },
          );
        } else {
          throw error;
        }
      }
      const items = extractList<T>(result).map((e) =>
        applyDerivedFields(contentType, normalizeEntity(e as StrapiEntity<T>, origin)),
      );

      const pagination = result?.meta?.pagination;
      if (pagination && typeof pagination === "object") {
        const total = typeof pagination.total === "number" ? pagination.total : items.length;
        const pageSize = typeof pagination.pageSize === "number" ? pagination.pageSize : params?.limit ?? 10;
        const page = typeof pagination.page === "number" ? pagination.page : Math.floor((params?.offset ?? 0) / pageSize) + 1;
        const totalPages =
          typeof pagination.pageCount === "number" ? pagination.pageCount : Math.max(1, Math.ceil(total / pageSize));
        return { data: items, total, page, pageSize, totalPages };
      }

      return toPaginated(items, contentType, params);
    }

    const url = buildDirectUrl(contentTypeConfig[contentType].path, query);
    let result: any = null;
    try {
      result = await fetchJson<any>(
        url,
        { method: "GET", headers: getPublicHeaders() },
        { revalidate: revalidateSeconds },
      );
    } catch (error: any) {
      if (error?.status === 400) {
        const fallbackUrl = buildDirectUrl(contentTypeConfig[contentType].path, stripPublishedFilter(query));
        result = await fetchJson<any>(
          fallbackUrl,
          { method: "GET", headers: getPublicHeaders() },
          { revalidate: revalidateSeconds },
        );
      } else {
        throw error;
      }
    }
    const items = extractList<T>(result).map((e) =>
      applyDerivedFields(contentType, normalizeEntity(e as StrapiEntity<T>, origin)),
    );

    const pagination = result?.meta?.pagination;
    if (pagination && typeof pagination === "object") {
      const total = typeof pagination.total === "number" ? pagination.total : items.length;
      const pageSize = typeof pagination.pageSize === "number" ? pagination.pageSize : params?.limit ?? 10;
      const page = typeof pagination.page === "number" ? pagination.page : Math.floor((params?.offset ?? 0) / pageSize) + 1;
      const totalPages =
        typeof pagination.pageCount === "number" ? pagination.pageCount : Math.max(1, Math.ceil(total / pageSize));
      return { data: items, total, page, pageSize, totalPages };
    }

    return toPaginated(items, contentType, params);
  };

  const bySlug = async <T extends Record<string, any>>(contentType: ContentTypeKey, slug: string) => {
    if (typeof window !== "undefined") {
      const slugUrl = buildProxyUrl(`${contentTypeConfig[contentType].path}/slug/${encodeURIComponent(slug)}`);
      let bySlugResult: any = null;
      try {
        bySlugResult = await fetchJson<any>(slugUrl, { method: "GET" }, { allowNotFound: true });
      } catch (error: any) {
        if (error?.status !== 404) throw error;
      }
      if (bySlugResult) {
        if (Array.isArray(bySlugResult)) {
          const first = bySlugResult[0];
          return first ? (applyDerivedFields(contentType, normalizeEntity(first as StrapiEntity<T>, origin)) as any) : null;
        }
        if (bySlugResult?.data) {
          const entity = Array.isArray(bySlugResult.data) ? bySlugResult.data[0] : bySlugResult.data;
          return entity
            ? (applyDerivedFields(contentType, normalizeEntity(entity as StrapiEntity<T>, origin)) as any)
            : null;
        }
        return applyDerivedFields(contentType, normalizeEntity(bySlugResult as StrapiEntity<T>, origin)) as any;
      }

      const query = buildSlugQuery(contentType, slug);
      let result: any = null;
      try {
        result = await fetchJson<any>(buildProxyUrl(contentTypeConfig[contentType].path, query), { method: "GET" }, { allowNotFound: true });
      } catch (error: any) {
        if (error?.status === 400) {
          result = await fetchJson<any>(
            buildProxyUrl(contentTypeConfig[contentType].path, stripPublishedFilter(query)),
            { method: "GET" },
            { allowNotFound: true },
          );
        } else {
          throw error;
        }
      }
      const first = extractList<T>(result)[0];
      if (first) return applyDerivedFields(contentType, normalizeEntity(first as StrapiEntity<T>, origin)) as any;

      const all = await list<T>(contentType, { limit: 2000, offset: 0 });
      const found = all.data.find((item: any) => item?.slug === slug);
      return found || null;
    }

    const query = buildSlugQuery(contentType, slug);
    let result: any = null;
    try {
      result = await fetchJson<any>(
        buildDirectUrl(contentTypeConfig[contentType].path, query),
        { method: "GET", headers: getPublicHeaders() },
        { allowNotFound: true, revalidate: revalidateSeconds },
      );
    } catch (error: any) {
      if (error?.status === 400) {
        result = await fetchJson<any>(
          buildDirectUrl(contentTypeConfig[contentType].path, stripPublishedFilter(query)),
          { method: "GET", headers: getPublicHeaders() },
          { allowNotFound: true, revalidate: revalidateSeconds },
        );
      } else {
        throw error;
      }
    }
    const first = extractList<T>(result)[0];
    if (!first) return null;
    return applyDerivedFields(contentType, normalizeEntity(first as StrapiEntity<T>, origin));
  };

  const create = async <T extends Record<string, any>>(contentType: ContentTypeKey, value: any): Promise<T & { id: string }> => {
    const url = buildProxyUrl(contentTypeConfig[contentType].path);
    const result = await fetchJson<any>(
      url,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ data: value || {} }),
      },
      { allowNotFound: false },
    );
    const entity = result?.data && typeof result.data === "object" ? result.data : result;
    if (!entity) throw new Error("Failed to create item");
    return normalizeEntity(entity as StrapiEntity<T>, origin);
  };

  const update = async <T extends Record<string, any>>(
    contentType: ContentTypeKey,
    id: string,
    value: any,
  ): Promise<T & { id: string }> => {
    const url = buildProxyUrl(`${contentTypeConfig[contentType].path}/${encodeURIComponent(id)}`);
    const result = await fetchJson<any>(
      url,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ data: value || {} }),
      },
      { allowNotFound: false },
    );
    const entity = result?.data && typeof result.data === "object" ? result.data : result;
    if (!entity) throw new Error("Failed to update item");
    return normalizeEntity(entity as StrapiEntity<T>, origin);
  };

  const remove = async (contentType: ContentTypeKey, id: string): Promise<void> => {
    const url = buildProxyUrl(`${contentTypeConfig[contentType].path}/${encodeURIComponent(id)}`);
    await fetchJson<StrapiSingleResponse<unknown>>(
      url,
      { method: "DELETE", credentials: "include" },
      { allowNotFound: false },
    );
  };

  return {
    async getExams(params = {}) {
      return list<CMSExam>("exams", params);
    },
    async getExamBySlug(slug: string) {
      return bySlug<CMSExam>("exams", slug);
    },
    async getResults(params = {}) {
      return list<CMSResult>("results", params);
    },
    async getResultBySlug(slug: string) {
      return bySlug<CMSResult>("results", slug);
    },
    async getInstitutions(params = {}) {
      return list<CMSInstitution>("institutions", params);
    },
    async getInstitutionBySlug(slug: string) {
      return bySlug<CMSInstitution>("institutions", slug);
    },
    async getEducationNews(params = {}) {
      return list<CMSEducationNews>("educationNews", params);
    },
    async getEducationNewsBySlug(slug: string) {
      return bySlug<CMSEducationNews>("educationNews", slug);
    },
    async getHolidays(params = {}) {
      return list<CMSHoliday>("holidays", params);
    },
    async getHolidayBySlug(slug: string) {
      return bySlug<CMSHoliday>("holidays", slug);
    },
    async getHolidaysByMonth(year: number, month: number) {
      const from = new Date(year, month, 1);
      const to = new Date(year, month + 1, 0);
      const result = await list<CMSHoliday>("holidays", {
        limit: 200,
        offset: 0,
        dateFrom: from.toISOString().slice(0, 10),
        dateTo: to.toISOString().slice(0, 10),
      });
      return result.data;
    },
    async getRestaurants(params = {}) {
      return list<CMSRestaurant>("restaurants", params);
    },
    async getRestaurantBySlug(slug: string) {
      return bySlug<CMSRestaurant>("restaurants", slug);
    },
    async getFashionStores(params = {}) {
      return list<CMSFashionStore>("fashionStores", params);
    },
    async getFashionStoreBySlug(slug: string) {
      return bySlug<CMSFashionStore>("fashionStores", slug);
    },
    async getShoppingCentres(params = {}) {
      return list<CMSShoppingCentre>("shoppingCentres", params);
    },
    async getShoppingCentreBySlug(slug: string) {
      return bySlug<CMSShoppingCentre>("shoppingCentres", slug);
    },
    async getFamousPlaces(params = {}) {
      return list<CMSFamousPlace>("places", params);
    },
    async getFamousPlaceBySlug(slug: string) {
      return bySlug<CMSFamousPlace>("places", slug);
    },
    async getEvents(params = {}) {
      return list<CMSEvent>("events", params);
    },
    async getEventBySlug(slug: string) {
      return bySlug<CMSEvent>("events", slug);
    },
    async getUpcomingEvents(limit = 5) {
      const result = await list<CMSEvent>("events", { limit, offset: 0, status: "upcoming", orderBy: "date", order: "asc" });
      return result.data;
    },
    async getCalendarEvents(year: number, month: number) {
      const [exams, results, holidays, events] = await Promise.all([
        list<CMSExam>("exams", { limit: 200, offset: 0 }),
        list<CMSResult>("results", { limit: 200, offset: 0 }),
        list<CMSHoliday>("holidays", { limit: 200, offset: 0 }),
        list<CMSEvent>("events", { limit: 200, offset: 0 }),
      ]);

      const calendar: Array<{
        id: string;
        title: string;
        titleHindi: string;
        date: string;
        endDate?: string;
        type: "exam" | "result" | "holiday" | "event";
        category?: string;
        color?: string;
        link?: string;
        status?: string;
      }> = [];

      const inMonth = (iso: string) => {
        const date = new Date(iso);
        return date.getFullYear() === year && date.getMonth() === month;
      };

      exams.data.forEach((exam) => {
        if (!inMonth(exam.examDate)) return;
        calendar.push({
          id: exam.id,
          title: exam.title,
          titleHindi: exam.titleHindi,
          date: exam.examDate,
          type: "exam",
          category: exam.category,
          color: "#3b82f6",
          link: `/education-jobs/exams/${exam.slug}`,
        });
      });

      results.data.forEach((resultItem) => {
        if (!inMonth(resultItem.resultDate)) return;
        calendar.push({
          id: resultItem.id,
          title: resultItem.title,
          titleHindi: resultItem.titleHindi,
          date: resultItem.resultDate,
          type: "result",
          category: resultItem.category,
          color: "#22c55e",
          link: `/education-jobs/results/${resultItem.slug}`,
        });
      });

      holidays.data.forEach((holiday) => {
        if (!inMonth(holiday.date)) return;
        calendar.push({
          id: holiday.id,
          title: holiday.name,
          titleHindi: holiday.nameHindi,
          date: holiday.date,
          endDate: holiday.endDate,
          type: "holiday",
          category: holiday.type,
          color: "#f59e0b",
          link: `/religion-culture/holidays/${holiday.slug}`,
        });
      });

      events.data.forEach((event) => {
        if (!inMonth(event.date)) return;
        calendar.push({
          id: event.id,
          title: event.title,
          titleHindi: event.titleHindi,
          date: event.date,
          endDate: event.endDate,
          type: "event",
          category: event.category,
          color: "#a855f7",
          link: `/food-lifestyle/events/${event.slug}`,
          status: event.status,
        });
      });

      calendar.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      return calendar;
    },
    async createExam(exam) {
      return create<CMSExam>("exams", exam);
    },
    async updateExam(id, exam) {
      return update<CMSExam>("exams", id, exam);
    },
    async deleteExam(id) {
      return remove("exams", id);
    },
    async createResult(resultItem) {
      return create<CMSResult>("results", resultItem);
    },
    async updateResult(id, resultItem) {
      return update<CMSResult>("results", id, resultItem);
    },
    async deleteResult(id) {
      return remove("results", id);
    },
    async createInstitution(institution) {
      return create<CMSInstitution>("institutions", institution);
    },
    async updateInstitution(id, institution) {
      return update<CMSInstitution>("institutions", id, institution);
    },
    async deleteInstitution(id) {
      return remove("institutions", id);
    },
    async createHoliday(holiday) {
      return create<CMSHoliday>("holidays", holiday);
    },
    async updateHoliday(id, holiday) {
      return update<CMSHoliday>("holidays", id, holiday);
    },
    async deleteHoliday(id) {
      return remove("holidays", id);
    },
    async createRestaurant(restaurant) {
      return create<CMSRestaurant>("restaurants", restaurant);
    },
    async updateRestaurant(id, restaurant) {
      return update<CMSRestaurant>("restaurants", id, restaurant);
    },
    async deleteRestaurant(id) {
      return remove("restaurants", id);
    },
    async createFashionStore(store) {
      return create<CMSFashionStore>("fashionStores", store);
    },
    async updateFashionStore(id, store) {
      return update<CMSFashionStore>("fashionStores", id, store);
    },
    async deleteFashionStore(id) {
      return remove("fashionStores", id);
    },
    async createShoppingCentre(centre) {
      return create<CMSShoppingCentre>("shoppingCentres", centre);
    },
    async updateShoppingCentre(id, centre) {
      return update<CMSShoppingCentre>("shoppingCentres", id, centre);
    },
    async deleteShoppingCentre(id) {
      return remove("shoppingCentres", id);
    },
    async createFamousPlace(place) {
      return create<CMSFamousPlace>("places", place);
    },
    async updateFamousPlace(id, place) {
      return update<CMSFamousPlace>("places", id, place);
    },
    async deleteFamousPlace(id) {
      return remove("places", id);
    },
    async createEvent(event) {
      return create<CMSEvent>("events", event);
    },
    async updateEvent(id, event) {
      return update<CMSEvent>("events", id, event);
    },
    async deleteEvent(id) {
      return remove("events", id);
    },
  };
};
