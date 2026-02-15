'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { authFetch } from '@/lib/authClient';

type UserRow = {
  id: number;
  email: string;
  display_name: string | null;
  is_admin: boolean;
};

export default function AdminPage() {
  const { user, loading, refetch } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchUsers = useCallback(() => {
    if (!user?.is_admin) return;
    setUsersLoading(true);
    authFetch('/api/admin/users')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load users');
        return res.json();
      })
      .then((data) => {
        setUsers(data.users || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setUsersLoading(false));
  }, [user?.is_admin]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/sign-in');
      return;
    }
    if (!loading && user && !user.is_admin) {
      router.replace('/');
      return;
    }
  }, [loading, user, router]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function toggleAdmin(u: UserRow) {
    if (updatingId !== null) return;
    const newAdmin = !u.is_admin;
    const adminCount = users.filter((x) => x.is_admin).length;
    const isSelf = u.id === user?.id;
    if (!newAdmin && isSelf && adminCount <= 1) return; // Should be disabled in UI
    setError(null);
    setUpdatingId(u.id);
    try {
      const res = await authFetch(`/api/admin/users/${u.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_admin: newAdmin }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Update failed');
        return;
      }
      setUsers((prev) =>
        prev.map((x) => (x.id === u.id ? { ...x, is_admin: newAdmin } : x))
      );
      if (isSelf) await refetch();
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading || !user) {
    return <div className="p-4 max-w-2xl text-nav">loading…</div>;
  }

  if (!user.is_admin) {
    return null; // Will redirect
  }

  const adminCount = users.filter((u) => u.is_admin).length;

  return (
    <div className="p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6 text-nav">admin</h1>
      <p className="text-sm text-gray-600 dark:text-zinc-400 mb-6">
        User list. Toggle admin rights. You cannot revoke your own admin when you are the only admin.
      </p>

      {error && (
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
      )}

      {usersLoading ? (
        <div className="flex items-center gap-2 py-8">
          <div className="bouncing-dots" aria-hidden><span /><span /><span /></div>
          <span className="text-sm text-gray-500 dark:text-zinc-400">loading users…</span>
        </div>
      ) : (
        <div className="w-full overflow-auto rounded-lg border border-gray-200 dark:border-zinc-600">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-100 dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-600">
              <tr>
                <th className="text-left p-2 font-semibold text-black dark:text-white">Email</th>
                <th className="text-left p-2 font-semibold text-black dark:text-white">Display name</th>
                <th className="text-left p-2 font-semibold text-black dark:text-white">Admin</th>
                <th className="text-left p-2 font-semibold text-black dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-zinc-900">
              {users.map((u) => {
                const isSelf = u.id === user.id;
                const cannotRevokeSelf = u.is_admin && isSelf && adminCount <= 1;
                return (
                  <tr key={u.id} className="border-b border-gray-100 dark:border-zinc-700">
                    <td className="p-2">{u.email}</td>
                    <td className="p-2 text-gray-600 dark:text-zinc-400">{u.display_name || '—'}</td>
                    <td className="p-2">{u.is_admin ? 'Yes' : 'No'}</td>
                    <td className="p-2">
                      <button
                        type="button"
                        onClick={() => toggleAdmin(u)}
                        disabled={updatingId === u.id || cannotRevokeSelf}
                        className={`text-sm ${u.is_admin ? 'text-red-600 dark:text-red-400 hover:underline' : 'text-[#6b7c3d] hover:underline'} disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline`}
                      >
                        {updatingId === u.id
                          ? 'Updating…'
                          : u.is_admin
                            ? 'Revoke admin'
                            : 'Make admin'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
