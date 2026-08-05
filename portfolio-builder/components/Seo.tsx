import Head from 'next/head';
import { useState, useEffect } from 'react';

interface SeoProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  canonical?: string; // Canonical URL
  /** Person data for JSON-LD structured data */
  personName?: string;
  jobTitle?: string;
  email?: string;
  socialLinks?: { platform: string; url: string }[];
  /** Analytics ID (GA4 measurement ID, e.g., G-XXXXXXXXXX) */
  ga4Id?: string;
}

export const Seo = ({ title, description, image, url, canonical, personName, jobTitle, email, socialLinks, ga4Id }: SeoProps) => {
  const defaultTitle = "Portfolio Builder";
  const defaultDescription = "Create stunning portfolios with ease";
  const [clientUrl, setClientUrl] = useState<string>('');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setClientUrl(window.location.href);
    }
  }, []);
  const defaultUrl = clientUrl;

  const seo = {
    title: title ?? defaultTitle,
    description: description ?? defaultDescription,
    image: image ?? '/og-image.png',
    url: url ?? defaultUrl,
    canonical: canonical ?? defaultUrl,
  };

  // Build JSON-LD structured data for Person schema
  const sameAs = socialLinks?.map(l => l.url).filter(Boolean) || [];
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: personName || seo.title,
    jobTitle: jobTitle,
    email: email ? `mailto:${email}` : undefined,
    url: seo.url,
    image: seo.image !== '/og-image.png' ? seo.image : undefined,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
  };

  // Website schema
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: seo.title,
    url: seo.url,
  };

  return (
    <Head>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      {/* Canonical URL */}
      <link rel="canonical" href={seo.canonical} />
      {/* Open Graph */}
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={seo.image} />
      <meta property="og:url" content={seo.url} />
      <meta property="og:type" content="website" />
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />
      {/* JSON-LD Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      {/* Google Analytics 4 */}
      {ga4Id && (
        <>
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${ga4Id}');
              `,
            }}
          />
        </>
      )}
    </Head>
  );
};
