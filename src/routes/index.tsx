import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileDown } from "lucide-react";
import { PromptForm } from "@/components/PromptForm";
import { RefineChat } from "@/components/RefineChat";
import { SlideTile } from "@/components/SlideTile";
import { SlideLightbox } from "@/components/SlideLightbox";
import { useDeckGenerator } from "@/hooks/useDeckGenerator";
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

function Index() {
  const {
    status,
    topic,
    slides,
    error,
    chat,
    formOpts,
    startRefinement,
    sendChat,
    generate,
    regenerate,
    resetSession,
  } = useDeckGenerator();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const inChat = status === "refining" || status === "thinking" || (status === "planning" && !!formOpts && slides.length === 0);
  const formBusy = status !== "idle" && status !== "error";
  const readyCount = slides.filter((s) => s.status === "done").length;
  const allDone = slides.length > 0 && readyCount === slides.length;

  const downloadPptx = async () => {
    const ready = slides.filter((s) => s.dataUrl && s.status === "done");
    if (!ready.length) return;
    await exportDeckPptx(
      ready.map((s) => ({ title: s.plan.title, dataUrl: s.dataUrl! })),
      `${(topic || "ep-group-deck").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60)}.pptx`,
    );
  };

  return (
    <div className="min-h-screen bg-[#2B3543] text-white">
      <header className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#E63027] flex items-center justify-center font-black text-white text-sm">
              ep
            </div>
            <div className="text-lg font-semibold tracking-tight">
              group <span className="text-white/40">/</span> deck maker
            </div>
          </div>
          <div className="w-12 h-12 rounded-lg bg-[#E63027] flex flex-col items-center justify-center text-[9px] font-bold leading-tight uppercase">
            <span>ep</span>
            <span>make</span>
            <span>it easy</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {slides.length === 0 && !inChat && (
          <section className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Generate a deck. <span className="text-[#E63027]">In one prompt.</span>
            </h1>
            <p className="mt-4 text-white/60 max-w-xl mx-auto">
              Type the topic. AI asks a few sharp questions, then renders every slide on-brand —
              walk away with PNGs and a PowerPoint.
            </p>
          </section>
        )}

        {!inChat && slides.length === 0 && (
          <PromptForm busy={formBusy} onGenerate={startRefinement} />
        )}

        {inChat && formOpts && (
          <RefineChat
            brief={formOpts.brief}
            presetSummary={`${formOpts.slideCount} slides · ${formOpts.aspect} · ${formOpts.stylePreset} · ${formOpts.tone} · ${formOpts.audience}${formOpts.branded ? " · EP branded" : ""}`}
            messages={chat}
            thinking={status === "thinking"}
            planning={status === "planning"}
            onSend={sendChat}
            onGenerate={() => generate()}
            onBack={resetSession}
          />
        )}

        {error && (
          <div className="mt-8 max-w-3xl mx-auto rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 px-5 py-4 text-sm">
            {error}
          </div>
        )}

        {slides.length > 0 && (
          <section className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-xs uppercase tracking-widest text-white/40">Deck</div>
                <h2 className="text-2xl font-bold">{topic}</h2>
                <div className="text-sm text-white/50 mt-1">
                  {readyCount} / {slides.length} slides rendered
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={resetSession}
                  className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/80 text-sm font-medium transition"
                >
                  New deck
                </button>
                <button
                  onClick={downloadPptx}
                  disabled={!allDone}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#E63027] hover:bg-[#cc2a23] disabled:bg-white/10 disabled:text-white/40 text-white font-semibold transition"
                >
                  <FileDown className="size-4" />
                  Download .pptx
                </button>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

        <footer className="mt-20 pt-8 border-t border-white/10 text-xs text-white/40 flex items-center justify-between">
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
