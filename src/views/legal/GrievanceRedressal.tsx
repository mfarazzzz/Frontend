"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Shield, User, Clock, FileText, AlertCircle, ArrowRight } from "lucide-react";

const GrievanceRedressal = () => {
  return (
    <>
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="text-sm text-muted-foreground mb-6">
            <a href="/" className="hover:text-primary">होम</a>
            <span className="mx-2">/</span>
            <span className="text-foreground">शिकायत निवारण नीति</span>
          </nav>

          {/* Hero Section */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 md:p-12 mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              शिकायत निवारण नीति
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl">
              रामपुर न्यूज़ अपने पाठकों और उपयोगकर्ताओं की चिंताओं को गंभीरता से लेता है। 
              यह नीति भारतीय सूचना प्रौद्योगिकी (मध्यवर्ती दिशानिर्देश और डिजिटल मीडिया आचार संहिता) 
              नियम 2021 के अनुपालन में है।
            </p>
          </div>

          {/* Compliance Notice */}
          <section className="mb-12">
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-2">विनियामक अनुपालन</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    यह शिकायत निवारण तंत्र भारतीय सूचना प्रौद्योगिकी अधिनियम 2000, सूचना प्रौद्योगिकी 
                    (मध्यवर्ती दिशानिर्देश और डिजिटल मीडिया आचार संहिता) नियम 2021, और प्रेस काउंसिल ऑफ 
                    इंडिया के दिशानिर्देशों के अनुपालन में स्थापित किया गया है।
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Grievance Officer */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">शिकायत अधिकारी</h2>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6">
              <p className="text-muted-foreground mb-6">
                IT नियम 2021 के नियम 11 के अनुसार, निम्नलिखित व्यक्ति को शिकायत अधिकारी के रूप में नियुक्त किया गया है:
              </p>
              
              <div className="bg-background rounded-lg p-6 border border-border">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center shrink-0 mx-auto md:mx-0">
                    <span className="text-3xl font-bold text-primary">द</span>
                  </div>
                  <div className="text-center md:text-left">
                    <h3 className="text-xl font-bold text-foreground mb-1">मोहम्मद दानिश रज़ा खान</h3>
                    <p className="text-primary mb-3">शिकायत अधिकारी / कानूनी एवं सलाहकार प्रमुख</p>
                    <div className="space-y-1 text-muted-foreground">
                      <p><strong>ईमेल:</strong> <a href="mailto:grievance@rampurnews.com" className="text-primary hover:underline">grievance@rampurnews.com</a></p>
                      <p><strong>फ़ोन:</strong> <a href="tel:+919997929196" className="text-primary hover:underline">+91 9997929196</a></p>
                      <p><strong>पता:</strong> ऑफ मेन रोड, जिला सहकारी बैंक लि. के सामने, मिलक, रामपुर, उत्तर प्रदेश - 243701</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Types of Grievances */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">शिकायत के प्रकार</h2>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6">
              <p className="text-muted-foreground mb-4">
                आप निम्नलिखित मामलों में शिकायत दर्ज कर सकते हैं:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-background rounded-lg border border-border">
                  <h4 className="font-semibold text-foreground mb-2">सामग्री संबंधी शिकायतें</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• गलत या भ्रामक जानकारी</li>
                    <li>• आपत्तिजनक सामग्री</li>
                    <li>• कॉपीराइट उल्लंघन</li>
                    <li>• मानहानि या अपमानजनक सामग्री</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-background rounded-lg border border-border">
                  <h4 className="font-semibold text-foreground mb-2">गोपनीयता संबंधी शिकायतें</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• व्यक्तिगत डेटा का दुरुपयोग</li>
                    <li>• अनधिकृत डेटा संग्रह</li>
                    <li>• डेटा सुरक्षा चिंताएं</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-background rounded-lg border border-border">
                  <h4 className="font-semibold text-foreground mb-2">सेवा संबंधी शिकायतें</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• वेबसाइट तकनीकी समस्याएं</li>
                    <li>• न्यूज़लेटर या सदस्यता मुद्दे</li>
                    <li>• विज्ञापन संबंधी चिंताएं</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-background rounded-lg border border-border">
                  <h4 className="font-semibold text-foreground mb-2">अन्य शिकायतें</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• कर्मचारी आचरण</li>
                    <li>• व्यावसायिक प्रथाओं के बारे में चिंताएं</li>
                    <li>• कोई अन्य वैध शिकायत</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Complaint Process */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">शिकायत प्रक्रिया</h2>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">शिकायत कैसे दर्ज करें</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold shrink-0">1</div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">ईमेल भेजें</h4>
                    <p className="text-muted-foreground text-sm">
                      <a href="mailto:grievance@rampurnews.com" className="text-primary hover:underline">grievance@rampurnews.com</a> 
                      पर अपनी शिकायत का विस्तृत विवरण भेजें।
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold shrink-0">2</div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">आवश्यक जानकारी शामिल करें</h4>
                    <p className="text-muted-foreground text-sm">
                      अपना नाम, संपर्क जानकारी, संबंधित लेख/सामग्री का URL, और शिकायत का विस्तृत विवरण।
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold shrink-0">3</div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">पावती प्राप्त करें</h4>
                    <p className="text-muted-foreground text-sm">
                      हम 24 घंटे के भीतर आपकी शिकायत की पावती भेजेंगे।
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold shrink-0">4</div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">समाधान प्राप्त करें</h4>
                    <p className="text-muted-foreground text-sm">
                      हम 15 कार्य दिवसों के भीतर आपकी शिकायत का समाधान करने का प्रयास करेंगे।
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">शिकायत में शामिल करें:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• आपका पूरा नाम और संपर्क विवरण (ईमेल, फ़ोन)</li>
                  <li>• संबंधित सामग्री का URL या विवरण</li>
                  <li>• शिकायत का स्पष्ट और विस्तृत विवरण</li>
                  <li>• कोई सहायक दस्तावेज़ या साक्ष्य (यदि हो)</li>
                  <li>• आप क्या समाधान चाहते हैं</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Response Timeline */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">प्रतिक्रिया समयसीमा</h2>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-background rounded-lg border border-border">
                  <div className="text-4xl font-bold text-primary mb-2">24</div>
                  <p className="text-sm text-muted-foreground mb-1">घंटे</p>
                  <p className="font-semibold text-foreground">पावती</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    शिकायत प्राप्त होने की पुष्टि
                  </p>
                </div>
                
                <div className="text-center p-6 bg-background rounded-lg border border-border">
                  <div className="text-4xl font-bold text-primary mb-2">15</div>
                  <p className="text-sm text-muted-foreground mb-1">कार्य दिवस</p>
                  <p className="font-semibold text-foreground">समाधान</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    IT नियम 2021 के अनुसार
                  </p>
                </div>
                
                <div className="text-center p-6 bg-background rounded-lg border border-border">
                  <div className="text-4xl font-bold text-primary mb-2">72</div>
                  <p className="text-sm text-muted-foreground mb-1">घंटे</p>
                  <p className="font-semibold text-foreground">तत्काल मामले</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    गंभीर सामग्री शिकायतों के लिए
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-sm text-muted-foreground">
                  <strong>नोट:</strong> यदि शिकायत जटिल है और अधिक समय की आवश्यकता है, तो हम आपको 
                  अपेक्षित समयसीमा के बारे में सूचित करेंगे। हम IT नियम 2021 में निर्धारित समयसीमाओं 
                  का सख्ती से पालन करते हैं।
                </p>
              </div>
            </div>
          </section>

          {/* Escalation Process */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <ArrowRight className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">अपील प्रक्रिया</h2>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6">
              <p className="text-muted-foreground mb-6">
                यदि आप शिकायत अधिकारी के निर्णय से संतुष्ट नहीं हैं, तो आप निम्नलिखित चरणों में अपील कर सकते हैं:
              </p>
              
              <div className="space-y-4">
                <div className="p-4 bg-background rounded-lg border border-border">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded">स्तर 1</span>
                    <h4 className="font-semibold text-foreground">संपादकीय प्रमुख</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    शिकायत अधिकारी के निर्णय के खिलाफ पहली अपील
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>संपर्क:</strong> मोहम्मद ज़ीशान रज़ा खान<br />
                    <strong>ईमेल:</strong> <a href="mailto:editor@rampurnews.com" className="text-primary hover:underline">editor@rampurnews.com</a>
                  </p>
                </div>

                <div className="p-4 bg-background rounded-lg border border-border">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-secondary text-secondary-foreground text-xs font-semibold rounded">स्तर 2</span>
                    <h4 className="font-semibold text-foreground">संस्थापक एवं प्रकाशक</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    अंतिम आंतरिक अपील
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>संपर्क:</strong> मोहम्मद फ़राज़ रज़ा खान<br />
                    <strong>ईमेल:</strong> <a href="mailto:publisher@rampurnews.com" className="text-primary hover:underline">publisher@rampurnews.com</a>
                  </p>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg border border-border">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-muted text-muted-foreground text-xs font-semibold rounded">बाहरी</span>
                    <h4 className="font-semibold text-foreground">नियामक प्राधिकरण</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    यदि आप आंतरिक अपील प्रक्रिया से संतुष्ट नहीं हैं, तो आप संबंधित सरकारी 
                    नियामक प्राधिकरणों या प्रेस काउंसिल ऑफ इंडिया से संपर्क कर सकते हैं।
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Content Removal */}
          <section className="mb-12">
            <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">सामग्री हटाने के अनुरोध</h2>
              <p className="text-muted-foreground mb-4">
                यदि आप मानते हैं कि हमारी वेबसाइट पर प्रकाशित कोई सामग्री आपके अधिकारों का उल्लंघन करती है, 
                तो आप निम्नलिखित के साथ एक औपचारिक अनुरोध भेज सकते हैं:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                <li>• आपकी पहचान का प्रमाण</li>
                <li>• आपत्तिजनक सामग्री का URL</li>
                <li>• उल्लंघन का विस्तृत विवरण</li>
                <li>• कानूनी आधार (यदि कॉपीराइट उल्लंघन है तो DMCA अधिसूचना)</li>
              </ul>
              <p className="text-sm text-muted-foreground">
                हम IT नियम 2021 के अनुसार ऐसे अनुरोधों पर 36 घंटे के भीतर प्रतिक्रिया देंगे।
              </p>
            </div>
          </section>

          {/* Contact Summary */}
          <section className="mb-12">
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">शिकायत संपर्क सारांश</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">शिकायत अधिकारी</h3>
                  <p className="text-muted-foreground text-sm">
                    मोहम्मद दानिश रज़ा खान<br />
                    <a href="mailto:grievance@rampurnews.com" className="text-primary hover:underline">grievance@rampurnews.com</a><br />
                    +91 9997929196
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">कार्यालय पता</h3>
                  <p className="text-muted-foreground text-sm">
                    ऑफ मेन रोड, जिला सहकारी बैंक लि. के सामने,<br />
                    मिलक, रामपुर, उत्तर प्रदेश - 243701
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Last Updated */}
          <div className="text-center text-sm text-muted-foreground">
            <p>अंतिम अपडेट: जनवरी 2025</p>
            <p className="mt-2">
              यह नीति भारतीय IT नियम 2021 के अनुपालन में है।
            </p>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default GrievanceRedressal;
