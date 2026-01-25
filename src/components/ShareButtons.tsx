import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  MessageCircle, Send, Facebook, Twitter, Link2, Share2, Check 
} from 'lucide-react';

interface ShareButtonsProps {
  url?: string;
  title: string;
  description?: string;
  variant?: 'horizontal' | 'vertical' | 'floating';
  showLabels?: boolean;
}

const ShareButtons = ({ 
  url = typeof window !== 'undefined' ? window.location.href : '',
  title,
  description = '',
  variant = 'horizontal',
  showLabels = false
}: ShareButtonsProps) => {
  const [copied, setCopied] = useState(false);
  
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedText = encodeURIComponent(`${title}\n\n${description}`);
  
  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodedText}%0A%0A${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
  };
  
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('लिंक कॉपी हो गया!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('कॉपी नहीं हो सका');
    }
  };
  
  const handleShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], '_blank', 'width=600,height=400');
  };
  
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: description, url });
      } catch {
        // User cancelled
      }
    }
  };
  
  const buttons = [
    {
      id: 'whatsapp',
      icon: MessageCircle,
      label: 'WhatsApp',
      className: 'bg-[#25D366] hover:bg-[#20BD5A] text-white',
      onClick: () => handleShare('whatsapp'),
    },
    {
      id: 'telegram',
      icon: Send,
      label: 'Telegram',
      className: 'bg-[#0088cc] hover:bg-[#007AB8] text-white',
      onClick: () => handleShare('telegram'),
    },
    {
      id: 'facebook',
      icon: Facebook,
      label: 'Facebook',
      className: 'bg-[#1877F2] hover:bg-[#166FE5] text-white',
      onClick: () => handleShare('facebook'),
    },
    {
      id: 'twitter',
      icon: Twitter,
      label: 'Twitter',
      className: 'bg-[#1DA1F2] hover:bg-[#1A94DA] text-white',
      onClick: () => handleShare('twitter'),
    },
    {
      id: 'copy',
      icon: copied ? Check : Link2,
      label: copied ? 'कॉपी हो गया' : 'लिंक कॉपी करें',
      className: 'bg-muted hover:bg-muted/80 text-foreground',
      onClick: handleCopyLink,
    },
  ];
  
  if (variant === 'floating') {
    return (
      <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-2">
        {typeof navigator !== 'undefined' && navigator.share && (
          <Button
            size="icon"
            className="rounded-full h-12 w-12 bg-primary hover:bg-primary/90 shadow-lg"
            onClick={handleNativeShare}
          >
            <Share2 size={20} />
          </Button>
        )}
        {buttons.slice(0, 4).map((btn) => (
          <Button
            key={btn.id}
            size="icon"
            className={`rounded-full h-10 w-10 shadow-md ${btn.className}`}
            onClick={btn.onClick}
          >
            <btn.icon size={18} />
          </Button>
        ))}
      </div>
    );
  }
  
  if (variant === 'vertical') {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-muted-foreground mb-1">शेयर करें</p>
        {buttons.map((btn) => (
          <Button
            key={btn.id}
            variant="outline"
            size="sm"
            className={`justify-start gap-2 ${btn.id !== 'copy' ? btn.className : ''}`}
            onClick={btn.onClick}
          >
            <btn.icon size={16} />
            {btn.label}
          </Button>
        ))}
      </div>
    );
  }
  
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground mr-2">शेयर करें:</span>
      {buttons.map((btn) => (
        <Button
          key={btn.id}
          size={showLabels ? 'sm' : 'icon'}
          className={`${btn.className} ${showLabels ? 'gap-2' : ''}`}
          onClick={btn.onClick}
        >
          <btn.icon size={showLabels ? 16 : 18} />
          {showLabels && btn.label}
        </Button>
      ))}
    </div>
  );
};

export default ShareButtons;
