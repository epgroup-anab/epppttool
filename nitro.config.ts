import { defineConfig } from "nitro/config";

export default defineConfig({
  preset: process.env.NITRO_PRESET || "vercel",
  vercel: {
    functions: {
      maxDuration: 800,
      supportsResponseStreaming: true,
    },
  },
});
