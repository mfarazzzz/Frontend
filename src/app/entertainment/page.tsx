import Entertainment from "@/views/Entertainment";
import { buildCategoryMetadata } from "@/lib/categoryMetadata";

export const metadata = buildCategoryMetadata("entertainment");
export const revalidate = 60;

export default function Page() {
  return <Entertainment />;
}


