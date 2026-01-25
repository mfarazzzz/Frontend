"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import ImageUploader from '@/components/admin/ImageUploader';
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
import { Plus, Edit, Trash2, Users, RefreshCw, ShieldX } from 'lucide-react';
import { toast } from 'sonner';

type StrapiRole = {
  id: string;
  name: string;
  type?: string;
  description?: string;
};

type StrapiUser = {
  id: string;
  username: string;
  email: string;
  confirmed: boolean;
  blocked: boolean;
  role: StrapiRole | null;
  createdAt?: string;
  updatedAt?: string;
};

type UsersResponse = {
  data: StrapiUser[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

const fetchJson = async <T,>(input: RequestInfo, init?: RequestInit): Promise<T> => {
  const response = await fetch(input, { cache: 'no-store', ...init });
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      const maybe = body?.error?.message || body?.message || body?.error;
      if (typeof maybe === 'string' && maybe.trim()) message = maybe;
    } catch {
      void 0;
    }
    const error = new Error(message) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }
  if (response.status === 204) {
    return null as T;
  }
  return (await response.json()) as T;
};

const UsersManager = () => {
  const { user: sessionUser } = useAdminAuth();

  const [users, setUsers] = useState<StrapiUser[]>([]);
  const [roles, setRoles] = useState<StrapiRole[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<StrapiUser | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 25;
  const [totalPages, setTotalPages] = useState(1);

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    roleId: '',
    confirmed: true,
    blocked: false,
    createAuthorProfile: true,
    authorName: '',
    authorNameHindi: '',
    authorBio: '',
    authorBioHindi: '',
    authorAvatarUrl: '',
    authorAvatarId: '',
  });

  const canManageUsers = sessionUser?.role === 'admin';

  const roleOptions = useMemo(() => roles.filter(Boolean), [roles]);

  const loadRoles = useCallback(async () => {
    const data = await fetchJson<StrapiRole[]>('/api/cms/strapi/admin/roles', { method: 'GET' });
    setRoles(data);
  }, []);

  const loadUsers = useCallback(async (nextPage: number, nextSearch: string) => {
    const params = new URLSearchParams();
    params.set('page', String(nextPage));
    params.set('pageSize', String(pageSize));
    if (nextSearch.trim()) params.set('search', nextSearch.trim());
    const data = await fetchJson<UsersResponse>(`/api/cms/strapi/admin/users?${params.toString()}`, { method: 'GET' });
    setUsers(Array.isArray(data?.data) ? data.data : []);
    setTotalPages(typeof data?.totalPages === 'number' && data.totalPages > 0 ? data.totalPages : 1);
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.all([loadRoles(), loadUsers(page, search)]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'लोड करने में त्रुटि');
    } finally {
      setIsLoading(false);
    }
  }, [loadRoles, loadUsers, page, search]);

  useEffect(() => {
    if (!canManageUsers) return;
    void refresh();
  }, [canManageUsers, refresh]);

  useEffect(() => {
    if (!canManageUsers) return;
    const t = setTimeout(() => {
      void (async () => {
        setIsLoading(true);
        try {
          await loadUsers(1, search);
          setPage(1);
        } catch (error) {
          toast.error(error instanceof Error ? error.message : 'सर्च में त्रुटि');
        } finally {
          setIsLoading(false);
        }
      })();
    }, 300);
    return () => clearTimeout(t);
  }, [canManageUsers, loadUsers, search]);

  const resetForm = () => {
    setFormData({
      email: '',
      username: '',
      password: '',
      roleId: roleOptions[0]?.id || '',
      confirmed: true,
      blocked: false,
      createAuthorProfile: true,
      authorName: '',
      authorNameHindi: '',
      authorBio: '',
      authorBioHindi: '',
      authorAvatarUrl: '',
      authorAvatarId: '',
    });
    setEditingUser(null);
  };

  useEffect(() => {
    if (!isDialogOpen) return;
    if (!editingUser) {
      setFormData((prev) => ({ ...prev, roleId: prev.roleId || roleOptions[0]?.id || '' }));
    }
  }, [isDialogOpen, editingUser, roleOptions]);

  const handleOpenDialog = (u?: StrapiUser) => {
    if (u) {
      setEditingUser(u);
      setFormData({
        email: u.email,
        username: u.username,
        password: '',
        roleId: u.role?.id || '',
        confirmed: u.confirmed,
        blocked: u.blocked,
        createAuthorProfile: false,
        authorName: '',
        authorNameHindi: '',
        authorBio: '',
        authorBioHindi: '',
        authorAvatarUrl: '',
        authorAvatarId: '',
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
    if (!formData.email.trim()) {
      toast.error('ईमेल आवश्यक है');
      return;
    }
    if (!editingUser && !formData.password.trim()) {
      toast.error('पासवर्ड आवश्यक है');
      return;
    }

    const email = formData.email.trim();
    const username = formData.username.trim() || email.split('@')[0] || 'user';

    const payload: Record<string, unknown> = {
      email,
      username,
      roleId: formData.roleId || undefined,
      confirmed: formData.confirmed,
      blocked: formData.blocked,
    };
    if (formData.password.trim()) payload.password = formData.password.trim();
    if (!editingUser && formData.createAuthorProfile) {
      payload.author = {
        name: formData.authorName.trim() || username,
        nameHindi: formData.authorNameHindi.trim() || undefined,
        bio: formData.authorBio.trim() || undefined,
        bioHindi: formData.authorBioHindi.trim() || undefined,
        avatarId: formData.authorAvatarId || undefined,
      };
    }

    setIsLoading(true);
    try {
      if (editingUser) {
        await fetchJson<StrapiUser>(`/api/cms/strapi/admin/users/${editingUser.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        toast.success('यूज़र अपडेट किया गया');
      } else {
        await fetchJson<StrapiUser>('/api/cms/strapi/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        toast.success('यूज़र बनाया गया');
      }
      handleCloseDialog();
      await loadUsers(page, search);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'सहेजने में त्रुटि');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`क्या आप "${email}" को हटाना चाहते हैं?`)) return;
    setIsLoading(true);
    try {
      await fetchJson<null>(`/api/cms/strapi/admin/users/${id}`, { method: 'DELETE' });
      toast.success('यूज़र हटाया गया');
      await loadUsers(page, search);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'हटाने में त्रुटि');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleBlocked = async (u: StrapiUser) => {
    setIsLoading(true);
    try {
      await fetchJson<StrapiUser>(`/api/cms/strapi/admin/users/${u.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocked: !u.blocked }),
      });
      await loadUsers(page, search);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'अपडेट में त्रुटि');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBadge = (role: StrapiRole | null) => {
    const type = typeof role?.type === 'string' ? role.type.toLowerCase() : '';
    const variants: Record<string, { label: string; className: string }> = {
      admin: { label: 'एडमिन', className: 'bg-red-500' },
      editor: { label: 'संपादक', className: 'bg-blue-500' },
      author: { label: 'लेखक', className: 'bg-green-500' },
      contributor: { label: 'योगदानकर्ता', className: 'bg-gray-500' },
    };
    const v = variants[type] || { label: role?.name || 'Role', className: 'bg-slate-500' };
    return <Badge className={v.className}>{v.label}</Badge>;
  };

  if (!canManageUsers) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12 text-center space-y-3">
            <ShieldX className="w-10 h-10 mx-auto text-muted-foreground" />
            <div className="font-medium">अनुमति नहीं है</div>
            <div className="text-sm text-muted-foreground">यूज़र मैनेजमेंट केवल एडमिन के लिए उपलब्ध है।</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">यूज़र</h1>
          <p className="text-muted-foreground">Admin CMS यूज़र्स का प्रबंधन करें</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refresh} disabled={isLoading} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            रिफ्रेश
          </Button>
          <Button onClick={() => handleOpenDialog()} className="gap-2" disabled={isLoading}>
            <Plus className="w-4 h-4" />
            नया यूज़र
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-3 md:items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="searchUsers">सर्च</Label>
            <Input
              id="searchUsers"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ईमेल या यूज़रनेम"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={isLoading || page <= 1}
              onClick={() => {
                const next = Math.max(page - 1, 1);
                setPage(next);
                void (async () => {
                  setIsLoading(true);
                  try {
                    await loadUsers(next, search);
                  } finally {
                    setIsLoading(false);
                  }
                })();
              }}
            >
              पिछला
            </Button>
            <Button
              variant="outline"
              disabled={isLoading || page >= totalPages}
              onClick={() => {
                const next = Math.min(page + 1, totalPages);
                setPage(next);
                void (async () => {
                  setIsLoading(true);
                  try {
                    await loadUsers(next, search);
                  } finally {
                    setIsLoading(false);
                  }
                })();
              }}
            >
              अगला
            </Button>
          </div>
          <div className="text-sm text-muted-foreground md:ml-auto">
            पेज {page} / {totalPages}
          </div>
        </CardContent>
      </Card>

      {isLoading && users.length === 0 ? (
        <div className="text-center py-8">लोड हो रहा है...</div>
      ) : users.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">कोई यूज़र नहीं</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((u) => (
            <Card key={u.id} className="overflow-hidden">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{u.username || 'User'}</div>
                    <div className="text-sm text-muted-foreground truncate">{u.email}</div>
                  </div>
                  <div className="shrink-0">{getRoleBadge(u.role)}</div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">Active</div>
                  <Switch checked={!u.blocked} onCheckedChange={() => void handleToggleBlocked(u)} disabled={isLoading} />
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleOpenDialog(u)} disabled={isLoading}>
                    <Edit className="w-3 h-3 mr-1" />
                    संपादित
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void handleDelete(u.id, u.email)}
                    className="text-destructive hover:text-destructive"
                    disabled={isLoading}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    हटाएं
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? 'यूज़र संपादित करें' : 'नया यूज़र'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">ईमेल *</Label>
              <Input
                id="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="user@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">यूज़रनेम</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                placeholder="username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{editingUser ? 'नया पासवर्ड (optional)' : 'पासवर्ड *'}</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-2">
              <Label>रोल</Label>
              <Select value={formData.roleId} onValueChange={(value) => setFormData((prev) => ({ ...prev, roleId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="रोल चुनें" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-sm font-medium">Confirmed</div>
                <div className="text-xs text-muted-foreground">लॉगिन की अनुमति</div>
              </div>
              <Switch checked={formData.confirmed} onCheckedChange={(v) => setFormData((p) => ({ ...p, confirmed: v }))} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-sm font-medium">Active</div>
                <div className="text-xs text-muted-foreground">डी-एक्टिव करने पर यूज़र blocked होगा</div>
              </div>
              <Switch checked={!formData.blocked} onCheckedChange={(v) => setFormData((p) => ({ ...p, blocked: !v }))} />
            </div>

            {!editingUser && (
              <div className="space-y-4 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Author प्रोफाइल</div>
                    <div className="text-xs text-muted-foreground">यूज़र के साथ लिंक्ड Author प्रोफाइल बनाएं</div>
                  </div>
                  <Switch
                    checked={formData.createAuthorProfile}
                    onCheckedChange={(v) => setFormData((p) => ({ ...p, createAuthorProfile: v }))}
                  />
                </div>

                {formData.createAuthorProfile && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="authorName">नाम</Label>
                      <Input
                        id="authorName"
                        value={formData.authorName}
                        onChange={(e) => setFormData((p) => ({ ...p, authorName: e.target.value }))}
                        placeholder="Author name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="authorNameHindi">नाम (हिंदी)</Label>
                      <Input
                        id="authorNameHindi"
                        value={formData.authorNameHindi}
                        onChange={(e) => setFormData((p) => ({ ...p, authorNameHindi: e.target.value }))}
                        placeholder="लेखक का नाम"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>अवतार</Label>
                      <ImageUploader
                        value={formData.authorAvatarUrl}
                        onChange={(v) => setFormData((p) => ({ ...p, authorAvatarUrl: String(v || '') }))}
                        onMediaChange={(media) =>
                          setFormData((p) => ({
                            ...p,
                            authorAvatarId: Array.isArray(media) ? String(media[0]?.id || '') : String(media?.id || ''),
                            authorAvatarUrl: Array.isArray(media) ? String(media[0]?.url || '') : String(media?.url || ''),
                          }))
                        }
                        label=""
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="authorBio">बायो</Label>
                      <Textarea
                        id="authorBio"
                        value={formData.authorBio}
                        onChange={(e) => setFormData((p) => ({ ...p, authorBio: e.target.value }))}
                        placeholder="Author bio"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="authorBioHindi">बायो (हिंदी)</Label>
                      <Textarea
                        id="authorBioHindi"
                        value={formData.authorBioHindi}
                        onChange={(e) => setFormData((p) => ({ ...p, authorBioHindi: e.target.value }))}
                        placeholder="लेखक के बारे में"
                        rows={3}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog} disabled={isLoading}>
              रद्द करें
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              सेव करें
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersManager;
