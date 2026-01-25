// Extended CMS Provider for new content modules
import type {
  CMSExam,
  CMSResult,
  CMSInstitution,
  CMSHoliday,
  CMSRestaurant,
  CMSFashionStore,
  CMSShoppingCentre,
  CMSFamousPlace,
  CMSEvent,
  CalendarEvent,
  ExtendedQueryParams,
} from './extendedTypes';
import {
  mockExams,
  mockResults,
  mockInstitutions,
  mockHolidays,
  mockRestaurants,
  mockFashionStores,
  mockShoppingCentres,
  mockFamousPlaces,
  mockEvents,
} from './extendedMockData';
import type { PaginatedResponse } from './types';
import { getCMSConfig } from './index';
import type { CMSConfig } from './provider';
import { createStrapiExtendedProvider } from './strapiExtendedProvider';

// Helper function for filtering and pagination
const applyFiltersAndPagination = <T extends { id: string }>(
  items: T[],
  params: ExtendedQueryParams,
  filterFn?: (item: T) => boolean
): PaginatedResponse<T> => {
  const filtered = filterFn ? items.filter(filterFn) : [...items];
  
  const limit = params.limit || 10;
  const offset = params.offset || 0;
  const total = filtered.length;
  const data = filtered.slice(offset, offset + limit);
  
  return {
    data,
    total,
    page: Math.floor(offset / limit) + 1,
    pageSize: limit,
    totalPages: Math.ceil(total / limit),
  };
};

export interface ExtendedCMSProvider {
  // Education
  getExams: (params?: ExtendedQueryParams) => Promise<PaginatedResponse<CMSExam>>;
  getExamBySlug: (slug: string) => Promise<CMSExam | null>;
  getResults: (params?: ExtendedQueryParams) => Promise<PaginatedResponse<CMSResult>>;
  getResultBySlug: (slug: string) => Promise<CMSResult | null>;
  getInstitutions: (params?: ExtendedQueryParams) => Promise<PaginatedResponse<CMSInstitution>>;
  getInstitutionBySlug: (slug: string) => Promise<CMSInstitution | null>;
  
  // Culture
  getHolidays: (params?: ExtendedQueryParams) => Promise<PaginatedResponse<CMSHoliday>>;
  getHolidayBySlug: (slug: string) => Promise<CMSHoliday | null>;
  getHolidaysByMonth: (year: number, month: number) => Promise<CMSHoliday[]>;
  
  // Food & Lifestyle
  getRestaurants: (params?: ExtendedQueryParams) => Promise<PaginatedResponse<CMSRestaurant>>;
  getRestaurantBySlug: (slug: string) => Promise<CMSRestaurant | null>;
  getFashionStores: (params?: ExtendedQueryParams) => Promise<PaginatedResponse<CMSFashionStore>>;
  getFashionStoreBySlug: (slug: string) => Promise<CMSFashionStore | null>;
  getShoppingCentres: (params?: ExtendedQueryParams) => Promise<PaginatedResponse<CMSShoppingCentre>>;
  getShoppingCentreBySlug: (slug: string) => Promise<CMSShoppingCentre | null>;
  getFamousPlaces: (params?: ExtendedQueryParams) => Promise<PaginatedResponse<CMSFamousPlace>>;
  getFamousPlaceBySlug: (slug: string) => Promise<CMSFamousPlace | null>;
  
  // Events
  getEvents: (params?: ExtendedQueryParams) => Promise<PaginatedResponse<CMSEvent>>;
  getEventBySlug: (slug: string) => Promise<CMSEvent | null>;
  getUpcomingEvents: (limit?: number) => Promise<CMSEvent[]>;
  
  // Calendar
  getCalendarEvents: (year: number, month: number) => Promise<CalendarEvent[]>;
  
  // CRUD Operations (for admin)
  createExam: (exam: Omit<CMSExam, 'id'>) => Promise<CMSExam>;
  updateExam: (id: string, exam: Partial<CMSExam>) => Promise<CMSExam>;
  deleteExam: (id: string) => Promise<void>;
  
  createResult: (result: Omit<CMSResult, 'id'>) => Promise<CMSResult>;
  updateResult: (id: string, result: Partial<CMSResult>) => Promise<CMSResult>;
  deleteResult: (id: string) => Promise<void>;
  
  createInstitution: (institution: Omit<CMSInstitution, 'id'>) => Promise<CMSInstitution>;
  updateInstitution: (id: string, institution: Partial<CMSInstitution>) => Promise<CMSInstitution>;
  deleteInstitution: (id: string) => Promise<void>;
  
  createHoliday: (holiday: Omit<CMSHoliday, 'id'>) => Promise<CMSHoliday>;
  updateHoliday: (id: string, holiday: Partial<CMSHoliday>) => Promise<CMSHoliday>;
  deleteHoliday: (id: string) => Promise<void>;
  
  createRestaurant: (restaurant: Omit<CMSRestaurant, 'id'>) => Promise<CMSRestaurant>;
  updateRestaurant: (id: string, restaurant: Partial<CMSRestaurant>) => Promise<CMSRestaurant>;
  deleteRestaurant: (id: string) => Promise<void>;
  
  createFashionStore: (store: Omit<CMSFashionStore, 'id'>) => Promise<CMSFashionStore>;
  updateFashionStore: (id: string, store: Partial<CMSFashionStore>) => Promise<CMSFashionStore>;
  deleteFashionStore: (id: string) => Promise<void>;
  
  createShoppingCentre: (centre: Omit<CMSShoppingCentre, 'id'>) => Promise<CMSShoppingCentre>;
  updateShoppingCentre: (id: string, centre: Partial<CMSShoppingCentre>) => Promise<CMSShoppingCentre>;
  deleteShoppingCentre: (id: string) => Promise<void>;
  
  createFamousPlace: (place: Omit<CMSFamousPlace, 'id'>) => Promise<CMSFamousPlace>;
  updateFamousPlace: (id: string, place: Partial<CMSFamousPlace>) => Promise<CMSFamousPlace>;
  deleteFamousPlace: (id: string) => Promise<void>;
  
  createEvent: (event: Omit<CMSEvent, 'id'>) => Promise<CMSEvent>;
  updateEvent: (id: string, event: Partial<CMSEvent>) => Promise<CMSEvent>;
  deleteEvent: (id: string) => Promise<void>;
}

// In-memory storage for mock data mutations
let examsData = [...mockExams];
let resultsData = [...mockResults];
let institutionsData = [...mockInstitutions];
let holidaysData = [...mockHolidays];
let restaurantsData = [...mockRestaurants];
let fashionStoresData = [...mockFashionStores];
let shoppingCentresData = [...mockShoppingCentres];
let famousPlacesData = [...mockFamousPlaces];
let eventsData = [...mockEvents];

export const extendedMockProvider: ExtendedCMSProvider = {
  // Education - Exams
  async getExams(params = {}) {
    return applyFiltersAndPagination(examsData, params, (exam) => {
      if (params.category && exam.category !== params.category) return false;
      if (params.status && exam.status !== params.status) return false;
      if (params.search && !exam.titleHindi.includes(params.search) && !exam.title.toLowerCase().includes(params.search.toLowerCase())) return false;
      return true;
    });
  },
  
  async getExamBySlug(slug) {
    return examsData.find(e => e.slug === slug) || null;
  },
  
  // Education - Results
  async getResults(params = {}) {
    return applyFiltersAndPagination(resultsData, params, (result) => {
      if (params.category && result.category !== params.category) return false;
      if (params.search && !result.titleHindi.includes(params.search) && !result.title.toLowerCase().includes(params.search.toLowerCase())) return false;
      return true;
    });
  },
  
  async getResultBySlug(slug) {
    return resultsData.find(r => r.slug === slug) || null;
  },
  
  // Education - Institutions
  async getInstitutions(params = {}) {
    return applyFiltersAndPagination(institutionsData, params, (inst) => {
      if (params.type && inst.type !== params.type) return false;
      if (params.city && inst.city !== params.city) return false;
      if (params.featured && !inst.isFeatured) return false;
      if (params.search && !inst.nameHindi.includes(params.search) && !inst.name.toLowerCase().includes(params.search.toLowerCase())) return false;
      return true;
    });
  },
  
  async getInstitutionBySlug(slug) {
    return institutionsData.find(i => i.slug === slug) || null;
  },
  
  // Culture - Holidays
  async getHolidays(params = {}) {
    return applyFiltersAndPagination(holidaysData, params, (holiday) => {
      if (params.type && holiday.type !== params.type) return false;
      if (params.search && !holiday.nameHindi.includes(params.search) && !holiday.name.toLowerCase().includes(params.search.toLowerCase())) return false;
      return true;
    });
  },
  
  async getHolidayBySlug(slug) {
    return holidaysData.find(h => h.slug === slug) || null;
  },
  
  async getHolidaysByMonth(year, month) {
    return holidaysData.filter(h => {
      const date = new Date(h.date);
      return date.getFullYear() === year && date.getMonth() === month;
    });
  },
  
  // Food & Lifestyle - Restaurants
  async getRestaurants(params = {}) {
    return applyFiltersAndPagination(restaurantsData, params, (rest) => {
      if (params.type && rest.type !== params.type) return false;
      if (params.city && rest.city !== params.city) return false;
      if (params.featured && !rest.isFeatured) return false;
      if (params.search && !rest.nameHindi.includes(params.search) && !rest.name.toLowerCase().includes(params.search.toLowerCase())) return false;
      return true;
    });
  },
  
  async getRestaurantBySlug(slug) {
    return restaurantsData.find(r => r.slug === slug) || null;
  },
  
  // Fashion Stores
  async getFashionStores(params = {}) {
    return applyFiltersAndPagination(fashionStoresData, params, (store) => {
      if (params.type && store.type !== params.type) return false;
      if (params.category && store.category !== params.category) return false;
      if (params.featured && !store.isFeatured) return false;
      return true;
    });
  },
  
  async getFashionStoreBySlug(slug) {
    return fashionStoresData.find(s => s.slug === slug) || null;
  },
  
  // Shopping Centres
  async getShoppingCentres(params = {}) {
    return applyFiltersAndPagination(shoppingCentresData, params, (centre) => {
      if (params.type && centre.type !== params.type) return false;
      if (params.featured && !centre.isFeatured) return false;
      return true;
    });
  },
  
  async getShoppingCentreBySlug(slug) {
    return shoppingCentresData.find(c => c.slug === slug) || null;
  },
  
  // Famous Places
  async getFamousPlaces(params = {}) {
    return applyFiltersAndPagination(famousPlacesData, params, (place) => {
      if (params.type && place.type !== params.type) return false;
      if (params.featured && !place.isFeatured) return false;
      return true;
    });
  },
  
  async getFamousPlaceBySlug(slug) {
    return famousPlacesData.find(p => p.slug === slug) || null;
  },
  
  // Events
  async getEvents(params = {}) {
    return applyFiltersAndPagination(eventsData, params, (event) => {
      if (params.category && event.category !== params.category) return false;
      if (params.status && event.status !== params.status) return false;
      if (params.city && event.city !== params.city) return false;
      if (params.featured && !event.isFeatured) return false;
      if (params.search && !event.titleHindi.includes(params.search) && !event.title.toLowerCase().includes(params.search.toLowerCase())) return false;
      return true;
    });
  },
  
  async getEventBySlug(slug) {
    return eventsData.find(e => e.slug === slug) || null;
  },
  
  async getUpcomingEvents(limit = 5) {
    const now = new Date();
    return eventsData
      .filter(e => new Date(e.date) >= now && e.status === 'upcoming')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, limit);
  },
  
  // Calendar - Combined events view
  async getCalendarEvents(year, month) {
    const events: CalendarEvent[] = [];
    
    // Add exams
    examsData.forEach(exam => {
      const date = new Date(exam.examDate);
      if (date.getFullYear() === year && date.getMonth() === month) {
        events.push({
          id: exam.id,
          title: exam.title,
          titleHindi: exam.titleHindi,
          date: exam.examDate,
          type: 'exam',
          category: exam.category,
          color: '#3b82f6',
          link: `/education-jobs/exams/${exam.slug}`,
        });
      }
    });
    
    // Add results
    resultsData.forEach(result => {
      const date = new Date(result.resultDate);
      if (date.getFullYear() === year && date.getMonth() === month) {
        events.push({
          id: result.id,
          title: result.title,
          titleHindi: result.titleHindi,
          date: result.resultDate,
          type: 'result',
          category: result.category,
          color: '#22c55e',
          link: `/education-jobs/results/${result.slug}`,
        });
      }
    });
    
    // Add holidays
    holidaysData.forEach(holiday => {
      const date = new Date(holiday.date);
      if (date.getFullYear() === year && date.getMonth() === month) {
        events.push({
          id: holiday.id,
          title: holiday.name,
          titleHindi: holiday.nameHindi,
          date: holiday.date,
          endDate: holiday.endDate,
          type: 'holiday',
          category: holiday.type,
          color: holiday.type === 'national' ? '#ef4444' : '#f59e0b',
          link: `/religion-culture/holidays/${holiday.slug}`,
        });
      }
    });
    
    // Add events
    eventsData.forEach(event => {
      const date = new Date(event.date);
      if (date.getFullYear() === year && date.getMonth() === month && event.status === 'upcoming') {
        events.push({
          id: event.id,
          title: event.title,
          titleHindi: event.titleHindi,
          date: event.date,
          endDate: event.endDate,
          type: 'event',
          category: event.category,
          color: '#8b5cf6',
          link: `/food-lifestyle/events/${event.slug}`,
        });
      }
    });
    
    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  },
  
  // CRUD Operations
  async createExam(exam) {
    const newExam = { ...exam, id: `exam-${Date.now()}` };
    examsData.push(newExam);
    return newExam;
  },
  
  async updateExam(id, updates) {
    const index = examsData.findIndex(e => e.id === id);
    if (index === -1) throw new Error('Exam not found');
    examsData[index] = { ...examsData[index], ...updates };
    return examsData[index];
  },
  
  async deleteExam(id) {
    examsData = examsData.filter(e => e.id !== id);
  },
  
  async createResult(result) {
    const newResult = { ...result, id: `result-${Date.now()}` };
    resultsData.push(newResult);
    return newResult;
  },
  
  async updateResult(id, updates) {
    const index = resultsData.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Result not found');
    resultsData[index] = { ...resultsData[index], ...updates };
    return resultsData[index];
  },
  
  async deleteResult(id) {
    resultsData = resultsData.filter(r => r.id !== id);
  },
  
  async createInstitution(institution) {
    const newInst = { ...institution, id: `inst-${Date.now()}` };
    institutionsData.push(newInst);
    return newInst;
  },
  
  async updateInstitution(id, updates) {
    const index = institutionsData.findIndex(i => i.id === id);
    if (index === -1) throw new Error('Institution not found');
    institutionsData[index] = { ...institutionsData[index], ...updates };
    return institutionsData[index];
  },
  
  async deleteInstitution(id) {
    institutionsData = institutionsData.filter(i => i.id !== id);
  },
  
  async createHoliday(holiday) {
    const newHoliday = { ...holiday, id: `holiday-${Date.now()}` };
    holidaysData.push(newHoliday);
    return newHoliday;
  },
  
  async updateHoliday(id, updates) {
    const index = holidaysData.findIndex(h => h.id === id);
    if (index === -1) throw new Error('Holiday not found');
    holidaysData[index] = { ...holidaysData[index], ...updates };
    return holidaysData[index];
  },
  
  async deleteHoliday(id) {
    holidaysData = holidaysData.filter(h => h.id !== id);
  },
  
  async createRestaurant(restaurant) {
    const newRest = { ...restaurant, id: `rest-${Date.now()}` };
    restaurantsData.push(newRest);
    return newRest;
  },
  
  async updateRestaurant(id, updates) {
    const index = restaurantsData.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Restaurant not found');
    restaurantsData[index] = { ...restaurantsData[index], ...updates };
    return restaurantsData[index];
  },
  
  async deleteRestaurant(id) {
    restaurantsData = restaurantsData.filter(r => r.id !== id);
  },
  
  async createFashionStore(store) {
    const newStore = { ...store, id: `fashion-${Date.now()}` };
    fashionStoresData.push(newStore);
    return newStore;
  },
  
  async updateFashionStore(id, updates) {
    const index = fashionStoresData.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Fashion store not found');
    fashionStoresData[index] = { ...fashionStoresData[index], ...updates };
    return fashionStoresData[index];
  },
  
  async deleteFashionStore(id) {
    fashionStoresData = fashionStoresData.filter(s => s.id !== id);
  },
  
  async createShoppingCentre(centre) {
    const newCentre = { ...centre, id: `shop-${Date.now()}` };
    shoppingCentresData.push(newCentre);
    return newCentre;
  },
  
  async updateShoppingCentre(id, updates) {
    const index = shoppingCentresData.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Shopping centre not found');
    shoppingCentresData[index] = { ...shoppingCentresData[index], ...updates };
    return shoppingCentresData[index];
  },
  
  async deleteShoppingCentre(id) {
    shoppingCentresData = shoppingCentresData.filter(c => c.id !== id);
  },
  
  async createFamousPlace(place) {
    const newPlace = { ...place, id: `place-${Date.now()}` };
    famousPlacesData.push(newPlace);
    return newPlace;
  },
  
  async updateFamousPlace(id, updates) {
    const index = famousPlacesData.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Famous place not found');
    famousPlacesData[index] = { ...famousPlacesData[index], ...updates };
    return famousPlacesData[index];
  },
  
  async deleteFamousPlace(id) {
    famousPlacesData = famousPlacesData.filter(p => p.id !== id);
  },
  
  async createEvent(event) {
    const newEvent = { ...event, id: `event-${Date.now()}` };
    eventsData.push(newEvent);
    return newEvent;
  },
  
  async updateEvent(id, updates) {
    const index = eventsData.findIndex(e => e.id === id);
    if (index === -1) throw new Error('Event not found');
    eventsData[index] = { ...eventsData[index], ...updates };
    return eventsData[index];
  },
  
  async deleteEvent(id) {
    eventsData = eventsData.filter(e => e.id !== id);
  },
};

const createRestExtendedProvider = (config: CMSConfig): ExtendedCMSProvider => {
  const baseUrl = (config.baseUrl || '').replace(/\/+$/, '');

  const buildUrl = (path: string, params?: Record<string, string | number | boolean | undefined>) => {
    const url = new URL(`${baseUrl}${path}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    return url.toString();
  };

  const getAuthHeaders = () => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (config.apiKey) {
      headers.Authorization = `Bearer ${config.apiKey}`;
    }
    return headers;
  };

  const fetchJson = async <T>(input: RequestInfo, init?: RequestInit) => {
    const response = await fetch(input, init);
    if (response.status === 204) {
      return null as T;
    }
    if (!response.ok) {
      if (response.status === 404) {
        return null as T;
      }
      throw new Error(`Request failed with status ${response.status}`);
    }
    const data = (await response.json()) as T;
    return data;
  };

  const buildQuery = (moduleType: string, params?: ExtendedQueryParams) => {
    const query: Record<string, string | number | boolean | undefined> = { moduleType };
    if (!params) return query;
    if (params.category) query.category = params.category;
    if (params.subcategory) query.subcategory = params.subcategory;
    if (params.city) query.city = params.city;
    if (params.district) query.district = params.district;
    if (params.featured !== undefined) query.featured = params.featured;
    if (params.popular !== undefined) query.popular = params.popular;
    if (params.limit !== undefined) query.limit = params.limit;
    if (params.offset !== undefined) query.offset = params.offset;
    if (params.search) query.search = params.search;
    if (params.status) query.status = params.status;
    if (params.orderBy) query.orderBy = params.orderBy;
    if (params.order) query.order = params.order;
    return query;
  };

  const getItems = async <T>(moduleType: string, params?: ExtendedQueryParams): Promise<PaginatedResponse<T>> => {
    const query = buildQuery(moduleType, params);
    const result = await fetchJson<PaginatedResponse<T>>(buildUrl('/microsite-items', query), {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!result) {
      return {
        data: [],
        total: 0,
        page: 1,
        pageSize: params?.limit || 10,
        totalPages: 0,
      };
    }
    return result;
  };

  const getItemBySlug = async <T>(moduleType: string, slug: string): Promise<T | null> => {
    const result = await fetchJson<T | null>(
      buildUrl(`/microsite-items/slug/${encodeURIComponent(slug)}`, { moduleType }),
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );
    return result;
  };

  const createItem = async <T extends { id: string }>(moduleType: string, value: any): Promise<T> => {
    const payload = { ...(value || {}), moduleType };
    const result = await fetchJson<T>(buildUrl('/microsite-items'), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!result) {
      throw new Error('Failed to create item');
    }
    return result;
  };

  const updateItem = async <T extends { id: string }>(id: string, value: any): Promise<T> => {
    const result = await fetchJson<T>(buildUrl(`/microsite-items/${encodeURIComponent(id)}`), {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(value || {}),
    });
    if (!result) {
      throw new Error('Failed to update item');
    }
    return result;
  };

  const deleteItem = async (id: string): Promise<void> => {
    await fetchJson<null>(buildUrl(`/microsite-items/${encodeURIComponent(id)}`), {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  };

  return {
    async getExams(params = {}) {
      return getItems<CMSExam>('exam', params);
    },
    async getExamBySlug(slug) {
      return getItemBySlug<CMSExam>('exam', slug);
    },
    async getResults(params = {}) {
      return getItems<CMSResult>('result', params);
    },
    async getResultBySlug(slug) {
      return getItemBySlug<CMSResult>('result', slug);
    },
    async getInstitutions(params = {}) {
      const next: ExtendedQueryParams = { ...params };
      if (next.type && !next.category) next.category = next.type;
      delete (next as any).type;
      return getItems<CMSInstitution>('institution', next);
    },
    async getInstitutionBySlug(slug) {
      return getItemBySlug<CMSInstitution>('institution', slug);
    },
    async getHolidays(params = {}) {
      const next: ExtendedQueryParams = { ...params };
      if (next.type && !next.category) next.category = next.type;
      delete (next as any).type;
      return getItems<CMSHoliday>('holiday', next);
    },
    async getHolidayBySlug(slug) {
      return getItemBySlug<CMSHoliday>('holiday', slug);
    },
    async getHolidaysByMonth(year, month) {
      const result = await getItems<CMSHoliday>('holiday', { limit: 1000, offset: 0 });
      return result.data.filter((h) => {
        const date = new Date(h.date);
        return date.getFullYear() === year && date.getMonth() === month;
      });
    },
    async getRestaurants(params = {}) {
      const next: ExtendedQueryParams = { ...params };
      if (next.type && !next.category) next.category = next.type;
      delete (next as any).type;
      return getItems<CMSRestaurant>('restaurant', next);
    },
    async getRestaurantBySlug(slug) {
      return getItemBySlug<CMSRestaurant>('restaurant', slug);
    },
    async getFashionStores(params = {}) {
      const next: ExtendedQueryParams = { ...params };
      if (next.type && !next.subcategory) next.subcategory = next.type;
      delete (next as any).type;
      return getItems<CMSFashionStore>('fashion-store', next);
    },
    async getFashionStoreBySlug(slug) {
      return getItemBySlug<CMSFashionStore>('fashion-store', slug);
    },
    async getShoppingCentres(params = {}) {
      const next: ExtendedQueryParams = { ...params };
      if (next.type && !next.category) next.category = next.type;
      delete (next as any).type;
      return getItems<CMSShoppingCentre>('shopping-centre', next);
    },
    async getShoppingCentreBySlug(slug) {
      return getItemBySlug<CMSShoppingCentre>('shopping-centre', slug);
    },
    async getFamousPlaces(params = {}) {
      const next: ExtendedQueryParams = { ...params };
      if (next.type && !next.category) next.category = next.type;
      delete (next as any).type;
      return getItems<CMSFamousPlace>('famous-place', next);
    },
    async getFamousPlaceBySlug(slug) {
      return getItemBySlug<CMSFamousPlace>('famous-place', slug);
    },
    async getEvents(params = {}) {
      return getItems<CMSEvent>('event', params);
    },
    async getEventBySlug(slug) {
      return getItemBySlug<CMSEvent>('event', slug);
    },
    async getUpcomingEvents(limit = 5) {
      const result = await getItems<CMSEvent>('event', { status: 'upcoming', orderBy: 'date', order: 'asc', limit });
      return result.data.slice(0, limit);
    },
    async getCalendarEvents(year, month) {
      const [exams, results, holidays, events] = await Promise.all([
        getItems<CMSExam>('exam', { limit: 1000, offset: 0 }),
        getItems<CMSResult>('result', { limit: 1000, offset: 0 }),
        getItems<CMSHoliday>('holiday', { limit: 1000, offset: 0 }),
        getItems<CMSEvent>('event', { limit: 1000, offset: 0 }),
      ]);

      const calendar: CalendarEvent[] = [];

      exams.data.forEach((exam) => {
        const date = new Date(exam.examDate);
        if (date.getFullYear() === year && date.getMonth() === month) {
          calendar.push({
            id: exam.id,
            title: exam.title,
            titleHindi: exam.titleHindi,
            date: exam.examDate,
            type: 'exam',
            category: exam.category,
            color: '#3b82f6',
            link: `/education-jobs/exams/${exam.slug}`,
          });
        }
      });

      results.data.forEach((resultItem) => {
        const date = new Date(resultItem.resultDate);
        if (date.getFullYear() === year && date.getMonth() === month) {
          calendar.push({
            id: resultItem.id,
            title: resultItem.title,
            titleHindi: resultItem.titleHindi,
            date: resultItem.resultDate,
            type: 'result',
            category: resultItem.category,
            color: '#22c55e',
            link: `/education-jobs/results/${resultItem.slug}`,
          });
        }
      });

      holidays.data.forEach((holiday) => {
        const date = new Date(holiday.date);
        if (date.getFullYear() === year && date.getMonth() === month) {
          calendar.push({
            id: holiday.id,
            title: holiday.name,
            titleHindi: holiday.nameHindi,
            date: holiday.date,
            type: 'holiday',
            category: holiday.type,
            color: '#f59e0b',
            link: `/culture/holidays/${holiday.slug}`,
          });
        }
      });

      events.data.forEach((event) => {
        const date = new Date(event.date);
        if (date.getFullYear() === year && date.getMonth() === month) {
          calendar.push({
            id: event.id,
            title: event.title,
            titleHindi: event.titleHindi,
            date: event.date,
            type: 'event',
            category: event.category,
            color: '#a855f7',
            link: `/food-lifestyle/events/${event.slug}`,
          });
        }
      });

      calendar.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      return calendar;
    },
    async createExam(exam) {
      return createItem<CMSExam>('exam', exam);
    },
    async updateExam(id, exam) {
      return updateItem<CMSExam>(id, exam);
    },
    async deleteExam(id) {
      return deleteItem(id);
    },
    async createResult(resultItem) {
      return createItem<CMSResult>('result', resultItem);
    },
    async updateResult(id, resultItem) {
      return updateItem<CMSResult>(id, resultItem);
    },
    async deleteResult(id) {
      return deleteItem(id);
    },
    async createInstitution(institution) {
      return createItem<CMSInstitution>('institution', institution);
    },
    async updateInstitution(id, institution) {
      return updateItem<CMSInstitution>(id, institution);
    },
    async deleteInstitution(id) {
      return deleteItem(id);
    },
    async createHoliday(holiday) {
      return createItem<CMSHoliday>('holiday', holiday);
    },
    async updateHoliday(id, holiday) {
      return updateItem<CMSHoliday>(id, holiday);
    },
    async deleteHoliday(id) {
      return deleteItem(id);
    },
    async createRestaurant(restaurant) {
      return createItem<CMSRestaurant>('restaurant', restaurant);
    },
    async updateRestaurant(id, restaurant) {
      return updateItem<CMSRestaurant>(id, restaurant);
    },
    async deleteRestaurant(id) {
      return deleteItem(id);
    },
    async createFashionStore(store) {
      return createItem<CMSFashionStore>('fashion-store', store);
    },
    async updateFashionStore(id, store) {
      return updateItem<CMSFashionStore>(id, store);
    },
    async deleteFashionStore(id) {
      return deleteItem(id);
    },
    async createShoppingCentre(centre) {
      return createItem<CMSShoppingCentre>('shopping-centre', centre);
    },
    async updateShoppingCentre(id, centre) {
      return updateItem<CMSShoppingCentre>(id, centre);
    },
    async deleteShoppingCentre(id) {
      return deleteItem(id);
    },
    async createFamousPlace(place) {
      return createItem<CMSFamousPlace>('famous-place', place);
    },
    async updateFamousPlace(id, place) {
      return updateItem<CMSFamousPlace>(id, place);
    },
    async deleteFamousPlace(id) {
      return deleteItem(id);
    },
    async createEvent(event) {
      return createItem<CMSEvent>('event', event);
    },
    async updateEvent(id, event) {
      return updateItem<CMSEvent>(id, event);
    },
    async deleteEvent(id) {
      return deleteItem(id);
    },
  };
};

let cachedProviderKey: string | null = null;
let cachedProvider: ExtendedCMSProvider | null = null;

export const getExtendedCMSProvider = (): ExtendedCMSProvider => {
  const config = getCMSConfig();
  if (config.provider === 'strapi' && config.baseUrl) {
    const key = `${config.provider}:${config.baseUrl}:${config.apiKey || ''}`;
    if (!cachedProvider || cachedProviderKey !== key) {
      cachedProviderKey = key;
      cachedProvider = createStrapiExtendedProvider({
        baseUrl: config.baseUrl,
        apiToken: config.apiKey,
      });
    }
    return cachedProvider;
  }
  if (config.provider !== 'mock' && config.provider !== 'wordpress' && config.baseUrl) {
    const key = `${config.provider}:${config.baseUrl}:${config.apiKey || ''}`;
    if (!cachedProvider || cachedProviderKey !== key) {
      cachedProviderKey = key;
      cachedProvider = createRestExtendedProvider(config);
    }
    return cachedProvider;
  }
  return extendedMockProvider;
};
