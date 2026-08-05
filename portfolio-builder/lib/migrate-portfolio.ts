// Conversion between the legacy single-page PortfolioData shape and the
// multi-page SiteData model (docs/site-data-model.md). Used by the editor
// store, the DB migration script, and (later) the sites API.
import { PortfolioData, PortfolioSection } from './types';
import {
  SiteData,
  SiteDataSchema,
  SiteSettings,
  SiteSeo,
} from './site-types';

// Legacy portfolio -> validated SiteData with a single home page.
// Runs through zod so defaults are filled and drifted data is caught here,
// not deep inside the editor.
export function portfolioToSiteData(portfolio: PortfolioData): SiteData {
  return SiteDataSchema.parse({
    settings: {
      theme: portfolio.theme,
      navbar: portfolio.navbar,
      availability: portfolio.availability,
      darkMode: portfolio.darkMode,
      customCSS: portfolio.customCSS || undefined,
      layoutMode: portfolio.layoutMode,
      simpleLayout: portfolio.simpleLayout,
    },
    seo: {
      title: portfolio.metadata.title,
      description: portfolio.metadata.description,
      favicon: portfolio.metadata.favicon,
    },
    pages: [
      {
        slug: '',
        title: 'Home',
        sections: portfolio.sections,
      },
    ],
  });
}

// SiteData settings/seo -> the site-level fields of a PortfolioData object
// (everything except sections). Lets the editor keep its existing
// PortfolioData shape while the current page's sections are swapped in.
export function siteSettingsToPortfolioFields(
  settings: SiteSettings,
  seo: SiteSeo
): Omit<PortfolioData, 'id' | 'createdAt' | 'updatedAt' | 'sections' | 'name'> {
  return {
    theme: settings.theme,
    navbar: settings.navbar,
    availability: settings.availability ?? {
      enabled: false,
      text: 'Available for work',
      color: '#10b981',
    },
    darkMode: settings.darkMode ?? { enabled: false, active: false },
    customCSS: settings.customCSS ?? '',
    layoutMode: settings.layoutMode ?? 'flexible',
    simpleLayout: settings.simpleLayout,
    metadata: {
      title: seo.title,
      description: seo.description,
      favicon: seo.favicon,
    },
  };
}

// Sections cross the legacy/new type boundary structurally unchanged; the
// two type systems describe the same JSON (site-types mirrors types.ts).
export function sectionsFromSiteData(sections: SiteData['pages'][number]['sections']): PortfolioSection[] {
  return sections as unknown as PortfolioSection[];
}

// URL-safe slug from a site or page name: "Bella Cucina!" -> "bella-cucina"
export function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s-]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'site'
  );
}

// Slug unique within a taken-set: "bella-cucina", "bella-cucina-2", ...
export function uniqueSlug(base: string, taken: Set<string>): string {
  const root = slugify(base);
  if (!taken.has(root)) return root;
  let n = 2;
  while (taken.has(`${root}-${n}`)) n++;
  return `${root}-${n}`;
}
