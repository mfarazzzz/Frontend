import { Link } from "@/lib/router-compat";
import { categories } from "@/data/categories";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useFeaturedArticles } from "@/hooks/useCMS";

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

// Group categories for mega menu
const categoryGroups = [
  {
    title: "स्थानीय समाचार",
    items: categories.filter(c => ["rampur", "nearby", "up"].includes(c.slug))
  },
  {
    title: "राष्ट्रीय और राजनीति",
    items: categories.filter(c => ["national", "politics"].includes(c.slug))
  },
  {
    title: "समाज और जीवन",
    items: categories.filter(c => ["crime", "education-jobs", "health", "religion-culture", "food-lifestyle"].includes(c.slug))
  },
  {
    title: "व्यापार और खेल",
    items: categories.filter(c => ["business", "entertainment", "sports"].includes(c.slug))
  }
];

export const MegaMenu = ({ isOpen, onClose }: MegaMenuProps) => {
  const { data: featuredArticles = [] } = useFeaturedArticles(3);

  if (!isOpen) return null;

  return (
    <div 
      className="absolute top-full left-0 right-0 bg-white dark:bg-gray-900 shadow-2xl border-t border-gray-200 dark:border-gray-700 z-[100]"
      onMouseLeave={onClose}
    >
      <div className="container py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Categories Grid */}
          <div className="col-span-8">
            <div className="grid grid-cols-4 gap-6">
              {categoryGroups.map((group, index) => (
                <div key={index}>
                  <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-3 pb-2 border-b border-primary/20">
                    {group.title}
                  </h3>
                  <ul className="space-y-2">
                    {group.items.map((cat) => (
                      <li key={cat.id}>
                        <Link
                          to={cat.path}
                          onClick={onClose}
                          className="block text-sm text-gray-700 dark:text-gray-300 hover:text-primary hover:pl-2 transition-all duration-200"
                        >
                          {cat.titleHindi}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Featured Articles */}
          <div className="col-span-4 border-l border-gray-200 dark:border-gray-700 pl-6">
            <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-3 pb-2 border-b border-primary/20">
              मुख्य समाचार
            </h3>
            <div className="space-y-4">
              {featuredArticles.map((article) => (
                <Link
                  key={article.id}
                  to={`/${article.category}/${article.slug}`}
                  onClick={onClose}
                  className="flex gap-3 group"
                >
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-20 h-14 object-cover rounded flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-2 group-hover:text-primary transition-colors">
                      {article.title}
                    </p>
                    <span className="text-xs text-primary">{article.categoryHindi}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple dropdown for About section
interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: { label: string; path: string }[];
  align?: "left" | "right";
}

export const DropdownMenu = ({ trigger, items, align = "left" }: DropdownMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary flex items-center gap-1">
        {trigger}
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      
      {isOpen && (
        <ul 
          className={`absolute top-full ${align === "right" ? "right-0" : "left-0"} bg-white dark:bg-gray-900 shadow-xl rounded-lg py-2 min-w-48 z-[100] border border-gray-200 dark:border-gray-700 animate-fade-in`}
        >
          {items.map((item, index) => (
            <li key={index}>
              <Link
                to={item.path}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MegaMenu;
