import Crime from "@/views/Crime";
import { buildCategoryMetadata } from "@/lib/categoryMetadata";

export const metadata = buildCategoryMetadata("crime");
export const revalidate = 60;

export default function Page() {
  return <Crime />;
}


