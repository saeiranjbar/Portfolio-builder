export const MAX_HERO_PDF_BYTES = 1024 * 1024;

export function pdfSource(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const source = value.trim();
  if (source.startsWith('data:application/pdf;base64,')) {
    const data = source.slice('data:application/pdf;base64,'.length);
    if (data.length > 4 * Math.ceil(MAX_HERO_PDF_BYTES / 3) || data.length % 4 !== 0 ||
      !/^JVBERi0[A-Za-z0-9+/]*={0,2}$/.test(data)) return null;
    return source;
  }
  try {
    const url = new URL(source);
    if (url.protocol !== 'https:' || url.username || url.password || !/\.pdf$/i.test(url.pathname)) return null;
    return url.href;
  } catch { return null; }
}

export function pdfHeight(value?: number): number {
  return Number.isFinite(value) ? Math.min(1600, Math.max(240, value!)) : 600;
}

export async function readPdfFile(file: File): Promise<string> {
  if (file.size > MAX_HERO_PDF_BYTES) throw new Error('Upload a PDF up to 1 MB, or use a public PDF link for a larger document.');
  const header = new Uint8Array(await file.slice(0, 5).arrayBuffer());
  if (String.fromCharCode(...header) !== '%PDF-') throw new Error('Please choose a valid PDF file.');
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Unable to read this PDF. Please try again.'));
    reader.onload = () => {
      const source = pdfSource(reader.result);
      if (source) resolve(source); else reject(new Error('Unable to read this PDF.'));
    };
    reader.readAsDataURL(new Blob([file], { type: 'application/pdf' }));
  });
}
