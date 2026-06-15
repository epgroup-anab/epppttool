import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

/** OpenAI chat/completions provider for deck planning and refinement. */
export function createOpenAiProvider(openaiApiKey: string) {
  return createOpenAICompatible({
    name: "openai",
    baseURL: "https://api.openai.com/v1",
    headers: {
      Authorization: `Bearer ${openaiApiKey}`,
    },
  });
}

/** Vision-capable model for planDeck (ref images) and refineChat. */
export const OPENAI_PLANNER_MODEL = "gpt-4.1";
