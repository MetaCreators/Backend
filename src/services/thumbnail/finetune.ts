import { getRedisClient } from "./redis-client";
import { db } from "../../db/db";
import { eq } from "drizzle-orm";
import { trainingImages } from "../../db/schema";


//input username should contain userId,username,Image url
export async function finetune(req: any, res: any) {
    const { userId, filename } = req.body;
    console.log("userid is ", userId)
    console.log("filenmae is", filename)
    try {
        const client = await getRedisClient();
        await client.lPush("training", JSON.stringify({ userid: userId, filename: filename }));
        console.log("reached here")
        res.json({ message: `training received for userid ${userId}` });
    } catch (error) {
        console.error("Redis operation failed:", error);
        res.status(500).json({ error: "Failed to queue training job" });
    }
}

// Set up Redis subscription for training status updates
async function setupTrainingStatusSubscription() {
    try {
        const subscriber = await getRedisClient();

        await subscriber.subscribe('TRAINING_STATUS', async (message: string) => {
            try {
                const trainingStatus = JSON.parse(message);
                //use this filename to update the status in the database (update where filename = filename)
                const { userId, filename, status } = trainingStatus;

                // Update the training status in the database
                await db.update(trainingImages)
                    .set({
                        status: status
                    })
                    .where(
                        eq(trainingImages.userId, userId)
                    );

                console.log(`Updated training status for user ${userId}: ${status}`);
            } catch (error) {
                console.error('Error processing training status update:', error);
            }
        });

        console.log('Successfully subscribed to TRAINING_STATUS channel');
    } catch (error) {
        console.error('Error setting up Redis subscription:', error);
    }
}

// Initialize the subscription when the module loads
setupTrainingStatusSubscription().catch(console.error);
