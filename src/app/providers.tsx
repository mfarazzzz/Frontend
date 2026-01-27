"use client";
import { ReactNode, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { configureCMS } from "@/services/cms";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    const normalizeStrapiBaseUrl = (value: string): string => {
      const trimmed = value.trim().replace(/\/+$/, "");
      if (!trimmed) return trimmed;
      try {
        const u = new URL(trimmed);
        const segments = u.pathname.split("/").filter(Boolean);
        const apiIndex = segments.indexOf("api");
        if (apiIndex >= 0) {
          u.pathname = `/${segments.slice(0, apiIndex + 1).join("/")}`;
          u.search = "";
          u.hash = "";
          return u.toString().replace(/\/+$/, "");
        }
      } catch (error) {
        void error;
      }
      if (trimmed.endsWith("/api")) return trimmed;
      if (/^https?:\/\/[^/]+$/i.test(trimmed)) return `${trimmed}/api`;
      return trimmed;
    };

    const applyConfig = (config: Parameters<typeof configureCMS>[0]) => {
      configureCMS(config);
      queryClient.invalidateQueries({ queryKey: ["cms"] });
    };

    const getSavedStrapiConfig = () => {
      try {
        const savedStrapi = localStorage.getItem("strapi_config");
        if (!savedStrapi) return null;
        const parsed = JSON.parse(savedStrapi) as { baseUrl?: string; apiKey?: string } | null;
        const baseUrl = typeof parsed?.baseUrl === "string" ? normalizeStrapiBaseUrl(parsed.baseUrl) : "";
        if (!baseUrl) return null;
        return { baseUrl, apiKey: parsed?.apiKey || undefined };
      } catch (error) {
        void error;
        return null;
      }
    };

    const hasSavedWordPressConfig = () => {
      try {
        return Boolean(localStorage.getItem("wordpress_config"));
      } catch (error) {
        void error;
        return false;
      }
    };

    void (async () => {
      const provider = process.env.NEXT_PUBLIC_CMS_PROVIDER;

      if (provider === "wordpress") {
        applyConfig({ provider: "wordpress", baseUrl: "/api/cms/wordpress" });
        return;
      }

      if (provider === "mock") {
        applyConfig({ provider: "mock" });
        return;
      }

      const envStrapiUrl =
        process.env.NEXT_PUBLIC_STRAPI_API_URL || process.env.NEXT_PUBLIC_STRAPI_BASE_URL || process.env.NEXT_PUBLIC_STRAPI_URL;
      const envStrapiToken =
        process.env.NEXT_PUBLIC_STRAPI_API_TOKEN || process.env.NEXT_PUBLIC_STRAPI_API_KEY;

      if (provider === "strapi") {
        const explicitUrl = typeof envStrapiUrl === "string" ? normalizeStrapiBaseUrl(envStrapiUrl) : "";
        if (explicitUrl) {
          applyConfig({ provider: "strapi", baseUrl: explicitUrl, apiKey: envStrapiToken || undefined });
          return;
        }

        const saved = getSavedStrapiConfig();
        if (saved) {
          applyConfig({ provider: "strapi", baseUrl: saved.baseUrl, apiKey: saved.apiKey });
          return;
        }
      }

      const saved = getSavedStrapiConfig();
      if (saved) {
        applyConfig({ provider: "strapi", baseUrl: saved.baseUrl, apiKey: saved.apiKey });
        return;
      }

      const candidates = [
        typeof envStrapiUrl === "string" ? normalizeStrapiBaseUrl(envStrapiUrl) : "",
      ].filter((value, index, arr) => Boolean(value) && arr.indexOf(value) === index);

      for (const baseUrl of candidates) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 1200);
        try {
          const response = await fetch(`${baseUrl}/articles?limit=1`, {
            signal: controller.signal,
            headers: envStrapiToken ? { Authorization: `Bearer ${envStrapiToken}` } : undefined,
          });
          if (response.ok) {
            applyConfig({ provider: "strapi", baseUrl, apiKey: envStrapiToken || undefined });
            return;
          }
        } catch (error) {
          void error;
        } finally {
          clearTimeout(timeout);
        }
      }

      if (hasSavedWordPressConfig()) {
        applyConfig({ provider: "wordpress", baseUrl: "/api/cms/wordpress" });
        return;
      }
    })();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {children}
      </TooltipProvider>
    </QueryClientProvider>
  );
}
