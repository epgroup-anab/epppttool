import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileDown, Clock, DollarSign, Layers, ExternalLink, Plus } from "lucide-react";
import { PromptForm } from "@/components/PromptForm";
import { RefineChat } from "@/components/RefineChat";
import { SlideTile } from "@/components/SlideTile";
import { SlideLightbox } from "@/components/SlideLightbox";
import { GenerationProgress } from "@/components/GenerationProgress";
import { useDeckGenerator } from "@/hooks/useDeckGenerator";
import { useNow, formatDuration } from "@/hooks/useNow";
import { formatUsd } from "@/lib/pricing";
import { exportDeckPptx } from "@/lib/pptxExport";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EP Group Deck Maker" },
      { name: "description", content: "Generate branded EP Group presentation decks from a single prompt." },
      { property: "og:title", content: "EP Group Deck Maker" },
      { property: "og:description", content: "Generate branded EP Group presentation decks from a single prompt." },
    ],
  }),
  component: Index,
});

function StatChip({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2">
      <div className="text-white/40">{icon}</div>
      <div className="leading-tight">
        <div className="text-[10px] uppercase tracking-widest text-white/40">{label}</div>
        <div className="text-sm font-semibold tabular-nums text-white">{value}</div>
      </div>
    </div>
  );
}

function Index() {
  const {
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
  } = useDeckGenerator();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const inChat = status === "refining" || status === "thinking";
  const generating = status === "planning" || status === "rendering";
  const formBusy = status !== "idle" && status !== "error";
  const readyCount = slides.filter((s) => s.status === "done").length;
  const allDone = slides.length > 0 && readyCount === slides.length;

  const now = useNow(generating);
  const totalCost = slides.reduce((sum, s) => sum + (s.costUsd ?? 0), 0);
  const totalElapsed =
    timings.planStartedAt != null
      ? (timings.renderEndedAt ?? now) - timings.planStartedAt
      : null;

  const downloadPptx = async () => {
    const ready = slides.filter((s) => s.dataUrl && s.status === "done");
    if (!ready.length) return;
    await exportDeckPptx(
      ready.map((s) => ({ title: s.plan.title, dataUrl: s.dataUrl! })),
      `${(topic || "ep-group-deck").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60)}.pptx`,
    );
  };

  return (
    <div className="min-h-screen bg-[#161B22] bg-gradient-to-b from-[#1C232F] to-[#161B22] text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#161B22]/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-[#E63027] text-sm font-black text-white">
              ep
            </div>
            <div className="text-lg font-semibold tracking-tight">
              group <span className="text-white/30">/</span> deck maker
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://platform.openai.com/usage"
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-1.5 text-xs font-medium text-white/50 transition hover:text-white sm:inline-flex"
            >
              API usage <ExternalLink className="size-3" />
            </a>
            <div className="flex size-11 flex-col items-center justify-center rounded-lg bg-[#E63027] text-[9px] font-bold uppercase leading-tight">
              <span>ep</span>
              <span>make</span>
              <span>it easy</span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        {status === "idle" && (
          <section className="mb-10 text-center">
            <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs text-white/60">
              <span className="size-1.5 rounded-full bg-[#E63027]" />
              Powered by gpt-image-2 · on-brand every time
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Generate a deck. <span className="text-[#E63027]">In one prompt.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-white/60">
              Type the topic. AI asks a few sharp questions, then renders every slide on-brand —
              walk away with PNGs and a PowerPoint.
            </p>
          </section>
        )}

        {status === "idle" && <PromptForm busy={formBusy} onGenerate={startRefinement} />}

        {inChat && formOpts && (
          <RefineChat
            brief={formOpts.brief}
            presetSummary={`${formOpts.slideCount} slides · ${formOpts.aspect} · ${formOpts.stylePreset} · ${formOpts.tone} · ${formOpts.audience}${formOpts.branded ? " · EP branded" : ""}`}
            messages={chat}
            thinking={status === "thinking"}
            planning={false}
            onSend={sendChat}
            onGenerate={() => generate()}
            onBack={resetSession}
          />
        )}

        {generating && (
          <GenerationProgress
            status={status}
            slides={slides}
            timings={timings}
            slideCount={formOpts?.slideCount ?? slides.length}
          />
        )}

        {error && (
          <div className="mx-auto mt-8 max-w-3xl rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-200">
            {error}
          </div>
        )}

        {slides.length > 0 && (
          <section className="mt-12">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-widest text-white/40">Deck</div>
                <h2 className="text-2xl font-bold">{topic}</h2>
                <div className="mt-1 text-sm text-white/50">
                  {readyCount} / {slides.length} slides rendered
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={resetSession}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white/80 transition hover:bg-white/10"
                >
                  <Plus className="size-4" /> New deck
                </button>
                <button
                  onClick={downloadPptx}
                  disabled={!allDone}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#E63027] px-5 py-3 font-semibold text-white transition hover:bg-[#cc2a23] disabled:bg-white/10 disabled:text-white/40"
                >
                  <FileDown className="size-4" />
                  Download .pptx
                </button>
              </div>
            </div>

            {/* Deck-level stats */}
            <div className="mb-6 flex flex-wrap gap-2">
              <StatChip icon={<Layers className="size-4" />} label="Slides" value={`${slides.length}`} />
              <StatChip
                icon={<Clock className="size-4" />}
                label="Total time"
                value={totalElapsed != null ? formatDuration(totalElapsed) : "—"}
              />
              <StatChip
                icon={<DollarSign className="size-4" />}
                label={allDone ? "Image cost" : "Cost so far"}
                value={`~${formatUsd(totalCost)}`}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {slides.map((s, i) => (
                <SlideTile
                  key={s.plan.index}
                  slide={s}
                  onOpen={() => setLightboxIndex(i)}
                  onRegenerate={(prompt) => regenerate(s.plan.index, prompt)}
                />
              ))}
            </div>
          </section>
        )}

        <footer className="mt-20 flex items-center justify-between border-t border-white/10 pt-8 text-xs text-white/40">
          <span>epgroup.co.uk</span>
          <span>Internal tool · Euro Packaging Group</span>
        </footer>
      </main>

      {lightboxIndex !== null && (
        <SlideLightbox
          slides={slides}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onIndexChange={setLightboxIndex}
        />
      )}
    </div>
  );
}
