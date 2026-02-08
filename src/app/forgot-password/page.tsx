'use client';

import { useState } from 'react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || '';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setMessage(data.message || "If an account exists with that email, we've sent a reset link.");
        setEmail('');
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto text-nav">
      <h1 className="text-2xl font-bold mb-6">forgot password</h1>
      <p className="mb-4 text-sm text-gray-600 dark:text-zinc-400">
        Enter your email and we&apos;ll send you a link to set a new password.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-600 text-sm">{error}</p>}
        {message && <p className="text-[#6b7c3d] text-sm">{message}</p>}
        <div>
          <label htmlFor="forgot-email" className="block text-sm font-medium mb-1">email</label>
          <input
            id="forgot-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-200"
          />
        </div>
        <div className="flex flex-col items-center gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-[35%] min-w-[8.5rem] py-2 px-4 bg-[#6b7c3d] hover:bg-[#7a8f4a] text-white rounded disabled:opacity-50 whitespace-nowrap"
          >
            {submitting ? 'sending…' : 'send reset link'}
          </button>
          <Link href="/sign-in" className="text-sm text-nav-hover underline">back to sign in</Link>
        </div>
      </form>
    </div>
  );
}
