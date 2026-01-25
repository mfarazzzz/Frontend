import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { CMSTestimonial } from "@/services/cms/extendedTypes";

interface TestimonialCardProps {
  testimonial: CMSTestimonial;
  variant?: 'default' | 'featured';
}

export const TestimonialCard = ({ testimonial, variant = 'default' }: TestimonialCardProps) => {
  if (variant === 'featured') {
    return (
      <Card className="overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-6">
          <Quote className="h-10 w-10 text-primary/30 mb-4" />
          
          <p className="text-lg text-foreground leading-relaxed">
            "{testimonial.contentHindi}"
          </p>
          
          <div className="flex items-center gap-4 mt-6 pt-4 border-t border-primary/10">
            {testimonial.image ? (
              <img 
                src={testimonial.image} 
                alt={testimonial.nameHindi}
                className="w-14 h-14 rounded-full object-cover border-2 border-primary/20"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xl font-bold text-primary">
                  {testimonial.nameHindi.charAt(0)}
                </span>
              </div>
            )}
            
            <div className="flex-1">
              <h4 className="font-bold text-foreground">{testimonial.nameHindi}</h4>
              <p className="text-sm text-muted-foreground">{testimonial.designationHindi}</p>
              {testimonial.exam && (
                <p className="text-xs text-primary mt-0.5">
                  {testimonial.exam} • {testimonial.year}
                </p>
              )}
            </div>
            
            {testimonial.rating && (
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-4 w-4 ${i < testimonial.rating! ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`} 
                  />
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start gap-3 mb-3">
          {testimonial.image ? (
            <img 
              src={testimonial.image} 
              alt={testimonial.nameHindi}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg font-bold text-primary">
                {testimonial.nameHindi.charAt(0)}
              </span>
            </div>
          )}
          
          <div>
            <h4 className="font-semibold text-foreground">{testimonial.nameHindi}</h4>
            <p className="text-sm text-muted-foreground">{testimonial.designationHindi}</p>
          </div>
        </div>
        
        {testimonial.rating && (
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`h-3.5 w-3.5 ${i < testimonial.rating! ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`} 
              />
            ))}
          </div>
        )}
        
        <p className="text-sm text-foreground/80">
          "{testimonial.contentHindi}"
        </p>
        
        {testimonial.exam && (
          <div className="mt-3 pt-3 border-t">
            <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
              {testimonial.exam} {testimonial.year}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TestimonialCard;