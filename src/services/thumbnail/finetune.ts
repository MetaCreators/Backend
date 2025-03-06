import Replicate from "replicate";
import { getRedisClient } from "./redis-client";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

//input username should contain userId,username,Image url
export async function finetune(req:any, res:any) {
    const { userId, filename } = req.body;
    console.log("userid is ", userId)
    console.log("filenmae is",filename)
    try {
        const client = await getRedisClient();
        await client.lPush("training", JSON.stringify({ userid: userId, filename: filename }));
        console.log("reached here")
        res.json({message:`training received for userid ${userId}`});
    } catch (error) {
        console.error("Redis operation failed:", error);
        res.status(500).json({error: "Failed to queue training job"});
    }
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