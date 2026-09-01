import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for merging Tailwind classes
/**
 * Merges Tailwind CSS class strings, handling conflicts.
 * @param inputs - List of class values (strings, objects, arrays) accepted by clsx.
 * @returns A merged class string.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(...inputs));
}

/**
 * Generates a short unique identifier.
 * Uses Math.random and base‑36 encoding. Note: not cryptographically secure.
 * @returns A random string of 9 characters.
 */
/**
 * Generates a short unique identifier.
 * Uses Math.random and base‑36 encoding. Note: not cryptographically secure.
 * @returns A random string of 9 characters.
 */
export function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}

/**
 * Formats a date string into a human‑readable format (e.g., "January 2024").
 * @param date - ISO date string or any parsable date.
 * @returns Formatted date string.
 */
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });
}

/**
 * Converts an image File to a Base64‑encoded data URL.
 * @param file - Image file to convert.
 * @returns Promise that resolves with the Base64 string.
 */
export function imageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Converts a video File to a URL that can be used as a video source.
 * Uses URL.createObjectURL() instead of base64 to avoid memory issues
 * with large video files. Base64 encoding a video creates a massive string
 * that can crash the browser. Object URLs are lightweight references to
 * the file blob in memory.
 * @param file - Video file to convert.
 * @returns Promise that resolves with the object URL string.
 */
export function videoToBase64(file: File): Promise<string> {
  return Promise.resolve(URL.createObjectURL(file));
}

/**
 * Triggers a download of the given content.
 * @param content - File content as a string.
 * @param filename - Desired filename for the download.
 * @param type - MIME type of the file (e.g., 'application/json').
 */
export function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports the given portfolio data as a JSON file and triggers a download.
 * @param portfolioData - The portfolio object to serialize.
 */
export function exportPortfolioAsJSON(portfolioData: object) {
  const content = JSON.stringify(portfolioData, null, 2);
  downloadFile(content, 'portfolio.json', 'application/json');
}

// Social media platform URLs
export const socialPlatformUrls: Record<string, string> = {
  linkedin: 'https://linkedin.com/in/',
  github: 'https://github.com/',
  twitter: 'https://twitter.com/',
  instagram: 'https://instagram.com/',
  dribbble: 'https://dribbble.com/',
  behance: 'https://behance.net/',
  website: '',
};

// Get social icon name
export function getSocialIcon(platform: string): string {
  const icons: Record<string, string> = {
    linkedin: 'Linkedin',
    github: 'Github',
    twitter: 'Twitter',
    instagram: 'Instagram',
    dribbble: 'Dribbble',
    behance: 'Figma',
    website: 'Globe',
  };
  return icons[platform] || 'Link';
}

/**
 * Validates an email address using a simple regex.
 * @param email - Email string to validate.
 * @returns True if the email appears valid, false otherwise.
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Checks whether a string is a valid URL.
 * @param url - URL string to validate.
 * @returns True if the URL can be parsed, false otherwise.
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Debounce function
/**
 * Creates a debounced version of a function that delays invoking until after wait milliseconds have elapsed since the last call.
 * @param func - Function to debounce.
 * @param wait - Delay in milliseconds.
 * @returns Debounced function with same parameters as the original.
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle function
/**
 * Creates a throttled version of a function that only allows execution once per limit milliseconds.
 * @param func - Function to throttle.
 * @param limit - Minimum time between calls in milliseconds.
 * @returns Throttled function with same parameters as the original.
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
