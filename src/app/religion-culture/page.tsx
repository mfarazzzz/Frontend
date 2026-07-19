import { CategoryPageServer } from "@/lib/categoryPage";
import { buildCategoryMetadata } from "@/lib/categoryMetadata";

export const dynamic = "force-dynamic";

export const metadata = buildCategoryMetadata("religion-culture");
export const revalidate = 30;

export default function Page() {
  return <CategoryPageServer categorySlug="religion-culture" />;
}
