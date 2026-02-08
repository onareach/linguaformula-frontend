'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PasswordInput } from '@/app/components/PasswordInput';


function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) setError('Missing reset link. Use the link from your email or request a new one.');
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: newPassword }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setSuccess(true);
        setTimeout(() => router.replace('/sign-in'), 2000);
      } else {
        setError(data.error || 'Reset failed. The link may have expired. Request a new one.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto text-nav">
        <h1 className="text-2xl font-bold mb-6">password reset</h1>
        <p className="text-[#6b7c3d] font-medium">Your password has been updated. Redirecting to sign in…</p>
        <Link href="/sign-in" className="mt-4 inline-block text-sm text-nav-hover underline">sign in</Link>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="max-w-md mx-auto text-nav">
        <h1 className="text-2xl font-bold mb-6">reset password</h1>
        <p className="text-red-600 mb-4">{error}</p>
        <Link href="/forgot-password" className="text-nav-hover underline">request a new reset link</Link>
        <p className="mt-4">
          <Link href="/sign-in" className="text-sm text-nav-hover underline">back to sign in</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto text-nav">
      <h1 className="text-2xl font-bold mb-6">set new password</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <PasswordInput
          id="reset-new-password"
          label="new password (at least 8 characters)"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
        />
        <PasswordInput
          id="reset-confirm-password"
          label="confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
        />
        <div className="flex flex-col items-center gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-[35%] min-w-[8.5rem] py-2 px-4 bg-[#6b7c3d] hover:bg-[#7a8f4a] text-white rounded disabled:opacity-50 whitespace-nowrap"
          >
            {submitting ? 'updating…' : 'update password'}
          </button>
          <Link href="/sign-in" className="text-sm text-nav-hover underline">back to sign in</Link>
        </div>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto text-nav">loading…</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
