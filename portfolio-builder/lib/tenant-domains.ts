const labelPattern = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const reserved = new Set(['www', 'api', 'admin', 'auth', 'login', 'mail', 'smtp', 'send', 'rsend', 'resend', 'psrp', 'noreply', 'autodiscover', 'autoconfig', 'webmail', 'pop', 'imap', 'mx', 'ftp', 'ns1', 'ns2', 'support', 'help', 'billing', 'account', 'accounts', 'dashboard', 'status', 'assets', 'cdn']);

export function chosenSubdomain(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const label = value.trim().toLowerCase();
  return labelPattern.test(label) && !reserved.has(label) ? label : null;
}

export function configuredSiteDomain(value = process.env.PUBLISHED_SITE_DOMAIN): string | null {
  const domain = value?.trim().toLowerCase().replace(/\.$/, '');
  if (!domain || domain.length > 189 || !domain.includes('.') || /^[\d.]+$/.test(domain) ||
    !domain.split('.').every(label => labelPattern.test(label))) return null;
  return domain;
}

export function normalizeHostname(host: string): string {
  return host.toLowerCase().replace(/:\d+$/, '').replace(/\.$/, '');
}

export function tenantLabel(host: string, baseDomain: string | null): string | null {
  const hostname = normalizeHostname(host);
  if (!baseDomain || !hostname.endsWith(`.${baseDomain}`)) return null;
  const label = hostname.slice(0, -(baseDomain.length + 1));
  return labelPattern.test(label) && !reserved.has(label) ? label : null;
}

export function automaticSiteDomain(title: string, id: string, baseDomain: string): string {
  const prefix = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30).replace(/-$/, '') || 'portfolio';
  // The full UUID makes allocation collision-free without changing a website's
  // existing /sites/ URL. Every DNS label stays within the 63-character limit.
  return `${prefix}-${id.replace(/-/g, '')}.${baseDomain}`;
}
