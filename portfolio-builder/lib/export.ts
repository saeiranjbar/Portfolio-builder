import { PortfolioData } from './types';

export function generateHTML(portfolio: PortfolioData): string {
  const { theme } = portfolio;
  
  const sectionsHTML = portfolio.sections
    .filter(section => section.visible !== false)
    .map(section => {
    switch (section.type) {

      case 'hero':
        return generateHeroSection(section, theme);
      case 'about':
        return generateAboutSection(section, theme);
      case 'projects':
        return generateProjectsSection(section, theme);
      case 'skills':
        return generateSkillsSection(section, theme);
      case 'experience':
        return generateExperienceSection(section, theme);
      case 'education':
        return generateEducationSection(section, theme);
      case 'testimonials':
        return generateTestimonialsSection(section, theme);
      case 'contact':
        return generateContactSection(section, theme);
      case 'social':
        return generateSocialSection(section, theme);
      case 'footer':
        return generateFooterSection(section, theme);
      case 'ctaBanner':
        return generateCTABannerSection(section, theme);
      case 'services':
        return generateServicesSection(section, theme);
      case 'process':
        return generateProcessSection(section, theme);
      case 'stats':
        return generateStatsSection(section, theme);
      case 'awards':
        return generateAwardsSection(section, theme);
      case 'press':
        return generatePressSection(section, theme);
      case 'certifications':
        return generateCertificationsSection(section, theme);
      case 'blog':
        return generateBlogSection(section, theme);
      case 'faq':
        return generateFAQSection(section, theme);
      case 'newsletter':
        return generateNewsletterSection(section, theme);
      default:
        return '';
    }
  }).join('\n');



  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${portfolio.metadata.title}</title>
  <meta name="description" content="${portfolio.metadata.description}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=${theme.typography.headingFont.replace(/ /g, '+')}:wght@400;500;600;700&family=${theme.typography.bodyFont.replace(/ /g, '+')}:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: '${theme.typography.bodyFont}', sans-serif;
      font-size: ${theme.typography.baseSize}px;
      line-height: 1.6;
      color: ${theme.colors.text};
      background-color: ${theme.colors.background};
    }
    h1, h2, h3, h4, h5, h6 {
      font-family: '${theme.typography.headingFont}', serif;
      font-weight: 700;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
    }
    section {
      padding: 80px 0;
    }
    img {
      max-width: 100%;
      height: auto;
    }
    a {
      color: ${theme.colors.primary};
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    .btn {
      display: inline-block;
      padding: 12px 24px;
      background-color: ${theme.colors.primary};
      color: white;
      border-radius: ${theme.borderRadius}px;
      border: none;
      cursor: pointer;
      font-weight: 500;
      transition: opacity 0.2s;
    }
    .btn:hover {
      opacity: 0.9;
      text-decoration: none;
    }
  </style>
</head>
<body>
${sectionsHTML}
</body>
</html>`;
}

function generateHeroSection(section: any, theme: any): string {
  const bgStyle = section.backgroundType === 'gradient' || section.backgroundType === 'color'
    ? `background: ${section.backgroundValue};`
    : section.backgroundType === 'image'
    ? `background-image: url('${section.backgroundValue}'); background-size: cover; background-position: center;`
    : '';

  return `
  <section style="${bgStyle} min-height: 60vh; display: flex; align-items: center; justify-content: center; padding: 80px 24px; text-align: center;">
    <div style="max-width: 800px;">
      ${section.avatar ? `<img src="${section.avatar}" alt="${section.name}" style="width: 150px; height: 150px; border-radius: 50%; object-fit: cover; margin-bottom: 24px; border: 4px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">` : ''}
      <h1 style="font-size: 3rem; margin-bottom: 8px; color: ${theme.colors.text};">${section.name}</h1>
      <h2 style="font-size: 1.5rem; font-weight: 500; margin-bottom: 16px; color: ${theme.colors.primary};">${section.title}</h2>
      <p style="font-size: 1.25rem; margin-bottom: 16px; color: ${theme.colors.textSecondary};">${section.subtitle}</p>
      <p style="max-width: 600px; margin: 0 auto;">${section.bio}</p>
    </div>
  </section>`;
}

function generateAboutSection(section: any, theme: any): string {
  const imageShapeClass = section.imageShape === 'circle' ? '50%' : section.imageShape === 'square' ? '0' : `${theme.borderRadius}px`;
  const imageLayout = section.imageLayout || 'left';
  const imageSize = section.imageSize || 'medium';
  const imageFlex = imageSize === 'small' ? '0 0 25%' : imageSize === 'large' ? '0 0 50%' : '0 0 33%';
  const imageShadow = section.imageShadow !== false ? `box-shadow: 0 4px 6px rgba(0,0,0,0.1);` : '';
  const imageBorder = section.imageBorder ? `border: 4px solid ${theme.colors.primary};` : '';

  const showImage = imageLayout !== 'none' && section.imageUrl;
  const isImageLeft = imageLayout === 'left' && showImage;
  const isImageRight = imageLayout === 'right' && showImage;
  const isImageTop = imageLayout === 'top' && showImage;
  const isFullWidth = imageLayout === 'fullwidth' && showImage;

  const imageHtml = showImage ? `<img src="${section.imageUrl}" alt="About" style="width: 100%; max-height: 400px; object-fit: cover; border-radius: ${imageShapeClass}; ${imageShadow} ${imageBorder}">` : '';

  // Quick facts
  const quickFactsHtml = (section.quickFacts || []).length > 0
    ? `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 16px; margin: 24px 0;">
        ${(section.quickFacts || []).map((f: any) => `<div style="text-align: center; padding: 12px; border-radius: ${theme.borderRadius}px; background-color: ${theme.colors.primary}10;">
          <div style="font-size: 1.5rem; font-weight: bold; color: ${theme.colors.primary};">${f.value}</div>
          <div style="font-size: 0.75rem; color: ${theme.colors.textSecondary}; margin-top: 4px;">${f.label}</div>
        </div>`).join('')}
      </div>`
    : '';

  // Tool tags
  const toolTagsHtml = (section.toolTags || []).length > 0
    ? `<div style="display: flex; flex-wrap: wrap; gap: 8px; margin: 16px 0;">
        ${(section.toolTags || []).map((tag: string) => `<span style="padding: 4px 12px; font-size: 0.875rem; border-radius: 999px; background-color: ${theme.colors.secondary}20; color: ${theme.colors.text};">${tag}</span>`).join('')}
      </div>`
    : '';

  // Location & availability
  const locAvailHtml = (section.location || section.availabilityStatus)
    ? `<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 16px; margin: 16px 0; font-size: 0.875rem;">
        ${section.location ? `<span style="color: ${theme.colors.textSecondary};">📍 ${section.location}</span>` : ''}
        ${section.availabilityStatus ? `<span style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 999px; font-size: 0.75rem; font-weight: 500; background-color: #10b98120; color: #10b981;">
          <span style="width: 8px; height: 8px; border-radius: 50%; background-color: #10b981; display: inline-block;"></span>${section.availabilityStatus}
        </span>` : ''}
      </div>`
    : '';

  // Languages
  const languagesHtml = (section.languages || []).length > 0
    ? `<div style="margin: 16px 0;">
        <h4 style="font-size: 0.875rem; font-weight: 600; margin-bottom: 8px; color: ${theme.colors.text};">Languages</h4>
        <div style="display: flex; flex-wrap: wrap; gap: 12px;">
          ${(section.languages || []).map((l: any) => `<span style="font-size: 0.875rem; color: ${theme.colors.textSecondary};"><strong style="color: ${theme.colors.text};">${l.language}</strong> (${l.proficiency})</span>`).join('')}
        </div>
      </div>`
    : '';

  // Personal quote
  const quoteHtml = section.personalQuote
    ? `<blockquote style="margin: 24px 0; padding: 16px 24px; border-left: 4px solid ${theme.colors.primary}; font-style: italic; font-size: 1.25rem; color: ${theme.colors.text}; background-color: ${theme.colors.primary}10;">"${section.personalQuote}"</blockquote>`
    : '';

  // Buttons
  const resumeBtnHtml = section.resumeUrl
    ? `<a href="${section.resumeUrl}" download style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: ${theme.borderRadius}px; background-color: ${theme.colors.primary}; color: white; font-weight: 500; text-decoration: none; margin-right: 12px;">⬇ Download Resume</a>`
    : '';
  const ctaBtnHtml = section.ctaButtonText && section.ctaButtonLink
    ? `<a href="${section.ctaButtonLink}" style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: ${theme.borderRadius}px; border: 2px solid ${theme.colors.primary}; color: ${theme.colors.primary}; font-weight: 500; text-decoration: none;">${section.ctaButtonText}</a>`
    : '';
  const buttonsHtml = (resumeBtnHtml || ctaBtnHtml) ? `<div style="display: flex; flex-wrap: wrap; gap: 12px; margin-top: 24px;">${resumeBtnHtml}${ctaBtnHtml}</div>` : '';


  // Video embed
  let videoHtml = '';
  if (section.videoUrl) {
    const embedUrl = section.videoType === 'vimeo'
      ? section.videoUrl.replace('vimeo.com/', 'player.vimeo.com/video/')
      : section.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/');
    videoHtml = `<div style="margin-top: 32px; border-radius: ${theme.borderRadius}px; overflow: hidden; position: relative; padding-bottom: 56.25%; height: 0;">
      <iframe src="${embedUrl}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
    </div>`;
  }

  // Second image
  const secondImageHtml = section.secondImageUrl
    ? `<div style="margin-top: 32px;"><img src="${section.secondImageUrl}" alt="Workspace" style="width: 100%; max-height: 300px; object-fit: cover; border-radius: ${theme.borderRadius}px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"></div>`
    : '';

  // Layout assembly
  const contentHtml = `
    <div style="flex: 1; min-width: 300px;">
      <p style="white-space: pre-wrap; color: ${theme.colors.text};">${section.content}</p>
      ${section.secondParagraph ? `<p style="white-space: pre-wrap; color: ${theme.colors.textSecondary}; margin-top: 16px;">${section.secondParagraph}</p>` : ''}
      ${quoteHtml}
      ${quickFactsHtml}
      ${toolTagsHtml}
      ${locAvailHtml}
      ${languagesHtml}
      ${buttonsHtml}
    </div>`;

  let layoutHtml = '';
  if (isFullWidth) {
    layoutHtml = `${imageHtml}${contentHtml}`;
  } else if (isImageTop) {
    layoutHtml = `<div style="text-align: center; margin-bottom: 32px;">${imageHtml}</div>${contentHtml}`;
  } else if (isImageLeft || isImageRight) {
    layoutHtml = `<div style="display: flex; flex-wrap: wrap; gap: 32px; align-items: flex-start;">
      ${isImageLeft ? `<div style="flex: ${imageFlex}; min-width: 250px;">${imageHtml}</div>` : ''}
      ${contentHtml}
      ${isImageRight ? `<div style="flex: ${imageFlex}; min-width: 250px;">${imageHtml}</div>` : ''}
    </div>`;
  } else {
    layoutHtml = contentHtml;
  }

  return `
  <section style="background-color: ${theme.colors.background}; padding: 80px 24px;">
    <div class="container" style="max-width: 800px; margin: 0 auto;">
      <h2 style="font-size: 2rem; text-align: center; margin-bottom: 16px; color: ${theme.colors.text};">${section.title}</h2>
      ${section.tagline ? `<p style="font-size: 1.125rem; text-align: center; margin-bottom: 32px; font-style: italic; color: ${theme.colors.textSecondary};">${section.tagline}</p>` : ''}
      ${layoutHtml}
      ${secondImageHtml}
      ${videoHtml}
    </div>
  </section>`;
}


function generateProjectsSection(section: any, theme: any): string {
  return `
  <section style="background-color: ${theme.colors.background}; padding: 80px 24px;">
    <div class="container">
      <h2 style="font-size: 2rem; text-align: center; margin-bottom: 32px; color: ${theme.colors.text};">${section.title}</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px;">
        ${section.projects.map((project: any) => `
          <div style="border: 1px solid ${theme.colors.primary}; border-radius: ${theme.borderRadius}px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            ${project.imageUrl ? `<img src="${project.imageUrl}" alt="${project.title}" style="width: 100%; height: 200px; object-fit: cover;">` : ''}
            <div style="padding: 16px;">
              <h3 style="font-size: 1.25rem; margin-bottom: 8px; color: ${theme.colors.text};">
                ${project.title}
                ${project.link ? `<a href="${project.link}" target="_blank" rel="noopener" style="margin-left: 8px;">↗</a>` : ''}
              </h3>
              <p style="font-size: 0.875rem; margin-bottom: 12px; color: ${theme.colors.textSecondary};">${project.description}</p>
              <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${project.tags.map((tag: string) => `<span style="font-size: 0.75rem; padding: 4px 8px; background-color: ${theme.colors.primary}; color: white; border-radius: 4px;">${tag}</span>`).join('')}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>`;
}

function generateSkillsSection(section: any, theme: any): string {
  const categories = [...new Set(section.skills.map((s: any) => s.category))];
  
  return `
  <section style="background-color: ${theme.colors.background}; padding: 80px 24px;">
    <div class="container" style="max-width: 800px;">
      <h2 style="font-size: 2rem; text-align: center; margin-bottom: 32px; color: ${theme.colors.text};">${section.title}</h2>
      ${categories.map(category => `
        <div style="margin-bottom: 32px;">
          <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 16px; color: ${theme.colors.primary};">${category}</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 16px;">
            ${section.skills.filter((s: any) => s.category === category).map((skill: any) => `
              <div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                  <span>${skill.name}</span>
                  <span style="color: ${theme.colors.textSecondary};">${skill.level}%</span>
                </div>
                <div style="height: 8px; background-color: #e5e7eb; border-radius: 9999px; overflow: hidden;">
                  <div style="height: 100%; width: ${skill.level}%; background-color: ${theme.colors.primary}; border-radius: 9999px;"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  </section>`;
}

function generateExperienceSection(section: any, theme: any): string {
  return `
  <section style="background-color: ${theme.colors.background}; padding: 80px 24px;">
    <div class="container" style="max-width: 800px;">
      <h2 style="font-size: 2rem; text-align: center; margin-bottom: 32px; color: ${theme.colors.text};">${section.title}</h2>
      <div style="position: relative;">
        ${section.experiences.map((exp: any) => `
          <div style="position: relative; padding-left: 24px; margin-bottom: 32px; border-left: 2px solid ${theme.colors.primary};">
            <div style="position: absolute; left: -8px; top: 0; width: 14px; height: 14px; border-radius: 50%; background-color: ${theme.colors.primary};"></div>
            <h3 style="font-size: 1.125rem; font-weight: 600; color: ${theme.colors.text};">${exp.position}</h3>
            <p style="color: ${theme.colors.primary}; margin-bottom: 4px;">${exp.company}</p>
            <p style="font-size: 0.875rem; color: ${theme.colors.textSecondary}; margin-bottom: 8px;">${exp.startDate} - ${exp.endDate || 'Present'}${exp.location ? ` • ${exp.location}` : ''}</p>
            <p>${exp.description}</p>
          </div>
        `).join('')}
      </div>
    </div>
  </section>`;
}

function generateEducationSection(section: any, theme: any): string {
  return `
  <section style="background-color: ${theme.colors.background}; padding: 80px 24px;">
    <div class="container" style="max-width: 800px;">
      <h2 style="font-size: 2rem; text-align: center; margin-bottom: 32px; color: ${theme.colors.text};">${section.title}</h2>
      <div style="display: flex; flex-direction: column; gap: 24px;">
        ${section.educations.map((edu: any) => `
          <div style="padding: 16px; border: 1px solid ${theme.colors.primary}; border-radius: ${theme.borderRadius}px;">
            <h3 style="font-size: 1.125rem; font-weight: 600; color: ${theme.colors.text};">${edu.degree} in ${edu.field}</h3>
            <p style="color: ${theme.colors.primary};">${edu.institution}</p>
            <p style="font-size: 0.875rem; color: ${theme.colors.textSecondary};">${edu.startDate} - ${edu.endDate}</p>
            ${edu.description ? `<p style="margin-top: 8px;">${edu.description}</p>` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  </section>`;
}

function generateTestimonialsSection(section: any, theme: any): string {
  return `
  <section style="background-color: ${theme.colors.background}; padding: 80px 24px;">
    <div class="container">
      <h2 style="font-size: 2rem; text-align: center; margin-bottom: 32px; color: ${theme.colors.text};">${section.title}</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px;">
        ${section.testimonials.map((t: any) => `
          <div style="padding: 24px; background: white; border-radius: ${theme.borderRadius}px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <p style="font-style: italic; margin-bottom: 16px;">"${t.content}"</p>
            <div style="display: flex; align-items: center; gap: 12px;">
              ${t.avatar ? `<img src="${t.avatar}" alt="${t.name}" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover;">` : ''}
              <div>
                <p style="font-weight: 600; color: ${theme.colors.text};">${t.name}</p>
                <p style="font-size: 0.875rem; color: ${theme.colors.textSecondary};">${t.role} at ${t.company}</p>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>`;
}

function generateContactSection(section: any, theme: any): string {
  return `
  <section style="background-color: ${theme.colors.background}; padding: 80px 24px;">
    <div style="max-width: 600px; margin: 0 auto; text-align: center;">
      <h2 style="font-size: 2rem; margin-bottom: 32px; color: ${theme.colors.text};">${section.title}</h2>
      <div style="margin-bottom: 32px;">
        ${section.email ? `<a href="mailto:${section.email}" style="display: inline-flex; align-items: center; gap: 8px; margin: 8px;">📧 ${section.email}</a>` : ''}
        ${section.phone ? `<a href="tel:${section.phone}" style="display: inline-flex; align-items: center; gap: 8px; margin: 8px;">📞 ${section.phone}</a>` : ''}
        ${section.location ? `<span style="display: inline-flex; align-items: center; gap: 8px; margin: 8px;">📍 ${section.location}</span>` : ''}
      </div>
      ${section.showForm ? `
        <form style="text-align: left;">
          <input type="text" placeholder="Your Name" style="width: 100%; padding: 12px; margin-bottom: 16px; border: 1px solid ${theme.colors.primary}; border-radius: ${theme.borderRadius}px;">
          <input type="email" placeholder="Your Email" style="width: 100%; padding: 12px; margin-bottom: 16px; border: 1px solid ${theme.colors.primary}; border-radius: ${theme.borderRadius}px;">
          <textarea placeholder="Your Message" rows="4" style="width: 100%; padding: 12px; margin-bottom: 16px; border: 1px solid ${theme.colors.primary}; border-radius: ${theme.borderRadius}px; resize: vertical;"></textarea>
          <button type="submit" class="btn" style="width: 100%;">Send Message</button>
        </form>
      ` : ''}
    </div>
  </section>`;
}

function generateSocialSection(section: any, theme: any): string {
  const socialIcons: Record<string, string> = {
    linkedin: 'LinkedIn',
    github: 'GitHub',
    twitter: 'Twitter',
    instagram: 'Instagram',
    dribbble: 'Dribbble',
    behance: 'Behance',
    website: 'Website',
  };

  return `
  <section style="background-color: ${theme.colors.background}; padding: 80px 24px;">
    <div style="max-width: 800px; margin: 0 auto; text-align: center;">
      <h2 style="font-size: 2rem; margin-bottom: 32px; color: ${theme.colors.text};">${section.title}</h2>
      <div style="display: flex; justify-content: center; flex-wrap: wrap; gap: 16px;">
        ${section.links.map((link: any) => `
          <a href="${link.url}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; background-color: ${theme.colors.primary}; color: white; border-radius: 50%; transition: transform 0.2s;">
            ${socialIcons[link.platform] || link.platform}
          </a>
        `).join('')}
      </div>
    </div>
  </section>`;
}

function generateFooterSection(section: any, theme: any): string {
  const year = new Date().getFullYear();
  const copyright = (section.copyrightText || '© {year}').replace('{year}', String(year));
  return `
  <footer style="background-color: ${theme.colors.text}; color: white; padding: 48px 24px;">
    <div class="container">
      <p style="text-align: center; opacity: 0.6; font-size: 0.875rem;">${copyright}</p>
    </div>
  </footer>`;
}

function generateCTABannerSection(section: any, theme: any): string {
  const bgStyle = section.backgroundType === 'gradient' || section.backgroundType === 'color'
    ? `background: ${section.backgroundValue};`
    : section.backgroundType === 'image'
    ? `background-image: url('${section.backgroundValue}'); background-size: cover; background-position: center;`
    : '';
  return `
  <section style="${bgStyle} padding: 80px 24px; text-align: center;">
    <div style="max-width: 600px; margin: 0 auto;">
      <h2 style="font-size: 2.5rem; color: white; margin-bottom: 16px;">${section.title}</h2>
      <p style="font-size: 1.25rem; color: rgba(255,255,255,0.9); margin-bottom: 32px;">${section.subtitle}</p>
      <a href="${section.buttonLink}" class="btn" style="background-color: ${theme.colors.primary};">${section.buttonText} →</a>
    </div>
  </section>`;
}

function generateServicesSection(section: any, theme: any): string {
  return `
  <section style="background-color: ${theme.colors.background}; padding: 80px 24px;">
    <div class="container">
      <h2 style="font-size: 2rem; text-align: center; margin-bottom: 16px; color: ${theme.colors.text};">${section.title}</h2>
      ${section.subtitle ? `<p style="text-align: center; margin-bottom: 32px; color: ${theme.colors.textSecondary};">${section.subtitle}</p>` : ''}
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px;">
        ${section.services.map((service: any) => `
          <div style="padding: 24px; border: 1px solid ${theme.colors.primary}33; border-radius: ${theme.borderRadius}px; text-align: center;">
            <h3 style="font-size: 1.25rem; margin-bottom: 8px; color: ${theme.colors.text};">${service.title}</h3>
            <p style="font-size: 0.875rem; color: ${theme.colors.textSecondary};">${service.description}</p>
          </div>
        `).join('')}
      </div>
    </div>
  </section>`;
}

function generateProcessSection(section: any, theme: any): string {
  return `
  <section style="background-color: ${theme.colors.background}; padding: 80px 24px;">
    <div class="container">
      <h2 style="font-size: 2rem; text-align: center; margin-bottom: 16px; color: ${theme.colors.text};">${section.title}</h2>
      ${section.subtitle ? `<p style="text-align: center; margin-bottom: 32px; color: ${theme.colors.textSecondary};">${section.subtitle}</p>` : ''}
      <div style="display: flex; flex-wrap: wrap; gap: 32px; justify-content: center;">
        ${section.steps.map((step: any) => `
          <div style="flex: 1; min-width: 200px; text-align: center;">
            <div style="width: 48px; height: 48px; border-radius: 50%; background-color: ${theme.colors.primary}; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; margin: 0 auto 16px;">${step.number}</div>
            <h3 style="font-size: 1.125rem; margin-bottom: 8px; color: ${theme.colors.text};">${step.title}</h3>
            <p style="font-size: 0.875rem; color: ${theme.colors.textSecondary};">${step.description}</p>
          </div>
        `).join('')}
      </div>
    </div>
  </section>`;
}

function generateStatsSection(section: any, theme: any): string {
  return `
  <section style="background-color: ${theme.colors.primary}; padding: 80px 24px;">
    <div class="container">
      <h2 style="font-size: 2rem; text-align: center; color: white; margin-bottom: 40px;">${section.title}</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 32px; text-align: center;">
        ${section.stats.map((stat: any) => `
          <div>
            <div style="font-size: 3rem; font-weight: bold; color: white; margin-bottom: 8px;">${stat.value}${stat.suffix || ''}</div>
            <p style="font-size: 0.875rem; color: rgba(255,255,255,0.8);">${stat.label}</p>
          </div>
        `).join('')}
      </div>
    </div>
  </section>`;
}

function generateAwardsSection(section: any, theme: any): string {
  return `
  <section style="background-color: ${theme.colors.background}; padding: 80px 24px;">
    <div class="container" style="max-width: 800px;">
      <h2 style="font-size: 2rem; text-align: center; margin-bottom: 32px; color: ${theme.colors.text};">${section.title}</h2>
      <div style="display: flex; flex-direction: column; gap: 16px;">
        ${section.awards.map((award: any) => `
          <div style="display: flex; align-items: center; gap: 16px; padding: 16px; border: 1px solid ${theme.colors.primary}33; border-radius: ${theme.borderRadius}px;">
            <div style="flex: 1;">
              <div style="display: flex; justify-content: space-between;">
                <h3 style="font-weight: 600; color: ${theme.colors.text};">${award.title}</h3>
                <span style="font-size: 0.875rem; color: ${theme.colors.textSecondary};">${award.year}</span>
              </div>
              <p style="font-size: 0.875rem; color: ${theme.colors.primary};">${award.organization}</p>
              ${award.description ? `<p style="font-size: 0.875rem; color: ${theme.colors.textSecondary}; margin-top: 4px;">${award.description}</p>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>`;
}

function generatePressSection(section: any, theme: any): string {
  return `
  <section style="background-color: ${theme.colors.background}; padding: 80px 24px;">
    <div class="container" style="text-align: center;">
      <h2 style="font-size: 2rem; margin-bottom: 8px; color: ${theme.colors.text};">${section.title}</h2>
      ${section.subtitle ? `<p style="margin-bottom: 40px; color: ${theme.colors.textSecondary};">${section.subtitle}</p>` : ''}
      <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 32px; align-items: center;">
        ${section.items.map((item: any) => `
          ${item.link ? `<a href="${item.link}" target="_blank" rel="noopener noreferrer" style="opacity: 0.6;">` : '<div style="opacity: 0.6;">'}
            ${item.logo ? `<img src="${item.logo}" alt="${item.name}" style="height: 48px;">` : `<span style="font-size: 1.25rem; font-weight: bold; color: ${theme.colors.text};">${item.name}</span>`}
          ${item.link ? '</a>' : '</div>'}
        `).join('')}
      </div>
    </div>
  </section>`;
}

function generateCertificationsSection(section: any, theme: any): string {
  return `
  <section style="background-color: ${theme.colors.background}; padding: 80px 24px;">
    <div class="container" style="max-width: 800px;">
      <h2 style="font-size: 2rem; text-align: center; margin-bottom: 32px; color: ${theme.colors.text};">${section.title}</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px;">
        ${section.certifications.map((cert: any) => `
          <div style="display: flex; align-items: center; gap: 16px; padding: 16px; border: 1px solid ${theme.colors.primary}33; border-radius: ${theme.borderRadius}px;">
            <div style="flex: 1;">
              <h3 style="font-weight: 600; color: ${theme.colors.text};">${cert.name}</h3>
              <p style="font-size: 0.875rem; color: ${theme.colors.primary};">${cert.issuer}</p>
              <p style="font-size: 0.75rem; color: ${theme.colors.textSecondary};">${cert.date}</p>
            </div>
            ${cert.url ? `<a href="${cert.url}" target="_blank" rel="noopener noreferrer">↗</a>` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  </section>`;
}

function generateBlogSection(section: any, theme: any): string {
  const layout = section.layout || 'grid';
  const postsHtml = (section.posts || []).map((post: any) => {
    const dateStr = post.date ? new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '';
    const meta = [dateStr, post.readTime].filter(Boolean).join(' • ');
    const tagsHtml = (post.tags || []).map((tag: string) => `<span style="font-size: 0.75rem; padding: 2px 8px; border-radius: 999px; background-color: ${theme.colors.primary}15; color: ${theme.colors.primary};">${tag}</span>`).join(' ');
    const linkHtml = post.link ? `<a href="${post.link}" target="_blank" rel="noopener noreferrer" style="color: ${theme.colors.primary}; font-size: 0.875rem;">Read more →</a>` : '';

    if (layout === 'list') {
      return `<div style="display: flex; gap: 24px; padding: 16px; border: 1px solid ${theme.colors.primary}20; border-radius: ${theme.borderRadius}px; margin-bottom: 16px;">
        ${post.imageUrl ? `<img src="${post.imageUrl}" alt="${post.title}" style="width: 128px; height: 128px; object-fit: cover; border-radius: ${theme.borderRadius}px; flex-shrink: 0;">` : ''}
        <div style="flex: 1;">
          ${meta ? `<p style="font-size: 0.75rem; color: ${theme.colors.textSecondary}; margin-bottom: 4px;">${meta}</p>` : ''}
          <h3 style="font-size: 1.125rem; margin-bottom: 8px; color: ${theme.colors.text};">${post.title}</h3>
          <p style="font-size: 0.875rem; color: ${theme.colors.textSecondary}; margin-bottom: 8px;">${post.excerpt}</p>
          ${tagsHtml ? `<div style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 8px;">${tagsHtml}</div>` : ''}
          ${linkHtml}
        </div>
      </div>`;
    }

    return `<div style="border: 1px solid ${theme.colors.primary}20; border-radius: ${theme.borderRadius}px; overflow: hidden;">
      ${post.imageUrl ? `<img src="${post.imageUrl}" alt="${post.title}" style="width: 100%; height: 192px; object-fit: cover;">` : ''}
      <div style="padding: 20px;">
        ${meta ? `<p style="font-size: 0.75rem; color: ${theme.colors.textSecondary}; margin-bottom: 8px;">${meta}</p>` : ''}
        <h3 style="font-size: 1.125rem; margin-bottom: 8px; color: ${theme.colors.text};">${post.title}</h3>
        <p style="font-size: 0.875rem; color: ${theme.colors.textSecondary}; margin-bottom: 8px;">${post.excerpt}</p>
        ${tagsHtml ? `<div style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 8px;">${tagsHtml}</div>` : ''}
        ${linkHtml}
      </div>
    </div>`;
  }).join('');

  return `
  <section style="background-color: ${theme.colors.background}; padding: 80px 24px;">
    <div class="container">
      <h2 style="font-size: 2rem; text-align: center; margin-bottom: 8px; color: ${theme.colors.text};">${section.title}</h2>
      ${section.subtitle ? `<p style="text-align: center; margin-bottom: 32px; color: ${theme.colors.textSecondary};">${section.subtitle}</p>` : ''}
      ${layout === 'list' ? `<div style="max-width: 720px; margin: 0 auto;">${postsHtml}</div>` : `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px;">${postsHtml}</div>`}
    </div>
  </section>`;
}

function generateFAQSection(section: any, theme: any): string {
  const layout = section.layout || 'accordion';
  const itemsHtml = (section.items || []).map((item: any) => {
    if (layout === 'grid') {
      return `<div style="padding: 20px; border: 1px solid ${theme.colors.primary}20; border-radius: ${theme.borderRadius}px;">
        <h3 style="font-size: 1rem; font-weight: 600; margin-bottom: 8px; color: ${theme.colors.text};">❓ ${item.question}</h3>
        <p style="font-size: 0.875rem; color: ${theme.colors.textSecondary};">${item.answer}</p>
      </div>`;
    }
    return `<details style="border: 1px solid ${theme.colors.primary}20; border-radius: ${theme.borderRadius}px; margin-bottom: 12px;">
      <summary style="padding: 16px; font-weight: 500; cursor: pointer; color: ${theme.colors.text};">${item.question}</summary>
      <div style="padding: 0 16px 16px; font-size: 0.875rem; color: ${theme.colors.textSecondary};">${item.answer}</div>
    </details>`;
  }).join('');

  return `
  <section style="background-color: ${theme.colors.background}; padding: 80px 24px;">
    <div class="container" style="max-width: 720px;">
      <h2 style="font-size: 2rem; text-align: center; margin-bottom: 8px; color: ${theme.colors.text};">${section.title}</h2>
      ${section.subtitle ? `<p style="text-align: center; margin-bottom: 32px; color: ${theme.colors.textSecondary};">${section.subtitle}</p>` : ''}
      ${layout === 'grid' ? `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px;">${itemsHtml}</div>` : `<div>${itemsHtml}</div>`}
    </div>
  </section>`;
}

function generateNewsletterSection(section: any, theme: any): string {
  const bgStyle = section.backgroundType === 'gradient' || section.backgroundType === 'color'
    ? `background: ${section.backgroundValue};`
    : section.backgroundType === 'image'
    ? `background-image: url('${section.backgroundValue}'); background-size: cover; background-position: center;`
    : '';
  const formAction = section.providerUrl ? ` action="${section.providerUrl}" method="post"` : '';

  return `
  <section style="${bgStyle} padding: 80px 24px; text-align: center;">
    <div style="max-width: 480px; margin: 0 auto;">
      <h2 style="font-size: 2rem; color: white; margin-bottom: 8px;">${section.title}</h2>
      ${section.subtitle ? `<p style="font-size: 1.125rem; color: rgba(255,255,255,0.9); margin-bottom: 24px;">${section.subtitle}</p>` : ''}
      <form${formAction} style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: center;">
        <input type="email" name="email" placeholder="${section.placeholder || 'Enter your email'}" required style="flex: 1; min-width: 200px; padding: 12px 16px; border: none; border-radius: ${theme.borderRadius}px; font-size: 1rem;">
        <button type="submit" class="btn" style="background-color: ${theme.colors.primary}; white-space: nowrap;">${section.buttonText}</button>
      </form>
    </div>
  </section>`;
}

export function downloadHTML(portfolio: PortfolioData) {


  const html = generateHTML(portfolio);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'portfolio.html';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadJSON(portfolio: PortfolioData) {
  const json = JSON.stringify(portfolio, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'portfolio.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}