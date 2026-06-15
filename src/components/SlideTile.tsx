import { useState } from "react";
import { Download, RefreshCw, Pencil, AlertTriangle, Clock, Maximize2 } from "lucide-react";
import type { SlideState } from "@/hooks/useDeckGenerator";
import { useNow, formatDuration } from "@/hooks/useNow";
import { formatUsd } from "@/lib/pricing";

type Props = {
  slide: SlideState;
  onOpen: () => void;
  onRegenerate: (promptOverride?: string) => void;
};

export function SlideTile({ slide, onOpen, onRegenerate }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [draftPrompt, setDraftPrompt] = useState(slide.plan.imagePrompt);

  const isStreaming = slide.status === "streaming";
  const isFinal = slide.status === "done";
  const isPending = slide.status === "pending";
  const isError = slide.status === "error";
  const hasPreview = !!slide.dataUrl;

  const now = useNow(isStreaming || isPending);
  const liveElapsed = slide.startedAt ? now - slide.startedAt : 0;

  const download = () => {
    if (!slide.dataUrl) return;
    const a = document.createElement("a");
    a.href = slide.dataUrl;
    a.download = `slide-${String(slide.plan.index).padStart(2, "0")}-${slide.plan.title.replace(/\s+/g, "-").toLowerCase()}.png`;
    a.click();
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition hover:border-white/20">
      <div
        className="relative aspect-video overflow-hidden bg-[#161B22]"
        onClick={() => isFinal && onOpen()}
        style={{ cursor: isFinal ? "zoom-in" : "default" }}
      >
        {hasPreview ? (
          <img
            src={slide.dataUrl!}
            alt={slide.plan.title}
            className={`size-full object-cover transition-[filter,transform] duration-700 ${
              isStreaming ? "scale-105 blur-xl" : "blur-0"
            }`}
          />
        ) : isError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center text-red-300">
            <AlertTriangle className="mb-2 size-7" />
            <p className="line-clamp-3 text-xs">{slide.error ?? "Render failed"}</p>
          </div>
        ) : (
          // Shimmer skeleton while queued / starting
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent" />
            <div className="shimmer absolute inset-0" />
            <div className="absolute inset-x-5 top-5 space-y-2">
              <div className="h-3 w-1/3 rounded bg-white/10" />
              <div className="h-6 w-3/4 rounded bg-white/10" />
            </div>
            <div className="absolute inset-x-5 bottom-5 flex gap-2">
              <div className="h-10 w-1/4 rounded bg-white/10" />
              <div className="h-10 w-1/4 rounded bg-white/10" />
              <div className="h-10 w-1/4 rounded bg-white/10" />
            </div>
          </div>
        )}

        {/* Status pill */}
        {(isStreaming || isPending) && (
          <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-white/90 backdrop-blur">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#ff7b71] opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-[#E63027]" />
            </span>
            {isPending ? "Queued" : "Rendering"}
            <span className="tabular-nums text-white/60">{formatDuration(liveElapsed)}</span>
          </div>
        )}

        {/* Open affordance on hover for finished slides */}
        {isFinal && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/20 group-hover:opacity-100">
            <div className="rounded-full bg-black/60 p-2.5 text-white backdrop-blur">
              <Maximize2 className="size-4" />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 p-3">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-widest text-white/40">
            Slide {slide.plan.index} · {slide.plan.role}
          </div>
          <div className="truncate text-sm font-medium text-white">{slide.plan.title}</div>
          {isFinal && (slide.durationMs != null || slide.costUsd != null) && (
            <div className="mt-1 flex items-center gap-2 text-[10px] text-white/40">
              {slide.durationMs != null && (
                <span className="inline-flex items-center gap-1 tabular-nums">
                  <Clock className="size-3" />
                  {formatDuration(slide.durationMs)}
                </span>
              )}
              {slide.costUsd != null && (
                <span className="tabular-nums">{formatUsd(slide.costUsd)}</span>
              )}
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={download}
            disabled={!isFinal}
            title="Download PNG"
            className="rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-30"
          >
            <Download className="size-4" />
          </button>
          <button
            onClick={() => setEditOpen((v) => !v)}
            title="Edit prompt"
            className={`rounded-lg p-2 transition hover:bg-white/10 hover:text-white ${editOpen ? "bg-white/10 text-white" : "text-white/70"}`}
          >
            <Pencil className="size-4" />
          </button>
          <button
            onClick={() => onRegenerate()}
            disabled={isStreaming}
            title="Regenerate"
            className="rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-30"
          >
            <RefreshCw className={`size-4 ${isStreaming ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {editOpen && (
        <div className="border-t border-white/10 bg-black/30 p-3">
          <textarea
            value={draftPrompt}
            onChange={(e) => setDraftPrompt(e.target.value)}
            rows={6}
            className="w-full rounded-lg border border-white/10 bg-white/5 p-2 text-xs text-white/80 focus:outline-none focus:ring-1 focus:ring-[#E63027]"
          />
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => {
                setEditOpen(false);
                onRegenerate(draftPrompt);
              }}
              className="rounded-lg bg-[#E63027] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#cc2a23]"
            >
              Re-render with edits
            </button>
            <button
              onClick={() => {
                setDraftPrompt(slide.plan.imagePrompt);
                setEditOpen(false);
              }}
              className="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-white/70 hover:bg-white/10"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
