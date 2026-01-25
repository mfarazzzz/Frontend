import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ImageUploader from './ImageUploader';
import { toast } from 'sonner';

interface ContentEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: string;
  data: Record<string, any> | null;
  onSave: (data: Record<string, any>) => Promise<void>;
}

const ContentEditDialog = ({ 
  open, 
  onOpenChange, 
  type, 
  data, 
  onSave 
}: ContentEditDialogProps) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  
  useEffect(() => {
    if (data) {
      setFormData({ ...data });
    } else {
      setFormData({});
    }
    setActiveTab('basic');
  }, [data, open]);
  
  const updateField = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSave(formData);
      toast.success('सफलतापूर्वक अपडेट किया गया');
      onOpenChange(false);
    } catch {
      toast.error('त्रुटि हुई');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderFormFields = () => {
    switch (type) {
      case 'exams':
        return (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="basic">मूल जानकारी</TabsTrigger>
              <TabsTrigger value="details">विवरण</TabsTrigger>
              <TabsTrigger value="settings">सेटिंग्स</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>शीर्षक (हिंदी) *</Label>
                  <Input 
                    value={formData.titleHindi || ''} 
                    onChange={(e) => updateField('titleHindi', e.target.value)} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Title (English) *</Label>
                  <Input 
                    value={formData.title || ''} 
                    onChange={(e) => updateField('title', e.target.value)} 
                    required 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>परीक्षा तारीख</Label>
                  <Input 
                    type="date"
                    value={formData.examDate?.split('T')[0] || ''} 
                    onChange={(e) => updateField('examDate', e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>श्रेणी</Label>
                  <Select value={formData.category || ''} onValueChange={(v) => updateField('category', v)}>
                    <SelectTrigger><SelectValue placeholder="चुनें" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="board">बोर्ड</SelectItem>
                      <SelectItem value="entrance">प्रवेश</SelectItem>
                      <SelectItem value="government">सरकारी</SelectItem>
                      <SelectItem value="university">विश्वविद्यालय</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>संस्था (हिंदी)</Label>
                  <Input 
                    value={formData.organizationHindi || ''} 
                    onChange={(e) => updateField('organizationHindi', e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Organization</Label>
                  <Input 
                    value={formData.organization || ''} 
                    onChange={(e) => updateField('organization', e.target.value)} 
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="details" className="space-y-4">
              <div className="space-y-2">
                <Label>विवरण (हिंदी)</Label>
                <Textarea 
                  value={formData.descriptionHindi || ''} 
                  onChange={(e) => updateField('descriptionHindi', e.target.value)}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  value={formData.description || ''} 
                  onChange={(e) => updateField('description', e.target.value)}
                  rows={4}
                />
              </div>
              <ImageUploader
                value={formData.image}
                onChange={(v) => updateField('image', v)}
                label="इमेज"
              />
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-4">
              <div className="space-y-2">
                <Label>स्थिति</Label>
                <Select value={formData.status || 'upcoming'} onValueChange={(v) => updateField('status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">आगामी</SelectItem>
                    <SelectItem value="ongoing">चल रहा है</SelectItem>
                    <SelectItem value="completed">पूर्ण</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>फीचर्ड</Label>
                  <p className="text-sm text-muted-foreground">होम पेज पर दिखाएं</p>
                </div>
                <Switch 
                  checked={formData.isFeatured || false}
                  onCheckedChange={(v) => updateField('isFeatured', v)}
                />
              </div>
            </TabsContent>
          </Tabs>
        );

      case 'restaurants':
        return (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="basic">मूल जानकारी</TabsTrigger>
              <TabsTrigger value="details">विवरण</TabsTrigger>
              <TabsTrigger value="media">मीडिया</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>नाम (हिंदी) *</Label>
                  <Input 
                    value={formData.nameHindi || ''} 
                    onChange={(e) => updateField('nameHindi', e.target.value)} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Name (English) *</Label>
                  <Input 
                    value={formData.name || ''} 
                    onChange={(e) => updateField('name', e.target.value)} 
                    required 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>प्रकार</Label>
                  <Select value={formData.type || ''} onValueChange={(v) => updateField('type', v)}>
                    <SelectTrigger><SelectValue placeholder="चुनें" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="restaurant">रेस्तरां</SelectItem>
                      <SelectItem value="dhaba">ढाबा</SelectItem>
                      <SelectItem value="sweet-shop">मिठाई</SelectItem>
                      <SelectItem value="cafe">कैफे</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>बजट</Label>
                  <Select value={formData.priceRange || ''} onValueChange={(v) => updateField('priceRange', v)}>
                    <SelectTrigger><SelectValue placeholder="चुनें" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="budget">सस्ता</SelectItem>
                      <SelectItem value="moderate">मध्यम</SelectItem>
                      <SelectItem value="expensive">महंगा</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>व्यंजन (कॉमा से अलग)</Label>
                <Input 
                  value={Array.isArray(formData.cuisine) ? formData.cuisine.join(', ') : formData.cuisine || ''} 
                  onChange={(e) => updateField('cuisine', e.target.value.split(',').map(s => s.trim()))} 
                />
              </div>
            </TabsContent>
            
            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>पता (हिंदी)</Label>
                  <Input 
                    value={formData.addressHindi || ''} 
                    onChange={(e) => updateField('addressHindi', e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input 
                    value={formData.address || ''} 
                    onChange={(e) => updateField('address', e.target.value)} 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>फोन</Label>
                  <Input 
                    value={formData.phone || ''} 
                    onChange={(e) => updateField('phone', e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>रेटिंग</Label>
                  <Input 
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={formData.rating || ''} 
                    onChange={(e) => updateField('rating', parseFloat(e.target.value))} 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>समय</Label>
                <Input 
                  value={formData.timings || ''} 
                  onChange={(e) => updateField('timings', e.target.value)} 
                  placeholder="सुबह 10 - रात 11"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>फीचर्ड</Label>
                  <p className="text-sm text-muted-foreground">होम पेज पर दिखाएं</p>
                </div>
                <Switch 
                  checked={formData.isFeatured || false}
                  onCheckedChange={(v) => updateField('isFeatured', v)}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="media" className="space-y-4">
              <ImageUploader
                value={formData.image}
                onChange={(v) => updateField('image', v)}
                label="मुख्य इमेज"
              />
              <ImageUploader
                value={formData.gallery}
                onChange={(v) => updateField('gallery', v)}
                label="गैलरी इमेज"
                multiple
                maxImages={10}
              />
            </TabsContent>
          </Tabs>
        );

      case 'fashion':
        return (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="basic">मूल जानकारी</TabsTrigger>
              <TabsTrigger value="details">विवरण</TabsTrigger>
              <TabsTrigger value="media">मीडिया</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>नाम (हिंदी) *</Label>
                  <Input 
                    value={formData.nameHindi || ''} 
                    onChange={(e) => updateField('nameHindi', e.target.value)} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Name (English) *</Label>
                  <Input 
                    value={formData.name || ''} 
                    onChange={(e) => updateField('name', e.target.value)} 
                    required 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>प्रकार</Label>
                  <Select value={formData.type || ''} onValueChange={(v) => updateField('type', v)}>
                    <SelectTrigger><SelectValue placeholder="चुनें" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="boutique">बुटीक</SelectItem>
                      <SelectItem value="showroom">शोरूम</SelectItem>
                      <SelectItem value="tailor">दर्जी</SelectItem>
                      <SelectItem value="brand-store">ब्रांड स्टोर</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>श्रेणी</Label>
                  <Select value={formData.category || ''} onValueChange={(v) => updateField('category', v)}>
                    <SelectTrigger><SelectValue placeholder="चुनें" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="men">पुरुष</SelectItem>
                      <SelectItem value="women">महिला</SelectItem>
                      <SelectItem value="kids">बच्चे</SelectItem>
                      <SelectItem value="all">सभी</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>ब्रांड्स (कॉमा से अलग)</Label>
                <Input 
                  value={Array.isArray(formData.brands) ? formData.brands.join(', ') : formData.brands || ''} 
                  onChange={(e) => updateField('brands', e.target.value.split(',').map(s => s.trim()))} 
                />
              </div>
            </TabsContent>
            
            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>पता (हिंदी)</Label>
                  <Input 
                    value={formData.addressHindi || ''} 
                    onChange={(e) => updateField('addressHindi', e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input 
                    value={formData.address || ''} 
                    onChange={(e) => updateField('address', e.target.value)} 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>फोन</Label>
                  <Input 
                    value={formData.phone || ''} 
                    onChange={(e) => updateField('phone', e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>रेटिंग</Label>
                  <Input 
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={formData.rating || ''} 
                    onChange={(e) => updateField('rating', parseFloat(e.target.value))} 
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>फीचर्ड</Label>
                  <p className="text-sm text-muted-foreground">होम पेज पर दिखाएं</p>
                </div>
                <Switch 
                  checked={formData.isFeatured || false}
                  onCheckedChange={(v) => updateField('isFeatured', v)}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="media" className="space-y-4">
              <ImageUploader
                value={formData.image}
                onChange={(v) => updateField('image', v)}
                label="मुख्य इमेज"
              />
              <ImageUploader
                value={formData.gallery}
                onChange={(v) => updateField('gallery', v)}
                label="गैलरी इमेज"
                multiple
                maxImages={10}
              />
            </TabsContent>
          </Tabs>
        );

      case 'shopping':
        return (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="basic">मूल जानकारी</TabsTrigger>
              <TabsTrigger value="details">विवरण</TabsTrigger>
              <TabsTrigger value="media">मीडिया</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>नाम (हिंदी) *</Label>
                  <Input 
                    value={formData.nameHindi || ''} 
                    onChange={(e) => updateField('nameHindi', e.target.value)} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Name (English) *</Label>
                  <Input 
                    value={formData.name || ''} 
                    onChange={(e) => updateField('name', e.target.value)} 
                    required 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>प्रकार</Label>
                  <Select value={formData.type || ''} onValueChange={(v) => updateField('type', v)}>
                    <SelectTrigger><SelectValue placeholder="चुनें" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mall">मॉल</SelectItem>
                      <SelectItem value="market">बाज़ार</SelectItem>
                      <SelectItem value="complex">कॉम्प्लेक्स</SelectItem>
                      <SelectItem value="plaza">प्लाज़ा</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>दुकानों की संख्या</Label>
                  <Input 
                    type="number"
                    value={formData.storeCount || ''} 
                    onChange={(e) => updateField('storeCount', parseInt(e.target.value))} 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>दुकानें (कॉमा से अलग)</Label>
                <Input 
                  value={Array.isArray(formData.stores) ? formData.stores.join(', ') : formData.stores || ''} 
                  onChange={(e) => updateField('stores', e.target.value.split(',').map(s => s.trim()))} 
                />
              </div>
            </TabsContent>
            
            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>पता (हिंदी)</Label>
                  <Input 
                    value={formData.addressHindi || ''} 
                    onChange={(e) => updateField('addressHindi', e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input 
                    value={formData.address || ''} 
                    onChange={(e) => updateField('address', e.target.value)} 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>फोन</Label>
                  <Input 
                    value={formData.phone || ''} 
                    onChange={(e) => updateField('phone', e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>रेटिंग</Label>
                  <Input 
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={formData.rating || ''} 
                    onChange={(e) => updateField('rating', parseFloat(e.target.value))} 
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>फीचर्ड</Label>
                  <p className="text-sm text-muted-foreground">होम पेज पर दिखाएं</p>
                </div>
                <Switch 
                  checked={formData.isFeatured || false}
                  onCheckedChange={(v) => updateField('isFeatured', v)}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="media" className="space-y-4">
              <ImageUploader
                value={formData.image}
                onChange={(v) => updateField('image', v)}
                label="मुख्य इमेज"
              />
              <ImageUploader
                value={formData.gallery}
                onChange={(v) => updateField('gallery', v)}
                label="गैलरी इमेज"
                multiple
                maxImages={10}
              />
            </TabsContent>
          </Tabs>
        );

      case 'places':
        return (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="basic">मूल जानकारी</TabsTrigger>
              <TabsTrigger value="details">विवरण</TabsTrigger>
              <TabsTrigger value="media">मीडिया</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>नाम (हिंदी) *</Label>
                  <Input 
                    value={formData.nameHindi || ''} 
                    onChange={(e) => updateField('nameHindi', e.target.value)} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Name (English) *</Label>
                  <Input 
                    value={formData.name || ''} 
                    onChange={(e) => updateField('name', e.target.value)} 
                    required 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>प्रकार</Label>
                  <Select value={formData.type || ''} onValueChange={(v) => updateField('type', v)}>
                    <SelectTrigger><SelectValue placeholder="चुनें" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="historical">ऐतिहासिक</SelectItem>
                      <SelectItem value="religious">धार्मिक</SelectItem>
                      <SelectItem value="natural">प्राकृतिक</SelectItem>
                      <SelectItem value="recreational">मनोरंजन</SelectItem>
                      <SelectItem value="cultural">सांस्कृतिक</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>प्रवेश शुल्क</Label>
                  <Input 
                    value={formData.entryFee || ''} 
                    onChange={(e) => updateField('entryFee', e.target.value)} 
                    placeholder="निःशुल्क या ₹50"
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>पता (हिंदी)</Label>
                  <Input 
                    value={formData.addressHindi || ''} 
                    onChange={(e) => updateField('addressHindi', e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input 
                    value={formData.address || ''} 
                    onChange={(e) => updateField('address', e.target.value)} 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>समय</Label>
                  <Input 
                    value={formData.timings || ''} 
                    onChange={(e) => updateField('timings', e.target.value)} 
                    placeholder="सुबह 6 - शाम 8"
                  />
                </div>
                <div className="space-y-2">
                  <Label>रेटिंग</Label>
                  <Input 
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={formData.rating || ''} 
                    onChange={(e) => updateField('rating', parseFloat(e.target.value))} 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>विवरण (हिंदी)</Label>
                <Textarea 
                  value={formData.descriptionHindi || ''} 
                  onChange={(e) => updateField('descriptionHindi', e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  value={formData.description || ''} 
                  onChange={(e) => updateField('description', e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>फीचर्ड</Label>
                  <p className="text-sm text-muted-foreground">होम पेज पर दिखाएं</p>
                </div>
                <Switch 
                  checked={formData.isFeatured || false}
                  onCheckedChange={(v) => updateField('isFeatured', v)}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="media" className="space-y-4">
              <ImageUploader
                value={formData.image}
                onChange={(v) => updateField('image', v)}
                label="मुख्य इमेज"
              />
              <ImageUploader
                value={formData.gallery}
                onChange={(v) => updateField('gallery', v)}
                label="गैलरी इमेज"
                multiple
                maxImages={10}
              />
            </TabsContent>
          </Tabs>
        );

      case 'events':
        return (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="basic">मूल जानकारी</TabsTrigger>
              <TabsTrigger value="details">विवरण</TabsTrigger>
              <TabsTrigger value="media">मीडिया</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>शीर्षक (हिंदी) *</Label>
                  <Input 
                    value={formData.titleHindi || ''} 
                    onChange={(e) => updateField('titleHindi', e.target.value)} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Title (English) *</Label>
                  <Input 
                    value={formData.title || ''} 
                    onChange={(e) => updateField('title', e.target.value)} 
                    required 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>तारीख</Label>
                  <Input 
                    type="date"
                    value={formData.date?.split('T')[0] || ''} 
                    onChange={(e) => updateField('date', e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>श्रेणी</Label>
                  <Select value={formData.category || ''} onValueChange={(v) => updateField('category', v)}>
                    <SelectTrigger><SelectValue placeholder="चुनें" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cultural">सांस्कृतिक</SelectItem>
                      <SelectItem value="religious">धार्मिक</SelectItem>
                      <SelectItem value="sports">खेल</SelectItem>
                      <SelectItem value="educational">शैक्षिक</SelectItem>
                      <SelectItem value="entertainment">मनोरंजन</SelectItem>
                      <SelectItem value="food">खाना</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>स्थिति</Label>
                <Select value={formData.status || 'upcoming'} onValueChange={(v) => updateField('status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">आगामी</SelectItem>
                    <SelectItem value="ongoing">चल रहा है</SelectItem>
                    <SelectItem value="completed">पूर्ण</SelectItem>
                    <SelectItem value="cancelled">रद्द</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
            
            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>स्थान (हिंदी)</Label>
                  <Input 
                    value={formData.venueHindi || ''} 
                    onChange={(e) => updateField('venueHindi', e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Venue</Label>
                  <Input 
                    value={formData.venue || ''} 
                    onChange={(e) => updateField('venue', e.target.value)} 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>शहर</Label>
                  <Input 
                    value={formData.city || ''} 
                    onChange={(e) => updateField('city', e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>पता</Label>
                  <Input 
                    value={formData.address || ''} 
                    onChange={(e) => updateField('address', e.target.value)} 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>विवरण (हिंदी)</Label>
                <Textarea 
                  value={formData.descriptionHindi || ''} 
                  onChange={(e) => updateField('descriptionHindi', e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  value={formData.description || ''} 
                  onChange={(e) => updateField('description', e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>फीचर्ड</Label>
                  <p className="text-sm text-muted-foreground">होम पेज पर दिखाएं</p>
                </div>
                <Switch 
                  checked={formData.isFeatured || false}
                  onCheckedChange={(v) => updateField('isFeatured', v)}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="media" className="space-y-4">
              <ImageUploader
                value={formData.image}
                onChange={(v) => updateField('image', v)}
                label="इमेज"
              />
            </TabsContent>
          </Tabs>
        );

      case 'holidays':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>नाम (हिंदी) *</Label>
                <Input 
                  value={formData.nameHindi || ''} 
                  onChange={(e) => updateField('nameHindi', e.target.value)} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label>Name (English) *</Label>
                <Input 
                  value={formData.name || ''} 
                  onChange={(e) => updateField('name', e.target.value)} 
                  required 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>तारीख</Label>
                <Input 
                  type="date"
                  value={formData.date?.split('T')[0] || ''} 
                  onChange={(e) => updateField('date', e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label>प्रकार</Label>
                <Select value={formData.type || ''} onValueChange={(v) => updateField('type', v)}>
                  <SelectTrigger><SelectValue placeholder="चुनें" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="national">राष्ट्रीय</SelectItem>
                    <SelectItem value="religious">धार्मिक</SelectItem>
                    <SelectItem value="cultural">सांस्कृतिक</SelectItem>
                    <SelectItem value="bank">बैंक</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>विवरण (हिंदी)</Label>
              <Textarea 
                value={formData.descriptionHindi || ''} 
                onChange={(e) => updateField('descriptionHindi', e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                value={formData.description || ''} 
                onChange={(e) => updateField('description', e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>सार्वजनिक छुट्टी</Label>
                <p className="text-sm text-muted-foreground">सरकारी छुट्टी</p>
              </div>
              <Switch 
                checked={formData.isPublicHoliday || false}
                onCheckedChange={(v) => updateField('isPublicHoliday', v)}
              />
            </div>
            
            <ImageUploader
              value={formData.image}
              onChange={(v) => updateField('image', v)}
              label="इमेज"
            />
          </div>
        );

      case 'institutions':
        return (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="basic">मूल जानकारी</TabsTrigger>
              <TabsTrigger value="details">विवरण</TabsTrigger>
              <TabsTrigger value="media">मीडिया</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>नाम (हिंदी) *</Label>
                  <Input 
                    value={formData.nameHindi || ''} 
                    onChange={(e) => updateField('nameHindi', e.target.value)} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Name (English) *</Label>
                  <Input 
                    value={formData.name || ''} 
                    onChange={(e) => updateField('name', e.target.value)} 
                    required 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>प्रकार</Label>
                  <Select value={formData.type || ''} onValueChange={(v) => updateField('type', v)}>
                    <SelectTrigger><SelectValue placeholder="चुनें" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="school">स्कूल</SelectItem>
                      <SelectItem value="college">कॉलेज</SelectItem>
                      <SelectItem value="university">विश्वविद्यालय</SelectItem>
                      <SelectItem value="coaching">कोचिंग</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>संबद्धता</Label>
                  <Input 
                    value={formData.affiliation || ''} 
                    onChange={(e) => updateField('affiliation', e.target.value)} 
                    placeholder="CBSE, UP Board"
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>पता (हिंदी)</Label>
                  <Input 
                    value={formData.addressHindi || ''} 
                    onChange={(e) => updateField('addressHindi', e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input 
                    value={formData.address || ''} 
                    onChange={(e) => updateField('address', e.target.value)} 
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>शहर</Label>
                  <Input 
                    value={formData.city || ''} 
                    onChange={(e) => updateField('city', e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>जिला</Label>
                  <Input 
                    value={formData.district || ''} 
                    onChange={(e) => updateField('district', e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>पिनकोड</Label>
                  <Input 
                    value={formData.pincode || ''} 
                    onChange={(e) => updateField('pincode', e.target.value)} 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>विवरण (हिंदी)</Label>
                <Textarea 
                  value={formData.descriptionHindi || ''} 
                  onChange={(e) => updateField('descriptionHindi', e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  value={formData.description || ''} 
                  onChange={(e) => updateField('description', e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>फीचर्ड</Label>
                  <p className="text-sm text-muted-foreground">होम पेज पर दिखाएं</p>
                </div>
                <Switch 
                  checked={formData.isFeatured || false}
                  onCheckedChange={(v) => updateField('isFeatured', v)}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="media" className="space-y-4">
              <ImageUploader
                value={formData.image}
                onChange={(v) => updateField('image', v)}
                label="मुख्य इमेज"
              />
              <ImageUploader
                value={formData.gallery}
                onChange={(v) => updateField('gallery', v)}
                label="गैलरी इमेज"
                multiple
                maxImages={10}
              />
            </TabsContent>
          </Tabs>
        );
        
      default:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>नाम/शीर्षक (हिंदी)</Label>
                <Input 
                  value={formData.nameHindi || formData.titleHindi || ''} 
                  onChange={(e) => updateField(formData.titleHindi !== undefined ? 'titleHindi' : 'nameHindi', e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label>Name/Title (English)</Label>
                <Input 
                  value={formData.name || formData.title || ''} 
                  onChange={(e) => updateField(formData.title !== undefined ? 'title' : 'name', e.target.value)} 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>विवरण (हिंदी)</Label>
              <Textarea 
                value={formData.descriptionHindi || ''} 
                onChange={(e) => updateField('descriptionHindi', e.target.value)}
                rows={4}
              />
            </div>
            
            <ImageUploader
              value={formData.image}
              onChange={(v) => updateField('image', v)}
              label="मुख्य इमेज"
            />
            
            <ImageUploader
              value={formData.gallery}
              onChange={(v) => updateField('gallery', v)}
              label="गैलरी इमेज"
              multiple
              maxImages={10}
            />
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch 
                  checked={formData.isFeatured || false}
                  onCheckedChange={(v) => updateField('isFeatured', v)}
                />
                <Label>फीचर्ड</Label>
              </div>
            </div>
          </div>
        );
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {data ? 'एडिट करें' : 'नया जोड़ें'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          {renderFormFields()}
          
          <div className="flex justify-end gap-2 pt-6 mt-6 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              रद्द करें
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'सेव हो रहा है...' : (data ? 'अपडेट करें' : 'जोड़ें')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContentEditDialog;