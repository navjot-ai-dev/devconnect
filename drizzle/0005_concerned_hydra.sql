ALTER TABLE "notifications" ADD COLUMN "post_id" text;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "notifications_recipient_id_idx" ON "notifications" USING btree ("recipient_id");--> statement-breakpoint
CREATE INDEX "notifications_post_id_idx" ON "notifications" USING btree ("post_id");--> statement-breakpoint
CREATE UNIQUE INDEX "notifications_like_unique" ON "notifications" USING btree ("actor_id","post_id") WHERE "notifications"."type" = 'like';