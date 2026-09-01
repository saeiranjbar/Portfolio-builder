// Portfolio Section Types
export type SectionType = 
  | 'hero'
  | 'about'
  | 'projects'
  | 'skills'
  | 'experience'
  | 'education'
  | 'testimonials'
  | 'contact'
  | 'social'
  | 'footer'
  | 'ctaBanner'
  | 'services'
  | 'process'
  | 'stats'
  | 'awards'
  | 'press'
  | 'certifications'
  | 'blog'
  | 'faq'
  | 'newsletter';




// Text Style Settings for per-field text customization
export interface TextStyleSettings {
  color?: string;
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline' | 'line-through';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  lineHeight?: string;
  letterSpacing?: string;
  maxWidth?: string;
}

// Map of field key -> text style settings
export type TextStyles = Record<string, TextStyleSettings>;

// Per-section background override
export interface SectionBackground {
  type: 'theme' | 'color' | 'gradient' | 'image';
  value?: string; // hex color, gradient string, or image URL
  overlayOpacity?: number; // 0-100, for image backgrounds to darken for text readability
}

// Background shape for free-form sections — decorative shapes placed behind text
export interface BackgroundShape {
  id: string;
  shape: 'rectangle' | 'circle' | 'triangle' | 'rounded';
  color: string;
  opacity: number; // 0-100
  width: number; // px
  height: number; // px
  position: ElementPosition; // percentage 0-100
  zIndex: number; // typically 0 (below text elements at zIndex 10)
  rotation?: number; // degrees
  borderRadius?: number; // for rounded rectangle, in px
}

// Free-form layout configuration shared by all section types
export interface FreeFormConfig {
  // Enable free-form drag mode (absolute positioning)
  freeFormEnabled?: boolean;
  // Snap guides for drag alignment
  snapEnabled?: boolean;
  // Element positions (percentage 0-100) keyed by element name
  elementPositions?: Record<string, ElementPosition>;
}


// Media block types for project content (Behance-style)
export type MediaType = 
  | 'image'
  | 'text'
  | 'video'
  | 'embed'
  | 'photoGrid'
  | 'youtube'
  | 'vimeo'
  | 'figma'
  | 'sketchfab'
  | 'spotify'
  | 'soundcloud'
  | 'giphy'
  | 'adobeXD'
  | 'adobeExpress'
  | 'instagram'
  | 'twitter'
  | 'facebook'
  | 'twitch'
  | 'codepen'
  | 'github'
  | 'dribbble'
  | 'behance'
  | 'artstation'
  | 'autodesk'
  | 'substance'
  | 'marvel'
  | 'invision'
  | 'prezi'
  | 'issuu'
  | 'slideshare'
  | 'googleMaps'
  | 'googleVR'
  | 'matterport'
  | 'kuula360'
  | 'tiled'
  | 'bandcamp'
  | 'mixcloud'
  | 'dailymotion'
  | 'imgur'
  | 'jotform'
  | 'wufoo'
  | 'mailchimp'
  | 'typeform'
  | 'lottie'
  | 'threejs'
  | 'pdf'
  | 'custom';

export interface TextBlockContent {
  text: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  fontSize?: 'small' | 'medium' | 'large' | 'xlarge';
  fontWeight?: 'normal' | 'bold';
  color?: string;
  fontFamily?: string;
}

export interface PhotoGridItem {
  id: string;
  url: string;
  caption?: string;
  span?: number; // Column span for grid layout
}


export interface PhotoGridContent {
  items: PhotoGridItem[];
  layout: 'grid' | 'carousel';
  columns?: number;
  gap?: 'small' | 'medium' | 'large';
  showCaptions?: boolean;
}


export interface VideoContent {
  url: string;
  type: 'youtube' | 'vimeo' | 'loom' | 'mp4' | 'webm';
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  caption?: string;
}

export interface EmbedContent {
  embedCode: string; // iFrame embed code
  source: string; // Source platform name
  url?: string; // Original URL for reference
  caption?: string;
  aspectRatio?: '16:9' | '4:3' | '1:1' | 'custom';
  customWidth?: string;
  customHeight?: string;
}

export interface PdfContent {
  url: string; // PDF file URL or data URL
  fileName?: string; // Original file name for download
  caption?: string;
  viewerWidth?: 'small' | 'medium' | 'full';
  viewerHeight?: number; // Height in pixels for the embedded viewer
}

export interface ProjectMediaBlock {
  id: string;
  type: MediaType;
  order: number;
  // Image content
  imageUrl?: string;
  imageCaption?: string;
  // Text content
  textContent?: TextBlockContent;
  // Video content
  videoContent?: VideoContent;
  // Embed content
  embedContent?: EmbedContent;
  // Photo grid content
  photoGridContent?: PhotoGridContent;
  // PDF content
  pdfContent?: PdfContent;
  // Common caption for all block types
  caption?: string;
}

export interface ProjectImage {
  id: string;
  url: string;
  caption?: string;
}

// Gallery image for hero/about multi-image support
export interface GalleryImage {
  id: string;
  url: string;
  caption?: string;
  // Natural image dimensions (captured on upload for aspect-ratio calculations)
  naturalWidth?: number;
  naturalHeight?: number;
  // Position for free-form layout (percentage 0-100)
  position?: ElementPosition;
}

// Gallery video for hero/about multi-video support
export interface GalleryVideo {
  id: string;
  url: string; // Can be YouTube/Vimeo embed URL or uploaded video URL
  type: 'youtube' | 'vimeo' | 'uploaded'; // Video source type
  caption?: string;
  position?: ElementPosition;
  // Size for free-form layout
  size?: 'small' | 'medium' | 'large';
}



export interface ProjectCaseStudy {
  problem?: string;
  process?: string;
  solution?: string;
  results?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string; // Short description for preview
  fullDescription?: string; // Full description for detail page
  imageUrl: string; // Cover image
  images?: ProjectImage[]; // Additional images for detail page
  tags: string[];
  link?: string;
  client?: string;
  date?: string;
  category?: string;
  featured?: boolean; // Pinned/featured project
  videoUrl?: string; // YouTube, Vimeo, Loom embed URL
  videoType?: 'youtube' | 'vimeo' | 'loom';
  caseStudy?: ProjectCaseStudy;
  // Behance-style media blocks for rich project content
  mediaBlocks?: ProjectMediaBlock[];
  // Project styling options
  bgColor?: string;
  textColor?: string;
  accentColor?: string;
  layoutStyle?: string;
  contentWidth?: string;
  // Project visibility settings
  showProjectTitle?: boolean;
  showProjectDate?: boolean;
  showProjectTags?: boolean;
  showProjectCategory?: boolean;
  showProjectClient?: boolean;
  showProjectUrl?: boolean;
}

export interface Skill {
  id: string;
  name: string;
  level: number; // 0-100
  category: string;
  yearsExperience?: number;
  icon?: string; // Icon name for tool/software icons
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
  location: string;
  companyLogo?: string;
  achievements?: string[]; // Bullet points of key achievements
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  description: string;
  logo?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  avatar: string;
  rating?: number; // 1-5 star rating
}

export interface SocialLink {
  id: string;
  platform: 'linkedin' | 'github' | 'twitter' | 'instagram' | 'facebook' | 'dribbble' | 'behance' | 'website';
  url: string;
}

export interface ElementPosition {
  x: number; // percentage 0-100
  y: number; // percentage 0-100
}

// CTA Button for hero section
export interface CTAButton {
  id: string;
  label: string;
  link: string; // URL or section anchor (e.g., "#contact")
  variant: 'primary' | 'secondary' | 'outline';
}

export interface HeroSection {
  id: string;
  visible?: boolean;
  type: 'hero';
  name: string;
  title: string;
  subtitle: string;
  bio: string;
  avatar: string;
  backgroundType: 'color' | 'gradient' | 'image' | 'video';
  backgroundValue: string;
  backgroundOverlayOpacity?: number; // 0-100, for image/video backgrounds
  // Individual element positions (percentage based)
  avatarPosition: ElementPosition;
  namePosition: ElementPosition;
  titlePosition: ElementPosition;
  subtitlePosition: ElementPosition;
  bioPosition: ElementPosition;
  ctaButtonsPosition: ElementPosition;
  galleryImagesPosition?: ElementPosition;
  galleryVideosPosition?: ElementPosition;
  // Element sizes and shapes
  avatarSize: 'small' | 'medium' | 'large';
  avatarWidth?: number; // in pixels (e.g., 80, 120, 160)
  avatarHeight?: number; // in pixels (e.g., 80, 120, 160)
  avatarShape?: 'circle' | 'rounded' | 'square'; // circle, rounded square, or square
  // Visibility
  showName: boolean;
  showTitle: boolean;
  showSubtitle: boolean;
  showBio: boolean;
  showAvatar: boolean;
  showScrollIndicator: boolean;
  // CTA buttons
  ctaButtons: CTAButton[];
  // Layout preset
  layout: 'free' | 'centered' | 'left' | 'split';
  // Free-form drag mode toggle (when false, uses layout preset instead)
  freeFormEnabled?: boolean;
  // Per-field text styles
  textStyles?: TextStyles;
  // Per-section background
  sectionBackground?: SectionBackground;
  // Snap guides for drag alignment
  snapEnabled?: boolean;

  // Additional gallery images
  galleryImages?: GalleryImage[];
  // Additional gallery videos
  galleryVideos?: GalleryVideo[];
  // Gallery grid layout
  galleryGridCols?: number; // 1-4 columns (rows auto-calculate)
  galleryVideoGridCols?: number; // 1-3 columns for video grid
  // Typing/rotating text animation for title (e.g., ["Designer", "Developer", "Creator"])
  typingWords?: string[];
  // Enable parallax effect on hero background
  parallaxEnabled?: boolean;
  // Background shapes (free-form decorative shapes behind text)
  backgroundShapes?: BackgroundShape[];
}




export interface AboutQuickFact {
  id: string;
  label: string;   // e.g., "Years Experience"
  value: string;   // e.g., "5+"
  icon?: string;   // Optional icon name
}

export interface AboutLanguage {
  id: string;
  language: string;   // e.g., "English"
  proficiency: string; // e.g., "Native", "Fluent", "Intermediate"
}

export interface AboutSection {
  id: string;
  visible?: boolean;
  type: 'about';
  title: string;
  tagline?: string; // Short punchy one-liner below title
  content: string; // Main bio paragraph
  secondParagraph?: string; // Optional second paragraph (philosophy/approach)
  personalQuote?: string; // Large styled pull-quote
  imageUrl?: string;
  secondImageUrl?: string; // Optional workspace/secondary image
  imageWidth?: number; // Custom portrait image width in px
  imageHeight?: number; // Custom portrait image height in px
  secondImageWidth?: number; // Custom second image width in px
  secondImageHeight?: number; // Custom second image height in px
  resumeUrl?: string; // Downloadable resume/CV link
  resumeDisplayMode?: 'embed' | 'download'; // How to show resume: embedded viewer or download button
  resumeHeight?: number; // Height of embedded resume viewer in px
  imageShape?: 'rounded' | 'circle' | 'square';
  imageLayout?: 'left' | 'right' | 'top' | 'none' | 'fullwidth'; // Image position relative to text
  imageSize?: 'small' | 'medium' | 'large';
  imageBorder?: boolean;
  imageShadow?: boolean;
  // Quick facts / stats row
  quickFacts?: AboutQuickFact[];
  // Inline tool/skill tags
  toolTags?: string[];
  // Location & availability
  location?: string; // e.g., "San Francisco, CA"
  availabilityStatus?: string; // e.g., "Available for freelance"
  // CTA button
  ctaButtonText?: string;
  ctaButtonLink?: string;
  // Video introduction
  videoUrl?: string; // YouTube/Vimeo embed URL
  videoType?: 'youtube' | 'vimeo';
  // Languages
  languages?: AboutLanguage[];
  // Quick social links
  showSocialLinks?: boolean;
  // Text styles
  textStyles?: TextStyles;
  sectionBackground?: SectionBackground;
  // Additional gallery images
  galleryImages?: GalleryImage[];
  // Element visibility toggles
  showTitle?: boolean;
  showTagline?: boolean;
  showBio?: boolean;
  showSecondParagraph?: boolean;
  showPersonalQuote?: boolean;
  showImage?: boolean;
  showQuickFacts?: boolean;
  showToolTags?: boolean;
  showLocation?: boolean;
  showCTA?: boolean;
  showResume?: boolean;
  showVideo?: boolean;
  showLanguages?: boolean;
  showGallery?: boolean;
  // Free-form layout
  freeFormEnabled?: boolean;
  snapEnabled?: boolean;
  elementPositions?: Record<string, ElementPosition>;
  // Background shapes (free-form decorative shapes behind text)
  backgroundShapes?: BackgroundShape[];
}



export interface ProjectCategory {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
}

export interface ProjectsSection {
  id: string;
  visible?: boolean;
  type: 'projects';
  title: string;
  categories: ProjectCategory[];
  projects: Project[];
  layout: 'grid' | 'carousel' | 'list';
  columnCount: 1 | 2;

  aspectRatio: '1:1' | '4:3' | '16:9' | 'original';
  textStyles?: TextStyles;
  sectionBackground?: SectionBackground;
  // Element visibility toggles
  showTitle?: boolean;
  showCategories?: boolean;
  // Free-form layout
  freeFormEnabled?: boolean;
  snapEnabled?: boolean;
  elementPositions?: Record<string, ElementPosition>;
}


export interface SkillsSection {

  id: string;
  visible?: boolean;
  type: 'skills';
  title: string;
  skills: Skill[];
  displayStyle: 'bars' | 'circles' | 'tags' | 'icons';
  textStyles?: TextStyles;
  sectionBackground?: SectionBackground;
  showTitle?: boolean;
  // Free-form layout
  freeFormEnabled?: boolean;
  snapEnabled?: boolean;
  elementPositions?: Record<string, ElementPosition>;
}


export interface ExperienceSection {

  id: string;
  visible?: boolean;
  type: 'experience';
  title: string;
  experiences: Experience[];
  layout: 'left' | 'alternate';
  textStyles?: TextStyles;
  sectionBackground?: SectionBackground;
  showTitle?: boolean;
  // Free-form layout
  freeFormEnabled?: boolean;
  snapEnabled?: boolean;
  elementPositions?: Record<string, ElementPosition>;
}

export interface EducationSection {
  id: string;
  visible?: boolean;
  type: 'education';
  title: string;
  educations: Education[];
  textStyles?: TextStyles;
  sectionBackground?: SectionBackground;
  showTitle?: boolean;
  // Free-form layout
  freeFormEnabled?: boolean;
  snapEnabled?: boolean;
  elementPositions?: Record<string, ElementPosition>;
}

export interface TestimonialsSection {
  id: string;
  visible?: boolean;
  type: 'testimonials';
  title: string;
  testimonials: Testimonial[];
  layout: 'grid' | 'carousel';
  textStyles?: TextStyles;
  sectionBackground?: SectionBackground;
  showTitle?: boolean;
  // Free-form layout
  freeFormEnabled?: boolean;
  snapEnabled?: boolean;
  elementPositions?: Record<string, ElementPosition>;
}

export interface ContactSection {
  id: string;
  visible?: boolean;
  type: 'contact';
  title: string;
  email: string;
  phone?: string;
  location?: string;
  showForm: boolean;
  calendlyUrl?: string; // Calendly scheduling integration
  textStyles?: TextStyles;
  sectionBackground?: SectionBackground;
  showTitle?: boolean;
  showEmail?: boolean;
  showPhone?: boolean;
  showLocation?: boolean;
  showCalendly?: boolean;
  // Social links in contact area
  showSocialLinks?: boolean;
  socialLinks?: SocialLink[];
  // Free-form layout
  freeFormEnabled?: boolean;
  snapEnabled?: boolean;
  elementPositions?: Record<string, ElementPosition>;
}

export interface SocialSection {
  id: string;
  visible?: boolean;
  type: 'social';
  title: string;
  links: SocialLink[];
  textStyles?: TextStyles;
  sectionBackground?: SectionBackground;
  showTitle?: boolean;
  // Free-form layout
  freeFormEnabled?: boolean;
  snapEnabled?: boolean;
  elementPositions?: Record<string, ElementPosition>;
}

// --- New Section Types ---

export interface FooterSection {
  id: string;
  visible?: boolean;
  type: 'footer';
  copyrightText: string;
  showQuickLinks: boolean;
  showSocialIcons: boolean;
  showContactInfo: boolean;
  showBackToTop: boolean;
  contactEmail?: string;
  contactPhone?: string;
  contactLocation?: string;
  textStyles?: TextStyles;
  sectionBackground?: SectionBackground;
  // Free-form layout
  freeFormEnabled?: boolean;
  snapEnabled?: boolean;
  elementPositions?: Record<string, ElementPosition>;
}

export interface CTAButtonConfig {
  id: string;
  label: string;
  link: string;
  variant: 'primary' | 'secondary' | 'outline';
}

export interface CTABannerSection {
  id: string;
  visible?: boolean;
  type: 'ctaBanner';
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  backgroundType: 'color' | 'gradient' | 'image';
  backgroundValue: string;
  textStyles?: TextStyles;
  sectionBackground?: SectionBackground;
  showTitle?: boolean;
  showSubtitle?: boolean;
  showButton?: boolean;
  // Free-form layout
  freeFormEnabled?: boolean;
  snapEnabled?: boolean;
  elementPositions?: Record<string, ElementPosition>;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string; // Icon name from lucide-react
}

export interface ServicesSection {
  id: string;
  visible?: boolean;
  type: 'services';
  title: string;
  subtitle?: string;
  services: Service[];
  textStyles?: TextStyles;
  sectionBackground?: SectionBackground;
  showTitle?: boolean;
  showSubtitle?: boolean;
  // Free-form layout
  freeFormEnabled?: boolean;
  snapEnabled?: boolean;
  elementPositions?: Record<string, ElementPosition>;
}

export interface ProcessStep {
  id: string;
  number: number;
  title: string;
  description: string;
  icon?: string;
}

export interface ProcessSection {
  id: string;
  visible?: boolean;
  type: 'process';
  title: string;
  subtitle?: string;
  steps: ProcessStep[];
  layout: 'horizontal' | 'vertical';
  textStyles?: TextStyles;
  sectionBackground?: SectionBackground;
  showTitle?: boolean;
  showSubtitle?: boolean;
  // Free-form layout
  freeFormEnabled?: boolean;
  snapEnabled?: boolean;
  elementPositions?: Record<string, ElementPosition>;
}

export interface Stat {
  id: string;
  value: number;
  suffix: string; // e.g., "+", "%"
  label: string;
}

export interface StatsSection {
  id: string;
  visible?: boolean;
  type: 'stats';
  title: string;
  stats: Stat[];
  textStyles?: TextStyles;
  sectionBackground?: SectionBackground;
  showTitle?: boolean;
  // Free-form layout
  freeFormEnabled?: boolean;
  snapEnabled?: boolean;
  elementPositions?: Record<string, ElementPosition>;
}

export interface Award {
  id: string;
  title: string;
  organization: string;
  year: string;
  description?: string;
  logo?: string;
}

export interface AwardsSection {
  id: string;
  visible?: boolean;
  type: 'awards';
  title: string;
  awards: Award[];
  textStyles?: TextStyles;
  sectionBackground?: SectionBackground;
  showTitle?: boolean;
  // Free-form layout
  freeFormEnabled?: boolean;
  snapEnabled?: boolean;
  elementPositions?: Record<string, ElementPosition>;
}

export interface PressItem {
  id: string;
  name: string;
  logo: string;
  link?: string;
}

export interface PressSection {
  id: string;
  visible?: boolean;
  type: 'press';
  title: string;
  subtitle?: string;
  items: PressItem[];
  textStyles?: TextStyles;
  sectionBackground?: SectionBackground;
  showTitle?: boolean;
  showSubtitle?: boolean;
  // Free-form layout
  freeFormEnabled?: boolean;
  snapEnabled?: boolean;
  elementPositions?: Record<string, ElementPosition>;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url?: string;
  logo?: string;
}

export interface CertificationsSection {
  id: string;
  visible?: boolean;
  type: 'certifications';
  title: string;
  certifications: Certification[];
  textStyles?: TextStyles;
  sectionBackground?: SectionBackground;
  showTitle?: boolean;
  // Free-form layout
  freeFormEnabled?: boolean;
  snapEnabled?: boolean;
  elementPositions?: Record<string, ElementPosition>;
}

// Blog Post
export interface BlogPost {
  id: string;
  title: string;
  excerpt: string; // Short preview
  content: string; // Full content (markdown or plain text)
  imageUrl?: string; // Cover image
  date: string; // e.g., "2024-01-15"
  readTime?: string; // e.g., "5 min read"
  tags?: string[];
  link?: string; // External link to full article
}

export interface BlogSection {
  id: string;
  visible?: boolean;
  type: 'blog';
  title: string;
  subtitle?: string;
  posts: BlogPost[];
  layout: 'grid' | 'list';
  textStyles?: TextStyles;
  sectionBackground?: SectionBackground;
  showTitle?: boolean;
  showSubtitle?: boolean;
  // Free-form layout
  freeFormEnabled?: boolean;
  snapEnabled?: boolean;
  elementPositions?: Record<string, ElementPosition>;
}

// FAQ Item
export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface FAQSection {
  id: string;
  visible?: boolean;
  type: 'faq';
  title: string;
  subtitle?: string;
  items: FAQItem[];
  layout: 'accordion' | 'grid';
  textStyles?: TextStyles;
  sectionBackground?: SectionBackground;
  showTitle?: boolean;
  showSubtitle?: boolean;
  // Free-form layout
  freeFormEnabled?: boolean;
  snapEnabled?: boolean;
  elementPositions?: Record<string, ElementPosition>;
}

// Newsletter Section
export interface NewsletterSection {
  id: string;
  visible?: boolean;
  type: 'newsletter';
  title: string;
  subtitle?: string;
  placeholder?: string; // Email input placeholder
  buttonText: string; // e.g., "Subscribe"
  provider?: 'none' | 'mailchimp' | 'convertkit'; // Email service integration
  providerUrl?: string; // Form action URL for the provider
  backgroundType: 'color' | 'gradient' | 'image';
  backgroundValue: string;
  textStyles?: TextStyles;
  sectionBackground?: SectionBackground;
  showTitle?: boolean;
  showSubtitle?: boolean;
  // Free-form layout
  freeFormEnabled?: boolean;
  snapEnabled?: boolean;
  elementPositions?: Record<string, ElementPosition>;
}



export type PortfolioSection = 
  | HeroSection
  | AboutSection
  | ProjectsSection
  | SkillsSection
  | ExperienceSection
  | EducationSection
  | TestimonialsSection
  | ContactSection
  | SocialSection
  | FooterSection
  | CTABannerSection
  | ServicesSection
  | ProcessSection
  | StatsSection
  | AwardsSection
  | PressSection
  | CertificationsSection
  | BlogSection
  | FAQSection
  | NewsletterSection;




// Theme Types
export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  textSecondary: string;
}

export interface ThemeTypography {
  headingFont: string;
  bodyFont: string;
  baseSize: number;
}

export interface Theme {
  id: string;
  name: string;
  colors: ThemeColors;
  typography: ThemeTypography;
  borderRadius: number;
  spacing: number;
}

// Navbar Configuration
export interface NavbarConfig {
  enabled: boolean;
  logo: string; // Text or image URL
  logoType: 'text' | 'image';
  showCTAButton: boolean;
  ctaButtonText: string;
  ctaButtonLink: string;
  sticky: boolean;
  transparentOnTop: boolean; // Transparent over hero, solid on scroll
  style: 'solid' | 'transparent';
}

// Availability Status
export interface AvailabilityConfig {
  enabled: boolean;
  text: string; // e.g., "Available for work"
  color: string; // badge color
}

// Dark Mode Configuration
export interface DarkModeConfig {
  enabled: boolean; // Whether dark mode toggle is available
  active: boolean; // Whether dark mode is currently on
  darkTheme?: Theme; // Optional custom dark theme
}

// Layout Mode - determines overall portfolio layout style
// 'flexible' = free-form drag and drop, 'simple' = structured template-based layout
export type LayoutMode = 'flexible' | 'simple';

// Simple mode layout configuration (formerly Behance)
export interface SimpleLayoutConfig {
  // Show sidebar with profile
  showSidebar: boolean;
  sidebarPosition: 'left' | 'right';
  // Profile info in sidebar
  profileImage: string;
  profileName: string;
  profileTitle: string;
  profileLocation: string;
  // Availability status
  availableForWork: boolean;
  availabilityText: string;
  // Stats
  showStats: boolean;
  projectViews: number;
  appreciations: number;
  followers: number;
  following: number;
  // Social links in sidebar
  sidebarSocialLinks: SocialLink[];
  // Work experience in sidebar
  sidebarExperiences: Experience[];
  // About section in sidebar
  sidebarAbout: string;
  resumeUrl?: string;
}


// Interactive Effects Configuration
export interface MouseColorShiftEffect {
  enabled: boolean;
  startColor: string;   // left side color
  endColor: string;     // right side color
  intensity: number;    // 0-100 opacity
}

export interface SplashButtonEffect {
  enabled: boolean;
  text: string;
  link: string;
  color: string;
  position: 'bottom-center' | 'bottom-right' | 'bottom-left';
}

export interface ColorRibbonEffect {
  enabled: boolean;
  color: string;      // ribbon color
  intensity: number;   // 0-100 opacity
}

export interface PortfolioEffects {
  mouseColorShift: MouseColorShiftEffect;
  splashButton: SplashButtonEffect;
  colorRibbon: ColorRibbonEffect;
}

// Portfolio Data
export interface PortfolioData {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  sections: PortfolioSection[];
  theme: Theme;
  metadata: {
    title: string;
    description: string;
    favicon?: string;
  };
  navbar: NavbarConfig;
  availability: AvailabilityConfig;
  darkMode: DarkModeConfig;
  customCSS?: string;
  // Layout mode configuration
  layoutMode: LayoutMode;
  simpleLayout?: SimpleLayoutConfig;
  // Interactive effects
  effects?: PortfolioEffects;
}

// Template Types
export interface Template {
  id: string;
  name: string;
  description: string;
  preview: string;
  theme: Theme;
  defaultSections: PortfolioSection[];
}
