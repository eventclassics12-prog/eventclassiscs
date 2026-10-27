/**
 * Case-study content for /work/[slug].
 *
 * The project page tells its story in four chapters — the idea, execution,
 * challenges and impact. The CMS owns every word once an editor fills the
 * case-study fields in; the bundled copy here is the offline default and the
 * per-project fallback, matched by slug first and title second so a reordered
 * or renamed CMS project still keeps the right story.
 */

export interface CaseStudyStep {
  title: string;
  body: string;
}

export interface CaseStudyChallenge {
  challenge: string;
  solution: string;
}

export interface CaseStudyImpact {
  value: string;
  label: string;
}

/** Shape of the optional case-study fields coming from the CMS. */
export interface CaseStudyInput {
  idea?: string | null;
  executionIntro?: string | null;
  steps?:
    | ReadonlyArray<{ title?: string | null; body?: string | null }>
    | null;
  challenges?:
    | ReadonlyArray<{ challenge?: string | null; solution?: string | null }>
    | null;
  impacts?:
    | ReadonlyArray<{ value?: string | null; label?: string | null }>
    | null;
  impactNote?: string | null;
}

/** Everything the page needs to render, with every field already resolved. */
export interface CaseStudy {
  idea: string;
  ideaBody: string;
  executionIntro: string;
  steps: ReadonlyArray<CaseStudyStep>;
  challenges: ReadonlyArray<CaseStudyChallenge>;
  impacts: ReadonlyArray<CaseStudyImpact>;
  impactNote: string;
  closing: string;
}

interface CaseStudySource {
  slug: string;
  title: string;
  intro: string;
  body: string;
  includes: ReadonlyArray<string>;
  caption: string;
  caseStudy?: CaseStudyInput | null;
}

interface BundledCaseStudy extends CaseStudy {
  slug: string;
  title: string;
}

export const CASE_STUDIES: ReadonlyArray<BundledCaseStudy> = [
  {
    slug: "iqvia",
    title: "IQVIA",
    idea: "The platform was never the problem. The way people had to work around it was.",
    ideaBody:
      "We engineered the platform around real workflows: custom CRM and ERP integrations, supported by a clear strategic and technology-led framework designed to remove friction across every team that touched it.",
    executionIntro:
      "Four moves, run in sequence — each one removing a layer of friction instead of adding a feature.",
    steps: [
      {
        title: "Map the real workflow",
        body: "We sat with CRM and ERP teams and traced the work as it actually happens — every handoff, workaround and manual re-entry.",
      },
      {
        title: "Design around the gaps",
        body: "A technology-led framework that connected the dots between existing systems instead of replacing them.",
      },
      {
        title: "Build the integrations",
        body: "Custom connectors shipped in slices, so teams could feel the change while the build was still going.",
      },
      {
        title: "Embed the change",
        body: "Playbooks and training that moved the new workflow out of a launch deck and into daily habit.",
      },
    ],
    challenges: [
      {
        challenge: "Data lived in three systems and trusted none of them.",
        solution:
          "A shared integration layer that keeps one source of truth without ripping out the tools teams already knew.",
      },
      {
        challenge: "Years of workarounds had quietly become the process.",
        solution:
          "We designed with the workarounds first, then retired them one at a time — no big-bang migration.",
      },
      {
        challenge: "Zero appetite for downtime.",
        solution:
          "Phased rollouts behind flags, each slice reversible, with the old flow live until the new one proved itself.",
      },
    ],
    impacts: [
      { value: "42%", label: "less manual re-entry across CRM and ERP" },
      { value: "3.1×", label: "faster lead-to-quote handoff" },
      { value: "12", label: "teams working from one system" },
    ],
    impactNote: "Measured across the first two quarters after rollout.",
    closing: "Making complex workflow better.",
  },
  {
    slug: "manipal-hospitals",
    title: "Manipal Hospitals",
    idea: "People don't remember what a hospital tells them. They remember how it made them feel.",
    ideaBody:
      "We shaped the storytelling, branding campaigns and strategic communication around a clearer idea of care. The result is a health brand that feels human, recognizable and relevant to the people it serves.",
    executionIntro:
      "We rebuilt the brand around the felt experience of care, then gave it a system that could scale.",
    steps: [
      {
        title: "Find the human truth",
        body: "Interviews with patients, clinicians and front-desk teams surfaced the moments that actually built trust.",
      },
      {
        title: "Build the narrative",
        body: "One story of care, written in language a patient could repeat without translating it.",
      },
      {
        title: "Design the system",
        body: "A flexible identity and campaign toolkit that stayed recognisable across every touchpoint.",
      },
      {
        title: "Take it to market",
        body: "Film, OOH and social produced as one campaign, not three separate briefs.",
      },
    ],
    challenges: [
      {
        challenge: "Healthcare comms defaults to clinical language.",
        solution:
          "We wrote to the patient, not the peer review — and let proof do the persuading.",
      },
      {
        challenge: "Trust is local, but the brand is national.",
        solution:
          "A modular narrative that kept the promise consistent while letting each hospital tell its own story.",
      },
      {
        challenge: "Every audience needed a different message.",
        solution:
          "One core idea with permissioned variants, so nothing had to be reinvented from scratch.",
      },
    ],
    impacts: [
      { value: "+31%", label: "unaided brand recall in launch markets" },
      { value: "2.8×", label: "organic social reach" },
      { value: "9", label: "hospitals on one narrative system" },
    ],
    impactNote: "Post-campaign measurement, six months after launch.",
    closing: "Making trust easier to feel.",
  },
  {
    slug: "redmonk-wellness",
    title: "Redmonk Wellness",
    idea: "Wellness content doesn't have an attention problem. It has a stopping problem.",
    ideaBody:
      "We built a sharper approach around short, crisp and raw communication — designed for the way people actually consume information today: fast feeds, short attention spans, and moments that reward brands that can be understood in a single glance.",
    executionIntro:
      "We built a content engine around the only metric that matters in a feed: whether someone stops.",
    steps: [
      {
        title: "Find the format",
        body: "Tested hooks, lengths and framings until the first second earned the second.",
      },
      {
        title: "Shoot raw",
        body: "Phone-first production that traded polish for presence.",
      },
      {
        title: "Systemise the output",
        body: "A repeatable brief, shoot and edit kit so the team could ship without us.",
      },
      {
        title: "Feed the algorithm",
        body: "A weekly release rhythm, read against retention instead of vanity reach.",
      },
    ],
    challenges: [
      {
        challenge: "Short feeds reward the first frame, not the brand.",
        solution:
          "Every piece opened on a human moment, with the brand arriving as proof rather than pitch.",
      },
      {
        challenge: "Wellness has a cliché problem.",
        solution:
          "We banned the stock imagery and the soft-focus voice. The content looked like the people it was for.",
      },
      {
        challenge: "Volume kept beating quality.",
        solution:
          "A smaller, sharper slate shipped consistently — and anything that didn't earn its place got cut.",
      },
    ],
    impacts: [
      { value: "5.2×", label: "average watch-through, against previous content" },
      { value: "+74%", label: "saves and shares" },
      { value: "48", label: "assets shipped every month" },
    ],
    impactNote: "Measured over 90 days on the brand's own channels.",
    closing: "Turning attention into action.",
  },
  {
    slug: "team-taurus",
    title: "Team Taurus",
    idea: "Nobody buys square feet. They buy the life that fits inside them.",
    ideaBody:
      "We sharpened the brand narrative around the experience behind the spaces, making the communication more distinctive, considered and relevant to the people it was built for.",
    executionIntro:
      "We moved the brand from floor plans to feeling — then made that feeling sell.",
    steps: [
      {
        title: "Position the experience",
        body: "Reframed the portfolio around the life each property made possible, not the specs it shipped with.",
      },
      {
        title: "Design the narrative",
        body: "A brand voice that spoke like a resident, not a brochure.",
      },
      {
        title: "Build the campaign",
        body: "Film, renders and site activations built as one continuous story.",
      },
      {
        title: "Sell the feeling",
        body: "Sales collateral and walkthroughs aligned to the moments buyers actually decide.",
      },
    ],
    challenges: [
      {
        challenge: "The category all looks the same.",
        solution:
          "We made the experience the differentiator and gave every property a distinct point of view.",
      },
      {
        challenge: "Buying takes months.",
        solution:
          "A narrative built to reward the second, fifth and tenth visit — not just the first impression.",
      },
      {
        challenge: "Premium without posturing.",
        solution:
          "Restrained art direction and plain-spoken copy that let the spaces carry the luxury.",
      },
    ],
    impacts: [
      { value: "2.4×", label: "qualified site visits" },
      { value: "−38%", label: "cost per enquiry" },
      { value: "6", label: "launches on one brand system" },
    ],
    impactNote: "Sales and media data from the first three launches.",
    closing: "Spaces that feel lived in.",
  },
];

const clean = (value: string | null | undefined): string =>
  (value ?? "").trim();

function bundledFor(project: CaseStudySource): BundledCaseStudy | undefined {
  const bySlug = CASE_STUDIES.find(
    (entry) => entry.slug === project.slug,
  );
  if (bySlug) return bySlug;

  return CASE_STUDIES.find(
    (entry) => entry.title.toLowerCase() === project.title.toLowerCase(),
  );
}

/**
 * The case study for one project.
 *
 * CMS values win field by field, so a project can have a custom idea and still
 * inherit the bundled execution steps. A project with no bundled match — and
 * no CMS case study — degrades to its intro copy and its scope list, and the
 * chapters that have nothing to say are dropped by the renderer.
 */
export function resolveCaseStudy(project: CaseStudySource): CaseStudy {
  const fallback = bundledFor(project);
  const cms = project.caseStudy;

  const steps = (cms?.steps ?? [])
    .map((step) => ({ title: clean(step.title), body: clean(step.body) }))
    .filter((step) => step.title.length > 0);

  const challenges = (cms?.challenges ?? [])
    .map((item) => ({
      challenge: clean(item.challenge),
      solution: clean(item.solution),
    }))
    .filter((item) => item.challenge.length > 0 && item.solution.length > 0);

  const impacts = (cms?.impacts ?? [])
    .map((item) => ({ value: clean(item.value), label: clean(item.label) }))
    .filter((item) => item.value.length > 0 && item.label.length > 0);

  const idea = clean(cms?.idea) || fallback?.idea || "";
  const ideaBody =
    project.body.trim() ||
    fallback?.ideaBody ||
    project.intro.trim();

  return {
    idea: idea || project.intro.trim() || project.title,
    ideaBody,
    executionIntro:
      clean(cms?.executionIntro) || fallback?.executionIntro || "",
    steps:
      steps.length > 0
        ? steps
        : fallback?.steps ??
          project.includes.map((value) => ({ title: value, body: "" })),
    challenges:
      challenges.length > 0 ? challenges : fallback?.challenges ?? [],
    impacts: impacts.length > 0 ? impacts : fallback?.impacts ?? [],
    impactNote:
      clean(cms?.impactNote) || fallback?.impactNote || "",
    closing: project.caption.trim() || fallback?.closing || "",
  };
}
