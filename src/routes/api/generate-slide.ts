import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/generate-slide")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { prompt, size } = (await request.json()) as { prompt?: string; size?: string };
        if (!prompt || typeof prompt !== "string") {
          return new Response("Missing prompt", { status: 400 });
        }
        const allowedSizes = new Set(["1024x1024", "1024x1536", "1536x1024"]);
        const finalSize = size && allowedSizes.has(size) ? size : "1536x1024";
        const key = process.env.OPENAI_API_KEY;
        if (!key) return new Response("Missing OPENAI_API_KEY", { status: 500 });

        const upstream = await fetch("https://api.openai.com/v1/images/generations", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-image-2",
            prompt,
            size: finalSize,
            quality: "high",
            n: 1,
            stream: true,
            partial_images: 1,
          }),
        });
        if (!upstream.ok || !upstream.body) {
          const text = await upstream.text().catch(() => "");
          return new Response(text || "Upstream error", { status: upstream.status });
        }
        return new Response(upstream.body, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
          },
        });
      },
    },
  },
});