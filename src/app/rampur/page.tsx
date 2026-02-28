import RampurPage from "@/views/Rampur";
import { buildCategoryMetadata } from "@/lib/categoryMetadata";

export const metadata = buildCategoryMetadata("rampur");
export const revalidate = 30;

export default function Page() {
  return <RampurPage />;
}


