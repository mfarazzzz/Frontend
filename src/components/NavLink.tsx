"use client";
import { Link } from "@/lib/router-compat";
import { usePathname } from "next/navigation";
import { forwardRef, ComponentProps } from "react";
import { cn } from "@/lib/utils";

interface NavLinkCompatProps extends Omit<ComponentProps<typeof Link>, "className"> {
  className?: string | ((props: { isActive: boolean; isPending: boolean }) => string);
  activeClassName?: string;
  pendingClassName?: string;
  to: string;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, to, ...props }, ref) => {
    const pathname = usePathname();
    // Logic for active state: exact match or starts with path (for nested routes)
    // Note: react-router-dom NavLink default matching might be slightly different but this is usually sufficient for simple navs
    const isActive = pathname === to || (to !== "/" && pathname?.startsWith(to));

    const resolvedClassName = typeof className === "function" 
      ? className({ isActive, isPending: false }) 
      : className;

    return (
      <Link
        to={to}
        className={cn(resolvedClassName, isActive && activeClassName)}
        {...props}
      >
        {props.children}
      </Link>
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
