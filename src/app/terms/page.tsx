'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

function capitalizeSentences(text: string): string {
  if (!text || !text.trim()) return text;
  let result = text.trim();
  result = result.charAt(0).toUpperCase() + result.slice(1);
  result = result.replace(/([.!?]\s*)([a-z])/g, (_, punctAndSpace, letter) => punctAndSpace + letter.toUpperCase());
  return result;
}

interface Term {
  id: number;
  term_name: string;
  definition: string;
  display_order?: number | null;
}

interface Discipline {
  id: number;
  name: string;
  handle: string;
  description?: string | null;
  parent_id?: number | null;
  parent_name?: string | null;
  parent_handle?: string | null;
  formula_count: number;
  term_count?: number;
}

function TermsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [terms, setTerms] = useState<Term[]>([]);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingFilters, setLoadingFilters] = useState(true);
  const [keyboardHintVisible, setKeyboardHintVisible] = useState(false);
  const [tableFilterName, setTableFilterName] = useState('');
  const [tableFilterDefinition, setTableFilterDefinition] = useState('');

  const getInitialDisciplines = (): Set<number> => {
    const disciplineIds = searchParams.get('disciplines');
    if (disciplineIds) {
      return new Set(disciplineIds.split(',').map(id => parseInt(id, 10)).filter(id => !isNaN(id)));
    }
    return new Set();
  };

  const getInitialIncludeChildren = (): boolean => {
    return searchParams.get('include_children') !== 'false';
  };

  const [selectedDisciplines, setSelectedDisciplines] = useState<Set<number>>(getInitialDisciplines);
  const [expandedParents, setExpandedParents] = useState<Set<number>>(new Set());
  const [includeChildren, setIncludeChildren] = useState(getInitialIncludeChildren);
  const [isInitialMount, setIsInitialMount] = useState(true);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') setKeyboardHintVisible(true);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  // Fetch disciplines
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_API_URL) {
      setError('API URL is not configured.');
      setLoadingFilters(false);
      return;
    }
    if (disciplines.length > 0) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/disciplines`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setDisciplines(data);
        setLoadingFilters(false);
        const disciplineIds = searchParams.get('disciplines');
        if (disciplineIds) {
          const selectedIds = disciplineIds.split(',').map(id => parseInt(id, 10)).filter(id => !isNaN(id));
          const parentsToExpand = new Set<number>();
          data.forEach((disc: Discipline) => {
            if (disc.parent_id && selectedIds.includes(disc.id)) parentsToExpand.add(disc.parent_id);
          });
          if (parentsToExpand.size > 0) {
            setExpandedParents(prev => {
              const newSet = new Set(prev);
              parentsToExpand.forEach(id => newSet.add(id));
              return newSet;
            });
          }
        }
      })
      .catch((err) => {
        console.error('Error fetching disciplines:', err);
        setError(err.message === 'Failed to fetch' ? 'Unable to connect to the API.' : String(err.message));
        setLoadingFilters(false);
      });
  }, [searchParams, disciplines.length]);

  // Fetch terms
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_API_URL) {
      setError('API URL is not set.');
      setLoading(false);
      return;
    }
    setLoading(true);

    const apiUrl = new URL(`${process.env.NEXT_PUBLIC_API_URL}/api/terms`);
    if (selectedDisciplines.size > 0) {
      Array.from(selectedDisciplines).forEach(id => apiUrl.searchParams.append('discipline_id', id.toString()));
      apiUrl.searchParams.append('include_children', includeChildren.toString());
    }

    fetch(apiUrl.toString())
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setTerms(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [selectedDisciplines, includeChildren]);

  useEffect(() => setIsInitialMount(false), []);

  useEffect(() => {
    if (isInitialMount) return;
    const params = new URLSearchParams();
    if (selectedDisciplines.size > 0) params.set('disciplines', Array.from(selectedDisciplines).join(','));
    if (!includeChildren) params.set('include_children', 'false');
    const newUrl = params.toString() ? `/terms?${params.toString()}` : '/terms';
    const currentUrl = window.location.pathname + window.location.search;
    if (newUrl !== currentUrl) {
      setTimeout(() => router.replace(newUrl, { scroll: false }), 0);
    }
  }, [selectedDisciplines, includeChildren, router, isInitialMount]);

  const toggleDiscipline = (disciplineId: number) => {
    setSelectedDisciplines(prev => {
      const newSet = new Set(prev);
      if (newSet.has(disciplineId)) newSet.delete(disciplineId);
      else newSet.add(disciplineId);
      return newSet;
    });
  };

  const toggleParentExpansion = (parentId: number) => {
    setExpandedParents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(parentId)) newSet.delete(parentId);
      else newSet.add(parentId);
      return newSet;
    });
  };

  const clearFilters = () => setSelectedDisciplines(new Set());

  const parentDisciplines = disciplines.filter(d => !d.parent_id);
  const childDisciplines = disciplines.filter(d => d.parent_id);
  const getChildren = (parentId: number) => childDisciplines.filter(d => d.parent_id === parentId);

  const filteredTerms = (() => {
    const qName = (tableFilterName || '').trim().toLowerCase();
    const qDef = (tableFilterDefinition || '').trim().toLowerCase();
    if (!qName && !qDef) return terms;
    return terms.filter((t) => {
      if (qName && !(t.term_name || '').toLowerCase().includes(qName)) return false;
      if (qDef && !(t.definition || '').toLowerCase().includes(qDef)) return false;
      return true;
    });
  })();

  const termCount = (d: Discipline) => (d.term_count ?? 0);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-nav">term list</h1>

      {!loadingFilters && disciplines.length > 0 && (
        <div
          className="formulas-filter"
          style={{
            marginBottom: '30px',
            padding: '15px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            backgroundColor: '#f9fafb',
          }}
        >
          <div style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Filter by Discipline</h2>
              {selectedDisciplines.size > 0 && (
                <button type="button" onClick={clearFilters} className="formulas-filter-clear">
                  Clear All
                </button>
              )}
            </div>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0', display: keyboardHintVisible ? 'block' : 'none' }}>
              Keyboard: Tab to focus; Enter on +/− to expand or collapse; Space to check or uncheck.
            </p>
          </div>

          {selectedDisciplines.size > 0 && (
            <div style={{ marginBottom: '15px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {Array.from(selectedDisciplines).map(id => {
                const disc = disciplines.find(d => d.id === id);
                if (!disc) return null;
                return (
                  <span
                    key={id}
                    style={{
                      padding: '4px 12px',
                      backgroundColor: '#6b7c3d',
                      color: 'white',
                      borderRadius: '16px',
                      fontSize: '14px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    {disc.name}
                    <button
                      onClick={() => toggleDiscipline(id)}
                      style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '16px', padding: 0, marginLeft: '4px' }}
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" checked={includeChildren} onChange={(e) => setIncludeChildren(e.target.checked)} />
              <span style={{ fontSize: '14px' }}>Include child disciplines when selecting a parent</span>
            </label>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {parentDisciplines.map(parent => {
              const children = getChildren(parent.id);
              const isExpanded = expandedParents.has(parent.id);
              const isSelected = selectedDisciplines.has(parent.id);
              return (
                <div key={parent.id} style={{ border: '1px solid #d1d5db', borderRadius: '4px', padding: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {children.length > 0 && (
                      <button
                        type="button"
                        onClick={() => toggleParentExpansion(parent.id)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleParentExpansion(parent.id); } }}
                        aria-expanded={isExpanded}
                        aria-label={isExpanded ? `Collapse ${parent.name}` : `Expand ${parent.name}`}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '0 4px', width: '24px', textAlign: 'center' }}
                      >
                        {isExpanded ? '−' : '+'}
                      </button>
                    )}
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1 }}>
                      <input type="checkbox" checked={isSelected} onChange={() => toggleDiscipline(parent.id)} />
                      <span style={{ fontWeight: '600' }}>{parent.name}</span>
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>({termCount(parent)} terms)</span>
                    </label>
                  </div>
                  {isExpanded && children.length > 0 && (
                    <div style={{ marginLeft: '34px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {children.map(child => {
                        const isChildSelected = selectedDisciplines.has(child.id);
                        return (
                          <label key={child.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input type="checkbox" checked={isChildSelected} onChange={() => toggleDiscipline(child.id)} />
                            <span>{child.name}</span>
                            <span style={{ fontSize: '12px', color: '#6b7280' }}>({termCount(child)})</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bouncing-dots" aria-hidden><span /><span /><span /></div>
          <p className="mt-4 text-sm text-gray-500 dark:text-zinc-400">Loading terms…</p>
        </div>
      ) : error ? (
        <p style={{ color: 'red', fontWeight: 'bold' }}>Error: {error}</p>
      ) : terms.length === 0 ? (
        <p style={{ color: '#6b7280', fontSize: '16px', padding: '20px', textAlign: 'center' }}>
          No terms found. Try adjusting your filters.
        </p>
      ) : (
        <div className="w-full min-w-0 overflow-auto max-h-[70vh] rounded-lg border border-gray-200 dark:border-zinc-600">
          <table className="w-full max-w-full text-sm border-collapse table-fixed">
            <thead className="sticky top-0 z-10 bg-gray-100 dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-600">
              <tr>
                <th className="text-left p-2 text-black dark:text-white w-[30%] min-w-[160px]" style={{ fontSize: '18px', fontWeight: '600' }}>
                  Term Name
                </th>
                <th className="text-left p-2 text-black dark:text-white w-[70%] min-w-[200px]" style={{ fontSize: '18px', fontWeight: '600' }}>
                  Definition
                </th>
              </tr>
              <tr className="bg-gray-50 dark:bg-zinc-800/80 border-b border-gray-200 dark:border-zinc-600">
                <th className="p-1.5">
                  <input
                    type="text"
                    placeholder="Search names…"
                    value={tableFilterName}
                    onChange={(e) => setTableFilterName(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-200"
                  />
                </th>
                <th className="p-1.5">
                  <input
                    type="text"
                    placeholder="Search definitions…"
                    value={tableFilterDefinition}
                    onChange={(e) => setTableFilterDefinition(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-200"
                  />
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-zinc-900">
              {filteredTerms.length === 0 ? (
                <tr>
                  <td colSpan={2} className="p-4 text-center text-gray-500 dark:text-zinc-400">
                    {terms.length === 0 ? 'No terms found.' : 'No rows match the search.'}
                  </td>
                </tr>
              ) : (
                filteredTerms.map((term) => (
                  <tr key={term.id} className="border-b border-gray-100 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                    <td className="p-2">
                      <Link
                        href={(() => {
                          const params = new URLSearchParams();
                          if (selectedDisciplines.size > 0) {
                            params.set('disciplines', Array.from(selectedDisciplines).join(','));
                          }
                          if (!includeChildren) {
                            params.set('include_children', 'false');
                          }
                          const queryString = params.toString();
                          return `/term/${term.id}${queryString ? `?${queryString}` : ''}`;
                        })()}
                        className="text-[#6b7c3d] hover:underline font-semibold text-lg"
                      >
                        {term.term_name}
                      </Link>
                    </td>
                    <td className="p-2 text-gray-600 dark:text-zinc-400 text-base">{capitalizeSentences(term.definition)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && terms.length > 0 && (
        <p className="mt-2 text-xs text-gray-500 dark:text-zinc-400">
          Showing {filteredTerms.length} of {terms.length} term{terms.length !== 1 ? 's' : ''}
          {(tableFilterName || tableFilterDefinition || selectedDisciplines.size > 0) && ' (filtered)'}
        </p>
      )}
    </div>
  );
}

export default function Terms() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bouncing-dots" aria-hidden><span /><span /><span /></div>
          <p className="mt-4 text-sm text-gray-500 dark:text-zinc-400">Loading…</p>
        </div>
      }
    >
      <TermsContent />
    </Suspense>
  );
}
