"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { 
  useExams, useResults, useInstitutions, useHolidays, 
  useRestaurants, useFashionStores, useShoppingCentres, useFamousPlaces, useEvents,
  useCreateExam, useDeleteExam, useUpdateExam,
  useCreateHoliday, useDeleteHoliday, useUpdateHoliday,
  useCreateRestaurant, useDeleteRestaurant, useUpdateRestaurant,
  useCreateEvent, useDeleteEvent, useUpdateEvent,
  useCreateInstitution, useDeleteInstitution, useUpdateInstitution,
  useCreateFashionStore, useDeleteFashionStore, useUpdateFashionStore,
  useCreateShoppingCentre, useDeleteShoppingCentre, useUpdateShoppingCentre,
  useCreateFamousPlace, useDeleteFamousPlace, useUpdateFamousPlace,
} from '@/hooks/useExtendedCMS';
import { useArticles, useDeleteArticle } from '@/hooks/useCMS';
import type { CMSArticle } from '@/services/cms';
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
} from '@/services/cms/extendedTypes';
import { 
  Plus, Trash2, Search, Calendar, GraduationCap, Utensils, 
  Shirt, Store, Landmark, PartyPopper, Moon, Pencil, Newspaper,
  MapPin, Building, Briefcase, Film, Trophy, Heart, Church, Eye
} from 'lucide-react';
import ContentEditDialog from '@/components/admin/ContentEditDialog';
import ImageUploader from '@/components/admin/ImageUploader';
import BulkImportExport from '@/components/admin/BulkImportExport';

// News categories for admin
const newsCategories = [
  { id: 'rampur', label: 'रामपुर', icon: MapPin },
  { id: 'up', label: 'उत्तर प्रदेश', icon: Building },
  { id: 'national', label: 'राष्ट्रीय', icon: Newspaper },
  { id: 'politics', label: 'राजनीति', icon: Briefcase },
  { id: 'crime', label: 'अपराध', icon: Eye },
  { id: 'education-jobs', label: 'शिक्षा-नौकरी', icon: GraduationCap },
  { id: 'business', label: 'व्यापार', icon: Briefcase },
  { id: 'entertainment', label: 'मनोरंजन', icon: Film },
  { id: 'sports', label: 'खेल', icon: Trophy },
  { id: 'health', label: 'स्वास्थ्य', icon: Heart },
  { id: 'religion-culture', label: 'धर्म-संस्कृति', icon: Church },
  { id: 'food-lifestyle', label: 'फूड-लाइफस्टाइल', icon: Utensils },
];

const ContentManagerPage = () => {
  const [activeSection, setActiveSection] = useState<'news' | 'education' | 'lifestyle'>('news');
  const [activeTab, setActiveTab] = useState('rampur');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<
    | CMSExam
    | CMSResult
    | CMSInstitution
    | CMSHoliday
    | CMSRestaurant
    | CMSFashionStore
    | CMSShoppingCentre
    | CMSFamousPlace
    | CMSEvent
    | null
  >(null);
  const router = useRouter();

  // Data hooks
  const { data: examsData, isLoading: loadingExams } = useExams({ limit: 100 });
  const { data: resultsData, isLoading: loadingResults } = useResults({ limit: 100 });
  const { data: institutionsData, isLoading: loadingInstitutions } = useInstitutions({ limit: 100 });
  const { data: holidaysData, isLoading: loadingHolidays } = useHolidays({ limit: 100 });
  const { data: restaurantsData, isLoading: loadingRestaurants } = useRestaurants({ limit: 100 });
  const { data: fashionData, isLoading: loadingFashion } = useFashionStores({ limit: 100 });
  const { data: shoppingData, isLoading: loadingShopping } = useShoppingCentres({ limit: 100 });
  const { data: placesData, isLoading: loadingPlaces } = useFamousPlaces({ limit: 100 });
  const { data: eventsData, isLoading: loadingEvents } = useEvents({ limit: 100 });
  const { data: newsData, isLoading: loadingNews } = useArticles(
    activeSection === 'news'
      ? {
          limit: 100,
          category: activeTab,
          search: searchQuery.length > 2 ? searchQuery : undefined,
        }
      : { limit: 1 },
  );

  // Create Mutations
  const createExam = useCreateExam();
  const createHoliday = useCreateHoliday();
  const createRestaurant = useCreateRestaurant();
  const createEvent = useCreateEvent();
  const createInstitution = useCreateInstitution();
  const createFashionStore = useCreateFashionStore();
  const createShoppingCentre = useCreateShoppingCentre();
  const createFamousPlace = useCreateFamousPlace();

  // Update Mutations
  const updateExam = useUpdateExam();
  const updateHoliday = useUpdateHoliday();
  const updateRestaurant = useUpdateRestaurant();
  const updateEvent = useUpdateEvent();
  const updateInstitution = useUpdateInstitution();
  const updateFashionStore = useUpdateFashionStore();
  const updateShoppingCentre = useUpdateShoppingCentre();
  const updateFamousPlace = useUpdateFamousPlace();

  // Delete Mutations
  const deleteExam = useDeleteExam();
  const deleteHoliday = useDeleteHoliday();
  const deleteRestaurant = useDeleteRestaurant();
  const deleteEvent = useDeleteEvent();
  const deleteInstitution = useDeleteInstitution();
  const deleteFashionStore = useDeleteFashionStore();
  const deleteShoppingCentre = useDeleteShoppingCentre();
  const deleteFamousPlace = useDeleteFamousPlace();
  const deleteNewsArticle = useDeleteArticle();

  const exams = examsData?.data || [];
  const results = resultsData?.data || [];
  const institutions = institutionsData?.data || [];
  const holidays = holidaysData?.data || [];
  const restaurants = restaurantsData?.data || [];
  const fashionStores = fashionData?.data || [];
  const shoppingCentres = shoppingData?.data || [];
  const famousPlaces = placesData?.data || [];
  const events = eventsData?.data || [];

  const currentNews = activeSection === 'news' ? (newsData?.data || []) : [];
  const filteredNews =
    searchQuery.trim().length === 0
      ? currentNews
      : currentNews.filter((news) => {
          const q = searchQuery.toLowerCase();
          return (
            news.title.toLowerCase().includes(q) ||
            news.excerpt.toLowerCase().includes(q)
          );
        });

  // Helper functions for bulk import/export
  const getBulkContentType = () => {
    if (activeSection === 'news') return 'news';
    return activeTab;
  };

  const getBulkData = ():
    | CMSExam[]
    | CMSResult[]
    | CMSInstitution[]
    | CMSHoliday[]
    | CMSRestaurant[]
    | CMSFashionStore[]
    | CMSShoppingCentre[]
    | CMSFamousPlace[]
    | CMSEvent[]
    | CMSArticle[] => {
    switch (activeTab) {
      case 'exams': return exams;
      case 'results': return results;
      case 'institutions': return institutions;
      case 'holidays': return holidays;
      case 'restaurants': return restaurants;
      case 'fashion': return fashionStores;
      case 'shopping': return shoppingCentres;
      case 'places': return famousPlaces;
      case 'events': return events;
      default:
        return activeSection === 'news' ? filteredNews : [];
    }
  };

  const handleBulkImport = async (items: any[]): Promise<void> => {
    const type = getBulkContentType();
    
    for (const item of items) {
      try {
        switch (type) {
          case 'exams':
            await createExam.mutateAsync(item);
            break;
          case 'holidays':
            await createHoliday.mutateAsync(item);
            break;
          case 'restaurants':
            await createRestaurant.mutateAsync(item);
            break;
          case 'events':
            await createEvent.mutateAsync(item);
            break;
          case 'institutions':
            await createInstitution.mutateAsync(item);
            break;
          case 'fashion':
            await createFashionStore.mutateAsync(item);
            break;
          case 'shopping':
            await createShoppingCentre.mutateAsync(item);
            break;
          case 'places':
            await createFamousPlace.mutateAsync(item);
            break;
          case 'news':
            // For news, just log - actual implementation would need backend
            // console.log('News import (demo):', item);
            break;
        }
      } catch (error) {
        console.error('Failed to import item:', item, error);
      }
    }
  };

  const handleDelete = async (
    type:
      | 'exams'
      | 'results'
      | 'institutions'
      | 'holidays'
      | 'restaurants'
      | 'events'
      | 'fashion'
      | 'shopping'
      | 'places',
    id: string
  ) => {
    if (!confirm('क्या आप वाकई इसे हटाना चाहते हैं?')) return;
    
    try {
      switch (type) {
        case 'exams':
          await deleteExam.mutateAsync(id);
          break;
        case 'holidays':
          await deleteHoliday.mutateAsync(id);
          break;
        case 'restaurants':
          await deleteRestaurant.mutateAsync(id);
          break;
        case 'events':
          await deleteEvent.mutateAsync(id);
          break;
        case 'institutions':
          await deleteInstitution.mutateAsync(id);
          break;
        case 'fashion':
          await deleteFashionStore.mutateAsync(id);
          break;
        case 'shopping':
          await deleteShoppingCentre.mutateAsync(id);
          break;
        case 'places':
          await deleteFamousPlace.mutateAsync(id);
          break;
      }
      toast.success('सफलतापूर्वक हटाया गया');
    } catch {
      toast.error('हटाने में त्रुटि');
    }
  };

  const handleEdit = (
    item:
      | CMSExam
      | CMSResult
      | CMSInstitution
      | CMSHoliday
      | CMSRestaurant
      | CMSFashionStore
      | CMSShoppingCentre
      | CMSFamousPlace
      | CMSEvent
  ) => {
    setEditingItem(item);
    setEditDialogOpen(true);
  };

  const handleDeleteNews = async (news: CMSArticle) => {
    if (!confirm(`क्या आप "${news.title}" को हटाना चाहते हैं?`)) {
      return;
    }
    try {
      await deleteNewsArticle.mutateAsync(news.id);
      toast.success('समाचार हटाया गया');
    } catch {
      toast.error('हटाने में त्रुटि');
    }
  };

  const handleSaveEdit = async (data: any) => {
    if (!editingItem?.id) return;
    
    try {
      switch (activeTab) {
        case 'exams':
          await updateExam.mutateAsync({ id: editingItem.id, data });
          break;
        case 'holidays':
          await updateHoliday.mutateAsync({ id: editingItem.id, data });
          break;
        case 'restaurants':
          await updateRestaurant.mutateAsync({ id: editingItem.id, data });
          break;
        case 'events':
          await updateEvent.mutateAsync({ id: editingItem.id, data });
          break;
        case 'institutions':
          await updateInstitution.mutateAsync({ id: editingItem.id, data });
          break;
        case 'fashion':
          await updateFashionStore.mutateAsync({ id: editingItem.id, data });
          break;
        case 'shopping':
          await updateShoppingCentre.mutateAsync({ id: editingItem.id, data });
          break;
        case 'places':
          await updateFamousPlace.mutateAsync({ id: editingItem.id, data });
          break;
      }
      setEditDialogOpen(false);
      setEditingItem(null);
    } catch {
      throw new Error('Update failed');
    }
  };

  const educationTabs = [
    { id: 'exams', label: 'परीक्षाएं', icon: GraduationCap, count: exams.length },
    { id: 'results', label: 'परिणाम', icon: Calendar, count: results.length },
    { id: 'institutions', label: 'संस्थान', icon: GraduationCap, count: institutions.length },
    { id: 'holidays', label: 'छुट्टियाँ', icon: Moon, count: holidays.length },
  ];

  const lifestyleTabs = [
    { id: 'restaurants', label: 'रेस्तरां', icon: Utensils, count: restaurants.length },
    { id: 'fashion', label: 'फैशन', icon: Shirt, count: fashionStores.length },
    { id: 'shopping', label: 'शॉपिंग', icon: Store, count: shoppingCentres.length },
    { id: 'places', label: 'स्थान', icon: Landmark, count: famousPlaces.length },
    { id: 'events', label: 'कार्यक्रम', icon: PartyPopper, count: events.length },
  ];

  const renderNewsTable = (news: CMSArticle[]) => (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>शीर्षक</TableHead>
              <TableHead>स्लग</TableHead>
              <TableHead>लेखक</TableHead>
              <TableHead>तारीख</TableHead>
              <TableHead>स्थिति</TableHead>
              <TableHead className="w-28">कार्रवाई</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {news.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="max-w-xs truncate">{item.title}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{item.slug}</TableCell>
                <TableCell>{item.author}</TableCell>
                <TableCell>{new Date(item.publishedDate).toLocaleDateString('hi-IN')}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {item.isFeatured && <Badge variant="default">फीचर्ड</Badge>}
                    {item.isBreaking && <Badge variant="destructive">ब्रेकिंग</Badge>}
                    {!item.isFeatured && !item.isBreaking && <Badge variant="secondary">सामान्य</Badge>}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-primary hover:text-primary"
                      onClick={() => router.push(`/admin/articles/${item.id}`)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeleteNews(item)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">कंटेंट मैनेजर</h1>
            <p className="text-muted-foreground">सभी मॉड्यूल की सामग्री प्रबंधित करें</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="खोजें..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <BulkImportExport 
              contentType={getBulkContentType()}
              data={getBulkData()}
              onImport={handleBulkImport}
            />
            {activeSection === 'news' ? (
              <Button className="gap-2" onClick={() => router.push('/admin/articles/new')}>
                <Plus className="h-4 w-4" />
                नया लेख
              </Button>
            ) : (
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    नया जोड़ें
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>नई सामग्री जोड़ें</DialogTitle>
                  </DialogHeader>
                  {activeTab === 'results' ? (
                    <AddResultForm 
                      onSuccess={() => {
                        setIsAddDialogOpen(false);
                        toast.success('परिणाम जोड़ा गया');
                      }}
                    />
                  ) : (
                    <AddContentForm 
                      type={activeTab} 
                      onSuccess={() => {
                        setIsAddDialogOpen(false);
                        toast.success('सफलतापूर्वक जोड़ा गया');
                      }}
                      onCreate={{
                        exam: createExam.mutateAsync,
                        holiday: createHoliday.mutateAsync,
                        restaurant: createRestaurant.mutateAsync,
                        event: createEvent.mutateAsync,
                        institution: createInstitution.mutateAsync,
                        fashion: createFashionStore.mutateAsync,
                        shopping: createShoppingCentre.mutateAsync,
                        place: createFamousPlace.mutateAsync,
                      }}
                    />
                  )}
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex gap-2 border-b pb-2">
          <Button
            variant={activeSection === 'news' ? 'default' : 'ghost'}
            onClick={() => { setActiveSection('news'); setActiveTab('rampur'); }}
            className="gap-2"
          >
            <Newspaper className="h-4 w-4" />
            समाचार
          </Button>
          <Button
            variant={activeSection === 'education' ? 'default' : 'ghost'}
            onClick={() => { setActiveSection('education'); setActiveTab('exams'); }}
            className="gap-2"
          >
            <GraduationCap className="h-4 w-4" />
            शिक्षा
          </Button>
          <Button
            variant={activeSection === 'lifestyle' ? 'default' : 'ghost'}
            onClick={() => { setActiveSection('lifestyle'); setActiveTab('restaurants'); }}
            className="gap-2"
          >
            <Utensils className="h-4 w-4" />
            लाइफस्टाइल
          </Button>
        </div>

        {/* News Section */}
        {activeSection === 'news' && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="flex-wrap h-auto gap-1 p-1">
              {newsCategories.map(cat => (
                <TabsTrigger 
                  key={cat.id} 
                  value={cat.id}
                  className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <cat.icon className="h-4 w-4" />
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              {loadingNews ? (
                <div className="text-center py-8 text-muted-foreground">लोड हो रहा है...</div>
              ) : (
                renderNewsTable(filteredNews)
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Education Section */}
        {activeSection === 'education' && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="flex-wrap h-auto gap-1 p-1">
              {educationTabs.map(tab => (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id}
                  className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                  <Badge variant="secondary" className="ml-1">{tab.count}</Badge>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="exams" className="mt-4">
              <ContentTable 
                data={exams}
                columns={['titleHindi', 'slug', 'examDate', 'organization', 'status']}
                columnLabels={{ titleHindi: 'शीर्षक', slug: 'स्लग', examDate: 'तारीख', organization: 'संस्था', status: 'स्थिति' }}
                onDelete={(id) => handleDelete('exams', id)}
                onEdit={handleEdit}
                isLoading={loadingExams}
              />
            </TabsContent>

            <TabsContent value="results" className="mt-4">
              <ContentTable 
                data={results}
                columns={['titleHindi', 'slug', 'resultDate', 'organizationHindi']}
                columnLabels={{ titleHindi: 'शीर्षक', slug: 'स्लग', resultDate: 'तारीख', organizationHindi: 'संस्था' }}
                onDelete={(id) => handleDelete('results', id)}
                onEdit={handleEdit}
                isLoading={loadingResults}
              />
            </TabsContent>

            <TabsContent value="institutions" className="mt-4">
              <ContentTable 
                data={institutions}
                columns={['nameHindi', 'slug', 'type', 'city', 'affiliation']}
                columnLabels={{ nameHindi: 'नाम', slug: 'स्लग', type: 'प्रकार', city: 'शहर', affiliation: 'संबद्धता' }}
                onDelete={(id) => handleDelete('institutions', id)}
                onEdit={handleEdit}
                isLoading={loadingInstitutions}
              />
            </TabsContent>

            <TabsContent value="holidays" className="mt-4">
              <ContentTable 
                data={holidays}
                columns={['nameHindi', 'slug', 'date', 'type', 'isPublicHoliday']}
                columnLabels={{ nameHindi: 'नाम', slug: 'स्लग', date: 'तारीख', type: 'प्रकार', isPublicHoliday: 'सार्वजनिक' }}
                onDelete={(id) => handleDelete('holidays', id)}
                onEdit={handleEdit}
                isLoading={loadingHolidays}
              />
            </TabsContent>
          </Tabs>
        )}

        {/* Lifestyle Section */}
        {activeSection === 'lifestyle' && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="flex-wrap h-auto gap-1 p-1">
              {lifestyleTabs.map(tab => (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id}
                  className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                  <Badge variant="secondary" className="ml-1">{tab.count}</Badge>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="restaurants" className="mt-4">
              <ContentTable 
                data={restaurants}
                columns={['nameHindi', 'slug', 'type', 'addressHindi', 'rating']}
                columnLabels={{ nameHindi: 'नाम', slug: 'स्लग', type: 'प्रकार', addressHindi: 'पता', rating: 'रेटिंग' }}
                onDelete={(id) => handleDelete('restaurants', id)}
                onEdit={handleEdit}
                isLoading={loadingRestaurants}
              />
            </TabsContent>

            <TabsContent value="fashion" className="mt-4">
              <ContentTable 
                data={fashionStores}
                columns={['nameHindi', 'slug', 'type', 'category', 'addressHindi']}
                columnLabels={{ nameHindi: 'नाम', slug: 'स्लग', type: 'प्रकार', category: 'श्रेणी', addressHindi: 'पता' }}
                onDelete={(id) => handleDelete('fashion', id)}
                onEdit={handleEdit}
                isLoading={loadingFashion}
              />
            </TabsContent>

            <TabsContent value="shopping" className="mt-4">
              <ContentTable 
                data={shoppingCentres}
                columns={['nameHindi', 'slug', 'type', 'addressHindi', 'storeCount']}
                columnLabels={{ nameHindi: 'नाम', slug: 'स्लग', type: 'प्रकार', addressHindi: 'पता', storeCount: 'दुकानें' }}
                onDelete={(id) => handleDelete('shopping', id)}
                onEdit={handleEdit}
                isLoading={loadingShopping}
              />
            </TabsContent>

            <TabsContent value="places" className="mt-4">
              <ContentTable 
                data={famousPlaces}
                columns={['nameHindi', 'slug', 'type', 'addressHindi', 'rating']}
                columnLabels={{ nameHindi: 'नाम', slug: 'स्लग', type: 'प्रकार', addressHindi: 'पता', rating: 'रेटिंग' }}
                onDelete={(id) => handleDelete('places', id)}
                onEdit={handleEdit}
                isLoading={loadingPlaces}
              />
            </TabsContent>

            <TabsContent value="events" className="mt-4">
              <ContentTable 
                data={events}
                columns={['titleHindi', 'slug', 'date', 'venueHindi', 'status']}
                columnLabels={{ titleHindi: 'शीर्षक', slug: 'स्लग', date: 'तारीख', venueHindi: 'स्थान', status: 'स्थिति' }}
                onDelete={(id) => handleDelete('events', id)}
                onEdit={handleEdit}
                isLoading={loadingEvents}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Edit Dialog */}
      <ContentEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        type={activeTab}
        data={editingItem}
        onSave={handleSaveEdit}
      />

    </>
  );
};

// Content Table Component
type ContentItem =
  | CMSExam
  | CMSResult
  | CMSInstitution
  | CMSHoliday
  | CMSRestaurant
  | CMSFashionStore
  | CMSShoppingCentre
  | CMSFamousPlace
  | CMSEvent;

interface ContentTableProps {
  data: ContentItem[];
  columns: string[];
  columnLabels: Record<string, string>;
  onDelete: (id: string) => void;
  onEdit: (item: ContentItem) => void;
  isLoading: boolean;
}

const ContentTable = ({ data, columns, columnLabels, onDelete, onEdit, isLoading }: ContentTableProps) => {
  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">लोड हो रहा है...</div>;
  }

  if (data.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">कोई डेटा नहीं मिला</div>;
  }

  const formatValue = (value: unknown, key: string) => {
    if (value === undefined || value === null) return '-';
    if (typeof value === 'boolean') return value ? 'हाँ' : 'नहीं';
    if (key === 'slug') return <span className="font-mono text-xs text-muted-foreground">{String(value)}</span>;
    if (key.includes('date') || key.includes('Date')) {
      return new Date(String(value)).toLocaleDateString('hi-IN');
    }
    return String(value);
  };

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map(col => (
                <TableHead key={col}>{columnLabels[col]}</TableHead>
              ))}
              <TableHead className="w-28">कार्रवाई</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                {columns.map(col => (
                  <TableCell key={col}>{formatValue(item[col], col)}</TableCell>
                ))}
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-primary hover:text-primary"
                      onClick={() => onEdit(item)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => onDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

// Add Result Form Component
interface AddResultFormProps {
  onSuccess: () => void;
}

type AddResultFormState = Partial<
  Pick<
    CMSResult,
    'title' | 'titleHindi' | 'resultDate' | 'category' | 'organization' | 'organizationHindi' | 'resultLink' | 'description' | 'image'
  >
> & {
  slug?: string;
  slugManual?: boolean;
};

const AddResultForm = ({ onSuccess }: AddResultFormProps) => {
  const [formData, setFormData] = useState<AddResultFormState>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim() || `result-${Date.now()}`;
  };

  const updateField = <K extends keyof AddResultFormState>(key: K, value: AddResultFormState[K]) => {
    setFormData(prev => {
      const updated = { ...prev, [key]: value };
      if ((key === 'title' || key === 'titleHindi') && !prev.slugManual) {
        updated.slug = generateSlug(String(value));
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const slug = formData.slug || generateSlug(formData.title || formData.titleHindi || '');
      // For now, just show success - in a real app this would call a mutation
      // console.log('Result data:', { ...formData, slug, status: 'announced' });
      toast.success('परिणाम जोड़ा गया (डेमो मोड)');
      onSuccess();
    } catch {
      toast.error('जोड़ने में त्रुटि');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>शीर्षक (हिंदी) *</Label>
          <Input 
            onChange={(e) => updateField('titleHindi', e.target.value)} 
            placeholder="परीक्षा परिणाम का नाम"
            required 
          />
        </div>
        <div className="space-y-2">
          <Label>Title (English) *</Label>
          <Input 
            onChange={(e) => updateField('title', e.target.value)} 
            placeholder="Result title in English"
            required 
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>स्लग (URL)</Label>
        <Input 
          value={formData.slug || ''}
          onChange={(e) => {
            setFormData(prev => ({ ...prev, slug: e.target.value, slugManual: true }));
          }} 
          placeholder="result-slug-url"
          className="font-mono"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>परिणाम तारीख *</Label>
          <Input 
            type="date" 
            onChange={(e) => updateField('resultDate', e.target.value)} 
            required 
          />
        </div>
        <div className="space-y-2">
          <Label>श्रेणी</Label>
          <Select onValueChange={(v) => updateField('category', v as AddResultFormState['category'])}>
            <SelectTrigger><SelectValue placeholder="चुनें" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="board">बोर्ड</SelectItem>
              <SelectItem value="entrance">प्रवेश</SelectItem>
              <SelectItem value="government">सरकारी</SelectItem>
              <SelectItem value="university">विश्वविद्यालय</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>संस्था (हिंदी)</Label>
          <Input onChange={(e) => updateField('organizationHindi', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Organization</Label>
          <Input onChange={(e) => updateField('organization', e.target.value)} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>परिणाम लिंक</Label>
        <Input 
          type="url"
          onChange={(e) => updateField('resultLink', e.target.value)} 
          placeholder="https://results.example.com"
        />
      </div>

      <div className="space-y-2">
        <Label>विवरण</Label>
        <Textarea 
          onChange={(e) => updateField('description', e.target.value)} 
          placeholder="परिणाम के बारे में जानकारी..."
          rows={3}
        />
      </div>

      <ImageUploader
        value={formData.image}
        onChange={(v) => updateField('image', v as string)}
        label="इमेज"
      />

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'जोड़ रहे हैं...' : 'परिणाम जोड़ें'}
      </Button>
    </form>
  );
};

// Add Content Form Component
interface AddContentFormProps {
  type: string;
  onSuccess: () => void;
  onCreate: {
    exam: (data: any) => Promise<unknown>;
    holiday: (data: any) => Promise<unknown>;
    restaurant: (data: any) => Promise<unknown>;
    event: (data: any) => Promise<unknown>;
    institution: (data: any) => Promise<unknown>;
    fashion: (data: any) => Promise<unknown>;
    shopping: (data: any) => Promise<unknown>;
    place: (data: any) => Promise<unknown>;
  };
}

const AddContentForm = ({ type, onSuccess, onCreate }: AddContentFormProps) => {
  const [formData, setFormData] = useState<
    Partial<CMSExam> &
      Partial<CMSInstitution> &
      Partial<CMSHoliday> &
      Partial<CMSRestaurant> &
      Partial<CMSFashionStore> &
      Partial<CMSShoppingCentre> &
      Partial<CMSFamousPlace> &
      Partial<CMSEvent> & {
        slug?: string;
        slugManual?: boolean;
        brands?: string;
        stores?: string;
      }
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim() || `item-${Date.now()}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const slug = formData.slug || generateSlug(formData.title || formData.name || '');
      
      switch (type) {
        case 'exams':
          await onCreate.exam({ ...formData, slug, status: 'upcoming' });
          break;
        case 'holidays':
          await onCreate.holiday({ ...formData, slug, isRecurring: true });
          break;
        case 'restaurants':
          await onCreate.restaurant({
            ...formData,
            slug,
            cuisine: (formData.cuisine as any)?.split(',') || [],
          });
          break;
        case 'events':
          await onCreate.event({ ...formData, slug, status: 'upcoming' });
          break;
        case 'institutions':
          await onCreate.institution({ ...formData, slug });
          break;
        case 'fashion':
          await onCreate.fashion({ ...formData, slug, brands: formData.brands?.split(',') || [] });
          break;
        case 'shopping':
          await onCreate.shopping({ ...formData, slug, stores: formData.stores?.split(',') || [] });
          break;
        case 'places':
          await onCreate.place({ ...formData, slug });
          break;
      }
      onSuccess();
    } catch {
      toast.error('जोड़ने में त्रुटि');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (key: string, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [key]: value };
      // Auto-generate slug from title or name
      if ((key === 'title' || key === 'name') && !prev.slugManual) {
        updated.slug = generateSlug(value);
      }
      return updated;
    });
  };

  const renderFormFields = () => {
    // Common slug field for all types
    const slugField = (
      <div className="space-y-2">
        <Label>स्लग (URL)</Label>
        <Input 
          value={formData.slug || ''}
          onChange={(e) => {
            setFormData(prev => ({ ...prev, slug: e.target.value, slugManual: true }));
          }}
          placeholder="auto-generated-slug"
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">URL में उपयोग होगा</p>
      </div>
    );

    switch (type) {
      case 'exams':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>शीर्षक (हिंदी)</Label>
                <Input onChange={(e) => updateField('titleHindi', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Title (English)</Label>
                <Input onChange={(e) => updateField('title', e.target.value)} required />
              </div>
            </div>
            {slugField}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>परीक्षा तारीख</Label>
                <Input type="date" onChange={(e) => updateField('examDate', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>श्रेणी</Label>
                <Select onValueChange={(v) => updateField('category', v)}>
                  <SelectTrigger><SelectValue placeholder="चुनें" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="board">बोर्ड</SelectItem>
                    <SelectItem value="entrance">प्रवेश</SelectItem>
                    <SelectItem value="government">सरकारी</SelectItem>
                    <SelectItem value="university">विश्वविद्यालय</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>संस्था (हिंदी)</Label>
                <Input onChange={(e) => updateField('organizationHindi', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Organization</Label>
                <Input onChange={(e) => updateField('organization', e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>विवरण</Label>
              <Textarea onChange={(e) => updateField('description', e.target.value)} />
            </div>
            <ImageUploader
              value={formData.image}
              onChange={(v) => updateField('image', v as string)}
              label="इमेज"
            />
          </>
        );

      case 'institutions':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>नाम (हिंदी)</Label>
                <Input onChange={(e) => updateField('nameHindi', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Name (English)</Label>
                <Input onChange={(e) => updateField('name', e.target.value)} required />
              </div>
            </div>
            {slugField}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>प्रकार</Label>
                <Select onValueChange={(v) => updateField('type', v)}>
                  <SelectTrigger><SelectValue placeholder="चुनें" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="school">स्कूल</SelectItem>
                    <SelectItem value="college">कॉलेज</SelectItem>
                    <SelectItem value="university">विश्वविद्यालय</SelectItem>
                    <SelectItem value="coaching">कोचिंग</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>बोर्ड/संबद्धता</Label>
                <Select onValueChange={(v) => updateField('board', v)}>
                  <SelectTrigger><SelectValue placeholder="चुनें" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CBSE">CBSE</SelectItem>
                    <SelectItem value="UP Board">UP Board</SelectItem>
                    <SelectItem value="ICSE">ICSE</SelectItem>
                    <SelectItem value="Other">अन्य</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>पता (हिंदी)</Label>
                <Input onChange={(e) => updateField('addressHindi', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input onChange={(e) => updateField('address', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>फोन</Label>
                <Input onChange={(e) => updateField('phone', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>वेबसाइट</Label>
                <Input onChange={(e) => updateField('website', e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>विवरण</Label>
              <Textarea onChange={(e) => updateField('description', e.target.value)} />
            </div>
            <ImageUploader
              value={formData.image}
              onChange={(v) => updateField('image', v as string)}
              label="इमेज"
            />
          </>
        );

      case 'holidays':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>नाम (हिंदी)</Label>
                <Input onChange={(e) => updateField('nameHindi', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Name (English)</Label>
                <Input onChange={(e) => updateField('name', e.target.value)} required />
              </div>
            </div>
            {slugField}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>तारीख</Label>
                <Input type="date" onChange={(e) => updateField('date', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>प्रकार</Label>
                <Select onValueChange={(v) => updateField('type', v)}>
                  <SelectTrigger><SelectValue placeholder="चुनें" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="national">राष्ट्रीय</SelectItem>
                    <SelectItem value="religious">धार्मिक</SelectItem>
                    <SelectItem value="cultural">सांस्कृतिक</SelectItem>
                    <SelectItem value="bank">बैंक</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>विवरण (हिंदी)</Label>
                <Textarea onChange={(e) => updateField('descriptionHindi', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea onChange={(e) => updateField('description', e.target.value)} />
              </div>
            </div>
            <ImageUploader
              value={formData.image}
              onChange={(v) => updateField('image', v as string)}
              label="इमेज"
            />
          </>
        );

      case 'restaurants':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>नाम (हिंदी)</Label>
                <Input onChange={(e) => updateField('nameHindi', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Name (English)</Label>
                <Input onChange={(e) => updateField('name', e.target.value)} required />
              </div>
            </div>
            {slugField}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>प्रकार</Label>
                <Select onValueChange={(v) => updateField('type', v)}>
                  <SelectTrigger><SelectValue placeholder="चुनें" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="restaurant">रेस्तरां</SelectItem>
                    <SelectItem value="dhaba">ढाबा</SelectItem>
                    <SelectItem value="sweet-shop">मिठाई</SelectItem>
                    <SelectItem value="cafe">कैफे</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>बजट</Label>
                <Select onValueChange={(v) => updateField('priceRange', v)}>
                  <SelectTrigger><SelectValue placeholder="चुनें" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="budget">सस्ता</SelectItem>
                    <SelectItem value="moderate">मध्यम</SelectItem>
                    <SelectItem value="expensive">महंगा</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>व्यंजन (कॉमा से अलग)</Label>
              <Input placeholder="North Indian, Mughlai" onChange={(e) => updateField('cuisine', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>पता (हिंदी)</Label>
                <Input onChange={(e) => updateField('addressHindi', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input onChange={(e) => updateField('address', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>फोन</Label>
                <Input onChange={(e) => updateField('phone', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>रेटिंग (1-5)</Label>
                <Input type="number" min="1" max="5" step="0.1" onChange={(e) => updateField('rating', parseFloat(e.target.value))} />
              </div>
            </div>
            <ImageUploader
              value={formData.image}
              onChange={(v) => updateField('image', v as string)}
              label="मुख्य इमेज"
            />
            <ImageUploader
              value={formData.gallery}
              onChange={(v) => updateField('gallery', v as string[])}
              label="গैलरी"
              multiple
              maxImages={10}
            />
          </>
        );

      case 'fashion':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>नाम (हिंदी)</Label>
                <Input onChange={(e) => updateField('nameHindi', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Name (English)</Label>
                <Input onChange={(e) => updateField('name', e.target.value)} required />
              </div>
            </div>
            {slugField}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>प्रकार</Label>
                <Select onValueChange={(v) => updateField('type', v)}>
                  <SelectTrigger><SelectValue placeholder="चुनें" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="boutique">बुटीक</SelectItem>
                    <SelectItem value="showroom">शोरूम</SelectItem>
                    <SelectItem value="tailor">दर्जी</SelectItem>
                    <SelectItem value="brand-store">ब्रांड स्टोर</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>श्रेणी</Label>
                <Select onValueChange={(v) => updateField('category', v)}>
                  <SelectTrigger><SelectValue placeholder="चुनें" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="men">पुरुष</SelectItem>
                    <SelectItem value="women">महिला</SelectItem>
                    <SelectItem value="kids">बच्चे</SelectItem>
                    <SelectItem value="all">सभी</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>ब्रांड्स (कॉमा से अलग)</Label>
              <Input placeholder="Levis, Peter England" onChange={(e) => updateField('brands', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>पता (हिंदी)</Label>
                <Input onChange={(e) => updateField('addressHindi', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input onChange={(e) => updateField('address', e.target.value)} />
              </div>
            </div>
            <ImageUploader
              value={formData.image}
              onChange={(v) => updateField('image', v as string)}
              label="मुख्य इमেজ"
            />
          </>
        );

      case 'shopping':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>नाम (हिंदी)</Label>
                <Input onChange={(e) => updateField('nameHindi', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Name (English)</Label>
                <Input onChange={(e) => updateField('name', e.target.value)} required />
              </div>
            </div>
            {slugField}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>प्रकार</Label>
                <Select onValueChange={(v) => updateField('type', v)}>
                  <SelectTrigger><SelectValue placeholder="चुनें" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mall">मॉल</SelectItem>
                    <SelectItem value="market">बाजार</SelectItem>
                    <SelectItem value="plaza">प्लाजा</SelectItem>
                    <SelectItem value="complex">कॉम्प्लेक्स</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>दुकानों की संख्या</Label>
                <Input type="number" onChange={(e) => updateField('storeCount', parseInt(e.target.value))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>प्रमुख स्टोर (कॉमा से अलग)</Label>
              <Input placeholder="Big Bazaar, Reliance" onChange={(e) => updateField('stores', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>पता (हिंदी)</Label>
                <Input onChange={(e) => updateField('addressHindi', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input onChange={(e) => updateField('address', e.target.value)} />
              </div>
            </div>
            <ImageUploader
              value={formData.image}
              onChange={(v) => updateField('image', v as string)}
              label="मुख्य इमेज"
            />
          </>
        );

      case 'places':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>नाम (हिंदी)</Label>
                <Input onChange={(e) => updateField('nameHindi', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Name (English)</Label>
                <Input onChange={(e) => updateField('name', e.target.value)} required />
              </div>
            </div>
            {slugField}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>प्रकार</Label>
                <Select onValueChange={(v) => updateField('type', v)}>
                  <SelectTrigger><SelectValue placeholder="चुनें" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="historical">ऐतिहासिक</SelectItem>
                    <SelectItem value="religious">धार्मिक</SelectItem>
                    <SelectItem value="park">पार्क</SelectItem>
                    <SelectItem value="tourist">पर्यटन</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>रेटिंग (1-5)</Label>
                <Input type="number" min="1" max="5" step="0.1" onChange={(e) => updateField('rating', parseFloat(e.target.value))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>पता (हिंदी)</Label>
                <Input onChange={(e) => updateField('addressHindi', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input onChange={(e) => updateField('address', e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>विवरण</Label>
              <Textarea onChange={(e) => updateField('description', e.target.value)} />
            </div>
            <ImageUploader
              value={formData.image}
              onChange={(v) => updateField('image', v as string)}
              label="मुख्य इमेज"
            />
          </>
        );

      case 'events':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>शीर्षक (हिंदी)</Label>
                <Input onChange={(e) => updateField('titleHindi', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Title (English)</Label>
                <Input onChange={(e) => updateField('title', e.target.value)} required />
              </div>
            </div>
            {slugField}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>तारीख</Label>
                <Input type="date" onChange={(e) => updateField('date', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>समय</Label>
                <Input type="time" onChange={(e) => updateField('time', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>स्थान (हिंदी)</Label>
                <Input onChange={(e) => updateField('venueHindi', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Venue</Label>
                <Input onChange={(e) => updateField('venue', e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>विवरण</Label>
              <Textarea onChange={(e) => updateField('description', e.target.value)} />
            </div>
            <ImageUploader
              value={formData.image}
              onChange={(v) => updateField('image', v as string)}
              label="इमेज"
            />
          </>
        );

      default:
        return <p>इस प्रकार के लिए फॉर्म उपलब्ध नहीं है</p>;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {renderFormFields()}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'जोड़ रहे हैं...' : 'जोड़ें'}
      </Button>
    </form>
  );
};

export default ContentManagerPage;
