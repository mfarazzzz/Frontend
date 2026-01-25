import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, ThumbsUp, MessageSquare } from 'lucide-react';
import AddReviewForm from './AddReviewForm';

export interface Review {
  id: string;
  authorName: string;
  authorImage?: string;
  rating: number;
  content: string;
  date: string;
  helpful?: number;
  verified?: boolean;
}

interface ReviewsSectionProps {
  reviews: Review[];
  averageRating?: number;
  totalReviews?: number;
  entityName?: string;
  onAddReview?: (review: Omit<Review, 'id' | 'date' | 'helpful'>) => void;
}

const ReviewsSection = ({
  reviews,
  averageRating,
  totalReviews,
  entityName = '',
  onAddReview,
}: ReviewsSectionProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [localReviews, setLocalReviews] = useState<Review[]>(reviews);
  
  const handleAddReview = (reviewData: Omit<Review, 'id' | 'date' | 'helpful'>) => {
    const newReview: Review = {
      ...reviewData,
      id: `review-${Date.now()}`,
      date: new Date().toISOString(),
      helpful: 0,
    };
    
    setLocalReviews([newReview, ...localReviews]);
    setShowAddForm(false);
    
    if (onAddReview) {
      onAddReview(reviewData);
    }
  };
  
  const renderStars = (rating: number, size = 16) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={`${
              star <= rating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };
  
  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    localReviews.forEach((review) => {
      if (review.rating >= 1 && review.rating <= 5) {
        distribution[review.rating as keyof typeof distribution]++;
      }
    });
    return distribution;
  };
  
  const distribution = getRatingDistribution();
  const calculatedAverage = averageRating || (
    localReviews.length > 0
      ? localReviews.reduce((sum, r) => sum + r.rating, 0) / localReviews.length
      : 0
  );
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare size={20} />
            समीक्षाएं और रेटिंग
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            समीक्षा लिखें
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rating Summary */}
        <div className="flex flex-col md:flex-row gap-6">
          <div className="text-center md:text-left">
            <div className="text-4xl font-bold">{calculatedAverage.toFixed(1)}</div>
            {renderStars(Math.round(calculatedAverage), 20)}
            <p className="text-sm text-muted-foreground mt-1">
              {totalReviews || localReviews.length} समीक्षाएं
            </p>
          </div>
          
          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center gap-2">
                <span className="w-3 text-sm">{star}</span>
                <Star size={12} className="text-yellow-400 fill-yellow-400" />
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full"
                    style={{
                      width: `${localReviews.length > 0 ? (distribution[star as keyof typeof distribution] / localReviews.length) * 100 : 0}%`,
                    }}
                  />
                </div>
                <span className="w-8 text-sm text-muted-foreground">
                  {distribution[star as keyof typeof distribution]}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Add Review Form */}
        {showAddForm && (
          <AddReviewForm
            entityName={entityName}
            onSubmit={handleAddReview}
            onCancel={() => setShowAddForm(false)}
          />
        )}
        
        {/* Reviews List */}
        <div className="space-y-4">
          {localReviews.map((review) => (
            <div key={review.id} className="border-b pb-4 last:border-0">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={review.authorImage} />
                  <AvatarFallback>{review.authorName.charAt(0)}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{review.authorName}</span>
                    {review.verified && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                        सत्यापित
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    {renderStars(review.rating, 14)}
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.date).toLocaleDateString('hi-IN')}
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">{review.content}</p>
                  
                  <div className="flex items-center gap-4 mt-2">
                    <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
                      <ThumbsUp size={14} />
                      उपयोगी ({review.helpful || 0})
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {localReviews.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              अभी कोई समीक्षा नहीं है। पहली समीक्षा लिखें!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewsSection;
