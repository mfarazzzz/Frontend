/**
 * Author Attribution Block — for use in article pages
 *
 * Displays author name, photo, designation, department, and link to profile.
 * Automatically populated from article metadata.
 * Satisfies Google News publisher requirements.
 */

import Image from 'next/image';
import Link from 'next/link';
import { User } from 'lucide-react';

interface Props {
  authorName: string;
  authorSlug?: string;
  authorImage?: string;
  designation?: string;
  department?: string;
  publishedDate?: string;
  modifiedDate?: string;
}

export default function AuthorAttribution({
  authorName,
  authorSlug,
  authorImage,
  designation,
  department,
  publishedDate,
  modifiedDate,
}: Props) {
  const displayName = authorName || 'Rampur News Desk';
  const slug = authorSlug || toSlug(displayName);
  const profileUrl = `/author/${slug}`;
  const showModified = modifiedDate && modifiedDate !== publishedDate;

  return (
    <div className="flex items-center gap-4 py-4 border-t border-border/50" role="group" aria-label="Article author information">
      {/* Author Image */}
      <Link href={profileUrl} aria-label={`${displayName} profile`} className="flex-shrink-0">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-muted border border-border/50">
          {authorImage ? (
            <Image
              src={authorImage}
              alt={`${displayName} profile photo`}
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary text-sm font-bold">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </Link>

      {/* Author Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Written by</span>
          <Link
            href={profileUrl}
            className="font-semibold text-foreground hover:text-primary transition-colors"
          >
            {displayName}
          </Link>
          <span className="text-muted-foreground/50">|</span>
          <Link
            href={profileUrl}
            className="text-sm text-primary hover:underline"
            aria-label={`View all articles by ${displayName}`}
          >
            View all articles
          </Link>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
          {designation && <span>{designation}</span>}
          {designation && department && <span className="text-muted-foreground/50">•</span>}
          {department && <span>{department}</span>}
          {(designation || department) && publishedDate && <span className="text-muted-foreground/50">•</span>}
          {publishedDate && (
            <time dateTime={publishedDate}>
              {new Date(publishedDate).toLocaleDateString('hi-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
            </time>
          )}
          {showModified && (
            <>
              <span className="text-muted-foreground/50">•</span>
              <span>Updated: <time dateTime={modifiedDate}>{new Date(modifiedDate).toLocaleDateString('hi-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</time></span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function toSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
