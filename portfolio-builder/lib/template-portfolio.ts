import type { AvailabilityConfig, DarkModeConfig, NavbarConfig, PortfolioData, PortfolioSection, SimpleLayoutConfig, Template } from './types';

// Builds a new site document from a template. Shared by the template gallery
// (preview and "use this template") and the public template preview route, so
// every surface starts from the same data.
// `stable` gives the same id and timestamps on every call. The prerendered
// template preview route needs that so server and client markup match; the
// save path keeps random ids and real timestamps.
export function makeTemplatePortfolio(template: Template, { stable = false }: { stable?: boolean } = {}): PortfolioData {
  const generateId = () => (stable ? `preview-${template.id}` : Math.random().toString(36).slice(2, 11));
  const now = stable ? '1970-01-01T00:00:00.000Z' : new Date().toISOString();

  const navbar: NavbarConfig = {
    enabled: true,
    logo: template.name,
    logoType: 'text',
    showCTAButton: true,
    ctaButtonText: 'Get In Touch',
    ctaButtonLink: '#contact',
    sticky: true,
    transparentOnTop: true,
    style: 'transparent',
    ...template.navbar,
  };

  const availability: AvailabilityConfig = {
    enabled: false,
    text: 'Available for work',
    color: '#10b981',
  };

  const darkMode: DarkModeConfig = {
    enabled: false,
    active: false,
  };

  const simpleLayout: SimpleLayoutConfig = {
    showSidebar: true,
    sidebarPosition: 'left',
    profileImage: '',
    profileName: template.name,
    profileTitle: 'Creative Professional',
    profileLocation: '',
    availableForWork: true,
    availabilityText: 'Available for work',
    showStats: true,
    projectViews: 0,
    appreciations: 0,
    followers: 0,
    following: 0,
    sidebarSocialLinks: [],
    sidebarExperiences: [],
    sidebarAbout: '',
  };

  return {
    id: generateId(),
    name: template.name,
    createdAt: now,
    updatedAt: now,
    sections: template.defaultSections.map((section) => ({
      ...section,
      freeFormEnabled: true,
      snapEnabled: section.snapEnabled !== false,
    })) as PortfolioSection[],
    theme: template.theme,
    metadata: {
      title: template.name,
      description: template.description,
    },
    navbar,
    availability,
    darkMode,
    customCSS: '',
    layoutMode: template.layoutMode ?? 'flexible',
    simpleLayout: { ...simpleLayout, ...(template.simpleLayout ?? {}) },
    ...(template.effects ? { effects: template.effects } : {}),
  };
}
