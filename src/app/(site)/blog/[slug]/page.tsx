import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogPostPage } from "@/components/BlogPostPage";
import { ServicesHeader } from "@/components/ServicesHeader";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import {
  getGlobal,
  getPostBySlug,
  type SiteSettingsData,
} from "@/lib/cms-server";
import { mediaUrl } from "@/lib/cms";
import { postDescription } from "@/lib/blog";
import { absoluteUrl, buildMetadata } from "@/lib/seo";

interface BlogPostRouteProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: BlogPostRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const [post, site] = await Promise.all([
    getPostBySlug(slug),
    getGlobal<SiteSettingsData>("site-settings"),
  ]);

  if (!post?.slug) {
    return buildMetadata(site, {
      title: "Post not found",
      description: "This journal post does not exist.",
      path: `/blog/${slug}`,
      noIndex: true,
    });
  }

  const brand = site?.brandName ?? "EVENTCLASSICS";
  return buildMetadata(site, {
    title: `${post.seoTitle?.trim() || post.title} — ${brand}`,
    description: postDescription(post),
    path: `/blog/${post.slug}`,
    image: mediaUrl(post.coverImage),
  });
}

export default async function BlogPostRoute({ params }: BlogPostRouteProps) {
  const { slug } = await params;
  const [post, site] = await Promise.all([
    getPostBySlug(slug),
    getGlobal<SiteSettingsData>("site-settings"),
  ]);
  if (!post?.slug) notFound();

  const brand = site?.brandName?.trim() || "EVENTCLASSICS";
  const coverSrc = mediaUrl(post.coverImage);
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: postDescription(post),
    author: { "@type": "Organization", name: brand },
    mainEntityOfPage: absoluteUrl(site, `/blog/${post.slug}`),
    ...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
    ...(coverSrc ? { image: [absoluteUrl(site, coverSrc)] } : {}),
  };

  return (
    <PageTransition>
      <ServicesHeader currentPage="blog" site={site} />
      <BlogPostPage post={post} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Footer site={site} />
    </PageTransition>
  );
}
