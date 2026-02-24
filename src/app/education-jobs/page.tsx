import EducationHub from "@/views/education/EducationHub";
import { buildCategoryMetadata } from "@/lib/categoryMetadata";

export const metadata = buildCategoryMetadata("education-jobs");
export const revalidate = 60;

export default function Page() {
  return <EducationHub />;
}


