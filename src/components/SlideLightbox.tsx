import { useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Download, Clock } from "lucide-react";
import type { SlideState } from "@/hooks/useDeckGenerator";
import { formatDuration } from "@/hooks/useNow";
import { formatUsd } from "@/lib/pricing";

type Props = {
  slides: SlideState[];
  index: number;
  onClose: () => void;
  onIndexChange: (i: number) => void;
};

export function SlideLightbox({ slides, index, onClose, onIndexChange }: Props) {
  const slide = slides[index];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onIndexChange(Math.min(slides.length - 1, index + 1));
      if (e.key === "ArrowLeft") onIndexChange(Math.max(0, index - 1));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [index, slides.length, onClose, onIndexChange]);

  if (!slide) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#2B3543]/95 backdrop-blur-sm flex items-center justify-center p-6">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
      >
        <X className="size-5" />
      </button>
      <button
        onClick={() => onIndexChange(Math.max(0, index - 1))}
        disabled={index === 0}
        className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-20"
      >
        <ChevronLeft className="size-6" />
      </button>
      <button
        onClick={() => onIndexChange(Math.min(slides.length - 1, index + 1))}
        disabled={index === slides.length - 1}
        className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-20"
      >
        <ChevronRight className="size-6" />
      </button>
      <div className="max-w-6xl w-full">
        {slide.dataUrl && (
          <img src={slide.dataUrl} alt={slide.plan.title} className="w-full rounded-xl shadow-2xl" />
        )}
        <div className="mt-4 flex items-center justify-between text-white">
          <div>
            <div className="text-xs uppercase tracking-widest text-white/50">
              Slide {index + 1} of {slides.length} · {slide.plan.role}
            </div>
            <div className="text-lg font-semibold">{slide.plan.title}</div>
            {(slide.durationMs != null || slide.costUsd != null) && (
              <div className="mt-1 flex items-center gap-3 text-xs text-white/50">
                {slide.durationMs != null && (
                  <span className="inline-flex items-center gap-1 tabular-nums">
                    <Clock className="size-3" />
                    {formatDuration(slide.durationMs)}
                  </span>
                )}
                {slide.costUsd != null && (
                  <span className="tabular-nums">~{formatUsd(slide.costUsd)}</span>
                )}
              </div>
            )}
          </div>
          {slide.dataUrl && (
            <a
              href={slide.dataUrl}
              download={`slide-${String(slide.plan.index).padStart(2, "0")}.png`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#E63027] hover:bg-[#cc2a23] text-white text-sm font-semibold"
            >
              <Download className="size-4" /> Download PNG
            </a>
          )}
        </div>
      </div>
    </div>
  );
}