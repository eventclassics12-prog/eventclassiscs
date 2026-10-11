import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "page_blog" (
    "id" serial PRIMARY KEY NOT NULL,
    "seo_title" varchar,
    "seo_description" varchar,
    "og_image_id" integer,
    "label" varchar DEFAULT 'Journal',
    "hero_title" varchar DEFAULT 'Journal',
    "hero_lede" varchar DEFAULT 'Notes on building brands people remember — from the studio floor.',
    "empty_message" varchar DEFAULT 'No posts yet — check back soon.',
    "back_label" varchar DEFAULT 'All posts',
    "updated_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone
  );

  ALTER TABLE "home_hero" ALTER COLUMN "brand" DROP DEFAULT;
  ALTER TABLE "home_hero" ALTER COLUMN "brand" DROP NOT NULL;
  ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "_objectkey" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "menu_label" varchar DEFAULT 'Menu';
  ALTER TABLE "site_settings" ADD COLUMN "menu_close_label" varchar DEFAULT 'Close';
  ALTER TABLE "site_settings" ADD COLUMN "menu_cta_label" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "menu_cta_href" varchar;
  ALTER TABLE "home_success_stories_projects" ADD COLUMN "video_id" integer;
  ALTER TABLE "page_about" ADD COLUMN "seo_title" varchar;
  ALTER TABLE "page_about" ADD COLUMN "seo_description" varchar;
  ALTER TABLE "page_about" ADD COLUMN "og_image_id" integer;
  ALTER TABLE "page_about" ADD COLUMN "circular_logo_id" integer;
  ALTER TABLE "page_services" ADD COLUMN "seo_title" varchar;
  ALTER TABLE "page_services" ADD COLUMN "seo_description" varchar;
  ALTER TABLE "page_services" ADD COLUMN "og_image_id" integer;
  ALTER TABLE "page_work" ADD COLUMN "seo_title" varchar;
  ALTER TABLE "page_work" ADD COLUMN "seo_description" varchar;
  ALTER TABLE "page_work" ADD COLUMN "og_image_id" integer;
  ALTER TABLE "page_contact" ADD COLUMN "seo_title" varchar;
  ALTER TABLE "page_contact" ADD COLUMN "seo_description" varchar;
  ALTER TABLE "page_contact" ADD COLUMN "og_image_id" integer;
  ALTER TABLE "page_contact" ADD COLUMN "info_email_label" varchar DEFAULT 'Email';
  ALTER TABLE "page_contact" ADD COLUMN "info_phone_label" varchar DEFAULT 'Studio';
  ALTER TABLE "page_contact" ADD COLUMN "info_address_label" varchar DEFAULT 'Address';
  ALTER TABLE "page_contact" ADD COLUMN "failure_message" varchar DEFAULT 'Your message could not be sent. Please try again or email us directly.';
  ALTER TABLE "page_thank_you" ADD COLUMN "seo_title" varchar;
  ALTER TABLE "page_thank_you" ADD COLUMN "seo_description" varchar;
  ALTER TABLE "page_thank_you" ADD COLUMN "og_image_id" integer;
  ALTER TABLE "page_blog" ADD CONSTRAINT "page_blog_og_image_id_media_id_fk" FOREIGN KEY ("og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "page_blog_og_image_idx" ON "page_blog" USING btree ("og_image_id");
  ALTER TABLE "home_success_stories_projects" ADD CONSTRAINT "home_success_stories_projects_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_about" ADD CONSTRAINT "page_about_og_image_id_media_id_fk" FOREIGN KEY ("og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_about" ADD CONSTRAINT "page_about_circular_logo_id_media_id_fk" FOREIGN KEY ("circular_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_services" ADD CONSTRAINT "page_services_og_image_id_media_id_fk" FOREIGN KEY ("og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_work" ADD CONSTRAINT "page_work_og_image_id_media_id_fk" FOREIGN KEY ("og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_contact" ADD CONSTRAINT "page_contact_og_image_id_media_id_fk" FOREIGN KEY ("og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_thank_you" ADD CONSTRAINT "page_thank_you_og_image_id_media_id_fk" FOREIGN KEY ("og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "home_success_stories_projects_video_idx" ON "home_success_stories_projects" USING btree ("video_id");
  CREATE INDEX "page_about_og_image_idx" ON "page_about" USING btree ("og_image_id");
  CREATE INDEX "page_about_circular_logo_idx" ON "page_about" USING btree ("circular_logo_id");
  CREATE INDEX "page_services_og_image_idx" ON "page_services" USING btree ("og_image_id");
  CREATE INDEX "page_work_og_image_idx" ON "page_work" USING btree ("og_image_id");
  CREATE INDEX "page_contact_og_image_idx" ON "page_contact" USING btree ("og_image_id");
  CREATE INDEX "page_thank_you_og_image_idx" ON "page_thank_you" USING btree ("og_image_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "page_blog" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "page_blog" CASCADE;
  ALTER TABLE "home_success_stories_projects" DROP CONSTRAINT "home_success_stories_projects_video_id_media_id_fk";

  ALTER TABLE "page_about" DROP CONSTRAINT "page_about_og_image_id_media_id_fk";

  ALTER TABLE "page_about" DROP CONSTRAINT "page_about_circular_logo_id_media_id_fk";

  ALTER TABLE "page_services" DROP CONSTRAINT "page_services_og_image_id_media_id_fk";

  ALTER TABLE "page_work" DROP CONSTRAINT "page_work_og_image_id_media_id_fk";

  ALTER TABLE "page_contact" DROP CONSTRAINT "page_contact_og_image_id_media_id_fk";

  ALTER TABLE "page_thank_you" DROP CONSTRAINT "page_thank_you_og_image_id_media_id_fk";

  DROP INDEX "home_success_stories_projects_video_idx";
  DROP INDEX "page_about_og_image_idx";
  DROP INDEX "page_about_circular_logo_idx";
  DROP INDEX "page_services_og_image_idx";
  DROP INDEX "page_work_og_image_idx";
  DROP INDEX "page_contact_og_image_idx";
  DROP INDEX "page_thank_you_og_image_idx";
  ALTER TABLE "home_hero" ALTER COLUMN "brand" SET DEFAULT 'eventclassics.in';
  UPDATE "home_hero" SET "brand" = 'eventclassics.in' WHERE "brand" IS NULL;
  ALTER TABLE "home_hero" ALTER COLUMN "brand" SET NOT NULL;
  -- Retain storage metadata: this column may have existed before this migration.
  ALTER TABLE "site_settings" DROP COLUMN "menu_label";
  ALTER TABLE "site_settings" DROP COLUMN "menu_close_label";
  ALTER TABLE "site_settings" DROP COLUMN "menu_cta_label";
  ALTER TABLE "site_settings" DROP COLUMN "menu_cta_href";
  ALTER TABLE "home_success_stories_projects" DROP COLUMN "video_id";
  ALTER TABLE "page_about" DROP COLUMN "seo_title";
  ALTER TABLE "page_about" DROP COLUMN "seo_description";
  ALTER TABLE "page_about" DROP COLUMN "og_image_id";
  ALTER TABLE "page_about" DROP COLUMN "circular_logo_id";
  ALTER TABLE "page_services" DROP COLUMN "seo_title";
  ALTER TABLE "page_services" DROP COLUMN "seo_description";
  ALTER TABLE "page_services" DROP COLUMN "og_image_id";
  ALTER TABLE "page_work" DROP COLUMN "seo_title";
  ALTER TABLE "page_work" DROP COLUMN "seo_description";
  ALTER TABLE "page_work" DROP COLUMN "og_image_id";
  ALTER TABLE "page_contact" DROP COLUMN "seo_title";
  ALTER TABLE "page_contact" DROP COLUMN "seo_description";
  ALTER TABLE "page_contact" DROP COLUMN "og_image_id";
  ALTER TABLE "page_contact" DROP COLUMN "info_email_label";
  ALTER TABLE "page_contact" DROP COLUMN "info_phone_label";
  ALTER TABLE "page_contact" DROP COLUMN "info_address_label";
  ALTER TABLE "page_contact" DROP COLUMN "failure_message";
  ALTER TABLE "page_thank_you" DROP COLUMN "seo_title";
  ALTER TABLE "page_thank_you" DROP COLUMN "seo_description";
  ALTER TABLE "page_thank_you" DROP COLUMN "og_image_id";`)
}
