/**
 * Publisher Profile About — Biography & Entity-Rich Content
 * Optimized for AI Search with semantic HTML and entity signals.
 */

import type { PublisherProfile } from '@/types/publisher-profile';

interface Props {
  profile: PublisherProfile;
  biography: string;
}

export default function PublisherProfileAbout({ profile, biography }: Props) {
  const name = profile.fullName || profile.hindiName;

  return (
    <article aria-labelledby="about-heading" className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm">
      <header className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
          परिचय
        </p>
        <h2 id="about-heading" className="text-2xl md:text-3xl font-bold text-foreground">
          लेखक के बारे में
        </h2>
      </header>

      <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none space-y-4">
        {/* Entity-rich paragraph for AI indexing */}
        <p className="text-muted-foreground leading-relaxed">
          {biography}
        </p>

        {/* Semantic entity summary for machine readability */}
        {(profile.beat || profile.designation) && (
          <p className="text-sm text-muted-foreground/80">
            <strong>{name}</strong>
            {profile.designation && <> ({profile.designation})</>}
            {' '}रामपुर न्यूज़ के लिए
            {profile.beat && <> <em>{profile.beat}</em> क्षेत्र में</>}
            {' '}समाचार कवरेज करते हैं।
            {profile.experienceYears > 0 && <> उनके पास {profile.experienceYears} वर्षों का पत्रकारिता अनुभव है।</>}
          </p>
        )}
      </div>
    </article>
  );
}
