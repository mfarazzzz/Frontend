"use client";
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCMSSettings, useUpdateSettings } from '@/hooks/useCMS';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Save, Loader2, Globe, Share2, Mail, Database, CheckCircle2, XCircle, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { configureCMS, getCMSConfig } from '@/services/cms';
import type { CMSSettings, CMSProviderType, CMSAuthor } from '@/services/cms';

interface WordPressConfig {
  baseUrl: string;
  authMethod: 'none' | 'jwt' | 'application-password';
  apiKey: string;
  username: string;
  password: string;
}

const STORAGE_KEY_WP_CONFIG = 'wordpress_config';

interface StrapiConfig {
  baseUrl: string;
  apiKey: string;
}

const STORAGE_KEY_STRAPI_CONFIG = 'strapi_config';

const SettingsPage = () => {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useCMSSettings();
  const updateSettings = useUpdateSettings();
  
  const normalizeStrapiBaseUrl = (value: string): string => {
    const trimmed = value.trim().replace(/\/+$/, '');
    if (!trimmed) return trimmed;
    if (trimmed.endsWith('/api')) return trimmed;
    if (/^https?:\/\/[^/]+$/i.test(trimmed)) return `${trimmed}/api`;
    return trimmed;
  };

  const [formData, setFormData] = useState<Partial<CMSSettings>>({
    siteName: '',
    siteNameHindi: '',
    tagline: '',
    logo: '',
    favicon: '',
    socialLinks: {},
    contactEmail: '',
    contactPhone: '',
    address: '',
    defaultAuthorRole: 'author' as CMSAuthor['role'],
  });

  const [isSaving, setIsSaving] = useState(false);
  
  // WordPress configuration state
  const [cmsProvider, setCmsProvider] = useState<CMSProviderType>('mock');
  const [wpConfig, setWpConfig] = useState<WordPressConfig>({
    baseUrl: '',
    authMethod: 'none',
    apiKey: '',
    username: '',
    password: '',
  });
  const [strapiConfig, setStrapiConfig] = useState<StrapiConfig>({
    baseUrl: '',
    apiKey: '',
  });
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [connectionMessage, setConnectionMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
    
    // Load saved WordPress config
    const savedConfig = localStorage.getItem(STORAGE_KEY_WP_CONFIG);
    let hasSavedWordPress = false;
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setWpConfig(parsed);
        hasSavedWordPress = true;
      } catch {
        // Ignore parse errors
      }
    }

    const savedStrapi = localStorage.getItem(STORAGE_KEY_STRAPI_CONFIG);
    let hasSavedStrapi = false;
    if (savedStrapi) {
      try {
        const parsed = JSON.parse(savedStrapi);
        setStrapiConfig(parsed);
        if (parsed.baseUrl) {
          hasSavedStrapi = true;
        }
      } catch {
        // Ignore parse errors
      }
    }
    
    // Check current CMS config
    const currentConfig = getCMSConfig();
    if (currentConfig.provider !== 'mock') {
      setCmsProvider(currentConfig.provider);
      return;
    }

    if (hasSavedStrapi) {
      setCmsProvider('strapi');
      return;
    }

    if (hasSavedWordPress) {
      setCmsProvider('wordpress');
      configureCMS({
        provider: 'wordpress',
        baseUrl: '/api/cms/wordpress',
      });
      queryClient.invalidateQueries();
    }
  }, [queryClient, settings]);

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      await updateSettings.mutateAsync(formData);
      toast.success('सेटिंग्स सहेजी गईं');
    } catch (error) {
      toast.error('सहेजने में त्रुटि');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSocialLink = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value,
      },
    }));
  };

  const testWordPressConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus('idle');
    setConnectionMessage('');

    try {
      const response = await fetch(`/api/cms/wordpress/wp-json/wp/v2/posts?per_page=1`);
      
      if (response.ok) {
        const posts = await response.json();
        setConnectionStatus('success');
        setConnectionMessage(`कनेक्शन सफल! ${posts.length > 0 ? 'पोस्ट मिले।' : 'साइट से जुड़ गए।'}`);
        toast.success('WordPress कनेक्शन सफल!');
      } else if (response.status === 401) {
        setConnectionStatus('error');
        setConnectionMessage('प्रमाणीकरण विफल। कृपया क्रेडेंशियल जांचें।');
        toast.error('प्रमाणीकरण त्रुटि');
      } else {
        setConnectionStatus('error');
        setConnectionMessage(`त्रुटि: ${response.status} ${response.statusText}`);
        toast.error('कनेक्शन विफल');
      }
    } catch (error) {
      setConnectionStatus('error');
      setConnectionMessage('कनेक्ट करने में असमर्थ। WordPress और सर्वर कॉन्फ़िगरेशन जांचें।');
      toast.error('कनेक्शन त्रुटि');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const testStrapiConnection = async () => {
    if (!strapiConfig.baseUrl) {
      toast.error('कृपया Strapi API URL दर्ज करें');
      return;
    }

    setIsTestingConnection(true);
    setConnectionStatus('idle');
    setConnectionMessage('');

    try {
      const baseUrl = normalizeStrapiBaseUrl(strapiConfig.baseUrl);
      const authHeaders: Record<string, string> = strapiConfig.apiKey
        ? { Authorization: `Bearer ${strapiConfig.apiKey}` }
        : {};
      const response = await fetch(`${baseUrl}/articles?limit=1`, {
        headers: authHeaders,
      });

      if (response.ok) {
        const data = await response.json();
        const count = Array.isArray(data?.data) ? data.data.length : Array.isArray(data) ? data.length : 0;
        if (strapiConfig.apiKey) {
          const writeCheckResponse = await fetch(`${baseUrl}/articles`, {
            method: 'POST',
            headers: {
              ...authHeaders,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              data: {
                title: '__permission_check__',
                content: '__permission_check__',
              },
            }),
          });

          if (writeCheckResponse.status === 401 || writeCheckResponse.status === 403) {
            setConnectionStatus('error');
            setConnectionMessage('API Key मान्य है लेकिन लिखने की अनुमति नहीं है। Full access या Custom permissions दें।');
            toast.error('Strapi API Key अनुमति त्रुटि');
            return;
          }
        }

        setConnectionStatus('success');
        setConnectionMessage(
          `कनेक्शन सफल! ${count > 0 ? 'आर्टिकल मिले।' : 'API से जुड़ गए।'}${strapiConfig.apiKey ? ' लिखने की अनुमति भी सही है।' : ''}`,
        );
        toast.success('Strapi कनेक्शन सफल!');
      } else if (response.status === 401) {
        setConnectionStatus('error');
        setConnectionMessage('प्रमाणीकरण विफल। कृपया API Key जांचें।');
        toast.error('प्रमाणीकरण त्रुटि');
      } else {
        setConnectionStatus('error');
        setConnectionMessage(`त्रुटि: ${response.status} ${response.statusText}`);
        toast.error('कनेक्शन विफल');
      }
    } catch {
      setConnectionStatus('error');
      setConnectionMessage('कनेक्ट करने में असमर्थ। URL और CORS सेटिंग जांचें।');
      toast.error('कनेक्शन त्रुटि');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const saveWordPressConfig = () => {
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY_WP_CONFIG, JSON.stringify(wpConfig));
    
    // Configure CMS
    if (cmsProvider === 'wordpress') {
      configureCMS({
        provider: 'wordpress',
        baseUrl: '/api/cms/wordpress',
      });
      queryClient.invalidateQueries();
      toast.success('WordPress कॉन्फ़िगरेशन सहेजा गया');
    } else if (cmsProvider === 'mock') {
      configureCMS({ provider: 'mock' });
      queryClient.invalidateQueries();
      toast.success('Mock प्रदाता पर स्विच किया गया');
    }
  };

  const handleProviderChange = (provider: CMSProviderType) => {
    setCmsProvider(provider);
    if (provider === 'mock') {
      configureCMS({ provider: 'mock' });
      queryClient.invalidateQueries();
      setConnectionStatus('idle');
      setConnectionMessage('');
    }
    if (provider === 'wordpress') {
      configureCMS({
        provider: 'wordpress',
        baseUrl: '/api/cms/wordpress',
      });
      queryClient.invalidateQueries();
      setConnectionStatus('idle');
      setConnectionMessage('');
    }
    if (provider === 'strapi' && strapiConfig.baseUrl) {
      configureCMS({
        provider: 'strapi',
        baseUrl: normalizeStrapiBaseUrl(strapiConfig.baseUrl),
        apiKey: strapiConfig.apiKey || undefined,
      });
      queryClient.invalidateQueries();
      setConnectionStatus('idle');
      setConnectionMessage('');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">सेटिंग्स</h1>
          <p className="text-muted-foreground">साइट कॉन्फ़िगरेशन और वरीयताएँ</p>
        </div>
        <Button onClick={handleSubmit} disabled={isSaving} className="gap-2">
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          सहेजें
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general" className="gap-2">
            <Globe className="w-4 h-4" />
            सामान्य
          </TabsTrigger>
          <TabsTrigger value="social" className="gap-2">
            <Share2 className="w-4 h-4" />
            सोशल मीडिया
          </TabsTrigger>
          <TabsTrigger value="contact" className="gap-2">
            <Mail className="w-4 h-4" />
            संपर्क
          </TabsTrigger>
          <TabsTrigger value="cms" className="gap-2">
            <Database className="w-4 h-4" />
            CMS / WordPress
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>साइट जानकारी</CardTitle>
              <CardDescription>
                आपकी वेबसाइट की मूलभूत जानकारी
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name (English)</Label>
                  <Input
                    id="siteName"
                    value={formData.siteName}
                    onChange={(e) => setFormData(prev => ({ ...prev, siteName: e.target.value }))}
                    placeholder="Rampur News"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteNameHindi">साइट का नाम (हिंदी)</Label>
                  <Input
                    id="siteNameHindi"
                    value={formData.siteNameHindi}
                    onChange={(e) => setFormData(prev => ({ ...prev, siteNameHindi: e.target.value }))}
                    placeholder="रामपुर न्यूज़"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tagline">टैगलाइन</Label>
                <Textarea
                  id="tagline"
                  value={formData.tagline}
                  onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
                  placeholder="रामपुर की सबसे विश्वसनीय हिंदी समाचार वेबसाइट"
                  rows={2}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="logo">लोगो URL</Label>
                  <Input
                    id="logo"
                    value={formData.logo}
                    onChange={(e) => setFormData(prev => ({ ...prev, logo: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="favicon">Favicon URL</Label>
                  <Input
                    id="favicon"
                    value={formData.favicon}
                    onChange={(e) => setFormData(prev => ({ ...prev, favicon: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle>सोशल मीडिया लिंक</CardTitle>
              <CardDescription>
                अपने सोशल मीडिया प्रोफाइल जोड़ें
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    value={formData.socialLinks?.facebook || ''}
                    onChange={(e) => updateSocialLink('facebook', e.target.value)}
                    placeholder="https://facebook.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter / X</Label>
                  <Input
                    id="twitter"
                    value={formData.socialLinks?.twitter || ''}
                    onChange={(e) => updateSocialLink('twitter', e.target.value)}
                    placeholder="https://twitter.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="youtube">YouTube</Label>
                  <Input
                    id="youtube"
                    value={formData.socialLinks?.youtube || ''}
                    onChange={(e) => updateSocialLink('youtube', e.target.value)}
                    placeholder="https://youtube.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={formData.socialLinks?.instagram || ''}
                    onChange={(e) => updateSocialLink('instagram', e.target.value)}
                    placeholder="https://instagram.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    value={formData.socialLinks?.whatsapp || ''}
                    onChange={(e) => updateSocialLink('whatsapp', e.target.value)}
                    placeholder="+91..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>संपर्क जानकारी</CardTitle>
              <CardDescription>
                संपर्क विवरण जो साइट पर दिखाए जाएंगे
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">ईमेल</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                    placeholder="contact@rampurnews.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">फोन</Label>
                  <Input
                    id="contactPhone"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">पता</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="कार्यालय का पता..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                CMS प्रदाता
                <Badge
                  variant={
                    cmsProvider === 'wordpress'
                      ? 'default'
                      : cmsProvider === 'strapi'
                        ? 'default'
                        : 'secondary'
                  }
                >
                  {cmsProvider === 'wordpress'
                    ? 'WordPress'
                    : cmsProvider === 'strapi'
                      ? 'Strapi'
                      : 'Mock (Demo)'}
                </Badge>
              </CardTitle>
              <CardDescription>
                अपना कंटेंट मैनेजमेंट सिस्टम चुनें
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>प्रदाता  प्रकार</Label>
                <Select value={cmsProvider} onValueChange={(v) => handleProviderChange(v as CMSProviderType)}>
                  <SelectTrigger className="w-full md:w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mock">Mock (Demo / Local)</SelectItem>
                    <SelectItem value="wordpress">WordPress REST API</SelectItem>
                    <SelectItem value="strapi">Strapi REST API</SelectItem>
                    <SelectItem value="sanity" disabled>Sanity (जल्द आ रहा है)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {cmsProvider === 'mock' && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Mock मोड में, डेटा ब्राउज़र के localStorage में सहेजा जाता है। 
                    यह केवल डेमो और विकास के लिए है।
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>भूमिकाएँ और अनुमतियाँ</CardTitle>
              <CardDescription>
                नए उपयोगकर्ताओं के लिए डिफ़ॉल्ट भूमिका चुनें
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>नए लेखक की डिफ़ॉल्ट भूमिका</Label>
                <Select
                  value={formData.defaultAuthorRole || 'author'}
                  onValueChange={(v) =>
                    setFormData(prev => ({ ...prev, defaultAuthorRole: v as CMSAuthor['role'] }))
                  }
                >
                  <SelectTrigger className="w-full md:w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">एडमिन</SelectItem>
                    <SelectItem value="editor">संपादक</SelectItem>
                    <SelectItem value="author">लेखक</SelectItem>
                    <SelectItem value="contributor">योगदानकर्ता</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* WordPress Configuration */}
          {cmsProvider === 'wordpress' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 1.5c4.687 0 8.5 3.813 8.5 8.5 0 4.687-3.813 8.5-8.5 8.5-4.687 0-8.5-3.813-8.5-8.5 0-4.687 3.813-8.5 8.5-8.5zM4.5 12c0 1.846.693 3.533 1.828 4.818L10.5 6.182c-3.473.636-6 3.73-6 5.818zm7.5 7.5c-.934 0-1.828-.171-2.654-.478l2.816-8.177 2.883 7.901c.019.046.042.088.065.13A7.465 7.465 0 0112 19.5zm1.273-11.016L16.5 18.545A7.478 7.478 0 0019.5 12c0-1.632-.524-3.143-1.408-4.375l-4.319 10.859z"/>
                  </svg>
                  WordPress कॉन्फ़िगरेशन
                </CardTitle>
                <CardDescription>
                  अपनी WordPress साइट से कनेक्ट करें
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Connection Status */}
                {connectionStatus !== 'idle' && (
                  <div className={`flex items-center gap-2 p-3 rounded-lg ${
                    connectionStatus === 'success' 
                      ? 'bg-green-500/10 text-green-700 dark:text-green-400' 
                      : 'bg-red-500/10 text-red-700 dark:text-red-400'
                  }`}>
                    {connectionStatus === 'success' ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                    <span className="text-sm">{connectionMessage}</span>
                  </div>
                )}

                {/* Site URL */}
                <div className="space-y-2">
                  <Label htmlFor="wpUrl">WordPress साइट URL *</Label>
                  <Input
                    id="wpUrl"
                    value={wpConfig.baseUrl}
                    onChange={(e) => setWpConfig(prev => ({ ...prev, baseUrl: e.target.value }))}
                    placeholder="https://your-wordpress-site.com"
                  />
                  <p className="text-xs text-muted-foreground">
                    आपकी WordPress साइट का मुख्य URL (बिना /wp-json)
                  </p>
                </div>

                {/* Authentication Method */}
                <div className="space-y-2">
                  <Label>प्रमाणीकरण विधि</Label>
                  <Select 
                    value={wpConfig.authMethod} 
                    onValueChange={(v) => setWpConfig(prev => ({ 
                      ...prev, 
                      authMethod: v as WordPressConfig['authMethod'] 
                    }))}
                  >
                    <SelectTrigger className="w-full md:w-64">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">कोई नहीं (सार्वजनिक सामग्री)</SelectItem>
                      <SelectItem value="jwt">JWT Token</SelectItem>
                      <SelectItem value="application-password">Application Password</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* JWT Token */}
                {wpConfig.authMethod === 'jwt' && (
                  <div className="space-y-2">
                    <Label htmlFor="wpApiKey">JWT Token</Label>
                    <div className="relative">
                      <Input
                        id="wpApiKey"
                        type={showPassword ? 'text' : 'password'}
                        value={wpConfig.apiKey}
                        onChange={(e) => setWpConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                        placeholder="eyJhbGciOiJIUzI1NiIs..."
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      JWT Authentication for WP REST API प्लगइन से प्राप्त टोकन
                    </p>
                  </div>
                )}

                {/* Application Password */}
                {wpConfig.authMethod === 'application-password' && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="wpUsername">WordPress Username</Label>
                      <Input
                        id="wpUsername"
                        value={wpConfig.username}
                        onChange={(e) => setWpConfig(prev => ({ ...prev, username: e.target.value }))}
                        placeholder="admin"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="wpPassword">Application Password</Label>
                      <div className="relative">
                        <Input
                          id="wpPassword"
                          type={showPassword ? 'text' : 'password'}
                          value={wpConfig.password}
                          onChange={(e) => setWpConfig(prev => ({ ...prev, password: e.target.value }))}
                          placeholder="xxxx xxxx xxxx xxxx"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground md:col-span-2">
                      WordPress → Users → Profile → Application Passwords से नया पासवर्ड बनाएं
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={testWordPressConnection}
                    disabled={isTestingConnection || !wpConfig.baseUrl}
                    className="gap-2"
                  >
                    {isTestingConnection ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    कनेक्शन जांचें
                  </Button>
                  <Button
                    onClick={saveWordPressConfig}
                    disabled={!wpConfig.baseUrl}
                    className="gap-2"
                  >
                    <Save className="w-4 h-4" />
                    कॉन्फ़िगरेशन सहेजें
                  </Button>
                </div>

                {/* Help Section */}
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <h4 className="font-medium text-sm">सेटअप निर्देश:</h4>
                  <ol className="text-xs text-muted-foreground list-decimal list-inside space-y-1">
                    <li>सुनिश्चित करें कि WordPress REST API सक्षम है (WP 4.7+ में डिफ़ॉल्ट)</li>
                    <li>CORS को सक्षम करें या प्रॉक्सी का उपयोग करें</li>
                    <li>लिखने के ऑपरेशन के लिए प्रमाणीकरण आवश्यक है</li>
                    <li>Featured articles के लिए sticky posts का उपयोग करें</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Strapi Configuration */}
          {cmsProvider === 'strapi' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Strapi कॉन्फ़िगरेशन
                </CardTitle>
                <CardDescription>
                  Strapi API से कनेक्ट करें (हेडलैस CMS मोड)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {connectionStatus !== 'idle' && (
                  <div
                    className={`flex items-center gap-2 p-3 rounded-lg ${
                      connectionStatus === 'success'
                        ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                        : 'bg-red-500/10 text-red-700 dark:text-red-400'
                    }`}
                  >
                    {connectionStatus === 'success' ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                    <span className="text-sm">{connectionMessage}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="strapiUrl">Strapi API URL *</Label>
                  <Input
                    id="strapiUrl"
                    value={strapiConfig.baseUrl}
                    onChange={(e) =>
                      setStrapiConfig((prev) => ({ ...prev, baseUrl: e.target.value }))
                    }
                    placeholder="https://your-strapi-api.com"
                  />
                  <p className="text-xs text-muted-foreground">
                    आपका Strapi API बेस URL (उदा: https://api.example.com)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="strapiApiKey">API Token (optional)</Label>
                  <div className="relative">
                    <Input
                      id="strapiApiKey"
                      type={showPassword ? 'text' : 'password'}
                      value={strapiConfig.apiKey}
                      onChange={(e) =>
                        setStrapiConfig((prev) => ({ ...prev, apiKey: e.target.value }))
                      }
                      placeholder="Strapi API Token"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    यदि आपका Strapi API सुरक्षित है, तो यहाँ Bearer Token जोड़ें
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={testStrapiConnection}
                    disabled={isTestingConnection || !strapiConfig.baseUrl}
                    className="gap-2"
                  >
                    {isTestingConnection ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    कनेक्शन जांचें
                  </Button>
                  <Button
                    onClick={() => {
                      const normalizedBaseUrl = normalizeStrapiBaseUrl(strapiConfig.baseUrl);
                      const nextConfig = { ...strapiConfig, baseUrl: normalizedBaseUrl };
                      localStorage.setItem(STORAGE_KEY_STRAPI_CONFIG, JSON.stringify(nextConfig));
                      if (normalizedBaseUrl) {
                        configureCMS({
                          provider: 'strapi',
                          baseUrl: normalizedBaseUrl,
                          apiKey: strapiConfig.apiKey || undefined,
                        });
                        queryClient.invalidateQueries();
                        toast.success('Strapi कॉन्फ़िगरेशन सहेजा गया');
                      } else {
                        toast.error('कृपया Strapi API URL दर्ज करें');
                      }
                    }}
                    disabled={!strapiConfig.baseUrl}
                    className="gap-2"
                  >
                    <Save className="w-4 h-4" />
                    कॉन्फ़िगरेशन सहेजें
                  </Button>
                </div>

                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <h4 className="font-medium text-sm">API आवश्यकताएँ:</h4>
                  <ol className="text-xs text-muted-foreground list-decimal list-inside space-y-1">
                    <li>/articles, /categories, /authors, /media, /settings जैसे REST endpoints</li>
                    <li>रिस्पॉन्स स्ट्रक्चर CMSArticle/CMSCategory प्रकार से मेल खाता हो</li>
                    <li>यदि टोकन-आधारित सुरक्षा है, तो Bearer Token सक्षम करें</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
