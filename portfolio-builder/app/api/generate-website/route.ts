import { NextRequest, NextResponse } from 'next/server';

interface GenerateRequest {
  message: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
}

interface GeneratedSection {
  type: string;
  [key: string]: any;
}

interface GeneratedPortfolio {
  sections: GeneratedSection[];
  theme: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      text: string;
      textSecondary: string;
    };
    typography: {
      headingFont: string;
      bodyFont: string;
      baseSize: number;
    };
    borderRadius: number;
    spacing: number;
  };
  navbar: {
    logo: string;
    ctaButtonText: string;
    ctaButtonLink: string;
  };
  aiSummary: string;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

// Theme presets for different business types
const themePresets: Record<string, any> = {
  creative: {
    colors: { primary: '#ba9f99', secondary: '#9e796a', accent: '#ea9a80', background: '#f7f4f3', text: '#111111', textSecondary: '#6e6e6e' },
    typography: { headingFont: 'Playfair Display', bodyFont: 'Lato', baseSize: 16 },
    borderRadius: 4, spacing: 32,
  },
  tech: {
    colors: { primary: '#3b82f6', secondary: '#6366f1', accent: '#f59e0b', background: '#ffffff', text: '#1f2937', textSecondary: '#6b7280' },
    typography: { headingFont: 'Inter', bodyFont: 'Inter', baseSize: 16 },
    borderRadius: 8, spacing: 24,
  },
  dark: {
    colors: { primary: '#60a5fa', secondary: '#818cf8', accent: '#fbbf24', background: '#111827', text: '#f9fafb', textSecondary: '#9ca3af' },
    typography: { headingFont: 'Inter', bodyFont: 'Inter', baseSize: 16 },
    borderRadius: 8, spacing: 24,
  },
  warm: {
    colors: { primary: '#ea580c', secondary: '#dc2626', accent: '#facc15', background: '#fffbeb', text: '#292524', textSecondary: '#78716c' },
    typography: { headingFont: 'Poppins', bodyFont: 'Inter', baseSize: 16 },
    borderRadius: 12, spacing: 24,
  },
  nature: {
    colors: { primary: '#059669', secondary: '#0d9488', accent: '#84cc16', background: '#f0fdf4', text: '#1c1917', textSecondary: '#57534e' },
    typography: { headingFont: 'Poppins', bodyFont: 'Inter', baseSize: 16 },
    borderRadius: 12, spacing: 28,
  },
  luxury: {
    colors: { primary: '#1a1a1a', secondary: '#3b3b3b', accent: '#d4af37', background: '#fafafa', text: '#1a1a1a', textSecondary: '#6b7280' },
    typography: { headingFont: 'Playfair Display', bodyFont: 'Lato', baseSize: 16 },
    borderRadius: 2, spacing: 40,
  },
};

// Detect business type from user message
function detectBusinessType(message: string): { type: string; themeKey: string; sections: string[] } {
  const lower = message.toLowerCase();

  // Determine theme
  let themeKey = 'tech';
  if (/restaurant|food|cafe|bakery|coffee|catering|chef|menu|dining/.test(lower)) themeKey = 'warm';
  else if (/photograph|design|art|creative|studio|gallery|portfolio|artist/.test(lower)) themeKey = 'creative';
  else if (/dark|night|gaming|cyber|tech startup|saas|software|app/.test(lower)) themeKey = 'dark';
  else if (/spa|wellness|yoga|organic|eco|green|garden|plant|natural/.test(lower)) themeKey = 'nature';
  else if (/luxury|jewelry|fashion|boutique|premium|elegant|high-end/.test(lower)) themeKey = 'luxury';
  else if (/agency|marketing|consulting|business|corporate|finance|law|legal/.test(lower)) themeKey = 'tech';

  // Determine sections based on keywords
  const sections: string[] = ['hero', 'footer'];

  if (/about|story|who we are|team|company/.test(lower)) sections.push('about');
  if (/service|offer|what we do|provide|solution/.test(lower)) sections.push('services');
  if (/project|work|portfolio|case stud|gallery|showcase/.test(lower)) sections.push('projects');
  if (/testimonial|review|client say|feedback/.test(lower)) sections.push('testimonials');
  if (/contact|reach|get in touch|inquiry/.test(lower)) sections.push('contact');
  if (/process|how we work|step|methodology/.test(lower)) sections.push('process');
  if (/stat|number|achievement|result|impact/.test(lower)) sections.push('stats');
  if (/award|recognition|achievement/.test(lower)) sections.push('awards');
  if (/faq|question|frequently asked/.test(lower)) sections.push('faq');
  if (/blog|article|news|post|insight/.test(lower)) sections.push('blog');
  if (/newsletter|subscribe|email list/.test(lower)) sections.push('newsletter');
  if (/skill|expertise|technology|tool/.test(lower)) sections.push('skills');
  if (/experience|career|job|work history/.test(lower)) sections.push('experience');
  if (/cta|call to action|get started|hire/.test(lower)) sections.push('ctaBanner');
  if (/press|media|featured|as seen/.test(lower)) sections.push('press');
  if (/certif|credential|license|qualification/.test(lower)) sections.push('certifications');
  if (/education|degree|university|training/.test(lower)) sections.push('education');
  if (/social|follow|connect|instagram|twitter|linkedin/.test(lower)) sections.push('social');

  // Always include contact if not already
  if (!sections.includes('contact')) sections.push('contact');

  // Determine business type label
  let type = 'business';
  if (/restaurant|food|cafe|bakery|coffee|catering/.test(lower)) type = 'restaurant';
  else if (/photograph|design|art|creative|studio/.test(lower)) type = 'creative';
  else if (/agency|marketing|consulting/.test(lower)) type = 'agency';
  else if (/shop|store|ecommerce|retail|product/.test(lower)) type = 'ecommerce';
  else if (/app|software|saas|tech|startup/.test(lower)) type = 'tech';
  else if (/personal|freelance|individual/.test(lower)) type = 'personal';
  else if (/law|legal|attorney|lawyer/.test(lower)) type = 'legal';
  else if (/real estate|property|realtor/.test(lower)) type = 'realestate';
  else if (/fitness|gym|trainer|health/.test(lower)) type = 'fitness';
  else if (/education|course|school|academy|tutor/.test(lower)) type = 'education';

  return { type, themeKey, sections };
}

// Extract business name from message
function extractBusinessName(message: string): string | null {
  // Look for patterns like "called X", "named X", "for X", "X is a"
  const patterns = [
    /(?:called|named)\s+["']?([A-Z][a-zA-Z0-9\s&]+?)["']?(?:\.|,|$|is|that|which)/,
    /(?:for|of)\s+(?:my|our|the)\s+(?:business|company|brand|site|website)\s+(?:called|named)?\s*["']?([A-Z][a-zA-Z0-9\s&]+?)["']?(?:\.|,|$)/,
    /^["']([A-Z][a-zA-Z0-9\s&]+)["']/,
    /(?:brand|company|business|site)\s+["']([A-Z][a-zA-Z0-9\s&]+)["']/,
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return null;
}

// Generate sections based on business type and user description
function generateSections(message: string, businessType: string, sectionTypes: string[]): GeneratedSection[] {
  const sections: GeneratedSection[] = [];
  const businessName = extractBusinessName(message) || 'Your Business';
  const lower = message.toLowerCase();

  // Generate hero section
  let heroTitle = 'Welcome to ' + businessName;
  let heroSubtitle = 'Crafting exceptional experiences';
  let heroBio = 'We are dedicated to delivering excellence in everything we do.';

  if (businessType === 'restaurant') {
    heroTitle = businessName;
    heroSubtitle = 'Fine Dining Experience';
    heroBio = 'Experience the finest cuisine crafted with passion and the freshest ingredients. Join us for an unforgettable dining experience.';
  } else if (businessType === 'creative') {
    heroTitle = businessName;
    heroSubtitle = 'Creative Studio';
    heroBio = 'We bring ideas to life through thoughtful design and creative storytelling.';
  } else if (businessType === 'agency') {
    heroTitle = businessName;
    heroSubtitle = 'Digital Marketing Agency';
    heroBio = 'We help brands grow through data-driven marketing strategies and creative campaigns that deliver results.';
  } else if (businessType === 'tech') {
    heroTitle = businessName;
    heroSubtitle = 'Innovative Technology Solutions';
    heroBio = 'Building the future with cutting-edge technology and intuitive design that empowers businesses to thrive.';
  } else if (businessType === 'personal') {
    heroTitle = businessName;
    heroSubtitle = 'Creative Professional';
    heroBio = 'Passionate about creating meaningful work that inspires and connects with people.';
  } else if (businessType === 'fitness') {
    heroTitle = businessName;
    heroSubtitle = 'Transform Your Life';
    heroBio = 'Professional fitness training tailored to your goals. Start your journey to a healthier, stronger you.';
  } else if (businessType === 'legal') {
    heroTitle = businessName;
    heroSubtitle = 'Experienced Legal Counsel';
    heroBio = 'Providing trusted legal representation with a commitment to protecting your rights and achieving the best outcomes.';
  } else if (businessType === 'realestate') {
    heroTitle = businessName;
    heroSubtitle = 'Find Your Dream Home';
    heroBio = 'Your trusted partner in real estate. We help you find the perfect property that fits your lifestyle and budget.';
  }

  // Extract any specific description from user message
  const descriptionMatch = message.match(/(?:that|which|where)\s+(.{10,200}?)(?:\.|$)/);
  if (descriptionMatch) {
    heroBio = descriptionMatch[1].trim();
  }

  for (const type of sectionTypes) {
    switch (type) {
      case 'hero':
        sections.push({
          id: generateId(),
          visible: true,
          type: 'hero',
          name: businessName,
          title: heroSubtitle,
          subtitle: heroSubtitle,
          bio: heroBio,
          avatar: '',
          backgroundType: 'gradient',
          backgroundValue: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundOverlayOpacity: 0,
          avatarPosition: { x: 50, y: 30 },
          namePosition: { x: 50, y: 50 },
          titlePosition: { x: 50, y: 60 },
          subtitlePosition: { x: 50, y: 68 },
          bioPosition: { x: 50, y: 78 },
          ctaButtonsPosition: { x: 50, y: 88 },
          avatarSize: 'medium',
          showName: true, showTitle: true, showSubtitle: true, showBio: true, showAvatar: false, showScrollIndicator: true,
          ctaButtons: [
            { id: generateId(), label: 'Get Started', link: '#contact', variant: 'primary' },
            { id: generateId(), label: 'Learn More', link: '#about', variant: 'outline' },
          ],
          layout: 'free', snapEnabled: true, galleryImages: [],
        });
        break;

      case 'about':
        sections.push({
          id: generateId(), visible: true, type: 'about',
          title: 'About ' + businessName,
          tagline: 'Our Story',
          content: `${businessName} was founded with a simple mission: to deliver exceptional value to our clients. We believe in building lasting relationships through trust, quality, and dedication to excellence. Our team brings years of experience and a passion for what we do, ensuring every project exceeds expectations.`,
          secondParagraph: '', personalQuote: '', imageUrl: '', secondImageUrl: '', resumeUrl: '',
          imageShape: 'rounded', imageLayout: 'left', imageSize: 'medium', imageBorder: false, imageShadow: true,
          quickFacts: [], toolTags: [], location: '', availabilityStatus: '', ctaButtonText: '', ctaButtonLink: '',
          videoUrl: '', videoType: 'youtube', languages: [], showSocialLinks: false, galleryImages: [],
        });
        break;

      case 'services':
        const services = [];
        if (businessType === 'restaurant') {
          services.push(
            { id: generateId(), title: 'Dine-In', description: 'Enjoy a memorable dining experience in our elegant restaurant.', icon: 'Star' },
            { id: generateId(), title: 'Takeout & Delivery', description: 'Enjoy our delicious food in the comfort of your home.', icon: 'Rocket' },
            { id: generateId(), title: 'Private Events', description: 'Host your special occasions with customized menus and dedicated service.', icon: 'Lightbulb' },
          );
        } else if (businessType === 'agency') {
          services.push(
            { id: generateId(), title: 'Digital Marketing', description: 'Comprehensive marketing strategies that drive growth and engagement.', icon: 'Star' },
            { id: generateId(), title: 'Brand Strategy', description: 'Build a powerful brand identity that resonates with your audience.', icon: 'Lightbulb' },
            { id: generateId(), title: 'Web Design', description: 'Beautiful, functional websites that convert visitors into customers.', icon: 'PenTool' },
          );
        } else if (businessType === 'tech') {
          services.push(
            { id: generateId(), title: 'Product Development', description: 'From concept to launch, we build products users love.', icon: 'Lightbulb' },
            { id: generateId(), title: 'Cloud Solutions', description: 'Scalable, secure cloud infrastructure for modern businesses.', icon: 'Rocket' },
            { id: generateId(), title: 'Consulting', description: 'Expert technical guidance to help you make the right decisions.', icon: 'Star' },
          );
        } else if (businessType === 'fitness') {
          services.push(
            { id: generateId(), title: 'Personal Training', description: 'One-on-one sessions tailored to your fitness goals.', icon: 'Star' },
            { id: generateId(), title: 'Group Classes', description: 'Energetic group workouts that keep you motivated.', icon: 'Rocket' },
            { id: generateId(), title: 'Nutrition Planning', description: 'Customized nutrition plans to fuel your fitness journey.', icon: 'Lightbulb' },
          );
        } else {
          services.push(
            { id: generateId(), title: 'What We Do', description: 'We provide top-quality services tailored to your needs.', icon: 'Star' },
            { id: generateId(), title: 'Our Approach', description: 'A proven methodology that delivers consistent results.', icon: 'Lightbulb' },
            { id: generateId(), title: 'Why Choose Us', description: 'Experience, dedication, and a commitment to your success.', icon: 'Rocket' },
          );
        }
        sections.push({
          id: generateId(), visible: true, type: 'services',
          title: 'Our Services', subtitle: 'What we offer', services,
        });
        break;

      case 'projects':
        sections.push({
          id: generateId(), visible: true, type: 'projects',
          title: 'Our Work', categories: [], projects: [], layout: 'grid', columnCount: 3, aspectRatio: '4:3',
        });
        break;

      case 'testimonials':
        sections.push({
          id: generateId(), visible: true, type: 'testimonials',
          title: 'What Our Clients Say', testimonials: [], layout: 'grid',
        });
        break;

      case 'contact':
        sections.push({
          id: generateId(), visible: true, type: 'contact',
          title: 'Get In Touch', email: '', showForm: true,
        });
        break;

      case 'process':
        sections.push({
          id: generateId(), visible: true, type: 'process',
          title: 'How We Work', subtitle: 'Our proven process',
          steps: [
            { id: generateId(), number: '1', title: 'Discover', description: 'We start by understanding your needs and goals.' },
            { id: generateId(), number: '2', title: 'Plan', description: 'We create a detailed strategy and roadmap for success.' },
            { id: generateId(), number: '3', title: 'Execute', description: 'We bring the plan to life with precision and care.' },
            { id: generateId(), number: '4', title: 'Deliver', description: 'We deliver exceptional results that exceed expectations.' },
          ],
          layout: 'horizontal',
        });
        break;

      case 'stats':
        sections.push({
          id: generateId(), visible: true, type: 'stats',
          title: 'By The Numbers',
          stats: [
            { id: generateId(), value: 100, suffix: '+', label: 'Happy Clients' },
            { id: generateId(), value: 50, suffix: '+', label: 'Projects Completed' },
            { id: generateId(), value: 10, suffix: '+', label: 'Years Experience' },
            { id: generateId(), value: 98, suffix: '%', label: 'Satisfaction Rate' },
          ],
        });
        break;

      case 'awards':
        sections.push({ id: generateId(), visible: true, type: 'awards', title: 'Awards & Recognition', awards: [] });
        break;

      case 'faq':
        sections.push({
          id: generateId(), visible: true, type: 'faq',
          title: 'Frequently Asked Questions', subtitle: '', items: [], layout: 'accordion',
        });
        break;

      case 'blog':
        sections.push({ id: generateId(), visible: true, type: 'blog', title: 'Blog', subtitle: 'Latest insights and articles', posts: [], layout: 'grid' });
        break;

      case 'newsletter':
        sections.push({
          id: generateId(), visible: true, type: 'newsletter',
          title: 'Stay Updated', subtitle: 'Subscribe to our newsletter for the latest news and updates',
          placeholder: 'Enter your email', buttonText: 'Subscribe', provider: 'none', providerUrl: '',
          backgroundType: 'gradient', backgroundValue: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        });
        break;

      case 'skills':
        sections.push({ id: generateId(), visible: true, type: 'skills', title: 'Skills & Expertise', skills: [], displayStyle: 'bars' });
        break;

      case 'experience':
        sections.push({ id: generateId(), visible: true, type: 'experience', title: 'Our Experience', experiences: [], layout: 'left' });
        break;

      case 'ctaBanner':
        sections.push({
          id: generateId(), visible: true, type: 'ctaBanner',
          title: "Let's Work Together", subtitle: 'Have a project in mind? We\'d love to hear about it.',
          buttonText: 'Get In Touch', buttonLink: '#contact',
          backgroundType: 'gradient', backgroundValue: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        });
        break;

      case 'press':
        sections.push({ id: generateId(), visible: true, type: 'press', title: 'Featured In', subtitle: 'As seen on', items: [] });
        break;

      case 'certifications':
        sections.push({ id: generateId(), visible: true, type: 'certifications', title: 'Certifications', certifications: [] });
        break;

      case 'education':
        sections.push({ id: generateId(), visible: true, type: 'education', title: 'Education', educations: [] });
        break;

      case 'social':
        sections.push({ id: generateId(), visible: true, type: 'social', title: 'Connect With Us', links: [] });
        break;

      case 'footer':
        sections.push({
          id: generateId(), visible: true, type: 'footer',
          copyrightText: `© {year} ${businessName}. All rights reserved.`,
          showQuickLinks: true, showSocialIcons: true, showContactInfo: true, showBackToTop: true,
        });
        break;
    }
  }

  return sections;
}

// Generate AI-like conversational response
function generateChatResponse(message: string, isGenerating: boolean): string {
  const lower = message.toLowerCase();
  const businessName = extractBusinessName(message) || 'your business';

  if (isGenerating) {
    return `Great! I'll create a website for ${businessName}. Based on your description, I'm setting up the perfect layout, theme, and sections for your site. This will just take a moment...`;
  }

  // Initial greeting response
  if (/hello|hi|hey|start|begin/.test(lower) || message.length < 20) {
    return `Hello! I'm your AI website assistant. I can help you create a website in minutes. 

Just tell me about your business or website idea. For example:
- "I need a website for my restaurant called Bella Vista"
- "Create a portfolio site for a freelance photographer"
- "I want a website for my marketing agency"
- "Build a site for my fitness coaching business"

What kind of website would you like to create?`;
  }

  return `That sounds great! I can definitely help you build a website for that. Let me create it for you now with the right sections, theme, and content structure. You'll be able to customize everything afterward!`;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const { message, history } = body;

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Check if user is describing their website (enough detail to generate)
    const shouldGenerate = message.length > 15 || /restaurant|business|company|portfolio|agency|shop|store|studio|gym|fitness|law|legal|real estate|school|academy|photograph|design|app|software|saas|startup|freelance|consult/.test(message.toLowerCase());

    if (!shouldGenerate) {
      return NextResponse.json({
        type: 'chat',
        response: generateChatResponse(message, false),
      });
    }

    // Generate the website
    const { type, themeKey, sections: sectionTypes } = detectBusinessType(message);
    const theme = themePresets[themeKey] || themePresets.tech;
    const sections = generateSections(message, type, sectionTypes);
    const businessName = extractBusinessName(message) || 'Your Business';

    const generatedPortfolio: GeneratedPortfolio = {
      sections,
      theme: {
        ...theme,
        id: 'ai-generated',
        name: 'AI Generated',
      },
      navbar: {
        logo: businessName,
        ctaButtonText: 'Get Started',
        ctaButtonLink: '#contact',
      },
      aiSummary: `I've created a ${type} website for ${businessName} with ${sections.length} sections including ${sectionTypes.join(', ')}. The theme has been customized with a ${themeKey} color palette. You can now customize any section, change colors, add content, and make it truly yours!`,
    };

    return NextResponse.json({
      type: 'generate',
      response: generateChatResponse(message, true),
      portfolio: generatedPortfolio,
    });
  } catch (error) {
    console.error('Generate website error:', error);
    return NextResponse.json({ error: 'Failed to generate website' }, { status: 500 });
  }
}
