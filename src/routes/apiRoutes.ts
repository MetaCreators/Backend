import { Router, Request, Response } from "express";
import { generateScript } from "../services/script";
import { generateDescription } from "../services/description";
import { authMiddleware } from "../middleware/auth";
import { finetune } from "../services/thumbnail/finetune";
import * as aws from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

import {
  GeminiService,
  ReplicateService,
  ImageController,
} from "../services/thumbnail/genpersonimage";

import dotenv from "dotenv";

const router = Router();
dotenv.config();

const geminiService = new GeminiService(process.env.GEMINI_API_KEY as string);
const replicateService = new ReplicateService(
  process.env.REPLICATE_API_KEY as string
);
const bucket = "lithouseuserimages";
const digiendpoint = new aws.Endpoint("blr1.digitaloceanspaces.com");
const s3Client = new aws.S3({
    endpoint: digiendpoint, 
    accessKeyId: process.env.DIGIOCEAN_OBJECT_ACCESS_ID || "" ,
    secretAccessKey: process.env.DIGIOCEAN_OBJECT_SECRET || "" 
});

// Initialize controller
const imageController = new ImageController(geminiService, replicateService);

router.post("/script", generateScript);

router.post("/description", authMiddleware, generateDescription);

//router.post("/imagefinetune", authMiddleware, finetune);
//TODO: Add middleware after testing
router.post("/imagefinetune" ,finetune);

router.post(
  "/genpersonimage",
  (req: Request, res: Response) => {
    imageController.generateImage(req, res);
  }
);

router.get(
  "/get-presignedurl-upload",
  async (req: Request, res: Response) => {
    const { userId } = req.query;
    const key = `${userId}/trainingImages/${uuidv4()}.zip`;
    const s3Params = {
      Bucket: bucket,
      Key: key,
      ContentType: "application/zip" 
    };

    const presignedUrl = await s3Client.getSignedUrlPromise("putObject", s3Params);
    console.log("presigned URl for saving training images is ", presignedUrl);
    //BUG: Due to timelag in saving images to DO, there's a difference in names of the file => eg we put file name as
    // 1740962927698.zip , but on digital ocean due to some delay, it gets saved as 1740962927679.zip
    res.json({
      presignedUrl:presignedUrl
    })
  }
);
export default router;
