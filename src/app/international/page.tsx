import International from "@/views/International";
import { buildCategoryMetadata } from "@/lib/categoryMetadata";

export const metadata = buildCategoryMetadata("international");
export const revalidate = 30;

export default function Page() {
  return <International />;
}
