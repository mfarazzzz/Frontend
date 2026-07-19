import { CategoryPageServer } from "@/lib/categoryPage";
import { buildCategoryMetadata } from "@/lib/categoryMetadata";

export const metadata = buildCategoryMetadata("entertainment");
export const revalidate = 30;

export default function Page() {
  return <CategoryPageServer categorySlug="entertainment" />;
}
