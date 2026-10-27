import {
  mediaAlt,
  mediaUrl,
  type PageWorkData,
  type TextPart,
} from "@/lib/cms";
import type { CaseStudyInput } from "@/lib/case-studies";

export interface WorkProject {
  /** Stable URL segment for /work/[slug]. */
  slug: string;
  title: string;
  kicker: Array<[string, string?]>;
  intro: string;
  body: string;
  includes: ReadonlyArray<string>;
  caption: string;
  /** Empty string when the CMS has no usable media for this project. */
  image: string;
  alt: string;
  /** CMS-owned case-study copy; empty fields fall back to the bundled story. */
  caseStudy?: CaseStudyInput | null;
}

/**
 * The bundled copy for the four projects.
 *
 * This is the fallback the site renders when the CMS global has no projects
 * configured, and it also owns the artwork mapping used when a CMS image
 * fails to load. The copy duplicates CMS-owned fields — the CMS is the source
 * of truth once it has content, and this is the offline default.
 */
export const PROJECTS: ReadonlyArray<WorkProject> = [
  {
    slug: "iqvia",
    title: "IQVIA",
    kicker: [
      ["Systems that "],
      ["work around the business.", "blue"],
    ],
    intro:
      "IQVIA didn't need another efficiency promise. It needed systems built around the business — not bolted onto it.",
    body: "We engineered the platform around real workflows: custom CRM and ERP integrations, supported by a clear strategic and technology-led framework designed to remove friction across every team that touched it.",
    includes: [
      "Workflow mapping across CRM & ERP teams",
      "Custom systems integration",
      "Technology-led strategic frameworks",
      "Friction-reduction audits",
    ],
    caption: "Making complex workflow better.",
    image: "/services/growth-strategy.png",
    alt: "IQVIA project — crystal growth visual",
  },
  {
    slug: "manipal-hospitals",
    title: "Manipal Hospitals",
    kicker: [["Making "], ["trust", "blue"], [" easier to feel."]],
    intro:
      "Healthcare is full of information, but people don't remember information — they remember how a brand made them feel.",
    body: "We shaped the storytelling, branding campaigns and strategic communication around a clearer idea of care. The result is a health brand that feels human, recognizable and relevant to the people it serves.",
    includes: [
      "Brand storytelling & narrative system",
      "Campaign design & production",
      "Strategic communication",
      "Care-experience messaging",
    ],
    caption: "Making trust easier to feel.",
    image: "/services/content-creation.png",
    alt: "Manipal Hospitals project — film camera visual",
  },
  {
    slug: "redmonk-wellness",
    title: "Redmonk Wellness",
    kicker: [["Content that feels "], ["worth stopping for.", "blue"]],
    intro:
      "Wellness brands don't need more content. They need content that feels worth stopping for.",
    body: "We built a sharper approach around short, crisp and raw communication — designed for the way people actually consume information today: fast feeds, short attention spans, and moments that reward brands that can be understood in a single glance.",
    includes: [
      "Short-form content strategy",
      "Raw, crisp communication",
      "Attention-first formats",
      "Community & channel voice",
    ],
    caption: "Turning attention into action.",
    image: "/services/social-media.png",
    alt: "Redmonk Wellness project — pink network visual",
  },
  {
    slug: "team-taurus",
    title: "Team Taurus",
    kicker: [["Spaces that feel "], ["lived in.", "blue"]],
    intro:
      "Real estate is often reduced to location, price and square feet. People don't buy spaces like spreadsheets — they imagine what it will feel like to live there.",
    body: "We sharpened the brand narrative around the experience behind the spaces, making the communication more distinctive, considered and relevant to the people it was built for.",
    includes: [
      "Brand narrative & positioning",
      "Experience-led campaigns",
      "Distinctive communication design",
      "Considered spatial voice",
    ],
    caption: "Spaces that feel lived in.",
    image: "/services/brand-identity.png",
    alt: "Team Taurus project — clay identity mark",
  },
];

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const fromParts = (parts: TextPart[]): Array<[string, string?]> =>
  parts.map((part) => [part.text ?? "", part.highlight ? "blue" : undefined]);

type CmsWorkProject = NonNullable<NonNullable<PageWorkData["projects"]>[number]>;

/**
 * Resolve the work page's projects from the CMS global.
 *
 * Falls back to the bundled PROJECTS when the CMS has no projects configured.
 * Slugs are de-duplicated, because two projects with the same title would
 * otherwise collide on the URL and on the React key.
 */
export function resolveProjects(
  data: PageWorkData | null | undefined,
): ReadonlyArray<WorkProject> {
  const cmsProjects = (data?.projects ?? []).filter(
    (p): p is CmsWorkProject => Boolean(p && (p.title || p.image)),
  );
  if (cmsProjects.length === 0) return PROJECTS;

  const used = new Set<string>();

  return cmsProjects.map((p, index) => {
    const kickerParts = p.kickerParts ?? [];
    const includes = (p.includes ?? [])
      .map((item) => item.value ?? "")
      .filter((value) => value.length > 0);
    const title = p.title ?? "";

    let slug = slugify(title) || `project-${index + 1}`;
    if (used.has(slug)) {
      let suffix = 2;
      while (used.has(`${slug}-${suffix}`)) suffix += 1;
      slug = `${slug}-${suffix}`;
    }
    used.add(slug);

    return {
      slug,
      title,
      kicker: fromParts(kickerParts),
      intro: p.intro ?? "",
      body: p.body ?? "",
      includes,
      caption: p.caption ?? "",
      image: mediaUrl(p.image) ?? "",
      alt: p.alt ?? mediaAlt(p.image, title),
      caseStudy: {
        idea: p.idea ?? "",
        executionIntro: p.executionIntro ?? "",
        steps: p.executionSteps ?? [],
        challenges: p.challenges ?? [],
        impacts: p.impactStats ?? [],
        impactNote: p.impactNote ?? "",
      },
    };
  });
}

export function findProjectBySlug(
  projects: ReadonlyArray<WorkProject>,
  slug: string,
): WorkProject | undefined {
  return projects.find((project) => project.slug === slug);
}

/**
 * Bundled static artwork for a project, used when the CMS image fails to load.
 *
 * The CMS points each project at a Vercel Blob object; those objects can go
 * missing while the media record survives, which leaves a broken image. The
 * bundled assets under /public/services are the same artwork, so fall back to
 * those. Matched by title first — a reordered CMS list still resolves to the
 * right file — and by position only as a last resort.
 */
export function fallbackImageFor(
  project: WorkProject,
  index: number,
): string | undefined {
  const byTitle = PROJECTS.find(
    (candidate) =>
      candidate.title.toLowerCase() === project.title.toLowerCase(),
  );
  return byTitle?.image ?? PROJECTS[index]?.image;
}
