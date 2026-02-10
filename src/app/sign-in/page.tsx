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
  const [errorDetail, setErrorDetail] = useState('');
  const [showDetail, setShowDetail] = useState(false);
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
    setErrorDetail('');
    setShowDetail(false);
    setSubmitting(true);
    try {
      const { error: err, errorDetail: detail } = await login(email, password);
      if (err) {
        setError(err);
        if (detail) setErrorDetail(detail);
        return;
      }
      setShowSuccess(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto text-nav relative">
      {submitting && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/10 dark:bg-black/20"
          role="status"
          aria-live="polite"
          aria-label="Signing in"
        >
          <div className="px-5 py-4 rounded-lg shadow-lg bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-600 flex flex-col items-center gap-3">
            <div className="bouncing-dots" aria-hidden>
              <span /><span /><span />
            </div>
            <p className="text-sm text-gray-600 dark:text-zinc-400">Signing in…</p>
          </div>
        </div>
      )}
      {showSuccess && !submitting && (
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
        {error && (
          <div className="text-red-600 text-sm">
            <p>{error}</p>
            {errorDetail && (
              <>
                <button
                  type="button"
                  onClick={() => setShowDetail((d) => !d)}
                  className="mt-1 text-red-600/90 underline underline-offset-2 hover:no-underline focus:outline-none focus:ring-2 focus:ring-red-500/50 rounded"
                >
                  {showDetail ? 'Hide details' : 'Get more information'}
                </button>
                {showDetail && <p className="mt-1 text-xs text-red-600/80 font-mono break-all">{errorDetail}</p>}
              </>
            )}
          </div>
        )}
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
        <div className="flex flex-col items-center gap-4 mt-6">
          <button
            type="submit"
            disabled={submitting}
            className="w-[35%] min-w-[8.5rem] py-2 px-4 bg-[#6b7c3d] hover:bg-[#7a8f4a] text-white rounded disabled:opacity-50 whitespace-nowrap"
          >
            {submitting ? 'signing in…' : 'sign in'}
          </button>
          <p className="text-sm">
            <Link href="/forgot-password" className="text-nav-hover underline" aria-label="Forgot password? Reset it via email.">forgot password?</Link>
          </p>
          <p className="text-sm text-center">
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
