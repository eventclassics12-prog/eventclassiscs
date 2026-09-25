import type { Metadata } from "next";
import { BlogPage } from "@/components/BlogPage";
import { ServicesHeader } from "@/components/ServicesHeader";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import {
  getGlobal,
  getPosts,
  type SiteSettingsData,
} from "@/lib/cms-server";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getGlobal<SiteSettingsData>("site-settings");
  const brand = site?.brandName ?? "EVENTCLASSICS";
  return buildMetadata(site, {
    title: `${brand} — Journal`,
    description:
      "Notes on building brands people remember — strategy, identity and launches from the EventClassics studio.",
    path: "/blog",
  });
}

export default async function Blog() {
  const [posts, site] = await Promise.all([
    getPosts(),
    getGlobal<SiteSettingsData>("site-settings"),
  ]);

  return (
    <PageTransition>
      <ServicesHeader currentPage="blog" site={site} />
      <BlogPage posts={posts.filter((post) => post.slug)} />
      <Footer site={site} />
    </PageTransition>
  );
}
