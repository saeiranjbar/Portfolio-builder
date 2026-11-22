'use client';

import { Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Shown instead of the editor on small screens or in Mobile view. Editing needs a
// larger canvas; the published website is still viewable on any device.
export function EditOnDesktopNotice({
  canSwitchToDesktop,
  onSwitchToDesktop,
  onPreview,
}: {
  canSwitchToDesktop: boolean;
  onSwitchToDesktop: () => void;
  onPreview: () => void;
}) {
  return (
    <div
      role="alert"
      className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-lg">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <Monitor className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 className="text-lg font-semibold text-gray-900">Edit on a computer</h1>
        <p className="mt-2 text-sm text-gray-600">
          The website editor needs a larger screen. Open this page on a computer to make changes.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          {canSwitchToDesktop && (
            <Button onClick={onSwitchToDesktop} className="w-full">
              Switch to desktop view
            </Button>
          )}
          <Button variant="outline" onClick={onPreview} className="w-full">
            Preview website
          </Button>
        </div>
      </div>
    </div>
  );
}
