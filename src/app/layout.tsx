import type { Metadata } from "next";
import { SmoothScroll } from "@/components/SmoothScroll";
import { helveticaNeue, bricolage } from "@/styles/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "EVENTCLASSICS — Idea to Impact",
  description:
    "Strategic brand-building firm. We close the gap between what you've built and what the market thinks you've built.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${helveticaNeue.variable} ${bricolage.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col text-foreground">
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
