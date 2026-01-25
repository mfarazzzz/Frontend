"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Shield, Database, Cookie, Share2, UserCheck, Mail } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
        
      <main className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="text-sm text-muted-foreground mb-6">
            <a href="/" className="hover:text-primary">होम</a>
            <span className="mx-2">/</span>
            <span className="text-foreground">गोपनीयता नीति</span>
          </nav>

          {/* Hero Section */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 md:p-12 mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              गोपनीयता नीति
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl">
              रामपुर न्यूज़ आपकी गोपनीयता का सम्मान करता है। यह नीति बताती है कि हम आपकी व्यक्तिगत जानकारी 
              को कैसे एकत्र, उपयोग और सुरक्षित रखते हैं।
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              प्रभावी तिथि: 1 जनवरी 2025
            </p>
          </div>

          {/* Introduction */}
          <section className="mb-12">
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">परिचय</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                रामपुर न्यूज़ (इसके बाद "हम", "हमारा", या "वेबसाइट") rampurnews.com पर संचालित होता है। 
                यह गोपनीयता नीति बताती है कि जब आप हमारी वेबसाइट का उपयोग करते हैं तो हम आपकी जानकारी 
                को कैसे एकत्र, उपयोग, संग्रहीत और सुरक्षित करते हैं।
              </p>
              <p className="text-muted-foreground leading-relaxed">
                हमारी वेबसाइट का उपयोग करके, आप इस गोपनीयता नीति की शर्तों से सहमत होते हैं। 
                यदि आप इन शर्तों से सहमत नहीं हैं, तो कृपया हमारी वेबसाइट का उपयोग न करें।
              </p>
            </div>
          </section>

          {/* Data Collection */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Database className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">डेटा संग्रह</h2>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">स्वचालित रूप से एकत्रित जानकारी</h3>
                <p className="text-muted-foreground mb-3">
                  जब आप हमारी वेबसाइट पर आते हैं, तो हम स्वचालित रूप से निम्नलिखित जानकारी एकत्र कर सकते हैं:
                </p>
                <ul className="space-y-2 text-muted-foreground text-sm">
                  <li>• IP पता और भौगोलिक स्थान (शहर/राज्य स्तर)</li>
                  <li>• ब्राउज़र प्रकार और संस्करण</li>
                  <li>• ऑपरेटिंग सिस्टम</li>
                  <li>• रेफरल URL (आप कहाँ से आए)</li>
                  <li>• देखे गए पृष्ठ और समय</li>
                  <li>• डिवाइस की जानकारी (मोबाइल/डेस्कटॉप)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">आपके द्वारा प्रदान की गई जानकारी</h3>
                <p className="text-muted-foreground mb-3">
                  जब आप स्वेच्छा से हमें जानकारी प्रदान करते हैं:
                </p>
                <ul className="space-y-2 text-muted-foreground text-sm">
                  <li>• <strong>न्यूज़लेटर सदस्यता:</strong> ईमेल पता</li>
                  <li>• <strong>संपर्क फ़ॉर्म:</strong> नाम, ईमेल, फ़ोन नंबर, संदेश</li>
                  <li>• <strong>टिप्पणियां:</strong> नाम, ईमेल (यदि टिप्पणी प्रणाली सक्षम हो)</li>
                  <li>• <strong>शिकायत:</strong> नाम, संपर्क जानकारी, शिकायत विवरण</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">जानकारी का उपयोग</h3>
                <p className="text-muted-foreground mb-3">हम एकत्रित जानकारी का उपयोग करते हैं:</p>
                <ul className="space-y-2 text-muted-foreground text-sm">
                  <li>• वेबसाइट को संचालित और बेहतर बनाने के लिए</li>
                  <li>• आपको अनुरोधित सेवाएं प्रदान करने के लिए (न्यूज़लेटर, प्रतिक्रिया)</li>
                  <li>• वेबसाइट ट्रैफ़िक और उपयोग पैटर्न का विश्लेषण करने के लिए</li>
                  <li>• विज्ञापन प्रासंगिकता सुधारने के लिए</li>
                  <li>• कानूनी आवश्यकताओं का पालन करने के लिए</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Cookies */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Cookie className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">कुकीज़ और ट्रैकिंग</h2>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6 space-y-6">
              <p className="text-muted-foreground">
                हमारी वेबसाइट कुकीज़ और समान ट्रैकिंग तकनीकों का उपयोग करती है। कुकीज़ छोटी टेक्स्ट फ़ाइलें 
                हैं जो आपके ब्राउज़र में संग्रहीत होती हैं।
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-background rounded-lg p-4 border border-border">
                  <h4 className="font-semibold text-foreground mb-2">आवश्यक कुकीज़</h4>
                  <p className="text-sm text-muted-foreground">
                    वेबसाइट के बुनियादी संचालन के लिए आवश्यक। इन्हें बंद नहीं किया जा सकता।
                  </p>
                </div>
                
                <div className="bg-background rounded-lg p-4 border border-border">
                  <h4 className="font-semibold text-foreground mb-2">विश्लेषण कुकीज़</h4>
                  <p className="text-sm text-muted-foreground">
                    Google Analytics के लिए। वेबसाइट उपयोग को समझने में मदद करती हैं।
                  </p>
                </div>
                
                <div className="bg-background rounded-lg p-4 border border-border">
                  <h4 className="font-semibold text-foreground mb-2">विज्ञापन कुकीज़</h4>
                  <p className="text-sm text-muted-foreground">
                    Google AdSense और अन्य विज्ञापन भागीदारों द्वारा। प्रासंगिक विज्ञापन दिखाने के लिए।
                  </p>
                </div>
                
                <div className="bg-background rounded-lg p-4 border border-border">
                  <h4 className="font-semibold text-foreground mb-2">सोशल मीडिया कुकीज़</h4>
                  <p className="text-sm text-muted-foreground">
                    सोशल शेयरिंग बटन और एम्बेड के लिए।
                  </p>
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">कुकीज़ प्रबंधित करें</h4>
                <p className="text-sm text-muted-foreground">
                  आप अपने ब्राउज़र सेटिंग्स में कुकीज़ को अक्षम या हटा सकते हैं। हालांकि, इससे 
                  वेबसाइट की कुछ कार्यक्षमता प्रभावित हो सकती है।
                </p>
              </div>
            </div>
          </section>

          {/* Third-Party Services */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Share2 className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">तृतीय-पक्ष सेवाएं</h2>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <p className="text-muted-foreground">
                हम निम्नलिखित तृतीय-पक्ष सेवाओं का उपयोग करते हैं जो अपनी गोपनीयता नीतियों के 
                अनुसार डेटा एकत्र कर सकती हैं:
              </p>
              
              <div className="space-y-4">
                <div className="p-4 bg-background rounded-lg border border-border">
                  <h4 className="font-semibold text-foreground mb-2">Google Analytics</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    वेबसाइट ट्रैफ़िक और उपयोगकर्ता व्यवहार का विश्लेषण।
                  </p>
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" 
                     className="text-primary text-sm hover:underline">
                    Google गोपनीयता नीति →
                  </a>
                </div>

                <div className="p-4 bg-background rounded-lg border border-border">
                  <h4 className="font-semibold text-foreground mb-2">Google AdSense</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    विज्ञापन प्रदर्शन। व्यक्तिगत विज्ञापनों के लिए डेटा का उपयोग कर सकता है।
                  </p>
                  <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" 
                     className="text-primary text-sm hover:underline">
                    Google विज्ञापन नीति →
                  </a>
                </div>

                <div className="p-4 bg-background rounded-lg border border-border">
                  <h4 className="font-semibold text-foreground mb-2">सोशल मीडिया प्लेटफ़ॉर्म</h4>
                  <p className="text-sm text-muted-foreground">
                    Facebook, Twitter, WhatsApp, YouTube - शेयरिंग बटन और एम्बेड के लिए। 
                    प्रत्येक प्लेटफ़ॉर्म की अपनी गोपनीयता नीति है।
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* User Rights */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">आपके अधिकार</h2>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6">
              <p className="text-muted-foreground mb-4">
                भारतीय सूचना प्रौद्योगिकी अधिनियम 2000 और संबंधित नियमों के तहत, आपके पास 
                निम्नलिखित अधिकार हैं:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-background rounded-lg border border-border">
                  <h4 className="font-semibold text-foreground mb-2">पहुंच का अधिकार</h4>
                  <p className="text-sm text-muted-foreground">
                    आप अनुरोध कर सकते हैं कि हम आपके बारे में कौन सी जानकारी रखते हैं।
                  </p>
                </div>
                
                <div className="p-4 bg-background rounded-lg border border-border">
                  <h4 className="font-semibold text-foreground mb-2">सुधार का अधिकार</h4>
                  <p className="text-sm text-muted-foreground">
                    आप गलत या अधूरी जानकारी को सुधारने का अनुरोध कर सकते हैं।
                  </p>
                </div>
                
                <div className="p-4 bg-background rounded-lg border border-border">
                  <h4 className="font-semibold text-foreground mb-2">हटाने का अधिकार</h4>
                  <p className="text-sm text-muted-foreground">
                    आप अपनी व्यक्तिगत जानकारी को हटाने का अनुरोध कर सकते हैं।
                  </p>
                </div>
                
                <div className="p-4 bg-background rounded-lg border border-border">
                  <h4 className="font-semibold text-foreground mb-2">सहमति वापस लेना</h4>
                  <p className="text-sm text-muted-foreground">
                    आप किसी भी समय न्यूज़लेटर या अन्य संचार से सदस्यता रद्द कर सकते हैं।
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-sm text-muted-foreground">
                  इन अधिकारों का प्रयोग करने के लिए, कृपया 
                  <a href="mailto:privacy@rampurnews.com" className="text-primary hover:underline mx-1">privacy@rampurnews.com</a> 
                  पर संपर्क करें। हम 30 दिनों के भीतर आपके अनुरोध का जवाब देंगे।
                </p>
              </div>
            </div>
          </section>

          {/* Data Security */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">डेटा सुरक्षा</h2>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6">
              <p className="text-muted-foreground leading-relaxed mb-4">
                हम आपकी व्यक्तिगत जानकारी की सुरक्षा के लिए उचित तकनीकी और संगठनात्मक उपाय करते हैं:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span>SSL/TLS एन्क्रिप्शन (HTTPS) का उपयोग</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span>सुरक्षित सर्वर और होस्टिंग वातावरण</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span>सीमित डेटा पहुंच (केवल आवश्यक कर्मचारी)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span>नियमित सुरक्षा समीक्षा</span>
                </li>
              </ul>
            </div>
          </section>

          {/* IT Act Compliance */}
          <section className="mb-12">
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">
                भारतीय सूचना प्रौद्योगिकी अधिनियम 2000 अनुपालन
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                रामपुर न्यूज़ भारतीय सूचना प्रौद्योगिकी अधिनियम 2000 और सूचना प्रौद्योगिकी 
                (उचित सुरक्षा अभ्यास और प्रक्रियाएं तथा संवेदनशील व्यक्तिगत डेटा या जानकारी) नियम 2011 
                का पालन करता है।
              </p>
              <p className="text-muted-foreground leading-relaxed">
                शिकायत अधिकारी: <strong>मोहम्मद दानिश रज़ा खान</strong><br />
                ईमेल: <a href="mailto:grievance@rampurnews.com" className="text-primary hover:underline">grievance@rampurnews.com</a><br />
                फ़ोन: +91 9997929196
              </p>
            </div>
          </section>

          {/* Contact */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">संपर्क करें</h2>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6">
              <p className="text-muted-foreground mb-4">
                इस गोपनीयता नीति के बारे में किसी भी प्रश्न के लिए, कृपया संपर्क करें:
              </p>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>ईमेल:</strong> <a href="mailto:privacy@rampurnews.com" className="text-primary hover:underline">privacy@rampurnews.com</a></p>
                <p><strong>पता:</strong> ऑफ मेन रोड, जिला सहकारी बैंक लि. के सामने, मिलक, रामपुर, उत्तर प्रदेश - 243701</p>
              </div>
            </div>
          </section>

          {/* Policy Updates */}
          <section className="mb-12">
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">नीति अपडेट</h2>
              <p className="text-muted-foreground leading-relaxed">
                हम समय-समय पर इस गोपनीयता नीति को अपडेट कर सकते हैं। किसी भी महत्वपूर्ण परिवर्तन 
                की सूचना इस पृष्ठ पर दी जाएगी। नियमित रूप से इस नीति की समीक्षा करने की सलाह दी जाती है।
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

export default PrivacyPolicy;
