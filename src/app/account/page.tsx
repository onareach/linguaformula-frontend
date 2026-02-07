'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AccountPage() {
  const { user, loading, logout, updateProfile } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [submittingProfile, setSubmittingProfile] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/sign-in');
  }, [loading, user, router]);

  useEffect(() => {
    if (user) {
      setEmail(user.email);
      setDisplayName(user.display_name || '');
    }
  }, [user]);

  if (loading || !user) {
    return <div className="max-w-md mx-auto">Loading…</div>;
  }

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setSubmittingProfile(true);
    const { error } = await updateProfile({ email, display_name: displayName });
    setSubmittingProfile(false);
    if (error) setProfileError(error);
    else setProfileSuccess('Profile updated.');
  }

  async function handleLogout() {
    await logout();
    router.push('/');
  }

  return (
    <div className="max-w-md mx-auto space-y-8">
      <h1 className="text-2xl font-bold">Account</h1>

      <section>
        <h2 className="text-lg font-semibold mb-3">Profile</h2>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          {profileError && <p className="text-red-600 text-sm">{profileError}</p>}
          {profileSuccess && <p className="text-green-600 text-sm">{profileSuccess}</p>}
          <div>
            <label htmlFor="account-email" className="block text-sm font-medium mb-1">Email</label>
            <input
              id="account-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-200"
            />
          </div>
          <div>
            <label htmlFor="account-displayName" className="block text-sm font-medium mb-1">Display name</label>
            <input
              id="account-displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-200"
            />
          </div>
          <button
            type="submit"
            disabled={submittingProfile}
            className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50"
          >
            {submittingProfile ? 'Saving…' : 'Save profile'}
          </button>
        </form>
      </section>

      <section>
        <button
          type="button"
          onClick={handleLogout}
          className="py-2 px-4 border border-gray-300 dark:border-zinc-600 rounded hover:bg-gray-100 dark:hover:bg-zinc-800"
        >
          Sign out
        </button>
      </section>
    </div>
  );
}
