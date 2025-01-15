import { GeminiService } from "../components/GeminiService";
import { ReplicateService } from "../components/ReplicateService";
import { supabase } from "../../lib/supabase";
import { Request, Response } from "express";

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

  async generateImage(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res
          .status(401)
          .json({ message: "No or invalid authentication token provided" });
        return;
      }

      const token = authHeader.split("Bearer ")[1].trim();

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);

      if (error) {
        console.error("Supabase Error:", error);
        res.status(401).json({ message: "Invalid authentication token" });
        return;
      }

      if (!user) {
        res
          .status(401)
          .json({ message: "No user found for the provided token" });
        return;
      }

      // Validate userQuery
      const { userQuery } = req.body;

      if (
        !userQuery ||
        typeof userQuery !== "string" ||
        userQuery.trim() === ""
      ) {
        res.status(400).json({ error: "Valid userQuery is required" });
        return;
      }

      // Generate enhanced prompt and image URLs
      const enhancedPrompt = await this.geminiService.enhancePrompt(userQuery);
      const imageUrls = await this.replicateService.generateImage(
        enhancedPrompt
      );

      // Respond with image URLs
      res.json({ urls: imageUrls });
    } catch (error) {
      console.error("Error in image generation:", error);

      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: "An unexpected error occurred" });
      }
    }
  }
}
