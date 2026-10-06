import { configuredSiteDomain, tenantLabel } from './tenant-domains';

// Production-generated deployment URLs may require a Vercel login. Share the
// stable production domain instead. Preview deployments retain their own origin
// because their database and published content may differ from production.
export function publicationUrl(path: string | null, requestOrigin: string,
  environment: { VERCEL_ENV?: string; VERCEL_PROJECT_PRODUCTION_URL?: string; PUBLISHED_SITE_DOMAIN?: string } = {
    VERCEL_ENV: process.env.VERCEL_ENV,
    VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL,
    PUBLISHED_SITE_DOMAIN: process.env.PUBLISHED_SITE_DOMAIN,
  }, siteDomain?: string | null): string | null {
  if (!path) return null;
  if (environment.VERCEL_ENV === 'production' && siteDomain && tenantLabel(siteDomain, configuredSiteDomain(environment.PUBLISHED_SITE_DOMAIN))) {
    return `https://${siteDomain}/`;
  }
  const domain = environment.VERCEL_ENV === 'production' ? environment.VERCEL_PROJECT_PRODUCTION_URL : undefined;
  const origin = domain ? new URL(`https://${domain}`).origin : new URL(requestOrigin).origin;
  return new URL(path, origin).href;
}
