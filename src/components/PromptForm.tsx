import { useState, useRef } from "react";
import { Sparkles, Loader2, Upload, X, ImageIcon, FileText, Building2, DollarSign } from "lucide-react";
import { processUpload, type UploadedRef, type RefRole } from "@/lib/uploads";
import type { GenerateOptions, StylePreset, Tone, Audience, Aspect } from "@/hooks/useDeckGenerator";
import { estimateImageCost, formatUsd } from "@/lib/pricing";

const aspectToSize = (a: Aspect) =>
  a === "16:9" ? "1536x1024" : a === "9:16" ? "1024x1536" : "1024x1024";

const EXAMPLES = [
  "Presentation on Tesco x EP Group collab",
  "Proposal from EP Group to M&S on Christmas decor",
  "EP Group sustainability overview for Sainsbury's",
  "EP x Amazon ecommerce packaging & consolidation deck",
];

type Props = {
  busy: boolean;
  onGenerate: (opts: GenerateOptions) => void;
};

const STYLE_PRESETS: { id: StylePreset; label: string; desc: string }[] = [
  { id: "creative", label: "Creative", desc: "Hero imagery, magazine energy" },
  { id: "balanced", label: "Balanced", desc: "Mix of visuals + content" },
  { id: "data", label: "Data-heavy", desc: "Charts, KPIs, comparisons" },
];
const TONES: { id: Tone; label: string }[] = [
  { id: "formal", label: "Formal" },
  { id: "bold", label: "Bold" },
  { id: "playful", label: "Playful" },
];
const AUDIENCES: { id: Audience; label: string }[] = [
  { id: "internal", label: "Internal" },
  { id: "client", label: "Client pitch" },
  { id: "board", label: "Board / Exec" },
];
const ASPECTS: { id: Aspect; label: string }[] = [
  { id: "16:9", label: "16:9" },
  { id: "1:1", label: "1:1" },
  { id: "9:16", label: "9:16" },
];

function SegGroup<T extends string>({
  value,
  options,
  onChange,
  disabled,
}: {
  value: T;
  options: { id: T; label: string; desc?: string }[];
  onChange: (v: T) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {options.map((o) => {
        const active = o.id === value;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            disabled={disabled}
            className={`rounded-xl px-3 py-2.5 text-left border transition disabled:opacity-50 ${
              active
                ? "bg-[#E63027] border-[#E63027] text-white"
                : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <div className="text-sm font-semibold">{o.label}</div>
            {o.desc && (
              <div className={`text-[10px] mt-0.5 ${active ? "text-white/80" : "text-white/40"}`}>{o.desc}</div>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function PromptForm({ busy, onGenerate }: Props) {
  const [brief, setBrief] = useState("");
  const [slideCount, setSlideCount] = useState(8);
  const [branded, setBranded] = useState(true);
  const [stylePreset, setStylePreset] = useState<StylePreset>("balanced");
  const [tone, setTone] = useState<Tone>("formal");
  const [audience, setAudience] = useState<Audience>("client");
  const [aspect, setAspect] = useState<Aspect>("16:9");
  const [refs, setRefs] = useState<UploadedRef[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pendingRole, setPendingRole] = useState<RefRole>("style");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const estCost = estimateImageCost(aspectToSize(aspect), "high") * slideCount;

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    setUploadError(null);
    const added: UploadedRef[] = [];
    for (const f of Array.from(files)) {
      try {
        added.push(await processUpload(f, pendingRole));
      } catch (e) {
        setUploadError((e as Error).message);
      }
    }
    if (added.length) setRefs((prev) => [...prev, ...added]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (brief.trim().length < 4 || busy) return;
        onGenerate({
          brief: brief.trim(),
          slideCount,
          branded,
          stylePreset,
          tone,
          audience,
          aspect,
          refs,
        });
      }}
      className="w-full max-w-3xl mx-auto"
    >
      <label className="block text-sm font-medium text-white/70 mb-3 uppercase tracking-widest">
        Your brief
      </label>
      <textarea
        value={brief}
        onChange={(e) => setBrief(e.target.value)}
        rows={4}
        placeholder="e.g. Make a deck for an EP Group proposal to Tesco on seasonal packaging consolidation…"
        className="w-full rounded-2xl bg-white/5 border border-white/10 px-5 py-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#E63027] focus:border-transparent text-base resize-none"
        disabled={busy}
      />

      <div className="mt-3 flex flex-wrap gap-2">
        {EXAMPLES.map((ex) => (
          <button
            type="button"
            key={ex}
            onClick={() => setBrief(ex)}
            disabled={busy}
            className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition disabled:opacity-50"
          >
            {ex}
          </button>
        ))}
      </div>

      {/* Style controls */}
      <div className="mt-8 space-y-5">
        <div>
          <div className="text-xs uppercase tracking-widest text-white/50 mb-2">Style preset</div>
          <SegGroup value={stylePreset} options={STYLE_PRESETS} onChange={setStylePreset} disabled={busy} />
        </div>
        <div className="grid sm:grid-cols-3 gap-5">
          <div>
            <div className="text-xs uppercase tracking-widest text-white/50 mb-2">Tone</div>
            <SegGroup value={tone} options={TONES} onChange={setTone} disabled={busy} />
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-white/50 mb-2">Audience</div>
            <SegGroup value={audience} options={AUDIENCES} onChange={setAudience} disabled={busy} />
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-white/50 mb-2">Aspect</div>
            <SegGroup value={aspect} options={ASPECTS} onChange={setAspect} disabled={busy} />
          </div>
        </div>
      </div>

      {/* References */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs uppercase tracking-widest text-white/50">References (optional)</div>
          <div className="flex gap-1 text-[10px]">
            {(["style", "logo", "content"] as RefRole[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setPendingRole(r)}
                disabled={busy}
                className={`px-2.5 py-1 rounded-full border ${
                  pendingRole === r
                    ? "bg-white/15 border-white/30 text-white"
                    : "bg-transparent border-white/10 text-white/50 hover:text-white/80"
                }`}
              >
                {r === "style" ? "Style ref" : r === "logo" ? "Logo" : "Content source"}
              </button>
            ))}
          </div>
        </div>
        <label
          className={`block rounded-2xl border-2 border-dashed px-5 py-6 text-center cursor-pointer transition ${
            busy ? "opacity-50 cursor-not-allowed" : "border-white/15 hover:border-white/30 hover:bg-white/5"
          }`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (!busy) handleFiles(e.dataTransfer.files);
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.pptx,.txt,.md,.csv"
            className="hidden"
            disabled={busy}
            onChange={(e) => handleFiles(e.target.files)}
          />
          <Upload className="size-5 mx-auto text-white/40 mb-2" />
          <div className="text-sm text-white/70">
            Drop images, PDFs, or .pptx as <span className="text-white font-semibold">{pendingRole === "style" ? "Style reference" : pendingRole === "logo" ? "Logo" : "Content source"}</span>
          </div>
          <div className="text-[11px] text-white/40 mt-1">
            Images guide palette/typography · PDFs & PPTX feed the planner verbatim · 8 MB max each
          </div>
        </label>
        {uploadError && <div className="mt-2 text-xs text-red-300">{uploadError}</div>}
        {refs.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {refs.map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg pl-2 pr-1 py-1.5 text-xs"
              >
                {r.imageDataUrl ? (
                  <img src={r.imageDataUrl} alt="" className="w-8 h-8 rounded object-cover" />
                ) : r.role === "logo" ? (
                  <Building2 className="size-4 text-white/60" />
                ) : r.text !== undefined ? (
                  <FileText className="size-4 text-white/60" />
                ) : (
                  <ImageIcon className="size-4 text-white/60" />
                )}
                <div className="leading-tight">
                  <div className="text-white/90 max-w-[140px] truncate">{r.name}</div>
                  <div className="text-[9px] uppercase tracking-widest text-white/40">{r.role}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setRefs((prev) => prev.filter((x) => x.id !== r.id))}
                  className="ml-1 p-1 text-white/40 hover:text-white"
                  disabled={busy}
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 grid sm:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white/5 border border-white/10 px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-white/70 uppercase tracking-widest">Slides</span>
            <span className="text-2xl font-bold text-white tabular-nums">{slideCount}</span>
          </div>
          <input
            type="range"
            min={4}
            max={15}
            value={slideCount}
            onChange={(e) => setSlideCount(Number(e.target.value))}
            disabled={busy}
            className="w-full accent-[#E63027]"
          />
        </div>
        <div className="rounded-2xl bg-white/5 border border-white/10 px-5 py-4 flex items-center justify-between">
          <div>
            <div className="text-sm text-white/70 uppercase tracking-widest">EP branding</div>
            <div className="text-xs text-white/50 mt-1">Lock navy, red, logo & footer on every slide</div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={branded}
            onClick={() => setBranded((b) => !b)}
            disabled={busy}
            className={`relative w-12 h-7 rounded-full transition ${branded ? "bg-[#E63027]" : "bg-white/15"}`}
          >
            <span
              className={`absolute top-0.5 ${branded ? "left-[1.4rem]" : "left-0.5"} w-6 h-6 rounded-full bg-white transition-all`}
            />
          </button>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm">
        <div className="flex items-center gap-2 text-white/60">
          <DollarSign className="size-4 text-white/40" />
          Est. image cost
        </div>
        <div className="text-right">
          <span className="font-semibold tabular-nums text-white">~{formatUsd(estCost)}</span>
          <span className="ml-2 text-xs text-white/40">
            {slideCount} × high · {aspect}
          </span>
        </div>
      </div>

      <button
        type="submit"
        disabled={busy || brief.trim().length < 4}
        className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#E63027] hover:bg-[#cc2a23] disabled:bg-white/10 disabled:text-white/40 text-white font-semibold py-4 text-base transition"
      >
        {busy ? (
          <>
            <Loader2 className="size-5 animate-spin" />
            Generating…
          </>
        ) : (
          <>
            <Sparkles className="size-5" />
            Generate Deck
          </>
        )}
      </button>
      <div className="mt-2 text-center text-[11px] text-white/35">
        Estimate only — actual usage is billed by OpenAI and visible on your usage dashboard.
      </div>
    </form>
  );
}