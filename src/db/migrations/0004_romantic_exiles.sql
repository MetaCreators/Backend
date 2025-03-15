ALTER TABLE "users" DROP CONSTRAINT "uniqueEmailAndCreds";--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "uniqueEmail" UNIQUE("email");