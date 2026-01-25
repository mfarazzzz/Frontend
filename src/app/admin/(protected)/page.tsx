"use client";
import { useArticles, useCategories, useAuthors } from '@/hooks/useCMS';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, 
  FolderOpen, 
  Users, 
  Eye, 
  TrendingUp,
  Clock,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow, isValid } from 'date-fns';
import { hi } from 'date-fns/locale';

export default function AdminDashboard() {
  const { data: articlesData } = useArticles({ limit: 100 });
  const { data: categories } = useCategories();
  const { data: authors } = useAuthors();

  const totalArticles = articlesData?.total || 0;
  const publishedArticles = articlesData?.data.filter(a => a.status === 'published').length || 0;
  const draftArticles = articlesData?.data.filter(a => a.status === 'draft').length || 0;
  const recentArticles = articlesData?.data.slice(0, 5) || [];

  const formatPublishedDistance = (article: any) => {
    const raw = article?.publishedDate ?? article?.publishedAt ?? article?.createdAt ?? null;
    if (!raw) return '—';
    const date = new Date(raw);
    if (!isValid(date)) return '—';
    return formatDistanceToNow(date, { addSuffix: true, locale: hi });
  };

  const stats = [
    { 
      title: 'कुल लेख', 
      value: totalArticles, 
      icon: FileText, 
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      href: '/admin/articles'
    },
    { 
      title: 'प्रकाशित', 
      value: publishedArticles, 
      icon: Eye, 
      color: 'text-green-500',
      bg: 'bg-green-500/10',
      href: '/admin/articles?status=published'
    },
    { 
      title: 'ड्राफ्ट', 
      value: draftArticles, 
      icon: Clock, 
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
      href: '/admin/articles?status=draft'
    },
    { 
      title: 'श्रेणियाँ', 
      value: categories?.length || 0, 
      icon: FolderOpen, 
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
      href: '/admin/categories'
    },
    { 
      title: 'लेखक', 
      value: authors?.length || 0, 
      icon: Users, 
      color: 'text-pink-500',
      bg: 'bg-pink-500/10',
      href: '/admin/authors'
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">डैशबोर्ड</h1>
        <p className="text-muted-foreground">रामपुर न्यूज़ CMS में आपका स्वागत है</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${stat.bg}`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Articles */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">हाल के लेख</CardTitle>
            <Link 
              href="/admin/articles" 
              className="text-sm text-primary hover:underline"
            >
              सभी देखें
            </Link>
          </CardHeader>
          <CardContent>
            {recentArticles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>कोई लेख नहीं मिला</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentArticles.map((article) => (
                  <Link 
                    key={article.id}
                    href={`/admin/articles/${article.id}`}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <img 
                      src={article.image} 
                      alt={article.title}
                      className="w-16 h-12 rounded object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-2">{article.title}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span className="px-1.5 py-0.5 rounded bg-muted">
                          {article.categoryHindi}
                        </span>
                        <span>
                          {formatPublishedDistance(article)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions & Category Stats */}
        <div className="space-y-6">
          {/* Category Distribution */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">श्रेणी वितरण</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categories?.slice(0, 6).map((cat) => {
                  const count = articlesData?.data.filter(a => a.category === cat.slug).length || 0;
                  const percentage = totalArticles > 0 ? (count / totalArticles) * 100 : 0;
                  
                  return (
                    <div key={cat.id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{cat.titleHindi}</span>
                        <span className="text-muted-foreground">{count}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                CMS टिप्स
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  WordPress, Strapi, या Sanity से आसानी से कनेक्ट करें
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  SEO के लिए मेटा टैग और स्कीमा मार्कअप स्वचालित रूप से उत्पन्न होते हैं
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  नियमित रूप से बैकअप लेना न भूलें
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
