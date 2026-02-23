import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BadgeCheck,
  Megaphone,
  PenLine,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Join Us | रामपुर न्यूज़ - युवा पत्रकारों के लिए मंच",
  description:
    "Rampur News का युवा, प्रभावशाली और पहचान बनाने वाला प्लेटफॉर्म। अपनी आवाज़ को पहचान, पहुंच और भविष्य के अवसरों में बदलें।",
  alternates: {
    canonical: "/join-us",
  },
  openGraph: {
    type: "website",
    title: "Join Us | रामपुर न्यूज़",
    description:
      "एक ऐसा प्लेटफॉर्म जहाँ आपकी आवाज़ पहचान बनती है। युवा पत्रकारों, क्रिएटर्स और फ्रीलांसर्स के लिए अवसर।",
    url: "/join-us",
    siteName: "रामपुर न्यूज़ | Rampur News",
  },
  twitter: {
    card: "summary_large_image",
    title: "Join Us | रामपुर न्यूज़",
    description:
      "अपनी पहचान, प्रोफाइल और प्रभाव बनाने के लिए Rampur News से जुड़ें।",
  },
};

const applyUrl =
  "https://docs.google.com/forms/d/e/1FAIpQLSezmhkifh6B8qditlJR9Ja4g7R_oRG0stgq-Y3_cJfXXkl3Ug/viewform";

export default function Page() {
  return (
    <div className="min-h-screen bg-background scroll-smooth">
      <Header />
      <main>
        <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-background text-white">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
            <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          </div>
          <div className="container relative z-10 py-16 md:py-24">
            <div className="max-w-3xl space-y-6 animate-fade-in">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold uppercase tracking-widest">
                Youth + Newsroom Energy
                <Sparkles className="h-4 w-4 text-primary" />
              </p>
              <h1 className="text-4xl md:text-6xl font-black leading-tight">
                Sirf News Consume Karoge, Ya News Banaoge?
              </h1>
              <p className="text-lg md:text-xl text-white/80">
                Agar aapki awaaz mein dum hai, to use duniya tak pahunchane ka waqt aa gaya hai.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Button size="lg" asChild>
                  <a href="#apply">
                    Join the Mission
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                  asChild
                >
                  <a href="#apply">
                    Start Writing Today
                  </a>
                </Button>
              </div>
              <div className="grid gap-4 pt-8 sm:grid-cols-3 text-sm text-white/70">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  Real newsroom exposure
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  Google visibility
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  Identity + credibility
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container py-16 md:py-20">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Har reporter ki ek pehchaan hoti hai. Aapki kab hogi?
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Social media par likes milte hain. Yahan aapko credibility milti hai. Yahan aapka naam Google par dikhega.
                Yahan aapka work portfolio banega.
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { label: "Published under your name", value: "100%" },
                  { label: "Digital exposure", value: "High Reach" },
                  { label: "Real impact", value: "Local to Global" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-border bg-card px-4 py-5 shadow-sm transition-transform duration-200 hover:-translate-y-1"
                  >
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className="text-lg font-semibold text-foreground">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-transparent to-transparent p-8 shadow-sm">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <BadgeCheck className="h-6 w-6 text-primary" />
                  <span className="font-semibold text-foreground">Credibility that stays</span>
                </div>
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  <span className="font-semibold text-foreground">Visibility that grows</span>
                </div>
                <div className="flex items-center gap-3">
                  <Zap className="h-6 w-6 text-primary" />
                  <span className="font-semibold text-foreground">Impact that matters</span>
                </div>
                <p className="text-muted-foreground">
                  Rampur News ek movement hai jahan aapki voice aur byline aapki pehchaan banate hain.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="container py-16 md:py-20">
          <div className="space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Yeh platform un logon ke liye hai jo…
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "System se sawal karna chahte hain",
                  icon: Target,
                },
                {
                  title: "Apne shehar ki sachchai dikhana chahte hain",
                  icon: Megaphone,
                },
                {
                  title: "Digital media mein career banana chahte hain",
                  icon: TrendingUp,
                },
                {
                  title: "Apni pehchaan banana chahte hain",
                  icon: BadgeCheck,
                },
                {
                  title: "Sirf bolna nahi, likhna aur publish karna chahte hain",
                  icon: PenLine,
                },
                {
                  title: "Visibility aur influence chahte hain",
                  icon: Users,
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <p className="text-base font-semibold text-foreground">{item.title}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container py-16 md:py-20">
          <div className="rounded-3xl border border-border bg-gradient-to-br from-background via-background to-primary/5 p-10 shadow-sm">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                  Yahan sirf experience nahi, future banta hai.
                </h2>
                <ul className="grid gap-4 text-base text-muted-foreground">
                  {[
                    "Apni khabar, apne naam ke saath",
                    "Google indexed professional profile",
                    "Real newsroom exposure",
                    "Portfolio for future media jobs",
                    "Social credibility",
                    "Work-from-home flexibility",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                      <span className="text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="grid gap-4">
                {[
                  { label: "Recognition", icon: BadgeCheck },
                  { label: "Identity", icon: Users },
                  { label: "Influence", icon: Megaphone },
                  { label: "Future Growth", icon: TrendingUp },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-2xl border border-border bg-card px-5 py-4 shadow-sm transition-transform duration-200 hover:-translate-y-1"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5 text-primary" />
                      <span className="font-semibold text-foreground">{item.label}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-950 text-white">
          <div className="container py-16 md:py-20">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold">
                  Opportunities sabko milti hain. Platform sabko nahi milta.
                </h2>
                <p className="text-lg text-white/70">
                  Agar aap apni voice ko platform dena चाहते हैं, to abhi कदम बढ़ाइए. यह मौका आपकी पहचान बना सकता है.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" asChild>
                  <a href="#apply">
                    Apply Now
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                  asChild
                >
                  <a href="#apply">
                    Become a Contributor
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>
        <section id="apply" className="container py-16 md:py-20">
          <div className="rounded-3xl border border-border bg-card p-6 md:p-10 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-2">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">अब अप्लाई करें</h2>
                <p className="text-muted-foreground">
                  फॉर्म भरकर अपनी आवाज़ और पहचान को Rampur News के साथ जोड़ें।
                </p>
              </div>
              <Button variant="outline" asChild>
                <a href={applyUrl} target="_blank" rel="noreferrer">
                  नए टैब में खोलें
                </a>
              </Button>
            </div>
            <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-white">
              <iframe
                src={applyUrl}
                title="Rampur News Join Us Form"
                className="w-full min-h-[900px]"
              />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
