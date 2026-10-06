'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { loginErrorMessage } from '@/lib/login-errors';

type Mode = 'signin' | 'register' | 'reset';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  function changeMode(next: Mode) {
    setMode(next); setCodeSent(false); setCode(''); setPassword(''); setConfirmation(''); setError(''); setMessage('');
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading) return;
    setError(''); setMessage('');
    if (mode !== 'signin' && codeSent && password !== confirmation) { setError('The passwords do not match.'); return; }
    setLoading(true);
    try {
      if (mode === 'signin') {
        const result = await signIn('credentials', { email: email.trim(), password, redirect: false });
        if (!result?.ok || result.error) { setError(loginErrorMessage(result?.error)); return; }
        router.push('/'); router.refresh(); return;
      }
      const response = await fetch('/api/account', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: codeSent ? 'complete' : 'request-code', purpose: mode,
          email, ...(codeSent ? { code, password, ...(name.trim() ? { name } : {}) } : {}) }),
      });
      const body = await response.json();
      if (!response.ok) { setError(body.error || 'Unable to complete this request.'); return; }
      if (codeSent) { changeMode('signin'); setMessage('Your password is set. Sign in with your email and new password.'); }
      else { setCodeSent(true); setMessage(body.message); }
    } catch { setError('Unable to reach the account service. Please try again.'); }
    finally { setLoading(false); }
  };

  const title = mode === 'signin' ? 'Welcome back' : mode === 'register' ? 'Create an account' : 'Set or reset your password';
  return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-8">
    <div className="w-full max-w-md p-8 bg-white rounded-3xl shadow-xl">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-sm text-gray-500 mt-2">{mode === 'signin' ? 'Sign in to continue editing your saved websites.' : 'Verify your email to secure your account.'}</p>
      </div>
      {error && <p role="alert" className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-xl">{error}</p>}
      {message && <p role="status" className="mb-4 p-3 bg-blue-50 text-blue-800 text-sm rounded-xl">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div><Label htmlFor="email">Email</Label><Input id="email" type="email" autoComplete="email" value={email}
          onChange={event => setEmail(event.target.value)} required maxLength={254} readOnly={codeSent} /></div>
        {mode === 'register' && codeSent && <div><Label htmlFor="name">Name</Label><Input id="name" autoComplete="name"
          value={name} onChange={event => setName(event.target.value)} maxLength={100} required /></div>}
        {codeSent && <div><Label htmlFor="code">Email verification code</Label><Input id="code" autoComplete="one-time-code"
          inputMode="numeric" pattern="[0-9]{8}" minLength={8} maxLength={8} value={code}
          onChange={event => setCode(event.target.value.replace(/\D/g, '').slice(0, 8))} required />
          <p className="mt-1 text-xs text-gray-500">Enter the eight-digit code from your email. It expires in 15 minutes.</p></div>}
        {(mode === 'signin' || codeSent) && <div><Label htmlFor="password">{mode === 'signin' ? 'Password' : 'New password'}</Label>
          <Input id="password" type="password" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            value={password} onChange={event => setPassword(event.target.value)} required maxLength={128} minLength={mode === 'signin' ? undefined : 12} />
          {mode !== 'signin' && <p className="mt-1 text-xs text-gray-500">Use at least 12 characters.</p>}</div>}
        {codeSent && <div><Label htmlFor="confirmation">Confirm password</Label><Input id="confirmation" type="password"
          autoComplete="new-password" value={confirmation} onChange={event => setConfirmation(event.target.value)} required maxLength={128} /></div>}
        <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Please wait...'
          : mode === 'signin' ? 'Sign in' : codeSent ? 'Set password' : 'Send verification code'}</Button>
      </form>
      <div className="mt-5 flex flex-wrap justify-center gap-4 text-sm text-blue-700">
        {mode !== 'signin' && <button disabled={loading} onClick={() => changeMode('signin')}>Back to sign in</button>}
        {mode !== 'register' && <button disabled={loading} onClick={() => changeMode('register')}>Create an account</button>}
        {mode !== 'reset' && <button disabled={loading} onClick={() => changeMode('reset')}>Set or reset password</button>}
        {codeSent && <button disabled={loading} onClick={() => { setCodeSent(false); setCode(''); setMessage(''); }}>Request a new code</button>}
      </div>
      {mode === 'signin' && <p className="mt-5 text-xs text-gray-500 text-center">Used the earlier demo sign-in? Choose Set or reset password to secure your existing account and keep your saved websites.</p>}
    </div>
  </div>;
}
