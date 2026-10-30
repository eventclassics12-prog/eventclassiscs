import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "page_about" ALTER COLUMN "circular_inner" SET DEFAULT 'We tell clear stories, guided by NMC ethics.';
  ALTER TABLE "page_about" ALTER COLUMN "circular_outer" SET DEFAULT 'We bring clarity and creativity to healthcare.';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "page_about" ALTER COLUMN "circular_inner" SET DEFAULT 'Round and round the letters go, where they stop, you''ll know.';
  ALTER TABLE "page_about" ALTER COLUMN "circular_outer" SET DEFAULT 'Round and round the letters go, where they stop, you''ll know.';`)
}
