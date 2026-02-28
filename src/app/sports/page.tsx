import Sports from "@/views/Sports";
import { buildCategoryMetadata } from "@/lib/categoryMetadata";

export const metadata = buildCategoryMetadata("sports");
export const revalidate = 30;

export default function Page() {
  return <Sports />;
}


