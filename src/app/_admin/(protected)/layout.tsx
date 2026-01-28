"use client";

import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';

const AdminSidebar = dynamic(() => import('@/components/admin/AdminSidebar'), {
  ssr: false,
  loading: () => <div className="w-64 bg-muted animate-pulse" />
});

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      <Suspense fallback={<div className="w-64 bg-muted animate-pulse" />}>
        <AdminSidebar />
      </Suspense>
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
