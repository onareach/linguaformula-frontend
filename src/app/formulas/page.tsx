// formulas/page.tsx

'use client'; 

import Link from 'next/link';
import { useEffect, useState } from 'react';  
import { MathJax, MathJaxContext } from 'better-react-mathjax'; 

// TypeScript interfaces
interface Formula {
  id: number;
  formula_name: string;
  latex: string;
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

export default function Formulas() {
  const [formulas, setFormulas] = useState<Formula[]>([]); 
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); 
  const [loadingFilters, setLoadingFilters] = useState(true);
  const [hoveredFormula, setHoveredFormula] = useState<number | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [selectedDisciplines, setSelectedDisciplines] = useState<Set<number>>(new Set());
  const [expandedParents, setExpandedParents] = useState<Set<number>>(new Set());
  const [includeChildren, setIncludeChildren] = useState(true);

  useEffect(() => {
    // Detect if device supports touch (mobile devices)
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  // Fetch disciplines
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_API_URL) {
      setLoadingFilters(false);
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
      })
      .catch((err) => {
        console.error('Error fetching disciplines:', err);
        setLoadingFilters(false);
      });
  }, []);

  // Fetch formulas (with optional filtering)
  useEffect(() => {
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
        setFormulas(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [selectedDisciplines, includeChildren]);

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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
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
                  onChange={(e) => setIncludeChildren(e.target.checked)}
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
                          onClick={() => toggleParentExpansion(parent.id)}
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
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
            <div className="spinner"></div>
            <p style={{ color: '#666', fontSize: '16px', marginTop: '20px' }}>Loading formulas...</p>
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
                    href={`/formula/${formula.id}`} 
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
                    <MathJax>{formula.formula_description}</MathJax>
                  </div>
                )}

                {/* MathJax formula display */}
                <MathJax>
                  <span style={{ whiteSpace: 'normal', display: 'inline-block', maxWidth: '80%' }}>
                    {`\\(${formula.latex}\\)`}
                  </span>
                </MathJax>
              </li>
            ))}
          </ul>
        )}
      </div>
    </MathJaxContext>
  );
}
