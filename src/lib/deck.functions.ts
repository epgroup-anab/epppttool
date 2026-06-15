import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createOpenAiProvider, OPENAI_PLANNER_MODEL } from "./ai-gateway.server";
import { EP_BRAND_CONTRACT } from "./epBrand";

const StylePreset = z.enum(["creative", "balanced", "data"]);
const Tone = z.enum(["formal", "bold", "playful"]);
const Audience = z.enum(["internal", "client", "board"]);
const Aspect = z.enum(["16:9", "1:1", "9:16"]);

const RefImage = z.object({
  role: z.enum(["style", "logo"]),
  dataUrl: z.string().startsWith("data:image/"),
  name: z.string(),
});
const RefText = z.object({
  role: z.enum(["style", "content"]),
  name: z.string(),
  text: z.string(),
});

const PlanInput = z.object({
  brief: z.string().min(3).max(2000),
  slideCount: z.number().int().min(4).max(15),
  branded: z.boolean(),
  stylePreset: StylePreset.default("balanced"),
  tone: Tone.default("formal"),
  audience: Audience.default("client"),
  aspect: Aspect.default("16:9"),
  refImages: z.array(RefImage).max(8).default([]),
  refTexts: z.array(RefText).max(4).default([]),
  chatTranscript: z
    .array(z.object({ role: z.enum(["user", "assistant"]), text: z.string() }))
    .max(40)
    .default([]),
});

const SlideSchema = z.object({
  index: z.number().int(),
  role: z.string(),
  title: z.string(),
  imagePrompt: z.string(),
});
const DeckSchema = z.object({
  topic: z.string(),
  slides: z.array(SlideSchema),
});
export type DeckPlan = z.infer<typeof DeckSchema>;
export type SlidePlan = z.infer<typeof SlideSchema>;

export const planDeck = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => PlanInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error("Missing OPENAI_API_KEY");
    const gateway = createOpenAiProvider(key);

    const brandBlock = data.branded
      ? `\n\nALWAYS embed this brand contract verbatim near the end of every imagePrompt so the image model honors it:\n${EP_BRAND_CONTRACT}\n`
      : "\n\nUse a clean, neutral corporate aesthetic. Do not use EP Group branding.\n";

    const aspectLabel = data.aspect === "16:9" ? "widescreen 16:9" : data.aspect === "1:1" ? "square 1:1" : "portrait 9:16";

    const presetBlock = {
      creative: "STYLE PRESET = CREATIVE. Cinematic full-bleed editorial photography paired with oversize Gotham Rounded display headlines in red #C04A4D on dark blue #1C232F, OR blue #2D3645 on white. Lean on the dark-over-light split (layout a) and full-dark stencil (layout b) from the brand contract. Hero photography is a full-bleed top band OR a clean circle with a 2pt #2D3645 stroke — never a floating rectangle with a drop shadow. Use a single bold red #C04A4D circle 'claim badge' (e.g. 'We are the #1 paper bag manufacturer in the UK & #2 in Europe') anchored to a corner. Magazine-editorial energy (Pentagram × Bloomberg Businessweek × Apple keynote) but rendered strictly inside the EP palette.",
      balanced: "STYLE PRESET = BALANCED — the standard EP corporate deck. Every slide pairs ONE strong visual idea with structured supporting information. Cycle the four canonical layouts from the brand contract: (a) dark-over-light split with hero photo + red headline above, stats/logos strip below; (b) full dark blue with oversize stencil section number ('01', '02') + section headline + 3 line-icons in circles + division logo footer rule; (c) full white hub-and-spoke diagram with 3 numbered red circles and 'ep make it easy' centre; (d) data slide with a hand-crafted chart above and red percentage figures below. Art-directed and information-rich.",
      data: "STYLE PRESET = DATA-FOCUSED. Bespoke information design rendered in EP blue/dark-blue/red/white only. Heavy use of layout (d) from the brand contract: hand-crafted bar/line/donut chart in #1C232F bars on white with grey #6B7280 gridlines, percent labels above each bar, and ONE highlighted bar/segment in red #C04A4D; below, a dark navy band with 3 oversize red #C04A4D percentage or stat figures in 180pt Gotham Rounded Bold + small white #FFFFFF Gotham Rounded Book descriptors, separated by thin vertical white rules. Also: KPI cards with red figure + grey descriptor, isotype pictograms, comparison matrices, UK maps with red dots. Plausible realistic numbers with axis labels, gridlines, legends. Style: FT / Bloomberg / Information is Beautiful, filtered through the EP brand.",
    }[data.stylePreset];

    const toneBlock = {
      formal: "TONE = FORMAL: corporate, restrained, premium. Headlines stated as confident facts. Long-form prose only on a single 'about us' slide; everywhere else, ≤8 words. Conservative use of red #C04A4D as accent only.",
      bold: "TONE = BOLD: oversize 180–240pt Gotham Rounded display headlines, frequent full-bleed red #C04A4D claim badges (large red circle, white reverse-out), confident assertive copy ('We move 75,000 pallets. Daily.'). Generous negative space.",
      playful: "TONE = PLAYFUL: stay strictly inside the EP palette but loosen the geometry — hand-drawn red #C04A4D 2pt line illustrations (boxes, trucks, paper bags), rounded squircle photo crops, friendly squiggle underlines beneath headlines, conversational sentence-case copy. Never childish, never Comic Sans.",
    }[data.tone];

    const audienceBlock = {
      internal: "AUDIENCE = INTERNAL TEAM: assume context, skip basic explainers, focus on operational detail and next-steps.",
      client: "AUDIENCE = CLIENT PITCH: lead with value, credibility, case-study proof, clear CTA on closing slide.",
      board: "AUDIENCE = BOARD / EXEC: emphasise strategy, financials, risk, market opportunity. Concise, exec-ready.",
    }[data.audience];

    const refsSummary = [
      data.refImages.filter((r) => r.role === "style").length
        ? `${data.refImages.filter((r) => r.role === "style").length} style reference image(s) provided — analyse their palette, typography, layout, paneling, information density, image crops, footer bands, logo treatment and chart styling; mirror those concrete patterns across every slide.`
        : "",
      data.refImages.filter((r) => r.role === "logo").length
        ? `${data.refImages.filter((r) => r.role === "logo").length} partner logo image(s) provided — describe them precisely in each imagePrompt (colours, wordmark, glyph) so the image model renders the partner logo faithfully on the cover and closing slides.`
        : "",
      data.refTexts.filter((r) => r.role === "content").length
        ? `Content source documents provided below — USE THEIR ACTUAL stats / names / dates / claims, do not invent.`
        : "",
      data.refTexts.filter((r) => r.role === "style").length
        ? `Style reference documents provided below — mirror their structure, vocabulary, and visual cues.`
        : "",
    ].filter(Boolean).join("\n");

    const textRefsBlock = data.refTexts.length
      ? "\n\n=== REFERENCE DOCUMENTS ===\n" +
        data.refTexts
          .map((r) => `--- ${r.role.toUpperCase()}: ${r.name} ---\n${r.text.slice(0, 6000)}`)
          .join("\n\n") +
        "\n=== END REFERENCE DOCUMENTS ==="
      : "";

    const chatBlock = data.chatTranscript.length
      ? "\n\n=== REFINEMENT CONVERSATION (USER + AI clarified the brief — HONOUR every detail the user committed to here; it overrides the initial brief on conflict) ===\n" +
        data.chatTranscript.map((m) => `${m.role.toUpperCase()}: ${m.text}`).join("\n\n") +
        "\n=== END REFINEMENT CONVERSATION ==="
      : "";

    const system = `You are EP Group's senior presentation art director. You produce a JSON plan for a ${data.slideCount}-slide ${aspectLabel} deck. For each slide you write ONE extremely detailed, structured image-generation prompt (700–1100 words) that GPT Image 2 renders directly as a finished slide. Mediocre, vague prompts produce mediocre slides — your prompts must be exhaustive, specific, and follow the FIXED TEMPLATE below verbatim.

${presetBlock}
${toneBlock}
${audienceBlock}
${refsSummary}

THE REFERENCE QUALITY BAR IS REAL EP GROUP / ZEUS BOARD-DECK DESIGN — dense, white-dominant, photographically composited:
- Think agency-built keynote / board-deck slides with multiple designed zones, not a single poster.
- Every slide must feel intentionally laid out in PowerPoint or Keynote by a senior designer — crisp grids, compact navy header bars, proof-point footers, KPI bands, logo walls, modular cards, labelled photography and art-directed product collages.
- The image generator must render the entire slide as a finished presentation page with typography, diagrams, dividers, panels, photographs and supporting evidence — not just a background image.
- Avoid under-designed outputs: no lonely headline on empty background, no one-photo-plus-caption unless the slide role demands it, no vague corporate wallpaper, no generic mockup card floating in space.

DENSITY & PHOTO-REALISM MANDATE (this is the difference between an OK slide and a real EP slide):
- WHITE-DOMINANT canvases. Most content slides are a white page with compact dark-navy #1C232F header bars, a dark footer ribbon, and bright accents — NOT a dark full-bleed background. Reserve full-dark backgrounds for the cover and section dividers only.
- PACK THE FRAME. Each content slide must carry 5–8 distinct designed zones: an oversize headline, body copy with bold-emphasised words, at least one multi-item bullet list, several stat figures, a logo or award wall where relevant, and real photography. Empty space is a failure mode here.
- COMPOSITE REAL PHOTOGRAPHY INTO SHAPES — photos inside wheel/pie segments, photos inside grid tiles, a labelled aerial facility photo with white callout labels and thin leader lines, product photos filling category cells. Describe each photograph concretely (subject, materials, lighting). Photography carries the slide; line-icons are secondary accents only.
- Include EP credibility furniture where the role fits: sub-brand/division logo wall (europackaging, coppice, euro MPB, Jena, sirane, Walkers Chocolates, AB Group), award badges (Ecovadis Platinum roundel, Queen's Award, FPA), and a red claim-badge circle.
- LEGIBILITY: prefer fewer, LARGER, correctly-spelled labels over many tiny ones. Specify exact short text strings so the model renders crisp type. Headlines should be genuinely oversized (80–130pt) and confident.

SLIDE ARCHETYPE MAP — assign each slide the best-matching archetype from the brand contract and describe its zones explicitly:
- cover → Archetype (1) COVER: left wordmark/headline block + right diagonal image triptych + bottom stat ribbon.
- section / about → Archetype (2) ABOUT: founder portrait + timeline + stat row + capability strip + dark footer mission bar.
- content (products) → Archetype (3) PRODUCTS: hero still-life left + 3×3 category grid right + footer pillars.
- content (footprint) → Archetype (4) FOOTPRINT: map with pins + stat strip + discipline list + capability banner.
- content (framework) → Archetype (5) FRAMEWORK: comparison boxes + radial hub-and-spoke + industry icon row.
- stats / sustainability → Archetype (6) SUSTAINABILITY: quant proof + circular framework + dashboard evidence + photo footer.
- case-study / partnership → Archetype (7) PARTNERSHIP: quote + 4 pillar cards + challenge/solution matrix + logo wall + 7-step workflow.
- content (culture) → Archetype (8) CULTURE: values grid + pillar cards + team photo + stats footer.
- closing → simplified COVER variant: CTA headline, contact details, co-brand lockup, 2–3 proof stats, dark footer.

NON-NEGOTIABLE EXECUTION RULES:
- Never describe logos vaguely. If a logo is included, explicitly state flat vector-like, correct brand colours, correct spacing, no distortion.
- Never ask the model to invent a busy scene when a clean information panel would communicate better.
- Use fewer, larger, more legible modules rather than many tiny unreadable ones.
- Make panels, bands, cards, wedges, separators, and grids explicit with sizes/positions so the result feels designed.
- Where applicable, specify that supporting photography should look like real packaging, factories, warehouse racks, branded lorries, retail products, dashboards, sustainability materials, or executive portraiture — not stock-business cliches.

================= FIXED IMAGE-PROMPT TEMPLATE (use this exact structure, labelled, for EVERY slide) =================
OVERALL LAYOUT: name ONE of layouts (a)–(d) from the EP brand contract and describe how the frame is split — e.g. "Layout (a): top two-thirds Dark Blue #1C232F, bottom third white #FFFFFF. 60px outer margin on all sides."
BACKGROUND: exact hex fills for each region of the frame.
COMPOSITION INTENT: one sentence describing the slide's design logic, e.g. "large message left, proof modules right, credibility band along bottom".
CHROME (every non-cover slide MUST have all four):
  - Top-center: dark-navy #1C232F pill, white 22pt Gotham Rounded Medium text "Page N of TOTAL".
  - Top-right: co-brand lockup — EP red #C04A4D rounded square (white lowercase 'ep') + lowercase 'group' in adjacent text colour + small grey 'x' + partner wordmark in partner's REAL brand colours. ~140×25px, 25px clear spacing.
  - Bottom-left: "epgroup.co.uk" 20pt Gotham Rounded Book.
  - Bottom-right: 'ep make it easy' lockup — red #C04A4D rounded square containing white bold 'ep' + white regular 'make it easy'.
HEADLINE: exact text string in quotes, font (Gotham Rounded Medium/Bold), exact pt size, exact hex colour, position, optional short red #C04A4D rule above/below.
SUBHEAD / KICKER (if used): exact text in quotes, pt size, colour.
BODY COPY: exact text in quotes (≤40 words), 14–16pt Gotham Rounded Book, colour, position. Bold-emphasised words listed.
CONTENT MODULES: list every designed panel/card/strip/table/wedge on the slide with position, purpose, and what content sits inside.
HERO IMAGERY (if photographic): one concrete, evocative subject described in 2–3 sentences with materials, textures, lighting (35mm/85mm/macro, rim light / soft north-window / hard studio), depth of field, mood. NO generic stock clichés (no handshakes, no "diverse team at laptop", no globes with arrows, no lightbulbs, no jigsaw pieces). Frame: full-bleed inside its panel OR clean circle with 2pt #2D3645 stroke.
SECONDARY IMAGERY / PRODUCT COLLAGE (if used): describe each smaller image zone, what exact product/facility/person appears, and how it is cropped (diagonal wedge, rounded panel, circular crop, rectangular tile).
ICONOGRAPHY (if used): list each line-icon, 2pt stroke, colour, inside a 2pt circle of same colour, with its caption.
DIAGRAM (if used): describe the hub-and-spoke / process / flow exactly — numbered red #C04A4D circles with white numerals, dashed grey #6B7280 connectors, what sits at each spoke and at the centre.
DATA VIZ (if role = stats / data): chart type, axis labels, exact plausible numeric values with units, gridline treatment, ONE highlighted data point in red #C04A4D. Below the chart, list the 2–3 oversize percentage/stat figures with exact text, pt size, colour and descriptor.
STAT STRIP (if used in lower band): list each stat as "Figure: [exact value] / Descriptor: [exact text]" — figures 60–90pt red #C04A4D Gotham Rounded Bold, descriptors 12–14pt grey #6B7280, thin vertical rules between.
CLAIM BADGE (if used): exact text in quotes inside a solid red #C04A4D circle, white Gotham Rounded Bold, position.
PARTNER / DIVISION / AWARD LOGOS: list every logo with its real brand colours and where it sits. Min 25px clear spacing between any two logos. For the partner: describe its REAL wordmark and colours faithfully (e.g. Pringles = red curved wordmark with the Mr. P moustache mascot, on white; Tesco = blue serif wordmark with red dot stripes; ASDA = lowercase white-on-green #78BE20; Amazon = black wordmark with orange smile; M&S = green ampersand wordmark; John Lewis = grey serif ampersand; Sainsbury's = orange italic wordmark; Ocado = purple/teal wordmark; Waitrose = green script).
TYPOGRAPHY SUMMARY: one-line recap of fonts and sizes used on this slide (always Gotham Rounded family).
COLOUR PALETTE: list every hex used (must be a subset of #1C232F / #2D3645 / #C04A4D / #FFFFFF / #6B7280 / #F4F5F6 + partner brand colours only).
FINISH: "print-quality 4k, crisp vector edges, photographic realism where appropriate, no AI artefacts on letterforms or logos."
HARD BANS (paste verbatim as one line): "no watermarks, no lorem ipsum, no garbled or misspelled text, no drop-shadows on type, no rainbow or purple/blue gradients, no neon, no teal, no clip-art, no stock-photo handshakes/globes/lightbulbs/arrows-over-cities, no AI artefacts on letterforms or logos, no extra fingers or distorted faces, no invented partner logos."
================= END TEMPLATE =================

VARIETY RULES across the deck:
- No two consecutive slides may share the same layout letter (a)/(b)/(c)/(d) OR the same archetype number (1)–(8).
- Slide 1 = Archetype (1) COVER: left white panel with large co-brand lockup (EP lockup + 'x' + partner logo, ~280px wide), two-line headline (line 1 #2D3645, line 2 #C04A4D), body paragraph, capability icon row; right half = three diagonal image wedges (packaging / branded lorry / port); bottom stat ribbon with 3–4 KPIs. Footer chrome (epgroup.co.uk + 'ep make it easy'). NO 'Page N of N' on the cover.
- Final slide = closing / next-steps / contact CTA.
- 'role' values allowed: cover | section | content | stats | case-study | closing.
- 'title' is a short 2–5 word UI label, NOT the slide headline.
- Aspect ratio for every prompt: ${aspectLabel}.
- Build in deck-like variety: at least one Archetype (3) products slide, one Archetype (4) footprint slide when relevant, one Archetype (5) framework slide when relevant, one Archetype (6) or stats slide, and one Archetype (7) partnership slide when relevant to the brief.
- Make each prompt specify enough panel structure that the image model can render readable, premium slide architecture.

CONSISTENCY: the co-brand lockup must be described IDENTICALLY on every slide (same partner logo description, same colours, same size) so the image model renders it consistently across the deck. Repeat the full partner-logo description verbatim in every prompt — do not abbreviate to "as before".

QUALITY BAR: if a prompt could be reused on any other company's deck unchanged, it is too generic. Make every prompt unmistakably about THIS brief, THIS partner, THIS slide role.${brandBlock}${textRefsBlock}${chatBlock}`;

    const userContent: Array<
      | { type: "text"; text: string }
      | { type: "image"; image: string }
    > = [
      { type: "text", text: `Brief: ${data.brief}\n\nProduce exactly ${data.slideCount} slides. Respond with ONLY valid minified JSON matching:\n{"topic": string, "slides": [{"index": number (1-based), "role": "cover"|"section"|"content"|"stats"|"case-study"|"closing", "title": string, "imagePrompt": string}]}\nNo markdown, no code fences, no commentary — JSON only.` },
    ];
    for (const img of data.refImages) {
      userContent.push({ type: "image", image: img.dataUrl });
    }

    const { text } = await generateText({
      model: gateway(OPENAI_PLANNER_MODEL),
      system,
      messages: [{ role: "user", content: userContent }],
    });

    const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    const jsonStr = start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned;
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonStr);
    } catch (e) {
      throw new Error(`Planner returned invalid JSON: ${(e as Error).message}`);
    }
    return DeckSchema.parse(parsed);
  });

const RefineInput = z.object({
  brief: z.string().min(3).max(2000),
  slideCount: z.number().int().min(4).max(15),
  branded: z.boolean(),
  stylePreset: StylePreset,
  tone: Tone,
  audience: Audience,
  aspect: Aspect,
  refImages: z.array(RefImage).max(8).default([]),
  refTexts: z.array(RefText).max(4).default([]),
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), text: z.string() }))
    .max(40)
    .default([]),
});

export const refineChat = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => RefineInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error("Missing OPENAI_API_KEY");
    const gateway = createOpenAiProvider(key);

    const refsSummary = [
      data.refImages.filter((r) => r.role === "style").length
        ? `${data.refImages.filter((r) => r.role === "style").length} style image(s)`
        : "",
      data.refImages.filter((r) => r.role === "logo").length
        ? `${data.refImages.filter((r) => r.role === "logo").length} logo image(s)`
        : "",
      data.refTexts.length ? `${data.refTexts.length} reference document(s)` : "",
    ].filter(Boolean).join(", ") || "none";

    const textRefsBlock = data.refTexts.length
      ? "\n\n=== REFERENCE DOCUMENTS ===\n" +
        data.refTexts
          .map((r) => `--- ${r.role.toUpperCase()}: ${r.name} ---\n${r.text.slice(0, 4000)}`)
          .join("\n\n")
      : "";

    const system = `You are a senior presentation strategist at EP Group (Euro Packaging Group, UK ecommerce packaging & consolidation; epgroup.co.uk), in a SHORT REFINEMENT CHAT with a colleague before generating their deck.

Initial brief: "${data.brief}"
Deck setup: ${data.slideCount} slides · ${data.aspect} · style preset "${data.stylePreset}" · tone "${data.tone}" · audience "${data.audience}" · EP branding ${data.branded ? "ON" : "OFF"} · references: ${refsSummary}.${textRefsBlock}

YOUR JOB IN THIS CHAT:
- Extract the missing specifics that would massively improve the rendered slides: real stats/numbers, exact partner name & products, specific case studies, the single call-to-action, must-include slides, anything to avoid, the desired emotional takeaway.
- Match the chosen preset: if "data" preset, push for KPIs, percentages, comparisons, dates; if "creative", push for narrative arc, mood, hero imagery direction; if "balanced", a mix.
- Match the audience: board → strategy & risk; client → value & proof; internal → operations & next-steps.
- Be FAST and CONCRETE. Ask 1–3 focused questions per turn, max ~80 words. No filler, no apologies, no recaps.
- If the user has already given enough, say so plainly and tell them to hit "Generate deck".
- If this is the first turn (no prior messages), open with the 2–3 highest-leverage questions for this brief + preset combo. Skip pleasantries.
- Never invent facts or commit to stats the user did not provide.
- Plain text only. No markdown headings, no code fences, no JSON.`;

    const messages: Array<{ role: "user" | "assistant"; content: string }> =
      data.messages.length === 0
        ? [{ role: "user", content: "Open the refinement chat with your first questions." }]
        : data.messages.map((m) => ({ role: m.role, content: m.text }));

    const { text } = await generateText({
      model: gateway(OPENAI_PLANNER_MODEL),
      system,
      messages,
    });
    return { reply: text.trim() };
  });