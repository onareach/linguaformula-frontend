// formulas/page.tsx

'use client'; 

import Link from 'next/link';
import React, { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { MathJax, MathJaxContext } from 'better-react-mathjax'; 

// Error boundary so one formula's MathJax failure (e.g. dev Strict Mode) doesn't crash the list
class FormulaDisplayErrorBoundary extends React.Component<{
  formula: Formula;
  children: React.ReactNode;
}> {
  state = { hasError: false };

  static getDerivedStateFromError(): { hasError: true } {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <span style={{ whiteSpace: 'normal', display: 'inline-block', maxWidth: '80%', fontSize: '0.9em' }}>
          <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: 4 }}>{this.props.formula.latex ?? ''}</code>
        </span>
      );
    }
    return this.props.children;
  }
}

// TypeScript interfaces
interface Formula {
  id: number;
  formula_name: string;
  latex?: string | null;
  formula_description?: string | null;
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
}

function FormulasContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [formulas, setFormulas] = useState<Formula[]>([]); 
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); 
  const [loadingFilters, setLoadingFilters] = useState(true);
  const [hoveredFormula, setHoveredFormula] = useState<number | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [renderKey, setRenderKey] = useState(0);
  const [isRendering, setIsRendering] = useState(true); // Start as true to prevent initial render
  const formulasRef = useRef<Formula[]>([]);
  const typesetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelledRef = useRef(false);
  
  // Initialize filter state from URL params
  const getInitialDisciplines = (): Set<number> => {
    const disciplineIds = searchParams.get('disciplines');
    if (disciplineIds) {
      return new Set(disciplineIds.split(',').map(id => parseInt(id, 10)).filter(id => !isNaN(id)));
    }
    return new Set();
  };
  
  const getInitialIncludeChildren = (): boolean => {
    const include = searchParams.get('include_children');
    return include !== 'false'; // Default to true
  };
  
  const [selectedDisciplines, setSelectedDisciplines] = useState<Set<number>>(getInitialDisciplines());
  const [expandedParents, setExpandedParents] = useState<Set<number>>(new Set());
  const [includeChildren, setIncludeChildren] = useState(getInitialIncludeChildren());
  const [isInitialMount, setIsInitialMount] = useState(true);
  const [keyboardHintVisible, setKeyboardHintVisible] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') setKeyboardHintVisible(true);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    // Detect if device supports touch (mobile devices)
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  // Fetch disciplines
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_API_URL) {
      setError("API URL is not configured. Please check your environment variables.");
      setLoadingFilters(false);
      return;
    }

    // Only fetch if we don't already have disciplines
    if (disciplines.length > 0) {
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/disciplines`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setDisciplines(data);
        setLoadingFilters(false);
        
        // Expand parent disciplines if any of their children are selected from URL params
        const disciplineIds = searchParams.get('disciplines');
        if (disciplineIds) {
          const selectedIds = disciplineIds.split(',').map(id => parseInt(id, 10)).filter(id => !isNaN(id));
          const parentsToExpand = new Set<number>();
          data.forEach((disc: Discipline) => {
            if (disc.parent_id && selectedIds.includes(disc.id)) {
              parentsToExpand.add(disc.parent_id);
            }
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
        const errorMessage = err.message === 'Failed to fetch' 
          ? 'Unable to connect to the API. Please ensure the backend server is running at ' + process.env.NEXT_PUBLIC_API_URL
          : `Error fetching disciplines: ${err.message}`;
        setError(errorMessage);
        setLoadingFilters(false);
      });
  }, [searchParams, disciplines.length]);

  // Fetch formulas (with optional filtering)
  useEffect(() => {
    cancelledRef.current = false;
    if (!process.env.NEXT_PUBLIC_API_URL) {
      setError("API URL is not set.");
      setLoading(false);
      return;
    }

    setLoading(true);

    // Build API URL with discipline filters
    const apiUrl = new URL(`${process.env.NEXT_PUBLIC_API_URL}/api/formulas`);
    if (selectedDisciplines.size > 0) {
      Array.from(selectedDisciplines).forEach(id => {
        apiUrl.searchParams.append('discipline_id', id.toString());
      });
      apiUrl.searchParams.append('include_children', includeChildren.toString());
    }

    fetch(apiUrl.toString())
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (cancelledRef.current) return;
        formulasRef.current = data;
        setFormulas(data);
        setLoading(false);
        setIsRendering(true);
        // Clear any previous timeout (e.g. from Strict Mode remount)
        if (typesetTimeoutRef.current) {
          clearTimeout(typesetTimeoutRef.current);
          typesetTimeoutRef.current = null;
        }
        // Delay MathJax until DOM is stable; use rAF so we're past any unmount (e.g. Strict Mode)
        typesetTimeoutRef.current = setTimeout(() => {
          typesetTimeoutRef.current = null;
          if (cancelledRef.current) return;
          requestAnimationFrame(() => {
            if (cancelledRef.current) return;
            setIsRendering(false);
            setRenderKey(prev => prev + 1);
          });
        }, 200);
      })
      .catch((err) => {
        if (!cancelledRef.current) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      cancelledRef.current = true;
      if (typesetTimeoutRef.current) {
        clearTimeout(typesetTimeoutRef.current);
        typesetTimeoutRef.current = null;
      }
    };
  }, [selectedDisciplines, includeChildren]);

  // Mark initial mount as complete after first render
  useEffect(() => {
    setIsInitialMount(false);
  }, []);

  // Update URL when filters change (using useEffect to avoid render-time updates)
  // Skip URL update on initial mount to prevent re-render issues
  useEffect(() => {
    if (isInitialMount) {
      return;
    }
    
    const params = new URLSearchParams();
    if (selectedDisciplines.size > 0) {
      params.set('disciplines', Array.from(selectedDisciplines).join(','));
    }
    if (!includeChildren) {
      params.set('include_children', 'false');
    }
    const newUrl = params.toString() ? `/formulas?${params.toString()}` : '/formulas';
    const currentUrl = window.location.pathname + window.location.search;
    if (newUrl !== currentUrl) {
      // Use setTimeout to defer URL update until after render completes
      setTimeout(() => {
        router.replace(newUrl, { scroll: false });
      }, 0);
    }
  }, [selectedDisciplines, includeChildren, router, isInitialMount]);

  const toggleDiscipline = (disciplineId: number) => {
    setSelectedDisciplines(prev => {
      const newSet = new Set(prev);
      if (newSet.has(disciplineId)) {
        newSet.delete(disciplineId);
      } else {
        newSet.add(disciplineId);
      }
      return newSet;
    });
  };

  const toggleParentExpansion = (parentId: number) => {
    setExpandedParents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(parentId)) {
        newSet.delete(parentId);
      } else {
        newSet.add(parentId);
      }
      return newSet;
    });
  };

  const clearFilters = () => {
    setSelectedDisciplines(new Set());
  };

  // Organize disciplines into hierarchy
  const parentDisciplines = disciplines.filter(d => !d.parent_id);
  const childDisciplines = disciplines.filter(d => d.parent_id);
  
  const getChildren = (parentId: number) => {
    return childDisciplines.filter(d => d.parent_id === parentId);
  };

  return (
    <MathJaxContext>
      <div>
        {/* Page title */}
        <h1 style={{
          marginBottom: '20px',
          fontSize: '32px',
          fontWeight: 'bold'
        }}>
          Lingua Formula
        </h1>

        {/* Discipline Filter Section */}
        {!loadingFilters && disciplines.length > 0 && (
          <div style={{
            marginBottom: '30px',
            padding: '15px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            backgroundColor: '#f9fafb'
          }}>
            <div style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Filter by Discipline</h2>
                {selectedDisciplines.size > 0 && (
                <button
                  onClick={clearFilters}
                  style={{
                    padding: '6px 12px',
                    fontSize: '14px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Clear All
                </button>
              )}
              </div>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0', display: keyboardHintVisible ? 'block' : 'none' }}>Keyboard: Tab to focus; Enter on +/− to expand or collapse; Space to check or uncheck.</p>
            </div>

            {/* Active Filters */}
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
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        borderRadius: '16px',
                        fontSize: '14px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      {disc.name}
                      <button
                        onClick={() => toggleDiscipline(id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '16px',
                          padding: 0,
                          marginLeft: '4px'
                        }}
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
            )}

            {/* Include Children Toggle */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={includeChildren}
                  onChange={(e) => {
                    setIncludeChildren(e.target.checked);
                  }}
                />
                <span style={{ fontSize: '14px' }}>Include child disciplines when selecting a parent</span>
              </label>
            </div>

            {/* Discipline Tree */}
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
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              toggleParentExpansion(parent.id);
                            }
                          }}
                          aria-expanded={isExpanded}
                          aria-label={isExpanded ? `Collapse ${parent.name}` : `Expand ${parent.name}`}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '16px',
                            padding: '0 4px',
                            width: '24px',
                            textAlign: 'center'
                          }}
                        >
                          {isExpanded ? '−' : '+'}
                        </button>
                      )}
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1 }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleDiscipline(parent.id)}
                        />
                        <span style={{ fontWeight: '600' }}>{parent.name}</span>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>({parent.formula_count} formulas)</span>
                      </label>
                    </div>
                    
                    {/* Child Disciplines */}
                    {isExpanded && children.length > 0 && (
                      <div style={{ marginLeft: '34px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {children.map(child => {
                          const isChildSelected = selectedDisciplines.has(child.id);
                          return (
                            <label
                              key={child.id}
                              style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                            >
                              <input
                                type="checkbox"
                                checked={isChildSelected}
                                onChange={() => toggleDiscipline(child.id)}
                              />
                              <span>{child.name}</span>
                              <span style={{ fontSize: '12px', color: '#6b7280' }}>({child.formula_count})</span>
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

        {/* Results Count */}
        {!loading && !error && (
          <div style={{ marginBottom: '15px', color: '#6b7280', fontSize: '14px' }}>
            Showing {formulas.length} formula{formulas.length !== 1 ? 's' : ''}
            {selectedDisciplines.size > 0 && ` (filtered)`}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bouncing-dots" aria-hidden>
              <span /><span /><span />
            </div>
            <p className="mt-4 text-sm text-gray-500 dark:text-zinc-400">Loading formulas…</p>
          </div>
        ) : error ? (
          <p style={{ color: 'red', fontWeight: 'bold' }}>
            Error: {error}. Please check your API connection.
          </p>
        ) : formulas.length === 0 ? (
          <p style={{ color: '#6b7280', fontSize: '16px', padding: '20px', textAlign: 'center' }}>
            No formulas found. Try adjusting your filters.
          </p>
        ) : (
          <ul>
            {formulas.map((formula) => (
              <li key={formula.id} style={{ marginBottom: '15px', position: 'relative' }}>
                {/* Conditionally render as hyperlink only if formula_description exists */}
                {formula.formula_description ? (
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
                      return `/formula/${formula.id}${queryString ? `?${queryString}` : ''}`;
                    })()}
                    style={{ textDecoration: 'underline', color: 'blue', cursor: 'pointer' }}
                    onMouseEnter={() => !isTouchDevice && setHoveredFormula(formula.id)}
                    onMouseLeave={() => !isTouchDevice && setHoveredFormula(null)}
                    onTouchStart={() => setHoveredFormula(null)}
                  >
                    <strong>{formula.formula_name}</strong>
                  </Link>
                ) : (
                  <strong>{formula.formula_name}</strong>
                )}

                {/* Tooltip - only shown if formula_description exists and not on touch device */}
                {hoveredFormula === formula.id && formula.formula_description && !isTouchDevice && (
                  <div 
                    style={{
                      position: "absolute",
                      background: "white",
                      padding: "10px",
                      border: "1px solid gray",
                      borderRadius: "5px",
                      boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                      top: "30px",
                      left: "0",
                      width: "250px",
                      zIndex: 10
                    }}
                  >
                    {formula.formula_description && (
                      <MathJax key={`tooltip-${formula.id}-${renderKey}`}>{formula.formula_description}</MathJax>
                    )}
                  </div>
                )}

                {/* MathJax formula display - only render when stable; boundary avoids crash if typeset fails (e.g. dev Strict Mode) */}
                {formula.latex && !loading && !isRendering && formulasRef.current.length > 0 ? (
                  <FormulaDisplayErrorBoundary formula={formula}>
                    <div key={`formula-wrapper-${formula.id}-${renderKey}`}>
                      <MathJax key={`formula-${formula.id}-${renderKey}`}>
                        <span style={{ whiteSpace: 'normal', display: 'inline-block', maxWidth: '80%' }}>
                          {`\\(${formula.latex}\\)`}
                        </span>
                      </MathJax>
                    </div>
                  </FormulaDisplayErrorBoundary>
                ) : formula.latex ? (
                  <span style={{ color: '#6b7280', fontStyle: 'italic' }}>Loading formula...</span>
                ) : (
                  <span style={{ color: '#6b7280', fontStyle: 'italic' }}>No formula available</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </MathJaxContext>
  );
}

export default function Formulas() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="bouncing-dots" aria-hidden>
          <span /><span /><span />
        </div>
        <p className="mt-4 text-sm text-gray-500 dark:text-zinc-400">Loading…</p>
      </div>
    }>
      <FormulasContent />
    </Suspense>
  );
}
