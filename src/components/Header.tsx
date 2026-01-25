"use client";
import { Link } from "@/lib/router-compat";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, Search, Facebook, Twitter, Youtube, Instagram, ChevronDown, Clock } from "lucide-react";
import { categories } from "@/data/categories";
import { MegaMenu, DropdownMenu } from "./MegaMenu";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const pathname = usePathname();

  // Update time every minute
  useEffect(() => {
    setCurrentTime(new Date());
    const timer = window.setInterval(() => setCurrentTime(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const mainNavItems = categories.slice(0, 6);

  const isActive = (path: string) => pathname === path;

  const aboutItems = [
    { label: "हमारे बारे में", path: "/about" },
    { label: "संपर्क करें", path: "/contact" },
    { label: "संपादकीय नीति", path: "/editorial-policy" },
    { label: "स्वामित्व प्रकटीकरण", path: "/ownership" },
    { label: "शिकायत निवारण", path: "/grievance" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-card shadow-sm">
      {/* Top Bar */}
      <div className="bg-news-dark text-primary-foreground">
        <div className="container flex items-center justify-between py-2 text-sm">
          <div className="flex items-center gap-4">
            {currentTime ? (
              <span className="hidden md:flex items-center gap-2">
                <Clock size={14} />
                {currentTime.toLocaleDateString("hi-IN", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                {" | "}
                {currentTime.toLocaleTimeString("hi-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-3">
            <a href="https://www.facebook.com/profile.php?id=61586930678729" className="hover:text-primary transition-colors" aria-label="Facebook">
              <Facebook size={16} />
            </a>
            <a href="#" className="hover:text-primary transition-colors" aria-label="Twitter">
              <Twitter size={16} />
            </a>
            <a href="https://www.youtube.com/@rampurnewsdotcom" className="hover:text-primary transition-colors" aria-label="Youtube">
              <Youtube size={16} />
            </a>
            <a href="#" className="hover:text-primary transition-colors" aria-label="Instagram">
              <Instagram size={16} />
            </a>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground px-3 py-2 rounded">
              <span className="text-2xl md:text-3xl font-bold">रामपुर</span>
            </div>
            <span className="text-2xl md:text-3xl font-bold text-foreground">न्यूज़</span>
          </Link>

          {/* Desktop Search */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="खबर खोजें..."
                className="w-64 pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 hover:bg-muted rounded-lg"
              aria-label="Search"
            >
              <Search size={24} />
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 hover:bg-muted rounded-lg"
              aria-label="Menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        {isSearchOpen && (
          <div className="lg:hidden mt-4 animate-fade-in">
            <div className="relative">
              <input
                type="text"
                placeholder="खबर खोजें..."
                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="border-t border-border bg-card relative">
        <div className="container">
          {/* Desktop Navigation */}
          <ul className="hidden lg:flex items-center gap-1 py-1">
            <li>
              <Link
                to="/"
                className={`px-4 py-2 text-sm font-medium transition-colors hover:text-primary ${
                  isActive("/") ? "text-primary border-b-2 border-primary" : "text-foreground"
                }`}
              >
                होम
              </Link>
            </li>
            {mainNavItems.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.path}
                  className={`px-4 py-2 text-sm font-medium transition-colors hover:text-primary whitespace-nowrap ${
                    isActive(item.path) ? "text-primary border-b-2 border-primary" : "text-foreground"
                  }`}
                >
                  {item.titleHindi}
                </Link>
              </li>
            ))}
            
            {/* Mega Menu Trigger */}
            <li 
              className="relative"
              onMouseEnter={() => setIsMegaMenuOpen(true)}
              onMouseLeave={() => setIsMegaMenuOpen(false)}
            >
              <button className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary flex items-center gap-1">
                सभी श्रेणियां
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isMegaMenuOpen ? "rotate-180" : ""}`} />
              </button>
            </li>

            {/* About Dropdown */}
            <li>
              <DropdownMenu 
                trigger="हमारे बारे में"
                items={aboutItems}
                align="right"
              />
            </li>
          </ul>

          {/* Mega Menu */}
          <div 
            onMouseEnter={() => setIsMegaMenuOpen(true)}
            onMouseLeave={() => setIsMegaMenuOpen(false)}
          >
            <MegaMenu 
              isOpen={isMegaMenuOpen} 
              onClose={() => setIsMegaMenuOpen(false)} 
            />
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="lg:hidden py-4 animate-fade-in">
              <ul className="space-y-1">
                <li>
                  <Link
                    to="/"
                    onClick={() => setIsMenuOpen(false)}
                    className={`block px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                      isActive("/") ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`}
                  >
                    होम
                  </Link>
                </li>
                {categories.map((item) => (
                  <li key={item.id}>
                    <Link
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`block px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                        isActive(item.path) ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                      }`}
                    >
                      {item.titleHindi}
                    </Link>
                  </li>
                ))}
                {/* Mobile About Section */}
                <li className="pt-4 border-t border-border mt-4">
                  <span className="px-4 text-xs font-semibold text-muted-foreground uppercase">हमारे बारे में</span>
                </li>
                {aboutItems.map((item, index) => (
                  <li key={index}>
                    <Link
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`block px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                        isActive(item.path) ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
