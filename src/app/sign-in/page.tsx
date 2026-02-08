'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { PasswordInput } from '@/app/components/PasswordInput';

function safeFrom(from: string | null): string {
  if (!from || !from.startsWith('/') || from.startsWith('//')) return '/';
  return from;
}

function SignInContent() {
  const searchParams = useSearchParams();
  const from = safeFrom(searchParams.get('from'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { login, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !error && !showSuccess) router.replace(from);
  }, [user, error, showSuccess, from, router]);

  useEffect(() => {
    if (!showSuccess) return;
    const t = setTimeout(() => router.replace(from), 1500);
    return () => clearTimeout(t);
  }, [showSuccess, from, router]);

  if (user && !error && !showSuccess) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { error: err } = await login(email, password);
      if (err) {
        setError(err);
        return;
      }
      setShowSuccess(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto text-nav relative">
      {showSuccess && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-24"
          role="status"
          aria-live="polite"
        >
          <div className="px-4 py-3 rounded shadow-lg bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-600">
            <p className="text-[#6b7c3d] font-medium">you have signed in successfully.</p>
          </div>
        </div>
      )}
      <h1 className="text-2xl font-bold mb-6">sign in</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-200"
          />
        </div>
        <PasswordInput
          id="password"
          label="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="off"
        />
        <div className="flex flex-col items-center">
          <p className="mb-2 text-sm">
            <Link href="/forgot-password" className="text-nav-hover underline" aria-label="Forgot password? Reset it via email.">forgot password?</Link>
          </p>
          <button
            type="submit"
            disabled={submitting}
            className="w-[35%] min-w-[8.5rem] py-2 px-4 bg-[#6b7c3d] hover:bg-[#7a8f4a] text-white rounded disabled:opacity-50 whitespace-nowrap"
          >
            {submitting ? 'signing in…' : 'sign in'}
          </button>
          <p className="mt-4 text-sm text-center">
            don&apos;t have an account? <Link href={`/register?from=${encodeURIComponent(from)}`} className="text-nav-hover underline">register</Link>
          </p>
        </div>
      </form>
    </div>
  );
}


export default function SignInPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto text-nav">loading…</div>}>
      <SignInContent />
    </Suspense>
  );
}
