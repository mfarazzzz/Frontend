import { Metadata } from "next";
import AdManager from "./AdManager";

export const metadata: Metadata = {
  title: "Ad Manager | रामपुर न्यूज़",
  description: "Manage advertisements on Rampur News",
};

export default function AdManagerPage() {
  return <AdManager />;
}
