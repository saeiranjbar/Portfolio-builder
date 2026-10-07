export function pdfSource(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const source = value.trim();
  if (source.startsWith('data:application/pdf;base64,')) {
    const data = source.slice('data:application/pdf;base64,'.length);
    if (data.length > 4 * Math.ceil(1024 * 1024 / 3) || data.length % 4 !== 0 ||
      !/^JVBERi0[A-Za-z0-9+/]*={0,2}$/.test(data)) return null;
    return source;
  }
  if (/^\/uploads\/[\w.-]+\.pdf$/i.test(source)) return source;
  try {
    const url = new URL(source);
    if (url.protocol !== 'https:' || url.username || url.password || !/\.pdf$/i.test(url.pathname)) return null;
    return url.href;
  } catch { return null; }
}

export function pdfHeight(value?: number): number {
  return Number.isFinite(value) ? Math.min(1600, Math.max(240, value!)) : 600;
}

export function pdfWidth(value?: number): number {
  return Number.isFinite(value) ? Math.min(100, Math.max(20, value!)) : 60;
}

export async function uploadPdfFile(file: File): Promise<string> {
  const header = new Uint8Array(await file.slice(0, 5).arrayBuffer());
  if (String.fromCharCode(...header) !== '%PDF-') throw new Error('Please choose a valid PDF file.');
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch('/api/upload', { method: 'POST', body: formData });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Unable to upload PDF. Please try again.');
  }
  const { url } = await response.json();
  return url;
}
