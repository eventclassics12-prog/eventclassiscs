import type { Metadata } from "next";
import { ServicesPage } from "@/components/ServicesPage";
import { ServicesHeader } from "@/components/ServicesHeader";
import { FinalCta } from "@/components/FinalCta";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";

export const metadata: Metadata = {
  title: "EVENTCLASSICS — Services",
  description:
    "Brand identity, growth strategy, social media and content creation — connected as one brand system.",
};

export default function Services() {
  return (
    <PageTransition>
      <ServicesHeader currentPage="services" />
      <ServicesPage />
      <FinalCta />
      <Footer />
    </PageTransition>
  );
}
