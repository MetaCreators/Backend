import { GoogleGenerativeAI } from "@google/generative-ai";
import Replicate from "replicate";
import { Request, Response } from "express";
import * as aws from "aws-sdk";
import { storeGeneratedImage } from "../../db/functions";

// Constants
const TRIGGER_WORD = "Shikhar";
const DEFAULT_ASPECT_RATIO = "16:9";
const DEFAULT_NUM_OUTPUTS = 1;
const DEFAULT_STEPS = 40;

const DEFAULT_GEMINI_CONFIG = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
};

const bucket = "lithouseuserimages";
const digiendpoint = new aws.Endpoint("blr1.digitaloceanspaces.com");
const s3Client = new aws.S3({
    endpoint: digiendpoint, 
    accessKeyId: process.env.DIGIOCEAN_OBJECT_ACCESS_ID || "" ,
    secretAccessKey: process.env.DIGIOCEAN_OBJECT_SECRET || "" 
});

export class GeminiService {
  private model: any;

  constructor(apiKey: string) {
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: DEFAULT_GEMINI_CONFIG,
    });
  }

  buildPrompt(userQuery: string): string {
    return `
      You are a world-class thumbnail designer and creative expert specializing in creating viral, engaging, and high-impact video thumbnails.
      Your task is to enhance this thumbnail concept while ensuring it includes the trigger word "${TRIGGER_WORD}" if not already present.

      Thumbnail Request: ${userQuery}

      Requirements:
      1. Always include the trigger word "${TRIGGER_WORD}" naturally in the prompt
      2. Create a bold, attention-grabbing thumbnail description that:
         - Has clear focal points
         - Creates emotional engagement
         - Tells a story at a glance
         - Includes specific details about composition, lighting, and colors
      3. If text is mentioned in the request:
         - Ensure text suggestions are SEO-friendly
         - Keep text short and impactful
         - Specify text placement clearly
      4. Focus on creating a viral-worthy thumbnail that builds curiosity

      Please provide an enhanced, detailed prompt that incorporates all these elements while maintaining the original concept's essence.
    `;
  }

  async enhancePrompt(userQuery: string): Promise<string> {
    try {
      const response = await this.model.generateContent(
        this.buildPrompt(userQuery)
      );
      const candidates = response?.response?.candidates ?? [];
      const refinedPrompt = candidates[0]?.content?.parts?.[0]?.text ?? "";

      if (!refinedPrompt.toLowerCase().includes(TRIGGER_WORD.toLowerCase())) {
        return `${TRIGGER_WORD}, ${refinedPrompt}`;
      }
      return refinedPrompt;
    } catch (error) {
      console.error("Error in Gemini prompt enhancement:", error);
      throw new Error("Failed to enhance prompt with Gemini");
    }
  }
}
export class ReplicateService {
  private replicate: Replicate;
  private outputDir: string;

  constructor(apiKey: string, outputDir: string = "public/genpersonimage") {
    this.replicate = new Replicate({
      auth: apiKey,
      useFileOutput: false,
    });
    this.outputDir = outputDir;
  }

//TODO: FIX THE OUTPUT OF generateImage TO RETURN BOTH PREDICTION ID AND PREDICTION URL, AND THEN SEND THE ID TO storeGeneratedImage
  async generateImage(prompt: string): Promise<GenerateImageProps> {
    try {
      const input = {
        prompt,
        model: "dev",
        go_fast: false,
        lora_scale: 1,
        megapixels: "1",
        num_outputs: DEFAULT_NUM_OUTPUTS,
        aspect_ratio: DEFAULT_ASPECT_RATIO,
        output_format: "webp",
        guidance_scale: 3,
        output_quality: 90,
        prompt_strength: 0.8,
        extra_lora_scale: 1,
        num_inference_steps: DEFAULT_STEPS,
      };

      console.log("Sending request to Replicate API with input:", input);

      const prediction = await this.replicate.predictions.create({
        version: "925da5f563c07bb620a3bf3cc2185079b1cfc7d62f47a9c234e67dbc36eab738",
        input: input,
        wait: true
      });

      const predictionId = prediction.id;
      const outputUrl = prediction.output;
      console.log("prediction id is", predictionId);
      console.log("prediction url is", outputUrl);
      
      if (Array.isArray(prediction.output)) {
        return {
          predictionId,
          outputUrl
        };
      }

      throw new Error(`Invalid output format received from Replicate API`);
    } catch (error) {
      console.error("Error in Replicate image generation:", error);
      throw error instanceof Error
        ? error
        : new Error("Failed to generate image with Replicate");
    }
  }
}

interface GenerateImageRequest {
  userQuery: string;
  userId: string;
}

interface GenerateImageProps {
  predictionId: string;
  outputUrl: string[]
}
export class ImageController {
  private geminiService: GeminiService;
  private replicateService: ReplicateService;

  constructor(
    geminiService: GeminiService,
    replicateService: ReplicateService
  ) {
    this.geminiService = geminiService;
    this.replicateService = replicateService;
  }

  async generateImage(
    req: Request<{}, {}, GenerateImageRequest>,
    res: Response
  ) {
    try {
      console.log("Request body:", req.body);

      const { userQuery, userId } = req.body;

      if (
        !userQuery ||
        typeof userQuery !== "string" ||
        userQuery.trim() === ""
      ) {
        return res.status(400).json({ error: "Valid userQuery is required" });
      }

      const enhancedPrompt = await this.geminiService.enhancePrompt(userQuery);
      console.log("Enhanced Prompt:", enhancedPrompt);

      const imageUrls = await this.replicateService.generateImage(
        enhancedPrompt
      );
      const uploadedUrls: string[] = [];
      const imageId = imageUrls.predictionId;
      //TODO: FIX THE STRUCTURE OF imageUrls => IT CONTAINS MULTIPLE URLS AND THEIR ID
      //TODO:  FOR NOW WE GENERATE ONLY A SINGLE IMAGE SO THIS METHOD WORKS AS IT IS, LATER WE SHOULD MODIFY IT
      for (const imageUrl of imageUrls.outputUrl) { 
        //I SHOULD GET BOTH imageUrl.outputUrl AND imageUrl.
        try {
          const key = `${userId}/generatedImages/${Date.now()}.webp`;
          const response = await fetch(imageUrl);
          const arrayBuffer = await response.arrayBuffer();
          const blob = Buffer.from(arrayBuffer);

          // const s3Params = {
          //   Bucket: bucket,
          //   Key: key,
          //   ContentType: "image/webp",
          //   ACL: 'public-read'
          // };

          // const uploadUrl = await s3Client.getSignedUrlPromise("putObject", s3Params);
          // console.log("presigned URl is ", uploadUrl);
          // const uploading = await fetch(uploadUrl, {
          //   method: "PUT",
          //   body: blob,
          //   headers: {
          //     "Content-Type": s3Params.ContentType
          //   }
          // });        
          // console.log("Image saving to DO status", uploading);

          // const s3ParamsForGETURL = {
          //   Bucket: bucket,
          //   Key: key
          // };

          // const getURL = await s3Client.getSignedUrlPromise("getObject", s3ParamsForGETURL);
          await s3Client.putObject({
            Bucket: bucket,
            Key: key,
            Body: blob,
            ContentType: "image/webp",
            ACL: 'public-read'
          }).promise();
          const publicUrl = `https://${bucket}.blr1.cdn.digitaloceanspaces.com/${key}`;
          console.log("Public URL is", publicUrl);

//          console.log("download url is", getURL);
          //TODO: make modelID dynamic
          //TODO: ERROR HANDLING: EDGE CASES
          //TODO: CREDIT DEDUCTION PENDING
          const store = await storeGeneratedImage(publicUrl, imageUrl, "31c58651-e0a3-4ca1-a32e-0dad450f8171", imageId, userId, enhancedPrompt, "success", 1);
          console.log("storing generated image:", store);
          uploadedUrls.push(publicUrl);
        } catch (err) {
          console.error("Error uploading image in bucket:", err);
        }
      } 
      res.json({ urls: uploadedUrls });
    } catch (error) {
      console.error("Error in image generation:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  }
}
