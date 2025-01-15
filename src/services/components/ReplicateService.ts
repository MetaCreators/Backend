import Replicate from "replicate";
import { IMAGE_GENERATION, REPLICATE_CONFIG } from "../../config/constants";
import { ReplicateServiceConfig } from "../../types";

export class ReplicateService {
  private replicate: Replicate;
  private config: typeof REPLICATE_CONFIG;

  constructor({
    apiKey,
    outputDir = "public/genpersonimage",
    config = REPLICATE_CONFIG,
  }: ReplicateServiceConfig) {
    this.replicate = new Replicate({
      auth: apiKey,
      useFileOutput: false,
    });
    this.config = config;
  }

  async generateImage(prompt: string): Promise<string[]> {
    try {
      const input = {
        ...this.config.defaultSettings,
        prompt,
        num_outputs: IMAGE_GENERATION.DEFAULT_NUM_OUTPUTS,
        aspect_ratio: IMAGE_GENERATION.DEFAULT_ASPECT_RATIO,
        num_inference_steps: IMAGE_GENERATION.DEFAULT_STEPS,
      };

      console.log("Sending request to Replicate API with input:", input);

      // Using as const to ensure the literal type is preserved
      const modelPath = "adityaraj-007/shikhar_flux" as const;
      const modelVersion =
        "925da5f563c07bb620a3bf3cc2185079b1cfc7d62f47a9c234e67dbc36eab738" as const;

      // Construct the model string with the correct template literal type
      const modelString =
        `${modelPath}/${modelVersion}` as `${typeof modelPath}/${typeof modelVersion}`;

      const output = await this.replicate.run(modelString, { input });

      console.log("Replicate API response:", output);

      if (Array.isArray(output) && output.length > 0) {
        if (typeof output[0] === "string" && output[0].startsWith("http")) {
          return output;
        }
      }

      throw new Error(`Unexpected output format: ${typeof output}`);
    } catch (error) {
      console.error("Error in Replicate image generation:", error);
      throw error instanceof Error
        ? error
        : new Error("Failed to generate image with Replicate");
    }
  }
}
