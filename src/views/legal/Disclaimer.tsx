"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AlertTriangle, ExternalLink, MessageSquare, Briefcase, Scale } from "lucide-react";

const Disclaimer = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
        
      <main className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="text-sm text-muted-foreground mb-6">
            <a href="/" className="hover:text-primary">होम</a>
            <span className="mx-2">/</span>
            <span className="text-foreground">अस्वीकरण</span>
          </nav>

          {/* Hero Section */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 md:p-12 mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              अस्वीकरण
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl">
              रामपुर न्यूज़ वेबसाइट का उपयोग करने से पहले कृपया इस अस्वीकरण को ध्यान से पढ़ें। 
              यह पृष्ठ हमारी सामग्री की प्रकृति और सीमाओं के बारे में महत्वपूर्ण जानकारी प्रदान करता है।
            </p>
          </div>

          {/* General Disclaimer */}
          <section className="mb-12">
            <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-3">सामान्य अस्वीकरण</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    रामपुर न्यूज़ पर प्रकाशित सामग्री केवल सूचनात्मक उद्देश्यों के लिए है। हम सामग्री की 
                    सटीकता, पूर्णता, या वर्तमानता की गारंटी नहीं देते हैं। इस वेबसाइट पर प्रकाशित 
                    जानकारी पर निर्भरता पूरी तरह से आपके अपने जोखिम पर है।
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* News Accuracy */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">समाचार सटीकता अस्वीकरण</h2>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                हम सटीक और विश्वसनीय समाचार रिपोर्टिंग के लिए प्रतिबद्ध हैं और हर संभव प्रयास करते हैं कि:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span>सभी तथ्यों को प्रकाशन से पहले सत्यापित किया जाए</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span>विश्वसनीय स्रोतों से जानकारी प्राप्त की जाए</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span>निष्पक्ष और संतुलित रिपोर्टिंग की जाए</span>
                </li>
              </ul>
              
              <div className="p-4 bg-muted/50 rounded-lg mt-4">
                <p className="text-sm text-muted-foreground">
                  <strong>हालांकि,</strong> पत्रकारिता की तेज़ गति वाली प्रकृति को देखते हुए, त्रुटियां 
                  संभव हैं। जब हमें त्रुटियों का पता चलता है, तो हम उन्हें तुरंत सुधारते हैं। हमारी 
                  <a href="/corrections-policy" className="text-primary hover:underline mx-1">सुधार नीति</a> 
                  देखें।
                </p>
              </div>

              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <h4 className="font-semibold text-foreground mb-2">ब्रेकिंग न्यूज़ के बारे में</h4>
                <p className="text-sm text-muted-foreground">
                  ब्रेकिंग न्यूज़ स्थितियों में, प्रारंभिक रिपोर्ट अधूरी या अस्थायी हो सकती है। 
                  जैसे-जैसे अधिक जानकारी उपलब्ध होती है, हम अपनी रिपोर्ट अपडेट करते हैं।
                </p>
              </div>
            </div>
          </section>

          {/* External Links */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <ExternalLink className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">बाहरी लिंक अस्वीकरण</h2>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                हमारी वेबसाइट में तृतीय-पक्ष वेबसाइटों के लिंक हो सकते हैं। इन लिंक के संबंध में:
              </p>
              
              <div className="space-y-4">
                <div className="p-4 bg-background rounded-lg border border-border">
                  <h4 className="font-semibold text-foreground mb-2">कोई समर्थन नहीं</h4>
                  <p className="text-sm text-muted-foreground">
                    बाहरी वेबसाइटों के लिंक प्रदान करना उन साइटों, उनकी सामग्री, उत्पादों, या सेवाओं 
                    का समर्थन या अनुशंसा नहीं है।
                  </p>
                </div>

                <div className="p-4 bg-background rounded-lg border border-border">
                  <h4 className="font-semibold text-foreground mb-2">कोई नियंत्रण नहीं</h4>
                  <p className="text-sm text-muted-foreground">
                    हमारा बाहरी वेबसाइटों की सामग्री, गोपनीयता नीतियों, या प्रथाओं पर कोई नियंत्रण नहीं है। 
                    हम इन साइटों की सामग्री के लिए जिम्मेदार नहीं हैं।
                  </p>
                </div>

                <div className="p-4 bg-background rounded-lg border border-border">
                  <h4 className="font-semibold text-foreground mb-2">उपयोगकर्ता जिम्मेदारी</h4>
                  <p className="text-sm text-muted-foreground">
                    बाहरी लिंक पर क्लिक करना और उन वेबसाइटों का उपयोग करना पूरी तरह से आपके अपने 
                    विवेक और जोखिम पर है। कृपया उन साइटों की शर्तों और गोपनीयता नीतियों की समीक्षा करें।
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Views and Opinions */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">विचार और राय</h2>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
                <h4 className="font-semibold text-foreground mb-2">राय लेख और संपादकीय</h4>
                <p className="text-sm text-muted-foreground">
                  "राय", "संपादकीय", या "विश्लेषण" के रूप में चिह्नित लेख लेखक के व्यक्तिगत विचारों 
                  और राय को दर्शाते हैं। ये आवश्यक रूप से रामपुर न्यूज़ का आधिकारिक दृष्टिकोण नहीं हैं 
                  जब तक कि स्पष्ट रूप से न कहा जाए।
                </p>
              </div>

              <div className="p-4 bg-background rounded-lg border border-border">
                <h4 className="font-semibold text-foreground mb-2">अतिथि योगदान</h4>
                <p className="text-sm text-muted-foreground">
                  अतिथि लेखकों या योगदानकर्ताओं द्वारा लिखे गए लेख उनके अपने विचारों को दर्शाते हैं। 
                  रामपुर न्यूज़ इन विचारों से सहमत या असहमत हो सकता है।
                </p>
              </div>

              <div className="p-4 bg-background rounded-lg border border-border">
                <h4 className="font-semibold text-foreground mb-2">टिप्पणियां और उपयोगकर्ता सामग्री</h4>
                <p className="text-sm text-muted-foreground">
                  पाठकों द्वारा की गई टिप्पणियां या प्रस्तुत की गई सामग्री उनके अपने विचारों को दर्शाती है। 
                  रामपुर न्यूज़ उपयोगकर्ता-जनित सामग्री के लिए जिम्मेदार नहीं है।
                </p>
              </div>
            </div>
          </section>

          {/* Professional Advice */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">पेशेवर सलाह नहीं</h2>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6">
              <p className="text-muted-foreground mb-6">
                रामपुर न्यूज़ पर प्रकाशित सामग्री पेशेवर सलाह का विकल्प नहीं है। विशेष रूप से:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-destructive/5 rounded-lg border border-destructive/20">
                  <h4 className="font-semibold text-foreground mb-2">कानूनी सलाह नहीं</h4>
                  <p className="text-sm text-muted-foreground">
                    हमारी सामग्री कानूनी सलाह नहीं है। कानूनी मामलों के लिए योग्य वकील से परामर्श लें।
                  </p>
                </div>
                
                <div className="p-4 bg-destructive/5 rounded-lg border border-destructive/20">
                  <h4 className="font-semibold text-foreground mb-2">चिकित्सा सलाह नहीं</h4>
                  <p className="text-sm text-muted-foreground">
                    स्वास्थ्य संबंधी जानकारी सामान्य जागरूकता के लिए है। चिकित्सा निर्णयों के लिए डॉक्टर से मिलें।
                  </p>
                </div>
                
                <div className="p-4 bg-destructive/5 rounded-lg border border-destructive/20">
                  <h4 className="font-semibold text-foreground mb-2">वित्तीय सलाह नहीं</h4>
                  <p className="text-sm text-muted-foreground">
                    निवेश या वित्तीय जानकारी सलाह नहीं है। वित्तीय निर्णयों के लिए प्रमाणित सलाहकार से मिलें।
                  </p>
                </div>
                
                <div className="p-4 bg-destructive/5 rounded-lg border border-destructive/20">
                  <h4 className="font-semibold text-foreground mb-2">शैक्षिक सलाह नहीं</h4>
                  <p className="text-sm text-muted-foreground">
                    शिक्षा संबंधी जानकारी मार्गदर्शन के लिए है। अंतिम निर्णय के लिए आधिकारिक स्रोतों से पुष्टि करें।
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Technical Disclaimer */}
          <section className="mb-12">
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">तकनीकी अस्वीकरण</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  हम वेबसाइट की निर्बाध उपलब्धता सुनिश्चित करने का प्रयास करते हैं, लेकिन हम गारंटी 
                  नहीं दे सकते कि:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2 shrink-0"></span>
                    <span>वेबसाइट हर समय उपलब्ध रहेगी</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2 shrink-0"></span>
                    <span>वेबसाइट त्रुटि-मुक्त होगी</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2 shrink-0"></span>
                    <span>वेबसाइट वायरस या अन्य हानिकारक घटकों से मुक्त होगी</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Scale className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">दायित्व की सीमा</h2>
            </div>
            
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
              <p className="text-muted-foreground leading-relaxed">
                कानून द्वारा अनुमत अधिकतम सीमा तक, रामपुर न्यूज़, इसके मालिक, कर्मचारी, या सहयोगी 
                वेबसाइट के उपयोग या इस पर प्रकाशित जानकारी पर निर्भरता से उत्पन्न होने वाली किसी भी 
                प्रत्यक्ष, अप्रत्यक्ष, आकस्मिक, विशेष, परिणामी, या अनुकरणीय क्षति के लिए उत्तरदायी नहीं होंगे।
              </p>
            </div>
          </section>

          {/* Changes to Disclaimer */}
          <section className="mb-12">
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">अस्वीकरण में परिवर्तन</h2>
              <p className="text-muted-foreground leading-relaxed">
                हम किसी भी समय इस अस्वीकरण को अपडेट करने का अधिकार सुरक्षित रखते हैं। परिवर्तन 
                इस पृष्ठ पर पोस्ट किए जाने पर तुरंत प्रभावी होंगे। समय-समय पर इस पृष्ठ की समीक्षा 
                करने की सलाह दी जाती है।
              </p>
            </div>
          </section>

          {/* Contact */}
          <section className="mb-12">
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">संपर्क</h2>
              <p className="text-muted-foreground mb-4">
                इस अस्वीकरण के बारे में किसी भी प्रश्न के लिए, कृपया संपर्क करें:
              </p>
              <p className="text-muted-foreground">
                <strong>ईमेल:</strong> <a href="mailto:legal@rampurnews.com" className="text-primary hover:underline">legal@rampurnews.com</a>
              </p>
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

export default Disclaimer;
