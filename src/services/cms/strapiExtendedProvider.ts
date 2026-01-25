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
  if (!origin) return url;
  try {
    return new URL(url, origin).toString();
  } catch {
    return url;
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
    const url = extractMediaUrl(normalized.image, origin);
    if (url) normalized.image = url;
  }

  if (normalized.gallery) {
    const urls = extractMediaUrls(normalized.gallery, origin);
    if (urls) normalized.gallery = urls;
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
  exams: { path: "/exams", searchFields: ["titleHindi", "title", "organizationHindi", "organization"] },
  results: { path: "/results", searchFields: ["titleHindi", "title", "organizationHindi", "organization"] },
  institutions: { path: "/institutions", searchFields: ["nameHindi", "name", "city", "district", "state"] },
  holidays: { path: "/holidays", searchFields: ["nameHindi", "name", "descriptionHindi", "description"] },
  restaurants: { path: "/restaurants", searchFields: ["nameHindi", "name", "city", "district", "descriptionHindi", "description"] },
  fashionStores: { path: "/fashion-stores", searchFields: ["nameHindi", "name", "city", "district", "descriptionHindi", "description"] },
  shoppingCentres: { path: "/shopping-centres", searchFields: ["nameHindi", "name", "city", "district", "descriptionHindi", "description"] },
  places: { path: "/places", searchFields: ["nameHindi", "name", "city", "district", "descriptionHindi", "description"] },
  events: { path: "/events", searchFields: ["titleHindi", "title", "city", "district", "venueHindi", "venue", "descriptionHindi", "description"] },
} as const;

type ContentTypeKey = keyof typeof contentTypeConfig;

const buildListQuery = (contentType: ContentTypeKey, params?: ExtendedQueryParams) => {
  const query: Array<[string, string | number | boolean | undefined]> = [];
  const limit = params?.limit ?? 10;
  const offset = params?.offset ?? 0;

  query.push(["publicationState", "live"]);
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
  if (params?.city) query.push(["filters[city][$eq]", params.city]);
  if (params?.district) query.push(["filters[district][$eq]", params.district]);
  if (params?.status) query.push(["filters[status][$eq]", params.status]);
  if (params?.applicationStatus) query.push(["filters[applicationStatus][$eq]", params.applicationStatus]);
  if (params?.resultStatus) query.push(["filters[resultStatus][$eq]", params.resultStatus]);
  if (params?.featured !== undefined) query.push(["filters[isFeatured][$eq]", params.featured]);
  if (params?.popular !== undefined) query.push(["filters[isPopular][$eq]", params.popular]);

  if (params?.dateFrom) query.push(["filters[date][$gte]", params.dateFrom]);
  if (params?.dateTo) query.push(["filters[date][$lte]", params.dateTo]);

  if (params?.search) {
    const fields = contentTypeConfig[contentType].searchFields;
    fields.forEach((field, index) => {
      query.push([`filters[$or][${index}][${field}][$containsi]`, params.search!]);
    });
  }

  if (contentType === "exams" || contentType === "results" || contentType === "institutions") {
    query.push(["populate[image]", "*"]);
  } else if (contentType === "events") {
    query.push(["populate[image]", "*"]);
  } else {
    query.push(["populate[image]", "*"]);
  }

  return query;
};

const buildSlugQuery = (contentType: ContentTypeKey, slug: string) => {
  const query: Array<[string, string | number | boolean | undefined]> = [];
  query.push(["publicationState", "live"]);
  query.push(["filters[slug][$eq]", slug]);
  query.push(["pagination[withCount]", false]);
  query.push(["pagination[start]", 0]);
  query.push(["pagination[limit]", 1]);
  query.push(["populate[image]", "*"]);
  query.push(["populate[gallery]", "*"]);
  query.push(["populate[seo]", "*"]);
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
      throw new Error(message);
    }
    return (await response.json()) as T;
  };

  const getPublicHeaders = () => {
    const headers: Record<string, string> = {};
    if (config.apiToken) headers.Authorization = `Bearer ${config.apiToken}`;
    return headers;
  };

  const list = async <T extends Record<string, any>>(
    contentType: ContentTypeKey,
    params?: ExtendedQueryParams,
  ): Promise<PaginatedResponse<T & { id: string }>> => {
    const query = buildListQuery(contentType, params);
    if (typeof window !== "undefined") {
      const url = `/api/cms/strapi-extended${contentTypeConfig[contentType].path}${encodeStrapiQuery(query)}`;
      const result = await fetchJson<PaginatedResponse<T & { id: string }>>(url, { method: "GET" }, { allowNotFound: true });
      if (!result) {
        return {
          data: [],
          total: 0,
          page: 1,
          pageSize: params?.limit ?? 10,
          totalPages: 0,
        };
      }
      return result;
    }

    const url = buildDirectUrl(contentTypeConfig[contentType].path, query);
    const result = await fetchJson<StrapiCollectionResponse<T>>(
      url,
      { method: "GET", headers: getPublicHeaders() },
      { revalidate: revalidateSeconds },
    );

    const items = (result?.data || []).map((e) => normalizeEntity(e as StrapiEntity<T>, origin));
    const pagination = result?.meta?.pagination;
    const total = typeof pagination?.total === "number" ? pagination.total : items.length;
    const pageSize = typeof pagination?.pageSize === "number" ? pagination.pageSize : params?.limit ?? 10;
    const page = typeof pagination?.page === "number" ? pagination.page : Math.floor((params?.offset ?? 0) / pageSize) + 1;
    const totalPages = typeof pagination?.pageCount === "number" ? pagination.pageCount : Math.max(1, Math.ceil(total / pageSize));

    return { data: items, total, page, pageSize, totalPages };
  };

  const bySlug = async <T extends Record<string, any>>(contentType: ContentTypeKey, slug: string) => {
    const query = buildSlugQuery(contentType, slug);
    if (typeof window !== "undefined") {
      const url = `/api/cms/strapi-extended${contentTypeConfig[contentType].path}${encodeStrapiQuery([
        ...query,
        ["single", "true"],
      ])}`;
      const result = await fetchJson<(T & { id: string }) | null>(url, { method: "GET" }, { allowNotFound: true });
      return result || null;
    }

    const url = buildDirectUrl(contentTypeConfig[contentType].path, query);
    const result = await fetchJson<StrapiCollectionResponse<T>>(
      url,
      { method: "GET", headers: getPublicHeaders() },
      { allowNotFound: true, revalidate: revalidateSeconds },
    );

    const first = result?.data?.[0];
    if (!first) return null;
    return normalizeEntity(first as StrapiEntity<T>, origin);
  };

  const create = async <T extends Record<string, any>>(contentType: ContentTypeKey, value: any): Promise<T & { id: string }> => {
    const url = buildProxyUrl(contentTypeConfig[contentType].path);
    const result = await fetchJson<StrapiSingleResponse<T>>(
      url,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ data: value || {} }),
      },
      { allowNotFound: false },
    );
    if (!result?.data) throw new Error("Failed to create item");
    return normalizeEntity(result.data as StrapiEntity<T>, origin);
  };

  const update = async <T extends Record<string, any>>(
    contentType: ContentTypeKey,
    id: string,
    value: any,
  ): Promise<T & { id: string }> => {
    const url = buildProxyUrl(`${contentTypeConfig[contentType].path}/${encodeURIComponent(id)}`);
    const result = await fetchJson<StrapiSingleResponse<T>>(
      url,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ data: value || {} }),
      },
      { allowNotFound: false },
    );
    if (!result?.data) throw new Error("Failed to update item");
    return normalizeEntity(result.data as StrapiEntity<T>, origin);
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
