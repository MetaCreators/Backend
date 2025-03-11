CREATE TYPE "public"."trainingStatus" AS ENUM('canceled', 'processing', 'failed', 'starting', 'succeeded');--> statement-breakpoint
ALTER TABLE "models" ADD COLUMN "trainingStatus" "trainingStatus";--> statement-breakpoint
ALTER TABLE "models" DROP COLUMN "status";