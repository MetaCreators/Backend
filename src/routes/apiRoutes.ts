import { Router, Request, Response } from "express";
import { generateScript } from "../services/script";
import { generateDescription } from "../services/description";
import { authMiddleware } from "../middleware/auth";
import { finetune } from "../services/thumbnail/finetune";
import * as aws from "aws-sdk";

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
//router.post("/imagefinetune" ,finetune);

router.post(
  "/genpersonimage",
  (req: Request, res: Response) => {
    imageController.generateImage(req, res);
  }
);

router.get(
  "/get-presignedurl-upload",
  async (req: Request, res: Response) => {
    const { userId } = req.body;

    const key = `${userId}/trainingImages/${Date.now()}.webp`;
    const imageUrl="";
    const response = await fetch(imageUrl); //what should this be ?
    const arrayBuffer = await response.arrayBuffer();
    const blob = Buffer.from(arrayBuffer);
    const s3Params = {
      Bucket: bucket,
      Key: key,
      ContentType: "image/webp"
    };

    const uploadUrl = await s3Client.getSignedUrlPromise("putObject", s3Params);
    console.log("presigned URl for saving training images is ", uploadUrl);
    const uploading = await fetch(uploadUrl, {
      method: "PUT",
      body: blob,
      headers: {
        "Content-Type": s3Params.ContentType
      }
    });        
    console.log("Image saving to DO status", uploading);


  }
);
export default router;
