/**
 * Publisher Profile — Breadcrumb Navigation
 * WCAG-compliant breadcrumb with aria-label and structured markup.
 */

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface Props {
  authorName: string;
  slug: string;
}

export default function PublisherBreadcrumb({ authorName, slug }: Props) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="max-w-6xl mx-auto px-4 pt-4 pb-2"
    >
      <ol className="flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap">
        <li className="flex items-center gap-1.5">
          <Link
            href="/"
            className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
            aria-label="Home"
          >
            <Home className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Home</span>
          </Link>
        </li>
        <li className="flex items-center gap-1.5" aria-hidden="true">
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
        </li>
        <li className="flex items-center gap-1.5">
          <Link
            href="/authors"
            className="hover:text-foreground transition-colors"
          >
            Authors
          </Link>
        </li>
        <li className="flex items-center gap-1.5" aria-hidden="true">
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
        </li>
        <li aria-current="page" className="font-medium text-foreground truncate max-w-[200px] sm:max-w-none">
          {authorName}
        </li>
      </ol>
    </nav>
  );
}
