/**
 * Generate a vCard (.vcf) file from contact information
 * and trigger a download in the browser.
 */
export function downloadVCard(data: {
  name: string;
  title?: string;
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
  organization?: string;
}) {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${data.name}`,
    data.title ? `TITLE:${data.title}` : '',
    data.organization ? `ORG:${data.organization}` : '',
    data.email ? `EMAIL;TYPE=INTERNET:${data.email}` : '',
    data.phone ? `TEL;TYPE=CELL:${data.phone}` : '',
    data.location ? `ADR;TYPE=HOME:;;${data.location};;;;` : '',
    data.website ? `URL:${data.website}` : '',
    'END:VCARD',
  ].filter(Boolean).join('\n');

  const blob = new Blob([lines], { type: 'text/vcard' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${data.name.replace(/\s+/g, '_')}.vcf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
