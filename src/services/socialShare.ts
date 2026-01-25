// Social Share Service - For sharing content to social media
// Note: Full automation requires backend APIs (WhatsApp Business API, Telegram Bot API, Facebook Graph API)

export interface ShareContent {
  title: string;
  titleHindi: string;
  description?: string;
  descriptionHindi?: string;
  url: string;
  image?: string;
  hashtags?: string[];
}

export interface ShareResult {
  platform: string;
  success: boolean;
  shareUrl?: string;
  error?: string;
}

// Generate formatted content for each platform
export const formatForWhatsApp = (content: ShareContent): string => {
  const title = content.titleHindi || content.title;
  const desc = content.descriptionHindi || content.description || '';
  const hashtags = content.hashtags?.map(t => `#${t}`).join(' ') || '';
  
  return `🔴 *${title}*

${desc}

${hashtags}

📰 पूरी खबर पढ़ें: ${content.url}

🔔 हमारे चैनल से जुड़ें: https://whatsapp.com/channel/0029Vb7TEPsLI8Yg4gbsqe3O`;
};

export const formatForTelegram = (content: ShareContent): string => {
  const title = content.titleHindi || content.title;
  const desc = content.descriptionHindi || content.description || '';
  const hashtags = content.hashtags?.map(t => `#${t}`).join(' ') || '';
  
  return `🔴 <b>${title}</b>

${desc}

${hashtags}

📰 <a href="${content.url}">पूरी खबर पढ़ें</a>

🔔 https://t.me/rampurnewsofficial से जुड़ें`;
};

export const formatForFacebook = (content: ShareContent): string => {
  const title = content.titleHindi || content.title;
  const desc = content.descriptionHindi || content.description || '';
  
  return `${title}

${desc}

#रामपुरन्यूज़ #RampurNews`;
};

export const formatForTwitter = (content: ShareContent): string => {
  const title = content.titleHindi || content.title;
  const hashtags = content.hashtags?.slice(0, 3).map(t => `#${t}`).join(' ') || '#रामपुर';
  
  // Twitter has 280 char limit
  const maxTitleLength = 200;
  const truncatedTitle = title.length > maxTitleLength 
    ? title.slice(0, maxTitleLength) + '...' 
    : title;
  
  return `${truncatedTitle}

${hashtags}

${content.url}`;
};

// Generate share URLs for manual sharing
export const generateShareUrls = (content: ShareContent): Record<string, string> => {
  const encodedUrl = encodeURIComponent(content.url);
  const encodedText = encodeURIComponent(formatForWhatsApp(content));
  const twitterText = encodeURIComponent(formatForTwitter(content));
  
  return {
    whatsapp: `https://wa.me/?text=${encodedText}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(content.titleHindi || content.title)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${twitterText}`,
  };
};

// Copy formatted content to clipboard
export const copyShareContent = async (content: ShareContent, platform: 'whatsapp' | 'telegram' | 'facebook' | 'twitter'): Promise<boolean> => {
  let formattedContent: string;
  
  switch (platform) {
    case 'whatsapp':
      formattedContent = formatForWhatsApp(content);
      break;
    case 'telegram':
      formattedContent = formatForTelegram(content);
      break;
    case 'facebook':
      formattedContent = formatForFacebook(content);
      break;
    case 'twitter':
      formattedContent = formatForTwitter(content);
      break;
  }
  
  try {
    await navigator.clipboard.writeText(formattedContent);
    return true;
  } catch {
    return false;
  }
};

// Simulate auto-share (In production, this would call backend APIs)
export const autoShare = async (
  content: ShareContent,
  platforms: { whatsapp?: boolean; telegram?: boolean; facebook?: boolean; twitter?: boolean }
): Promise<ShareResult[]> => {
  const results: ShareResult[] = [];
  const shareUrls = generateShareUrls(content);
  
  // In a real implementation, this would:
  // 1. Call WhatsApp Business API to post to channel
  // 2. Call Telegram Bot API to post to channel
  // 3. Call Facebook Graph API to post to page
  // 4. Call Twitter API to post tweet
  
  // For now, we return the share URLs for manual sharing
  if (platforms.whatsapp) {
    results.push({
      platform: 'whatsapp',
      success: true,
      shareUrl: shareUrls.whatsapp,
    });
  }
  
  if (platforms.telegram) {
    results.push({
      platform: 'telegram',
      success: true,
      shareUrl: shareUrls.telegram,
    });
  }
  
  if (platforms.facebook) {
    results.push({
      platform: 'facebook',
      success: true,
      shareUrl: shareUrls.facebook,
    });
  }
  
  if (platforms.twitter) {
    results.push({
      platform: 'twitter',
      success: true,
      shareUrl: shareUrls.twitter,
    });
  }
  
  return results;
};

// Generate UTM tracking URLs
export const addUtmParams = (url: string, source: string, medium: string = 'social', campaign: string = 'auto-share'): string => {
  const urlObj = new URL(url, window.location.origin);
  urlObj.searchParams.set('utm_source', source);
  urlObj.searchParams.set('utm_medium', medium);
  urlObj.searchParams.set('utm_campaign', campaign);
  return urlObj.toString();
};
