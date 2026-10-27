/**
 * Work page controls: project slugs, the flagship flag, card tags, the
 * per-project diagram block and the shared label set.
 *
 * Written idempotently. Development databases are kept in sync by Payload's
 * push, so the first four migrations are already applied there by the time
 * this one runs; every statement below is a no-op when the object exists.
 */
import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "page_work_projects_card_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL
  );

  CREATE TABLE IF NOT EXISTS "page_work_projects_diagram_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"note" varchar
  );

  ALTER TABLE "page_work_projects" ADD COLUMN IF NOT EXISTS "slug" varchar;
  ALTER TABLE "page_work_projects" ADD COLUMN IF NOT EXISTS "flagship" boolean DEFAULT false;
  ALTER TABLE "page_work_projects" ADD COLUMN IF NOT EXISTS "diagram_hide_caption" boolean DEFAULT false;
  ALTER TABLE "page_work_projects" ADD COLUMN IF NOT EXISTS "diagram_trigger_label" varchar;
  ALTER TABLE "page_work_projects" ADD COLUMN IF NOT EXISTS "diagram_eyebrow" varchar;
  ALTER TABLE "page_work_projects" ADD COLUMN IF NOT EXISTS "diagram_title" varchar;
  ALTER TABLE "page_work_projects" ADD COLUMN IF NOT EXISTS "diagram_note" varchar;
  ALTER TABLE "page_work_projects" ADD COLUMN IF NOT EXISTS "diagram_items_label" varchar;
  ALTER TABLE "page_work" ADD COLUMN IF NOT EXISTS "work_pill_label" varchar DEFAULT 'Work';
  ALTER TABLE "page_work" ADD COLUMN IF NOT EXISTS "back_label" varchar DEFAULT 'All work';
  ALTER TABLE "page_work" ADD COLUMN IF NOT EXISTS "next_label" varchar DEFAULT 'Next project';
  ALTER TABLE "page_work" ADD COLUMN IF NOT EXISTS "approach_eyebrow" varchar DEFAULT 'The approach';
  ALTER TABLE "page_work" ADD COLUMN IF NOT EXISTS "approach_link_label" varchar DEFAULT 'Explore the approach';
  ALTER TABLE "page_work" ADD COLUMN IF NOT EXISTS "case_study_label" varchar DEFAULT 'Case study';
  ALTER TABLE "page_work" ADD COLUMN IF NOT EXISTS "idea_label" varchar DEFAULT 'The idea';
  ALTER TABLE "page_work" ADD COLUMN IF NOT EXISTS "execution_label" varchar DEFAULT 'Execution';
  ALTER TABLE "page_work" ADD COLUMN IF NOT EXISTS "challenges_label" varchar DEFAULT 'Challenges';
  ALTER TABLE "page_work" ADD COLUMN IF NOT EXISTS "challenges_note" varchar DEFAULT 'What we faced, and how we solved it.';
  ALTER TABLE "page_work" ADD COLUMN IF NOT EXISTS "challenge_column_label" varchar DEFAULT 'The challenge';
  ALTER TABLE "page_work" ADD COLUMN IF NOT EXISTS "solution_column_label" varchar DEFAULT 'How we solved it';
  ALTER TABLE "page_work" ADD COLUMN IF NOT EXISTS "impact_label" varchar DEFAULT 'Impact';
  ALTER TABLE "page_work" ADD COLUMN IF NOT EXISTS "diagram_caption" varchar DEFAULT 'A connected approach';
  ALTER TABLE "page_work" ADD COLUMN IF NOT EXISTS "diagram_trigger_label" varchar DEFAULT 'Brief';
  ALTER TABLE "page_work" ADD COLUMN IF NOT EXISTS "diagram_root_eyebrow" varchar DEFAULT 'Brand system';
  ALTER TABLE "page_work" ADD COLUMN IF NOT EXISTS "diagram_root_note" varchar DEFAULT 'Strategy into expression';
  ALTER TABLE "page_work" ADD COLUMN IF NOT EXISTS "diagram_items_label" varchar DEFAULT 'Connected disciplines';
  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'page_work_projects_card_tags_parent_id_fk') THEN
      ALTER TABLE "page_work_projects_card_tags" ADD CONSTRAINT "page_work_projects_card_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_work_projects"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
  END $$;
  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'page_work_projects_diagram_items_parent_id_fk') THEN
      ALTER TABLE "page_work_projects_diagram_items" ADD CONSTRAINT "page_work_projects_diagram_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_work_projects"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
  END $$;
  CREATE INDEX IF NOT EXISTS "page_work_projects_card_tags_order_idx" ON "page_work_projects_card_tags" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "page_work_projects_card_tags_parent_id_idx" ON "page_work_projects_card_tags" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "page_work_projects_diagram_items_order_idx" ON "page_work_projects_diagram_items" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "page_work_projects_diagram_items_parent_id_idx" ON "page_work_projects_diagram_items" USING btree ("_parent_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  DROP TABLE IF EXISTS "page_work_projects_card_tags" CASCADE;
  DROP TABLE IF EXISTS "page_work_projects_diagram_items" CASCADE;
  ALTER TABLE "page_work_projects" DROP COLUMN IF EXISTS "slug";
  ALTER TABLE "page_work_projects" DROP COLUMN IF EXISTS "flagship";
  ALTER TABLE "page_work_projects" DROP COLUMN IF EXISTS "diagram_hide_caption";
  ALTER TABLE "page_work_projects" DROP COLUMN IF EXISTS "diagram_trigger_label";
  ALTER TABLE "page_work_projects" DROP COLUMN IF EXISTS "diagram_eyebrow";
  ALTER TABLE "page_work_projects" DROP COLUMN IF EXISTS "diagram_title";
  ALTER TABLE "page_work_projects" DROP COLUMN IF EXISTS "diagram_note";
  ALTER TABLE "page_work_projects" DROP COLUMN IF EXISTS "diagram_items_label";
  ALTER TABLE "page_work" DROP COLUMN IF EXISTS "work_pill_label";
  ALTER TABLE "page_work" DROP COLUMN IF EXISTS "back_label";
  ALTER TABLE "page_work" DROP COLUMN IF EXISTS "next_label";
  ALTER TABLE "page_work" DROP COLUMN IF EXISTS "approach_eyebrow";
  ALTER TABLE "page_work" DROP COLUMN IF EXISTS "approach_link_label";
  ALTER TABLE "page_work" DROP COLUMN IF EXISTS "case_study_label";
  ALTER TABLE "page_work" DROP COLUMN IF EXISTS "idea_label";
  ALTER TABLE "page_work" DROP COLUMN IF EXISTS "execution_label";
  ALTER TABLE "page_work" DROP COLUMN IF EXISTS "challenges_label";
  ALTER TABLE "page_work" DROP COLUMN IF EXISTS "challenges_note";
  ALTER TABLE "page_work" DROP COLUMN IF EXISTS "challenge_column_label";
  ALTER TABLE "page_work" DROP COLUMN IF EXISTS "solution_column_label";
  ALTER TABLE "page_work" DROP COLUMN IF EXISTS "impact_label";
  ALTER TABLE "page_work" DROP COLUMN IF EXISTS "diagram_caption";
  ALTER TABLE "page_work" DROP COLUMN IF EXISTS "diagram_trigger_label";
  ALTER TABLE "page_work" DROP COLUMN IF EXISTS "diagram_root_eyebrow";
  ALTER TABLE "page_work" DROP COLUMN IF EXISTS "diagram_root_note";
  ALTER TABLE "page_work" DROP COLUMN IF EXISTS "diagram_items_label";`)
}
