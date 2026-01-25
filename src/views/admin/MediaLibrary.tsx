"use client";
import { useRef, useState } from 'react';
import { useMedia, useUploadMedia, useDeleteMedia } from '@/hooks/useCMS';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Copy, 
  Check,
  Upload,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { hi } from 'date-fns/locale';

const MediaLibrary = () => {
  const { data: media, isLoading } = useMedia();
  const uploadMedia = useUploadMedia();
  const deleteMedia = useDeleteMedia();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} एक छवि नहीं है`);
          continue;
        }
        await uploadMedia.mutateAsync(file);
      }
      toast.success('छवियाँ अपलोड हुईं');
    } catch (error) {
      toast.error('अपलोड में त्रुटि');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('क्या आप इस छवि को हटाना चाहते हैं?')) {
      try {
        await deleteMedia.mutateAsync(id);
        toast.success('छवि हटाई गई');
      } catch (error) {
        toast.error('हटाने में त्रुटि');
      }
    }
  };

  const copyUrl = async (id: string, url: string) => {
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success('URL कॉपी किया गया');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">मीडिया लाइब्रेरी</h1>
          <p className="text-muted-foreground">छवियों और मीडिया फ़ाइलों का प्रबंधन</p>
        </div>
        <div>
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
          <Button 
            onClick={() => fileInputRef.current?.click()}
            className="gap-2"
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            अपलोड करें
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">लोड हो रहा है...</div>
      ) : media?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">कोई मीडिया नहीं</p>
            <Button 
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              पहली छवि अपलोड करें
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {media?.map((item) => (
            <Card key={item.id} className="overflow-hidden group">
              <div className="aspect-square relative bg-muted">
                <img
                  src={item.url}
                  alt={item.altText}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => copyUrl(item.id, item.url)}
                  >
                    {copiedId === item.id ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-3">
                <p className="text-sm font-medium truncate">{item.title}</p>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{formatFileSize(item.size)}</span>
                  <span>
                    {format(new Date(item.uploadedAt), 'd MMM', { locale: hi })}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaLibrary;
