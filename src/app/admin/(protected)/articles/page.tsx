"use client";
import { useState } from 'react';
import { useArticles, useDeleteArticle, useUpdateArticle } from '@/hooks/useCMS';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  Star,
  Zap,
  Filter
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format, isValid } from 'date-fns';
import { hi } from 'date-fns/locale';
import { toast } from 'sonner';
import type { CMSArticle } from '@/services/cms';

export default function ArticlesList() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  const { data: articlesData, isLoading } = useArticles({ 
    limit: 50,
    search: search.length > 2 ? search : undefined,
    status: statusFilter !== 'all' ? statusFilter as 'published' | 'draft' : undefined,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
  });
  
  const deleteArticle = useDeleteArticle();
  const updateArticle = useUpdateArticle();

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`क्या आप "${title}" को हटाना चाहते हैं?`)) {
      try {
        await deleteArticle.mutateAsync(id);
        toast.success('लेख हटा दिया गया');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'लेख हटाने में त्रुटि');
      }
    }
  };

  const toggleFeatured = async (article: CMSArticle) => {
    try {
      await updateArticle.mutateAsync({
        id: article.id,
        updates: { isFeatured: !article.isFeatured }
      });
      toast.success(article.isFeatured ? 'फीचर्ड हटाया गया' : 'फीचर्ड किया गया');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'अपडेट करने में त्रुटि');
    }
  };

  const toggleBreaking = async (article: CMSArticle) => {
    try {
      await updateArticle.mutateAsync({
        id: article.id,
        updates: { isBreaking: !article.isBreaking }
      });
      toast.success(article.isBreaking ? 'ब्रेकिंग हटाया गया' : 'ब्रेकिंग किया गया');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'अपडेट करने में त्रुटि');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="default" className="bg-green-500">प्रकाशित</Badge>;
      case 'draft':
        return <Badge variant="secondary">ड्राफ्ट</Badge>;
      case 'scheduled':
        return <Badge variant="outline" className="border-blue-500 text-blue-500">शेड्यूल</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getArticleStatus = (article: CMSArticle) => {
    if (article.publishedAt) return 'published';
    if (article.scheduledAt) {
      const d = new Date(article.scheduledAt);
      if (!Number.isNaN(d.getTime()) && d.getTime() > Date.now()) return 'scheduled';
      return 'draft';
    }
    return 'draft';
  };

  const formatPublishedDate = (article: any) => {
    const raw = article?.publishedDate ?? article?.publishedAt ?? article?.createdAt ?? null;
    if (!raw) return '—';
    const date = new Date(raw);
    if (!isValid(date)) return '—';
    return format(date, 'd MMM yyyy', { locale: hi });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">लेख</h1>
          <p className="text-muted-foreground">
            कुल {articlesData?.total || 0} लेख
          </p>
        </div>
        <Button onClick={() => router.push('/admin/articles/new')} className="gap-2">
          <Plus className="w-4 h-4" />
          नया लेख
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="खोजें..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="स्थिति" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">सभी स्थिति</SelectItem>
              <SelectItem value="published">प्रकाशित</SelectItem>
              <SelectItem value="draft">ड्राफ्ट</SelectItem>
              <SelectItem value="scheduled">शेड्यूल</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[400px]">शीर्षक</TableHead>
              <TableHead>श्रेणी</TableHead>
              <TableHead>स्थिति</TableHead>
              <TableHead>तिथि</TableHead>
              <TableHead className="text-right">कार्रवाई</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  लोड हो रहा है...
                </TableCell>
              </TableRow>
            ) : articlesData?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  कोई लेख नहीं मिला
                </TableCell>
              </TableRow>
            ) : (
              articlesData?.data.map((article) => (
                <TableRow key={article.id}>
                  <TableCell>
                    <div className="flex items-start gap-3">
                      <img 
                        src={article.image} 
                        alt={article.title}
                        className="w-16 h-12 rounded object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <Link 
                          href={`/admin/articles/${article.id}`}
                          className="font-medium hover:text-primary line-clamp-2"
                        >
                          {article.title}
                        </Link>
                        <div className="flex items-center gap-1 mt-1">
                          {article.isFeatured && (
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          )}
                          {article.isBreaking && (
                            <Zap className="w-3 h-3 text-red-500 fill-red-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{article.categoryHindi}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(getArticleStatus(article))}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatPublishedDate(article)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/admin/articles/${article.id}`)}>
                          <Edit className="w-4 h-4 mr-2" />
                          संपादित करें
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open(`/${article.category}/${article.slug}`, '_blank')}>
                          <Eye className="w-4 h-4 mr-2" />
                          देखें
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => toggleFeatured(article)}>
                          <Star className={`w-4 h-4 mr-2 ${article.isFeatured ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                          {article.isFeatured ? 'फीचर्ड हटाएं' : 'फीचर्ड करें'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleBreaking(article)}>
                          <Zap className={`w-4 h-4 mr-2 ${article.isBreaking ? 'fill-red-500 text-red-500' : ''}`} />
                          {article.isBreaking ? 'ब्रेकिंग हटाएं' : 'ब्रेकिंग करें'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDelete(article.id, article.title)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          हटाएं
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
