"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FileText, Search, Shield, Users, Tag, CheckCircle } from "lucide-react";

const EditorialPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
        
      <main className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="text-sm text-muted-foreground mb-6">
            <a href="/" className="hover:text-primary">होम</a>
            <span className="mx-2">/</span>
            <span className="text-foreground">संपादकीय नीति</span>
          </nav>

          {/* Hero Section */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 md:p-12 mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              संपादकीय नीति
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl">
              रामपुर न्यूज़ सत्य, निष्पक्षता और जिम्मेदार पत्रकारिता के सिद्धांतों पर आधारित है। 
              यह दस्तावेज़ हमारी संपादकीय प्रक्रियाओं और मानकों का विवरण प्रस्तुत करता है।
            </p>
          </div>

          {/* News Sourcing Standards */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Search className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">समाचार स्रोत मानक</h2>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">प्राथमिक स्रोत सत्यापन</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span>सभी समाचारों के लिए प्राथमिक स्रोतों से सीधे सत्यापन अनिवार्य है।</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span>आधिकारिक दस्तावेजों, प्रेस विज्ञप्तियों और सरकारी घोषणाओं को प्राथमिकता दी जाती है।</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span>प्रत्यक्षदर्शी गवाहों और संबंधित पक्षों से बात करना आवश्यक है।</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">बहु-स्रोत पुष्टि</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span>संवेदनशील या विवादास्पद समाचारों के लिए कम से कम दो स्वतंत्र स्रोतों से पुष्टि आवश्यक है।</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span>आरोपों वाली खबरों में संबंधित पक्ष का पक्ष लेना अनिवार्य है।</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span>सोशल मीडिया से प्राप्त जानकारी की स्वतंत्र पुष्टि की जाती है।</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">गुमनाम स्रोत दिशानिर्देश</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span>गुमनाम स्रोतों का उपयोग केवल विशेष परिस्थितियों में किया जाता है।</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span>गुमनामी प्रदान करने का निर्णय संपादक की स्वीकृति से होता है।</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span>स्रोत की पहचान संपादकीय टीम के पास सुरक्षित रहती है।</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Fact-Checking Process */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">तथ्य-जांच प्रक्रिया</h2>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6">
              <p className="text-muted-foreground mb-6">
                रामपुर न्यूज़ में प्रत्येक समाचार प्रकाशन से पहले तीन-स्तरीय तथ्य-जांच प्रक्रिया से गुजरता है:
              </p>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-background rounded-lg p-4 border border-border">
                  <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold mb-3">1</div>
                  <h3 className="font-semibold text-foreground mb-2">रिपोर्टर सत्यापन</h3>
                  <p className="text-sm text-muted-foreground">
                    रिपोर्टर अपने स्रोतों और तथ्यों की प्राथमिक जांच करता है।
                  </p>
                </div>
                
                <div className="bg-background rounded-lg p-4 border border-border">
                  <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold mb-3">2</div>
                  <h3 className="font-semibold text-foreground mb-2">डेस्क समीक्षा</h3>
                  <p className="text-sm text-muted-foreground">
                    संपादकीय डेस्क द्वारा तथ्यों, आंकड़ों और उद्धरणों की पुनः जांच।
                  </p>
                </div>
                
                <div className="bg-background rounded-lg p-4 border border-border">
                  <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold mb-3">3</div>
                  <h3 className="font-semibold text-foreground mb-2">अंतिम स्वीकृति</h3>
                  <p className="text-sm text-muted-foreground">
                    संपादक द्वारा अंतिम समीक्षा और प्रकाशन की स्वीकृति।
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <h4 className="font-semibold text-foreground mb-2">स्रोत उद्धरण आवश्यकताएं</h4>
                <p className="text-sm text-muted-foreground">
                  सभी समाचारों में स्रोत का स्पष्ट उल्लेख होना चाहिए। आधिकारिक बयानों के लिए व्यक्ति का नाम और पद, 
                  दस्तावेजों के लिए दस्तावेज़ का प्रकार और तिथि, और अन्य मीडिया स्रोतों के लिए उचित श्रेय दिया जाता है।
                </p>
              </div>
            </div>
          </section>

          {/* Editorial Independence */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">संपादकीय स्वतंत्रता</h2>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">राजनीतिक और व्यावसायिक स्वतंत्रता</h3>
                <p className="text-muted-foreground leading-relaxed">
                  रामपुर न्यूज़ की संपादकीय टीम किसी भी राजनीतिक दल, सरकार, कॉर्पोरेट समूह या विज्ञापनदाता के 
                  दबाव से पूर्णतः मुक्त है। समाचार कवरेज के निर्णय केवल समाचार मूल्य और जनहित के आधार पर लिए जाते हैं।
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">संपादकीय और व्यावसायिक विभाजन</h3>
                <p className="text-muted-foreground leading-relaxed">
                  संपादकीय विभाग और व्यावसायिक/विज्ञापन विभाग पूर्णतः अलग हैं। विज्ञापनदाताओं या प्रायोजकों का 
                  संपादकीय निर्णयों पर कोई प्रभाव नहीं है। विज्ञापन बिक्री टीम को संपादकीय सामग्री पर प्रभाव 
                  डालने की अनुमति नहीं है।
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">हितों का टकराव</h3>
                <p className="text-muted-foreground leading-relaxed">
                  संपादकीय टीम के सदस्यों को उन विषयों पर रिपोर्ट करने से बचना चाहिए जिनमें उनके व्यक्तिगत या 
                  वित्तीय हित हों। किसी भी संभावित हितों के टकराव की जानकारी संपादक को दी जानी चाहिए।
                </p>
              </div>
            </div>
          </section>

          {/* Content Classification */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Tag className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">सामग्री वर्गीकरण</h2>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6">
              <p className="text-muted-foreground mb-6">
                रामपुर न्यूज़ पर प्रकाशित सभी सामग्री को स्पष्ट रूप से वर्गीकृत किया जाता है:
              </p>
              
              <div className="space-y-4">
                <div className="p-4 bg-background rounded-lg border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded">समाचार</span>
                    <h3 className="font-semibold text-foreground">समाचार (News)</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    तथ्य-आधारित, निष्पक्ष रिपोर्टिंग। इसमें रिपोर्टर की व्यक्तिगत राय शामिल नहीं होती। 
                    सभी तथ्यों को सत्यापित स्रोतों से प्राप्त किया जाता है।
                  </p>
                </div>

                <div className="p-4 bg-background rounded-lg border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-secondary text-secondary-foreground text-xs font-semibold rounded">विश्लेषण</span>
                    <h3 className="font-semibold text-foreground">विश्लेषण (Analysis)</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    तथ्यों के साथ विशेषज्ञ व्याख्या। लेखक का नाम और विशेषज्ञता स्पष्ट रूप से उल्लिखित होती है।
                  </p>
                </div>

                <div className="p-4 bg-background rounded-lg border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-accent text-accent-foreground text-xs font-semibold rounded">राय</span>
                    <h3 className="font-semibold text-foreground">राय/संपादकीय (Opinion/Editorial)</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    लेखक की व्यक्तिगत राय। यह संगठन का आधिकारिक दृष्टिकोण नहीं है जब तक कि स्पष्ट रूप से न कहा जाए।
                  </p>
                </div>

                <div className="p-4 bg-background rounded-lg border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-destructive text-destructive-foreground text-xs font-semibold rounded">प्रायोजित</span>
                    <h3 className="font-semibold text-foreground">प्रायोजित सामग्री (Sponsored Content)</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    भुगतान प्राप्त सामग्री। इसे हमेशा "प्रायोजित", "विज्ञापन" या "भागीदारी में" के रूप में 
                    स्पष्ट रूप से चिह्नित किया जाता है। प्रायोजक का नाम हमेशा प्रकट किया जाता है।
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Editor Information */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">संपादकीय जिम्मेदारी</h2>
            </div>
            
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
              <p className="text-muted-foreground mb-4">
                रामपुर न्यूज़ पर प्रकाशित सभी सामग्री की अंतिम जिम्मेदारी संपादकीय प्रमुख की है:
              </p>
              <div className="bg-card rounded-lg p-4 border border-border">
                <h3 className="font-bold text-foreground mb-1">मोहम्मद ज़ीशान रज़ा खान</h3>
                <p className="text-primary text-sm mb-2">संपादकीय प्रमुख (Editor-in-Chief)</p>
                <p className="text-sm text-muted-foreground">
                  ईमेल: editor@rampurnews.com<br />
                  फ़ोन: +91 9997877012
                </p>
              </div>
            </div>
          </section>

          {/* Last Updated */}
          <div className="text-center text-sm text-muted-foreground">
            <p>अंतिम अपडेट: जनवरी 2025</p>
            <p className="mt-2">
              इस नीति के बारे में प्रश्नों के लिए, कृपया <a href="/contact" className="text-primary hover:underline">संपर्क करें</a>।
            </p>
          </div>
        </main>
        
        <Footer />
      </div>
  );
};

export default EditorialPolicy;
