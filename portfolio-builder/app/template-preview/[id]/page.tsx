import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { templates } from '@/lib/templates';
import { TemplatePreviewClient } from './TemplatePreviewClient';

// Public, read-only demo of a template. It needs no account and no database:
// the page is built from the template data alone and rendered by the same
// read-only renderer as a published site. Also used for template screenshots.
type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return templates.map(template => ({ id: template.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const template = templates.find(item => item.id === id);
  return template
    ? { title: `${template.name} template preview`, description: template.description, robots: { index: false, follow: false } }
    : {};
}

export default async function TemplatePreviewPage({ params }: Props) {
  const { id } = await params;
  if (!templates.some(item => item.id === id)) notFound();
  return <TemplatePreviewClient templateId={id} />;
}
