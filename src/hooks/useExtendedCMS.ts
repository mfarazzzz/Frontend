"use client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getExtendedCMSProvider } from '@/services/cms/extendedProvider';
import { getCMSConfig } from '@/services/cms';
import type { ExtendedQueryParams } from '@/services/cms/extendedTypes';

// Query keys
export const extendedCmsKeys = {
  exams: ['exams'] as const,
  exam: (slug: string) => ['exam', slug] as const,
  results: ['results'] as const,
  result: (slug: string) => ['result', slug] as const,
  institutions: ['institutions'] as const,
  institution: (slug: string) => ['institution', slug] as const,
  holidays: ['holidays'] as const,
  holiday: (slug: string) => ['holiday', slug] as const,
  holidaysByMonth: (year: number, month: number) => ['holidays', 'month', year, month] as const,
  restaurants: ['restaurants'] as const,
  restaurant: (slug: string) => ['restaurant', slug] as const,
  fashionStores: ['fashionStores'] as const,
  fashionStore: (slug: string) => ['fashionStore', slug] as const,
  shoppingCentres: ['shoppingCentres'] as const,
  shoppingCentre: (slug: string) => ['shoppingCentre', slug] as const,
  famousPlaces: ['famousPlaces'] as const,
  famousPlace: (slug: string) => ['famousPlace', slug] as const,
  events: ['events'] as const,
  event: (slug: string) => ['event', slug] as const,
  upcomingEvents: (limit: number) => ['events', 'upcoming', limit] as const,
  calendarEvents: (year: number, month: number) => ['calendar', year, month] as const,
};

// Education Hooks
export const useExams = (params?: ExtendedQueryParams) => {
  const providerKey = `${getCMSConfig().provider}:${getCMSConfig().baseUrl || ''}`;
  return useQuery({
    queryKey: [...extendedCmsKeys.exams, providerKey, params],
    queryFn: () => getExtendedCMSProvider().getExams(params),
  });
};

export const useExamBySlug = (slug: string) => {
  const providerKey = `${getCMSConfig().provider}:${getCMSConfig().baseUrl || ''}`;
  return useQuery({
    queryKey: [...extendedCmsKeys.exam(slug), providerKey],
    queryFn: () => getExtendedCMSProvider().getExamBySlug(slug),
    enabled: !!slug,
  });
};

export const useResults = (params?: ExtendedQueryParams) => {
  const providerKey = `${getCMSConfig().provider}:${getCMSConfig().baseUrl || ''}`;
  return useQuery({
    queryKey: [...extendedCmsKeys.results, providerKey, params],
    queryFn: () => getExtendedCMSProvider().getResults(params),
  });
};

export const useResultBySlug = (slug: string) => {
  const providerKey = `${getCMSConfig().provider}:${getCMSConfig().baseUrl || ''}`;
  return useQuery({
    queryKey: [...extendedCmsKeys.result(slug), providerKey],
    queryFn: () => getExtendedCMSProvider().getResultBySlug(slug),
    enabled: !!slug,
  });
};

export const useInstitutions = (params?: ExtendedQueryParams) => {
  const providerKey = `${getCMSConfig().provider}:${getCMSConfig().baseUrl || ''}`;
  return useQuery({
    queryKey: [...extendedCmsKeys.institutions, providerKey, params],
    queryFn: () => getExtendedCMSProvider().getInstitutions(params),
  });
};

export const useInstitutionBySlug = (slug: string) => {
  const providerKey = `${getCMSConfig().provider}:${getCMSConfig().baseUrl || ''}`;
  return useQuery({
    queryKey: [...extendedCmsKeys.institution(slug), providerKey],
    queryFn: () => getExtendedCMSProvider().getInstitutionBySlug(slug),
    enabled: !!slug,
  });
};

// Culture Hooks
export const useHolidays = (params?: ExtendedQueryParams) => {
  const providerKey = `${getCMSConfig().provider}:${getCMSConfig().baseUrl || ''}`;
  return useQuery({
    queryKey: [...extendedCmsKeys.holidays, providerKey, params],
    queryFn: () => getExtendedCMSProvider().getHolidays(params),
  });
};

export const useHolidayBySlug = (slug: string) => {
  const providerKey = `${getCMSConfig().provider}:${getCMSConfig().baseUrl || ''}`;
  return useQuery({
    queryKey: [...extendedCmsKeys.holiday(slug), providerKey],
    queryFn: () => getExtendedCMSProvider().getHolidayBySlug(slug),
    enabled: !!slug,
  });
};

export const useHolidaysByMonth = (year: number, month: number) => {
  const providerKey = `${getCMSConfig().provider}:${getCMSConfig().baseUrl || ''}`;
  return useQuery({
    queryKey: [...extendedCmsKeys.holidaysByMonth(year, month), providerKey],
    queryFn: () => getExtendedCMSProvider().getHolidaysByMonth(year, month),
  });
};

// Food & Lifestyle Hooks
export const useRestaurants = (params?: ExtendedQueryParams) => {
  const providerKey = `${getCMSConfig().provider}:${getCMSConfig().baseUrl || ''}`;
  return useQuery({
    queryKey: [...extendedCmsKeys.restaurants, providerKey, params],
    queryFn: () => getExtendedCMSProvider().getRestaurants(params),
  });
};

export const useRestaurantBySlug = (slug: string) => {
  const providerKey = `${getCMSConfig().provider}:${getCMSConfig().baseUrl || ''}`;
  return useQuery({
    queryKey: [...extendedCmsKeys.restaurant(slug), providerKey],
    queryFn: () => getExtendedCMSProvider().getRestaurantBySlug(slug),
    enabled: !!slug,
  });
};

export const useFashionStores = (params?: ExtendedQueryParams) => {
  const providerKey = `${getCMSConfig().provider}:${getCMSConfig().baseUrl || ''}`;
  return useQuery({
    queryKey: [...extendedCmsKeys.fashionStores, providerKey, params],
    queryFn: () => getExtendedCMSProvider().getFashionStores(params),
  });
};

export const useFashionStoreBySlug = (slug: string) => {
  const providerKey = `${getCMSConfig().provider}:${getCMSConfig().baseUrl || ''}`;
  return useQuery({
    queryKey: [...extendedCmsKeys.fashionStore(slug), providerKey],
    queryFn: () => getExtendedCMSProvider().getFashionStoreBySlug(slug),
    enabled: !!slug,
  });
};

export const useShoppingCentres = (params?: ExtendedQueryParams) => {
  const providerKey = `${getCMSConfig().provider}:${getCMSConfig().baseUrl || ''}`;
  return useQuery({
    queryKey: [...extendedCmsKeys.shoppingCentres, providerKey, params],
    queryFn: () => getExtendedCMSProvider().getShoppingCentres(params),
  });
};

export const useShoppingCentreBySlug = (slug: string) => {
  const providerKey = `${getCMSConfig().provider}:${getCMSConfig().baseUrl || ''}`;
  return useQuery({
    queryKey: [...extendedCmsKeys.shoppingCentre(slug), providerKey],
    queryFn: () => getExtendedCMSProvider().getShoppingCentreBySlug(slug),
    enabled: !!slug,
  });
};

export const useFamousPlaces = (params?: ExtendedQueryParams) => {
  const providerKey = `${getCMSConfig().provider}:${getCMSConfig().baseUrl || ''}`;
  return useQuery({
    queryKey: [...extendedCmsKeys.famousPlaces, providerKey, params],
    queryFn: () => getExtendedCMSProvider().getFamousPlaces(params),
  });
};

export const useFamousPlaceBySlug = (slug: string) => {
  const providerKey = `${getCMSConfig().provider}:${getCMSConfig().baseUrl || ''}`;
  return useQuery({
    queryKey: [...extendedCmsKeys.famousPlace(slug), providerKey],
    queryFn: () => getExtendedCMSProvider().getFamousPlaceBySlug(slug),
    enabled: !!slug,
  });
};

// Events Hooks
export const useEvents = (params?: ExtendedQueryParams) => {
  const providerKey = `${getCMSConfig().provider}:${getCMSConfig().baseUrl || ''}`;
  return useQuery({
    queryKey: [...extendedCmsKeys.events, providerKey, params],
    queryFn: () => getExtendedCMSProvider().getEvents(params),
  });
};

export const useEventBySlug = (slug: string) => {
  const providerKey = `${getCMSConfig().provider}:${getCMSConfig().baseUrl || ''}`;
  return useQuery({
    queryKey: [...extendedCmsKeys.event(slug), providerKey],
    queryFn: () => getExtendedCMSProvider().getEventBySlug(slug),
    enabled: !!slug,
  });
};

export const useUpcomingEvents = (limit = 5) => {
  const providerKey = `${getCMSConfig().provider}:${getCMSConfig().baseUrl || ''}`;
  return useQuery({
    queryKey: [...extendedCmsKeys.upcomingEvents(limit), providerKey],
    queryFn: () => getExtendedCMSProvider().getUpcomingEvents(limit),
  });
};

// Calendar Hook
export const useCalendarEvents = (year: number, month: number) => {
  const providerKey = `${getCMSConfig().provider}:${getCMSConfig().baseUrl || ''}`;
  return useQuery({
    queryKey: [...extendedCmsKeys.calendarEvents(year, month), providerKey],
    queryFn: () => getExtendedCMSProvider().getCalendarEvents(year, month),
  });
};

// Mutation Hooks for Admin
export const useCreateExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<ReturnType<typeof getExtendedCMSProvider>['createExam']>[0]) =>
      getExtendedCMSProvider().createExam(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: extendedCmsKeys.exams }),
  });
};

export const useUpdateExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<ReturnType<typeof getExtendedCMSProvider>['updateExam']>[1];
    }) => getExtendedCMSProvider().updateExam(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: extendedCmsKeys.exams }),
  });
};

export const useDeleteExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: Parameters<ReturnType<typeof getExtendedCMSProvider>['deleteExam']>[0]) =>
      getExtendedCMSProvider().deleteExam(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: extendedCmsKeys.exams }),
  });
};

export const useCreateResult = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<ReturnType<typeof getExtendedCMSProvider>['createResult']>[0]) =>
      getExtendedCMSProvider().createResult(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: extendedCmsKeys.results }),
  });
};

export const useUpdateResult = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<ReturnType<typeof getExtendedCMSProvider>['updateResult']>[1];
    }) => getExtendedCMSProvider().updateResult(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: extendedCmsKeys.results }),
  });
};

export const useDeleteResult = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: Parameters<ReturnType<typeof getExtendedCMSProvider>['deleteResult']>[0]) =>
      getExtendedCMSProvider().deleteResult(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: extendedCmsKeys.results }),
  });
};

export const useCreateInstitution = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<ReturnType<typeof getExtendedCMSProvider>['createInstitution']>[0]) =>
      getExtendedCMSProvider().createInstitution(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: extendedCmsKeys.institutions }),
  });
};

export const useUpdateInstitution = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<ReturnType<typeof getExtendedCMSProvider>['updateInstitution']>[1];
    }) => getExtendedCMSProvider().updateInstitution(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: extendedCmsKeys.institutions }),
  });
};

export const useDeleteInstitution = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: Parameters<ReturnType<typeof getExtendedCMSProvider>['deleteInstitution']>[0]) =>
      getExtendedCMSProvider().deleteInstitution(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: extendedCmsKeys.institutions }),
  });
};

export const useCreateHoliday = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<ReturnType<typeof getExtendedCMSProvider>['createHoliday']>[0]) =>
      getExtendedCMSProvider().createHoliday(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: extendedCmsKeys.holidays }),
  });
};

export const useUpdateHoliday = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<ReturnType<typeof getExtendedCMSProvider>['updateHoliday']>[1];
    }) => getExtendedCMSProvider().updateHoliday(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: extendedCmsKeys.holidays }),
  });
};

export const useDeleteHoliday = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: Parameters<ReturnType<typeof getExtendedCMSProvider>['deleteHoliday']>[0]) =>
      getExtendedCMSProvider().deleteHoliday(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: extendedCmsKeys.holidays }),
  });
};

export const useCreateRestaurant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<ReturnType<typeof getExtendedCMSProvider>['createRestaurant']>[0]) =>
      getExtendedCMSProvider().createRestaurant(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: extendedCmsKeys.restaurants }),
  });
};

export const useUpdateRestaurant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<ReturnType<typeof getExtendedCMSProvider>['updateRestaurant']>[1];
    }) => getExtendedCMSProvider().updateRestaurant(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: extendedCmsKeys.restaurants }),
  });
};

export const useDeleteRestaurant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: Parameters<ReturnType<typeof getExtendedCMSProvider>['deleteRestaurant']>[0]) =>
      getExtendedCMSProvider().deleteRestaurant(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: extendedCmsKeys.restaurants }),
  });
};

export const useCreateFashionStore = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<ReturnType<typeof getExtendedCMSProvider>['createFashionStore']>[0]) =>
      getExtendedCMSProvider().createFashionStore(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: extendedCmsKeys.fashionStores }),
  });
};

export const useUpdateFashionStore = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<ReturnType<typeof getExtendedCMSProvider>['updateFashionStore']>[1];
    }) => getExtendedCMSProvider().updateFashionStore(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: extendedCmsKeys.fashionStores }),
  });
};

export const useDeleteFashionStore = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: Parameters<ReturnType<typeof getExtendedCMSProvider>['deleteFashionStore']>[0]) =>
      getExtendedCMSProvider().deleteFashionStore(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: extendedCmsKeys.fashionStores }),
  });
};

export const useCreateShoppingCentre = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<ReturnType<typeof getExtendedCMSProvider>['createShoppingCentre']>[0]) =>
      getExtendedCMSProvider().createShoppingCentre(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: extendedCmsKeys.shoppingCentres }),
  });
};

export const useUpdateShoppingCentre = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<ReturnType<typeof getExtendedCMSProvider>['updateShoppingCentre']>[1];
    }) => getExtendedCMSProvider().updateShoppingCentre(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: extendedCmsKeys.shoppingCentres }),
  });
};

export const useDeleteShoppingCentre = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: Parameters<ReturnType<typeof getExtendedCMSProvider>['deleteShoppingCentre']>[0]) =>
      getExtendedCMSProvider().deleteShoppingCentre(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: extendedCmsKeys.shoppingCentres }),
  });
};

export const useCreateFamousPlace = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<ReturnType<typeof getExtendedCMSProvider>['createFamousPlace']>[0]) =>
      getExtendedCMSProvider().createFamousPlace(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: extendedCmsKeys.famousPlaces }),
  });
};

export const useUpdateFamousPlace = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<ReturnType<typeof getExtendedCMSProvider>['updateFamousPlace']>[1];
    }) => getExtendedCMSProvider().updateFamousPlace(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: extendedCmsKeys.famousPlaces }),
  });
};

export const useDeleteFamousPlace = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: Parameters<ReturnType<typeof getExtendedCMSProvider>['deleteFamousPlace']>[0]) =>
      getExtendedCMSProvider().deleteFamousPlace(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: extendedCmsKeys.famousPlaces }),
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<ReturnType<typeof getExtendedCMSProvider>['createEvent']>[0]) =>
      getExtendedCMSProvider().createEvent(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: extendedCmsKeys.events }),
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<ReturnType<typeof getExtendedCMSProvider>['updateEvent']>[1];
    }) => getExtendedCMSProvider().updateEvent(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: extendedCmsKeys.events }),
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: Parameters<ReturnType<typeof getExtendedCMSProvider>['deleteEvent']>[0]) =>
      getExtendedCMSProvider().deleteEvent(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: extendedCmsKeys.events }),
  });
};
