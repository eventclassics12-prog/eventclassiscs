import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "page_work_projects_execution_steps" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "title" varchar NOT NULL,
    "body" varchar
  );

  CREATE TABLE "page_work_projects_challenges" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "challenge" varchar NOT NULL,
    "solution" varchar NOT NULL
  );

  CREATE TABLE "page_work_projects_impact_stats" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "value" varchar NOT NULL,
    "label" varchar NOT NULL
  );

  ALTER TABLE "page_work_projects" ADD COLUMN "idea" varchar;
  ALTER TABLE "page_work_projects" ADD COLUMN "execution_intro" varchar;
  ALTER TABLE "page_work_projects" ADD COLUMN "impact_note" varchar;
  ALTER TABLE "page_work_projects_execution_steps" ADD CONSTRAINT "page_work_projects_execution_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_work_projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_work_projects_challenges" ADD CONSTRAINT "page_work_projects_challenges_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_work_projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_work_projects_impact_stats" ADD CONSTRAINT "page_work_projects_impact_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_work_projects"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "page_work_projects_execution_steps_order_idx" ON "page_work_projects_execution_steps" USING btree ("_order");
  CREATE INDEX "page_work_projects_execution_steps_parent_id_idx" ON "page_work_projects_execution_steps" USING btree ("_parent_id");
  CREATE INDEX "page_work_projects_challenges_order_idx" ON "page_work_projects_challenges" USING btree ("_order");
  CREATE INDEX "page_work_projects_challenges_parent_id_idx" ON "page_work_projects_challenges" USING btree ("_parent_id");
  CREATE INDEX "page_work_projects_impact_stats_order_idx" ON "page_work_projects_impact_stats" USING btree ("_order");
  CREATE INDEX "page_work_projects_impact_stats_parent_id_idx" ON "page_work_projects_impact_stats" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "page_work_projects_execution_steps" CASCADE;
  DROP TABLE "page_work_projects_challenges" CASCADE;
  DROP TABLE "page_work_projects_impact_stats" CASCADE;
  ALTER TABLE "page_work_projects" DROP COLUMN "idea";
  ALTER TABLE "page_work_projects" DROP COLUMN "execution_intro";
  ALTER TABLE "page_work_projects" DROP COLUMN "impact_note";`)
}
