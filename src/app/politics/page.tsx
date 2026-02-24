import Politics from "@/views/Politics";
import { buildCategoryMetadata } from "@/lib/categoryMetadata";

export const metadata = buildCategoryMetadata("politics");
export const revalidate = 60;

export default function Page() {
  return <Politics />;
}


