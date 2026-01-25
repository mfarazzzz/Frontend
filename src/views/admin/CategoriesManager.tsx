"use client";
import { useState } from 'react';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/useCMS';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';
import type { CMSCategory } from '@/services/cms';

const CategoriesManager = () => {
  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CMSCategory | null>(null);
  const [formData, setFormData] = useState({
    titleHindi: '',
    titleEnglish: '',
    slug: '',
    description: '',
    path: '',
  });

  const resetForm = () => {
    setFormData({
      titleHindi: '',
      titleEnglish: '',
      slug: '',
      description: '',
      path: '',
    });
    setEditingCategory(null);
  };

  const handleOpenDialog = (category?: CMSCategory) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        titleHindi: category.titleHindi,
        titleEnglish: category.titleEnglish,
        slug: category.slug,
        description: category.description,
        path: category.path,
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

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  const handleTitleChange = (titleEnglish: string) => {
    const slug = generateSlug(titleEnglish);
    setFormData(prev => ({
      ...prev,
      titleEnglish,
      slug,
      path: `/${slug}`,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.titleHindi || !formData.slug) {
      toast.error('हिंदी शीर्षक और स्लग आवश्यक हैं');
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({
          id: editingCategory.id,
          updates: formData,
        });
        toast.success('श्रेणी अपडेट की गई');
      } else {
        await createCategory.mutateAsync(formData as Omit<CMSCategory, 'id'>);
        toast.success('श्रेणी बनाई गई');
      }
      handleCloseDialog();
    } catch (error) {
      toast.error('सहेजने में त्रुटि');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`क्या आप "${title}" श्रेणी को हटाना चाहते हैं?`)) {
      try {
        await deleteCategory.mutateAsync(id);
        toast.success('श्रेणी हटाई गई');
      } catch (error) {
        toast.error('हटाने में त्रुटि');
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">श्रेणियाँ</h1>
          <p className="text-muted-foreground">समाचार श्रेणियों का प्रबंधन करें</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="w-4 h-4" />
          नई श्रेणी
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>हिंदी शीर्षक</TableHead>
                <TableHead>English Title</TableHead>
                <TableHead>स्लग</TableHead>
                <TableHead>पथ</TableHead>
                <TableHead className="text-right">कार्रवाई</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    लोड हो रहा है...
                  </TableCell>
                </TableRow>
              ) : categories?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <FolderOpen className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">कोई श्रेणी नहीं</p>
                  </TableCell>
                </TableRow>
              ) : (
                categories?.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.titleHindi}</TableCell>
                    <TableCell>{category.titleEnglish}</TableCell>
                    <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                    <TableCell className="text-muted-foreground">{category.path}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(category)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(category.id, category.titleHindi)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'श्रेणी संपादित करें' : 'नई श्रेणी'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="titleHindi">हिंदी शीर्षक *</Label>
              <Input
                id="titleHindi"
                value={formData.titleHindi}
                onChange={(e) => setFormData(prev => ({ ...prev, titleHindi: e.target.value }))}
                placeholder="राजनीति"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="titleEnglish">English Title</Label>
              <Input
                id="titleEnglish"
                value={formData.titleEnglish}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Politics"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="slug">स्लग</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="politics"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="path">पथ</Label>
                <Input
                  id="path"
                  value={formData.path}
                  onChange={(e) => setFormData(prev => ({ ...prev, path: e.target.value }))}
                  placeholder="/politics"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">विवरण</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="इस श्रेणी का संक्षिप्त विवरण"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              रद्द करें
            </Button>
            <Button onClick={handleSubmit}>
              {editingCategory ? 'अपडेट करें' : 'बनाएं'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoriesManager;
