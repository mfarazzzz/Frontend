import Business from "@/views/Business";
import { buildCategoryMetadata } from "@/lib/categoryMetadata";

export const metadata = buildCategoryMetadata("business");
export const revalidate = 30;

export default function Page() {
  return <Business />;
}


