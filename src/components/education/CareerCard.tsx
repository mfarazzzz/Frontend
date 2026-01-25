import { Link } from "@/lib/router-compat";
import { Briefcase, GraduationCap, IndianRupee, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { CMSCareerGuide } from "@/services/cms/extendedTypes";

interface CareerCardProps {
  career: CMSCareerGuide;
  variant?: 'default' | 'compact' | 'featured';
}

export const CareerCard = ({ career, variant = 'default' }: CareerCardProps) => {
  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'after-10th': '10वीं के बाद',
      'after-12th': '12वीं के बाद',
      'graduation': 'ग्रेजुएशन के बाद',
      'government-jobs': 'सरकारी नौकरी',
      'private-sector': 'प्राइवेट सेक्टर',
      'abroad': 'विदेश में करियर',
      'skills': 'स्किल डेवलपमेंट',
    };
    return labels[category] || category;
  };

  if (variant === 'compact') {
    return (
      <Card className="hover:shadow-md transition-shadow group">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs px-2 py-0.5 bg-secondary text-secondary-foreground rounded">
                {getCategoryLabel(career.category)}
              </span>
              <h3 className="font-semibold text-foreground mt-1 line-clamp-2 group-hover:text-primary transition-colors">
                {career.titleHindi}
              </h3>
              {career.averageSalary && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <IndianRupee className="h-3 w-3" />
                  <span>{career.averageSalary}</span>
                </div>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full mt-3" asChild>
            <Link to={`/education-jobs/career/${career.slug}`}>
              और जानें <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'featured') {
    return (
      <Card className="hover:shadow-lg transition-shadow overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {career.image ? (
              <img 
                src={career.image} 
                alt={career.titleHindi}
                className="w-20 h-20 rounded-lg object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-lg bg-primary/20 flex items-center justify-center">
                <Briefcase className="h-10 w-10 text-primary" />
              </div>
            )}
            <div className="flex-1">
              <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded font-medium">
                {getCategoryLabel(career.category)}
              </span>
              <h3 className="font-bold text-xl text-foreground mt-2">
                {career.titleHindi}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {career.descriptionHindi}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-4">
            {career.averageSalary && (
              <div className="bg-background/50 rounded-lg p-3">
                <span className="text-xs text-muted-foreground">औसत वेतन</span>
                <p className="font-semibold text-primary">{career.averageSalary}</p>
              </div>
            )}
            {career.requiredExams && career.requiredExams.length > 0 && (
              <div className="bg-background/50 rounded-lg p-3">
                <span className="text-xs text-muted-foreground">आवश्यक परीक्षाएं</span>
                <p className="font-semibold text-foreground">{career.requiredExams.slice(0, 2).join(', ')}</p>
              </div>
            )}
          </div>

          <Button className="w-full mt-4" asChild>
            <Link to={`/education-jobs/career/${career.slug}`}>
              पूरी जानकारी पढ़ें <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow group overflow-hidden">
      <CardContent className="p-0">
        {career.image && (
          <div className="aspect-video overflow-hidden">
            <img 
              src={career.image} 
              alt={career.titleHindi}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <div className="p-4">
          <span className="text-xs px-2 py-0.5 bg-secondary text-secondary-foreground rounded">
            {getCategoryLabel(career.category)}
          </span>
          <h3 className="font-bold text-lg text-foreground mt-2 group-hover:text-primary transition-colors line-clamp-2">
            {career.titleHindi}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {career.descriptionHindi}
          </p>
          
          <div className="flex items-center justify-between mt-4">
            {career.averageSalary && (
              <div className="flex items-center gap-1 text-sm">
                <IndianRupee className="h-4 w-4 text-primary" />
                <span className="font-semibold text-primary">{career.averageSalary}</span>
              </div>
            )}
            <Button variant="ghost" size="sm" asChild>
              <Link to={`/education-jobs/career/${career.slug}`}>
                और जानें <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CareerCard;