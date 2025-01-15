import { Router, Request, Response } from "express";
import { generateScript } from "../services/script";
import { generateDescription } from "../services/description";
import { authMiddleware } from "../middleware/auth";
import { finetune } from "../services/thumbnail/finetune";

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

// Initialize controller
const imageController = new ImageController(geminiService, replicateService);

router.post("/script", authMiddleware, generateScript);

router.post("/description", authMiddleware, generateDescription);

//router.post("/imagefinetune", authMiddleware, finetune);
//TODO: Add middleware after testing
//router.post("/imagefinetune" ,finetune);

router.post(
  "/genpersonimage",
  authMiddleware,
  (req: Request, res: Response) => {
    imageController.generateImage(req, res);
  }
);

export default router;
