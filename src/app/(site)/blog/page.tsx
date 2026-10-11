import { mediaUrl } from "@/lib/cms";
import type { Metadata } from "next";
import { BlogPage } from "@/components/BlogPage";
import { ServicesHeader } from "@/components/ServicesHeader";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import {
  getGlobal,
  getPosts,
  type SiteSettingsData,
  type PageBlogData,
} from "@/lib/cms-server";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const [site, data] = await Promise.all([
    getGlobal<SiteSettingsData>("site-settings"),
    getGlobal<PageBlogData>("page-blog"),
  ]);
  const brand = site?.brandName ?? "EVENTCLASSICS";
  return buildMetadata(site, {
    title: data?.seoTitle?.trim() || `${brand} — Journal`,
    description: data?.seoDescription?.trim() ||
      "Notes on building brands people remember — strategy, identity and launches from the EventClassics studio.",
    image: mediaUrl(data?.ogImage),
    path: "/blog",
  });
}

export default async function Blog() {
  const [posts, site, data] = await Promise.all([
    getPosts(),
    getGlobal<SiteSettingsData>("site-settings"),
    getGlobal<PageBlogData>("page-blog"),
  ]);

  return (
    <PageTransition>
      <ServicesHeader currentPage="blog" site={site} />
      <BlogPage posts={posts.filter((post) => post.slug)} data={data} />
      <Footer site={site} />
    </PageTransition>
  );
}
