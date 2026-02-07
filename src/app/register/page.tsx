'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { PasswordInput } from '@/app/components/PasswordInput';

function safeFrom(from: string | null): string {
  if (!from || !from.startsWith('/') || from.startsWith('//')) return '/';
  return from;
}

export default function RegisterPage() {
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
      setError('Password must be at least 8 characters');
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

  if (showSuccess) {
    return (
      <div className="max-w-md mx-auto">
        <p className="text-green-600 dark:text-green-400 font-medium">Your account has been created.</p>
        <p className="mt-2 text-gray-600 dark:text-zinc-400 text-sm">Taking you back…</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create an account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
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
          label="Password (at least 8 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
        />
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium mb-1">Display name (optional)</label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            autoComplete="name"
            className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-200"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50"
        >
          {submitting ? 'Creating account…' : 'Register'}
        </button>
      </form>
      <p className="mt-4 text-sm text-gray-600 dark:text-zinc-400">
        Already have an account? <Link href={`/sign-in?from=${encodeURIComponent(from)}`} className="text-blue-600 hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
