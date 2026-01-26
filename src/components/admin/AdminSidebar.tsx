"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  LayoutDashboard, 
  FileText, 
  FolderOpen, 
  Users, 
  UserCog,
  Image, 
  Settings, 
  LogOut,
  Newspaper,
  ChevronLeft,
  ChevronRight,
  Plus,
  Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface NavItem {
  title: string;
  titleHindi: string;
  href: string;
  icon: React.ElementType;
  visible?: (role: string | undefined) => boolean;
}

const navItems: NavItem[] = [
  { title: 'Dashboard', titleHindi: 'डैशबोर्ड', href: '/admin', icon: LayoutDashboard },
  { title: 'Articles', titleHindi: 'लेख', href: '/admin/articles', icon: FileText },
  { title: 'Content', titleHindi: 'कंटेंट', href: '/admin/content', icon: Layers },
  { title: 'Categories', titleHindi: 'श्रेणियाँ', href: '/admin/categories', icon: FolderOpen },
  { title: 'Users', titleHindi: 'यूज़र्स', href: '/admin/users', icon: UserCog, visible: (role) => role === 'admin' },
  { title: 'Authors', titleHindi: 'लेखक', href: '/admin/authors', icon: Users },
  { title: 'Media', titleHindi: 'मीडिया', href: '/admin/media', icon: Image },
  { title: 'Settings', titleHindi: 'सेटिंग्स', href: '/admin/settings', icon: Settings },
];

const AdminSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAdminAuth();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  const isActive = (path: string) => pathname === path;


  return (
    <aside className={cn(
      "h-screen bg-card border-r border-border flex flex-col transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className={cn(
        "h-16 border-b border-border flex items-center px-4",
        collapsed ? "justify-center" : "justify-between"
      )}>
        {!collapsed && (
          <Link href="/admin" className="flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg">CMS</span>
          </Link>
        )}
        {collapsed && (
          <Newspaper className="w-6 h-6 text-primary" />
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn("h-8 w-8", collapsed && "absolute -right-3 bg-background border shadow-sm")}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Quick Action */}
      {!collapsed && (
        <div className="p-4">
          <Button 
            className="w-full gap-2" 
            onClick={() => router.push('/admin/articles/new')}
          >
            <Plus className="w-4 h-4" />
            नया लेख
          </Button>
        </div>
      )}
      {collapsed && (
        <div className="p-2">
          <Button 
            size="icon"
            className="w-full" 
            onClick={() => router.push('/admin/articles/new')}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2">
        <nav className="space-y-1 py-2">
          {navItems.filter((item) => (item.visible ? item.visible(user?.role) : true)).map((item) => {
            const active = pathname === item.href || 
              (item.href !== '/admin' && pathname?.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                  active 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted text-muted-foreground hover:text-foreground",
                  collapsed && "justify-center"
                )}
                title={collapsed ? item.titleHindi : undefined}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!collapsed && (
                  <span className="text-sm font-medium">{item.titleHindi}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* User Section */}
      <div className={cn(
        "border-t border-border p-4",
        collapsed && "p-2"
      )}>
        {!collapsed && user && (
          <div className="mb-3 px-2">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        )}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size={collapsed ? "icon" : "default"}
            className={cn("gap-2", !collapsed && "w-full")}
            onClick={() => router.push('/')}
            title="साइट देखें"
          >
            <Newspaper className="w-4 h-4" />
            {!collapsed && "साइट देखें"}
          </Button>
        </div>
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "default"}
          className={cn("gap-2 mt-2 text-destructive hover:text-destructive", !collapsed && "w-full")}
          onClick={handleLogout}
          title="लॉगआउट"
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && "लॉगआउट"}
        </Button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
