import { cache } from 'react';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { readPublishedWebsiteByDomain } from '@/lib/publishing';
import { configuredSiteDomain, normalizeHostname, tenantLabel } from '@/lib/tenant-domains';
import { sanitizePublishedContent } from '@/lib/public-content';
import { PublishedWebsite } from '@/components/PublishedWebsite';

export const dynamic = 'force-dynamic';
const readSite = cache((domain: string) => readPublishedWebsiteByDomain(prisma, domain));
type Props = { params: Promise<{ domain: string; path?: string[] }> };

async function load(params: Props['params']) {
  const { domain, path = [] } = await params;
  const host = normalizeHostname((await headers()).get('host') ?? '');
  if (host !== domain || !tenantLabel(domain, configuredSiteDomain())) notFound();
  const site = await readSite(domain);
  const page = site?.pages.find(item => item.slug === path.join('/'));
  if (!site || !page) notFound();
  return { site, page, domain };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { site, page, domain } = await load(params);
  return {
    title: page.seo?.title || (page.slug ? `${page.title} | ${site.portfolio.metadata.title}` : site.portfolio.metadata.title),
    description: page.seo?.description || site.portfolio.metadata.description,
    alternates: { canonical: `https://${domain}/${page.slug}` },
    robots: page.seo?.noIndex ? { index: false, follow: false } : { index: true, follow: true },
  };
}

export default async function PublicDomainPage({ params }: Props) {
  const { site, page, domain } = await load(params);
  const safe = sanitizePublishedContent({ ...site, page });
  return <PublishedWebsite key={`${domain}/${page.slug}`} portfolio={safe.portfolio}
    pages={safe.pages} page={safe.page} basePath="/" />;
}
