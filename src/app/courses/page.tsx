'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { authFetch } from '@/lib/authClient';
import { MathJax, MathJaxContext } from 'better-react-mathjax';

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

type Formula = {
  id: number;
  formula_name: string;
  latex: string | null;
};

type CourseFormula = Formula & {
  segment_type?: string | null;
  segment_label?: string | null;
};

const SEGMENT_TYPES = ['chapter', 'module', 'examination'] as const;
type SegmentType = (typeof SEGMENT_TYPES)[number];

type CourseFormulaRow = {
  course_id: number;
  course_name: string;
  course_code: string | null;
  formula_id: number;
  formula_name: string;
  latex: string | null;
  segment_type: string | null;
  segment_label: string | null;
};

type TableSortKey = 'formula' | 'course' | 'segment_type' | 'segment_label';

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
  const [allFormulas, setAllFormulas] = useState<Formula[]>([]);
  const [formulasLoading, setFormulasLoading] = useState(false);
  const [selectedCourseIdForFormula, setSelectedCourseIdForFormula] = useState<number | null>(null);
  const [courseFormulas, setCourseFormulas] = useState<CourseFormula[]>([]);
  const [courseFormulasLoading, setCourseFormulasLoading] = useState(false);
  const [selectedFormulaId, setSelectedFormulaId] = useState<number | null>(null);
  const [segmentType, setSegmentType] = useState<SegmentType | ''>('');
  const [segmentLabel, setSegmentLabel] = useState('');
  const [addFormulaError, setAddFormulaError] = useState('');
  const [addFormulaSuccess, setAddFormulaSuccess] = useState('');
  const [addFormulaSubmitting, setAddFormulaSubmitting] = useState(false);
  const [filterSegmentType, setFilterSegmentType] = useState<SegmentType | ''>('');
  const [filterSegmentLabel, setFilterSegmentLabel] = useState('');
  const [allCourseFormulaRows, setAllCourseFormulaRows] = useState<CourseFormulaRow[]>([]);
  const [allCourseFormulasLoading, setAllCourseFormulasLoading] = useState(false);
  const [tableFilterFormula, setTableFilterFormula] = useState('');
  const [tableFilterCourseId, setTableFilterCourseId] = useState<number | ''>('');
  const [tableFilterSegmentType, setTableFilterSegmentType] = useState<SegmentType | ''>('');
  const [tableFilterSegmentLabel, setTableFilterSegmentLabel] = useState('');
  const [tableSortBy, setTableSortBy] = useState<TableSortKey>('course');
  const [tableSortDir, setTableSortDir] = useState<'asc' | 'desc'>('asc');
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null);
  const [editCourseName, setEditCourseName] = useState('');
  const [editCourseCode, setEditCourseCode] = useState('');
  const [editCourseError, setEditCourseError] = useState('');
  const [editCourseSubmitting, setEditCourseSubmitting] = useState(false);
  const [deletingCourseId, setDeletingCourseId] = useState<number | null>(null);
  const [deleteConfirmCourse, setDeleteConfirmCourse] = useState<Course | null>(null);
  const [deleteCourseError, setDeleteCourseError] = useState('');
  const [formulaDropdownOpen, setFormulaDropdownOpen] = useState(false);
  const formulaDropdownRef = useRef<HTMLDivElement>(null);
  const [removingFormulaKey, setRemovingFormulaKey] = useState<string | null>(null);
  const [editingSegmentKey, setEditingSegmentKey] = useState<string | null>(null);
  const [editSegmentType, setEditSegmentType] = useState<SegmentType | ''>('');
  const [editSegmentLabel, setEditSegmentLabel] = useState('');
  const [updatingSegmentKey, setUpdatingSegmentKey] = useState<string | null>(null);

  const filteredCourseFormulas = courseFormulas.filter((cf) => {
    if (filterSegmentType && (cf.segment_type || '') !== filterSegmentType) return false;
    if (filterSegmentLabel && (cf.segment_label || '').trim() !== filterSegmentLabel.trim()) return false;
    return true;
  });

  const distinctSegmentLabels = (() => {
    const labels = new Set<string>();
    courseFormulas.forEach((cf) => {
      const L = (cf.segment_label || '').trim();
      if (L) labels.add(L);
    });
    return Array.from(labels).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  })();

  function fetchAllCourseFormulas() {
    if (!user) return;
    setAllCourseFormulasLoading(true);
    authFetch('/api/courses/formulas')
      .then((res) => res.json())
      .then((data: { items?: CourseFormulaRow[]; error?: string }) => {
        if (data.items) setAllCourseFormulaRows(data.items);
        else setAllCourseFormulaRows([]);
      })
      .finally(() => setAllCourseFormulasLoading(false));
  }

  const filteredTableRows = (() => {
    let rows = allCourseFormulaRows;
    const q = (tableFilterFormula || '').trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (r) =>
          (r.formula_name || '').toLowerCase().includes(q) ||
          (r.latex || '').toLowerCase().includes(q)
      );
    }
    if (tableFilterCourseId !== '') {
      rows = rows.filter((r) => r.course_id === tableFilterCourseId);
    }
    if (tableFilterSegmentType) {
      rows = rows.filter((r) => (r.segment_type || '') === tableFilterSegmentType);
    }
    if (tableFilterSegmentLabel.trim()) {
      rows = rows.filter((r) => (r.segment_label || '').trim() === tableFilterSegmentLabel.trim());
    }
    const dir = tableSortDir === 'asc' ? 1 : -1;
    rows = [...rows].sort((a, b) => {
      let cmp = 0;
      switch (tableSortBy) {
        case 'formula':
          cmp = (a.formula_name || '').localeCompare(b.formula_name || '', undefined, { sensitivity: 'base' });
          break;
        case 'course':
          cmp = (a.course_name || '').localeCompare(b.course_name || '', undefined, { sensitivity: 'base' });
          if (cmp === 0) cmp = (a.formula_name || '').localeCompare(b.formula_name || '', undefined, { sensitivity: 'base' });
          break;
        case 'segment_type':
          cmp = (a.segment_type || '').localeCompare(b.segment_type || '', undefined, { sensitivity: 'base' });
          if (cmp === 0) cmp = (a.segment_label || '').localeCompare(b.segment_label || '', undefined, { sensitivity: 'base', numeric: true });
          if (cmp === 0) cmp = (a.formula_name || '').localeCompare(b.formula_name || '', undefined, { sensitivity: 'base' });
          break;
        case 'segment_label':
          cmp = (a.segment_label || '').localeCompare(b.segment_label || '', undefined, { sensitivity: 'base', numeric: true });
          if (cmp === 0) cmp = (a.formula_name || '').localeCompare(b.formula_name || '', undefined, { sensitivity: 'base' });
          break;
        default:
          break;
      }
      return cmp * dir;
    });
    return rows;
  })();

  const distinctTableSegmentLabels = (() => {
    const labels = new Set<string>();
    allCourseFormulaRows.forEach((r) => {
      const L = (r.segment_label || '').trim();
      if (L) labels.add(L);
    });
    return Array.from(labels).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  })();

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

  useEffect(() => {
    if (!user || courses.length === 0) return;
    setFormulasLoading(true);
    authFetch('/api/formulas')
      .then((res) => res.json())
      .then((data: Formula[] | { error?: string }) => {
        if (Array.isArray(data)) setAllFormulas(data);
        else setAllFormulas([]);
      })
      .finally(() => setFormulasLoading(false));
  }, [user, courses.length]);

  useEffect(() => {
    if (!user || selectedCourseIdForFormula == null) {
      setCourseFormulas([]);
      return;
    }
    setCourseFormulasLoading(true);
    setCourseFormulas([]);
    setSelectedFormulaId(null);
    setSegmentType('');
    setSegmentLabel('');
    setFilterSegmentType('');
    setFilterSegmentLabel('');
    authFetch(`/api/courses/${selectedCourseIdForFormula}/formulas`)
      .then((res) => res.json())
      .then((data: { formulas?: CourseFormula[]; error?: string }) => {
        if (data.formulas) setCourseFormulas(data.formulas);
      })
      .finally(() => setCourseFormulasLoading(false));
  }, [user, selectedCourseIdForFormula]);

  useEffect(() => {
    if (user && courses.length > 0) fetchAllCourseFormulas();
  }, [user, courses.length]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (formulaDropdownRef.current && !formulaDropdownRef.current.contains(e.target as Node)) {
        setFormulaDropdownOpen(false);
      }
    }
    if (formulaDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [formulaDropdownOpen]);

  async function handleAddFormulaToCourse(e: React.FormEvent) {
    e.preventDefault();
    setAddFormulaError('');
    setAddFormulaSuccess('');
    if (selectedCourseIdForFormula == null || selectedFormulaId == null) {
      setAddFormulaError('Select a course and a formula.');
      return;
    }
    setAddFormulaSubmitting(true);
    const body: { segment_type?: string; segment_label?: string } = {};
    if (segmentType && SEGMENT_TYPES.includes(segmentType as SegmentType)) {
      body.segment_type = segmentType;
      if (segmentLabel.trim()) body.segment_label = segmentLabel.trim();
    }
    try {
      const res = await authFetch(
        `/api/courses/${selectedCourseIdForFormula}/formulas/${selectedFormulaId}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAddFormulaError((data as { error?: string }).error || 'Failed to add formula.');
        return;
      }
      setAddFormulaSuccess('Formula added.');
      setSelectedFormulaId(null);
      setSegmentType('');
      setSegmentLabel('');
      setCourseFormulas((prev) => {
        const added = allFormulas.find((f) => f.id === selectedFormulaId);
        if (!added) return prev;
        const segType = segmentType && SEGMENT_TYPES.includes(segmentType as SegmentType) ? segmentType : null;
        const segLabel = segmentLabel.trim() || null;
        return [...prev, { ...added, segment_type: segType, segment_label: segLabel }];
      });
      fetchAllCourseFormulas();
    } finally {
      setAddFormulaSubmitting(false);
    }
  }

  function formatSegment(cf: CourseFormula): string {
    if (cf.segment_type && cf.segment_label) return `${cf.segment_type}: ${cf.segment_label}`;
    if (cf.segment_type) return cf.segment_type;
    if (cf.segment_label) return cf.segment_label;
    return '';
  }

  async function removeFormulaFromCourse(courseId: number, formulaId: number) {
    const key = `${courseId}-${formulaId}`;
    setRemovingFormulaKey(key);
    setAddFormulaError('');
    try {
      const res = await authFetch(`/api/courses/${courseId}/formulas/${formulaId}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAddFormulaError((data as { error?: string }).error || 'Failed to remove formula.');
        return;
      }
      if (selectedCourseIdForFormula === courseId) {
        setCourseFormulas((prev) => prev.filter((f) => f.id !== formulaId));
      }
      fetchAllCourseFormulas();
    } finally {
      setRemovingFormulaKey(null);
    }
  }

  function startEditSegment(courseId: number, formulaId: number, segmentType: string | null, segmentLabel: string | null) {
    const key = `${courseId}-${formulaId}`;
    setEditingSegmentKey(key);
    setEditSegmentType((segmentType && SEGMENT_TYPES.includes(segmentType as SegmentType)) ? (segmentType as SegmentType) : '');
    setEditSegmentLabel(segmentLabel || '');
  }

  function cancelEditSegment() {
    setEditingSegmentKey(null);
    setEditSegmentType('');
    setEditSegmentLabel('');
  }

  async function saveSegmentEdit(courseId: number, formulaId: number) {
    const key = `${courseId}-${formulaId}`;
    setUpdatingSegmentKey(key);
    setAddFormulaError('');
    try {
      const res = await authFetch(`/api/courses/${courseId}/formulas/${formulaId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          segment_type: editSegmentType || undefined,
          segment_label: editSegmentLabel.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAddFormulaError((data as { error?: string }).error || 'Failed to update segment.');
        return;
      }
      cancelEditSegment();
      if (selectedCourseIdForFormula === courseId) {
        setCourseFormulas((prev) =>
          prev.map((f) =>
            f.id === formulaId
              ? { ...f, segment_type: editSegmentType || null, segment_label: editSegmentLabel.trim() || null }
              : f
          )
        );
      }
      fetchAllCourseFormulas();
    } finally {
      setUpdatingSegmentKey(null);
    }
  }

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
    refetchCourses();
  }

  function refetchCourses() {
    setCoursesLoading(true);
    authFetch('/api/courses')
      .then((res) => res.json())
      .then((data: { courses?: Course[]; error?: string }) => {
        if (data.error) setCoursesError(data.error);
        else setCourses(data.courses || []);
      })
      .catch(() => setCoursesError('Failed to load courses.'))
      .finally(() => setCoursesLoading(false));
    if (user) fetchAllCourseFormulas();
  }

  function startEdit(c: Course) {
    setEditingCourseId(c.course_id);
    setEditCourseName(c.course_name);
    setEditCourseCode(c.course_code || '');
    setEditCourseError('');
  }

  function cancelEdit() {
    setEditingCourseId(null);
    setEditCourseName('');
    setEditCourseCode('');
    setEditCourseError('');
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (editingCourseId == null) return;
    setEditCourseError('');
    setEditCourseSubmitting(true);
    try {
      const res = await authFetch(`/api/courses/${editingCourseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_name: editCourseName.trim(),
          course_code: editCourseCode.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setEditCourseError((data as { error?: string }).error || 'Failed to update course.');
        return;
      }
      cancelEdit();
      refetchCourses();
    } finally {
      setEditCourseSubmitting(false);
    }
  }

  function openDeleteConfirm(c: Course) {
    setDeleteConfirmCourse(c);
    setDeleteCourseError('');
  }

  function closeDeleteConfirm() {
    setDeleteConfirmCourse(null);
    setDeleteCourseError('');
  }

  async function confirmDeleteCourse() {
    const c = deleteConfirmCourse;
    if (!c) return;
    setDeleteCourseError('');
    setDeletingCourseId(c.course_id);
    try {
      const res = await authFetch(`/api/courses/${c.course_id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setDeleteCourseError((data as { error?: string }).error || `Request failed (${res.status}). Please try again.`);
        return;
      }
      setDeleteConfirmCourse(null);
      refetchCourses();
      if (selectedCourseIdForFormula === c.course_id) {
        setSelectedCourseIdForFormula(null);
        setCourseFormulas([]);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Request failed. Please try again.';
      setDeleteCourseError(msg);
    } finally {
      setDeletingCourseId(null);
    }
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
    <MathJaxContext>
    <div className="text-nav">
      {deleteConfirmCourse && (() => {
        const c = deleteConfirmCourse;
        const linkedCount = allCourseFormulaRows.filter((r) => r.course_id === c.course_id).length;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="delete-confirm-title">
            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-gray-200 dark:border-zinc-600 max-w-md w-full p-6 text-base">
              <h2 id="delete-confirm-title" className="sr-only">Remove course</h2>
              {linkedCount > 0 ? (
                <>
                  <p className="mb-2">There {linkedCount === 1 ? 'is' : 'are'} {linkedCount} formula{linkedCount !== 1 ? 's' : ''} linked to this course.</p>
                  <div className="h-4" />
                  <p className="mb-2">Removing the course will cancel those links. The formulas themselves will remain in the formula library.</p>
                  <div className="h-4" />
                </>
              ) : null}
              <p className="mb-6">Remove {c.course_name}{c.course_code ? ` (${c.course_code})` : ''} from your courses?</p>
              {deleteCourseError && <p className="mb-4 text-red-600 text-sm">{deleteCourseError}</p>}
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={closeDeleteConfirm} className="px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded hover:bg-gray-100 dark:hover:bg-zinc-700 text-nav">
                  Cancel
                </button>
                <button type="button" onClick={confirmDeleteCourse} disabled={deletingCourseId === c.course_id} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded disabled:opacity-50">
                  {deletingCourseId === c.course_id ? 'Removing…' : 'Remove'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
      <div className="max-w-md mx-auto">
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
              {editingCourseId === c.course_id ? (
                <form onSubmit={saveEdit} className="space-y-2">
                  {editCourseError && <p className="text-red-600 text-sm">{editCourseError}</p>}
                  <div>
                    <label htmlFor={`edit-name-${c.course_id}`} className="block text-xs font-medium text-gray-600 dark:text-zinc-400 mb-0.5">Course name</label>
                    <input
                      id={`edit-name-${c.course_id}`}
                      type="text"
                      value={editCourseName}
                      onChange={(e) => setEditCourseName(e.target.value)}
                      required
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-200"
                    />
                  </div>
                  <div>
                    <label htmlFor={`edit-code-${c.course_id}`} className="block text-xs font-medium text-gray-600 dark:text-zinc-400 mb-0.5">Course code (optional)</label>
                    <input
                      id={`edit-code-${c.course_id}`}
                      type="text"
                      value={editCourseCode}
                      onChange={(e) => setEditCourseCode(e.target.value)}
                      placeholder="e.g. STAT 352"
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-200"
                    />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button type="submit" disabled={editCourseSubmitting} className="py-1.5 px-3 text-sm bg-[#6b7c3d] hover:bg-[#7a8f4a] text-white rounded disabled:opacity-50">
                      {editCourseSubmitting ? 'Saving…' : 'Save'}
                    </button>
                    <button type="button" onClick={cancelEdit} className="py-1.5 px-3 text-sm border border-gray-300 dark:border-zinc-600 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 text-nav">
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <span className="font-medium">{c.course_name}</span>
                  {c.course_code && <span className="text-gray-500 dark:text-zinc-400 ml-2">({c.course_code})</span>}
                  {c.institution_name && (
                    <span className="block text-sm text-gray-600 dark:text-zinc-400">{c.institution_name}</span>
                  )}
                  {c.course_type === 'personal' && (
                    <span className="block text-sm text-gray-600 dark:text-zinc-400">Personal project</span>
                  )}
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => startEdit(c)}
                      className="text-sm text-[#6b7c3d] hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => openDeleteConfirm(c)}
                      disabled={deletingCourseId === c.course_id}
                      className="text-sm text-red-600 hover:underline disabled:opacity-50"
                    >
                      {deletingCourseId === c.course_id ? 'Removing…' : 'Delete'}
                    </button>
                  </div>
                </>
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

      {courses.length > 0 && (
        <section className="mt-8 border-t border-gray-200 dark:border-zinc-600 pt-6">
          <h2 className="text-lg font-semibold mb-3">add formula to a course</h2>
          <p className="text-sm text-gray-600 dark:text-zinc-400 mb-4">
            Choose a course, then pick a formula from the list to add it to that course.
          </p>
          {addFormulaError && <p className="text-red-600 text-sm mb-2">{addFormulaError}</p>}
          {addFormulaSuccess && <p className="text-[#6b7c3d] text-sm mb-2">{addFormulaSuccess}</p>}
          <form onSubmit={handleAddFormulaToCourse} className="space-y-4">
            <div>
              <label htmlFor="formula-course" className="block text-sm font-medium mb-1">Course</label>
              <select
                id="formula-course"
                value={selectedCourseIdForFormula ?? ''}
                onChange={(e) => setSelectedCourseIdForFormula(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-200"
              >
                <option value="">— Select a course —</option>
                {courses.map((c) => (
                  <option key={c.course_id} value={c.course_id}>
                    {c.course_name}
                    {c.course_code ? ` (${c.course_code})` : ''}
                  </option>
                ))}
              </select>
            </div>
            {selectedCourseIdForFormula != null && (
              <div>
                <label htmlFor="formula-select" className="block text-sm font-medium mb-1">Formula</label>
                {formulasLoading ? (
                  <p className="text-sm text-gray-500 dark:text-zinc-400">loading formulas…</p>
                ) : (
                  <div ref={formulaDropdownRef} className="relative">
                    <button
                      type="button"
                      id="formula-select"
                      onClick={() => setFormulaDropdownOpen((o) => !o)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-200 text-left flex items-center justify-between"
                    >
                      <span>
                        {selectedFormulaId != null
                          ? (() => {
                              const f = allFormulas.find((x) => x.id === selectedFormulaId);
                              return f ? f.formula_name : '— Select a formula —';
                            })()
                          : '— Select a formula —'}
                      </span>
                      <span className="text-gray-500">▾</span>
                    </button>
                    {formulaDropdownOpen && (
                      <ul
                        className="absolute z-50 mt-1 w-full max-h-64 overflow-y-auto border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-900 shadow-lg"
                        role="listbox"
                      >
                        <li
                          role="option"
                          aria-selected={selectedFormulaId == null}
                          onClick={() => {
                            setSelectedFormulaId(null);
                            setFormulaDropdownOpen(false);
                          }}
                          className="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 dark:text-zinc-400 border-b border-gray-100 dark:border-zinc-700"
                        >
                          — Select a formula —
                        </li>
                        {allFormulas
                          .filter((f) => !courseFormulas.some((cf) => cf.id === f.id))
                          .map((f) => (
                            <li
                              key={f.id}
                              role="option"
                              aria-selected={selectedFormulaId === f.id}
                              onClick={() => {
                                setSelectedFormulaId(f.id);
                                setFormulaDropdownOpen(false);
                              }}
                              className="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 border-b border-gray-100 dark:border-zinc-700 last:border-b-0 flex items-center gap-2 flex-wrap"
                            >
                              <span className="font-medium">{f.formula_name}</span>
                              {f.latex && (
                                <span className="text-gray-500 dark:text-zinc-400 overflow-x-auto">
                                  <MathJax>{`\\(${f.latex}\\)`}</MathJax>
                                </span>
                              )}
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>
                )}
                {courseFormulasLoading && (
                  <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">loading course formulas…</p>
                )}
                {selectedCourseIdForFormula != null && !courseFormulasLoading && (
                  <div className="mt-4 p-3 border border-gray-200 dark:border-zinc-600 rounded-lg bg-gray-50 dark:bg-zinc-800/50">
                    <h3 className="text-sm font-semibold mb-2">Formulas in this course</h3>
                    {courseFormulas.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-zinc-400">No formulas in this course yet.</p>
                    ) : (
                      <>
                        <div className="flex flex-wrap gap-2 mb-3 items-center">
                          <label className="text-xs font-medium text-gray-600 dark:text-zinc-400">Segment type</label>
                          <select
                            value={filterSegmentType}
                            onChange={(e) => setFilterSegmentType((e.target.value || '') as SegmentType | '')}
                            className="px-2 py-1.5 text-sm border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-200"
                          >
                            <option value="">All</option>
                            {SEGMENT_TYPES.map((t) => (
                              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                            ))}
                          </select>
                          <label className="text-xs font-medium text-gray-600 dark:text-zinc-400 ml-2">Segment label</label>
                          <select
                            value={filterSegmentLabel}
                            onChange={(e) => setFilterSegmentLabel(e.target.value)}
                            className="px-2 py-1.5 text-sm border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-200"
                          >
                            <option value="">All</option>
                            {distinctSegmentLabels.map((l) => (
                              <option key={l} value={l}>{l}</option>
                            ))}
                          </select>
                          {(filterSegmentType || filterSegmentLabel) && (
                            <button
                              type="button"
                              onClick={() => { setFilterSegmentType(''); setFilterSegmentLabel(''); }}
                              className="text-xs text-[#6b7c3d] hover:underline"
                            >
                              Clear filters
                            </button>
                          )}
                        </div>
                        <ul className="space-y-2 max-h-48 overflow-y-auto">
                          {filteredCourseFormulas.map((cf) => {
                            const seg = formatSegment(cf);
                            const key = `${selectedCourseIdForFormula}-${cf.id}`;
                            const removing = removingFormulaKey === key;
                            const editing = editingSegmentKey === key;
                            const updating = updatingSegmentKey === key;
                            return (
                              <li
                                key={cf.id}
                                className="py-2 px-3 rounded border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-sm"
                              >
                                {editing ? (
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-medium">{cf.formula_name}</span>
                                      {cf.latex && (
                                        <span className="text-gray-500 dark:text-zinc-400 inline">
                                          <MathJax>{`\\(${cf.latex}\\)`}</MathJax>
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex flex-wrap gap-2 items-center">
                                      <select
                                        value={editSegmentType}
                                        onChange={(e) => setEditSegmentType((e.target.value || '') as SegmentType | '')}
                                        className="px-2 py-1 text-xs border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-200"
                                      >
                                        <option value="">No segment</option>
                                        {SEGMENT_TYPES.map((t) => (
                                          <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                                        ))}
                                      </select>
                                      <input
                                        type="text"
                                        placeholder="Segment label"
                                        value={editSegmentLabel}
                                        onChange={(e) => setEditSegmentLabel(e.target.value)}
                                        className="px-2 py-1 text-xs border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-200 w-32"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => selectedCourseIdForFormula != null && saveSegmentEdit(selectedCourseIdForFormula, cf.id)}
                                        disabled={updating}
                                        className="text-xs text-[#6b7c3d] hover:underline disabled:opacity-50"
                                      >
                                        {updating ? 'Saving…' : 'Save'}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={cancelEditSegment}
                                        disabled={updating}
                                        className="text-xs text-gray-500 hover:underline disabled:opacity-50"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-between gap-2 flex-wrap">
                                    <span className="flex items-center gap-2 flex-wrap">
                                      <span className="font-medium">{cf.formula_name}</span>
                                      {cf.latex && (
                                        <span className="text-gray-500 dark:text-zinc-400 inline">
                                          <MathJax>{`\\(${cf.latex}\\)`}</MathJax>
                                        </span>
                                      )}
                                      {seg && (
                                        <span className="px-1.5 py-0.5 rounded bg-[#6b7c3d]/15 text-[#6b7c3d] text-xs">
                                          {seg}
                                        </span>
                                      )}
                                    </span>
                                    <span className="flex items-center gap-4">
                                      <button
                                        type="button"
                                        onClick={() => startEditSegment(selectedCourseIdForFormula!, cf.id, cf.segment_type ?? null, cf.segment_label ?? null)}
                                        className="text-xs text-[#6b7c3d] hover:underline"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => selectedCourseIdForFormula != null && removeFormulaFromCourse(selectedCourseIdForFormula, cf.id)}
                                        disabled={removing}
                                        className="text-xs text-red-600 dark:text-red-400 hover:underline disabled:opacity-50"
                                      >
                                        {removing ? 'Removing…' : 'Remove'}
                                      </button>
                                    </span>
                                  </div>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                        {filteredCourseFormulas.length < courseFormulas.length && (
                          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-2">
                            Showing {filteredCourseFormulas.length} of {courseFormulas.length} formulas
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
            {selectedFormulaId != null && (
              <div className="space-y-2">
                <span className="block text-sm font-medium">Segment (optional)</span>
                <p className="text-xs text-gray-500 dark:text-zinc-400">
                  Classify by chapter, module, or examination so you can drill by segment later.
                </p>
                <div className="flex flex-wrap gap-3 items-center">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="segment-type"
                      checked={segmentType === ''}
                      onChange={() => { setSegmentType(''); setSegmentLabel(''); }}
                      className="accent-[#6b7c3d]"
                    />
                    <span className="text-sm">No segment</span>
                  </label>
                  {SEGMENT_TYPES.map((t) => (
                    <label key={t} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="segment-type"
                        checked={segmentType === t}
                        onChange={() => setSegmentType(t)}
                        className="accent-[#6b7c3d]"
                      />
                      <span className="text-sm capitalize">{t}</span>
                    </label>
                  ))}
                </div>
                {segmentType && (
                  <div>
                    <label htmlFor="segment-label" className="block text-sm font-medium mb-1 mt-2">
                      Label (e.g. Chapter 3, Midterm 1)
                    </label>
                    <input
                      id="segment-label"
                      type="text"
                      value={segmentLabel}
                      onChange={(e) => setSegmentLabel(e.target.value)}
                      placeholder={segmentType === 'chapter' ? '3' : segmentType === 'module' ? '2' : 'Midterm 1'}
                      className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-200"
                    />
                  </div>
                )}
              </div>
            )}
            <button
              type="submit"
              disabled={addFormulaSubmitting || selectedCourseIdForFormula == null || selectedFormulaId == null}
              className="py-2 px-4 bg-[#6b7c3d] hover:bg-[#7a8f4a] text-white rounded disabled:opacity-50"
            >
              {addFormulaSubmitting ? 'adding…' : 'add formula to course'}
            </button>
          </form>
        </section>
      )}
      </div>

      {courses.length > 0 && (
        <section className="mt-8 border-t border-gray-200 dark:border-zinc-600 pt-6 max-w-6xl mx-auto px-4">
          <h2 className="text-lg font-semibold mb-2">Your course formulas</h2>
          <p className="text-sm text-gray-600 dark:text-zinc-400 mb-4">
            Filter using the controls under each column header; click a header to sort by that column.
          </p>
          {allCourseFormulasLoading ? (
            <div className="flex items-center gap-2 py-8">
              <div className="bouncing-dots" aria-hidden><span /><span /><span /></div>
              <span className="text-sm text-gray-500 dark:text-zinc-400">loading…</span>
            </div>
          ) : (
            <div className="w-full min-w-0 overflow-auto max-h-[70vh] rounded-lg border border-gray-200 dark:border-zinc-600">
              <table className="w-full max-w-full text-sm border-collapse table-fixed">
                <thead className="sticky top-0 z-10 bg-gray-100 dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-600">
                  <tr>
                    <th className="text-left p-2 font-semibold text-gray-700 dark:text-zinc-300 w-[40%] min-w-[200px]">
                        <button
                        type="button"
                        onClick={() => {
                          if (tableSortBy === 'formula') setTableSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
                          else { setTableSortBy('formula'); setTableSortDir('asc'); }
                        }}
                        className="flex items-center gap-1 hover:underline"
                      >
                        Formula {tableSortBy === 'formula' ? (tableSortDir === 'asc' ? '↑' : '↓') : ''}
                      </button>
                    </th>
                    <th className="text-left p-2 font-semibold text-gray-700 dark:text-zinc-300 w-[15%] min-w-[90px]">
                      <button
                        type="button"
                        onClick={() => {
                          if (tableSortBy === 'course') setTableSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
                          else { setTableSortBy('course'); setTableSortDir('asc'); }
                        }}
                        className="flex items-center gap-1 hover:underline"
                      >
                        Course {tableSortBy === 'course' ? (tableSortDir === 'asc' ? '↑' : '↓') : ''}
                      </button>
                    </th>
                    <th className="text-left p-2 font-semibold text-gray-700 dark:text-zinc-300 w-[14%] min-w-[90px]">
                      <button
                        type="button"
                        onClick={() => {
                          if (tableSortBy === 'segment_type') setTableSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
                          else { setTableSortBy('segment_type'); setTableSortDir('asc'); }
                        }}
                        className="flex items-center gap-1 hover:underline"
                      >
                        Segment type {tableSortBy === 'segment_type' ? (tableSortDir === 'asc' ? '↑' : '↓') : ''}
                      </button>
                    </th>
                    <th className="text-left p-2 font-semibold text-gray-700 dark:text-zinc-300 w-[14%] min-w-[90px]">
                      <button
                        type="button"
                        onClick={() => {
                          if (tableSortBy === 'segment_label') setTableSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
                          else { setTableSortBy('segment_label'); setTableSortDir('asc'); }
                        }}
                        className="flex items-center gap-1 hover:underline"
                      >
                        Segment label {tableSortBy === 'segment_label' ? (tableSortDir === 'asc' ? '↑' : '↓') : ''}
                      </button>
                    </th>
                    <th className="p-2 min-w-[100px]"></th>
                  </tr>
                  <tr className="bg-gray-50 dark:bg-zinc-800/80 border-b border-gray-200 dark:border-zinc-600">
                    <th className="p-1.5">
                      <input
                        type="text"
                        placeholder="Filter…"
                        value={tableFilterFormula}
                        onChange={(e) => setTableFilterFormula(e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-200"
                      />
                    </th>
                    <th className="p-1.5">
                      <select
                        value={tableFilterCourseId === '' ? '' : tableFilterCourseId}
                        onChange={(e) => setTableFilterCourseId(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-200"
                      >
                        <option value="">All</option>
                        {courses.map((c) => (
                          <option key={c.course_id} value={c.course_id}>
                            {c.course_code || c.course_name}
                          </option>
                        ))}
                      </select>
                    </th>
                    <th className="p-1.5">
                      <select
                        value={tableFilterSegmentType}
                        onChange={(e) => setTableFilterSegmentType((e.target.value || '') as SegmentType | '')}
                        className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-200"
                      >
                        <option value="">All</option>
                        {SEGMENT_TYPES.map((t) => (
                          <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                        ))}
                      </select>
                    </th>
                    <th className="p-1.5">
                      <select
                        value={tableFilterSegmentLabel}
                        onChange={(e) => setTableFilterSegmentLabel(e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-200"
                      >
                        <option value="">All</option>
                        {distinctTableSegmentLabels.map((l) => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </select>
                    </th>
                    <th className="p-1.5"></th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-zinc-900">
                  {filteredTableRows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-gray-500 dark:text-zinc-400">
                        {allCourseFormulaRows.length === 0
                          ? 'No formulas in any course yet. Add some above.'
                          : 'No rows match the current filters.'}
                      </td>
                    </tr>
                  ) : (
                    filteredTableRows.map((row) => {
                      const rowKey = `${row.course_id}-${row.formula_id}`;
                      const editing = editingSegmentKey === rowKey;
                      const updating = updatingSegmentKey === rowKey;
                      const removing = removingFormulaKey === rowKey;
                      return (
                        <tr
                          key={rowKey}
                          className="border-b border-gray-100 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                        >
                          <td className="p-2">
                            <span className="font-medium">{row.formula_name}</span>
                            {row.latex && (
                              <span className="text-gray-500 dark:text-zinc-400 ml-1 text-xs inline">
                                <MathJax>{`\\(${row.latex}\\)`}</MathJax>
                              </span>
                            )}
                          </td>
                          <td className="p-2 text-gray-700 dark:text-zinc-300">
                            {row.course_code || row.course_name || '—'}
                          </td>
                          <td className="p-2 text-gray-600 dark:text-zinc-400">
                            {editing ? (
                              <select
                                value={editSegmentType}
                                onChange={(e) => setEditSegmentType((e.target.value || '') as SegmentType | '')}
                                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-200"
                              >
                                <option value="">—</option>
                                {SEGMENT_TYPES.map((t) => (
                                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                                ))}
                              </select>
                            ) : (
                              row.segment_type ? row.segment_type.charAt(0).toUpperCase() + row.segment_type.slice(1) : '—'
                            )}
                          </td>
                          <td className="p-2 text-gray-600 dark:text-zinc-400">
                            {editing ? (
                              <input
                                type="text"
                                placeholder="Label"
                                value={editSegmentLabel}
                                onChange={(e) => setEditSegmentLabel(e.target.value)}
                                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-200"
                              />
                            ) : (
                              row.segment_label || '—'
                            )}
                          </td>
                          <td className="p-2">
                            {editing ? (
                              <span className="flex flex-wrap gap-4">
                                <button
                                  type="button"
                                  onClick={() => saveSegmentEdit(row.course_id, row.formula_id)}
                                  disabled={updating}
                                  className="text-xs text-[#6b7c3d] hover:underline disabled:opacity-50"
                                >
                                  {updating ? 'Saving…' : 'Save'}
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelEditSegment}
                                  disabled={updating}
                                  className="text-xs text-gray-500 hover:underline disabled:opacity-50"
                                >
                                  Cancel
                                </button>
                              </span>
                            ) : (
                              <span className="flex flex-wrap gap-4">
                                <button
                                  type="button"
                                  onClick={() => startEditSegment(row.course_id, row.formula_id, row.segment_type, row.segment_label)}
                                  className="text-xs text-[#6b7c3d] hover:underline"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeFormulaFromCourse(row.course_id, row.formula_id)}
                                  disabled={removing}
                                  className="text-xs text-red-600 dark:text-red-400 hover:underline disabled:opacity-50"
                                >
                                  {removing ? 'Removing…' : 'Remove'}
                                </button>
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
          {!allCourseFormulasLoading && allCourseFormulaRows.length > 0 && (
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-2">
              Showing {filteredTableRows.length} of {allCourseFormulaRows.length} row{allCourseFormulaRows.length !== 1 ? 's' : ''}
              {(tableFilterFormula || tableFilterCourseId !== '' || tableFilterSegmentType || tableFilterSegmentLabel) && ' (filtered)'}
            </p>
          )}
        </section>
      )}
    </div>
    </MathJaxContext>
  );
}
