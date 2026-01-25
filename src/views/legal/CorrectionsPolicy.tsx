"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AlertCircle, Mail, Phone, Clock, FileEdit, Eye } from "lucide-react";

const CorrectionsPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
        
      <main className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="text-sm text-muted-foreground mb-6">
            <a href="/" className="hover:text-primary">होम</a>
            <span className="mx-2">/</span>
            <span className="text-foreground">सुधार नीति</span>
          </nav>

          {/* Hero Section */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 md:p-12 mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              सुधार नीति
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl">
              रामपुर न्यूज़ अपनी गलतियों को स्वीकार करने और उन्हें पारदर्शी तरीके से सुधारने के लिए प्रतिबद्ध है। 
              हम मानते हैं कि गलतियां हो सकती हैं, लेकिन उन्हें ईमानदारी से सुधारना हमारी जिम्मेदारी है।
            </p>
          </div>

          {/* Our Commitment */}
          <section className="mb-12">
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                  <AlertCircle className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-2">हमारी प्रतिबद्धता</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    सटीकता पत्रकारिता की आधारशिला है। रामपुर न्यूज़ में हम हर संभव प्रयास करते हैं कि 
                    हमारी रिपोर्टिंग सही और संतुलित हो। जब त्रुटियां होती हैं, तो हम उन्हें तुरंत और 
                    स्पष्ट रूप से सुधारते हैं। हमारा मानना है कि गलतियों को छुपाना हमारी विश्वसनीयता को 
                    कम करता है, जबकि उन्हें खुलकर स्वीकार करना और सुधारना हमें मजबूत बनाता है।
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Error Reporting Process */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">त्रुटि रिपोर्टिंग प्रक्रिया</h2>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6">
              <p className="text-muted-foreground mb-6">
                यदि आपको हमारी किसी रिपोर्ट में कोई त्रुटि दिखाई देती है, तो कृपया हमें सूचित करें। 
                हम सभी सुधार अनुरोधों की गंभीरता से समीक्षा करते हैं।
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-background rounded-lg p-4 border border-border">
                  <div className="flex items-center gap-3 mb-3">
                    <Mail className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-foreground">ईमेल द्वारा</h3>
                  </div>
                  <p className="text-muted-foreground text-sm mb-2">
                    सुधार अनुरोध के लिए ईमेल करें:
                  </p>
                  <a href="mailto:corrections@rampurnews.com" className="text-primary hover:underline font-medium">
                    corrections@rampurnews.com
                  </a>
                </div>

                <div className="bg-background rounded-lg p-4 border border-border">
                  <div className="flex items-center gap-3 mb-3">
                    <Phone className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-foreground">फ़ोन द्वारा</h3>
                  </div>
                  <p className="text-muted-foreground text-sm mb-2">
                    तत्काल सुधार के लिए संपर्क करें:
                  </p>
                  <p className="text-primary font-medium">+91 9997877012</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">सुधार अनुरोध में शामिल करें:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• लेख का शीर्षक और URL</li>
                  <li>• त्रुटि का विवरण</li>
                  <li>• सही जानकारी (यदि उपलब्ध हो)</li>
                  <li>• सही जानकारी का स्रोत (यदि संभव हो)</li>
                  <li>• आपका नाम और संपर्क जानकारी</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Types of Corrections */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <FileEdit className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">सुधार के प्रकार</h2>
            </div>
            
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">तथ्यात्मक सुधार</h3>
                <p className="text-muted-foreground">
                  गलत तथ्यों, नामों, तिथियों, आंकड़ों या अन्य तथ्यात्मक त्रुटियों के लिए। 
                  इन्हें लेख के अंत में स्पष्ट सुधार नोट के साथ ठीक किया जाता है।
                </p>
              </div>

              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">स्पष्टीकरण</h3>
                <p className="text-muted-foreground">
                  जब कोई जानकारी भ्रामक हो सकती है या अतिरिक्त संदर्भ की आवश्यकता हो। 
                  मूल अर्थ में कोई त्रुटि नहीं है, लेकिन अधिक स्पष्टता आवश्यक है।
                </p>
              </div>

              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">अपडेट</h3>
                <p className="text-muted-foreground">
                  जब किसी कहानी में नई जानकारी सामने आती है। मूल रिपोर्ट सही थी, 
                  लेकिन परिस्थितियां बदल गई हैं। इसे "अपडेट" के रूप में चिह्नित किया जाता है।
                </p>
              </div>

              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">संपादक का नोट</h3>
                <p className="text-muted-foreground">
                  जब किसी लेख के बारे में महत्वपूर्ण संदर्भ या अतिरिक्त जानकारी प्रदान करनी हो 
                  जो मूल रिपोर्टिंग में शामिल नहीं थी।
                </p>
              </div>
            </div>
          </section>

          {/* Correction Publishing Policy */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">सुधार प्रकाशन नीति</h2>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">समय सीमा</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-background rounded-lg p-4 border border-border">
                    <p className="text-sm text-muted-foreground mb-1">छोटी त्रुटियां</p>
                    <p className="text-2xl font-bold text-primary">24 घंटे</p>
                    <p className="text-sm text-muted-foreground">के भीतर सुधार</p>
                  </div>
                  <div className="bg-background rounded-lg p-4 border border-border">
                    <p className="text-sm text-muted-foreground mb-1">जटिल मामले</p>
                    <p className="text-2xl font-bold text-primary">48-72 घंटे</p>
                    <p className="text-sm text-muted-foreground">जांच और सुधार</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">सुधार कैसे प्रदर्शित होते हैं</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                    <span>लेख के शीर्ष या अंत में स्पष्ट सुधार नोट जोड़ा जाता है।</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                    <span>सुधार की तारीख और समय स्पष्ट रूप से उल्लिखित होता है।</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                    <span>मूल त्रुटि और सही जानकारी दोनों का उल्लेख किया जाता है।</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                    <span>महत्वपूर्ण सुधारों के लिए होमपेज पर अलग से सूचना दी जा सकती है।</span>
                  </li>
                </ul>
              </div>

              <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                <h4 className="font-semibold text-foreground mb-2">महत्वपूर्ण नीति</h4>
                <p className="text-sm text-muted-foreground">
                  हम प्रकाशित सामग्री में बिना सूचना के कोई बदलाव नहीं करते। सभी संशोधनों को 
                  स्पष्ट रूप से चिह्नित किया जाता है। "चुपके से संपादन" (silent editing) की अनुमति नहीं है।
                </p>
              </div>
            </div>
          </section>

          {/* Transparency Commitment */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Eye className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">पारदर्शिता प्रतिबद्धता</h2>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  रामपुर न्यूज़ अपनी सुधार प्रक्रिया में पूर्ण पारदर्शिता बनाए रखता है:
                </p>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-primary text-sm font-bold">1</span>
                    </span>
                    <span>सभी सुधारों का सार्वजनिक रिकॉर्ड रखा जाता है।</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-primary text-sm font-bold">2</span>
                    </span>
                    <span>पाठक सुधार इतिहास देख सकते हैं।</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-primary text-sm font-bold">3</span>
                    </span>
                    <span>हम अपनी गलतियों से सीखते हैं और अपनी प्रक्रियाओं में सुधार करते हैं।</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-primary text-sm font-bold">4</span>
                    </span>
                    <span>बार-बार होने वाली त्रुटियों के पैटर्न की समीक्षा की जाती है।</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Contact for Corrections */}
          <section className="mb-12">
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">सुधार के लिए संपर्क करें</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">ईमेल</p>
                  <a href="mailto:corrections@rampurnews.com" className="text-primary hover:underline font-medium">
                    corrections@rampurnews.com
                  </a>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">संपादकीय प्रमुख</p>
                  <p className="text-foreground font-medium">मोहम्मद ज़ीशान रज़ा खान</p>
                  <p className="text-sm text-muted-foreground">फ़ोन: +91 9997877012</p>
                </div>
              </div>
            </div>
          </section>

          {/* Last Updated */}
          <div className="text-center text-sm text-muted-foreground">
            <p>अंतिम अपडेट: जनवरी 2025</p>
          </div>
        </main>
        
        <Footer />
      </div>
  );
};

export default CorrectionsPolicy;
