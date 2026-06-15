import { useEffect, useRef, useState } from "react";
import { Loader2, Sparkles, Send, ArrowLeft } from "lucide-react";
import type { ChatMessage } from "@/hooks/useDeckGenerator";

type Props = {
  brief: string;
  presetSummary: string;
  messages: ChatMessage[];
  thinking: boolean;
  planning: boolean;
  onSend: (text: string) => void;
  onGenerate: () => void;
  onBack: () => void;
};

export function RefineChat({
  brief,
  presetSummary,
  messages,
  thinking,
  planning,
  onSend,
  onGenerate,
  onBack,
}: Props) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  useEffect(() => {
    if (!thinking) inputRef.current?.focus();
  }, [thinking, messages.length]);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  const submit = () => {
    const t = input.trim();
    if (!t || thinking || planning) return;
    setInput("");
    onSend(t);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={onBack}
          disabled={planning}
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-white/50 hover:text-white transition disabled:opacity-40"
        >
          <ArrowLeft className="size-3.5" /> Edit brief
        </button>
        <div className="text-xs uppercase tracking-widest text-white/40">Refinement</div>
      </div>

      <div className="rounded-2xl bg-white/[0.03] border border-white/10 px-5 py-4 mb-4">
        <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Brief</div>
        <div className="text-sm text-white/90 leading-snug">{brief}</div>
        <div className="text-[11px] text-white/40 mt-2">{presetSummary}</div>
      </div>

      <div
        ref={scrollRef}
        className="rounded-2xl bg-black/20 border border-white/10 p-5 h-[420px] overflow-y-auto space-y-5"
      >
        {messages.map((m, i) =>
          m.role === "assistant" ? (
            <div key={i} className="flex gap-3">
              <div className="shrink-0 w-7 h-7 rounded-md bg-[#E63027] flex items-center justify-center text-[10px] font-black uppercase">
                ep
              </div>
              <div className="text-white/90 whitespace-pre-wrap leading-relaxed text-[15px]">
                {m.text}
              </div>
            </div>
          ) : (
            <div key={i} className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-[#E63027] text-white px-4 py-2.5 whitespace-pre-wrap leading-relaxed text-[15px]">
                {m.text}
              </div>
            </div>
          ),
        )}
        {thinking && (
          <div className="flex gap-3 items-center text-white/50 text-sm">
            <div className="shrink-0 w-7 h-7 rounded-md bg-[#E63027]/30 flex items-center justify-center">
              <Loader2 className="size-3.5 animate-spin" />
            </div>
            Thinking…
          </div>
        )}
      </div>

      <div className="mt-4 rounded-2xl bg-white/5 border border-white/10 p-2 flex items-end gap-2">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          rows={2}
          placeholder="Reply with specifics — stats, partner products, must-include slides…"
          disabled={thinking || planning}
          className="flex-1 bg-transparent resize-none outline-none px-3 py-2 text-white placeholder:text-white/30 text-sm disabled:opacity-50"
        />
        <button
          type="button"
          onClick={submit}
          disabled={!input.trim() || thinking || planning}
          className="h-10 w-10 shrink-0 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 inline-flex items-center justify-center transition"
          aria-label="Send"
        >
          <Send className="size-4" />
        </button>
      </div>

      <button
        type="button"
        onClick={onGenerate}
        disabled={planning || thinking}
        className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#E63027] hover:bg-[#cc2a23] disabled:bg-white/10 disabled:text-white/40 text-white font-semibold py-4 text-base transition"
      >
        {planning ? (
          <>
            <Loader2 className="size-5 animate-spin" />
            Planning your deck…
          </>
        ) : (
          <>
            <Sparkles className="size-5" />
            Generate Deck
          </>
        )}
      </button>
      <div className="mt-2 text-center text-[11px] text-white/40">
        Keep chatting to refine, or generate now with what the AI has so far.
      </div>
    </div>
  );
}