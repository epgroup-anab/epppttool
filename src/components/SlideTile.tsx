import { useState } from "react";
import { Download, RefreshCw, Pencil, AlertTriangle, Loader2 } from "lucide-react";
import type { SlideState } from "@/hooks/useDeckGenerator";

type Props = {
  slide: SlideState;
  onOpen: () => void;
  onRegenerate: (promptOverride?: string) => void;
};

export function SlideTile({ slide, onOpen, onRegenerate }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [draftPrompt, setDraftPrompt] = useState(slide.plan.imagePrompt);

  const download = () => {
    if (!slide.dataUrl) return;
    const a = document.createElement("a");
    a.href = slide.dataUrl;
    a.download = `slide-${String(slide.plan.index).padStart(2, "0")}-${slide.plan.title.replace(/\s+/g, "-").toLowerCase()}.png`;
    a.click();
  };

  const isStreaming = slide.status === "streaming" && slide.dataUrl;
  const isFinal = slide.status === "done";

  return (
    <div className="group relative rounded-2xl overflow-hidden border border-white/10 bg-white/5">
      <div
        className="aspect-video bg-[#1a2029] cursor-pointer relative overflow-hidden"
        onClick={() => isFinal && onOpen()}
      >
        {slide.dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={slide.dataUrl}
            alt={slide.plan.title}
            className={`w-full h-full object-cover transition-[filter] duration-500 ${
              isStreaming ? "blur-2xl scale-110" : "blur-0"
            }`}
          />
        ) : slide.status === "error" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 text-red-300">
            <AlertTriangle className="size-8 mb-2" />
            <p className="text-xs">{slide.error ?? "Failed"}</p>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white/40">
            <Loader2 className="size-8 animate-spin" />
          </div>
        )}

        {isStreaming && (
          <div className="absolute top-3 left-3 text-[10px] font-semibold uppercase tracking-widest bg-black/50 text-white/90 px-2 py-1 rounded-full backdrop-blur">
            Rendering…
          </div>
        )}
      </div>

      <div className="p-3 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-widest text-white/40">
            Slide {slide.plan.index} · {slide.plan.role}
          </div>
          <div className="text-sm text-white truncate font-medium">{slide.plan.title}</div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={download}
            disabled={!isFinal}
            title="Download PNG"
            className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white disabled:opacity-30"
          >
            <Download className="size-4" />
          </button>
          <button
            onClick={() => setEditOpen((v) => !v)}
            title="Edit prompt"
            className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white"
          >
            <Pencil className="size-4" />
          </button>
          <button
            onClick={() => onRegenerate()}
            disabled={slide.status === "streaming"}
            title="Regenerate"
            className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white disabled:opacity-30"
          >
            <RefreshCw className={`size-4 ${slide.status === "streaming" ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {editOpen && (
        <div className="border-t border-white/10 p-3 bg-black/30">
          <textarea
            value={draftPrompt}
            onChange={(e) => setDraftPrompt(e.target.value)}
            rows={6}
            className="w-full text-xs rounded-lg bg-white/5 border border-white/10 p-2 text-white/80 focus:outline-none focus:ring-1 focus:ring-[#E63027]"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => {
                setEditOpen(false);
                onRegenerate(draftPrompt);
              }}
              className="text-xs px-3 py-1.5 rounded-lg bg-[#E63027] hover:bg-[#cc2a23] text-white font-semibold"
            >
              Re-render with edits
            </button>
            <button
              onClick={() => {
                setDraftPrompt(slide.plan.imagePrompt);
                setEditOpen(false);
              }}
              className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}