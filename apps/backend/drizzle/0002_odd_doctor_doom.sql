CREATE TABLE "list_items" (
	"uuid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"list_id" uuid NOT NULL,
	"media_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "password" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD COLUMN "comment" text;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD COLUMN "rewatched" boolean;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD COLUMN "liked" boolean;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD COLUMN "watched_at" timestamp;--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN "runtime" integer;--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN "genres" text;--> statement-breakpoint
ALTER TABLE "list_items" ADD CONSTRAINT "list_items_list_id_lists_id_fk" FOREIGN KEY ("list_id") REFERENCES "public"."lists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "list_items" ADD CONSTRAINT "list_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lists" ADD CONSTRAINT "lists_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;