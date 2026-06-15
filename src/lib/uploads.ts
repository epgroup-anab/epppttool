import JSZip from "jszip";

export type RefRole = "style" | "logo" | "content";

export type UploadedRef = {
  id: string;
  name: string;
  mime: string;
  size: number;
  role: RefRole;
  /** image data URL (only set for image files) */
  imageDataUrl?: string;
  /** extracted text (only set for pdf/pptx/text) */
  text?: string;
};

export const MAX_REF_BYTES = 8 * 1024 * 1024;

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result as string);
    fr.onerror = () => reject(fr.error);
    fr.readAsDataURL(file);
  });
}

async function extractPptxText(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(buf);
  const slidePaths = Object.keys(zip.files)
    .filter((p) => /^ppt\/slides\/slide\d+\.xml$/.test(p))
    .sort();
  const out: string[] = [];
  for (const path of slidePaths) {
    const xml = await zip.files[path].async("string");
    const texts = xml.match(/<a:t[^>]*>([^<]*)<\/a:t>/g) ?? [];
    const clean = texts
      .map((t) => t.replace(/<\/?a:t[^>]*>/g, ""))
      .filter(Boolean)
      .join(" ");
    if (clean) out.push(`[Slide ${out.length + 1}] ${clean}`);
  }
  return out.join("\n").slice(0, 12000);
}

async function extractPdfText(file: File): Promise<string> {
  // Lightweight extraction: read raw bytes and pull text between BT/ET markers.
  // Not perfect — good enough to give the planner real content cues.
  const buf = new Uint8Array(await file.arrayBuffer());
  let str = "";
  for (let i = 0; i < buf.length; i++) str += String.fromCharCode(buf[i]);
  const matches = str.match(/\(([^()\\]{2,200})\)\s*Tj/g) ?? [];
  const joined = matches
    .map((m) => m.replace(/\)\s*Tj$/, "").replace(/^\(/, ""))
    .join(" ");
  return joined.slice(0, 12000);
}

export async function processUpload(file: File, role: RefRole): Promise<UploadedRef> {
  if (file.size > MAX_REF_BYTES) {
    throw new Error(`${file.name} is too large (max 8 MB)`);
  }
  const id = crypto.randomUUID();
  const base = { id, name: file.name, mime: file.type, size: file.size, role };
  if (file.type.startsWith("image/")) {
    return { ...base, imageDataUrl: await fileToDataUrl(file) };
  }
  if (file.name.toLowerCase().endsWith(".pptx")) {
    return { ...base, text: await extractPptxText(file) };
  }
  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    return { ...base, text: await extractPdfText(file) };
  }
  if (file.type.startsWith("text/") || /\.(md|txt|csv)$/i.test(file.name)) {
    const text = await file.text();
    return { ...base, text: text.slice(0, 12000) };
  }
  throw new Error(`Unsupported file type: ${file.name}`);
}