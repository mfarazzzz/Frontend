"use client";

import { ReactNode } from "react";
import { AdminAuthProvider } from "../../contexts/AdminAuthContext";
import { Toaster as SonnerToaster } from "../../components/ui/sonner";
import { TooltipProvider } from "../../components/ui/tooltip";

export function AdminProviders({ children }: { children: ReactNode }) {
  return (
    <AdminAuthProvider>
      <TooltipProvider>
        {children}
        <SonnerToaster />
      </TooltipProvider>
    </AdminAuthProvider>
  );
}
