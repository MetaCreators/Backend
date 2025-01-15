import { GoogleGenerativeAI } from "@google/generative-ai";
import { IMAGE_GENERATION, GEMINI_CONFIG } from "../../config/constants";
import { GeminiServiceConfig } from "../../types";

export class GeminiService {
  private model: any;

  constructor({ apiKey, config = GEMINI_CONFIG }: GeminiServiceConfig) {
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({
      model: config.model,
      generationConfig: config,
    });
  }

  private buildPrompt(userQuery: string): string {
    return `
      You are a world-class thumbnail designer and creative expert specializing in creating viral, engaging, and high-impact video thumbnails.
      Your task is to enhance this thumbnail concept while ensuring it includes the trigger word "${IMAGE_GENERATION.TRIGGER_WORD}" if not already present.

      Thumbnail Request: ${userQuery}

      Requirements:
      1. Always include the trigger word "${IMAGE_GENERATION.TRIGGER_WORD}" naturally in the prompt
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

      if (
        !refinedPrompt
          .toLowerCase()
          .includes(IMAGE_GENERATION.TRIGGER_WORD.toLowerCase())
      ) {
        return `${IMAGE_GENERATION.TRIGGER_WORD}, ${refinedPrompt}`;
      }
      return refinedPrompt;
    } catch (error) {
      console.error("Error in Gemini prompt enhancement:", error);
      throw new Error("Failed to enhance prompt with Gemini");
    }
  }
}
