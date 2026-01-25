import { Play, Clock, Eye, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { CMSVideoTutorial } from "@/services/cms/extendedTypes";

interface VideoCardProps {
  video: CMSVideoTutorial;
  variant?: 'default' | 'compact' | 'horizontal';
}

export const VideoCard = ({ video, variant = 'default' }: VideoCardProps) => {
  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'exam-prep': 'परीक्षा तैयारी',
      'career-guidance': 'करियर गाइडेंस',
      'study-tips': 'स्टडी टिप्स',
      'motivation': 'प्रेरणा',
      'subject-wise': 'विषयवार',
    };
    return labels[category] || category;
  };

  if (variant === 'horizontal') {
    return (
      <a 
        href={video.videoUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="group flex gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
      >
        <div className="relative w-40 aspect-video rounded-lg overflow-hidden shrink-0">
          <img 
            src={video.thumbnailUrl || '/placeholder.svg'} 
            alt={video.titleHindi}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Play className="h-5 w-5 text-white fill-white" />
            </div>
          </div>
          {video.duration && (
            <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 text-white text-xs rounded">
              {video.duration}
            </span>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded">
            {getCategoryLabel(video.category)}
          </span>
          <h4 className="font-semibold text-foreground mt-1 line-clamp-2 group-hover:text-primary transition-colors">
            {video.titleHindi}
          </h4>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            {video.instructorHindi && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {video.instructorHindi}
              </span>
            )}
            {video.views && (
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {video.views.toLocaleString('hi-IN')} views
              </span>
            )}
          </div>
        </div>
      </a>
    );
  }

  if (variant === 'compact') {
    return (
      <a 
        href={video.videoUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="group block"
      >
        <div className="relative aspect-video rounded-lg overflow-hidden">
          <img 
            src={video.thumbnailUrl || '/placeholder.svg'} 
            alt={video.titleHindi}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <Play className="h-6 w-6 text-white fill-white" />
            </div>
          </div>
          {video.duration && (
            <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 text-white text-xs rounded">
              {video.duration}
            </span>
          )}
        </div>
        <h4 className="font-semibold text-foreground mt-2 line-clamp-2 group-hover:text-primary transition-colors">
          {video.titleHindi}
        </h4>
      </a>
    );
  }

  return (
    <Card className="overflow-hidden group">
      <a 
        href={video.videoUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block"
      >
        <div className="relative aspect-video overflow-hidden">
          <img 
            src={video.thumbnailUrl || '/placeholder.svg'} 
            alt={video.titleHindi}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
              <Play className="h-8 w-8 text-white fill-white" />
            </div>
          </div>
          {video.duration && (
            <span className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 text-white text-sm rounded flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {video.duration}
            </span>
          )}
          <span className="absolute top-2 left-2 px-2 py-1 bg-primary text-primary-foreground text-xs font-medium rounded">
            {getCategoryLabel(video.category)}
          </span>
        </div>
        
        <CardContent className="p-4">
          <h3 className="font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {video.titleHindi}
          </h3>
          
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {video.descriptionHindi}
          </p>
          
          <div className="flex items-center justify-between mt-3 pt-3 border-t text-sm text-muted-foreground">
            {video.instructorHindi && (
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {video.instructorHindi}
              </span>
            )}
            {video.views && (
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {video.views.toLocaleString('hi-IN')}
              </span>
            )}
          </div>
        </CardContent>
      </a>
    </Card>
  );
};

export default VideoCard;