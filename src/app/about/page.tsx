import type { Metadata } from "next";
import { AboutPage } from "@/components/AboutPage";
import { ServicesHeader } from "@/components/ServicesHeader";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";

export const metadata: Metadata = {
  title: "EVENTCLASSICS — About Us",
  description:
    "A strategic brand-building partner for founders with momentum. Embedded, lean, output-oriented design from idea to impact.",
};

export default function About() {
  return (
    <PageTransition>
      <ServicesHeader currentPage="about" />
      <AboutPage />
      <Footer />
    </PageTransition>
  );
}
