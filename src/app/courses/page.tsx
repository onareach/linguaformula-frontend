'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { authFetch } from '@/lib/authClient';

type Institution = {
  id: number;
  institution_name: string;
  institution_handle: string | null;
  country: string | null;
  region: string | null;
};

type Course = {
  course_id: number;
  course_name: string;
  course_code: string | null;
  institution_id: number | null;
  course_type: string | null;
  institution_name: string | null;
};

export default function CoursesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState('');
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [institutionsLoading, setInstitutionsLoading] = useState(false);
  const [institutionChoice, setInstitutionChoice] = useState<'personal' | 'existing' | 'new'>('existing');
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<number | null>(null);
  const [showAddInstitutionForm, setShowAddInstitutionForm] = useState(false);
  const [newInstitutionName, setNewInstitutionName] = useState('');
  const [newInstitutionCountry, setNewInstitutionCountry] = useState('');
  const [newInstitutionRegion, setNewInstitutionRegion] = useState('');
  const [addInstitutionError, setAddInstitutionError] = useState('');
  const [addInstitutionSubmitting, setAddInstitutionSubmitting] = useState(false);
  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [createError, setCreateError] = useState('');
  const [createSubmitting, setCreateSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/sign-in');
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setCoursesLoading(true);
    setCoursesError('');
    authFetch('/api/courses')
      .then((res) => res.json())
      .then((data: { courses?: Course[]; error?: string }) => {
        if (cancelled) return;
        if (data.error) setCoursesError(data.error);
        else setCourses(data.courses || []);
      })
      .catch(() => { if (!cancelled) setCoursesError('Failed to load courses.'); })
      .finally(() => { if (!cancelled) setCoursesLoading(false); });
    return () => { cancelled = true; };
  }, [user]);

  useEffect(() => {
    if (!showAddCourse || step !== 1 || institutionChoice !== 'existing') return;
    setInstitutionsLoading(true);
    authFetch('/api/institutions')
      .then((res) => res.json())
      .then((data: { institutions?: Institution[]; error?: string }) => {
        if (data.institutions) setInstitutions(data.institutions);
      })
      .finally(() => setInstitutionsLoading(false));
  }, [showAddCourse, step, institutionChoice]);

  function openAddCourse() {
    setShowAddCourse(true);
    setStep(1);
    setInstitutionChoice('existing');
    setSelectedInstitutionId(null);
    setShowAddInstitutionForm(false);
    setNewInstitutionName('');
    setNewInstitutionCountry('');
    setNewInstitutionRegion('');
    setAddInstitutionError('');
    setCourseName('');
    setCourseCode('');
    setCreateError('');
  }

  function closeAddCourse() {
    setShowAddCourse(false);
    setStep(1);
    setShowAddInstitutionForm(false);
    setCoursesLoading(true);
    authFetch('/api/courses')
      .then((res) => res.json())
      .then((data: { courses?: Course[] }) => setCourses(data.courses || []))
      .finally(() => setCoursesLoading(false));
  }

  async function handleAddInstitution(e: React.FormEvent) {
    e.preventDefault();
    setAddInstitutionError('');
    setAddInstitutionSubmitting(true);
    try {
      const res = await authFetch('/api/institutions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          institution_name: newInstitutionName.trim(),
          country: newInstitutionCountry.trim() || undefined,
          region: newInstitutionRegion.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAddInstitutionError(data.error || 'Failed to add institution.');
        return;
      }
      const inst = data.institution as Institution;
      setInstitutions((prev) => [...prev, { ...inst, institution_handle: inst.institution_handle ?? null, country: inst.country ?? null, region: inst.region ?? null }]);
      setSelectedInstitutionId(inst.id);
      setShowAddInstitutionForm(false);
      setNewInstitutionName('');
      setNewInstitutionCountry('');
      setNewInstitutionRegion('');
    } finally {
      setAddInstitutionSubmitting(false);
    }
  }

  function goToStep2() {
    setCreateError('');
    setStep(2);
  }

  function backToStep1() {
    setStep(1);
    setCreateError('');
  }

  async function handleCreateCourse(e: React.FormEvent) {
    e.preventDefault();
    setCreateError('');
    const name = courseName.trim();
    if (!name) {
      setCreateError('Course name is required.');
      return;
    }
    setCreateSubmitting(true);
    try {
      let institutionId: number | null = null;
      if (institutionChoice === 'existing' && selectedInstitutionId != null) {
        institutionId = selectedInstitutionId;
      } else if (institutionChoice === 'new' && selectedInstitutionId != null) {
        institutionId = selectedInstitutionId;
      }
      const res = await authFetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_name: name,
          course_code: courseCode.trim() || undefined,
          institution_id: institutionId,
          course_type: institutionId == null ? 'personal' : 'academic',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error || 'Failed to create course.');
        return;
      }
      closeAddCourse();
    } finally {
      setCreateSubmitting(false);
    }
  }

  if (loading || !user) {
    return <div className="max-w-md mx-auto text-nav">loading…</div>;
  }

  return (
    <div className="max-w-md mx-auto text-nav">
      <h1 className="text-2xl font-bold mb-6">my courses</h1>
      <p className="text-sm text-gray-600 dark:text-zinc-400 mb-4">
        Add courses or personal learning projects, then link formulas to them.
      </p>

      {coursesError && <p className="text-red-600 text-sm mb-4">{coursesError}</p>}
      {coursesLoading ? (
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="bouncing-dots" aria-hidden>
            <span /><span /><span />
          </div>
          <p className="text-sm text-gray-500 dark:text-zinc-400">loading courses…</p>
        </div>
      ) : courses.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-zinc-400 mb-6">You don’t have any courses yet.</p>
      ) : (
        <ul className="space-y-2 mb-6">
          {courses.map((c) => (
            <li key={c.course_id} className="py-2 px-3 rounded border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-900">
              <span className="font-medium">{c.course_name}</span>
              {c.course_code && <span className="text-gray-500 dark:text-zinc-400 ml-2">({c.course_code})</span>}
              {c.institution_name && (
                <span className="block text-sm text-gray-600 dark:text-zinc-400">{c.institution_name}</span>
              )}
              {c.course_type === 'personal' && (
                <span className="block text-sm text-gray-600 dark:text-zinc-400">Personal project</span>
              )}
            </li>
          ))}
        </ul>
      )}

      {!showAddCourse ? (
        <button
          type="button"
          onClick={openAddCourse}
          className="py-2 px-4 bg-[#6b7c3d] hover:bg-[#7a8f4a] text-white rounded"
        >
          add course
        </button>
      ) : (
        <div className="border border-gray-200 dark:border-zinc-600 rounded-lg p-4 bg-gray-50 dark:bg-zinc-800/50">
          <h2 className="text-lg font-semibold mb-3">
            {step === 1 ? 'Step 1: Institution or personal project' : 'Step 2: Course details'}
          </h2>

          {step === 1 && (
            <>
              <div className="space-y-2 mb-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="institution-choice"
                    checked={institutionChoice === 'personal'}
                    onChange={() => setInstitutionChoice('personal')}
                    className="accent-[#6b7c3d]"
                  />
                  <span>This is a personal learning project (no institution)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="institution-choice"
                    checked={institutionChoice === 'existing'}
                    onChange={() => setInstitutionChoice('existing')}
                    className="accent-[#6b7c3d]"
                  />
                  <span>I’m taking a course at a school or institution</span>
                </label>
              </div>

              {institutionChoice === 'existing' && (
                <>
                  {institutionsLoading ? (
                    <p className="text-sm text-gray-500 dark:text-zinc-400 mb-3">loading institutions…</p>
                  ) : (
                    <div className="mb-3">
                      <label className="block text-sm font-medium mb-2">Select your institution</label>
                      <select
                        value={selectedInstitutionId ?? ''}
                        onChange={(e) => setSelectedInstitutionId(e.target.value ? Number(e.target.value) : null)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-200"
                      >
                        <option value="">— Select one —</option>
                        {institutions.map((i) => (
                          <option key={i.id} value={i.id}>
                            {i.institution_name}
                            {i.country ? `, ${i.country}` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <p className="text-sm mb-2">
                    <button
                      type="button"
                      onClick={() => setShowAddInstitutionForm((v) => !v)}
                      className="text-[#6b7c3d] hover:underline"
                    >
                      {showAddInstitutionForm ? 'Cancel' : "My institution isn't listed"}
                    </button>
                  </p>

                  {showAddInstitutionForm && (
                    <form onSubmit={handleAddInstitution} className="mt-3 p-3 border border-gray-200 dark:border-zinc-600 rounded bg-white dark:bg-zinc-900 space-y-3">
                      <p className="text-sm text-amber-700 dark:text-amber-200">
                        New institutions may be standardized or merged later. You can still use yours for your courses.
                      </p>
                      {addInstitutionError && <p className="text-red-600 text-sm">{addInstitutionError}</p>}
                      <div>
                        <label className="block text-sm font-medium mb-1">Institution name *</label>
                        <input
                          type="text"
                          value={newInstitutionName}
                          onChange={(e) => setNewInstitutionName(e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Country (optional)</label>
                        <input
                          type="text"
                          value={newInstitutionCountry}
                          onChange={(e) => setNewInstitutionCountry(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Region (optional)</label>
                        <input
                          type="text"
                          value={newInstitutionRegion}
                          onChange={(e) => setNewInstitutionRegion(e.target.value)}
                          placeholder="e.g. state or province"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-200"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={addInstitutionSubmitting}
                        className="py-2 px-4 bg-[#6b7c3d] hover:bg-[#7a8f4a] text-white rounded disabled:opacity-50"
                      >
                        {addInstitutionSubmitting ? 'adding…' : 'add institution'}
                      </button>
                    </form>
                  )}
                </>
              )}

              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  onClick={goToStep2}
                  className="py-2 px-4 bg-[#6b7c3d] hover:bg-[#7a8f4a] text-white rounded"
                >
                  next: course details
                </button>
                <button
                  type="button"
                  onClick={closeAddCourse}
                  className="py-2 px-4 border border-gray-300 dark:border-zinc-600 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 text-nav"
                >
                  cancel
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <form onSubmit={handleCreateCourse} className="space-y-4">
              {createError && <p className="text-red-600 text-sm">{createError}</p>}
              <div>
                <label htmlFor="course-name" className="block text-sm font-medium mb-1">Course or project name *</label>
                <input
                  id="course-name"
                  type="text"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  required
                  placeholder="e.g. Introductory Mechanics, My stats self-study"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-200"
                />
              </div>
              <div>
                <label htmlFor="course-code" className="block text-sm font-medium mb-1">Course code (optional)</label>
                <input
                  id="course-code"
                  type="text"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  placeholder="e.g. PHYS 101"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-200"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={createSubmitting}
                  className="py-2 px-4 bg-[#6b7c3d] hover:bg-[#7a8f4a] text-white rounded disabled:opacity-50"
                >
                  {createSubmitting ? 'creating…' : 'create course'}
                </button>
                <button
                  type="button"
                  onClick={backToStep1}
                  className="py-2 px-4 border border-gray-300 dark:border-zinc-600 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 text-nav"
                >
                  back
                </button>
                <button
                  type="button"
                  onClick={closeAddCourse}
                  className="py-2 px-4 border border-gray-300 dark:border-zinc-600 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 text-nav"
                >
                  cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      <p className="mt-6">
        <Link href="/account" className="text-nav-hover underline text-sm">back to account</Link>
      </p>
    </div>
  );
}
