"use client";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { FileText, Mail, Phone, Globe } from "lucide-react";

const PressRelease = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 space-y-8">
        <nav className="text-sm text-muted-foreground">
          <a href="/" className="hover:text-primary">होम</a>
          <span className="mx-2">/</span>
          <span className="text-foreground">प्रेस रिलीज़</span>
        </nav>

        <section className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-primary" />
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Press Release</h1>
          </div>
          <p className="text-muted-foreground">
            रामपुर न्यूज़ से संबंधित आधिकारिक प्रेस रिलीज़, मीडिया अपडेट और घोषणाएँ इस पेज पर प्रकाशित की जाती हैं।
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-muted rounded-xl p-4 space-y-2">
              <h2 className="font-semibold text-foreground">मीडिया संपर्क</h2>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Mail className="w-4 h-4" />
                editor@rampurnews.com
              </p>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Phone className="w-4 h-4" />
                +91-00000-00000
              </p>
            </div>
            <div className="bg-muted rounded-xl p-4 space-y-2">
              <h2 className="font-semibold text-foreground">ब्रांड एसेट्स</h2>
              <p className="text-sm text-muted-foreground">
                लोगो, ब्रांड गाइड और मीडिया किट के लिए संपर्क करें।
              </p>
            </div>
            <div className="bg-muted rounded-xl p-4 space-y-2">
              <h2 className="font-semibold text-foreground">वेबसाइट</h2>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Globe className="w-4 h-4" />
                https://rampurnews.com
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PressRelease;

