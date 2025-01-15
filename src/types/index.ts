import { Request } from "express";

export interface GenerateImageRequest {
  userQuery: string;
}

export type ImageGenerationRequest = Request<{}, {}, GenerateImageRequest>;

export interface ImageGenerationResponse {
  urls: string[];
}

export interface GeminiServiceConfig {
  apiKey: string;
  config?: typeof import("../config/constants").GEMINI_CONFIG;
}

export interface ReplicateServiceConfig {
  apiKey: string;
  outputDir?: string;
  config?: typeof import("../config/constants").REPLICATE_CONFIG;
}
