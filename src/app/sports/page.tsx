import Sports from "@/views/Sports";
import { buildCategoryMetadata } from "@/lib/categoryMetadata";

export const metadata = buildCategoryMetadata("sports");
export const revalidate = 60;

export default function Page() {
  return <Sports />;
}


