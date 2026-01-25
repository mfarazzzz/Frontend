import { Link } from "@/lib/router-compat";
import { Clock, ExternalLink, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CMSEducationNews } from "@/services/cms/extendedTypes";
import { format } from "date-fns";
import { hi } from "date-fns/locale";

interface NewsCardProps {
  news: CMSEducationNews;
  variant?: 'default' | 'compact' | 'featured';
}

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  'board-news': { label: 'बोर्ड समाचार', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  'exam-news': { label: 'परीक्षा अपडेट', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' },
  'result-news': { label: 'रिजल्ट न्यूज़', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
  'admission-news': { label: 'एडमिशन', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' },
  'scholarship': { label: 'छात्रवृत्ति', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' },
  'government-order': { label: 'सरकारी आदेश', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
};

const NewsCard = ({ news, variant = 'default' }: NewsCardProps) => {
  const categoryInfo = CATEGORY_LABELS[news.category] || { label: news.category, color: 'bg-muted text-muted-foreground' };

  if (variant === 'compact') {
    return (
      <Link to={`/education-jobs/news/${news.slug}`} className="block group">
        <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
          {news.isBreaking && (
            <span className="shrink-0 mt-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
              {news.titleHindi}
            </p>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {format(new Date(news.publishedAt), 'd MMM', { locale: hi })}
              <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${categoryInfo.color}`}>
                {categoryInfo.label}
              </Badge>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </Link>
    );
  }

  if (variant === 'featured') {
    return (
      <Card className="overflow-hidden group hover:shadow-lg transition-all">
        {news.image && (
          <div className="aspect-video overflow-hidden">
            <img 
              src={news.image} 
              alt={news.titleHindi}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            {news.isBreaking && (
              <Badge variant="destructive" className="text-xs animate-pulse">
                ब्रेकिंग
              </Badge>
            )}
            {news.isImportant && (
              <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700">
                महत्वपूर्ण
              </Badge>
            )}
            <Badge variant="secondary" className={`text-xs ${categoryInfo.color}`}>
              {categoryInfo.label}
            </Badge>
          </div>
          <Link to={`/education-jobs/news/${news.slug}`}>
            <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {news.titleHindi}
            </h3>
          </Link>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {news.excerptHindi}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {format(new Date(news.publishedAt), 'd MMMM yyyy', { locale: hi })}
            </span>
            <Button variant="ghost" size="sm" asChild>
              <Link to={`/education-jobs/news/${news.slug}`}>
                पढ़ें <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden group hover:shadow-md transition-all">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          {news.isBreaking && (
            <Badge variant="destructive" className="text-xs animate-pulse">
              ब्रेकिंग
            </Badge>
          )}
          {news.isImportant && !news.isBreaking && (
            <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700">
              महत्वपूर्ण
            </Badge>
          )}
          <Badge variant="secondary" className={`text-xs ${categoryInfo.color}`}>
            {categoryInfo.label}
          </Badge>
        </div>
        <Link to={`/education-jobs/news/${news.slug}`}>
          <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {news.titleHindi}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {news.excerptHindi}
        </p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {format(new Date(news.publishedAt), 'd MMM yyyy', { locale: hi })}
          </span>
          {news.source && (
            <span className="flex items-center gap-1">
              स्रोत: {news.source}
              {news.sourceLink && <ExternalLink className="h-3 w-3" />}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NewsCard;
