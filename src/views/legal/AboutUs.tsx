"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Users, Target, Heart, Shield, Phone, Mail, MapPin } from "lucide-react";

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
        
      <main className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="text-sm text-muted-foreground mb-6">
            <a href="/" className="hover:text-primary">होम</a>
            <span className="mx-2">/</span>
            <span className="text-foreground">हमारे बारे में</span>
          </nav>

          {/* Hero Section */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 md:p-12 mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              हमारे बारे में
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl">
              रामपुर न्यूज़ उत्तर प्रदेश के रामपुर जिले और आसपास के क्षेत्रों का एक स्वतंत्र डिजिटल समाचार पोर्टल है, 
              जो सत्य, निष्पक्ष और जिम्मेदार पत्रकारिता के प्रति प्रतिबद्ध है।
            </p>
          </div>

          {/* Mission & Vision */}
          <section className="mb-12">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">हमारा मिशन</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  रामपुर और उत्तर प्रदेश के नागरिकों को सटीक, समय पर और विश्वसनीय समाचार प्रदान करना। 
                  हम स्थानीय मुद्दों पर गहन रिपोर्टिंग के माध्यम से समुदाय को सशक्त बनाने और 
                  लोकतांत्रिक मूल्यों को मजबूत करने के लिए प्रतिबद्ध हैं।
                </p>
              </div>
              
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Heart className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">हमारी दृष्टि</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  रामपुर न्यूज़ को उत्तर प्रदेश का सबसे भरोसेमंद और प्रभावशाली स्थानीय समाचार स्रोत बनाना। 
                  हम डिजिटल पत्रकारिता में उत्कृष्टता के नए मानक स्थापित करना चाहते हैं जो 
                  पारदर्शिता, जवाबदेही और जनहित को सर्वोपरि रखे।
                </p>
              </div>
            </div>
          </section>

          {/* Our Story */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">हमारी कहानी</h2>
            <div className="bg-card border border-border rounded-xl p-6">
              <p className="text-muted-foreground leading-relaxed mb-4">
                रामपुर न्यूज़ की स्थापना रामपुर के तीन भाइयों - मोहम्मद फराज़ रज़ा खान, मोहम्मद ज़ीशान रज़ा खान 
                और मोहम्मद दानिश रज़ा खान ने की। इन तीनों ने अपने-अपने क्षेत्रों में विशेषज्ञता हासिल की है - 
                तकनीक, पत्रकारिता और कानून - और इन सभी कौशलों को मिलाकर एक विश्वसनीय समाचार मंच बनाया है।
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                हमने देखा कि रामपुर और आसपास के क्षेत्रों में विश्वसनीय स्थानीय समाचारों की कमी है। 
                बड़े मीडिया घरानों का ध्यान अक्सर महानगरों पर केंद्रित रहता है, जिससे छोटे शहरों और 
                ग्रामीण क्षेत्रों की खबरें अनदेखी रह जाती हैं।
              </p>
              <p className="text-muted-foreground leading-relaxed">
                रामपुर न्यूज़ इसी कमी को पूरा करने के लिए बनाया गया - एक ऐसा मंच जो स्थानीय समुदाय की आवाज़ बने, 
                उनकी समस्याओं को उजागर करे और सकारात्मक बदलाव लाने में सहायक हो।
              </p>
            </div>
          </section>

          {/* Our Values */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">हमारे मूल्य</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-card border border-border rounded-xl p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-2">सत्यनिष्ठा</h3>
                <p className="text-sm text-muted-foreground">
                  हम केवल सत्यापित और तथ्य-आधारित समाचार प्रकाशित करते हैं
                </p>
              </div>
              
              <div className="bg-card border border-border rounded-xl p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-2">निष्पक्षता</h3>
                <p className="text-sm text-muted-foreground">
                  हम किसी भी राजनीतिक या व्यावसायिक दबाव से मुक्त हैं
                </p>
              </div>
              
              <div className="bg-card border border-border rounded-xl p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-2">जवाबदेही</h3>
                <p className="text-sm text-muted-foreground">
                  हम अपनी गलतियों को स्वीकार करते हैं और सुधार करते हैं
                </p>
              </div>
              
              <div className="bg-card border border-border rounded-xl p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-2">सामुदायिक सेवा</h3>
                <p className="text-sm text-muted-foreground">
                  हम समुदाय के हित को सर्वोपरि मानते हैं
                </p>
              </div>
            </div>
          </section>

          {/* Our Team */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">हमारी टीम</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">फ़</span>
                </div>
                <h3 className="text-xl font-bold text-foreground text-center mb-1">
                  मोहम्मद फ़राज़ रज़ा खान
                </h3>
                <p className="text-primary text-center text-sm mb-3">संस्थापक एवं प्रकाशक</p>
                <p className="text-muted-foreground text-sm text-center mb-4">
                  इंजीनियर एवं टेक लीड। बिज़नेस ग्रोथ, रणनीति, विज्ञापन और मार्केटिंग के विशेषज्ञ।
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>8077848980</span>
                </div>
              </div>
              
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">ज़</span>
                </div>
                <h3 className="text-xl font-bold text-foreground text-center mb-1">
                  मोहम्मद ज़ीशान रज़ा खान
                </h3>
                <p className="text-primary text-center text-sm mb-3">संपादकीय प्रमुख</p>
                <p className="text-muted-foreground text-sm text-center mb-4">
                  पत्रकार एवं समाज सेवी। कंटेंट, रिपोर्टिंग, सेल्स और राजस्व के विशेषज्ञ।
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>9997877012</span>
                </div>
              </div>
              
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">द</span>
                </div>
                <h3 className="text-xl font-bold text-foreground text-center mb-1">
                  मोहम्मद दानिश रज़ा खान
                </h3>
                <p className="text-primary text-center text-sm mb-3">कानूनी एवं सलाहकार प्रमुख</p>
                <p className="text-muted-foreground text-sm text-center mb-4">
                  वकील एवं समाज सेवी। कानूनी, सलाहकार, कॉर्पोरेट और सरकारी साझेदारी के विशेषज्ञ।
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>9997929196</span>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Info */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">संपर्क जानकारी</h2>
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">कार्यालय पता</h3>
                    <p className="text-muted-foreground text-sm">
                      ऑफ मेन रोड, जिला सहकारी बैंक लि. के सामने,<br />
                      मिलक, रामपुर, उत्तर प्रदेश, भारत - 243701
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">फ़ोन नंबर</h3>
                    <p className="text-muted-foreground text-sm">
                      +91 9997877012<br />
                      +91 9997929196<br />
                      +91 8077848980
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">ईमेल</h3>
                    <p className="text-muted-foreground text-sm">
                      contact@rampurnews.com<br />
                      editor@rampurnews.com
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Ownership Statement */}
          <section className="mb-12">
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">स्वामित्व वक्तव्य</h2>
              <p className="text-muted-foreground leading-relaxed">
                रामपुर न्यूज़ एक निजी स्वामित्व वाला, स्वतंत्र रूप से संचालित डिजिटल समाचार संगठन है। 
                हमारी कोई राजनीतिक संबद्धता नहीं है और हम किसी भी राजनीतिक दल, सरकार या कॉर्पोरेट समूह से 
                वित्तीय सहायता प्राप्त नहीं करते हैं। हमारी आय का प्राथमिक स्रोत डिजिटल विज्ञापन और 
                प्रायोजित सामग्री है, जिसे हम हमेशा स्पष्ट रूप से चिह्नित करते हैं।
              </p>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
  );
};

export default AboutUs;
