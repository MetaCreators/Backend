ALTER TABLE "generatedImages" ALTER COLUMN "status" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "models" ALTER COLUMN "status" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "training_images" ALTER COLUMN "status" DROP NOT NULL;