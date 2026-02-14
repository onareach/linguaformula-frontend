'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useAccessibility } from '@/context/AccessibilityContext';
import { PasswordInput } from '@/app/components/PasswordInput';

export default function AccountPage() {
  const { user, loading, updateProfile } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [submittingProfile, setSubmittingProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [submittingPassword, setSubmittingPassword] = useState(false);
  const { highContrast, setHighContrast } = useAccessibility();
  const [showInfoPopover, setShowInfoPopover] = useState(false);

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
    return <div className="p-4 max-w-2xl text-nav">loading…</div>;
  }

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setSubmittingProfile(true);
    const { error } = await updateProfile({ email, display_name: displayName });
    setSubmittingProfile(false);
    if (error) setProfileError(error);
    else setProfileSuccess('profile updated.');
  }

  async function handleChangePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }
    setSubmittingPassword(true);
    const { error } = await updateProfile({ current_password: currentPassword, new_password: newPassword });
    setSubmittingPassword(false);
    if (error) setPasswordError(error);
    else {
      setPasswordSuccess('password updated.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowChangePassword(false);
    }
  }

  return (
    <div className="p-4 max-w-2xl space-y-8 text-nav">
      <h1 className="text-2xl font-bold">account</h1>

      <section>
        <h2 className="text-lg font-semibold mb-3">profile</h2>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          {profileError && <p className="text-red-600 text-sm">{profileError}</p>}
          {profileSuccess && <p className="text-[#6b7c3d] text-sm">{profileSuccess}</p>}
          <div>
            <label htmlFor="account-email" className="block text-sm font-medium mb-1">email</label>
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
            <label htmlFor="account-displayName" className="block text-sm font-medium mb-1">display name</label>
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
            className="py-2 px-4 bg-[#6b7c3d] hover:bg-[#7a8f4a] text-white rounded disabled:opacity-50"
          >
            {submittingProfile ? 'saving…' : 'save profile'}
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">password</h2>
        {!showChangePassword ? (
          <button
            type="button"
            onClick={() => setShowChangePassword(true)}
            className="py-2 px-4 bg-[#6b7c3d] hover:bg-[#7a8f4a] text-white rounded"
          >
            change password
          </button>
        ) : (
          <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
            {passwordError && <p className="text-red-600 text-sm">{passwordError}</p>}
            {passwordSuccess && <p className="text-[#6b7c3d] text-sm">{passwordSuccess}</p>}
            <PasswordInput
              id="account-current-password"
              label="current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <PasswordInput
              id="account-new-password"
              label="new password (at least 8 characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
            <PasswordInput
              id="account-confirm-password"
              label="confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submittingPassword}
                className="py-2 px-4 bg-[#6b7c3d] hover:bg-[#7a8f4a] text-white rounded disabled:opacity-50"
              >
                {submittingPassword ? 'updating…' : 'update password'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowChangePassword(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setPasswordError('');
                }}
                className="py-2 px-4 border border-gray-300 dark:border-zinc-600 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 text-nav"
              >
                cancel
              </button>
            </div>
          </form>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">accessibility settings</h2>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label htmlFor="high-contrast-toggle" className="flex items-center gap-2 cursor-pointer text-sm font-medium">
              <input
                id="high-contrast-toggle"
                type="checkbox"
                checked={highContrast}
                onChange={(e) => setHighContrast(e.target.checked)}
                className="accent-[#6b7c3d]"
              />
              <span>use high contrast UI</span>
            </label>
            <div className="relative">
              <button
                type="button"
                aria-label="Information about High Contrast UI"
                aria-describedby="high-contrast-info"
                onMouseEnter={() => setShowInfoPopover(true)}
                onMouseLeave={() => setShowInfoPopover(false)}
                onFocus={() => setShowInfoPopover(true)}
                onBlur={() => setShowInfoPopover(false)}
                className="w-5 h-5 rounded-full border border-gray-400 dark:border-zinc-500 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
              >
                i
              </button>
              {showInfoPopover && (
                <div
                  id="high-contrast-info"
                  role="tooltip"
                  className="absolute left-0 top-full mt-1 z-20 w-56 p-2 text-sm bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 rounded shadow-lg"
                >
                  Enhances the color contrast of text, buttons, etc.
                </div>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-zinc-400">
            Reload the page or navigate to a new page for this change to take effect.
          </p>
        </div>
      </section>
    </div>
  );
}
