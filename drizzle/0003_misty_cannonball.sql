ALTER TABLE "account" ADD COLUMN "issuer" text;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "userAgent" text;--> statement-breakpoint
ALTER TABLE "session" DROP COLUMN "user_agent";