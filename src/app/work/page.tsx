import type { Metadata } from "next";
import { ServicesHeader } from "@/components/ServicesHeader";
import { WorkPage } from "@/components/WorkPage";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";

export const metadata: Metadata = {
  title: "Our Work — Event Classics",
  description:
    "Case studies from IQVIA, Manipal Hospitals, Redmonk Wellness and Team Taurus — brand systems, content and platforms that shipped.",
};

export default function Work() {
  return (
    <PageTransition>
      <ServicesHeader currentPage="work" />
      <WorkPage />
      <Footer />
    </PageTransition>
  );
}
