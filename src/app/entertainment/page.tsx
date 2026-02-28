import Entertainment from "@/views/Entertainment";
import { buildCategoryMetadata } from "@/lib/categoryMetadata";

export const metadata = buildCategoryMetadata("entertainment");
export const revalidate = 30;

export default function Page() {
  return <Entertainment />;
}


