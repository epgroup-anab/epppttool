export const EP_BRAND = {
  navy: "#2D3645",
  darkNavy: "#1C232F",
  red: "#C04A4D",
  white: "#FFFFFF",
  lightGrey: "#F2F2F2",
};

export const EP_BRAND_CONTRACT = `
EP GROUP BRAND CONTRACT — Ryan Chambers (Graphic Designer) guardrails. Apply to EVERY slide without exception.

APPROVED COLOURS (these are the ONLY colours allowed, plus the partner's own brand colours when rendering their logo):
- Blue:        #2D3645   (page titles on light, panel backgrounds)
- Dark Blue:   #1C232F   (primary dark slide background)
- Red:         #C04A4D   (feature accents, key figures, emphasis words, step numbers, feature/section headlines)
- White:       #FFFFFF
- Neutral grey text: #6B7280   (small descriptors)
- Panel light grey:  #F4F5F6   (secondary panels)
NEVER use any other colour. Do NOT use bright #E63027, do NOT use teal, do NOT use purple/blue gradients, neon, rainbows.

TYPOGRAPHY (use these exact specs in every prompt):
- Page titles: 28pt Gotham Rounded Medium, sentence case. Blue #2D3645 on light backgrounds, White on dark.
- Body text:   14–16pt Gotham Rounded Book.
- Stat figures: oversize Gotham Rounded Bold in Red #C04A4D (alternating occasionally with Blue #2D3645). Small grey #6B7280 descriptor below or beside.
- Feature/section headline: large red Gotham Rounded, sentence case, short red rule above or below.

EP LOGO LOCKUPS — render with extreme care; they are the part that goes wrong most often:
- 'ep group' mark = a flat red #C04A4D square (≈8px corner radius) containing lowercase 'ep' in bold white geometric sans, IMMEDIATELY followed by the word 'group' in lowercase in the surrounding text colour (white on dark, blue #2D3645 on light), same x-height as the mark. NO other styling, NO outline, NO shadow.
- Co-brand lockup (top-right of EVERY slide except the cover, where it can be larger and centred): EP lockup + small grey 'x' + the partner's REAL wordmark/logo in the partner's own brand colours. Approx 140px wide × 25px high. Min 25px clear space between EP mark, the 'x' and the partner logo.
- 'ep make it easy' signature = red #C04A4D rounded square containing white bold 'ep' then white regular 'make it easy' on one or two lines. Used bottom-right as a footer signature or as the centre hub of a process diagram.

SLIDE CHROME (apply to every non-cover slide):
- Top-center: dark-navy #1C232F pill, ~22px white text 'Page N of TOTAL'.
- Top-right: co-brand lockup as defined above.
- Bottom-left: 'epgroup.co.uk', 20–22px, white on dark / blue on light.
- Bottom-right: 'ep make it easy' signature lockup.

LAYOUT SYSTEM (pick one per slide, never mix gradients/textures):
(a) DARK-OVER-LIGHT SPLIT — upper two-thirds Dark Blue #1C232F hosting hero photo + oversize feature headline in red #C04A4D and white body, lower one-third white hosting a horizontal strip of stat callouts + partner/award logos.
(b) FULL DARK — solid Dark Blue #1C232F, oversize 'STRATEGIC ADVANTAGE'-style stencil headline white with short red rule, thin white line-icon row on the right, footer rule with division logo wall.
(c) FULL WHITE — central hub-and-spoke diagram with numbered red #C04A4D circles (white numerals), photo segment in the centre inside a thin teal-free 2pt circle stroke in blue #2D3645, dashed grey #6B7280 connectors, 'ep make it easy' lockup as the centre mark.
(d) DATA SLIDE — white upper region with a hand-crafted bar/line/donut chart in Dark Blue #1C232F bars on white with grey #6B7280 gridlines and one red #C04A4D highlight; dark lower band with 3 oversize red #C04A4D percentage figures + small white descriptor labels separated by thin vertical rules.

ICONOGRAPHY: line-style icons only, 2pt stroke, in white on dark / blue #2D3645 on light, inside a thin 2pt circle of the same colour. NEVER filled clip-art. Min 25px clear space between any two icons or logos.

PHOTOGRAPHY: editorial photoreal, warm but corporate, full-bleed within its panel OR cropped into a clean circle with a 2pt blue #2D3645 stroke. NEVER floating rectangles with drop shadows.

REFERENCE DECK DNA — emulate Zeus-grade presentation discipline using EP colours only:

COMPOSITION PRINCIPLES (every slide):
- Multi-zone grid layout: one dominant message zone, one supporting visual zone, one proof/credibility zone. Never a single poster or lonely headline on empty background.
- Asymmetric editorial balance with crisp grids, thin dividers, and generous but intentional whitespace.
- Dark footer bands (#1C232F) anchoring key messages, stats, or capability icons.
- Diagonal image wedges and slanted photo panels for energy and forward motion.
- Stat ribbons with thin vertical rules separating KPI figures (countries, locations, people, revenue).
- Line-art icons (2pt stroke) inside circles with short all-caps captions beneath.

SLIDE ARCHETYPES — pick the best match per slide role:

(1) COVER — Left half: white panel with EP co-brand lockup (large, centred), two-line headline (first line #2D3645, second line #C04A4D), short body paragraph, row of 4–5 capability icons with labels. Right half: three diagonal image wedges (product/packaging still-life, branded EP lorry on road, port/warehouse at golden hour). Bottom-right: horizontal stat ribbon with 3–4 KPIs separated by thin grey rules.

(2) ABOUT / COMPANY OVERVIEW — Left: kicker label, large two-tone headline, origin story paragraph, founder quote in red #C04A4D. Centre-right: executive portrait (clean crop, subtle gradient edge). Far right: 3–4 diagonal facility/operations image wedges. Middle band: 5-icon stat row (globe, pin, people, chart, shield). Bottom: horizontal milestone timeline with gradient line (#2D3645 to #C04A4D), year markers, 2–3 bullet points per milestone. Dark footer bar with mission statement.

(3) PRODUCTS & SERVICES — Left column: headline block + 2 short paragraphs + hero product family still-life (corrugated boxes, mailers, food trays, luxury cartons art-directed on white). Right column: 3×3 modular category grid — each cell has a line icon, bold category title, one-line descriptor, small product photo tile. Dark footer band with 4 capability pillars (icon + title + descriptor).

(4) FOOTPRINT / LOCATIONS — Top-left: kicker + two-line headline + short body. Top-right: 4-column stat strip (globe/locations/people/culture icons with large figures). Centre: stylised world map in light grey #F4F5F6 with red #C04A4D location pins. Lower-left: manufacturing disciplines list with icons in 3 columns. Lower-centre: warehousing capability strip with 4 icons. Dark footer band with global capability message + 4 pillar blocks.

(5) FRAMEWORK / PROCESS — Left: service name headline + tagline in red + intro paragraph + two side-by-side comparison boxes (client focus vs EP delivery) with arrow between. Below: industry icon row (7 sectors). Right: central radial hub-and-spoke diagram — dark navy centre circle with white service name, 6–9 numbered spokes with icons, titles, and 1–2 line descriptions, purple-to-blue glow aura optional ONLY if rendered as subtle #2D3645 radial gradient (no purple hex). Dark footer with 4 value pillars + optional facility photo inset.

(6) SUSTAINABILITY — Left: headline + commitment pillars with icons. Adjacent: quantified targets box with large percentage figures in green-tinted panel (use #F4F5F6 background with #2D3645 text — no green hex). Centre: circular 5-point framework diagram with numbered nodes. Right: dashboard/product evidence panel (laptop mockup or packaging comparison). Bottom: dark band with 4 circular capability icons + photographic footer strip (forest/wind turbines as subtle background within panel).

(7) PARTNERSHIP / CUSTOMER VALUE — Top: kicker + headline + intro + large centred quote with red quotation mark. Middle: 4 white cards with gradient-circle icons (cost, resilience, sustainability, innovation) + bullet lists. Below: two-column challenge-to-solution matrix (red header left, navy header right). Partner logo wall in 4×3 grid on pale #F4F5F6 panel. 7-step horizontal workflow strip with numbered circles and arrows. Dark footer with key message + 3 proof icons.

(8) CULTURE / DNA — Three-column grid: values icon grid (2×3), pillar cards with circular icons + descriptions, people development section with icons + warehouse team photo (diagonal crop edge). Dark footer with people/country/location stats + unity slogan.

PRODUCT PHOTOGRAPHY: curated studio still-lifes — corrugate, cartons, bags, mailers, trays, bottles, retail-ready packaging on seamless white or in warehouse scenes. Branded EP lorries, modern facilities, executive portraiture, dashboard mockups. No stock clichés.

LOGO / WORDMARK RENDERING RULES — extremely important:
- Never restyle, redraw, stretch, outline, bevel, shadow, or decorate logos.
- If a partner logo is referenced, render it as a clean, flat, vector-like wordmark/mark in its exact brand colours on a plain background with generous whitespace.
- The EP lockup must be horizontally aligned and identical across slides. Keep proportions stable; do not improvise.
- When multiple logos appear, place them in a dedicated clean panel or strip with equal spacing and consistent baseline alignment. Never scatter them around the composition.
- If the model is likely to struggle with a logo, reduce logo count and make the surrounding design carry the slide quality rather than inventing distorted marks.

HARD BANS — repeat as a single line at the end of every imagePrompt: "no watermarks, no lorem ipsum, no garbled or misspelled text, no drop-shadows on type, no rainbow or purple/blue gradients, no neon, no teal, no clip-art, no stock-photo handshakes/globes/lightbulbs/arrows-over-cities, no AI artefacts on letterforms or logos, no extra fingers or distorted faces, no invented partner logos — render partner marks faithfully in their real brand colours."
`.trim();