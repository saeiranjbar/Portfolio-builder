'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { LogIn, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

export function AccountControls({ dark = false }: { dark?: boolean }) {
  const { data: session, status } = useSession();
  const [signingOut, setSigningOut] = useState(false);
  const buttonClass = cn(
    'inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:opacity-50',
    dark
      ? 'border-white/20 bg-white/10 text-white hover:bg-white/20'
      : 'border-gray-200 bg-white text-gray-900 hover:bg-gray-50',
  );

  if (status !== 'authenticated' || !session?.user?.email) {
    return (
      <Link href="/login" className={buttonClass}>
        <LogIn className="h-4 w-4" aria-hidden="true" />
        Sign in
      </Link>
    );
  }

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut({ redirect: false });
    } catch {
      toast.error('Unable to sign out. Please try again.');
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <span
        className={cn('max-w-40 truncate text-sm', dark ? 'text-white/80' : 'text-gray-600')}
        title={session.user?.email ?? undefined}
      >
        {session.user?.name || session.user?.email || 'Signed in'}
      </span>
      <button
        type="button"
        className={buttonClass}
        disabled={signingOut}
        onClick={handleSignOut}
      >
        <LogOut className="h-4 w-4" aria-hidden="true" />
        {signingOut ? 'Signing out…' : 'Sign out'}
      </button>
    </div>
  );
}
