import sanitizeHtml from 'sanitize-html';
import { pdfSource } from './hero-pdf';

// Published HTML cannot run scripts on the builder's origin. HTTPS embeds keep
// working, with an opaque sandbox origin and no access to the parent document.
export function sanitizePublishedContent<T>(value: T): T {
  function clean(input: unknown, key = '', parentKey = ''): unknown {
    if (Array.isArray(input)) return input.map(item => clean(item));
    if (input && typeof input === 'object') return Object.fromEntries(
      Object.entries(input).map(([name, item]) => [name, clean(item, name, key)]));
    if (typeof input !== 'string') return input;
    if (key === 'url' && parentKey === 'pdf') return pdfSource(input) ?? '';
    if (key === 'text' || key === 'embedCode') return sanitizeHtml(input, {
      allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img', 'iframe'],
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        '*': ['style'],
        img: ['src', 'alt', 'width', 'height'],
        iframe: ['src', 'width', 'height', 'title', 'allowfullscreen', 'sandbox', 'loading'],
      },
      allowedSchemes: ['https', 'http', 'mailto', 'tel'],
      allowedSchemesByTag: { iframe: ['https'], img: ['https', 'http', 'data'] },
      allowProtocolRelative: false,
      allowedStyles: { '*': {
        color: [/^#[0-9a-f]+$/i, /^rgba?\([\d\s.,%]+\)$/, /^[a-z]+$/i],
        'text-align': [/^(left|right|center|justify)$/],
        'font-weight': [/^(bold|normal|[1-9]00)$/],
        'font-style': [/^(normal|italic)$/],
        'text-decoration': [/^(none|underline|line-through)$/],
      } },
      transformTags: { iframe: (_tag, attributes) => ({ tagName: 'iframe', attribs: {
        ...attributes, sandbox: 'allow-scripts allow-presentation', loading: 'lazy',
      } }) },
    });
    if (/(url|link|src|image|video|photo|resume)$/i.test(key) &&
      /^[\s\u0000-\u0020]*(?:javascript|vbscript|data(?!:image\/(?:png|jpeg|webp|gif);base64,)):/i.test(input.replace(/[\u0000-\u0020]/g, ''))) return '';
    return input;
  }
  return clean(value) as T;
}
