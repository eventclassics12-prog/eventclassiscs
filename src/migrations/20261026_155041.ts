import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "home_statement" DROP COLUMN "byline_name";
  ALTER TABLE "home_statement" DROP COLUMN "byline_role";
  ALTER TABLE "home_statement" DROP COLUMN "byline_initials";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "home_statement" ADD COLUMN "byline_name" varchar DEFAULT 'Pamal Mondal';
  ALTER TABLE "home_statement" ADD COLUMN "byline_role" varchar DEFAULT 'Strategic Brand-Building Firm';
  ALTER TABLE "home_statement" ADD COLUMN "byline_initials" varchar DEFAULT 'P';`)
}
