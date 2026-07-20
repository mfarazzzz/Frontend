/**
 * Publisher Profile Hero — Top section with cover, avatar, name, stats
 */

import Image from 'next/image';
import { BadgeCheck, Calendar, Clock } from 'lucide-react';
import type { PublisherProfile, AuthorStats } from '@/types/publisher-profile';

interface Props {
  profile: PublisherProfile;
  stats: AuthorStats;
}

export default function PublisherProfileHero({ profile, stats }: Props) {
  const name = profile.fullName || profile.hindiName;
  const isVerified = profile.verificationStatus === 'verified';
  const joinLabel = profile.joinDate
    ? new Date(profile.joinDate).toLocaleDateString('hi-IN', { year: 'numeric', month: 'long' })
    : '';

  return (
    <section aria-label="Author Profile Header" className="relative">
      {/* Cover Image */}
      <div className="relative h-48 sm:h-56 md:h-64 lg:h-72 w-full overflow-hidden bg-gradient-to-br from-primary/10 via-muted to-primary/5">
        {profile.coverImage ? (
          <Image
            src={profile.coverImage}
            alt={`${name} cover image`}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-muted/50 to-primary/10" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
      </div>

      {/* Profile Content */}
      <div className="relative max-w-6xl mx-auto px-4 -mt-16 sm:-mt-20 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-background bg-muted shadow-xl ring-1 ring-black/5">
              {profile.profileImage ? (
                <Image
                  src={profile.profileImage}
                  alt={`${name} profile photo`}
                  width={144}
                  height={144}
                  className="w-full h-full object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-3xl font-bold">
                  {name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            {isVerified && (
              <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5" title="Verified Author">
                <BadgeCheck className="w-6 h-6 text-blue-500" aria-label="Verified Author Badge" />
              </div>
            )}
          </div>

          {/* Name & Designation */}
          <div className="space-y-1 sm:pb-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                {name}
              </h1>
              {isVerified && (
                <BadgeCheck className="w-5 h-5 text-blue-500 sm:hidden" aria-hidden="true" />
              )}
            </div>
            {profile.hindiName && profile.hindiName !== name && (
              <p className="text-lg text-muted-foreground">{profile.hindiName}</p>
            )}
            <div className="flex items-center gap-2 flex-wrap text-sm text-muted-foreground">
              {profile.designation && (
                <span className="font-medium text-primary">{profile.designation}</span>
              )}
              {profile.designation && profile.editorialStatus && profile.editorialStatus !== 'Active' && (
                <span className="text-muted-foreground/50">•</span>
              )}
              {profile.editorialStatus && profile.editorialStatus !== 'Active' && (
                <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                  {profile.editorialStatus}
                </span>
              )}
              {profile.department && (
                <>
                  <span className="text-muted-foreground/50">•</span>
                  <span>{profile.department}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Short Bio */}
        {profile.shortBio && (
          <p className="mt-4 text-base text-muted-foreground leading-relaxed max-w-3xl">
            {profile.shortBio}
          </p>
        )}

        {/* Stats Row */}
        <div className="mt-6 flex flex-wrap gap-3" aria-label="Author Statistics">
          <StatBadge label="कुल लेख" value={String(stats.totalArticles)} />
          <StatBadge label="श्रेणियां" value={String(stats.categoriesCovered)} />
          {stats.averageReadTime > 0 && (
            <StatBadge label="औसत पठन" value={`${stats.averageReadTime} मिनट`} icon={<Clock className="w-3.5 h-3.5" />} />
          )}
          {joinLabel && (
            <StatBadge label="से जुड़े" value={joinLabel} icon={<Calendar className="w-3.5 h-3.5" />} />
          )}
        </div>

        {/* Inactive Notice */}
        {profile.editorialStatus === 'Inactive' && (
          <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20 p-3 text-sm text-yellow-800 dark:text-yellow-300" role="alert">
            यह लेखक वर्तमान में सक्रिय नहीं है।
          </div>
        )}
      </div>
    </section>
  );
}

function StatBadge({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/90 px-4 py-2 shadow-sm text-sm">
      {icon}
      <span className="font-semibold text-foreground">{value}</span>
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}
