import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  variant?: 'exam' | 'result' | 'application' | 'general';
  size?: 'sm' | 'md';
  className?: string;
}

const getStatusConfig = (status: string, variant: string) => {
  // Application status badges
  if (variant === 'application') {
    switch (status) {
      case 'open':
        return { 
          label: 'आवेदन जारी', 
          labelEn: 'Apply Now',
          bgClass: 'bg-green-500',
          textClass: 'text-white',
          pulse: true
        };
      case 'closed':
        return { 
          label: 'आवेदन बंद', 
          labelEn: 'Closed',
          bgClass: 'bg-red-500',
          textClass: 'text-white'
        };
      case 'upcoming':
        return { 
          label: 'जल्द आवेदन', 
          labelEn: 'Coming Soon',
          bgClass: 'bg-blue-500',
          textClass: 'text-white'
        };
      case 'extended':
        return { 
          label: 'तिथि बढ़ी', 
          labelEn: 'Extended',
          bgClass: 'bg-orange-500',
          textClass: 'text-white',
          pulse: true
        };
      default:
        return { label: status, bgClass: 'bg-muted', textClass: 'text-muted-foreground' };
    }
  }

  // Result status badges
  if (variant === 'result') {
    switch (status) {
      case 'declared':
        return { 
          label: 'घोषित', 
          labelEn: 'Declared',
          bgClass: 'bg-green-500',
          textClass: 'text-white'
        };
      case 'expected':
        return { 
          label: 'संभावित', 
          labelEn: 'Expected',
          bgClass: 'bg-yellow-500',
          textClass: 'text-black'
        };
      case 'not-declared':
        return { 
          label: 'जारी नहीं', 
          labelEn: 'Not Yet',
          bgClass: 'bg-muted',
          textClass: 'text-muted-foreground'
        };
      default:
        return { label: status, bgClass: 'bg-muted', textClass: 'text-muted-foreground' };
    }
  }

  // Admit card status
  if (status === 'available') {
    return { 
      label: 'एडमिट कार्ड जारी', 
      labelEn: 'Download Now',
      bgClass: 'bg-green-500',
      textClass: 'text-white',
      pulse: true
    };
  }
  if (status === 'not-released') {
    return { 
      label: 'जारी नहीं', 
      labelEn: 'Not Released',
      bgClass: 'bg-muted',
      textClass: 'text-muted-foreground'
    };
  }

  // General status
  switch (status) {
    case 'new':
      return { 
        label: 'नया', 
        labelEn: 'NEW',
        bgClass: 'bg-primary',
        textClass: 'text-primary-foreground'
      };
    case 'live':
      return { 
        label: 'लाइव', 
        labelEn: 'LIVE',
        bgClass: 'bg-red-600',
        textClass: 'text-white',
        pulse: true
      };
    case 'upcoming':
      return { 
        label: 'आगामी', 
        labelEn: 'Upcoming',
        bgClass: 'bg-blue-500',
        textClass: 'text-white'
      };
    case 'ongoing':
      return { 
        label: 'जारी', 
        labelEn: 'Ongoing',
        bgClass: 'bg-orange-500',
        textClass: 'text-white'
      };
    case 'completed':
      return { 
        label: 'समाप्त', 
        labelEn: 'Completed',
        bgClass: 'bg-muted',
        textClass: 'text-muted-foreground'
      };
    default:
      return { label: status, bgClass: 'bg-muted', textClass: 'text-muted-foreground' };
  }
};

export const StatusBadge = ({ status, variant = 'general', size = 'sm', className }: StatusBadgeProps) => {
  const config = getStatusConfig(status, variant);

  return (
    <span
      className={cn(
        "inline-flex items-center font-semibold rounded-sm",
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        config.bgClass,
        config.textClass,
        config.pulse && 'animate-pulse',
        className
      )}
    >
      {config.pulse && (
        <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-ping" />
      )}
      {config.label}
    </span>
  );
};

export default StatusBadge;