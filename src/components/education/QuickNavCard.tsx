import { Link } from "@/lib/router-compat";
import { LucideIcon, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickNavCardProps {
  title: string;
  titleHindi: string;
  description?: string;
  descriptionHindi?: string;
  icon: LucideIcon;
  href: string;
  count?: number;
  countLabel?: string;
  variant?: 'default' | 'primary' | 'gradient';
  className?: string;
}

export const QuickNavCard = ({
  title,
  titleHindi,
  description,
  descriptionHindi,
  icon: Icon,
  href,
  count,
  countLabel,
  variant = 'default',
  className,
}: QuickNavCardProps) => {
  return (
    <Link
      to={href}
      className={cn(
        "group relative flex flex-col p-4 rounded-xl border transition-all duration-300 hover:shadow-lg",
        variant === 'default' && "bg-card hover:border-primary/50",
        variant === 'primary' && "bg-primary text-primary-foreground hover:bg-primary/90",
        variant === 'gradient' && "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-primary/20",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className={cn(
          "w-12 h-12 rounded-lg flex items-center justify-center",
          variant === 'default' && "bg-primary/10",
          (variant === 'primary' || variant === 'gradient') && "bg-white/20"
        )}>
          <Icon className={cn(
            "h-6 w-6",
            variant === 'default' && "text-primary",
            (variant === 'primary' || variant === 'gradient') && "text-white"
          )} />
        </div>
        <ArrowRight className={cn(
          "h-5 w-5 transition-transform group-hover:translate-x-1",
          variant === 'default' && "text-muted-foreground group-hover:text-primary",
          (variant === 'primary' || variant === 'gradient') && "text-white/70"
        )} />
      </div>
      
      <div className="mt-4">
        <h3 className={cn(
          "font-bold text-lg",
          variant === 'default' && "text-foreground group-hover:text-primary"
        )}>
          {titleHindi}
        </h3>
        {descriptionHindi && (
          <p className={cn(
            "text-sm mt-1 line-clamp-2",
            variant === 'default' && "text-muted-foreground",
            (variant === 'primary' || variant === 'gradient') && "text-white/80"
          )}>
            {descriptionHindi}
          </p>
        )}
      </div>

      {count !== undefined && (
        <div className={cn(
          "mt-3 pt-3 border-t flex items-center justify-between",
          variant === 'default' && "border-border",
          (variant === 'primary' || variant === 'gradient') && "border-white/20"
        )}>
          <span className="text-2xl font-bold">{count.toLocaleString('hi-IN')}</span>
          {countLabel && (
            <span className={cn(
              "text-xs",
              variant === 'default' && "text-muted-foreground",
              (variant === 'primary' || variant === 'gradient') && "text-white/70"
            )}>
              {countLabel}
            </span>
          )}
        </div>
      )}
    </Link>
  );
};

export default QuickNavCard;
