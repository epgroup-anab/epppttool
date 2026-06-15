import PptxGenJS from "pptxgenjs";

export async function exportDeckPptx(images: Array<{ title: string; dataUrl: string }>, fileName = "ep-group-deck.pptx") {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE"; // 13.333 x 7.5 inches, 16:9
  pptx.title = "EP Group Deck";
  for (const img of images) {
    const slide = pptx.addSlide();
    slide.background = { color: "2B3543" };
    slide.addImage({
      data: img.dataUrl,
      x: 0,
      y: 0,
      w: 13.333,
      h: 7.5,
      sizing: { type: "cover", w: 13.333, h: 7.5 },
    });
  }
  await pptx.writeFile({ fileName });
}