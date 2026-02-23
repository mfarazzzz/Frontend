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
                युवा जोश + न्यूज़रूम एनर्जी
                <Sparkles className="h-4 w-4 text-primary" />
              </p>
              <h1 className="text-4xl md:text-6xl font-black leading-tight">
                सिर्फ़ खबरें पढ़ेंगे, <br /> या खबरें बनाएंगे?
              </h1>
              <p className="text-lg md:text-xl text-white/80">
                अगर आपकी आवाज़ में दम है, तो उसे दुनिया तक पहुँचाने का वक़्त आ गया है।
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Button size="lg" asChild>
                  <a href="#apply">
                    मिशन से जुड़ें
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </a>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                  asChild
                >
                  <a href="#apply">
                    आज ही लिखना शुरू करें
                  </a>
                </Button>
              </div>
              <div className="grid gap-4 pt-8 sm:grid-cols-3 text-sm text-white/70">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4 text-primary" />
                  असली न्यूज़रूम अनुभव
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  गूगल पर पहचान
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  पहचान + विश्वसनीयता
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container py-16 md:py-20">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                हर रिपोर्टर की एक पहचान होती है। आपकी कब होगी?
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                सोशल मीडिया पर सिर्फ़ लाइक्स मिलते हैं। यहाँ आपको विश्वसनीयता (Credibility) मिलती है। 
                यहाँ आपका नाम गूगल पर दिखेगा। यहाँ आपका वर्क पोर्टफोलियो बनेगा।
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { label: "आपके नाम से प्रकाशित", value: "100%" },
                  { label: "डिजिटल एक्सपोजर", value: "High Reach" },
                  { label: "असली प्रभाव", value: "Local to Global" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-border bg-card px-4 py-5 shadow-sm transition-transform duration-200 hover:-translate-y-1"
                  >
                    <p className="text-sm text-muted-foreground mb-1">{item.label}</p>
                    <p className="text-lg font-bold text-foreground">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-transparent to-transparent p-8 shadow-sm">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-primary/10 p-3">
                    <BadgeCheck className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-lg">विश्वसनीयता जो कायम रहे</h3>
                    <p className="text-sm text-muted-foreground">आपकी खबरें, आपकी असली पहचान।</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-primary/10 p-3">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-lg">पहचान जो बढ़ती रहे</h3>
                    <p className="text-sm text-muted-foreground">हर आर्टिकल के साथ आपकी डिजिटल प्रोफाइल मजबूत होगी।</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-primary/10 p-3">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-lg">प्रभाव जो मायने रखे</h3>
                    <p className="text-sm text-muted-foreground">सिर्फ़ खबर नहीं, बदलाव का हिस्सा बनें।</p>
                  </div>
                </div>
                <p className="text-muted-foreground pt-2 border-t border-border/50">
                  रामपुर न्यूज़ एक मुहीम है जहाँ आपकी आवाज़ और आपकी कलम आपकी पहचान बनाते हैं।
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="container py-16 md:py-20 bg-muted/30">
          <div className="space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                यह मंच उन लोगों के लिए है जो...
              </h2>
              <p className="text-muted-foreground">
                क्या आप इनमें से एक हैं? अगर हाँ, तो यह जगह आपके लिए है।
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "सिस्टम से सवाल करना चाहते हैं",
                  icon: Target,
                  desc: "निडर होकर सच्चाई सामने लाएं",
                },
                {
                  title: "अपने शहर की सच्चाई दिखाना चाहते हैं",
                  icon: Megaphone,
                  desc: "जमीनी हकीकत दुनिया को बताएं",
                },
                {
                  title: "डिजिटल मीडिया में करियर बनाना चाहते हैं",
                  icon: TrendingUp,
                  desc: "पत्रकारिता के नए दौर का हिस्सा बनें",
                },
                {
                  title: "अपनी पहचान बनाना चाहते हैं",
                  icon: BadgeCheck,
                  desc: "सिर्फ़ भीड़ का हिस्सा न रहें",
                },
                {
                  title: "सिर्फ़ बोलना नहीं, लिखना और प्रकाशित करना चाहते हैं",
                  icon: PenLine,
                  desc: "अपने शब्दों को एक मंच दें",
                },
                {
                  title: "विजिबिलिटी और प्रभाव चाहते हैं",
                  icon: Users,
                  desc: "लोगों तक अपनी बात पहुँचाएं",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-primary/50"
                >
                  <div className="absolute top-0 right-0 -mr-6 -mt-6 h-24 w-24 rounded-full bg-primary/5 transition-all group-hover:bg-primary/10" />
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container py-16 md:py-20">
          <div className="rounded-3xl border border-border bg-gradient-to-br from-background via-background to-primary/5 p-8 md:p-12 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-5">
              <Sparkles className="w-64 h-64 text-primary" />
            </div>
            <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-center relative z-10">
              <div className="space-y-8">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                  यहाँ सिर्फ़ अनुभव नहीं, <span className="text-primary">भविष्य बनता है।</span>
                </h2>
                <ul className="grid gap-4 text-lg text-muted-foreground">
                  {[
                    "अपनी खबर, अपने नाम के साथ",
                    "गूगल पर प्रोफेशनल प्रोफाइल",
                    "असली न्यूज़रूम एक्सपोजर",
                    "भविष्य की मीडिया जॉब्स के लिए पोर्टफोलियो",
                    "सामाजिक प्रतिष्ठा (Social Credibility)",
                    "वर्क-फ्रॉम-होम की सुविधा",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                      <span className="text-foreground font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="grid gap-5">
                {[
                  { label: "मान्यता (Recognition)", icon: BadgeCheck, color: "text-blue-500" },
                  { label: "पहचान (Identity)", icon: Users, color: "text-green-500" },
                  { label: "प्रभाव (Influence)", icon: Megaphone, color: "text-orange-500" },
                  { label: "भविष्य की प्रगति (Future Growth)", icon: TrendingUp, color: "text-purple-500" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-2xl border border-border bg-card/80 backdrop-blur-sm px-6 py-5 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg bg-background border border-border ${item.color}`}>
                        <item.icon className="h-6 w-6" />
                      </div>
                      <span className="font-bold text-foreground text-lg">{item.label}</span>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-950 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
          <div className="container py-20 md:py-24 relative z-10">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
              <div className="space-y-6">
                <h2 className="text-3xl md:text-5xl font-black leading-tight">
                  अवसर सबको मिलते हैं, <br />
                  <span className="text-primary">लेकिन मंच सबको नहीं मिलता।</span>
                </h2>
                <p className="text-xl text-white/80 max-w-xl">
                  अगर आप अपनी आवाज़ को एक मंच देना चाहते हैं, तो अभी कदम बढ़ाएं। यह मौका आपकी पहचान बना सकता है।
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-end">
                <Button size="lg" className="text-lg px-8 py-6" asChild>
                  <a href="#apply">
                    अभी आवेदन करें
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </a>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6 border-white/30 text-white hover:bg-white/10 hover:text-white"
                  asChild
                >
                  <a href="#apply">
                    कंट्रीब्यूटर बनें
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
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">अभी आवेदन करें</h2>
                <p className="text-muted-foreground text-lg">
                  नीचे दिए गए फॉर्म को भरें और अपनी आवाज़ को रामपुर न्यूज़ की पहचान बनाएं।
                </p>
              </div>
              <Button variant="outline" className="gap-2" asChild>
                <a href={applyUrl} target="_blank" rel="noreferrer">
                  नए टैब में खोलें
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
            <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-white shadow-inner">
              <iframe
                src={applyUrl}
                title="Rampur News Join Us Form"
                className="w-full min-h-[900px]"
                loading="lazy"
              />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
