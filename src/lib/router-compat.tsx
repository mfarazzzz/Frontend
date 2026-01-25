/* Minimal compatibility layer to run existing components under Next.js */
"use client";
import NextLink from "next/link";
import { useRouter as useNextRouter, useParams as useNextParams, usePathname, useSearchParams } from "next/navigation";
import { PropsWithChildren, useEffect, useMemo, ComponentProps } from "react";

type LinkProps = Omit<ComponentProps<typeof NextLink>, "href"> & {
  to: string;
};

export function Link({ to, ...props }: LinkProps) {
  return (
    <NextLink href={to} {...props} />
  );
}

export function useParams<T extends Record<string, string>>() {
  return useNextParams() as unknown as T;
}

export function Navigate({ to, replace = false }: { to: string; replace?: boolean }) {
  const router = useNextRouter();
  useEffect(() => {
    if (replace) router.replace(to);
    else router.push(to);
  }, [router, to, replace]);
  return null;
}

export function useNavigate() {
  const router = useNextRouter();
  return (to: string | number, options?: { replace?: boolean }) => {
    if (typeof to === 'number') {
       if (to === -1) router.back();
       // Forward navigation not directly supported by simple router.back()
       return;
    }
    if (options?.replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  };
}

export function useLocation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  return useMemo(() => {
    return {
      pathname: pathname || "/",
      search: searchParams ? `?${searchParams.toString()}` : "",
      hash: "",
      state: null,
      key: "default"
    };
  }, [pathname, searchParams]);
}

export function Outlet() {
  return null;
}

export function BrowserRouter({ children }: PropsWithChildren) {
  return <>{children}</>;
}

export function Routes({ children }: PropsWithChildren) {
  return <>{children}</>;
}

export function Route() {
  return null;
}
