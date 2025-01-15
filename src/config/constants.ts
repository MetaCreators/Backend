export const IMAGE_GENERATION = {
  TRIGGER_WORD: "flux_style",
  DEFAULT_ASPECT_RATIO: "16:9",
  DEFAULT_NUM_OUTPUTS: 1,
  DEFAULT_STEPS: 40,
};

export const GEMINI_CONFIG = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  model: "gemini-1.5-flash",
};

export const REPLICATE_CONFIG = {
  // Note: These are now separated for proper path construction
  modelPath: "adityaraj-007/shikhar_flux",
  modelVersion:
    "925da5f563c07bb620a3bf3cc2185079b1cfc7d62f47a9c234e67dbc36eab738",
  defaultSettings: {
    model: "dev",
    go_fast: false,
    lora_scale: 1,
    megapixels: "1",
    guidance_scale: 3,
    output_quality: 90,
    prompt_strength: 0.8,
    extra_lora_scale: 1,
    output_format: "webp",
  },
};
