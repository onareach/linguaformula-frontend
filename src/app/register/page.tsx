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

function RegisterContent() {
  const searchParams = useSearchParams();
  const from = safeFrom(searchParams.get('from'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { register, user } = useAuth();
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
    if (password.length < 8) {
      setError('password must be at least 8 characters');
      return;
    }
    setSubmitting(true);
    try {
      const { error: err } = await register(email, password, displayName || undefined);
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
            <p className="text-[#6b7c3d] font-medium">your account has been created.</p>
            <p className="mt-1 text-sm text-gray-600 dark:text-zinc-400">taking you back…</p>
          </div>
        </div>
      )}
      <h1 className="text-2xl font-bold mb-6">create an account</h1>
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
          label="password (at least 8 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
        />
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium mb-1">display name (optional)</label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            autoComplete="name"
            className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-200"
          />
        </div>
        <div className="flex flex-col items-center">
          <button
            type="submit"
            disabled={submitting}
            className="w-[35%] min-w-[10rem] py-2 px-4 bg-[#6b7c3d] hover:bg-[#7a8f4a] text-white rounded disabled:opacity-50 whitespace-nowrap"
          >
            {submitting ? 'creating account…' : 'register'}
          </button>
          <p className="mt-4 text-sm text-center">
            already have an account? <Link href={`/sign-in?from=${encodeURIComponent(from)}`} className="text-nav-hover underline">sign in</Link>
          </p>
        </div>
      </form>
    </div>
  );
}


export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto text-nav">loading…</div>}>
      <RegisterContent />
    </Suspense>
  );
}
