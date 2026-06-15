import { useCallback, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { planDeck, refineChat, type DeckPlan, type SlidePlan } from "@/lib/deck.functions";
import { streamImage } from "@/lib/streamImage";
import { costFromUsage, estimateImageCost, type ImageUsage } from "@/lib/pricing";
import type { UploadedRef } from "@/lib/uploads";

export type StylePreset = "creative" | "balanced" | "data";
export type Tone = "formal" | "bold" | "playful";
export type Audience = "internal" | "client" | "board";
export type Aspect = "16:9" | "1:1" | "9:16";

export type GenerateOptions = {
  brief: string;
  slideCount: number;
  branded: boolean;
  stylePreset: StylePreset;
  tone: Tone;
  audience: Audience;
  aspect: Aspect;
  refs: UploadedRef[];
};

const aspectToSize = (a: Aspect) =>
  a === "16:9" ? "1536x1024" : a === "9:16" ? "1024x1536" : "1024x1024";

export type SlideStatus = "pending" | "streaming" | "done" | "error";

export type SlideState = {
  plan: SlidePlan;
  status: SlideStatus;
  dataUrl: string | null;
  error: string | null;
  startedAt: number | null;
  durationMs: number | null;
  usage: ImageUsage | null;
  costUsd: number | null;
};

export type DeckTimings = {
  planStartedAt: number | null;
  planMs: number | null;
  renderStartedAt: number | null;
  renderEndedAt: number | null;
};

export type DeckStatus =
  | "idle"
  | "refining"
  | "thinking"
  | "planning"
  | "rendering"
  | "ready"
  | "error";

export type ChatMessage = { role: "user" | "assistant"; text: string };

const MAX_CONCURRENT = 4;

export function useDeckGenerator() {
  const planDeckFn = useServerFn(planDeck);
  const refineChatFn = useServerFn(refineChat);
  const [status, setStatus] = useState<DeckStatus>("idle");
  const [topic, setTopic] = useState("");
  const [slides, setSlides] = useState<SlideState[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [formOpts, setFormOpts] = useState<GenerateOptions | null>(null);
  const [timings, setTimings] = useState<DeckTimings>({
    planStartedAt: null,
    planMs: null,
    renderStartedAt: null,
    renderEndedAt: null,
  });
  const slidesRef = useRef<SlideState[]>([]);
  const sizeRef = useRef<string>("1536x1024");
  const aspectStateRef = useRef<Aspect>("16:9");

  const updateSlide = (index: number, patch: Partial<SlideState>) => {
    setSlides((prev) => {
      const next = prev.map((s) => (s.plan.index === index ? { ...s, ...patch } : s));
      slidesRef.current = next;
      return next;
    });
  };

  const renderOne = useCallback(async (slide: SlidePlan, promptOverride?: string) => {
    const startedAt = Date.now();
    updateSlide(slide.index, {
      status: "streaming",
      error: null,
      dataUrl: null,
      startedAt,
      durationMs: null,
      usage: null,
      costUsd: null,
    });
    try {
      const { usage } = await streamImage(
        "/api/generate-slide",
        promptOverride ?? slide.imagePrompt,
        (dataUrl, isFinal) => {
          updateSlide(slide.index, {
            dataUrl,
            status: isFinal ? "done" : "streaming",
          });
        },
        { size: sizeRef.current },
      );
      const costUsd = usage ? costFromUsage(usage) : estimateImageCost(sizeRef.current, "high");
      updateSlide(slide.index, {
        status: "done",
        durationMs: Date.now() - startedAt,
        usage: usage ?? null,
        costUsd,
      });
    } catch (e) {
      updateSlide(slide.index, {
        status: "error",
        error: (e as Error).message,
        durationMs: Date.now() - startedAt,
      });
    }
  }, []);

  const renderAll = useCallback(
    async (plans: SlidePlan[]) => {
      let cursor = 0;
      const workers = Array.from({ length: Math.min(MAX_CONCURRENT, plans.length) }, async () => {
        while (cursor < plans.length) {
          const myIndex = cursor++;
          await renderOne(plans[myIndex]);
        }
      });
      await Promise.all(workers);
    },
    [renderOne],
  );

  const buildRefPayload = (opts: GenerateOptions) => {
    const refImages = opts.refs
      .filter((r) => r.imageDataUrl && (r.role === "style" || r.role === "logo"))
      .map((r) => ({ role: r.role as "style" | "logo", dataUrl: r.imageDataUrl!, name: r.name }));
    const refTexts = opts.refs
      .filter((r) => r.text && (r.role === "style" || r.role === "content"))
      .map((r) => ({ role: r.role as "style" | "content", name: r.name, text: r.text! }));
    return { refImages, refTexts };
  };

  const startRefinement = useCallback(
    async (opts: GenerateOptions) => {
      setError(null);
      setSlides([]);
      slidesRef.current = [];
      setFormOpts(opts);
      setChat([]);
      setStatus("thinking");
      try {
        const { refImages, refTexts } = buildRefPayload(opts);
        const { reply } = await refineChatFn({
          data: {
            brief: opts.brief,
            slideCount: opts.slideCount,
            branded: opts.branded,
            stylePreset: opts.stylePreset,
            tone: opts.tone,
            audience: opts.audience,
            aspect: opts.aspect,
            refImages,
            refTexts,
            messages: [],
          },
        });
        setChat([{ role: "assistant", text: reply }]);
        setStatus("refining");
      } catch (e) {
        setError((e as Error).message);
        setStatus("error");
      }
    },
    [refineChatFn],
  );

  const sendChat = useCallback(
    async (text: string) => {
      if (!formOpts) return;
      const trimmed = text.trim();
      if (!trimmed) return;
      const next: ChatMessage[] = [...chat, { role: "user", text: trimmed }];
      setChat(next);
      setStatus("thinking");
      try {
        const { refImages, refTexts } = buildRefPayload(formOpts);
        const { reply } = await refineChatFn({
          data: {
            brief: formOpts.brief,
            slideCount: formOpts.slideCount,
            branded: formOpts.branded,
            stylePreset: formOpts.stylePreset,
            tone: formOpts.tone,
            audience: formOpts.audience,
            aspect: formOpts.aspect,
            refImages,
            refTexts,
            messages: next,
          },
        });
        setChat([...next, { role: "assistant", text: reply }]);
        setStatus("refining");
      } catch (e) {
        setError((e as Error).message);
        setStatus("error");
      }
    },
    [chat, formOpts, refineChatFn],
  );

  const resetSession = useCallback(() => {
    setFormOpts(null);
    setChat([]);
    setSlides([]);
    slidesRef.current = [];
    setError(null);
    setTopic("");
    setStatus("idle");
    setTimings({
      planStartedAt: null,
      planMs: null,
      renderStartedAt: null,
      renderEndedAt: null,
    });
  }, []);

  const generate = useCallback(
    async (optsOverride?: GenerateOptions) => {
      const opts = optsOverride ?? formOpts;
      if (!opts) return;
      const planStartedAt = Date.now();
      setStatus("planning");
      setError(null);
      setSlides([]);
      slidesRef.current = [];
      sizeRef.current = aspectToSize(opts.aspect);
      aspectStateRef.current = opts.aspect;
      setTimings({
        planStartedAt,
        planMs: null,
        renderStartedAt: null,
        renderEndedAt: null,
      });
      try {
        const { refImages, refTexts } = buildRefPayload(opts);
        const plan: DeckPlan = await planDeckFn({
          data: {
            brief: opts.brief,
            slideCount: opts.slideCount,
            branded: opts.branded,
            stylePreset: opts.stylePreset,
            tone: opts.tone,
            audience: opts.audience,
            aspect: opts.aspect,
            refImages,
            refTexts,
            chatTranscript: chat,
          },
        });
        setTopic(plan.topic);
        const normalized = plan.slides
          .slice(0, opts.slideCount)
          .map((s, i) => ({ ...s, index: i + 1 }));
        const initial: SlideState[] = normalized.map((p) => ({
          plan: p,
          status: "pending",
          dataUrl: null,
          error: null,
          startedAt: null,
          durationMs: null,
          usage: null,
          costUsd: null,
        }));
        setSlides(initial);
        slidesRef.current = initial;
        const renderStartedAt = Date.now();
        setTimings((t) => ({
          ...t,
          planMs: renderStartedAt - planStartedAt,
          renderStartedAt,
        }));
        setStatus("rendering");
        await renderAll(normalized);
        setTimings((t) => ({ ...t, renderEndedAt: Date.now() }));
        setStatus("ready");
      } catch (e) {
        setError((e as Error).message);
        setStatus("error");
      }
    },
    [planDeckFn, renderAll, formOpts, chat],
  );

  const regenerate = useCallback(
    async (index: number, promptOverride?: string) => {
      const slide = slidesRef.current.find((s) => s.plan.index === index);
      if (!slide) return;
      const newPlan = promptOverride
        ? { ...slide.plan, imagePrompt: promptOverride }
        : slide.plan;
      if (promptOverride) updateSlide(index, { plan: newPlan });
      await renderOne(newPlan);
    },
    [renderOne],
  );

  return {
    status,
    topic,
    slides,
    error,
    chat,
    formOpts,
    timings,
    startRefinement,
    sendChat,
    generate,
    regenerate,
    resetSession,
    aspect: aspectStateRef.current,
  };
}