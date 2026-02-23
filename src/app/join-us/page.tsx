import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import VolunteerForm from "./VolunteerForm";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Megaphone,
  PenLine,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Video,
  Zap,
} from "lucide-react";

const SITE_URL = "https://rampurnews.com";

export const metadata: Metadata = {
  title: "हमसे जुड़ें | Volunteer Journalism India | Rampur News",
  description:
    "Volunteer Journalism India के लिए Rampur News से जुड़ें। छात्रों और युवाओं के लिए वास्तविक रिपोर्टिंग, कंटेंट क्रिएशन और सामाजिक प्रभाव का अवसर।",
  alternates: {
    canonical: "/join-us",
  },
  openGraph: {
    type: "website",
    title: "हमसे जुड़ें | Volunteer Journalism India",
    description:
      "Rampur News के साथ सामाजिक बदलाव, सीखने और पहचान का मंच। छात्र, युवा और प्रोफेशनल सभी के लिए।",
    url: `${SITE_URL}/join-us`,
    siteName: "रामपुर न्यूज़ | Rampur News",
    images: [`${SITE_URL}/og-image.jpg`],
  },
  twitter: {
    card: "summary_large_image",
    title: "हमसे जुड़ें | Volunteer Journalism India",
    description:
      "समाज में बदलाव लाने के लिए स्वयंसेवक बनें। Rampur News के साथ अपनी पहचान और अनुभव बनाएं।",
    images: [`${SITE_URL}/og-image.jpg`],
  },
};

const whyJoin = [
  {
    title: "सीखने का अवसर",
    desc: "रिपोर्टिंग, कंटेंट क्रिएशन और ग्राउंड वर्क का वास्तविक अनुभव।",
    icon: BadgeCheck,
  },
  {
    title: "सामाजिक प्रभाव",
    desc: "समाज में जागरूकता और बदलाव लाने का अवसर।",
    icon: Target,
  },
  {
    title: "पहचान और नेटवर्क",
    desc: "न्यूज़ इंडस्ट्री में अनुभव और प्रोफेशनल कनेक्शन।",
    icon: Users,
  },
  {
    title: "उद्देश्य के साथ काम",
    desc: "वेतन नहीं, बल्कि मूल्य आधारित योगदान।",
    icon: Zap,
  },
];

const roles = [
  {
    title: "रिपोर्टर (Field Reporter)",
    desc: "स्थानीय मुद्दों की ग्राउंड रिपोर्टिंग और इंटरव्यू।",
    icon: Target,
  },
  {
    title: "कंटेंट राइटर",
    desc: "समाचार, फीचर और सोशल इम्पैक्ट स्टोरी लिखना।",
    icon: PenLine,
  },
  {
    title: "वीडियो एडिटर",
    desc: "शॉर्ट वीडियो और रिपोर्टिंग विज़ुअल्स का संपादन।",
    icon: Video,
  },
  {
    title: "सोशल मीडिया मैनेजर",
    desc: "कंटेंट शेड्यूल, ग्रोथ और कम्युनिटी एंगेजमेंट।",
    icon: Megaphone,
  },
  {
    title: "रिसर्च वालंटियर",
    desc: "डाटा कलेक्शन, फैक्ट चेकिंग और बैकग्राउंड रिसर्च।",
    icon: Search,
  },
];

export default function Page() {
  return (
    <div className="min-h-screen bg-background scroll-smooth font-hindi">
      <Header showBreakingTicker={false} />
      <main>
        <section className="relative min-h-screen overflow-hidden flex items-center">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-red-900" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-slate-950" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_55%)]" />
          <div className="container relative z-10 py-16 md:py-24 flex items-center justify-center">
            <div className="max-w-4xl w-full text-center">
              <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white">
                स्वयंसेवी न्यूज़रूम मिशन
                <Sparkles className="h-4 w-4 text-yellow-300" />
              </div>
              <div className="rounded-3xl border border-white/20 bg-white/10 p-8 md:p-12 text-white shadow-2xl backdrop-blur-xl">
                <h1 className="text-4xl md:text-6xl font-black leading-tight">
                  बदलाव की शुरुआत आपसे होती है।
                </h1>
                <p className="mt-3 text-lg md:text-xl text-white/90 leading-relaxed">
                  हम एक स्वयंसेवी समाचार समूह हैं जो सामाजिक प्रभाव और सकारात्मक परिवर्तन के लिए कार्य करता है।
                </p>
                <p className="mt-4 text-base md:text-lg text-white/80">
                  सिर्फ़ खबरें पढ़ेंगे, या खबरें बनाएंगे?
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  <Button
                    size="lg"
                    className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-lg shadow-lg"
                    asChild
                  >
                    <a href="#apply">
                      स्वयंसेवक बनें
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </a>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/40 bg-white/10 text-white hover:bg-white hover:text-black px-8 py-6 text-lg"
                    asChild
                  >
                    <a href="#roles">भूमिकाएँ देखें</a>
                  </Button>
                </div>
                <div className="mt-8 grid gap-3 sm:grid-cols-3 text-sm text-white/90">
                  <div className="rounded-2xl border border-white/15 bg-black/30 px-4 py-3">
                    छात्रों के लिए सीखने का मंच
                  </div>
                  <div className="rounded-2xl border border-white/15 bg-black/30 px-4 py-3">
                    सप्ताहिक लचीला समय
                  </div>
                  <div className="rounded-2xl border border-white/15 bg-black/30 px-4 py-3">
                    पोर्टफोलियो + पहचान
                  </div>
                </div>
              </div>
              <div className="mt-6 mx-auto max-w-2xl rounded-2xl border border-white/15 bg-black/40 px-5 py-4 text-sm text-white/90">
                यह अवसर पूरी तरह स्वैच्छिक है और सीखने व सामाजिक योगदान पर केंद्रित है।
              </div>
            </div>
          </div>
        </section>

        <section className="container py-16 md:py-20">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">क्यों जुड़ें</h2>
            <p className="text-muted-foreground text-lg">
              सीखने, पहचान और सामाजिक प्रभाव के लिए एक विश्वसनीय न्यूज़रूम प्लेटफॉर्म।
            </p>
          </div>
          <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-start">
            <div className="grid gap-6 sm:grid-cols-2">
              {whyJoin.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-transparent to-transparent p-8 shadow-sm">
              <div className="space-y-5">
                {[
                  {
                    title: "विश्वसनीयता जो कायम रहे",
                    desc: "आपकी खबरें आपके नाम के साथ प्रकाशित होती हैं।",
                    icon: BadgeCheck,
                  },
                  {
                    title: "पहचान जो बढ़ती रहे",
                    desc: "हर स्टोरी के साथ प्रोफेशनल प्रोफाइल मजबूत होता है।",
                    icon: TrendingUp,
                  },
                  {
                    title: "प्रभाव जो मायने रखे",
                    desc: "लोकल से नेशनल तक सामाजिक प्रभाव की कहानी।",
                    icon: Zap,
                  },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="rounded-full bg-primary/10 p-3 text-primary">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
                <Button className="bg-red-600 hover:bg-red-700 text-white" asChild>
                  <a href="#apply">
                    अभी आवेदन करें
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-muted/30 py-16 md:py-20">
          <div className="container">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                  हम किन लोगों को आमंत्रित कर रहे हैं?
                </h2>
                <p className="text-muted-foreground text-lg">
                  यह अवसर उन लोगों के लिए है जो सीखना चाहते हैं और समाज के लिए कुछ बदलना चाहते हैं।
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <ul className="grid gap-4 text-base text-foreground">
                  {[
                    "समाज के लिए काम करने की इच्छा",
                    "सीखने और समय देने की प्रतिबद्धता",
                    "ईमानदारी और जिम्मेदारी",
                    "छात्र / युवा / प्रोफेशनल – सभी स्वागत योग्य",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <div className="mt-2 h-2 w-2 rounded-full bg-primary" />
                      <span className="font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="roles" className="container py-16 md:py-20">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
            <div className="space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Roles Available
              </h2>
              <p className="text-muted-foreground text-lg">
                अपने कौशल और रुचि के अनुसार भूमिका चुनें।
              </p>
            </div>
            <Button asChild className="bg-red-600 hover:bg-red-700 text-white">
              <a href="#apply">
                अभी आवेदन करें
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {roles.map((role) => (
              <div
                key={role.title}
                className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <role.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{role.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{role.desc}</p>
                <Button variant="outline" className="mt-5 w-full" asChild>
                  <a href="#apply">Apply</a>
                </Button>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-muted/30 py-16 md:py-20">
          <div className="container">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-start">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                  हमारा प्रभाव और भरोसा
                </h2>
                <p className="text-muted-foreground text-lg">
                  हम सोशल-इम्पैक्ट पत्रकारिता में सक्रिय, विश्वसनीय और परिणाम-केंद्रित टीम हैं।
                </p>
                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    { label: "500+ स्टोरीज़", value: "Published" },
                    { label: "50+ वालंटियर्स", value: "Active" },
                    { label: "10+ क्षेत्रों", value: "Coverage" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-border bg-card px-4 py-5 shadow-sm"
                    >
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-lg font-bold text-foreground">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid gap-4">
                {[
                  {
                    name: "अनन्या, कॉलेज स्टूडेंट",
                    quote:
                      "यहाँ मैंने रिपोर्टिंग का व्यावहारिक अनुभव पाया और अपनी पहचान बनाई।",
                  },
                  {
                    name: "आदित्य, फ्रेशर",
                    quote:
                      "टीम ने मुझे लेखन और फैक्ट चेकिंग दोनों में गाइड किया।",
                  },
                  {
                    name: "निखिल, प्रोफेशनल",
                    quote:
                      "स्वयंसेवक के रूप में काम करते हुए सामाजिक योगदान का संतोष मिला।",
                  },
                ].map((item) => (
                  <div
                    key={item.name}
                    className="rounded-2xl border border-border bg-card p-6 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
                        {item.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">स्वयंसेवक अनुभव</p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                      “{item.quote}”
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="container py-10">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-8 text-amber-900 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">महत्वपूर्ण सूचना</h3>
                <p className="text-sm">
                  यह पूर्णतः स्वैच्छिक अवसर है। इसमें किसी प्रकार का वेतन प्रदान नहीं किया जाता।
                  यह मंच सीखने, अनुभव प्राप्त करने और सामाजिक योगदान के लिए है।
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="apply" className="container py-16 md:py-20">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-start">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                आवेदन फॉर्म
              </h2>
              <p className="text-muted-foreground text-lg">
                यह फॉर्म खास तौर पर भारतीय छात्रों और युवाओं के लिए डिज़ाइन किया गया है।
                अपनी रुचि साझा करें और हम आपको उचित भूमिका के लिए संपर्क करेंगे।
              </p>
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-foreground">क्या मिलेगा?</h3>
                <ul className="mt-3 grid gap-3 text-sm text-muted-foreground">
                  {[
                    "रियल न्यूज़रूम अनुभव",
                    "फील्ड रिपोर्टिंग और कंटेंट एक्सपोज़र",
                    "अपने नाम से प्रकाशित कार्य",
                    "विश्वसनीयता और प्रोफेशनल नेटवर्क",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <div className="mt-2 h-2 w-2 rounded-full bg-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <VolunteerForm roles={roles} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
