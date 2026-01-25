import { Category } from "@/data/categories";

interface CategoryHeaderProps {
  category: Category;
}

const CategoryHeader = ({ category }: CategoryHeaderProps) => {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-1.5 h-8 bg-primary rounded-full" />
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          {category.titleHindi}
        </h1>
      </div>
      <p className="text-muted-foreground ml-5">{category.description}</p>
    </div>
  );
};

export default CategoryHeader;
