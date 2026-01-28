"use client";
import type { ReactNode } from "react";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}

