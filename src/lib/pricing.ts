// gpt-image-2 cost model.
//
// OpenAI bills image generation by tokens (checked 2026):
//   - text input      $5.00 / 1M tokens
//   - image input     $8.00 / 1M tokens
//   - image output   $30.00 / 1M tokens
//
// When the API returns a usage object we price it exactly. Otherwise we fall
// back to the published per-size/quality output-token table plus a small input
// allowance for the prompt text.

export const TOKEN_RATES_USD_PER_1M = {
  textInput: 5,
  imageInput: 8,
  imageOutput: 30,
} as const;

export type ImageQuality = "low" | "medium" | "high";
export type ImageSize = "1024x1024" | "1024x1536" | "1536x1024";

// Output tokens per generated image (OpenAI image generation calculator).
const OUTPUT_TOKENS: Record<ImageSize, Record<ImageQuality, number>> = {
  "1024x1024": { low: 272, medium: 1056, high: 4160 },
  "1024x1536": { low: 408, medium: 1584, high: 6240 },
  "1536x1024": { low: 400, medium: 1568, high: 6208 },
};

// Streaming with partial_images adds ~100 output tokens per partial frame.
const PARTIAL_IMAGE_TOKENS = 100;

// The planner emits long prompts (~550-900 words ≈ ~1,300 tokens) that count as
// text input to the image model.
const ESTIMATED_PROMPT_TOKENS = 1300;

export type ImageUsage = {
  total_tokens?: number;
  input_tokens?: number;
  output_tokens?: number;
  input_tokens_details?: {
    text_tokens?: number;
    image_tokens?: number;
  };
};

export function normalizeSize(size: string): ImageSize {
  if (size === "1024x1024" || size === "1024x1536" || size === "1536x1024") return size;
  return "1536x1024";
}

/** Exact cost in USD from an API-reported usage object. */
export function costFromUsage(usage: ImageUsage): number {
  const out = usage.output_tokens ?? 0;
  const details = usage.input_tokens_details;
  const textIn = details?.text_tokens ?? usage.input_tokens ?? 0;
  const imageIn = details?.image_tokens ?? 0;
  return (
    (textIn * TOKEN_RATES_USD_PER_1M.textInput +
      imageIn * TOKEN_RATES_USD_PER_1M.imageInput +
      out * TOKEN_RATES_USD_PER_1M.imageOutput) /
    1_000_000
  );
}

/** Estimated cost in USD for one image before the API reports usage. */
export function estimateImageCost(
  size: string,
  quality: ImageQuality = "high",
  partialImages = 1,
): number {
  const s = normalizeSize(size);
  const outputTokens = OUTPUT_TOKENS[s][quality] + partialImages * PARTIAL_IMAGE_TOKENS;
  const cost =
    (ESTIMATED_PROMPT_TOKENS * TOKEN_RATES_USD_PER_1M.textInput +
      outputTokens * TOKEN_RATES_USD_PER_1M.imageOutput) /
    1_000_000;
  return cost;
}

/** Format a USD amount with adaptive precision for small values. */
export function formatUsd(amount: number): string {
  if (amount <= 0) return "$0.00";
  if (amount < 0.01) return `$${amount.toFixed(4)}`;
  if (amount < 1) return `$${amount.toFixed(3)}`;
  return `$${amount.toFixed(2)}`;
}
