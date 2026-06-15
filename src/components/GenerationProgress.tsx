import { Check, Loader2, Layers, Sparkles } from "lucide-react";
import type { DeckStatus, SlideState, DeckTimings } from "@/hooks/useDeckGenerator";
import { useNow, formatDuration } from "@/hooks/useNow";
import { formatUsd } from "@/lib/pricing";

type Props = {
  status: DeckStatus;
  slides: SlideState[];
  timings: DeckTimings;
  slideCount: number;
};

function PhaseRow({
  icon,
  label,
  state,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  state: "pending" | "active" | "done";
  detail: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex size-9 shrink-0 items-center justify-center rounded-xl border transition ${
          state === "done"
            ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
            : state === "active"
              ? "border-[#E63027]/40 bg-[#E63027]/15 text-[#ff7b71]"
              : "border-white/10 bg-white/5 text-white/30"
        }`}
      >
        {state === "done" ? (
          <Check className="size-4" />
        ) : state === "active" ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          icon
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div
          className={`text-sm font-medium ${state === "pending" ? "text-white/40" : "text-white"}`}
        >
          {label}
        </div>
        <div className="text-xs text-white/45">{detail}</div>
      </div>
    </div>
  );
}

export function GenerationProgress({ status, slides, timings, slideCount }: Props) {
  const active = status === "planning" || status === "rendering";
  const now = useNow(active);

  const done = slides.filter((s) => s.status === "done").length;
  const errored = slides.filter((s) => s.status === "error").length;
  const total = slides.length || slideCount;
  const pct = total > 0 ? Math.round(((done + errored) / total) * 100) : 0;

  const runningCost = slides.reduce((sum, s) => sum + (s.costUsd ?? 0), 0);

  const planState: "pending" | "active" | "done" =
    status === "planning" ? "active" : timings.planMs != null ? "done" : "pending";
  const renderState: "pending" | "active" | "done" =
    status === "rendering" ? "active" : status === "ready" ? "done" : "pending";

  const planDetail =
    planState === "active"
      ? timings.planStartedAt
        ? `Structuring ${slideCount} slides · ${formatDuration(now - timings.planStartedAt)}`
        : `Structuring ${slideCount} slides…`
      : timings.planMs != null
        ? `Outline ready · ${formatDuration(timings.planMs)}`
        : "Waiting to plan the deck";

  const renderElapsed =
    timings.renderStartedAt != null
      ? (status === "rendering" ? now : (timings.renderEndedAt ?? now)) - timings.renderStartedAt
      : 0;
  const renderDetail =
    renderState === "pending"
      ? "Waiting for the outline"
      : `${done}/${total} rendered${errored ? ` · ${errored} failed` : ""} · ${formatDuration(renderElapsed)}`;

  return (
    <div className="mx-auto mt-8 w-full max-w-3xl rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white/50">
          <Sparkles className="size-3.5 text-[#E63027]" />
          Generating deck
        </div>
        <div className="flex items-center gap-3 text-xs text-white/50">
          <span className="tabular-nums">~{formatUsd(runningCost)}</span>
          <span className="text-white/20">|</span>
          <span className="tabular-nums">{pct}%</span>
        </div>
      </div>

      <div className="space-y-4">
        <PhaseRow
          icon={<Layers className="size-4" />}
          label="Plan the outline"
          state={planState}
          detail={planDetail}
        />
        <PhaseRow
          icon={<Sparkles className="size-4" />}
          label="Render slides"
          state={renderState}
          detail={renderDetail}
        />
      </div>

      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#E63027] to-[#ff7b71] transition-[width] duration-500"
          style={{ width: `${status === "planning" ? 6 : Math.max(6, pct)}%` }}
        />
      </div>

      <div className="mt-3 text-center text-[11px] text-white/35">
        gpt-image-2 · high quality · cost is an estimate, final billing on your OpenAI usage dashboard
      </div>
    </div>
  );
}
