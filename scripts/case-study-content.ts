import { CASE_STUDIES } from '../src/lib/case-studies'

export interface CaseStudySeedFields {
  idea: string
  executionIntro: string
  executionSteps: Array<{ title: string; body: string }>
  challenges: Array<{ challenge: string; solution: string }>
  impactStats: Array<{ value: string; label: string }>
  impactNote: string
}

/**
 * The bundled case study, shaped for the page-work projects array.
 *
 * Shared by the full seed and the case-study backfill so the two can never
 * drift apart. Returns null for a project with no bundled story.
 */
export function caseStudySeedFields(
  title: string,
): CaseStudySeedFields | null {
  const entry = CASE_STUDIES.find(
    (item) => item.title.toLowerCase() === title.trim().toLowerCase(),
  )
  if (!entry) return null

  return {
    idea: entry.idea,
    executionIntro: entry.executionIntro,
    executionSteps: entry.steps.map((step) => ({
      title: step.title,
      body: step.body,
    })),
    challenges: entry.challenges.map((item) => ({
      challenge: item.challenge,
      solution: item.solution,
    })),
    impactStats: entry.impacts.map((item) => ({
      value: item.value,
      label: item.label,
    })),
    impactNote: entry.impactNote,
  }
}
