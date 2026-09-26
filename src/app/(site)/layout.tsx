import type { Metadata, Viewport } from "next";
import { SmoothScroll } from "@/components/SmoothScroll";
import { helveticaNeue } from "@/styles/fonts";
import { getGlobal, type SiteSettingsData } from "@/lib/cms-server";
import { buildMetadata, organizationJsonLd } from "@/lib/seo";
import "../globals.css";

export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export async function generateMetadata(): Promise<Metadata> {
  const site = await getGlobal<SiteSettingsData>("site-settings");
  return buildMetadata(site, {
    title:
      site?.seoTitle?.trim() ||
      `${site?.brandName?.trim() || "EVENTCLASSICS"} — Idea to Impact`,
    description:
      site?.seoDescription?.trim() ||
      "Strategic brand-building firm. We close the gap between what you've built and what the market thinks you've built.",
    path: "/",
  });
}

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const site = await getGlobal<SiteSettingsData>("site-settings");
  return (
    <html
      lang="en"
      className={`${helveticaNeue.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd(site)),
          }}
        />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
