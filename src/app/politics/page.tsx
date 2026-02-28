import Politics from "@/views/Politics";
import { buildCategoryMetadata } from "@/lib/categoryMetadata";

export const metadata = buildCategoryMetadata("politics");
export const revalidate = 30;

export default function Page() {
  return <Politics />;
}


