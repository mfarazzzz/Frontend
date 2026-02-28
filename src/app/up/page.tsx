import UPPage from "@/views/UP";
import { buildCategoryMetadata } from "@/lib/categoryMetadata";

export const metadata = buildCategoryMetadata("up");
export const revalidate = 30;

export default function Page() {
  return <UPPage />;
}


