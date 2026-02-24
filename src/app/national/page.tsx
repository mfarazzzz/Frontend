import National from "@/views/National";
import { buildCategoryMetadata } from "@/lib/categoryMetadata";

export const metadata = buildCategoryMetadata("national");
export const revalidate = 60;

export default function Page() {
  return <National />;
}


