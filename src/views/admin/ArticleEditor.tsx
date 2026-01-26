"use client";
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useArticle, useCreateArticle, useUpdateArticle, useCategories, useAuthors, useTags } from '@/hooks/useCMS';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, Eye, Image as ImageIcon, Loader2, Youtube, X } from 'lucide-react';
import { toast } from 'sonner';
import { type CMSArticle, getCMSProvider } from '@/services/cms';
import ImageUploader from '@/components/admin/ImageUploader';
import { deriveAiSeoSignals, stripHtmlToText, truncateText } from '@/lib/utils';

const SITE_URL = 'https://rampurnews.com';

const ArticleEditor = () => {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const isNew = id === 'new';

  const { data: existingArticle, isLoading: articleLoading } = useArticle(isNew ? '' : id!);
  const { data: categories } = useCategories();
  const { data: authors } = useAuthors();
  const { data: tags } = useTags();
  const createArticle = useCreateArticle();
  const updateArticle = useUpdateArticle();

  const [formData, setFormData] = useState<Partial<CMSArticle>>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    image: '',
    featuredMediaId: '',
    category: '',
    categoryHindi: '',
    author: '',
    publishedDate: new Date().toISOString(),
    status: 'draft',
    isFeatured: false,
    isBreaking: false,
    readTime: '',
    seoTitle: '',
    seoDescription: '',
    seoOverride: false,
    tags: [],
    videoUrl: '',
    videoType: 'none',
    videoTitle: '',
  });

  // Extract YouTube video ID from URL
  const extractYouTubeId = (url: string): string | null => {
    if (!url) return null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/shorts\/([^&\n?#]+)/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const videoId = extractYouTubeId(formData.videoUrl || '');

  const handleVideoUrlChange = (url: string) => {
    const id = extractYouTubeId(url);
    setFormData(prev => ({
      ...prev,
      videoUrl: url,
      videoType: id ? 'youtube' : 'none',
    }));
  };

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (existingArticle) {
      setFormData(existingArticle);
    }
  }, [existingArticle]);

  const generateSlug = (value: string) => {
    return value
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .replace(/^-+|-+$/g, '');
  };

  const generateUniqueSlug = async (rawSlug: string) => {
    const baseSlug = generateSlug(rawSlug) || `article-${Date.now()}`;

    const provider = getCMSProvider();
    let slug = baseSlug;
    let suffix = 2;

    while (true) {
      const existing = await provider.getArticleBySlug(slug);

      if (!existing) {
        return slug;
      }

      if (!isNew && existingArticle && existing.id === existingArticle.id) {
        return slug;
      }

      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
    }));
  };

  const selectedCategoryId =
    categories?.find((c) => c.id === formData.category)?.id ||
    categories?.find((c) => c.slug === formData.category)?.id ||
    '';

  const selectedAuthorId =
    authors?.find((a) => a.id === formData.author)?.id ||
    authors?.find((a) => a.nameHindi === formData.author || a.name === formData.author)?.id ||
    '';

  const handleCategoryChange = (categoryId: string) => {
    const category = categories?.find((c) => c.id === categoryId);
    setFormData((prev) => ({
      ...prev,
      category: category?.slug || '',
      categoryHindi: category?.titleHindi || '',
    }));
  };

  const handleAuthorChange = (authorId: string) => {
    const author = authors?.find((a) => a.id === authorId);
    setFormData((prev) => ({
      ...prev,
      author: author?.nameHindi || author?.name || '',
    }));
  };

  const handleAddTag = (tagId: string) => {
    const tag = tags?.find((t) => t.id === tagId);
    if (!tag?.name) return;
    setFormData((prev) => {
      const existing = Array.isArray(prev.tags) ? prev.tags : [];
      if (existing.includes(tag.name)) return prev;
      return { ...prev, tags: [...existing, tag.name] };
    });
  };

  const handleRemoveTag = (tagName: string) => {
    setFormData((prev) => {
      const existing = Array.isArray(prev.tags) ? prev.tags : [];
      return { ...prev, tags: existing.filter((t) => t !== tagName) };
    });
  };

  const handleSubmit = async (status?: 'draft' | 'published') => {
    if (!formData.title || !formData.category || !formData.content || !formData.author) {
      toast.error('शीर्षक, श्रेणी, लेखक और सामग्री आवश्यक हैं');
      return;
    }

    setIsSaving(true);
    try {
      const slugSource = (formData.slug && formData.slug.trim().length > 0)
        ? formData.slug
        : formData.title!;
      const finalSlug = await generateUniqueSlug(slugSource);

      if (!finalSlug) {
        toast.error('मान्य स्लग उत्पन्न नहीं हो सका');
        setIsSaving(false);
        return;
      }

      const dataToSave = {
        ...formData,
        status: status || formData.status || 'draft',
        slug: finalSlug,
        publishedDate: formData.publishedDate || new Date().toISOString(),
      } as Omit<CMSArticle, 'id'>;

      if (isNew) {
        await createArticle.mutateAsync(dataToSave);
        toast.success('लेख बनाया गया');
      } else {
        await updateArticle.mutateAsync({ id: id!, updates: dataToSave });
        toast.success('लेख अपडेट किया गया');
      }
      router.push('/admin/articles');
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      toast.error(message || 'सहेजने में त्रुटि');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isNew && articleLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/admin/articles')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {isNew ? 'नया लेख' : 'लेख संपादित करें'}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isNew ? 'नया समाचार लेख बनाएं' : 'मौजूदा लेख को अपडेट करें'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => handleSubmit('draft')}
            disabled={isSaving}
          >
            <Save className="w-4 h-4 mr-2" />
            ड्राफ्ट सहेजें
          </Button>
          <Button 
            onClick={() => handleSubmit('published')}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Eye className="w-4 h-4 mr-2" />
            )}
            प्रकाशित करें
          </Button>
        </div>
      </div>

      <Tabs defaultValue="content" className="space-y-6">
        <TabsList>
          <TabsTrigger value="content">सामग्री</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="settings">सेटिंग्स</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">शीर्षक *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="समाचार का शीर्षक लिखें"
                      className="text-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">स्लग</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="url-friendly-slug"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="excerpt">सारांश</Label>
                    <Textarea
                      id="excerpt"
                      value={formData.excerpt}
                      onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                      placeholder="संक्षिप्त विवरण (2-3 वाक्य)"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">मुख्य सामग्री</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="पूर्ण समाचार लेख यहाँ लिखें..."
                      rows={12}
                      className="font-mono"
                    />
                    <p className="text-xs text-muted-foreground">
                      HTML टैग्स का उपयोग कर सकते हैं
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Featured Image */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">मुख्य छवि</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {formData.image ? (
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
                    </div>
                  )}
                  <ImageUploader
                    value={formData.image}
                    onChange={(v) => setFormData((prev) => ({ ...prev, image: v as string }))}
                    onMediaChange={(media) =>
                      setFormData((prev) => ({
                        ...prev,
                        featuredMediaId: Array.isArray(media) ? media[0]?.id || '' : media?.id || '',
                      }))
                    }
                    label=""
                  />
                </CardContent>
              </Card>

              {/* Category & Author */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">वर्गीकरण</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>श्रेणी *</Label>
                    <Select 
                      value={selectedCategoryId} 
                      onValueChange={handleCategoryChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="श्रेणी चुनें" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.titleHindi}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>लेखक *</Label>
                    <Select 
                      value={selectedAuthorId} 
                      onValueChange={handleAuthorChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="लेखक चुनें" />
                      </SelectTrigger>
                      <SelectContent>
                        {authors?.map(author => (
                          <SelectItem key={author.id} value={author.id}>
                            {author.nameHindi || author.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>टैग</Label>
                    <Select value="" onValueChange={handleAddTag}>
                      <SelectTrigger>
                        <SelectValue placeholder="टैग जोड़ें" />
                      </SelectTrigger>
                      <SelectContent>
                        {tags?.map((tag) => (
                          <SelectItem key={tag.id} value={tag.id}>
                            {tag.nameHindi || tag.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {Array.isArray(formData.tags) && formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {formData.tags.map((t) => (
                          <Button
                            key={t}
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => handleRemoveTag(t)}
                            className="h-7 px-2"
                          >
                            {t}
                            <X className="w-3 h-3 ml-1" />
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>पढ़ने का समय</Label>
                    <Input
                      value={formData.readTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, readTime: e.target.value }))}
                      placeholder="3 मिनट"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Flags */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">विशेष फ्लैग</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="featured" className="cursor-pointer">
                      फीचर्ड लेख
                    </Label>
                    <Switch
                      id="featured"
                      checked={formData.isFeatured}
                      onCheckedChange={(v) => setFormData(prev => ({ ...prev, isFeatured: v }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="breaking" className="cursor-pointer">
                      ब्रेकिंग न्यूज़
                    </Label>
                    <Switch
                      id="breaking"
                      checked={formData.isBreaking}
                      onCheckedChange={(v) => setFormData(prev => ({ ...prev, isBreaking: v }))}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* YouTube Video */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Youtube className="w-4 h-4 text-red-500" />
                    वीडियो
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label>YouTube URL</Label>
                    <Input
                      value={formData.videoUrl}
                      onChange={(e) => handleVideoUrlChange(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>

                  {/* Video Preview */}
                  {videoId && (
                    <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                      <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        className="w-full h-full"
                        allowFullScreen
                        title={formData.videoTitle || 'Video Preview'}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>वीडियो शीर्षक (वैकल्पिक)</Label>
                    <Input
                      value={formData.videoTitle}
                      onChange={(e) => setFormData(prev => ({ ...prev, videoTitle: e.target.value }))}
                      placeholder="वीडियो का शीर्षक"
                    />
                  </div>

                  {formData.videoUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, videoUrl: '', videoTitle: '', videoType: 'none' }))}
                      className="w-full"
                    >
                      <X className="w-4 h-4 mr-1" /> वीडियो हटाएं
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="seo">
          {(() => {
            const title = (formData.title || '').trim();
            const categorySlug = (formData.category || '').trim();
            const selectedCategory = categories?.find((c) => c.slug === categorySlug);
            const categoryName = (selectedCategory?.titleEnglish || selectedCategory?.titleHindi || formData.categoryHindi || categorySlug || '').trim();
            const canonicalUrl = categorySlug && (formData.slug || '').trim()
              ? `${SITE_URL}/${categorySlug}/${(formData.slug || '').trim()}`
              : '';

            const descriptionAuto = truncateText(
              (formData.excerpt || '').trim() || stripHtmlToText(formData.content || ''),
              160,
            );

            const seoTitleAutoRaw = title && categoryName
              ? `${title} | ${categoryName} | Rampur News`
              : title
                ? `${title} | Rampur News`
                : 'रामपुर न्यूज़ | Rampur News';

            const seoTitleAuto = seoTitleAutoRaw.length > 60 ? truncateText(seoTitleAutoRaw, 60) : seoTitleAutoRaw;

            const seoOverride = !!formData.seoOverride;
            const effectiveSeoTitle = seoOverride ? (formData.seoTitle || '') : seoTitleAuto;
            const effectiveSeoDescription = seoOverride ? (formData.seoDescription || '') : descriptionAuto;

            const ai = deriveAiSeoSignals({
              title: title || '',
              excerpt: formData.excerpt || '',
              content: formData.content || '',
              category: categorySlug || '',
              categoryHindi: formData.categoryHindi || '',
              tags: Array.isArray(formData.tags) ? formData.tags : [],
              publishedDate: formData.publishedDate || '',
            });

            const targetTitleOk = effectiveSeoTitle.trim().length >= 35 && effectiveSeoTitle.trim().length <= 60;
            const targetDescOk = effectiveSeoDescription.trim().length >= 120 && effectiveSeoDescription.trim().length <= 160;
            const hasPrimaryKeyword =
              ai.keywords.length > 0 ? `${effectiveSeoTitle} ${effectiveSeoDescription}`.includes(ai.keywords[0]!) : true;
            const scoreBase = 60;
            const score =
              scoreBase +
              (targetTitleOk ? 15 : 0) +
              (targetDescOk ? 15 : 0) +
              (hasPrimaryKeyword ? 10 : 0);

            const suggestedTitle =
              title && categoryName ? truncateText(`${title} | ${categoryName}`, 60) : truncateText(`${title} | Rampur News`, 60);
            const suggestedDescription = truncateText(
              ((formData.excerpt || '').trim() || stripHtmlToText(formData.content || '')).trim(),
              160,
            );

            return (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>SEO सेटिंग्स</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="text-sm font-medium">Enable Manual SEO Override</div>
                        <div className="text-xs text-muted-foreground">
                          SEO fields auto-generated. Edit only if needed.
                        </div>
                      </div>
                      <Switch
                        checked={seoOverride}
                        onCheckedChange={(v) =>
                          setFormData((prev) => ({
                            ...prev,
                            seoOverride: v,
                            seoTitle: v ? (prev.seoTitle || seoTitleAuto) : prev.seoTitle,
                            seoDescription: v ? (prev.seoDescription || descriptionAuto) : prev.seoDescription,
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="seoTitle">SEO शीर्षक</Label>
                      <Input
                        id="seoTitle"
                        value={effectiveSeoTitle}
                        onChange={(e) => {
                          if (!seoOverride) return;
                          setFormData((prev) => ({ ...prev, seoTitle: e.target.value }));
                        }}
                        placeholder="सर्च इंजन के लिए शीर्षक"
                        disabled={!seoOverride}
                      />
                      <div className="text-xs text-muted-foreground">
                        {seoOverride ? 'मैन्युअल (वैकल्पिक)' : 'ऑटो-जेनरेटेड'}
                        {` • ${effectiveSeoTitle.trim().length}/60`}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="seoDescription">मेटा विवरण</Label>
                      <Textarea
                        id="seoDescription"
                        value={effectiveSeoDescription}
                        onChange={(e) => {
                          if (!seoOverride) return;
                          setFormData((prev) => ({ ...prev, seoDescription: e.target.value }));
                        }}
                        placeholder="160 अक्षरों तक का विवरण"
                        rows={3}
                        disabled={!seoOverride}
                      />
                      <div className="text-xs text-muted-foreground">
                        {seoOverride ? 'मैन्युअल (वैकल्पिक)' : 'ऑटो-जेनरेटेड'}
                        {` • ${effectiveSeoDescription.trim().length}/160`}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm font-medium">Canonical URL</div>
                      <div className="text-xs text-muted-foreground break-all">
                        {canonicalUrl || '—'}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>AI SEO Suggestions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm font-medium">{`SEO Score: ${Math.min(100, Math.max(0, score))}/100`}</div>
                    <div className="text-xs text-muted-foreground">
                      {`Keywords: ${ai.keywords.slice(0, 10).join(', ')}`}
                    </div>
                    <div className="grid gap-3">
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Suggested Title</div>
                        <div className="text-sm text-muted-foreground">{suggestedTitle}</div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              seoOverride: true,
                              seoTitle: suggestedTitle,
                            }));
                          }}
                        >
                          Apply
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Suggested Description</div>
                        <div className="text-sm text-muted-foreground">{suggestedDescription}</div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              seoOverride: true,
                              seoDescription: suggestedDescription,
                            }));
                          }}
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })()}
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>प्रकाशन सेटिंग्स</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>स्थिति</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(v) => setFormData(prev => ({ ...prev, status: v as 'draft' | 'published' | 'scheduled' }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">ड्राफ्ट</SelectItem>
                    <SelectItem value="published">प्रकाशित</SelectItem>
                    <SelectItem value="scheduled">शेड्यूल</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="publishDate">प्रकाशन तिथि</Label>
                <Input
                  id="publishDate"
                  type="datetime-local"
                  value={formData.publishedDate?.slice(0, 16)}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    publishedDate: new Date(e.target.value).toISOString() 
                  }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ArticleEditor;
