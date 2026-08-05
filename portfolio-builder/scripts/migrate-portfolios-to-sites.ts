// One-time migration: legacy Portfolio rows -> Site (+ Page + SiteRevision).
// Safe to re-run: portfolios that already have a matching Site (by legacy id
// marker in the revision) are skipped. Legacy rows are never deleted here.
//
// Run with: npx tsx scripts/migrate-portfolios-to-sites.ts
import { PrismaClient } from '@prisma/client';
import { portfolioToSiteData, uniqueSlug } from '../lib/migrate-portfolio';
import { PortfolioData } from '../lib/types';

const prisma = new PrismaClient();

async function main() {
  const portfolios = await prisma.portfolio.findMany();
  console.log(`Found ${portfolios.length} legacy portfolio(s)`);

  const existingSlugs = new Set(
    (await prisma.site.findMany({ select: { slug: true } })).map((s) => s.slug)
  );
  const migratedMarkers = new Set(
    (
      await prisma.siteRevision.findMany({
        where: { source: 'manual' },
        select: { data: true },
      })
    )
      .map((r) => {
        try {
          return JSON.parse(r.data).migratedFromPortfolioId as string | undefined;
        } catch {
          return undefined;
        }
      })
      .filter(Boolean)
  );

  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  for (const p of portfolios) {
    if (migratedMarkers.has(p.id)) {
      skipped++;
      continue;
    }
    try {
      const legacy = JSON.parse(p.data) as PortfolioData;
      const siteData = portfolioToSiteData(legacy);
      const slug = uniqueSlug(p.title || 'site', existingSlugs);
      existingSlugs.add(slug);

      await prisma.site.create({
        data: {
          userId: p.userId,
          name: p.title,
          slug,
          status: 'draft',
          settings: JSON.stringify(siteData.settings),
          seo: JSON.stringify(siteData.seo),
          createdAt: p.createdAt,
          pages: {
            create: siteData.pages.map((page, i) => ({
              slug: page.slug,
              title: page.title,
              order: i,
              seo: page.seo ? JSON.stringify(page.seo) : null,
              sections: JSON.stringify(page.sections),
            })),
          },
          revisions: {
            create: {
              source: 'manual',
              data: JSON.stringify({ ...siteData, migratedFromPortfolioId: p.id }),
            },
          },
        },
      });
      migrated++;
      console.log(`  migrated "${p.title}" -> /${slug}`);
    } catch (e) {
      failed++;
      console.error(`  FAILED "${p.title}" (${p.id}):`, e instanceof Error ? e.message : e);
    }
  }

  console.log(`Done: ${migrated} migrated, ${skipped} already migrated, ${failed} failed`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
