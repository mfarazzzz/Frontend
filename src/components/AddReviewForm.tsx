import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { toast } from 'sonner';

interface AddReviewFormProps {
  entityName?: string;
  onSubmit: (review: { authorName: string; rating: number; content: string }) => void;
  onCancel: () => void;
}

const AddReviewForm = ({ entityName, onSubmit, onCancel }: AddReviewFormProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [authorName, setAuthorName] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error('कृपया रेटिंग दें');
      return;
    }
    
    if (!authorName.trim()) {
      toast.error('कृपया अपना नाम लिखें');
      return;
    }
    
    if (!content.trim()) {
      toast.error('कृपया समीक्षा लिखें');
      return;
    }
    
    setIsSubmitting(true);
    
    setTimeout(() => {
      onSubmit({ authorName, rating, content });
      toast.success('समीक्षा सफलतापूर्वक जोड़ी गई!');
      setIsSubmitting(false);
    }, 500);
  };
  
  return (
    <Card className="bg-muted/50">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-base font-medium">
              {entityName ? `${entityName} को रेट करें` : 'रेटिंग दें'}
            </Label>
            <div className="flex gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    size={32}
                    className={`transition-colors ${
                      star <= (hoveredRating || rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                आपकी रेटिंग: {rating} स्टार
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="authorName">आपका नाम</Label>
            <Input
              id="authorName"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="अपना नाम लिखें"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">आपकी समीक्षा</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="अपना अनुभव साझा करें..."
              rows={4}
              required
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              रद्द करें
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'जोड़ा जा रहा है...' : 'समीक्षा जोड़ें'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddReviewForm;
