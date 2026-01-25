import { Link } from "@/lib/router-compat";
import { Calendar, Building2, Users, ExternalLink, FileCheck, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";
import type { CMSExam } from "@/services/cms/extendedTypes";
import { format } from "date-fns";
import { hi } from "date-fns/locale";

interface ExamCardProps {
  exam: CMSExam;
  variant?: 'default' | 'compact' | 'featured';
}

export const ExamCard = ({ exam, variant = 'default' }: ExamCardProps) => {
  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'd MMMM yyyy', { locale: hi });
    } catch {
      return dateStr;
    }
  };

  if (variant === 'compact') {
    return (
      <Card className="hover:shadow-md transition-shadow border-l-4 border-l-primary">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                {exam.isNew && <StatusBadge status="new" />}
                {exam.isLive && <StatusBadge status="live" />}
                <StatusBadge status={exam.applicationStatus} variant="application" />
              </div>
              <h3 className="font-semibold text-foreground line-clamp-1 text-sm">
                {exam.titleHindi}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {exam.organizationHindi}
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(exam.examDate)}
                </span>
                {exam.totalPosts && (
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {exam.totalPosts.toLocaleString('hi-IN')} पद
                  </span>
                )}
              </div>
            </div>
            <Button size="sm" variant="outline" asChild>
              <Link to={`/education-jobs/exams/${exam.slug}`}>
                विवरण
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow group overflow-hidden">
      <CardContent className="p-0">
        {/* Header with badges */}
        <div className="p-4 border-b bg-muted/30">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              {exam.isNew && <StatusBadge status="new" />}
              {exam.isLive && <StatusBadge status="live" />}
              <span className="text-xs px-2 py-0.5 bg-secondary text-secondary-foreground rounded">
                {exam.category === 'board' && 'बोर्ड'}
                {exam.category === 'government' && 'सरकारी'}
                {exam.category === 'entrance' && 'प्रवेश'}
                {exam.category === 'university' && 'विश्वविद्यालय'}
                {exam.category === 'competitive' && 'प्रतियोगी'}
              </span>
            </div>
          </div>
          <h3 className="font-bold text-lg text-foreground mt-2 group-hover:text-primary transition-colors line-clamp-2">
            {exam.titleHindi}
          </h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
            <Building2 className="h-3.5 w-3.5" />
            <span>{exam.organizationHindi}</span>
          </div>
        </div>

        {/* Status indicators */}
        <div className="p-4 space-y-3">
          {/* Exam Date */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              परीक्षा तिथि
            </span>
            <span className="font-semibold text-foreground">
              {formatDate(exam.examDate)}
            </span>
          </div>

          {/* Application Status */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-2">
              <FileCheck className="h-4 w-4" />
              आवेदन स्थिति
            </span>
            <StatusBadge status={exam.applicationStatus} variant="application" />
          </div>

          {/* Admit Card Status */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-2">
              <Award className="h-4 w-4" />
              एडमिट कार्ड
            </span>
            <StatusBadge status={exam.admitCardStatus} />
          </div>

          {/* Total Posts if available */}
          {exam.totalPosts && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                कुल पद
              </span>
              <span className="font-semibold text-primary">
                {exam.totalPosts.toLocaleString('hi-IN')}
              </span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="p-4 pt-0 flex gap-2">
          <Button asChild className="flex-1">
            <Link to={`/education-jobs/exams/${exam.slug}`}>
              पूरी जानकारी
            </Link>
          </Button>
          {exam.officialWebsite && (
            <Button variant="outline" size="icon" asChild>
              <a href={exam.officialWebsite} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExamCard;