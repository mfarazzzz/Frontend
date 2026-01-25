"use client";
import { useState } from 'react';
import { useAuthors, useCreateAuthor, useUpdateAuthor, useDeleteAuthor, useCMSSettings } from '@/hooks/useCMS';
import { getCMSConfig } from '@/services/cms';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import type { CMSAuthor } from '@/services/cms';

const AuthorsManager = () => {
  const cmsConfig = getCMSConfig();
  const isStrapiProvider = cmsConfig.provider === 'strapi';
  const { data: authors, isLoading } = useAuthors();
  const createAuthor = useCreateAuthor();
  const updateAuthor = useUpdateAuthor();
  const deleteAuthor = useDeleteAuthor();
  const { data: settings } = useCMSSettings();

  const getDefaultRole = (): CMSAuthor['role'] => {
    return (settings?.defaultAuthorRole as CMSAuthor['role']) || 'author';
  };

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<CMSAuthor | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    nameHindi: '',
    email: '',
    avatar: '',
    bio: '',
    role: 'author' as CMSAuthor['role'],
  });

  const resetForm = () => {
    setFormData({
      name: '',
      nameHindi: '',
      email: '',
      avatar: '',
      bio: '',
      role: getDefaultRole(),
    });
    setEditingAuthor(null);
  };

  const handleOpenDialog = (author?: CMSAuthor) => {
    if (author) {
      setEditingAuthor(author);
      setFormData({
        name: author.name,
        nameHindi: author.nameHindi,
        email: author.email,
        avatar: author.avatar || '',
        bio: author.bio || '',
        role: author.role,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleSubmit = async () => {
    if (isStrapiProvider) {
      toast.error('Strapi में लेखक प्रोफाइल "Users" से मैनेज होती है।');
      return;
    }
    if (!formData.nameHindi || !formData.email) {
      toast.error('नाम और ईमेल आवश्यक हैं');
      return;
    }

    try {
      if (editingAuthor) {
        await updateAuthor.mutateAsync({
          id: editingAuthor.id,
          updates: formData,
        });
        toast.success('लेखक अपडेट किया गया');
      } else {
        await createAuthor.mutateAsync(formData as Omit<CMSAuthor, 'id'>);
        toast.success('लेखक बनाया गया');
      }
      handleCloseDialog();
    } catch (error) {
      toast.error('सहेजने में त्रुटि');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (isStrapiProvider) {
      toast.error('Strapi में लेखक प्रोफाइल "Users" से मैनेज होती है।');
      return;
    }
    if (confirm(`क्या आप "${name}" को हटाना चाहते हैं?`)) {
      try {
        await deleteAuthor.mutateAsync(id);
        toast.success('लेखक हटाया गया');
      } catch (error) {
        toast.error('हटाने में त्रुटि');
      }
    }
  };

  const getRoleBadge = (role: CMSAuthor['role']) => {
    const variants: Record<CMSAuthor['role'], { label: string; className: string }> = {
      admin: { label: 'एडमिन', className: 'bg-red-500' },
      editor: { label: 'संपादक', className: 'bg-blue-500' },
      author: { label: 'लेखक', className: 'bg-green-500' },
      contributor: { label: 'योगदानकर्ता', className: 'bg-gray-500' },
    };
    const { label, className } = variants[role];
    return <Badge className={className}>{label}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">लेखक</h1>
          <p className="text-muted-foreground">
            {isStrapiProvider
              ? 'Strapi में लेखक प्रोफाइल "Users" पेज से बनती/लिंक होती है।'
              : 'टीम के सदस्यों का प्रबंधन करें'}
          </p>
        </div>
        {!isStrapiProvider && (
          <Button onClick={() => handleOpenDialog()} className="gap-2">
            <Plus className="w-4 h-4" />
            नया लेखक
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-8">लोड हो रहा है...</div>
      ) : authors?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">कोई लेखक नहीं</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {authors?.map((author) => (
            <Card key={author.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={author.avatar} alt={author.nameHindi} />
                    <AvatarFallback>
                      {author.nameHindi.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium truncate">{author.nameHindi}</p>
                        <p className="text-sm text-muted-foreground truncate">{author.name}</p>
                      </div>
                      {getRoleBadge(author.role)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {author.email}
                    </p>
                    {author.bio && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {author.bio}
                      </p>
                    )}
                    {!isStrapiProvider && (
                      <div className="flex gap-2 mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(author)}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          संपादित
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(author.id, author.nameHindi)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          हटाएं
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAuthor ? 'लेखक संपादित करें' : 'नया लेखक'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nameHindi">हिंदी नाम *</Label>
                <Input
                  id="nameHindi"
                  value={formData.nameHindi}
                  onChange={(e) => setFormData(prev => ({ ...prev, nameHindi: e.target.value }))}
                  placeholder="राकेश शर्मा"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">English Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Rakesh Sharma"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">ईमेल *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="author@rampurnews.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="avatar">अवतार URL</Label>
              <Input
                id="avatar"
                value={formData.avatar}
                onChange={(e) => setFormData(prev => ({ ...prev, avatar: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">भूमिका</Label>
              <Select
                value={formData.role}
                onValueChange={(v) => setFormData(prev => ({ ...prev, role: v as CMSAuthor['role'] }))}
              >
                <SelectTrigger>
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
            <div className="space-y-2">
              <Label htmlFor="bio">परिचय</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="लेखक का संक्षिप्त परिचय"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              रद्द करें
            </Button>
            <Button onClick={handleSubmit}>
              {editingAuthor ? 'अपडेट करें' : 'बनाएं'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuthorsManager;
