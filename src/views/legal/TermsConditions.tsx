"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FileText, Users, AlertTriangle, Scale, Copyright, Ban } from "lucide-react";

const TermsConditions = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
        
      <main className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="text-sm text-muted-foreground mb-6">
            <a href="/" className="hover:text-primary">होम</a>
            <span className="mx-2">/</span>
            <span className="text-foreground">नियम और शर्तें</span>
          </nav>

          {/* Hero Section */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 md:p-12 mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              नियम और शर्तें
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl">
              रामपुर न्यूज़ वेबसाइट का उपयोग करने से पहले कृपया इन नियमों और शर्तों को ध्यान से पढ़ें। 
              वेबसाइट का उपयोग करके, आप इन शर्तों से बाध्य होने के लिए सहमत होते हैं।
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              प्रभावी तिथि: 1 जनवरी 2025
            </p>
          </div>

          {/* Acceptance */}
          <section className="mb-12">
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">स्वीकृति</h2>
              <p className="text-muted-foreground leading-relaxed">
                rampurnews.com ("वेबसाइट") तक पहुंचने या उपयोग करने से, आप इन नियमों और शर्तों 
                ("शर्तें") से बाध्य होने के लिए सहमत होते हैं। यदि आप इन शर्तों से सहमत नहीं हैं, 
                तो कृपया वेबसाइट का उपयोग न करें। ये शर्तें वेबसाइट के सभी उपयोगकर्ताओं पर लागू होती हैं, 
                जिसमें ब्राउज़र, आगंतुक, और योगदानकर्ता शामिल हैं।
              </p>
            </div>
          </section>

          {/* Content Usage */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Copyright className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">सामग्री उपयोग</h2>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">कॉपीराइट स्वामित्व</h3>
                <p className="text-muted-foreground leading-relaxed">
                  वेबसाइट पर प्रकाशित सभी सामग्री - जिसमें टेक्स्ट, ग्राफ़िक्स, लोगो, छवियां, वीडियो, 
                  और अन्य सामग्री शामिल है - रामपुर न्यूज़ और/या इसके सामग्री आपूर्तिकर्ताओं की संपत्ति है 
                  और भारतीय कॉपीराइट कानूनों और अंतर्राष्ट्रीय संधियों द्वारा संरक्षित है।
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">उचित उपयोग (Fair Use)</h3>
                <p className="text-muted-foreground mb-3">
                  आप निम्नलिखित शर्तों के तहत हमारी सामग्री का सीमित उपयोग कर सकते हैं:
                </p>
                <ul className="space-y-2 text-muted-foreground text-sm">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                    <span><strong>व्यक्तिगत, गैर-व्यावसायिक उपयोग:</strong> आप व्यक्तिगत पढ़ने के लिए सामग्री देख सकते हैं।</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                    <span><strong>सोशल मीडिया शेयरिंग:</strong> आप हमारे शेयर बटन का उपयोग करके लेखों को शेयर कर सकते हैं।</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                    <span><strong>उद्धरण:</strong> उचित श्रेय (रामपुर न्यूज़ के लिंक सहित) के साथ छोटे उद्धरण।</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">श्रेय आवश्यकताएं</h3>
                <p className="text-muted-foreground leading-relaxed">
                  हमारी सामग्री का उपयोग करते समय, आपको:
                </p>
                <ul className="space-y-2 text-muted-foreground text-sm mt-3">
                  <li>• "रामपुर न्यूज़" को स्रोत के रूप में स्पष्ट श्रेय देना होगा</li>
                  <li>• मूल लेख का सीधा लिंक प्रदान करना होगा</li>
                  <li>• सामग्री को इस तरह प्रस्तुत न करें कि यह आपकी मूल रचना लगे</li>
                </ul>
              </div>

              <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                <h4 className="font-semibold text-foreground mb-2">प्रतिबंधित उपयोग</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• बिना अनुमति के पूर्ण लेखों का पुनर्प्रकाशन</li>
                  <li>• व्यावसायिक उद्देश्यों के लिए सामग्री का उपयोग</li>
                  <li>• सामग्री में बदलाव या विकृति</li>
                  <li>• हमारी सामग्री से व्युत्पन्न कार्य बनाना</li>
                </ul>
              </div>
            </div>
          </section>

          {/* User Responsibilities */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">उपयोगकर्ता जिम्मेदारियां</h2>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">स्वीकार्य उपयोग नीति</h3>
                <p className="text-muted-foreground mb-3">
                  वेबसाइट का उपयोग करते समय, आप सहमत हैं:
                </p>
                <ul className="space-y-2 text-muted-foreground text-sm">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                    <span>केवल वैध उद्देश्यों के लिए वेबसाइट का उपयोग करना</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                    <span>सभी लागू कानूनों और विनियमों का पालन करना</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                    <span>दूसरों के अधिकारों का सम्मान करना</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                    <span>सटीक जानकारी प्रदान करना (फ़ॉर्म भरते समय)</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">टिप्पणी दिशानिर्देश</h3>
                <p className="text-muted-foreground mb-3">
                  यदि हमारी वेबसाइट पर टिप्पणी की सुविधा है, तो आप सहमत हैं:
                </p>
                <ul className="space-y-2 text-muted-foreground text-sm">
                  <li>• सभ्य और सम्मानजनक भाषा का उपयोग करना</li>
                  <li>• अपमानजनक, घृणास्पद, या भेदभावपूर्ण सामग्री पोस्ट न करना</li>
                  <li>• स्पैम या विज्ञापन पोस्ट न करना</li>
                  <li>• गलत जानकारी न फैलाना</li>
                  <li>• किसी अन्य व्यक्ति का प्रतिरूपण न करना</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Prohibited Activities */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Ban className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">निषिद्ध गतिविधियां</h2>
            </div>
            
            <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-6">
              <p className="text-muted-foreground mb-4">
                निम्नलिखित गतिविधियां सख्त वर्जित हैं:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <ul className="space-y-2 text-muted-foreground text-sm">
                  <li>• हैकिंग या अनधिकृत पहुंच का प्रयास</li>
                  <li>• मैलवेयर या वायरस वितरित करना</li>
                  <li>• वेबसाइट की सुरक्षा को बाधित करना</li>
                  <li>• DDoS हमले या अन्य साइबर हमले</li>
                </ul>
                <ul className="space-y-2 text-muted-foreground text-sm">
                  <li>• बिना अनुमति के स्क्रैपिंग या डेटा माइनिंग</li>
                  <li>• नकली खाते बनाना</li>
                  <li>• विज्ञापन धोखाधड़ी</li>
                  <li>• किसी भी अवैध गतिविधि के लिए उपयोग</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Liability Limitations */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">दायित्व सीमाएं</h2>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">सटीकता पर कोई वारंटी नहीं</h3>
                <p className="text-muted-foreground leading-relaxed">
                  हम सटीक और अप-टू-डेट जानकारी प्रदान करने का प्रयास करते हैं, लेकिन हम इसकी 
                  पूर्णता, सटीकता, विश्वसनीयता, उपयुक्तता, या उपलब्धता के बारे में कोई प्रतिनिधित्व 
                  या वारंटी नहीं देते हैं।
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">तृतीय-पक्ष सामग्री</h3>
                <p className="text-muted-foreground leading-relaxed">
                  वेबसाइट में तृतीय-पक्ष वेबसाइटों के लिंक हो सकते हैं। हम इन बाहरी साइटों की 
                  सामग्री, गोपनीयता प्रथाओं, या सेवाओं के लिए जिम्मेदार नहीं हैं।
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">हानि की सीमा</h3>
                <p className="text-muted-foreground leading-relaxed">
                  कानून द्वारा अनुमत अधिकतम सीमा तक, रामपुर न्यूज़ वेबसाइट के उपयोग या उपयोग करने 
                  में असमर्थता से उत्पन्न होने वाली किसी भी प्रत्यक्ष, अप्रत्यक्ष, आकस्मिक, विशेष, 
                  परिणामी, या दंडात्मक क्षति के लिए उत्तरदायी नहीं होगा।
                </p>
              </div>
            </div>
          </section>

          {/* Indemnification */}
          <section className="mb-12">
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">क्षतिपूर्ति</h2>
              <p className="text-muted-foreground leading-relaxed">
                आप रामपुर न्यूज़, इसके मालिकों, अधिकारियों, कर्मचारियों, और एजेंटों को किसी भी दावे, 
                क्षति, देनदारियों, लागतों, या खर्चों (वकील शुल्क सहित) से क्षतिपूर्ति और हानिरहित 
                रखने के लिए सहमत हैं जो आपके वेबसाइट के उपयोग, इन शर्तों के उल्लंघन, या किसी तीसरे 
                पक्ष के अधिकारों के उल्लंघन से उत्पन्न होते हैं।
              </p>
            </div>
          </section>

          {/* Governing Law */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Scale className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">शासी कानून और क्षेत्राधिकार</h2>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">लागू कानून</h3>
                <p className="text-muted-foreground leading-relaxed">
                  ये शर्तें भारत के कानूनों द्वारा शासित और व्याख्यायित की जाएंगी, कानूनों के टकराव 
                  के सिद्धांतों की परवाह किए बिना।
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">विवाद समाधान</h3>
                <p className="text-muted-foreground leading-relaxed">
                  इन शर्तों से उत्पन्न या संबंधित कोई भी विवाद रामपुर, उत्तर प्रदेश, भारत में 
                  स्थित न्यायालयों के अनन्य क्षेत्राधिकार में होगा।
                </p>
              </div>

              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <h4 className="font-semibold text-foreground mb-2">पहले संपर्क करें</h4>
                <p className="text-sm text-muted-foreground">
                  कोई भी कानूनी कार्रवाई शुरू करने से पहले, हम आपको अनुरोध करते हैं कि आप हमसे 
                  <a href="mailto:legal@rampurnews.com" className="text-primary hover:underline mx-1">legal@rampurnews.com</a> 
                  पर संपर्क करें ताकि हम विवाद को सौहार्दपूर्ण ढंग से हल करने का प्रयास कर सकें।
                </p>
              </div>
            </div>
          </section>

          {/* Changes to Terms */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">शर्तों में परिवर्तन</h2>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6">
              <p className="text-muted-foreground leading-relaxed">
                हम किसी भी समय इन शर्तों को संशोधित करने का अधिकार सुरक्षित रखते हैं। परिवर्तन 
                इस पृष्ठ पर पोस्ट किए जाने पर तुरंत प्रभावी होंगे। परिवर्तनों के बाद वेबसाइट का 
                निरंतर उपयोग संशोधित शर्तों की आपकी स्वीकृति माना जाएगा।
              </p>
            </div>
          </section>

          {/* Severability */}
          <section className="mb-12">
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">पृथक्करणीयता</h2>
              <p className="text-muted-foreground leading-relaxed">
                यदि इन शर्तों का कोई प्रावधान अमान्य या अप्रवर्तनीय पाया जाता है, तो शेष प्रावधान 
                पूर्ण बल और प्रभाव में रहेंगे। अमान्य प्रावधान को एक मान्य प्रावधान द्वारा प्रतिस्थापित 
                माना जाएगा जो अमान्य प्रावधान के इरादे के सबसे करीब आता है।
              </p>
            </div>
          </section>

          {/* Contact */}
          <section className="mb-12">
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">संपर्क जानकारी</h2>
              <p className="text-muted-foreground mb-4">
                इन शर्तों के बारे में किसी भी प्रश्न के लिए, कृपया संपर्क करें:
              </p>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>कानूनी प्रमुख:</strong> मोहम्मद दानिश रज़ा खान</p>
                <p><strong>ईमेल:</strong> <a href="mailto:legal@rampurnews.com" className="text-primary hover:underline">legal@rampurnews.com</a></p>
                <p><strong>फ़ोन:</strong> +91 9997929196</p>
                <p><strong>पता:</strong> ऑफ मेन रोड, जिला सहकारी बैंक लि. के सामने, मिलक, रामपुर, उत्तर प्रदेश - 243701</p>
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

export default TermsConditions;
