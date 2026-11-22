// Link targets come from user-edited fields (CTA buttons, project links, social links, etc.)
// and are written into both the live site and the exported HTML. Only web, mail, phone,
// in-page and relative targets are allowed. Anything else (javascript:, data:, vbscript:)
// becomes a harmless '#'.
const ALLOWED_SCHEMES = new Set(['http', 'https', 'mailto', 'tel']);

export function safeHref(url?: string | null): string {
  if (!url) return '';
  const trimmed = url.trim();
  // Browsers ignore tabs, newlines and other control characters inside a scheme
  // ("java\tscript:" still runs), so check the same normalised form they would.
  const normalised = trimmed.replace(/[\u0000- \u007f-\u009f]/g, '');
  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(normalised);
  if (!scheme) return trimmed; // relative path, #anchor or protocol-relative
  return ALLOWED_SCHEMES.has(scheme[1].toLowerCase()) ? trimmed : '#';
}

// Iframe sources run in the page's own origin, so only web pages, same-site paths and
// PDF data URIs are allowed (hero PDFs can be stored as data URIs). Anything else
// (javascript:, text/html data URIs, etc.) becomes about:blank.
const EMBED_SCHEMES = new Set(['http', 'https']);
export function safeEmbedUrl(url?: string | null): string {
  if (!url) return '';
  const trimmed = url.trim();
  const normalised = trimmed.replace(/[\u0000-\u0020\u007f-\u009f]/g, '');
  if (/^data:application\/pdf[;,]/i.test(normalised)) return trimmed;
  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(normalised);
  if (!scheme) return trimmed;
  return EMBED_SCHEMES.has(scheme[1].toLowerCase()) ? trimmed : 'about:blank';
}
