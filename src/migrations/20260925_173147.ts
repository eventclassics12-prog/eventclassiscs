import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"excerpt" varchar,
  	"cover_image_id" integer,
  	"author" varchar DEFAULT 'EventClassics Studio',
  	"published_at" timestamp(3) with time zone,
  	"content" jsonb,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"posts_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings_nav_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_socials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"brand_name" varchar DEFAULT 'eventclassics.in' NOT NULL,
  	"brand_tagline" varchar DEFAULT 'Build something worth remembering.',
  	"copyright" varchar DEFAULT '© Event Classics',
  	"footer_talk_label" varchar DEFAULT 'Let''s Talk',
  	"footer_contact_button_label" varchar DEFAULT 'View Contact',
  	"footer_contact_href" varchar DEFAULT '/contact-form',
  	"footer_logo_video_id" integer,
  	"studio_details_label" varchar DEFAULT '(STUDIO DETAILS)',
  	"email" varchar DEFAULT 'info@eventclassics.in',
  	"location_line1" varchar DEFAULT 'Based in Kolkata, India',
  	"location_line2" varchar DEFAULT 'Working worldwide.',
  	"socials_label" varchar DEFAULT '(SOCIALS)',
  	"site_url" varchar DEFAULT 'https://www.eventclassics.in',
  	"seo_title" varchar DEFAULT 'EVENTCLASSICS — Idea to Impact',
  	"seo_description" varchar DEFAULT 'Strategic brand-building firm. We close the gap between what you''ve built and what the market thinks you''ve built.',
  	"seo_keywords" varchar DEFAULT 'brand identity, brand strategy, digital design agency, Kolkata design studio',
  	"og_image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "home_hero" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"brand" varchar DEFAULT 'eventclassics.in' NOT NULL,
  	"headline" varchar DEFAULT 'Idea to Impact
  
  PROCESS. PRECISION. PERFORMANCE.' NOT NULL,
  	"cta_label" varchar DEFAULT 'Book A Call Now!',
  	"cta_href" varchar DEFAULT '/contact-form',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "home_brands_brands" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"logo_id" integer,
  	"name" varchar NOT NULL
  );
  
  CREATE TABLE "home_brands" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar DEFAULT 'Trusted by',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "home_statement_paragraphs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "home_statement" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"stat" varchar DEFAULT '10+' NOT NULL,
  	"stat_caption" varchar DEFAULT 'From disruptive creative businesses to consumer-first companies.',
  	"byline_name" varchar DEFAULT 'Pamal Mondal',
  	"byline_role" varchar DEFAULT 'Strategic Brand-Building Firm',
  	"byline_initials" varchar DEFAULT 'P',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "home_gap" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"phrase_left" varchar DEFAULT 'WE CLOSE',
  	"phrase_right" varchar DEFAULT 'THE GAP',
  	"image_id" integer,
  	"copy" varchar DEFAULT 'Between what you''ve built and what the market thinks you''ve built.',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "home_keep_scrolling" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar DEFAULT 'KEEP SCROLLING' NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "home_success_stories_projects" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar NOT NULL,
  	"stat" varchar NOT NULL,
  	"stat_caption" varchar NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "home_success_stories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar DEFAULT 'Success Stories',
  	"pager_tag" varchar DEFAULT 'SS',
  	"video_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "home_services_services_sub_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "home_services_services" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"kicker" varchar,
  	"description" varchar NOT NULL,
  	"image_id" integer,
  	"image_label" varchar
  );
  
  CREATE TABLE "home_services" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"intro" varchar DEFAULT 'We don’t sell services.
  We connect the pieces that make a brand work.',
  	"label" varchar DEFAULT 'What we can help with',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "home_faq_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL
  );
  
  CREATE TABLE "home_faq" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar DEFAULT 'FAQs',
  	"cta_heading" varchar DEFAULT 'Still have questions?
  Chat with us',
  	"cta_button_label" varchar DEFAULT 'Book a call with us',
  	"cta_href" varchar DEFAULT '/contact-form',
  	"headline" varchar DEFAULT 'Here’s what you should know before working with us.',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_about_story_paragraphs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "page_about_principles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"body" varchar NOT NULL
  );
  
  CREATE TABLE "page_about" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_video_id" integer,
  	"hero_title" varchar DEFAULT 'We’re a strategic brand-building partner for founders with momentum',
  	"hero_lede" varchar DEFAULT 'Get a senior brand team embedded directly into your project. When you don’t have time to waste, we strip it back to what matters: fast-moving, reactive work that gets your product noticed.',
  	"circular_inner" varchar DEFAULT 'Round and round the letters go, where they stop, you''ll know.',
  	"circular_outer" varchar DEFAULT 'Round and round the letters go, where they stop, you''ll know.',
  	"story_title" varchar DEFAULT 'We set you on a path to go from idea to impact with a partner that just gets the ins and outs of brand life.',
  	"quote_lead" varchar DEFAULT '"I started Event Classics after seeing how founders, seed rounds and small teams couldn''t get access to top-tier brand work because of the costs and delays associated with agency bloat."',
  	"founder_avatar_id" integer,
  	"founder_name" varchar DEFAULT 'Pamal Mondal',
  	"founder_role" varchar DEFAULT 'Founder & Lead Brand Designer',
  	"manifesto_title" varchar DEFAULT 'Execution over ego.
  We’re lean by design.',
  	"manifesto_cta_label" varchar DEFAULT 'Find out what we offer',
  	"manifesto_cta_href" varchar DEFAULT '/services',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_services_final_cta_lines" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "page_services" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_video_id" integer,
  	"hero_title" varchar DEFAULT 'Four disciplines.
  One brand system.',
  	"hero_lede" varchar DEFAULT 'Strategy, identity, distribution and content — built as one connected system, not four disconnected vendors.',
  	"final_cta_kicker" varchar DEFAULT 'Start a conversation',
  	"final_cta_label" varchar DEFAULT 'Book a call',
  	"final_cta_href" varchar DEFAULT '/contact-form',
  	"final_cta_image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_work_projects_kicker_parts" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL,
  	"highlight" boolean DEFAULT false
  );
  
  CREATE TABLE "page_work_projects_includes" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "page_work_projects" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"intro" varchar,
  	"body" varchar,
  	"caption" varchar,
  	"image_id" integer,
  	"alt" varchar
  );
  
  CREATE TABLE "page_work_marquee_line2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL,
  	"highlight" boolean DEFAULT false
  );
  
  CREATE TABLE "page_work" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_title" varchar DEFAULT 'Selected work from teams with momentum',
  	"hero_lede" varchar DEFAULT 'A senior brand team embedded directly into each project — fast-moving, reactive work that gets your product shipped and noticed.',
  	"projects_label" varchar DEFAULT 'Projects',
  	"marquee_line1" varchar DEFAULT 'We build. We refine.',
  	"marquee_video_id" integer,
  	"includes_label" varchar DEFAULT 'Includes:',
  	"read_more_label" varchar DEFAULT 'Read more',
  	"read_less_label" varchar DEFAULT 'Read less',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_contact" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"intro_heading" varchar DEFAULT 'Let''s build something worth remembering.',
  	"intro_lede" varchar DEFAULT 'Briefs, questions, or a quick sanity check on an idea — pick whichever fits and we''ll get back within one business day. For active engagements, write to us directly at info@eventclassics.in.',
  	"intro_email" varchar DEFAULT 'info@eventclassics.in',
  	"card_title" varchar DEFAULT 'Get in touch',
  	"card_description" varchar DEFAULT 'Have a brief, an idea, or a question about how we work? Fill out the form and we''ll get back within one business day. For active briefs, write to us directly.',
  	"email" varchar DEFAULT 'info@eventclassics.in',
  	"phone" varchar DEFAULT '983-1234-059',
  	"address" varchar DEFAULT 'Kolkata, India · Working worldwide',
  	"label_name" varchar DEFAULT 'Name',
  	"label_email" varchar DEFAULT 'Email',
  	"label_phone" varchar DEFAULT 'Phone',
  	"label_message" varchar DEFAULT 'Message',
  	"submit_label" varchar DEFAULT 'Send message',
  	"submitting_label" varchar DEFAULT 'Sending…',
  	"error_message" varchar DEFAULT 'Please fill in your name, email and message.',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_thank_you" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Thank you for contacting us.',
  	"sub" varchar DEFAULT 'We’ll get back to you very soon.',
  	"cta_label" varchar DEFAULT 'Go to home',
  	"cta_href" varchar DEFAULT '/',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_nav_links" ADD CONSTRAINT "site_settings_nav_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_socials" ADD CONSTRAINT "site_settings_socials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_footer_logo_video_id_media_id_fk" FOREIGN KEY ("footer_logo_video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_og_image_id_media_id_fk" FOREIGN KEY ("og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_brands_brands" ADD CONSTRAINT "home_brands_brands_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_brands_brands" ADD CONSTRAINT "home_brands_brands_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_brands"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_statement_paragraphs" ADD CONSTRAINT "home_statement_paragraphs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_statement"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_gap" ADD CONSTRAINT "home_gap_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_success_stories_projects" ADD CONSTRAINT "home_success_stories_projects_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_success_stories_projects" ADD CONSTRAINT "home_success_stories_projects_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_success_stories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_success_stories" ADD CONSTRAINT "home_success_stories_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_services_services_sub_items" ADD CONSTRAINT "home_services_services_sub_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_services_services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_services_services" ADD CONSTRAINT "home_services_services_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_services_services" ADD CONSTRAINT "home_services_services_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_faq_faqs" ADD CONSTRAINT "home_faq_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_about_story_paragraphs" ADD CONSTRAINT "page_about_story_paragraphs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_about"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_about_principles" ADD CONSTRAINT "page_about_principles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_about"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_about" ADD CONSTRAINT "page_about_hero_video_id_media_id_fk" FOREIGN KEY ("hero_video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_about" ADD CONSTRAINT "page_about_founder_avatar_id_media_id_fk" FOREIGN KEY ("founder_avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_services_final_cta_lines" ADD CONSTRAINT "page_services_final_cta_lines_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_services" ADD CONSTRAINT "page_services_hero_video_id_media_id_fk" FOREIGN KEY ("hero_video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_services" ADD CONSTRAINT "page_services_final_cta_image_id_media_id_fk" FOREIGN KEY ("final_cta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_work_projects_kicker_parts" ADD CONSTRAINT "page_work_projects_kicker_parts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_work_projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_work_projects_includes" ADD CONSTRAINT "page_work_projects_includes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_work_projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_work_projects" ADD CONSTRAINT "page_work_projects_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_work_projects" ADD CONSTRAINT "page_work_projects_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_work"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_work_marquee_line2" ADD CONSTRAINT "page_work_marquee_line2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_work"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_work" ADD CONSTRAINT "page_work_marquee_video_id_media_id_fk" FOREIGN KEY ("marquee_video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE UNIQUE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");
  CREATE INDEX "posts_cover_image_idx" ON "posts" USING btree ("cover_image_id");
  CREATE INDEX "posts_updated_at_idx" ON "posts" USING btree ("updated_at");
  CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("posts_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "site_settings_nav_links_order_idx" ON "site_settings_nav_links" USING btree ("_order");
  CREATE INDEX "site_settings_nav_links_parent_id_idx" ON "site_settings_nav_links" USING btree ("_parent_id");
  CREATE INDEX "site_settings_socials_order_idx" ON "site_settings_socials" USING btree ("_order");
  CREATE INDEX "site_settings_socials_parent_id_idx" ON "site_settings_socials" USING btree ("_parent_id");
  CREATE INDEX "site_settings_footer_logo_video_idx" ON "site_settings" USING btree ("footer_logo_video_id");
  CREATE INDEX "site_settings_og_image_idx" ON "site_settings" USING btree ("og_image_id");
  CREATE INDEX "home_brands_brands_order_idx" ON "home_brands_brands" USING btree ("_order");
  CREATE INDEX "home_brands_brands_parent_id_idx" ON "home_brands_brands" USING btree ("_parent_id");
  CREATE INDEX "home_brands_brands_logo_idx" ON "home_brands_brands" USING btree ("logo_id");
  CREATE INDEX "home_statement_paragraphs_order_idx" ON "home_statement_paragraphs" USING btree ("_order");
  CREATE INDEX "home_statement_paragraphs_parent_id_idx" ON "home_statement_paragraphs" USING btree ("_parent_id");
  CREATE INDEX "home_gap_image_idx" ON "home_gap" USING btree ("image_id");
  CREATE INDEX "home_success_stories_projects_order_idx" ON "home_success_stories_projects" USING btree ("_order");
  CREATE INDEX "home_success_stories_projects_parent_id_idx" ON "home_success_stories_projects" USING btree ("_parent_id");
  CREATE INDEX "home_success_stories_projects_image_idx" ON "home_success_stories_projects" USING btree ("image_id");
  CREATE INDEX "home_success_stories_video_idx" ON "home_success_stories" USING btree ("video_id");
  CREATE INDEX "home_services_services_sub_items_order_idx" ON "home_services_services_sub_items" USING btree ("_order");
  CREATE INDEX "home_services_services_sub_items_parent_id_idx" ON "home_services_services_sub_items" USING btree ("_parent_id");
  CREATE INDEX "home_services_services_order_idx" ON "home_services_services" USING btree ("_order");
  CREATE INDEX "home_services_services_parent_id_idx" ON "home_services_services" USING btree ("_parent_id");
  CREATE INDEX "home_services_services_image_idx" ON "home_services_services" USING btree ("image_id");
  CREATE INDEX "home_faq_faqs_order_idx" ON "home_faq_faqs" USING btree ("_order");
  CREATE INDEX "home_faq_faqs_parent_id_idx" ON "home_faq_faqs" USING btree ("_parent_id");
  CREATE INDEX "page_about_story_paragraphs_order_idx" ON "page_about_story_paragraphs" USING btree ("_order");
  CREATE INDEX "page_about_story_paragraphs_parent_id_idx" ON "page_about_story_paragraphs" USING btree ("_parent_id");
  CREATE INDEX "page_about_principles_order_idx" ON "page_about_principles" USING btree ("_order");
  CREATE INDEX "page_about_principles_parent_id_idx" ON "page_about_principles" USING btree ("_parent_id");
  CREATE INDEX "page_about_hero_video_idx" ON "page_about" USING btree ("hero_video_id");
  CREATE INDEX "page_about_founder_avatar_idx" ON "page_about" USING btree ("founder_avatar_id");
  CREATE INDEX "page_services_final_cta_lines_order_idx" ON "page_services_final_cta_lines" USING btree ("_order");
  CREATE INDEX "page_services_final_cta_lines_parent_id_idx" ON "page_services_final_cta_lines" USING btree ("_parent_id");
  CREATE INDEX "page_services_hero_video_idx" ON "page_services" USING btree ("hero_video_id");
  CREATE INDEX "page_services_final_cta_image_idx" ON "page_services" USING btree ("final_cta_image_id");
  CREATE INDEX "page_work_projects_kicker_parts_order_idx" ON "page_work_projects_kicker_parts" USING btree ("_order");
  CREATE INDEX "page_work_projects_kicker_parts_parent_id_idx" ON "page_work_projects_kicker_parts" USING btree ("_parent_id");
  CREATE INDEX "page_work_projects_includes_order_idx" ON "page_work_projects_includes" USING btree ("_order");
  CREATE INDEX "page_work_projects_includes_parent_id_idx" ON "page_work_projects_includes" USING btree ("_parent_id");
  CREATE INDEX "page_work_projects_order_idx" ON "page_work_projects" USING btree ("_order");
  CREATE INDEX "page_work_projects_parent_id_idx" ON "page_work_projects" USING btree ("_parent_id");
  CREATE INDEX "page_work_projects_image_idx" ON "page_work_projects" USING btree ("image_id");
  CREATE INDEX "page_work_marquee_line2_order_idx" ON "page_work_marquee_line2" USING btree ("_order");
  CREATE INDEX "page_work_marquee_line2_parent_id_idx" ON "page_work_marquee_line2" USING btree ("_parent_id");
  CREATE INDEX "page_work_marquee_video_idx" ON "page_work" USING btree ("marquee_video_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "posts" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "site_settings_nav_links" CASCADE;
  DROP TABLE "site_settings_socials" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "home_hero" CASCADE;
  DROP TABLE "home_brands_brands" CASCADE;
  DROP TABLE "home_brands" CASCADE;
  DROP TABLE "home_statement_paragraphs" CASCADE;
  DROP TABLE "home_statement" CASCADE;
  DROP TABLE "home_gap" CASCADE;
  DROP TABLE "home_keep_scrolling" CASCADE;
  DROP TABLE "home_success_stories_projects" CASCADE;
  DROP TABLE "home_success_stories" CASCADE;
  DROP TABLE "home_services_services_sub_items" CASCADE;
  DROP TABLE "home_services_services" CASCADE;
  DROP TABLE "home_services" CASCADE;
  DROP TABLE "home_faq_faqs" CASCADE;
  DROP TABLE "home_faq" CASCADE;
  DROP TABLE "page_about_story_paragraphs" CASCADE;
  DROP TABLE "page_about_principles" CASCADE;
  DROP TABLE "page_about" CASCADE;
  DROP TABLE "page_services_final_cta_lines" CASCADE;
  DROP TABLE "page_services" CASCADE;
  DROP TABLE "page_work_projects_kicker_parts" CASCADE;
  DROP TABLE "page_work_projects_includes" CASCADE;
  DROP TABLE "page_work_projects" CASCADE;
  DROP TABLE "page_work_marquee_line2" CASCADE;
  DROP TABLE "page_work" CASCADE;
  DROP TABLE "page_contact" CASCADE;
  DROP TABLE "page_thank_you" CASCADE;`)
}
