
# EP Group Slide Deck Image Maker

A single-page tool where you type a short brief ("deck on EP Group x Tesco Christmas proposal"), pick how many slides you want, and the app generates a full visual slide deck — each slide as a 16:9 image rendered by GPT Image 2, plus a downloadable PowerPoint bundling them all.

## User flow

1. Land on the generator page.
2. Enter a brief in a large prompt box. Examples shown as clickable chips ("Presentation on Tesco x EP Group collab", "Proposal to M&S on Christmas decor", "EP Group sustainability overview for Sainsbury's").
3. Pick slide count (slider, 4–15, default 8).
4. Toggle "Apply EP Group branding" (default ON — locks navy #2B3543, red `ep` logo, "ep make it easy" footer, epgroup.co.uk URL into every slide prompt).
5. Click **Generate Deck**.
6. Stage 1 — "Planning your deck…": the brief is sent to a Gemini model that returns a structured JSON plan with one detailed image prompt per slide (cover, content slides, closing). User sees the plan appear slide-by-slide with a title + role (e.g. "Slide 3 — Capability stats").
7. Stage 2 — "Rendering slides…": each slide prompt is sent to GPT Image 2 (`/v1/images/generations`, `quality: low`, `stream: true`, `partial_images: 1`) **in parallel**. Each slide tile streams partial frames with a blur effect, sharpening when the final image arrives.
8. Final grid view: all slides as 16:9 thumbnails. Each tile has:
   - Click to open full-size lightbox
   - **Download PNG** button per slide
   - **Regenerate** button (re-runs just that one slide with the same prompt, or with an edit-prompt input)
   - **Edit prompt** button (shows the underlying detailed prompt; user can tweak and re-render)
9. Top of the grid: **Download all as PPTX** button — bundles every PNG into a 16:9 PowerPoint, one image per slide, full-bleed.

No login. No history. Each generation is session-only.

## Branding system

A central `epBrand.ts` constant exports the EP visual contract used to enrich every slide prompt when the toggle is ON:

- Palette: navy-slate `#2B3543`, EP red `#E63027`, white, light grey `#F2F2F2`.
- Logo lockup rules: red rounded-square `ep` mark + `group` in white lowercase; "ep make it easy" red square in bottom-right; `epgroup.co.uk` bottom-left.
- Type: clean geometric sans-serif, white titles on navy panels.
- Aesthetic: flat crisp corporate vector, photoreal photography in upper portion when appropriate, gradient into navy lower panel, no drop-shadows, no watermarks, no blurry text, print-quality 16:9.

The slide planner is instructed to embed these constraints into every generated prompt verbatim (so GPT Image 2 sees them on every call).

## Slide planner (Gemini)

Server function `planDeck` — `createServerFn` — takes `{ brief, slideCount, branded }`, calls `google/gemini-3-flash-preview` via the AI SDK + Lovable AI Gateway, returns:

```ts
type SlidePlan = {
  index: number;          // 1-based
  role: "cover" | "section" | "content" | "stats" | "case-study" | "closing";
  title: string;          // short label for UI
  imagePrompt: string;    // full GPT Image 2 prompt, ~120-250 words
};
type DeckPlan = { topic: string; slides: SlidePlan[] };
```

The system prompt teaches Gemini to:
- Vary slide roles intelligently for the topic.
- Always make slide 1 a branded cover (mirrors the EP x Amazon example shape).
- Always make the final slide a closing/contact slide.
- Embed the EP branding contract (when `branded`) verbatim into each `imagePrompt`.
- Specify layout, color, text content, typography, photography subject, footer details.
- Forbid: watermarks, lorem ipsum, blurry text, drop-shadows.

Returned via `Output.object` with a Zod schema for type safety.

## Image rendering

Server route `src/routes/api/generate-slide.ts` — POST `{ prompt }` → streams SSE from the AI Gateway image endpoint straight to the client (passthrough `upstream.body`, no buffering). Uses:

```json
{ "model": "openai/gpt-image-2", "prompt": "...", "size": "1536x1024", "quality": "low", "stream": true, "partial_images": 1 }
```

Client helper `streamImage` (eventsource-parser + `flushSync`) renders partial frames with a CSS blur, drops the blur on `image_generation.completed`. Each slide tile owns its own stream — N slides render in parallel.

Per-slide regenerate just re-invokes the same route with the (possibly edited) prompt.

## PPTX bundling

Client-side using `pptxgenjs` (lightweight, browser-safe). On "Download all as PPTX":
1. Convert each slide's base64 PNG to a data URL.
2. Build a 16:9 (`pptx.layout = "LAYOUT_WIDE"`) PowerPoint, one slide per image, image set full-bleed (`x:0, y:0, w:'100%', h:'100%'`).
3. `pptx.writeFile({ fileName: 'ep-group-deck.pptx' })`.

Individual PNG download = anchor with `download` attribute on the data URL.

## UI design

Match EP Group brand language since this is an internal EP tool:
- Background: navy `#2B3543` with subtle noise.
- Primary accent: EP red `#E63027`.
- Type: geometric sans-serif (Inter for body, a heavier weight for headings — close enough to EP marketing without licensed fonts).
- The header includes the `ep group` lockup top-left and "make it easy" red square top-right, echoing the deck aesthetic.
- The prompt box is large, generous, with example chips below it.
- The slide grid is a responsive 2/3-column grid of 16:9 tiles with rounded corners and a subtle border.
- Lightbox uses a dim navy backdrop with the slide centered, prev/next arrows, keyboard nav.

## Technical sections

### Files to create

- `src/routes/index.tsx` — replaces placeholder; the generator page.
- `src/components/PromptForm.tsx` — brief textarea, slide-count slider, branding toggle, example chips, generate button.
- `src/components/SlideGrid.tsx` — grid of `SlideTile`s.
- `src/components/SlideTile.tsx` — per-slide streaming image, blur state, action buttons.
- `src/components/SlideLightbox.tsx` — full-size viewer.
- `src/lib/epBrand.ts` — EP brand constants + the branded-prompt suffix block.
- `src/lib/streamImage.ts` — SSE parser using eventsource-parser + flushSync (per knowledge file).
- `src/lib/deck.functions.ts` — `planDeck` server function (Gemini via AI SDK + Lovable AI Gateway).
- `src/lib/ai-gateway.server.ts` — provider helper for `@ai-sdk/openai-compatible`.
- `src/routes/api/generate-slide.ts` — streaming server route for GPT Image 2.
- `src/lib/pptxExport.ts` — client-side PPTX builder using `pptxgenjs`.
- `src/hooks/useDeckGenerator.ts` — Zustand-ish reducer (plain React state is fine) that owns `{ status, plan, slides[] }`, exposes `generate(brief, count, branded)`, `regenerate(index, promptOverride?)`.

### Backend / secrets

- Enable **Lovable AI Gateway** (provisions `LOVABLE_API_KEY`).
- No database, no auth — generate-and-download only.
- Install: `ai`, `@ai-sdk/openai-compatible`, `zod` (already present), `eventsource-parser`, `pptxgenjs`.

### Model choices

- Planner: `google/gemini-3-flash-preview`, `generateText` + `Output.object` with Zod schema for `DeckPlan`.
- Image: `openai/gpt-image-2`, `size: "1536x1024"` (16:9), `quality: "low"`, `stream: true`, `partial_images: 1`. Streams pass through the server route unchanged.

### Error handling

- AI Gateway 402 → toast "Out of AI credits — top up in Workspace settings."
- 429 → toast "Rate limited, retrying…" and back off.
- 400 (content policy) → per-tile inline message + Edit prompt button highlighted.
- Stream end without `image_generation.completed` → mark tile failed, offer Regenerate.

### Concurrency

Render all N slides in parallel. For decks > 8, throttle to 6 concurrent streams to keep the gateway happy (simple p-limit-style local queue, no extra dependency needed).

### SEO / metadata

Index route head: title "EP Group Deck Maker", description "Generate branded EP Group presentation decks from a single prompt." Single H1. Internal tool — no need for OG image.

## Out of scope (explicitly)

- Login, saved decks, version history.
- Multi-user collaboration.
- Slide reordering / drag-and-drop (each slide is a flat rendered image; reorder is achievable but not in v1).
- Editable text overlays on top of generated images (everything is baked into the image by GPT Image 2).
- PDF export (PPTX covers the bundle case; PNGs cover the rest).
