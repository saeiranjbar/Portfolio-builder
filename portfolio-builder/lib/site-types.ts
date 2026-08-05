// Zod-first schemas for the multi-page Site model (see docs/site-data-model.md).
// These mirror the section shapes in lib/types.ts so existing portfolio data
// validates unchanged. Every write path — AI generation, template cloning,
// editor saves — must pass through these schemas before reaching the database.
import { z } from 'zod';

// --- Shared primitives ---

export const ElementPositionSchema = z.object({
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
});

export const TextStyleSettingsSchema = z.object({
  color: z.string().optional(),
  fontFamily: z.string().optional(),
  fontSize: z.string().optional(),
  fontWeight: z.string().optional(),
  textAlign: z.enum(['left', 'center', 'right', 'justify']).optional(),
  fontStyle: z.enum(['normal', 'italic']).optional(),
  textDecoration: z.enum(['none', 'underline', 'line-through']).optional(),
  textTransform: z.enum(['none', 'uppercase', 'lowercase', 'capitalize']).optional(),
  lineHeight: z.string().optional(),
  letterSpacing: z.string().optional(),
});

export const TextStylesSchema = z.record(TextStyleSettingsSchema);

export const SectionBackgroundSchema = z.object({
  type: z.enum(['theme', 'color', 'gradient', 'image']),
  value: z.string().optional(),
  overlayOpacity: z.number().min(0).max(100).optional(),
});

// Props shared by every section type (previously duplicated in each interface)
const baseSectionFields = {
  id: z.string(),
  visible: z.boolean().default(true),
  textStyles: TextStylesSchema.optional(),
  sectionBackground: SectionBackgroundSchema.optional(),
  freeFormEnabled: z.boolean().optional(),
  snapEnabled: z.boolean().optional(),
  elementPositions: z.record(ElementPositionSchema).optional(),
};

const centered = { x: 50, y: 50 };

// --- Content item schemas ---

export const CTAButtonSchema = z.object({
  id: z.string(),
  label: z.string(),
  link: z.string(),
  variant: z.enum(['primary', 'secondary', 'outline']),
});

export const GalleryImageSchema = z.object({
  id: z.string(),
  url: z.string(),
  caption: z.string().optional(),
  position: ElementPositionSchema.optional(),
  size: z.enum(['small', 'medium', 'large']).optional(),
});

export const MediaTypeSchema = z.enum([
  'image', 'text', 'video', 'embed', 'photoGrid', 'youtube', 'vimeo', 'figma',
  'sketchfab', 'spotify', 'soundcloud', 'giphy', 'adobeXD', 'adobeExpress',
  'instagram', 'twitter', 'facebook', 'twitch', 'codepen', 'github', 'dribbble',
  'behance', 'artstation', 'autodesk', 'substance', 'marvel', 'invision',
  'prezi', 'issuu', 'slideshare', 'googleMaps', 'googleVR', 'matterport',
  'kuula360', 'tiled', 'bandcamp', 'mixcloud', 'dailymotion', 'imgur',
  'jotform', 'wufoo', 'mailchimp', 'typeform', 'lottie', 'threejs', 'pdf',
  'custom',
]);

export const TextBlockContentSchema = z.object({
  text: z.string(),
  textAlign: z.enum(['left', 'center', 'right', 'justify']).optional(),
  fontSize: z.enum(['small', 'medium', 'large', 'xlarge']).optional(),
  fontWeight: z.enum(['normal', 'bold']).optional(),
  color: z.string().optional(),
  fontFamily: z.string().optional(),
});

export const PhotoGridItemSchema = z.object({
  id: z.string(),
  url: z.string(),
  caption: z.string().optional(),
  span: z.number().optional(),
});

export const PhotoGridContentSchema = z.object({
  items: z.array(PhotoGridItemSchema),
  layout: z.enum(['grid', 'carousel']),
  columns: z.number().optional(),
  gap: z.enum(['small', 'medium', 'large']).optional(),
  showCaptions: z.boolean().optional(),
});

export const VideoContentSchema = z.object({
  url: z.string(),
  type: z.enum(['youtube', 'vimeo', 'loom', 'mp4', 'webm']),
  autoplay: z.boolean().optional(),
  loop: z.boolean().optional(),
  muted: z.boolean().optional(),
  controls: z.boolean().optional(),
  caption: z.string().optional(),
});

export const EmbedContentSchema = z.object({
  embedCode: z.string(),
  source: z.string(),
  url: z.string().optional(),
  caption: z.string().optional(),
  aspectRatio: z.enum(['16:9', '4:3', '1:1', 'custom']).optional(),
  customWidth: z.string().optional(),
  customHeight: z.string().optional(),
});

export const PdfContentSchema = z.object({
  url: z.string(),
  fileName: z.string().optional(),
  caption: z.string().optional(),
  viewerWidth: z.enum(['small', 'medium', 'full']).optional(),
  viewerHeight: z.number().optional(),
});

export const ProjectMediaBlockSchema = z.object({
  id: z.string(),
  type: MediaTypeSchema,
  order: z.number(),
  imageUrl: z.string().optional(),
  imageCaption: z.string().optional(),
  textContent: TextBlockContentSchema.optional(),
  videoContent: VideoContentSchema.optional(),
  embedContent: EmbedContentSchema.optional(),
  photoGridContent: PhotoGridContentSchema.optional(),
  pdfContent: PdfContentSchema.optional(),
  caption: z.string().optional(),
});

export const ProjectImageSchema = z.object({
  id: z.string(),
  url: z.string(),
  caption: z.string().optional(),
});

export const ProjectCaseStudySchema = z.object({
  problem: z.string().optional(),
  process: z.string().optional(),
  solution: z.string().optional(),
  results: z.string().optional(),
});

export const ProjectSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  fullDescription: z.string().optional(),
  imageUrl: z.string().default(''),
  images: z.array(ProjectImageSchema).optional(),
  tags: z.array(z.string()).default([]),
  link: z.string().optional(),
  client: z.string().optional(),
  date: z.string().optional(),
  category: z.string().optional(),
  featured: z.boolean().optional(),
  videoUrl: z.string().optional(),
  videoType: z.enum(['youtube', 'vimeo', 'loom']).optional(),
  caseStudy: ProjectCaseStudySchema.optional(),
  mediaBlocks: z.array(ProjectMediaBlockSchema).optional(),
  bgColor: z.string().optional(),
  textColor: z.string().optional(),
  accentColor: z.string().optional(),
  layoutStyle: z.string().optional(),
  contentWidth: z.string().optional(),
  showProjectTitle: z.boolean().optional(),
  showProjectDate: z.boolean().optional(),
  showProjectTags: z.boolean().optional(),
  showProjectCategory: z.boolean().optional(),
  showProjectClient: z.boolean().optional(),
  showProjectUrl: z.boolean().optional(),
});

export const SkillSchema = z.object({
  id: z.string(),
  name: z.string(),
  level: z.number().min(0).max(100),
  category: z.string(),
  yearsExperience: z.number().optional(),
  icon: z.string().optional(),
});

export const ExperienceSchema = z.object({
  id: z.string(),
  company: z.string(),
  position: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  description: z.string(),
  location: z.string().default(''),
  companyLogo: z.string().optional(),
  achievements: z.array(z.string()).optional(),
});

export const EducationSchema = z.object({
  id: z.string(),
  institution: z.string(),
  degree: z.string(),
  field: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  description: z.string().default(''),
  logo: z.string().optional(),
});

export const TestimonialSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
  company: z.string(),
  content: z.string(),
  avatar: z.string().default(''),
  rating: z.number().min(1).max(5).optional(),
});

export const SocialLinkSchema = z.object({
  id: z.string(),
  platform: z.enum(['linkedin', 'github', 'twitter', 'instagram', 'dribbble', 'behance', 'website']),
  url: z.string(),
});

export const AboutQuickFactSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.string(),
  icon: z.string().optional(),
});

export const AboutLanguageSchema = z.object({
  id: z.string(),
  language: z.string(),
  proficiency: z.string(),
});

export const ProjectCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const ServiceSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  icon: z.string(),
});

export const ProcessStepSchema = z.object({
  id: z.string(),
  number: z.number(),
  title: z.string(),
  description: z.string(),
  icon: z.string().optional(),
});

export const StatSchema = z.object({
  id: z.string(),
  value: z.number(),
  suffix: z.string().default(''),
  label: z.string(),
});

export const AwardSchema = z.object({
  id: z.string(),
  title: z.string(),
  organization: z.string(),
  year: z.string(),
  description: z.string().optional(),
  logo: z.string().optional(),
});

export const PressItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  logo: z.string().default(''),
  link: z.string().optional(),
});

export const CertificationSchema = z.object({
  id: z.string(),
  name: z.string(),
  issuer: z.string(),
  date: z.string(),
  url: z.string().optional(),
  logo: z.string().optional(),
});

export const BlogPostSchema = z.object({
  id: z.string(),
  title: z.string(),
  excerpt: z.string(),
  content: z.string().default(''),
  imageUrl: z.string().optional(),
  date: z.string(),
  readTime: z.string().optional(),
  tags: z.array(z.string()).optional(),
  link: z.string().optional(),
});

export const FAQItemSchema = z.object({
  id: z.string(),
  question: z.string(),
  answer: z.string(),
});

// --- Section schemas ---
// Defaults are chosen so AI generation only needs to supply content fields;
// layout and visibility fields fill in automatically on parse.

export const HeroSectionSchema = z.object({
  ...baseSectionFields,
  type: z.literal('hero'),
  name: z.string(),
  title: z.string(),
  subtitle: z.string().default(''),
  bio: z.string().default(''),
  avatar: z.string().default(''),
  backgroundType: z.enum(['color', 'gradient', 'image', 'video']).default('color'),
  backgroundValue: z.string().default(''),
  backgroundOverlayOpacity: z.number().min(0).max(100).optional(),
  avatarPosition: ElementPositionSchema.default(centered),
  namePosition: ElementPositionSchema.default(centered),
  titlePosition: ElementPositionSchema.default(centered),
  subtitlePosition: ElementPositionSchema.default(centered),
  bioPosition: ElementPositionSchema.default(centered),
  ctaButtonsPosition: ElementPositionSchema.default(centered),
  avatarSize: z.enum(['small', 'medium', 'large']).default('medium'),
  showName: z.boolean().default(true),
  showTitle: z.boolean().default(true),
  showSubtitle: z.boolean().default(true),
  showBio: z.boolean().default(true),
  showAvatar: z.boolean().default(true),
  showScrollIndicator: z.boolean().default(true),
  ctaButtons: z.array(CTAButtonSchema).default([]),
  layout: z.enum(['free', 'centered', 'left', 'split']).default('centered'),
  galleryImages: z.array(GalleryImageSchema).optional(),
  typingWords: z.array(z.string()).optional(),
  parallaxEnabled: z.boolean().optional(),
});

export const AboutSectionSchema = z.object({
  ...baseSectionFields,
  type: z.literal('about'),
  title: z.string(),
  tagline: z.string().optional(),
  content: z.string(),
  secondParagraph: z.string().optional(),
  personalQuote: z.string().optional(),
  imageUrl: z.string().optional(),
  secondImageUrl: z.string().optional(),
  resumeUrl: z.string().optional(),
  imageShape: z.enum(['rounded', 'circle', 'square']).optional(),
  imageLayout: z.enum(['left', 'right', 'top', 'none', 'fullwidth']).optional(),
  imageSize: z.enum(['small', 'medium', 'large']).optional(),
  imageBorder: z.boolean().optional(),
  imageShadow: z.boolean().optional(),
  quickFacts: z.array(AboutQuickFactSchema).optional(),
  toolTags: z.array(z.string()).optional(),
  location: z.string().optional(),
  availabilityStatus: z.string().optional(),
  ctaButtonText: z.string().optional(),
  ctaButtonLink: z.string().optional(),
  videoUrl: z.string().optional(),
  videoType: z.enum(['youtube', 'vimeo']).optional(),
  languages: z.array(AboutLanguageSchema).optional(),
  showSocialLinks: z.boolean().optional(),
  galleryImages: z.array(GalleryImageSchema).optional(),
  showTitle: z.boolean().optional(),
  showTagline: z.boolean().optional(),
  showBio: z.boolean().optional(),
  showSecondParagraph: z.boolean().optional(),
  showPersonalQuote: z.boolean().optional(),
  showImage: z.boolean().optional(),
  showQuickFacts: z.boolean().optional(),
  showToolTags: z.boolean().optional(),
  showLocation: z.boolean().optional(),
  showCTA: z.boolean().optional(),
  showResume: z.boolean().optional(),
  showVideo: z.boolean().optional(),
  showLanguages: z.boolean().optional(),
  showGallery: z.boolean().optional(),
});

export const ProjectsSectionSchema = z.object({
  ...baseSectionFields,
  type: z.literal('projects'),
  title: z.string(),
  categories: z.array(ProjectCategorySchema).default([]),
  projects: z.array(ProjectSchema).default([]),
  layout: z.enum(['grid', 'carousel', 'list']).default('grid'),
  columnCount: z.union([z.literal(2), z.literal(3), z.literal(4)]).default(3),
  aspectRatio: z.enum(['1:1', '4:3', '16:9', 'original']).default('4:3'),
  showTitle: z.boolean().optional(),
  showCategories: z.boolean().optional(),
});

export const SkillsSectionSchema = z.object({
  ...baseSectionFields,
  type: z.literal('skills'),
  title: z.string(),
  skills: z.array(SkillSchema).default([]),
  displayStyle: z.enum(['bars', 'circles', 'tags', 'icons']).default('tags'),
  showTitle: z.boolean().optional(),
});

export const ExperienceSectionSchema = z.object({
  ...baseSectionFields,
  type: z.literal('experience'),
  title: z.string(),
  experiences: z.array(ExperienceSchema).default([]),
  layout: z.enum(['left', 'alternate']).default('left'),
  showTitle: z.boolean().optional(),
});

export const EducationSectionSchema = z.object({
  ...baseSectionFields,
  type: z.literal('education'),
  title: z.string(),
  educations: z.array(EducationSchema).default([]),
  showTitle: z.boolean().optional(),
});

export const TestimonialsSectionSchema = z.object({
  ...baseSectionFields,
  type: z.literal('testimonials'),
  title: z.string(),
  testimonials: z.array(TestimonialSchema).default([]),
  layout: z.enum(['grid', 'carousel']).default('grid'),
  showTitle: z.boolean().optional(),
});

export const ContactSectionSchema = z.object({
  ...baseSectionFields,
  type: z.literal('contact'),
  title: z.string(),
  email: z.string(),
  phone: z.string().optional(),
  location: z.string().optional(),
  showForm: z.boolean().default(true),
  calendlyUrl: z.string().optional(),
  showTitle: z.boolean().optional(),
  showEmail: z.boolean().optional(),
  showPhone: z.boolean().optional(),
  showLocation: z.boolean().optional(),
  showCalendly: z.boolean().optional(),
  showSocialLinks: z.boolean().optional(),
  socialLinks: z.array(SocialLinkSchema).optional(),
});

export const SocialSectionSchema = z.object({
  ...baseSectionFields,
  type: z.literal('social'),
  title: z.string(),
  links: z.array(SocialLinkSchema).default([]),
  showTitle: z.boolean().optional(),
});

export const FooterSectionSchema = z.object({
  ...baseSectionFields,
  type: z.literal('footer'),
  copyrightText: z.string(),
  showQuickLinks: z.boolean().default(true),
  showSocialIcons: z.boolean().default(true),
  showContactInfo: z.boolean().default(true),
  showBackToTop: z.boolean().default(true),
  contactEmail: z.string().optional(),
  contactPhone: z.string().optional(),
  contactLocation: z.string().optional(),
});

export const CTABannerSectionSchema = z.object({
  ...baseSectionFields,
  type: z.literal('ctaBanner'),
  title: z.string(),
  subtitle: z.string().default(''),
  buttonText: z.string(),
  buttonLink: z.string(),
  backgroundType: z.enum(['color', 'gradient', 'image']).default('color'),
  backgroundValue: z.string().default(''),
  showTitle: z.boolean().optional(),
  showSubtitle: z.boolean().optional(),
  showButton: z.boolean().optional(),
});

export const ServicesSectionSchema = z.object({
  ...baseSectionFields,
  type: z.literal('services'),
  title: z.string(),
  subtitle: z.string().optional(),
  services: z.array(ServiceSchema).default([]),
  showTitle: z.boolean().optional(),
  showSubtitle: z.boolean().optional(),
});

export const ProcessSectionSchema = z.object({
  ...baseSectionFields,
  type: z.literal('process'),
  title: z.string(),
  subtitle: z.string().optional(),
  steps: z.array(ProcessStepSchema).default([]),
  layout: z.enum(['horizontal', 'vertical']).default('horizontal'),
  showTitle: z.boolean().optional(),
  showSubtitle: z.boolean().optional(),
});

export const StatsSectionSchema = z.object({
  ...baseSectionFields,
  type: z.literal('stats'),
  title: z.string(),
  stats: z.array(StatSchema).default([]),
  showTitle: z.boolean().optional(),
});

export const AwardsSectionSchema = z.object({
  ...baseSectionFields,
  type: z.literal('awards'),
  title: z.string(),
  awards: z.array(AwardSchema).default([]),
  showTitle: z.boolean().optional(),
});

export const PressSectionSchema = z.object({
  ...baseSectionFields,
  type: z.literal('press'),
  title: z.string(),
  subtitle: z.string().optional(),
  items: z.array(PressItemSchema).default([]),
  showTitle: z.boolean().optional(),
  showSubtitle: z.boolean().optional(),
});

export const CertificationsSectionSchema = z.object({
  ...baseSectionFields,
  type: z.literal('certifications'),
  title: z.string(),
  certifications: z.array(CertificationSchema).default([]),
  showTitle: z.boolean().optional(),
});

export const BlogSectionSchema = z.object({
  ...baseSectionFields,
  type: z.literal('blog'),
  title: z.string(),
  subtitle: z.string().optional(),
  posts: z.array(BlogPostSchema).default([]),
  layout: z.enum(['grid', 'list']).default('grid'),
  showTitle: z.boolean().optional(),
  showSubtitle: z.boolean().optional(),
});

export const FAQSectionSchema = z.object({
  ...baseSectionFields,
  type: z.literal('faq'),
  title: z.string(),
  subtitle: z.string().optional(),
  items: z.array(FAQItemSchema).default([]),
  layout: z.enum(['accordion', 'grid']).default('accordion'),
  showTitle: z.boolean().optional(),
  showSubtitle: z.boolean().optional(),
});

export const NewsletterSectionSchema = z.object({
  ...baseSectionFields,
  type: z.literal('newsletter'),
  title: z.string(),
  subtitle: z.string().optional(),
  placeholder: z.string().optional(),
  buttonText: z.string(),
  provider: z.enum(['none', 'mailchimp', 'convertkit']).optional(),
  providerUrl: z.string().optional(),
  backgroundType: z.enum(['color', 'gradient', 'image']).default('color'),
  backgroundValue: z.string().default(''),
  showTitle: z.boolean().optional(),
  showSubtitle: z.boolean().optional(),
});

export const SectionSchema = z.discriminatedUnion('type', [
  HeroSectionSchema,
  AboutSectionSchema,
  ProjectsSectionSchema,
  SkillsSectionSchema,
  ExperienceSectionSchema,
  EducationSectionSchema,
  TestimonialsSectionSchema,
  ContactSectionSchema,
  SocialSectionSchema,
  FooterSectionSchema,
  CTABannerSectionSchema,
  ServicesSectionSchema,
  ProcessSectionSchema,
  StatsSectionSchema,
  AwardsSectionSchema,
  PressSectionSchema,
  CertificationsSectionSchema,
  BlogSectionSchema,
  FAQSectionSchema,
  NewsletterSectionSchema,
]);

// --- Site-level schemas ---

export const ThemeColorsSchema = z.object({
  primary: z.string(),
  secondary: z.string(),
  accent: z.string(),
  background: z.string(),
  text: z.string(),
  textSecondary: z.string(),
});

export const ThemeTypographySchema = z.object({
  headingFont: z.string(),
  bodyFont: z.string(),
  baseSize: z.number(),
});

export const ThemeSchema = z.object({
  id: z.string(),
  name: z.string(),
  colors: ThemeColorsSchema,
  typography: ThemeTypographySchema,
  borderRadius: z.number(),
  spacing: z.number(),
});

export const NavbarConfigSchema = z.object({
  enabled: z.boolean().default(true),
  logo: z.string().default(''),
  logoType: z.enum(['text', 'image']).default('text'),
  showCTAButton: z.boolean().default(false),
  ctaButtonText: z.string().default(''),
  ctaButtonLink: z.string().default(''),
  sticky: z.boolean().default(true),
  transparentOnTop: z.boolean().default(false),
  style: z.enum(['solid', 'transparent']).default('solid'),
});

export const AvailabilityConfigSchema = z.object({
  enabled: z.boolean().default(false),
  text: z.string().default(''),
  color: z.string().default('#22c55e'),
});

export const DarkModeConfigSchema = z.object({
  enabled: z.boolean().default(false),
  active: z.boolean().default(false),
  darkTheme: ThemeSchema.optional(),
});

export const SimpleLayoutConfigSchema = z.object({
  showSidebar: z.boolean().default(true),
  sidebarPosition: z.enum(['left', 'right']).default('left'),
  profileImage: z.string().default(''),
  profileName: z.string().default(''),
  profileTitle: z.string().default(''),
  profileLocation: z.string().default(''),
  availableForWork: z.boolean().default(false),
  availabilityText: z.string().default(''),
  showStats: z.boolean().default(false),
  projectViews: z.number().default(0),
  appreciations: z.number().default(0),
  followers: z.number().default(0),
  following: z.number().default(0),
  sidebarSocialLinks: z.array(SocialLinkSchema).default([]),
  sidebarExperiences: z.array(ExperienceSchema).default([]),
  sidebarAbout: z.string().default(''),
  resumeUrl: z.string().optional(),
});

export const SiteSettingsSchema = z.object({
  theme: ThemeSchema,
  navbar: NavbarConfigSchema,
  availability: AvailabilityConfigSchema.optional(),
  darkMode: DarkModeConfigSchema.optional(),
  customCSS: z.string().optional(),
  layoutMode: z.enum(['flexible', 'simple']).optional(),
  simpleLayout: SimpleLayoutConfigSchema.optional(),
});

export const SiteSeoSchema = z.object({
  title: z.string(),
  description: z.string(),
  ogImage: z.string().optional(),
  favicon: z.string().optional(),
  keywords: z.array(z.string()).optional(),
});

export const PageSeoSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  ogImage: z.string().optional(),
  noIndex: z.boolean().optional(),
});

export const PageDataSchema = z.object({
  slug: z.string(), // "" = home
  title: z.string(),
  seo: PageSeoSchema.optional(),
  sections: z.array(SectionSchema),
});

// The full editable site content: what the editor holds in memory, what a
// revision snapshots, what AI generation produces, and what a template stores.
export const SiteDataSchema = z.object({
  settings: SiteSettingsSchema,
  seo: SiteSeoSchema,
  pages: z.array(PageDataSchema).min(1),
});

// --- Inferred types ---

export type ElementPosition = z.infer<typeof ElementPositionSchema>;
export type TextStyleSettings = z.infer<typeof TextStyleSettingsSchema>;
export type TextStyles = z.infer<typeof TextStylesSchema>;
export type SectionBackground = z.infer<typeof SectionBackgroundSchema>;
export type Section = z.infer<typeof SectionSchema>;
export type SectionType = Section['type'];
export type Theme = z.infer<typeof ThemeSchema>;
export type NavbarConfig = z.infer<typeof NavbarConfigSchema>;
export type SiteSettings = z.infer<typeof SiteSettingsSchema>;
export type SiteSeo = z.infer<typeof SiteSeoSchema>;
export type PageSeo = z.infer<typeof PageSeoSchema>;
export type PageData = z.infer<typeof PageDataSchema>;
export type SiteData = z.infer<typeof SiteDataSchema>;

export const SECTION_TYPES = SectionSchema.options.map(
  (option) => option.shape.type.value
) as SectionType[];

// --- Parse helpers ---

// Strict gate for user-facing saves: throws with readable issues.
export function parseSiteData(input: unknown): SiteData {
  return SiteDataSchema.parse(input);
}

// Safe gate for AI output: returns issues so the caller can feed them back
// to the model for a retry instead of throwing.
export function validateAiSiteData(
  input: unknown
): { ok: true; data: SiteData } | { ok: false; issues: string[] } {
  const result = SiteDataSchema.safeParse(input);
  if (result.success) return { ok: true, data: result.data };
  return {
    ok: false,
    issues: result.error.issues.map(
      (issue) => `${issue.path.join('.')}: ${issue.message}`
    ),
  };
}
