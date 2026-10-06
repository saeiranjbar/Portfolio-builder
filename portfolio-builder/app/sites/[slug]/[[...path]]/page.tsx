import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { readPublishedWebsite } from '@/lib/publishing';
import { sanitizePublishedContent } from '@/lib/public-content';
import { PublishedWebsite } from '@/components/PublishedWebsite';

export const dynamic = 'force-dynamic';
const readSite = cache((slug: string) => readPublishedWebsite(prisma, slug));
type Props = { params: Promise<{ slug: string; path?: string[] }> };

async function load(params: Props['params']) {
  const { slug, path = [] } = await params;
  const site = await readSite(slug);
  const page = site?.pages.find(item => item.slug === path.join('/'));
  if (!site || !page) notFound();
  return { site, page, slug };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { site, page } = await load(params);
  return {
    title: page.seo?.title || (page.slug ? `${page.title} | ${site.portfolio.metadata.title}` : site.portfolio.metadata.title),
    description: page.seo?.description || site.portfolio.metadata.description,
    robots: page.seo?.noIndex ? { index: false, follow: false } : { index: true, follow: true },
  };
}

export default async function PublicSitePage({ params }: Props) {
  const { site, page, slug } = await load(params);
  const safe = sanitizePublishedContent({ ...site, page });
  return <PublishedWebsite key={`${slug}/${page.slug}`} portfolio={safe.portfolio}
    pages={safe.pages} page={safe.page} basePath={`/sites/${slug}`} />;
}
