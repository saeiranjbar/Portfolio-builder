import { z } from 'zod';
import { parseSavedWebsite, type SavedWebsite } from './cloud-load';
import { portfolioToSiteData } from './migrate-portfolio';
import type { PrismaClient } from '@prisma/client';
import { automaticSiteDomain, configuredSiteDomain, tenantLabel } from './tenant-domains';

export class PublishError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

export const publicationId = z.string().uuid();
const pathFor = (slug: string) => `/sites/${slug}`;

export async function publicationStatus(db: PrismaClient, id: string, userId: string) {
  const owned = await db.portfolio.findFirst({ where: { id, userId }, select: { id: true } });
  if (!owned) throw new PublishError('Saved website not found.', 404);
  const site = await db.site.findFirst({ where: { id, userId } });
  return { published: site?.status === 'published', path: site ? pathFor(site.slug) : null, domain: site?.customDomain ?? null };
}

export async function publishWebsite(db: PrismaClient, id: string, userId: string) {
  return db.$transaction(async tx => {
    const record = await tx.portfolio.findFirst({ where: { id, userId } });
    if (!record) throw new PublishError('Saved website not found.', 404);
    let loaded;
    try {
      loaded = parseSavedWebsite({ ...record, updatedAt: record.updatedAt.toISOString() }, '');
    } catch { throw new PublishError('This saved website cannot be published. Please save it again.'); }
    const paths = loaded.pages.map(page => page.slug);
    if (paths.filter(path => path === '').length !== 1 || new Set(paths).size !== paths.length ||
      paths.some(path => path !== '' && !/^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/.test(path))) {
      throw new PublishError('Use one Home page with an empty path and unique page paths such as about or services/web-design.');
    }
    const converted = portfolioToSiteData(loaded.portfolio);
    const slug = `${record.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 45) || 'website'}-${id}`;
    // The upsert locks this site's row, serializing concurrent publications.
    // Its ID is the saved portfolio ID; the slug remains stable after renaming.
    const site = await tx.site.upsert({
      where: { id, userId },
      create: { id, userId, slug, name: record.title, settings: JSON.stringify(converted.settings), seo: JSON.stringify(converted.seo) },
      update: { name: record.title, settings: JSON.stringify(converted.settings), seo: JSON.stringify(converted.seo) },
    });
    const baseDomain = process.env.VERCEL_ENV === 'production' ? configuredSiteDomain() : null;
    const domain = site.customDomain ?? (baseDomain ? automaticSiteDomain(record.title, id, baseDomain) : null);
    const publishedAt = new Date(Math.max(Date.now(), (site.publishedAt?.getTime() ?? 0) + 1));
    await tx.siteRevision.create({ data: { siteId: id, source: 'publish', data: record.data, createdAt: publishedAt } });
    await tx.site.update({ where: { id, userId }, data: { status: 'published', publishedAt, customDomain: domain } });
    return { published: true, path: pathFor(site.slug), domain };
  });
}

export async function unpublishWebsite(db: PrismaClient, id: string, userId: string) {
  await publicationStatus(db, id, userId);
  await db.site.updateMany({ where: { id, userId }, data: { status: 'draft' } });
  return { published: false, path: null, domain: null };
}

// Only the chosen published revision is returned; later draft saves are private.
export async function readPublishedWebsite(db: PrismaClient, slug: string) {
  const site = await db.site.findUnique({ where: { slug }, select: { id: true, status: true, publishedAt: true, name: true } });
  return readSnapshot(db, site);
}

export async function readPublishedWebsiteByDomain(db: PrismaClient, domain: string) {
  if (!tenantLabel(domain, configuredSiteDomain())) return null;
  const site = await db.site.findUnique({ where: { customDomain: domain }, select: { id: true, status: true, publishedAt: true, name: true } });
  return readSnapshot(db, site);
}

async function readSnapshot(db: PrismaClient, site: { id: string; name: string; status: string; publishedAt: Date | null } | null) {
  if (!site || site.status !== 'published' || !site.publishedAt) return null;
  const revision = await db.siteRevision.findFirst({
    where: { siteId: site.id, source: 'publish', createdAt: site.publishedAt }, select: { data: true },
  });
  if (!revision) return null;
  const record: SavedWebsite = { id: site.id, title: site.name, data: revision.data, updatedAt: site.publishedAt.toISOString() };
  const { portfolio, pages } = parseSavedWebsite(record, '');
  return { portfolio, pages };
}
