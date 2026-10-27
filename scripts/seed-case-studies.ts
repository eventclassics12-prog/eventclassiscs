import { randomBytes } from 'node:crypto'
import { getPayload } from 'payload'
import config from '../payload.config'
import {
  caseStudySeedFields,
  type CaseStudySeedFields,
} from './case-study-content'

/**
 * Backfill the four case-study chapters on the existing /work projects.
 *
 * Run after the case_study_sections migration on a database that already has
 * the project rows. Only case-study fields are written; titles, artwork and
 * every other CMS value are carried through untouched.
 *
 * The write goes through the adapter's pool rather than the local API: the
 * media upload field runs a filterOptions access check that needs a Next
 * request context, so a standalone `updateGlobal` call fails validation
 * outside the app. The array tables are simple, so the rows are written
 * directly, in one transaction.
 */

interface Queryable {
  query: (
    text: string,
    values?: unknown[],
  ) => Promise<{ rows: Array<Record<string, unknown>> }>
}

interface ProjectRow {
  id: string
  title: string
}

const newId = () => randomBytes(12).toString('hex')

async function main() {
  if (process.env.NODE_ENV !== 'production') {
    throw new Error('Run with NODE_ENV=production to avoid automatic schema changes.')
  }

  const payload = await getPayload({ config })
  const db = (payload.db as unknown as { pool?: Queryable }).pool
  if (!db) throw new Error('The Postgres adapter did not expose a pool.')

  const { rows } = await db.query(
    'select id, title from page_work_projects order by _order',
  )
  const projects = rows as unknown as ProjectRow[]
  if (projects.length === 0) {
    throw new Error('No projects on page-work. Seed the page first.')
  }

  const updates = projects
    .map((project) => ({ project, fields: caseStudySeedFields(project.title) }))
    .filter(
      (entry): entry is { project: ProjectRow; fields: CaseStudySeedFields } =>
        entry.fields !== null,
    )

  if (updates.length === 0) {
    throw new Error('No bundled case study matches the current project titles.')
  }

  if (process.argv.includes('--dry-run')) {
    console.log(
      JSON.stringify(
        {
          covered: updates.map((entry) => entry.project.title),
          missing: projects
            .filter((project) => !updates.some((entry) => entry.project.id === project.id))
            .map((project) => project.title),
        },
        null,
        2,
      ),
    )
    return
  }

  await db.query('begin')
  try {
    for (const { project, fields } of updates) {
      await db.query(
        `update page_work_projects
           set idea = $1, execution_intro = $2, impact_note = $3
         where id = $4`,
        [fields.idea, fields.executionIntro, fields.impactNote, project.id],
      )

      await db.query(
        'delete from page_work_projects_execution_steps where _parent_id = $1',
        [project.id],
      )
      for (const [order, step] of fields.executionSteps.entries()) {
        await db.query(
          `insert into page_work_projects_execution_steps
             (_order, _parent_id, id, title, body)
           values ($1, $2, $3, $4, $5)`,
          [order + 1, project.id, newId(), step.title, step.body],
        )
      }

      await db.query(
        'delete from page_work_projects_challenges where _parent_id = $1',
        [project.id],
      )
      for (const [order, item] of fields.challenges.entries()) {
        await db.query(
          `insert into page_work_projects_challenges
             (_order, _parent_id, id, challenge, solution)
           values ($1, $2, $3, $4, $5)`,
          [order + 1, project.id, newId(), item.challenge, item.solution],
        )
      }

      await db.query(
        'delete from page_work_projects_impact_stats where _parent_id = $1',
        [project.id],
      )
      for (const [order, stat] of fields.impactStats.entries()) {
        await db.query(
          `insert into page_work_projects_impact_stats
             (_order, _parent_id, id, value, label)
           values ($1, $2, $3, $4, $5)`,
          [order + 1, project.id, newId(), stat.value, stat.label],
        )
      }
    }

    await db.query('update page_work set updated_at = now() where id = 1')
    await db.query('commit')
  } catch (error) {
    await db.query('rollback')
    throw error
  } finally {
    await payload.destroy()
  }

  console.log(
    `Seeded case studies for ${updates.length} project(s): ${updates
      .map((entry) => entry.project.title)
      .join(', ')}.`,
  )
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
