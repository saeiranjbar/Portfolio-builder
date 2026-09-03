import { SectionType } from './types';

export interface TextFieldDef {
  key: string;
  label: string;
  defaultColor?: string;
  defaultFontFamily?: string;
}

/**
 * Central registry mapping each section type to its text style fields.
 * This is used by the GlobalTextStylePanel to provide a unified text style
 * editor that works across all categories/sections.
 *
 * Every text-based field that appears in a section's data model is listed
 * here so users can style it individually.
 */
export const SECTION_TEXT_FIELDS: Record<SectionType, TextFieldDef[]> = {
  hero: [
    { key: 'name', label: 'Name' },
    { key: 'title', label: 'Title' },
    { key: 'subtitle', label: 'Subtitle' },
    { key: 'bio', label: 'Bio' },
  ],
  about: [
    { key: 'title', label: 'Section Title' },
    { key: 'tagline', label: 'Tagline' },
    { key: 'content', label: 'Main Bio' },
    { key: 'secondParagraph', label: 'Second Paragraph' },
    { key: 'personalQuote', label: 'Personal Quote' },
    { key: 'location', label: 'Location' },
    { key: 'availabilityStatus', label: 'Availability Status' },
    { key: 'ctaButtonText', label: 'CTA Button Text' },
  ],
  projects: [
    { key: 'title', label: 'Section Title' },
    { key: 'projectTitle', label: 'Project Title' },
    { key: 'projectDescription', label: 'Project Description' },
    { key: 'projectFullDescription', label: 'Project Full Description' },
    { key: 'projectClient', label: 'Project Client' },
    { key: 'projectDate', label: 'Project Date' },
    { key: 'projectCategory', label: 'Project Category' },
    { key: 'projectTags', label: 'Project Tags' },
    { key: 'caseStudyProblem', label: 'Case Study: Problem' },
    { key: 'caseStudyProcess', label: 'Case Study: Process' },
    { key: 'caseStudySolution', label: 'Case Study: Solution' },
    { key: 'caseStudyResults', label: 'Case Study: Results' },
  ],
  skills: [
    { key: 'title', label: 'Section Title' },
    { key: 'skillName', label: 'Skill Name' },
    { key: 'skillCategory', label: 'Skill Category' },
    { key: 'skillYearsExperience', label: 'Skill Years of Experience' },
  ],
  experience: [
    { key: 'title', label: 'Section Title' },
    { key: 'experienceCompany', label: 'Company' },
    { key: 'experiencePosition', label: 'Position' },
    { key: 'experienceStartDate', label: 'Start Date' },
    { key: 'experienceEndDate', label: 'End Date' },
    { key: 'experienceDescription', label: 'Description' },
    { key: 'experienceLocation', label: 'Location' },
    { key: 'experienceAchievements', label: 'Achievements' },
  ],
  education: [
    { key: 'title', label: 'Section Title' },
    { key: 'educationInstitution', label: 'Institution' },
    { key: 'educationDegree', label: 'Degree' },
    { key: 'educationField', label: 'Field of Study' },
    { key: 'educationStartDate', label: 'Start Date' },
    { key: 'educationEndDate', label: 'End Date' },
    { key: 'educationDescription', label: 'Description' },
  ],
  testimonials: [
    { key: 'title', label: 'Section Title' },
    { key: 'testimonialName', label: 'Name' },
    { key: 'testimonialRole', label: 'Role' },
    { key: 'testimonialCompany', label: 'Company' },
    { key: 'testimonialContent', label: 'Testimonial Content' },
  ],
  contact: [
    { key: 'title', label: 'Section Title' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'location', label: 'Location' },
  ],
  social: [
    { key: 'title', label: 'Section Title' },
  ],
  footer: [
    { key: 'copyright', label: 'Copyright Text' },
    { key: 'contactEmail', label: 'Contact Email' },
    { key: 'contactPhone', label: 'Contact Phone' },
    { key: 'contactLocation', label: 'Contact Location' },
  ],
  ctaBanner: [
    { key: 'title', label: 'Title' },
    { key: 'subtitle', label: 'Subtitle' },
    { key: 'button', label: 'Button Text' },
  ],
  services: [
    { key: 'title', label: 'Section Title' },
    { key: 'subtitle', label: 'Subtitle' },
    { key: 'serviceTitle', label: 'Service Title' },
    { key: 'serviceDescription', label: 'Service Description' },
  ],
  process: [
    { key: 'title', label: 'Section Title' },
    { key: 'subtitle', label: 'Subtitle' },
    { key: 'stepTitle', label: 'Step Title' },
    { key: 'stepDescription', label: 'Step Description' },
  ],
  stats: [
    { key: 'title', label: 'Section Title' },
    { key: 'statValue', label: 'Stat Value' },
    { key: 'statLabel', label: 'Stat Label' },
  ],
  awards: [
    { key: 'title', label: 'Section Title' },
    { key: 'awardTitle', label: 'Award Title' },
    { key: 'awardOrganization', label: 'Award Organization' },
    { key: 'awardYear', label: 'Award Year' },
    { key: 'awardDescription', label: 'Award Description' },
  ],
  press: [
    { key: 'title', label: 'Section Title' },
    { key: 'subtitle', label: 'Subtitle' },
    { key: 'pressTitle', label: 'Press Item Title' },
  ],
  certifications: [
    { key: 'title', label: 'Section Title' },
    { key: 'certName', label: 'Certification Name' },
    { key: 'certIssuer', label: 'Certification Issuer' },
    { key: 'certDate', label: 'Certification Date' },
  ],
  blog: [
    { key: 'title', label: 'Section Title' },
    { key: 'subtitle', label: 'Subtitle' },
    { key: 'postTitle', label: 'Post Title' },
    { key: 'postExcerpt', label: 'Post Excerpt' },
    { key: 'postContent', label: 'Post Content' },
    { key: 'postDate', label: 'Post Date' },
    { key: 'postReadTime', label: 'Post Read Time' },
  ],
  faq: [
    { key: 'title', label: 'Section Title' },
    { key: 'subtitle', label: 'Subtitle' },
    { key: 'question', label: 'Question' },
    { key: 'answer', label: 'Answer' },
  ],
  newsletter: [
    { key: 'title', label: 'Title' },
    { key: 'subtitle', label: 'Subtitle' },
    { key: 'placeholder', label: 'Input Placeholder' },
    { key: 'buttonText', label: 'Button Text' },
  ],
};

/**
 * Human-readable labels for each section type, used in the dropdown.
 */
export const SECTION_LABELS: Record<SectionType, string> = {
  hero: 'Hero',
  about: 'About',
  projects: 'Projects',
  skills: 'Skills',
  experience: 'Experience',
  education: 'Education',
  testimonials: 'Testimonials',
  contact: 'Contact',
  social: 'Social',
  footer: 'Footer',
  ctaBanner: 'CTA Banner',
  services: 'Services',
  process: 'Process',
  stats: 'Stats',
  awards: 'Awards',
  press: 'Press',
  certifications: 'Certifications',
  blog: 'Blog',
  faq: 'FAQ',
  newsletter: 'Newsletter',
};
