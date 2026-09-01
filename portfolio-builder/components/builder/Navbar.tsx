'use client';

import React from 'react';
import { usePortfolioStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Menu, X, Sun, Moon, ArrowUpRight } from 'lucide-react';
import { FaLinkedin, FaGithub, FaTwitter, FaInstagram, FaDribbble, FaBehance } from 'react-icons/fa';
import { Globe } from 'lucide-react';
import { OptimizedImage } from './OptimizedImage';


const socialIconMap: Record<string, React.ElementType> = {
  linkedin: FaLinkedin,
  github: FaGithub,
  twitter: FaTwitter,
  instagram: FaInstagram,
  dribbble: FaDribbble,
  behance: FaBehance,
  website: Globe,
};

interface NavbarProps {
  theme: any;
  sections: { id: string; type: string; title?: string; name?: string; visible?: boolean }[];
}

export function Navbar({ theme, sections }: NavbarProps) {
  const { portfolio, toggleDarkMode } = usePortfolioStore();
  const { navbar, availability, darkMode } = portfolio;
  const navRef = React.useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [hidden, setHidden] = React.useState(false);
  const lastScrollY = React.useRef(0);

  React.useEffect(() => {
    // Find the scrollable parent container (the preview div with overflow-y-auto)
    const findScrollContainer = () => {
      let el = navRef.current?.parentElement;
      while (el) {
        const style = window.getComputedStyle(el);
        if ((style.overflowY === 'auto' || style.overflowY === 'scroll') && el.scrollHeight > el.clientHeight) {
          return el;
        }
        el = el.parentElement;
      }
      return window;
    };

    const scrollContainer = findScrollContainer();

    const handleScroll = () => {
      const currentScrollY = scrollContainer === window ? window.scrollY : (scrollContainer as HTMLElement).scrollTop;
      setScrolled(currentScrollY > 50);

      // Auto-hide: hide navbar when scrolling down past hero, show when scrolling up
      if (currentScrollY > 100 && currentScrollY > lastScrollY.current) {
        // Scrolling down - hide navbar
        setHidden(true);
        setMobileOpen(false);
      } else {
        // Scrolling up or near top - show navbar
        setHidden(false);
      }
      lastScrollY.current = currentScrollY;
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, []);

  if (!navbar.enabled) return null;

  // Build nav links from visible sections
  // Exclude hero from nav links — it's already represented by the logo
  const navLinks = sections
    .filter((s) => s.visible !== false && s.type !== 'footer' && s.type !== 'hero' && s.type !== 'about')
    .map((s) => ({
      id: s.id,
      label: s.title || s.type,
      type: s.type,
    }));

  // Determine if the hero background is light or dark to choose readable text color
  const heroSection = sections.find(s => s.type === 'hero') as any;
  const heroBgValue = heroSection?.backgroundValue || theme.colors.background;
  // Simple luminance check: if the hero background is light, use dark text; if dark, use white
  const isLightBackground = (bg: string): boolean => {
    if (!bg) return true;
    // Handle gradient: check the first color
    const colorMatch = bg.match(/#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i);
    if (colorMatch) {
      const r = parseInt(colorMatch[1], 16);
      const g = parseInt(colorMatch[2], 16);
      const b = parseInt(colorMatch[3], 16);
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance > 0.5;
    }
    // Named colors or other formats: default to light
    return true;
  };
  const heroIsLight = isLightBackground(heroBgValue);

  const isTransparent = navbar.transparentOnTop && !scrolled;
  const bgColor = isTransparent ? 'transparent' : theme.colors.background;
  const textColor = isTransparent ? (heroIsLight ? theme.colors.text : '#ffffff') : theme.colors.text;
  const borderColor = isTransparent ? 'transparent' : 'rgba(0,0,0,0.08)';

  const handleNavClick = (e: React.MouseEvent, sectionId: string) => {
    e.preventDefault();
    const el = document.getElementById(`section-${sectionId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setMobileOpen(false);
  };

  return (
    <>
      <nav
        ref={navRef}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-transform duration-300',
          navbar.sticky && 'sticky',
          scrolled && 'shadow-md backdrop-blur-md',
          hidden && '-translate-y-full'
        )}
        style={{
          backgroundColor: bgColor,
          borderBottom: `1px solid ${borderColor}`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              {navbar.logoType === 'image' && navbar.logo ? (
                <OptimizedImage src={navbar.logo} alt="Logo" className="h-8 w-auto" width={120} height={32} />

              ) : navbar.logo ? (
                <span
                  className="text-lg font-bold"
                  style={{ color: textColor, fontFamily: theme.typography.headingFont }}
                >
                  {navbar.logo}
                </span>
              ) : null}
              {/* Availability badge */}
              {availability.enabled && (
                <span
                  className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: `${availability.color}20`,
                    color: availability.color,
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: availability.color }}
                  />
                  {availability.text}
                </span>
              )}
            </div>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.slice(0, 6).map((link) => (
                <a
                  key={link.id}
                  href={`#section-${link.id}`}
                  onClick={(e) => handleNavClick(e, link.id)}
                  className="text-sm font-medium transition-colors hover:opacity-70"
                  style={{ color: textColor }}
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-3">
              {/* Dark mode toggle */}
              {darkMode.enabled && (
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-lg transition-colors hover:bg-black/5"
                  style={{ color: textColor }}
                  aria-label="Toggle dark mode"
                >
                  {darkMode.active ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
              )}

              {/* CTA Button */}
              {navbar.showCTAButton && (
                <a
                  href={navbar.ctaButtonLink}
                  onClick={(e) => {
                    if (navbar.ctaButtonLink.startsWith('#')) {
                      const sectionId = navbar.ctaButtonLink.replace('#', '');
                      const link = navLinks.find((l) => l.id === sectionId || l.type === sectionId);
                      if (link) handleNavClick(e, link.id);
                    }
                  }}
                  className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90"
                  style={{
                    backgroundColor: theme.colors.primary,
                    color: '#ffffff',
                    borderRadius: theme.borderRadius,
                  }}
                >
                  {navbar.ctaButtonText}
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-lg transition-colors"
                style={{ color: textColor }}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div
            className="md:hidden border-t"
            style={{ backgroundColor: theme.colors.background, borderColor: 'rgba(0,0,0,0.08)' }}
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.id}
                  href={`#section-${link.id}`}
                  onClick={(e) => handleNavClick(e, link.id)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-black/5"
                  style={{ color: theme.colors.text }}
                >
                  {link.label}
                </a>
              ))}
              {navbar.showCTAButton && (
                <a
                  href={navbar.ctaButtonLink}
                  onClick={(e) => {
                    const sectionId = navbar.ctaButtonLink.replace('#', '');
                    const link = navLinks.find((l) => l.id === sectionId || l.type === sectionId);
                    if (link) handleNavClick(e, link.id);
                  }}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-center mt-2"
                  style={{
                    backgroundColor: theme.colors.primary,
                    color: '#ffffff',
                    borderRadius: theme.borderRadius,
                  }}
                >
                  {navbar.ctaButtonText}
                </a>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
