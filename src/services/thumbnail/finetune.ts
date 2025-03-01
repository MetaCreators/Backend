import Replicate from "replicate";
import { getRedisClient } from "./redis-client";


const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

//input username should contain userId,username,Image url
export async function finetune(req:any, res:any) {
    const { userid } = req.body;

    
    try {
        const client = await getRedisClient();
        //push the filename of training zip also along with userId
        await client.lPush("training", JSON.stringify({ userid: userid }));
        res.json({message:`training received for userid ${userid}`});
    } catch (error) {
        console.error("Redis operation failed:", error);
        res.status(500).json({error: "Failed to queue training job"});
    }
    


    // const training = await replicate.trainings.create(
    //     "ostris",
    //     "flux-dev-lora-trainer",
    //     "e440909d3512c31646ee2e0c7d6f6f4923224863a6a10c494606e79fb5844497",
    //     {
            
    //         destination:  `adityaraj-007/${username}`,
    //         input: {
    //             steps: 1500,
    //             lora_rank: 16,
    //             optimizer: "adamw8bit",
    //             batch_size: 1,
    //             resolution: "512,768,1024",
    //             autocaption: true,
    //             //TODO: Fix input_images to accept zip file as input
    //             input_images: "https://",
    //             trigger_word: username,
    //             learning_rate: 0.0004,
    //             wandb_project: "flux_train_replicate",
    //             autocaption_prefix: `photo of ${username}`,
    //             wandb_save_interval: 100,
    //             caption_dropout_rate: 0.05,
    //             cache_latents_to_disk: false,
    //             wandb_sample_interval: 100
    //         }
    //     }
    // );

    // console.log(training);
    
}


// app.post("/api/imagefinetune", async (req, res) => {
//   //TODO:
//   // GET IMAGES AND USERID from the FE => SAVE TO DO => AND THEN SEND TO WORKERS FOR STARTING IMAGE TRAINING
//   //upload the zip file to Digital ocean bucket (have a route for getting the presigned urls) => then directly push to that url from frontend
//   const { userid, formData } = req.body;
//   console.log("form data is",userid)
  
//   try {
//     await client.lPush("training", JSON.stringify({ userid: userid }));
//     res.json({message:`training received for userid ${userid}`}) 
//   } catch (error) {
//     res.json({
//       message:"training input failed",
//       error:error
//     })
//   } 
// });