import type { Metadata } from "next";
import { ServicesPage } from "@/components/ServicesPage";
import { FinalCta } from "@/components/FinalCta";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "EVENTCLASSICS — Services",
  description:
    "Brand identity, growth strategy, social media and content creation — connected as one brand system.",
};

export default function Services() {
  return (
    <>
      <ServicesPage />
      <FinalCta />
      <Footer />
    </>
  );
}
