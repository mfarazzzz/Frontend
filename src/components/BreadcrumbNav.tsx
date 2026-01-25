import { Link } from "@/lib/router-compat";
import { ChevronRight, Home } from "lucide-react";
import type { Breadcrumb } from "@/services/cms/extendedTypes";

interface BreadcrumbNavProps {
  items: Breadcrumb[];
  className?: string;
}

const BreadcrumbNav = ({ items, className = "" }: BreadcrumbNavProps) => {
  return (
    <nav 
      aria-label="Breadcrumb" 
      className={`flex items-center text-sm text-muted-foreground mb-4 ${className}`}
    >
      <ol className="flex items-center flex-wrap gap-1" itemScope itemType="https://schema.org/BreadcrumbList">
        <li 
          className="flex items-center" 
          itemProp="itemListElement" 
          itemScope 
          itemType="https://schema.org/ListItem"
        >
          <Link 
            to="/" 
            className="flex items-center gap-1 hover:text-primary transition-colors"
            itemProp="item"
          >
            <Home size={14} />
            <span itemProp="name">होम</span>
          </Link>
          <meta itemProp="position" content="1" />
        </li>
        
        {items.map((item, index) => (
          <li 
            key={item.path}
            className="flex items-center"
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem"
          >
            <ChevronRight size={14} className="mx-1 text-muted-foreground/50" />
            {index === items.length - 1 ? (
              <span className="text-foreground font-medium" itemProp="name">
                {item.labelHindi}
              </span>
            ) : (
              <Link 
                to={item.path} 
                className="hover:text-primary transition-colors"
                itemProp="item"
              >
                <span itemProp="name">{item.labelHindi}</span>
              </Link>
            )}
            <meta itemProp="position" content={String(index + 2)} />
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default BreadcrumbNav;
