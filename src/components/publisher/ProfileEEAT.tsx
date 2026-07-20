/**
 * Publisher Profile E-E-A-T — Expertise, Experience, Credentials
 * Displays trust signals for Google and readers.
 */

import { Award, BookOpen, BriefcaseBusiness, GraduationCap, Languages, Tag } from 'lucide-react';
import type { PublisherProfile } from '@/types/publisher-profile';

interface Props {
  profile: PublisherProfile;
}

export default function PublisherProfileEEAT({ profile }: Props) {
  const hasExpertise = profile.knowsAbout.length > 0 || profile.beat || profile.languages.length > 0;
  const hasExperience = profile.experienceYears > 0 || profile.experienceDescription || profile.education.length > 0;
  const hasCredentials = profile.certifications.length > 0 || profile.awards.length > 0;

  if (!hasExpertise && !hasExperience && !hasCredentials) {
    return null;
  }

  return (
    <section aria-labelledby="eeat-heading" className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
          E-E-A-T
        </p>
        <h2 id="eeat-heading" className="text-xl md:text-2xl font-bold text-foreground">
          विशेषज्ञता और अनुभव
        </h2>
      </header>

      {/* Expertise */}
      {hasExpertise && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
            <Tag className="w-4 h-4" aria-hidden="true" />
            विशेषज्ञता
          </h3>
          <div className="flex flex-wrap gap-2">
            {profile.beat && (
              <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                {profile.beat}
              </span>
            )}
            {profile.knowsAbout.slice(0, 20).map((topic) => (
              <span
                key={topic}
                className="inline-flex items-center rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-muted-foreground"
              >
                {topic}
              </span>
            ))}
          </div>
          {profile.languages.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Languages className="w-4 h-4" aria-hidden="true" />
              <span>भाषाएं: {profile.languages.join(', ')}</span>
            </div>
          )}
        </div>
      )}

      {/* Experience */}
      {hasExperience && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
            <BriefcaseBusiness className="w-4 h-4" aria-hidden="true" />
            अनुभव
          </h3>
          {profile.experienceYears > 0 && (
            <p className="text-sm text-muted-foreground">
              <strong>{profile.experienceYears}</strong> वर्षों का पेशेवर अनुभव
            </p>
          )}
          {profile.experienceDescription && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {profile.experienceDescription}
            </p>
          )}
          {profile.education.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" aria-hidden="true" />
                शिक्षा
              </h4>
              <ul className="space-y-1.5 list-none pl-0">
                {profile.education.slice(0, 10).map((edu, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <BookOpen className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-primary/60" aria-hidden="true" />
                    <span>
                      {edu.degree} — {edu.institution}
                      {edu.year ? ` (${edu.year})` : ''}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Credentials */}
      {hasCredentials && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
            <Award className="w-4 h-4" aria-hidden="true" />
            प्रमाणपत्र और पुरस्कार
          </h3>
          {profile.certifications.length > 0 && (
            <div className="space-y-1">
              <h4 className="text-xs font-medium text-muted-foreground">प्रमाणपत्र</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {profile.certifications.slice(0, 15).map((cert, i) => (
                  <li key={i}>{cert}</li>
                ))}
              </ul>
            </div>
          )}
          {profile.awards.length > 0 && (
            <div className="space-y-1">
              <h4 className="text-xs font-medium text-muted-foreground">पुरस्कार</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {profile.awards.slice(0, 15).map((award, i) => (
                  <li key={i}>{award}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
