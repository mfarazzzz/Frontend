"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Building, Users, Wallet, Shield, AlertTriangle } from "lucide-react";

const OwnershipDisclosure = () => {
  return (
    <>
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="text-sm text-muted-foreground mb-6">
            <a href="/" className="hover:text-primary">होम</a>
            <span className="mx-2">/</span>
            <span className="text-foreground">स्वामित्व और वित्तीय प्रकटीकरण</span>
          </nav>

          {/* Hero Section */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 md:p-12 mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              स्वामित्व और वित्तीय प्रकटीकरण
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl">
              रामपुर न्यूज़ पारदर्शिता के प्रति प्रतिबद्ध है। यह पृष्ठ हमारे स्वामित्व, वित्तीय संरचना और 
              संपादकीय स्वतंत्रता के बारे में पूरी जानकारी प्रदान करता है।
            </p>
          </div>

          {/* Ownership Details */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Building className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">स्वामित्व विवरण</h2>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">कानूनी स्थिति</h3>
                <p className="text-muted-foreground leading-relaxed">
                  रामपुर न्यूज़ एक <strong>निजी स्वामित्व वाला, स्वतंत्र रूप से संचालित डिजिटल समाचार संगठन</strong> है। 
                  यह किसी भी राजनीतिक दल, सरकारी संस्था, या बड़े कॉर्पोरेट समूह से संबद्ध नहीं है।
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">मुख्य पता</h3>
                <div className="bg-background rounded-lg p-4 border border-border">
                  <p className="text-muted-foreground">
                    ऑफ मेन रोड, जिला सहकारी बैंक लि. के सामने,<br />
                    मिलक, रामपुर, उत्तर प्रदेश, भारत - 243701
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Founding Members */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">संस्थापक और प्रबंधन टीम</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-primary">फ़</span>
                </div>
                <h3 className="text-lg font-bold text-foreground text-center mb-1">
                  मोहम्मद फ़राज़ रज़ा खान
                </h3>
                <p className="text-primary text-center text-sm mb-3">संस्थापक एवं प्रकाशक</p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><strong>पेशा:</strong> इंजीनियर एवं टेक लीड</p>
                  <p><strong>जिम्मेदारी:</strong> बिज़नेस ग्रोथ, रणनीति, विज्ञापन और मार्केटिंग</p>
                  <p><strong>फ़ोन:</strong> +91 8077848980</p>
                </div>
              </div>
              
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-primary">ज़</span>
                </div>
                <h3 className="text-lg font-bold text-foreground text-center mb-1">
                  मोहम्मद ज़ीशान रज़ा खान
                </h3>
                <p className="text-primary text-center text-sm mb-3">संपादकीय प्रमुख</p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><strong>पेशा:</strong> पत्रकार एवं समाज सेवी</p>
                  <p><strong>जिम्मेदारी:</strong> कंटेंट, रिपोर्टिंग, सेल्स और राजस्व</p>
                  <p><strong>फ़ोन:</strong> +91 9997877012</p>
                </div>
              </div>
              
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-primary">द</span>
                </div>
                <h3 className="text-lg font-bold text-foreground text-center mb-1">
                  मोहम्मद दानिश रज़ा खान
                </h3>
                <p className="text-primary text-center text-sm mb-3">कानूनी एवं सलाहकार प्रमुख</p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><strong>पेशा:</strong> वकील एवं समाज सेवी</p>
                  <p><strong>जिम्मेदारी:</strong> कानूनी, सलाहकार, कॉर्पोरेट और सरकारी साझेदारी</p>
                  <p><strong>फ़ोन:</strong> +91 9997929196</p>
                </div>
              </div>
            </div>
          </section>

          {/* Financial Disclosure */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">वित्तीय प्रकटीकरण</h2>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">राजस्व स्रोत</h3>
                <p className="text-muted-foreground mb-4">
                  रामपुर न्यूज़ की आय निम्नलिखित स्रोतों से होती है:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-background rounded-lg p-4 border border-border">
                    <h4 className="font-semibold text-foreground mb-2">1. डिजिटल विज्ञापन</h4>
                    <p className="text-sm text-muted-foreground">
                      Google AdSense और अन्य विज्ञापन नेटवर्क के माध्यम से प्रदर्शित विज्ञापनों से आय। 
                      ये विज्ञापन स्वचालित रूप से प्रदर्शित होते हैं और संपादकीय सामग्री से अलग होते हैं।
                    </p>
                  </div>
                  
                  <div className="bg-background rounded-lg p-4 border border-border">
                    <h4 className="font-semibold text-foreground mb-2">2. प्रायोजित सामग्री</h4>
                    <p className="text-sm text-muted-foreground">
                      व्यवसायों और संगठनों के लिए प्रायोजित लेख और सामग्री। इन्हें हमेशा 
                      "प्रायोजित" या "विज्ञापन" के रूप में स्पष्ट रूप से चिह्नित किया जाता है।
                    </p>
                  </div>
                  
                  <div className="bg-background rounded-lg p-4 border border-border">
                    <h4 className="font-semibold text-foreground mb-2">3. स्थानीय व्यापार साझेदारी</h4>
                    <p className="text-sm text-muted-foreground">
                      रामपुर और आसपास के स्थानीय व्यवसायों के साथ विज्ञापन और प्रचार साझेदारी।
                    </p>
                  </div>
                  
                  <div className="bg-background rounded-lg p-4 border border-border">
                    <h4 className="font-semibold text-foreground mb-2">4. इवेंट और सहयोग</h4>
                    <p className="text-sm text-muted-foreground">
                      सामुदायिक कार्यक्रमों और सहयोग परियोजनाओं से सीमित आय।
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* No Political/Foreign Funding */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">कोई छिपी हुई फंडिंग नहीं</h2>
            </div>
            
            <div className="space-y-4">
              <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">राजनीतिक फंडिंग</h3>
                <p className="text-muted-foreground">
                  रामपुर न्यूज़ किसी भी राजनीतिक दल, राजनेता, या राजनीतिक संगठन से कोई वित्तीय सहायता, 
                  दान, या अनुदान प्राप्त नहीं करता है। हमारी संपादकीय स्वतंत्रता पूर्णतः सुरक्षित है।
                </p>
              </div>
              
              <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">विदेशी फंडिंग</h3>
                <p className="text-muted-foreground">
                  हम किसी भी विदेशी सरकार, विदेशी संगठन, या विदेशी निवेशक से कोई वित्तीय सहायता 
                  प्राप्त नहीं करते हैं। रामपुर न्यूज़ पूर्णतः भारतीय स्वामित्व और वित्तपोषित संगठन है।
                </p>
              </div>
              
              <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">सरकारी अनुदान</h3>
                <p className="text-muted-foreground">
                  हम किसी भी केंद्र या राज्य सरकार से कोई विज्ञापन अनुबंध, अनुदान, या वित्तीय सहायता 
                  प्राप्त नहीं करते हैं जो हमारी संपादकीय स्वतंत्रता को प्रभावित कर सके।
                </p>
              </div>
            </div>
          </section>

          {/* Editorial Independence */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">संपादकीय स्वतंत्रता वक्तव्य</h2>
            </div>
            
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
              <p className="text-muted-foreground leading-relaxed mb-4">
                रामपुर न्यूज़ में संपादकीय निर्णय पूर्णतः संपादकीय टीम द्वारा लिए जाते हैं और ये 
                किसी भी विज्ञापनदाता, प्रायोजक, या बाहरी पक्ष से प्रभावित नहीं होते।
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span>विज्ञापनदाता संपादकीय सामग्री को प्रभावित नहीं कर सकते।</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span>प्रायोजित सामग्री को हमेशा स्पष्ट रूप से चिह्नित किया जाता है।</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span>समाचार कवरेज के निर्णय समाचार मूल्य और जनहित के आधार पर होते हैं।</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span>संपादकीय और व्यावसायिक विभाग अलग-अलग संचालित होते हैं।</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Transparency Commitment */}
          <section className="mb-12">
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">पारदर्शिता प्रतिबद्धता</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                यदि भविष्य में हमारे स्वामित्व, वित्तीय संरचना, या प्रमुख साझेदारियों में कोई महत्वपूर्ण 
                परिवर्तन होता है, तो हम इस पृष्ठ को अपडेट करेंगे और अपने पाठकों को सूचित करेंगे।
              </p>
              <p className="text-muted-foreground leading-relaxed">
                स्वामित्व या वित्तीय मामलों के बारे में किसी भी प्रश्न के लिए, कृपया हमसे 
                <a href="mailto:legal@rampurnews.com" className="text-primary hover:underline mx-1">legal@rampurnews.com</a> 
                पर संपर्क करें।
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
    </>
  );
};

export default OwnershipDisclosure;
