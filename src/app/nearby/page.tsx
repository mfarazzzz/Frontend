import Nearby from "@/views/Nearby";
import { buildCategoryMetadata } from "@/lib/categoryMetadata";

export const metadata = buildCategoryMetadata("nearby");
export const revalidate = 60;

export default function Page() {
  return <Nearby />;
}


