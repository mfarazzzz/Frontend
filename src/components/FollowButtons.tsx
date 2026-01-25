import { Button } from '@/components/ui/button';
import { 
  MessageCircle, Send, Facebook, Twitter, Youtube, Instagram 
} from 'lucide-react';

interface FollowButtonsProps {
  variant?: 'horizontal' | 'vertical' | 'compact';
  showLabels?: boolean;
  whatsappChannel?: string;
  telegramChannel?: string;
  facebookPage?: string;
  twitterHandle?: string;
  youtubeChannel?: string;
  instagramHandle?: string;
}

const FollowButtons = ({
  variant = 'horizontal',
  showLabels = true,
  whatsappChannel = 'https://whatsapp.com/channel/0029Vb7TEPsLI8Yg4gbsqe3O',
  telegramChannel = 'https://t.me/rampurnewsofficial',
  facebookPage = 'https://www.facebook.com/profile.php?id=61586930678729',
  twitterHandle = 'https://twitter.com/rampurnews',
  youtubeChannel = 'https://www.youtube.com/@rampurnewsdotcom',
  instagramHandle = 'https://instagram.com/rampurnews',
}: FollowButtonsProps) => {
  
  const socialLinks = [
    {
      id: 'whatsapp',
      icon: MessageCircle,
      label: 'WhatsApp',
      labelHindi: 'व्हाट्सएप',
      url: whatsappChannel,
      className: 'bg-[#25D366] hover:bg-[#20BD5A] text-white',
      priority: true,
    },
    {
      id: 'telegram',
      icon: Send,
      label: 'Telegram',
      labelHindi: 'टेलीग्राम',
      url: telegramChannel,
      className: 'bg-[#0088cc] hover:bg-[#007AB8] text-white',
      priority: true,
    },
    {
      id: 'facebook',
      icon: Facebook,
      label: 'Facebook',
      labelHindi: 'फेसबुक',
      url: facebookPage,
      className: 'bg-[#1877F2] hover:bg-[#166FE5] text-white',
    },
    {
      id: 'twitter',
      icon: Twitter,
      label: 'Twitter',
      labelHindi: 'ट्विटर',
      url: twitterHandle,
      className: 'bg-[#1DA1F2] hover:bg-[#1A94DA] text-white',
    },
    {
      id: 'youtube',
      icon: Youtube,
      label: 'YouTube',
      labelHindi: 'यूट्यूब',
      url: youtubeChannel,
      className: 'bg-[#FF0000] hover:bg-[#CC0000] text-white',
    },
    {
      id: 'instagram',
      icon: Instagram,
      label: 'Instagram',
      labelHindi: 'इंस्टाग्राम',
      url: instagramHandle,
      className: 'bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-90 text-white',
    },
  ];
  
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2">
        {socialLinks.filter(s => s.priority).map((social) => (
          <a
            key={social.id}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="sm" className={`gap-2 ${social.className}`}>
              <social.icon size={16} />
              {social.labelHindi} से जुड़ें
            </Button>
          </a>
        ))}
      </div>
    );
  }
  
  if (variant === 'vertical') {
    return (
      <div className="space-y-3">
        <p className="text-sm font-semibold">हमसे जुड़ें</p>
        <div className="flex flex-col gap-2">
          {socialLinks.map((social) => (
            <a
              key={social.id}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button 
                variant="outline" 
                size="sm" 
                className={`w-full justify-start gap-2 ${social.className}`}
              >
                <social.icon size={16} />
                {social.labelHindi} पर फॉलो करें
              </Button>
            </a>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {showLabels && (
        <p className="text-sm font-semibold">हमसे जुड़ें</p>
      )}
      <div className="flex flex-wrap gap-2">
        {socialLinks.map((social) => (
          <a
            key={social.id}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button 
              size={showLabels ? 'sm' : 'icon'}
              className={`${social.className} ${showLabels ? 'gap-2' : ''}`}
            >
              <social.icon size={showLabels ? 16 : 18} />
              {showLabels && social.labelHindi}
            </Button>
          </a>
        ))}
      </div>
    </div>
  );
};

export default FollowButtons;
