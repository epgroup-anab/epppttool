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

PHOTOGRAPHY: editorial photoreal, warm but corporate, full-bleed within its panel OR cropped into a clean circle with a 2pt blue #2D3645 stroke. NEVER floating rectangles with drop shadows. DO NOT depict human faces, portraits or headshots — favour packaging, products, factories, warehouse racking, branded lorries, ports, conveyor lines and operations. People may appear only incidentally (small, from behind, hands-only), never as a posed portrait, founder headshot or "team at a laptop" cliché.

EP HOUSE STYLE — the single most important reference (study this carefully):
- Real EP decks are predominantly WHITE / very light canvases. White is the dominant background; Dark Blue #1C232F is used for compact HEADER BARS, the centre hub of diagrams, footer ribbons and selected panels — NOT as a full-bleed background on most slides. Avoid dark-heavy slides except the cover and section dividers.
- Headlines are LARGE and confident — feature headlines are oversized red (≈80–130pt) in sentence case (e.g. "A little bit about us…", "A unique end-to-end solution"). Page titles are large dark-blue #2D3645.
- Slides are DENSE and information-rich, like a real corporate one-pager: 5–8 distinct designed zones, multiple bullet lists, several stat figures, sub-brand and award logo walls, labelled photographs. They are NOT minimalist.
- REAL PHOTOGRAPHY is composited INTO shapes — pie/wheel segments contain photos, grid tiles contain product photos, aerial facility shots carry white callout labels with thin leader lines. Photography does the heavy lifting; icons are secondary accents, not the main content.
- EP sub-brand / division logo wall (use on About/overview slides): a clean row or grid of EP division marks — "europackaging", "coppice", "euro MPB packaging", "Jena", "sirane", "Walkers Chocolates", "AB Group" — flat, equal spacing, on white. Plus an award-badge column (Ecovadis Platinum circular badge, Queen's Award, FPA, packaging-industry award roundels).
- Claim badge: a solid red circle with white bold copy, e.g. "We are the #1 paper bag manufacturer in the UK & #2 in Europe", anchored to a corner overlapping a photo.

REFERENCE DECK DNA — emulate Zeus-grade presentation discipline using EP colours only:

COMPOSITION PRINCIPLES (every slide):
- Multi-zone grid layout: one dominant message zone, one supporting visual zone, one proof/credibility zone. Pack the frame — minimal empty space. Never a single poster or lonely headline on empty background.
- Asymmetric editorial balance with crisp grids, thin dividers, intentional alignment to a clear column structure.
- Compact dark-navy #1C232F header bars (label reversed white) over content groups, and a dark footer ribbon anchoring the page.
- Real photographs composited into wheel segments, circles, labelled aerial shots and grid tiles — not floating rectangles.
- Stat ribbons with thin vertical rules separating 4–6 KPI figures (years, SKUs, revenue, pallet spaces, growth, sites).
- Line-art icons (2pt stroke) inside circles as secondary accents with short all-caps captions.

SLIDE ARCHETYPES — pick the best match per slide role:

(1) COVER — Left half: white panel with EP co-brand lockup (large, centred), two-line headline (first line #2D3645, second line #C04A4D), short body paragraph, row of 4–5 capability icons with labels. Right half: three diagonal image wedges (product/packaging still-life, branded EP lorry on road, port/warehouse at golden hour). Bottom-right: horizontal stat ribbon with 3–4 KPIs separated by thin grey rules.

(2) ABOUT / COMPANY OVERVIEW — model this on the real EP "A little bit about us…" slide. White canvas. Upper region: top-left an OVERSIZE red feature headline (≈110pt, sentence case, e.g. "A little bit about us…") with short red rule beneath, then a body paragraph with several BOLD-emphasised words and a 3–5 item bullet list (markets served: Retail, Non-food retail, E-commerce, Food service), plus one or two confident one-line facts ("We operate with no debt. All assets are wholly owned."). Upper-right: a large REAL aerial photograph of the manufacturing HQ with 3–5 white callout labels and thin leader lines (Head Office, Development, Manufacturing, Waste Management), an award badge roundel overlapping the top corner (Ecovadis Platinum "Top 1%"), and a solid red CLAIM-BADGE circle overlapping the lower corner ("We are the #1 paper bag manufacturer in the UK & #2 in Europe"). Lower region (white panel): a left header "Group companies & divisions" above a 2-row sub-brand LOGO WALL (europackaging, coppice, euro MPB, Jena, sirane, Walkers Chocolates, AB Group), a centre block of 5–6 oversize stat figures with grey descriptors (e.g. "50yrs Retail Supply Experience", "8,000 SKUs Supplied", "30% Growth YoY", "$500m Group Revenue", "23yrs Reusable Bag Expertise", "75,000 Pallet Spaces"), and a right column of award-badge roundels.

(3) PRODUCTS & SERVICES — model this on the real EP "Everything your store needs…" slide. White canvas, large dark-blue page title top-left with co-brand lockup top-right. Body = a 3×3 grid of nine category modules; EACH module has a compact dark-navy #1C232F HEADER BAR with the category name reversed in white (e.g. Bags & Carriers, Ecommerce, Catering Disposables, Cleaning & Janitorial, Stationery, Catering Light Equipment, Chemicals, PPE & Workwear, General Consumables) sitting above a 2×3 grid of SIX real, distinct product photographs (genuine packaging/products on white or in use). Tight, even gutters; thin grid; no icons needed — the real product photos carry it. Optionally a hero product-family still-life as the first module.

(4) FOOTPRINT / LOCATIONS — Top-left: kicker + two-line headline + short body. Top-right: 4-column stat strip (globe/locations/people/culture icons with large figures). Centre: stylised world map in light grey #F4F5F6 with red #C04A4D location pins. Lower-left: manufacturing disciplines list with icons in 3 columns. Lower-centre: warehousing capability strip with 4 icons. Dark footer band with global capability message + 4 pillar blocks.

(5) FRAMEWORK / PROCESS — model this on the real EP "A unique end-to-end solution" wheel slide. White canvas, large dark-blue page title top-left, co-brand lockup top-right. Centre: a large CIRCULAR PROCESS WHEEL divided into 6–7 pie SEGMENTS, and CRITICALLY each segment contains a REAL PHOTOGRAPH (design studio, manufacturing line, global sourcing/containers, warehouse racking, delivery lorry, waste/recycling bay) — photos sit inside the wheel segments, not as separate tiles. A pale blue circular arrow band wraps the wheel implying flow. The hub is a solid dark-navy #1C232F circle containing the red 'ep' square + white 'make it easy'. Around the wheel, 6–7 steps each with a small red numbered circle, a BOLD red step title (We create / We manufacture / We source / We consolidate / We deliver / We collect / We sort, refurb or reprocess) and 3 concise bullet points, connected to its segment with a thin leader line. This slide is dense and detailed — fill the frame.

(6) SUSTAINABILITY — Left: headline + commitment pillars with icons. Adjacent: quantified targets box with large percentage figures in green-tinted panel (use #F4F5F6 background with #2D3645 text — no green hex). Centre: circular 5-point framework diagram with numbered nodes. Right: dashboard/product evidence panel (laptop mockup or packaging comparison). Bottom: dark band with 4 circular capability icons + photographic footer strip (forest/wind turbines as subtle background within panel).

(7) PARTNERSHIP / CUSTOMER VALUE — Top: kicker + headline + intro + large centred quote with red quotation mark. Middle: 4 white cards with gradient-circle icons (cost, resilience, sustainability, innovation) + bullet lists. Below: two-column challenge-to-solution matrix (red header left, navy header right). Partner logo wall in 4×3 grid on pale #F4F5F6 panel. 7-step horizontal workflow strip with numbered circles and arrows. Dark footer with key message + 3 proof icons.

(8) CULTURE / DNA — Three-column grid: values icon grid (2×3), pillar cards with circular icons + descriptions, and a development section with icons + a facility/operations photo (warehouse aisle, production line — NO posed people, diagonal crop edge). Dark footer with people/country/location stats + unity slogan.

PRODUCT PHOTOGRAPHY: curated studio still-lifes — corrugate, cartons, bags, mailers, trays, bottles, retail-ready packaging on seamless white or in warehouse scenes. Branded EP lorries, modern facilities, conveyor/production lines, dashboard mockups. No human portraits, no stock clichés.

LOGO / WORDMARK RENDERING RULES — extremely important:
- Never restyle, redraw, stretch, outline, bevel, shadow, or decorate logos.
- If a partner logo is referenced, render it as a clean, flat, vector-like wordmark/mark in its exact brand colours on a plain background with generous whitespace.
- The EP lockup must be horizontally aligned and identical across slides. Keep proportions stable; do not improvise.
- When multiple logos appear, place them in a dedicated clean panel or strip with equal spacing and consistent baseline alignment. Never scatter them around the composition.
- If the model is likely to struggle with a logo, reduce logo count and make the surrounding design carry the slide quality rather than inventing distorted marks.

HARD BANS — repeat as a single line at the end of every imagePrompt: "no human faces, portraits or headshots, no watermarks, no lorem ipsum, no garbled or misspelled text, no drop-shadows on type, no rainbow or purple/blue gradients, no neon, no teal, no clip-art, no stock-photo handshakes/globes/lightbulbs/arrows-over-cities, no AI artefacts on letterforms or logos, no invented partner logos — render partner marks faithfully in their real brand colours."
`.trim();