import { Link } from "@/lib/router-compat";
import { Calendar, Building2, Users, Percent, ExternalLink, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { CMSResult } from "@/services/cms/extendedTypes";
import { format } from "date-fns";
import { hi } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface ResultCardProps {
  result: CMSResult;
  variant?: 'default' | 'compact' | 'list';
}

export const ResultCard = ({ result, variant = 'default' }: ResultCardProps) => {
  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'd MMMM yyyy', { locale: hi });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = () => {
    switch (result.status) {
      case 'declared':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded bg-green-500 text-white">
            <CheckCircle2 className="h-3 w-3" />
            घोषित
          </span>
        );
      case 'expected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded bg-yellow-500 text-black">
            <Clock className="h-3 w-3" />
            संभावित
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded bg-muted text-muted-foreground">
            आगामी
          </span>
        );
    }
  };

  if (variant === 'list') {
    return (
      <div className={cn(
        "flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors",
        result.status === 'declared' && "border-l-4 border-l-green-500",
        result.status === 'expected' && "border-l-4 border-l-yellow-500"
      )}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {getStatusBadge()}
            {result.isNew && (
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-primary text-primary-foreground">
                नया
              </span>
            )}
          </div>
          <h4 className="font-semibold text-foreground line-clamp-1">
            {result.titleHindi}
          </h4>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            <span>{formatDate(result.resultDate)}</span>
            <span>•</span>
            <span>{result.organizationHindi}</span>
          </div>
        </div>
        {result.status === 'declared' && result.resultLink && (
          <Button size="sm" className="shrink-0" asChild>
            <a href={result.resultLink} target="_blank" rel="noopener noreferrer">
              देखें
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </Button>
        )}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <Card className={cn(
        "hover:shadow-md transition-shadow",
        result.status === 'declared' && "border-l-4 border-l-green-500",
        result.status === 'expected' && "border-l-4 border-l-yellow-500"
      )}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            {getStatusBadge()}
            {result.isNew && (
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-primary text-primary-foreground">
                नया
              </span>
            )}
          </div>
          <h3 className="font-semibold text-foreground line-clamp-2">
            {result.titleHindi}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {result.organizationHindi}
          </p>
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(result.resultDate)}</span>
          </div>
          {result.status === 'declared' && result.resultLink && (
            <Button size="sm" className="w-full mt-3" asChild>
              <a href={result.resultLink} target="_blank" rel="noopener noreferrer">
                परिणाम देखें
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "hover:shadow-lg transition-shadow overflow-hidden",
      result.status === 'declared' && "border-t-4 border-t-green-500",
      result.status === 'expected' && "border-t-4 border-t-yellow-500"
    )}>
      <CardContent className="p-0">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            {getStatusBadge()}
            {result.isNew && (
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-primary text-primary-foreground">
                नया अपडेट
              </span>
            )}
          </div>
          
          <h3 className="font-bold text-lg text-foreground line-clamp-2">
            {result.titleHindi}
          </h3>
          
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
            <Building2 className="h-4 w-4" />
            <span>{result.organizationHindi}</span>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {result.status === 'declared' ? 'घोषणा तिथि' : 'संभावित तिथि'}
              </span>
              <span className="font-semibold">
                {formatDate(result.expectedDate || result.resultDate)}
              </span>
            </div>

            {result.totalCandidates && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  कुल अभ्यर्थी
                </span>
                <span className="font-semibold">
                  {result.totalCandidates.toLocaleString('hi-IN')}
                </span>
              </div>
            )}

            {result.passPercentage && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Percent className="h-4 w-4" />
                  उत्तीर्ण प्रतिशत
                </span>
                <span className="font-semibold text-green-600">
                  {result.passPercentage}%
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 pt-0 flex gap-2">
          {result.status === 'declared' && result.resultLink ? (
            <Button className="flex-1" asChild>
              <a href={result.resultLink} target="_blank" rel="noopener noreferrer">
                परिणाम देखें
                <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            </Button>
          ) : (
            <Button className="flex-1" variant="secondary" disabled>
              परिणाम जल्द
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link to={`/education-jobs/results/${result.slug}`}>
              विवरण
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResultCard;
