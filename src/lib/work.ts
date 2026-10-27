import {
  mediaAlt,
  mediaUrl,
  type PageWorkData,
  type TextPart,
} from "@/lib/cms";
import type { CaseStudyInput } from "@/lib/case-studies";

export interface WorkDiagramItem {
  title: string;
  note?: string;
}

/** Copy for the connected-approach diagram on a project page. */
export interface WorkDiagram {
  /** The “A connected approach” caption is hidden for this project. */
  hideCaption: boolean;
  triggerLabel?: string;
  eyebrow?: string;
  title?: string;
  note?: string;
  itemsLabel?: string;
  items: ReadonlyArray<WorkDiagramItem>;
}

export interface WorkProject {
  /** Stable URL segment for /work/[slug]. */
  slug: string;
  title: string;
  kicker: Array<[string, string?]>;
  intro: string;
  body: string;
  includes: ReadonlyArray<string>;
  caption: string;
  /** Highlights the Flagship word above the title in the standard work card. */
  flagship: boolean;
  /** Pills printed over the board image; empty means derive from includes. */
  cardTags: ReadonlyArray<string>;
  diagram: WorkDiagram;
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
    flagship: false,
    cardTags: ["CRM & ERP", "Systems"],
    diagram: {
      hideCaption: true,
      triggerLabel: "Brief",
      eyebrow: "Integration layer",
      title: "Connected workflows",
      note: "Built around the business",
      itemsLabel: "Integrated systems",
      items: [
        { title: "CRM", note: "Customer workflows" },
        { title: "ERP", note: "Business operations" },
        { title: "Teams", note: "Clearer handoffs" },
        { title: "Processes", note: "Less friction" },
      ],
    },
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
    flagship: true,
    cardTags: ["Storytelling", "Branding"],
    diagram: { hideCaption: false, items: [] },
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
    flagship: false,
    cardTags: ["Content", "Social"],
    diagram: { hideCaption: false, items: [] },
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
    flagship: false,
    cardTags: ["Brand Identity"],
    diagram: { hideCaption: false, items: [] },
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
 * Falls back to bundled PROJECTS when the CMS has not supplied a project list.
 * Slugs are de-duplicated, because two projects with the same title would
 * otherwise collide on the URL and on the React key.
 */
export function resolveProjects(
  data: PageWorkData | null | undefined,
): ReadonlyArray<WorkProject> {
  const cmsProjects = (data?.projects ?? []).filter(
    (p): p is CmsWorkProject => Boolean(p && (p.title || p.image)),
  );
  if (cmsProjects.length === 0) return data?.projects != null ? [] : PROJECTS;

  const used = new Set<string>();

  return cmsProjects.map((p, index) => {
    const kickerParts = p.kickerParts ?? [];
    const includes = (p.includes ?? [])
      .map((item) => item.value ?? "")
      .filter((value) => value.length > 0);
    const title = p.title ?? "";

    let slug = slugify(p.slug?.trim() || title) || `project-${index + 1}`;
    if (used.has(slug)) {
      let suffix = 2;
      while (used.has(`${slug}-${suffix}`)) suffix += 1;
      slug = `${slug}-${suffix}`;
    }
    used.add(slug);

    const diagram = p.diagram;

    return {
      slug,
      title,
      kicker: fromParts(kickerParts),
      intro: p.intro ?? "",
      body: p.body ?? "",
      includes,
      caption: p.caption ?? "",
      flagship: p.flagship === true,
      cardTags: (p.cardTags ?? [])
        .map((tag) => tag.value?.trim() ?? "")
        .filter((value) => value.length > 0),
      diagram: {
        hideCaption: diagram?.hideCaption === true,
        triggerLabel: diagram?.triggerLabel?.trim() || undefined,
        eyebrow: diagram?.eyebrow?.trim() || undefined,
        title: diagram?.title?.trim() || undefined,
        note: diagram?.note?.trim() || undefined,
        itemsLabel: diagram?.itemsLabel?.trim() || undefined,
        items: (diagram?.items ?? [])
          .map((item) => ({
            title: item.title?.trim() ?? "",
            note: item.note?.trim() || undefined,
          }))
          .filter((item) => item.title.length > 0),
      },
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

/** Copy that repeats across the work board and every project page. */
export interface WorkLabels {
  workPillLabel: string;
  backLabel: string;
  nextLabel: string;
  approachEyebrow: string;
  approachLinkLabel: string;
  includesLabel: string;
  caseStudyLabel: string;
  ideaLabel: string;
  executionLabel: string;
  challengesLabel: string;
  challengesNote: string;
  challengeColumnLabel: string;
  solutionColumnLabel: string;
  impactLabel: string;
  diagramCaption: string;
  diagramTriggerLabel: string;
  diagramRootEyebrow: string;
  diagramRootNote: string;
  diagramItemsLabel: string;
}

/** Mirrors the CMS defaults, so an unconfigured global still reads correctly. */
const WORK_LABELS: WorkLabels = {
  workPillLabel: "Work",
  backLabel: "All work",
  nextLabel: "Next project",
  approachEyebrow: "The approach",
  approachLinkLabel: "Explore the approach",
  includesLabel: "Includes:",
  caseStudyLabel: "Case study",
  ideaLabel: "The idea",
  executionLabel: "Execution",
  challengesLabel: "Challenges",
  challengesNote: "What we faced, and how we solved it.",
  challengeColumnLabel: "The challenge",
  solutionColumnLabel: "How we solved it",
  impactLabel: "Impact",
  diagramCaption: "A connected approach",
  diagramTriggerLabel: "Brief",
  diagramRootEyebrow: "Brand system",
  diagramRootNote: "Strategy into expression",
  diagramItemsLabel: "Connected disciplines",
};

export function resolveWorkLabels(
  data: PageWorkData | null | undefined,
): WorkLabels {
  const text = (value: string | null | undefined, fallback: string) =>
    value?.trim() || fallback;

  return {
    workPillLabel: text(data?.workPillLabel, WORK_LABELS.workPillLabel),
    backLabel: text(data?.backLabel, WORK_LABELS.backLabel),
    nextLabel: text(data?.nextLabel, WORK_LABELS.nextLabel),
    approachEyebrow: text(data?.approachEyebrow, WORK_LABELS.approachEyebrow),
    approachLinkLabel: text(
      data?.approachLinkLabel,
      WORK_LABELS.approachLinkLabel,
    ),
    includesLabel: text(data?.includesLabel, WORK_LABELS.includesLabel),
    caseStudyLabel: text(data?.caseStudyLabel, WORK_LABELS.caseStudyLabel),
    ideaLabel: text(data?.ideaLabel, WORK_LABELS.ideaLabel),
    executionLabel: text(data?.executionLabel, WORK_LABELS.executionLabel),
    challengesLabel: text(data?.challengesLabel, WORK_LABELS.challengesLabel),
    challengesNote: text(data?.challengesNote, WORK_LABELS.challengesNote),
    challengeColumnLabel: text(
      data?.challengeColumnLabel,
      WORK_LABELS.challengeColumnLabel,
    ),
    solutionColumnLabel: text(
      data?.solutionColumnLabel,
      WORK_LABELS.solutionColumnLabel,
    ),
    impactLabel: text(data?.impactLabel, WORK_LABELS.impactLabel),
    diagramCaption: text(data?.diagramCaption, WORK_LABELS.diagramCaption),
    diagramTriggerLabel: text(
      data?.diagramTriggerLabel,
      WORK_LABELS.diagramTriggerLabel,
    ),
    diagramRootEyebrow: text(
      data?.diagramRootEyebrow,
      WORK_LABELS.diagramRootEyebrow,
    ),
    diagramRootNote: text(
      data?.diagramRootNote,
      WORK_LABELS.diagramRootNote,
    ),
    diagramItemsLabel: text(
      data?.diagramItemsLabel,
      WORK_LABELS.diagramItemsLabel,
    ),
  };
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
