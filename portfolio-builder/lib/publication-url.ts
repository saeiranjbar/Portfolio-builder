// Production-generated deployment URLs may require a Vercel login. Share the
// stable production domain instead. Preview deployments retain their own origin
// because their database and published content may differ from production.
export function publicationUrl(path: string | null, requestOrigin: string,
  environment: { VERCEL_ENV?: string; VERCEL_PROJECT_PRODUCTION_URL?: string } = {
    VERCEL_ENV: process.env.VERCEL_ENV,
    VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL,
  }): string | null {
  if (!path) return null;
  const domain = environment.VERCEL_ENV === 'production' ? environment.VERCEL_PROJECT_PRODUCTION_URL : undefined;
  const origin = domain ? new URL(`https://${domain}`).origin : new URL(requestOrigin).origin;
  return new URL(path, origin).href;
}
