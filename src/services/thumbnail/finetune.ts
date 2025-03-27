import { getRedisClient, getRedisSubscriber } from "./redis-client";
import { db } from "../../db/db";
import { and, eq } from "drizzle-orm";
import {
  models,
  trainingImages,
  ModelTrainingStatusEnum,
} from "../../db/schema";
import { deductUserCredits } from "../../db/functions";

const MODEL_CREATION_COST = 20;

//input username should contain userId,username,Image url
export async function finetune(req: any, res: any) {
  const { userId, filename } = req.body;
  console.log("userid is ", userId);
  console.log("filenmae is", filename);
  try {
    const response = await db.insert(trainingImages).values({
      userId: userId,
      cloudUrl: filename,
      status: "success", //TODO: Better handling of status => send status from frontend whether image save to DO was successful or not
    });
    console.log(
      "filename save status for userid",
      userId,
      "with filename",
      filename,
      "is",
      response
    );

    // Use regular Redis client for LPUSH operation
    const client = await getRedisClient();
    await client.lPush(
      "training",
      JSON.stringify({ userid: userId, filename: filename })
    );
    console.log("reached here");
    res.json({ message: `training received for userid ${userId}` });
  } catch (error) {
    console.error("Redis operation failed:", error);
    res.status(500).json({ error: "Failed to queue training job" });
  }
}

// Set up Redis subscription for training status updates
async function setupTrainingStatusSubscription() {
  try {
    // Use subscriber client for pub/sub operations
    const subscriber = await getRedisSubscriber();

    await subscriber.subscribe("TRAINING_STATUS", async (message: string) => {
      try {
        const trainingStatus = JSON.parse(message);
        const { userId, filename, status, modelId } = trainingStatus;

        // Validate required fields
        if (!userId || !status || !modelId) {
          console.error("Missing required fields in training status message:", {
            userId,
            status,
            modelId,
            filename,
          });
          return;
        }

        // Validate status value
        const validStatuses = [
          "canceled",
          "processing",
          "failed",
          "starting",
          "succeeded",
        ];
        if (!validStatuses.includes(status)) {
          console.error(`Invalid status value received: ${status}`);
          return;
        }

        const modelStatus = status as
          | "canceled"
          | "processing"
          | "failed"
          | "starting"
          | "succeeded";

        const existingModel = await db
          .select()
          .from(models)
          .where(
            and(eq(models.userId, userId), eq(models.replicateModelId, modelId))
          )
          .limit(1);

        if (existingModel.length === 0) {
          await db.insert(models).values({
            userId: userId,
            replicateModelId: modelId,
            status: modelStatus,
          });
          console.log(
            `Created new model for user ${userId} with modelId ${modelId}`
          );
        } else {
          const now = new Date();
          await db
            .update(models)
            .set({
              status: modelStatus,
              updatedAt: now,
            })
            .where(
              and(
                eq(models.userId, userId),
                eq(models.replicateModelId, modelId)
              )
            );
        }

        console.log(
          `Updated training status for user ${userId}, file ${filename}: ${modelStatus}, modelId: ${modelId}`
        );
        //deducting user credits if the model is trained properly
        if (modelStatus === "succeeded") {
          await deductUserCredits(userId, MODEL_CREATION_COST);
        }
      } catch (error) {
        console.error("Error processing training status update:", error);
        if (error instanceof SyntaxError) {
          console.error("Invalid JSON message received:", message);
        }
      }
    });
    console.log("Successfully subscribed to TRAINING_STATUS channel");
  } catch (error) {
    console.error("Error setting up Redis subscription:", error);
  }
}

// Initialize the subscription when the module loads
setupTrainingStatusSubscription().catch(console.error);
