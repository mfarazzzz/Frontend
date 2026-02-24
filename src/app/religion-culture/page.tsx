import ReligionCulture from "@/views/ReligionCulture";
import { buildCategoryMetadata } from "@/lib/categoryMetadata";

export const metadata = buildCategoryMetadata("religion-culture");
export const revalidate = 60;

export default function Page() {
  return <ReligionCulture />;
}


