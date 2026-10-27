import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { WorkProjectPage } from "@/components/WorkProjectPage";
import { ServicesHeader } from "@/components/ServicesHeader";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import {
  getGlobal,
  type PageWorkData,
  type SiteSettingsData,
} from "@/lib/cms-server";
import { buildMetadata } from "@/lib/seo";
import {
  findProjectBySlug,
  resolveProjects,
  resolveWorkLabels,
} from "@/lib/work";

export const revalidate = 300;

// Project pages are generated on first request, then served from the cache.
export function generateStaticParams() {
  return [];
}

interface WorkProjectRouteProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: WorkProjectRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const [site, data] = await Promise.all([
    getGlobal<SiteSettingsData>("site-settings"),
    getGlobal<PageWorkData>("page-work"),
  ]);

  const project = findProjectBySlug(resolveProjects(data), slug);

  if (!project) {
    return buildMetadata(site, {
      title: "Project not found",
      description: "This project does not exist.",
      path: `/work/${slug}`,
      noIndex: true,
    });
  }

  const brand = site?.brandName?.trim() || "EVENTCLASSICS";
  return buildMetadata(site, {
    title: `${project.title} — ${brand}`,
    description:
      project.intro.trim() ||
      `Selected work from ${brand}: ${project.title}.`,
    image: project.image || undefined,
    path: `/work/${project.slug}`,
  });
}

export default async function WorkProjectRoute({ params }: WorkProjectRouteProps) {
  const { slug } = await params;
  const [site, data] = await Promise.all([
    getGlobal<SiteSettingsData>("site-settings"),
    getGlobal<PageWorkData>("page-work"),
  ]);

  const projects = resolveProjects(data);
  const index = projects.findIndex((project) => project.slug === slug);
  if (index === -1) notFound();

  const project = projects[index];
  const next = projects[(index + 1) % projects.length];

  return (
    <PageTransition>
      <ServicesHeader currentPage="work" site={site} />
      <WorkProjectPage
        project={project}
        index={index}
        next={next}
        labels={resolveWorkLabels(data)}
      />
      <Footer site={site} />
    </PageTransition>
  );
}
