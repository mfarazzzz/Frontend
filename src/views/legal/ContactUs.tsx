"use client";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { MapPin, Phone, Mail, Clock, Send, MessageSquare } from "lucide-react";

const ContactUs = () => {
  const contactFormUrl =
    "https://docs.google.com/forms/d/e/1FAIpQLSezmhkifh6B8qditlJR9Ja4g7R_oRG0stgq-Y3_cJfXXkl3Ug/viewform";

  return (
    <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="text-sm text-muted-foreground mb-6">
            <a href="/" className="hover:text-primary">होम</a>
            <span className="mx-2">/</span>
            <span className="text-foreground">संपर्क करें</span>
          </nav>

          {/* Hero Section */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 md:p-12 mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              संपर्क करें
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl">
              हम आपसे सुनना चाहते हैं! चाहे आपके पास कोई प्रश्न हो, सुझाव हो, या समाचार टिप हो - 
              हम आपकी सहायता के लिए यहाँ हैं।
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="lg:col-span-1 space-y-6">
              {/* Office Address */}
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-lg font-bold text-foreground">कार्यालय पता</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  ऑफ मेन रोड,<br />
                  जिला सहकारी बैंक लि. के सामने,<br />
                  मिलक, रामपुर,<br />
                  उत्तर प्रदेश, भारत - 243701
                </p>
              </div>

              {/* Phone Numbers */}
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-lg font-bold text-foreground">फ़ोन नंबर</h2>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">संपादकीय प्रमुख</p>
                    <p className="font-medium text-foreground">मोहम्मद ज़ीशान रज़ा खान</p>
                    <a href="tel:+919997877012" className="text-primary hover:underline">
                      +91 9997877012
                    </a>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">कानूनी एवं सलाहकार प्रमुख</p>
                    <p className="font-medium text-foreground">मोहम्मद दानिश रज़ा खान</p>
                    <a href="tel:+919997929196" className="text-primary hover:underline">
                      +91 9997929196
                    </a>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">संस्थापक एवं प्रकाशक</p>
                    <p className="font-medium text-foreground">मोहम्मद फ़राज़ रज़ा खान</p>
                    <a href="tel:+918077848980" className="text-primary hover:underline">
                      +91 8077848980
                    </a>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-lg font-bold text-foreground">ईमेल</h2>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">सामान्य पूछताछ</p>
                    <a href="mailto:contact@rampurnews.com" className="text-primary hover:underline">
                      contact@rampurnews.com
                    </a>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">संपादकीय</p>
                    <a href="mailto:editor@rampurnews.com" className="text-primary hover:underline">
                      editor@rampurnews.com
                    </a>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">विज्ञापन</p>
                    <a href="mailto:ads@rampurnews.com" className="text-primary hover:underline">
                      ads@rampurnews.com
                    </a>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">शिकायत</p>
                    <a href="mailto:grievance@rampurnews.com" className="text-primary hover:underline">
                      grievance@rampurnews.com
                    </a>
                  </div>
                </div>
              </div>

              {/* Office Hours */}
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-lg font-bold text-foreground">कार्यालय समय</h2>
                </div>
                <div className="space-y-2 text-muted-foreground">
                  <div className="flex justify-between">
                    <span>सोमवार - शनिवार</span>
                    <span className="font-medium text-foreground">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>रविवार</span>
                    <span className="font-medium text-foreground">बंद</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  ब्रेकिंग न्यूज़ के लिए हम 24/7 उपलब्ध हैं।
                </p>
              </div>

              {/* Social Media */}
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-lg font-bold text-foreground">सोशल मीडिया</h2>
                </div>
                <div className="space-y-2">
                  <a href="https://whatsapp.com/channel/0029Vb7TEPsLI8Yg4gbsqe3O" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                    <span>WhatsApp Channel</span>
                  </a>
                  <a href="https://t.me/rampurnewsofficial" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                    <span>Telegram Channel</span>
                  </a>
                  <a href="https://www.facebook.com/profile.php?id=61586930678729" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                    <span>Facebook Page</span>
                  </a>
                  <a href="#" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                    <span>Twitter/X</span>
                  </a>
                  <a href="https://www.youtube.com/@rampurnewsdotcom" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                    <span>YouTube Channel</span>
                  </a>
                  <a href="#" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                    <span>Instagram</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-card border border-border rounded-xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Send className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">हमें संदेश भेजें</h2>
                </div>
                <div className="flex items-center justify-between flex-wrap gap-3 text-sm text-muted-foreground">
                  <span>कृपया नीचे दिए गए फॉर्म को भरें।</span>
                  <a
                    href={contactFormUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline"
                  >
                    नए टैब में खोलें
                  </a>
                </div>
                <div className="mt-6 overflow-hidden rounded-lg border border-border bg-white">
                  <iframe
                    src={contactFormUrl}
                    title="Rampur News संपर्क फॉर्म"
                    className="w-full min-h-[900px]"
                  />
                </div>
              </div>

              {/* News Tips */}
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 md:p-8 mt-6">
                <h2 className="text-xl font-bold text-foreground mb-4">समाचार टिप भेजें</h2>
                <p className="text-muted-foreground mb-4">
                  क्या आपके पास कोई समाचार टिप या स्टोरी आइडिया है? हम आपसे सुनना चाहते हैं! 
                  आप हमें WhatsApp, ईमेल, या फ़ोन के माध्यम से समाचार टिप भेज सकते हैं।
                </p>
                <div className="flex flex-wrap gap-4">
                  <a href="mailto:tips@rampurnews.com" className="text-primary hover:underline">
                    tips@rampurnews.com
                  </a>
                  <a href="tel:+919997877012" className="text-primary hover:underline">
                    +91 9997877012 (WhatsApp)
                  </a>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  <strong>गोपनीयता:</strong> यदि आप चाहें तो आपकी पहचान गोपनीय रखी जाएगी।
                </p>
              </div>

              {/* Department Contacts */}
              <div className="bg-card border border-border rounded-xl p-6 md:p-8 mt-6">
                <h2 className="text-xl font-bold text-foreground mb-6">विभाग संपर्क</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-4 bg-background rounded-lg border border-border">
                    <h3 className="font-semibold text-foreground mb-2">संपादकीय विभाग</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      समाचार, लेख, और संपादकीय संबंधी प्रश्न
                    </p>
                    <a href="mailto:editor@rampurnews.com" className="text-primary text-sm hover:underline">
                      editor@rampurnews.com
                    </a>
                  </div>
                  
                  <div className="p-4 bg-background rounded-lg border border-border">
                    <h3 className="font-semibold text-foreground mb-2">विज्ञापन विभाग</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      विज्ञापन और प्रायोजन संबंधी जानकारी
                    </p>
                    <a href="mailto:ads@rampurnews.com" className="text-primary text-sm hover:underline">
                      ads@rampurnews.com
                    </a>
                  </div>
                  
                  <div className="p-4 bg-background rounded-lg border border-border">
                    <h3 className="font-semibold text-foreground mb-2">तकनीकी सहायता</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      वेबसाइट और ऐप संबंधी समस्याएं
                    </p>
                    <a href="mailto:tech@rampurnews.com" className="text-primary text-sm hover:underline">
                      tech@rampurnews.com
                    </a>
                  </div>
                  
                  <div className="p-4 bg-background rounded-lg border border-border">
                    <h3 className="font-semibold text-foreground mb-2">कानूनी विभाग</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      कानूनी और अनुपालन संबंधी मामले
                    </p>
                    <a href="mailto:legal@rampurnews.com" className="text-primary text-sm hover:underline">
                      legal@rampurnews.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
  );
};

export default ContactUs;
