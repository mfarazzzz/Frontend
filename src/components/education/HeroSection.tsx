import { Link } from "@/lib/router-compat";
import { GraduationCap, FileText, Building2, Trophy, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StatItem {
  value: string;
  label: string;
  labelHindi: string;
}

interface HeroSectionProps {
  stats?: StatItem[];
  showCTA?: boolean;
}

const defaultStats: StatItem[] = [
  { value: '500+', label: 'Exams', labelHindi: 'परीक्षाएं' },
  { value: '1000+', label: 'Institutions', labelHindi: 'संस्थान' },
  { value: '100+', label: 'Career Guides', labelHindi: 'करियर गाइड' },
];

export const HeroSection = ({ stats = defaultStats, showCTA = true }: HeroSectionProps) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="container mx-auto px-4 py-12 md:py-16 relative">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Content */}
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm mb-4">
              <GraduationCap className="h-4 w-4" />
              <span>रामपुर का #1 शिक्षा पोर्टल</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              आपके भविष्य का<br />
              <span className="text-white/90">मार्गदर्शक</span>
            </h1>
            
            <p className="text-lg text-white/80 mt-4 max-w-lg">
              परीक्षा कैलेंडर, रिजल्ट अपडेट, करियर गाइडेंस और संस्थान की जानकारी - सब एक जगह। 
              अपने शिक्षा लक्ष्यों को पूरा करें।
            </p>

            {showCTA && (
              <div className="flex flex-wrap gap-3 mt-6">
                <Button 
                  size="lg" 
                  variant="secondary" 
                  className="bg-white text-primary hover:bg-white/90"
                  asChild
                >
                  <Link to="/education-jobs/exams">
                    परीक्षा कैलेंडर देखें
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white/30 text-destructive hover:bg-white/10"
                  asChild
                >
                  <Link to="/education-jobs/career">
                    करियर गाइड
                  </Link>
                </Button>
              </div>
            )}

            {/* Stats */}
            <div className="flex flex-wrap gap-6 mt-8 pt-6 border-t border-white/20">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <div className="text-sm text-white/70">{stat.labelHindi}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links Grid */}
          <div className="hidden lg:grid grid-cols-2 gap-4">
            <Link 
              to="/education-jobs/exams" 
              className="group bg-white/10 backdrop-blur-sm rounded-xl p-5 hover:bg-white/20 transition-colors"
            >
              <FileText className="h-8 w-8 mb-3" />
              <h3 className="font-bold text-lg">परीक्षा कैलेंडर</h3>
              <p className="text-sm text-white/70 mt-1">सभी परीक्षाओं की तिथियां</p>
              <ArrowRight className="h-4 w-4 mt-3 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link 
              to="/education-jobs/results" 
              className="group bg-white/10 backdrop-blur-sm rounded-xl p-5 hover:bg-white/20 transition-colors"
            >
              <Trophy className="h-8 w-8 mb-3" />
              <h3 className="font-bold text-lg">परिणाम ट्रैकर</h3>
              <p className="text-sm text-white/70 mt-1">लेटेस्ट रिजल्ट अपडेट</p>
              <ArrowRight className="h-4 w-4 mt-3 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link 
              to="/education-jobs/institutions" 
              className="group bg-white/10 backdrop-blur-sm rounded-xl p-5 hover:bg-white/20 transition-colors"
            >
              <Building2 className="h-8 w-8 mb-3" />
              <h3 className="font-bold text-lg">संस्थान खोजें</h3>
              <p className="text-sm text-white/70 mt-1">स्कूल, कॉलेज, कोचिंग</p>
              <ArrowRight className="h-4 w-4 mt-3 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link 
              to="/education-jobs/career" 
              className="group bg-white/10 backdrop-blur-sm rounded-xl p-5 hover:bg-white/20 transition-colors"
            >
              <GraduationCap className="h-8 w-8 mb-3" />
              <h3 className="font-bold text-lg">करियर गाइड</h3>
              <p className="text-sm text-white/70 mt-1">सही करियर चुनें</p>
              <ArrowRight className="h-4 w-4 mt-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;