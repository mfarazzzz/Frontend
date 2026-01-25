import { Link } from "@/lib/router-compat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Star, Clock, ExternalLink } from "lucide-react";
import Image from "next/image";

interface ListingCardProps {
  title: string;
  titleHindi: string;
  slug: string;
  basePath: string;
  type?: string;
  typeLabel?: string;
  address?: string;
  addressHindi?: string;
  phone?: string;
  rating?: number;
  reviews?: number;
  image?: string;
  description?: string;
  descriptionHindi?: string;
  badges?: { label: string; variant?: 'default' | 'secondary' | 'outline' }[];
  openingHours?: string;
  priceRange?: string;
  isFeatured?: boolean;
}

const isLocalUpstreamImage = (src: string) => {
  try {
    const url = new URL(src);
    return url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.hostname === "::1";
  } catch {
    return false;
  }
};

const ListingCard = ({
  title,
  titleHindi,
  slug,
  basePath,
  type,
  typeLabel,
  address,
  addressHindi,
  phone,
  rating,
  reviews,
  image,
  description,
  descriptionHindi,
  badges = [],
  openingHours,
  priceRange,
  isFeatured,
}: ListingCardProps) => {
  const detailLink = `${basePath}/${slug}`;
  const unoptimizedImage = image ? isLocalUpstreamImage(image) : false;
  
  const getPriceRangeLabel = (range?: string) => {
    switch (range) {
      case 'budget': return '₹';
      case 'moderate': return '₹₹';
      case 'expensive': return '₹₹₹';
      case 'luxury': return '₹₹₹₹';
      default: return null;
    }
  };

  return (
    <Card className={`group overflow-hidden transition-all hover:shadow-lg ${isFeatured ? 'ring-2 ring-primary' : ''}`}>
      <Link to={detailLink}>
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          {image ? (
            <Image
              src={image}
              alt={titleHindi}
              fill
              unoptimized={unoptimizedImage}
              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/10">
              <span className="text-4xl text-muted-foreground/50">📷</span>
            </div>
          )}
          
          {/* Featured badge */}
          {isFeatured && (
            <Badge className="absolute top-2 left-2 bg-primary">
              विशेष
            </Badge>
          )}
          
          {/* Type badge */}
          {typeLabel && (
            <Badge variant="secondary" className="absolute top-2 right-2">
              {typeLabel}
            </Badge>
          )}
        </div>
      </Link>
      
      <CardContent className="p-4">
        {/* Title and Rating */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <Link to={detailLink} className="flex-1">
            <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">
              {titleHindi}
            </h3>
          </Link>
          {rating && (
            <div className="flex items-center gap-1 shrink-0">
              <Star size={14} className="fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{rating.toFixed(1)}</span>
              {reviews && (
                <span className="text-xs text-muted-foreground">({reviews})</span>
              )}
            </div>
          )}
        </div>
        
        {/* Price Range */}
        {priceRange && (
          <div className="text-sm text-muted-foreground mb-2">
            {getPriceRangeLabel(priceRange)}
          </div>
        )}
        
        {/* Description */}
        {descriptionHindi && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {descriptionHindi}
          </p>
        )}
        
        {/* Badges */}
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {badges.slice(0, 3).map((badge, index) => (
              <Badge key={index} variant={badge.variant || 'outline'} className="text-xs">
                {badge.label}
              </Badge>
            ))}
            {badges.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{badges.length - 3}
              </Badge>
            )}
          </div>
        )}
        
        {/* Meta info */}
        <div className="space-y-1 text-sm text-muted-foreground">
          {addressHindi && (
            <div className="flex items-center gap-2">
              <MapPin size={14} className="shrink-0" />
              <span className="line-clamp-1">{addressHindi}</span>
            </div>
          )}
          {openingHours && (
            <div className="flex items-center gap-2">
              <Clock size={14} className="shrink-0" />
              <span>{openingHours}</span>
            </div>
          )}
          {phone && (
            <div className="flex items-center gap-2">
              <Phone size={14} className="shrink-0" />
              <span>{phone}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ListingCard;
