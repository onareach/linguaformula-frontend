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
  variables?: Variable[];
  keywords?: Keyword[];
  examples?: Example[];
  prerequisites?: Prerequisite[];
  helper_formulas?: HelperFormula[];
}

interface Variable {
  name: string;
  type: string;
  description: string;
}

interface Keyword {
  keyword: string;
  type: string;
  weight: number;
}

interface Example {
  title: string;
  problem: string;
  given_values: Record<string, number>;
  solution: string;
  answer: string;
}

interface Prerequisite {
  concept: string;
  importance: string;
  description: string;
}

interface HelperFormula {
  id: number;
  relationship: string;
  context: string;
  formula_name?: string;
  latex?: string;
}

interface Application {
  id: number;
  title: string;
  problem_text: string;
  subject_area?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export default function Tables() {
  const [activeTable, setActiveTable] = useState<string>('formulas');
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedFormula, setSelectedFormula] = useState<Formula | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    loadData();
  }, [activeTable]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (activeTable === 'formulas') {
        const response = await fetch(`${apiUrl}/api/formulas`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        setFormulas(data);
      } else if (activeTable === 'applications') {
        const response = await fetch(`${apiUrl}/api/applications`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        setApplications(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const loadFormulaDetails = async (formulaId: number) => {
    try {
      const response = await fetch(`${apiUrl}/api/formulas/${formulaId}`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      setSelectedFormula(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  const getDifficultyColor = (level: string | null | undefined) => {
    switch (level?.toLowerCase()) {
      case 'beginner': return '#28a745';
      case 'intermediate': return '#ffc107';
      case 'advanced': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const renderFormulasTable = () => (
    <div>
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div style={{ flex: 1 }}>
          <h3>Formulas ({formulas.length})</h3>
          <div style={{ maxHeight: '600px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f8f9fa', position: 'sticky', top: 0 }}>
                <tr>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>ID</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Name</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {formulas.map((formula) => (
                  <tr key={formula.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>{formula.id}</td>
                    <td style={{ padding: '12px' }}>
                      <strong>{formula.formula_name}</strong>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <button
                        onClick={() => loadFormulaDetails(formula.id)}
                        style={{
                          backgroundColor: '#007bff',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selectedFormula && (
          <div style={{ flex: 1, border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
            <h3>Formula Details</h3>
            <div style={{ marginBottom: '15px' }}>
              <h4>{selectedFormula.formula_name}</h4>
              <MathJax>{`\\(${selectedFormula.latex}\\)`}</MathJax>
            </div>

            {selectedFormula.formula_description && (
              <div style={{ marginBottom: '15px' }}>
                <strong>Description:</strong>
                <p>{selectedFormula.formula_description}</p>
              </div>
            )}

            {selectedFormula.variables && selectedFormula.variables.length > 0 && (
              <div style={{ marginBottom: '15px' }}>
                <strong>Variables:</strong>
                <ul>
                  {selectedFormula.variables.map((variable, index) => (
                    <li key={index}>
                      <strong>{variable.name}</strong> ({variable.type}): {variable.description}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selectedFormula.keywords && selectedFormula.keywords.length > 0 && (
              <div style={{ marginBottom: '15px' }}>
                <strong>Keywords:</strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {selectedFormula.keywords.map((keyword, index) => (
                    <span key={index} style={{
                      backgroundColor: '#e9ecef',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      {keyword.keyword} ({keyword.type})
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedFormula.examples && selectedFormula.examples.length > 0 && (
              <div style={{ marginBottom: '15px' }}>
                <strong>Examples:</strong>
                {selectedFormula.examples.map((example, index) => (
                  <div key={index} style={{ 
                    backgroundColor: '#f8f9fa', 
                    padding: '10px', 
                    borderRadius: '4px',
                    marginTop: '5px'
                  }}>
                    <strong>{example.title}</strong>
                    <p style={{ fontSize: '14px', margin: '5px 0' }}>{example.problem}</p>
                    <p style={{ fontSize: '12px', color: '#666' }}>Answer: {example.answer}</p>
                  </div>
                ))}
              </div>
            )}

            {selectedFormula.prerequisites && selectedFormula.prerequisites.length > 0 && (
              <div style={{ marginBottom: '15px' }}>
                <strong>Prerequisites:</strong>
                <ul>
                  {selectedFormula.prerequisites.map((prereq, index) => (
                    <li key={index}>
                      <strong>{prereq.concept}</strong> ({prereq.importance}): {prereq.description}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderApplicationsTable = () => (
    <div>
      <h3>Applications ({applications.length})</h3>
      <div style={{ maxHeight: '600px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f8f9fa', position: 'sticky', top: 0 }}>
            <tr>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>ID</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Title</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Subject Area</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Created</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Problem Text</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((application) => (
              <tr key={application.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}>{application.id}</td>
                <td style={{ padding: '12px' }}>
                  <Link 
                    href={`/applications/${application.id}`}
                    style={{ color: '#556b2f', textDecoration: 'underline' }}
                  >
                    {application.title}
                  </Link>
                </td>
                <td style={{ padding: '12px' }}>
                  {application.subject_area && (
                    <span style={{ 
                      backgroundColor: '#e9ecef', 
                      padding: '2px 8px', 
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      {application.subject_area}
                    </span>
                  )}
                </td>
                <td style={{ padding: '12px', fontSize: '12px' }}>
                  {formatDate(application.created_at || null)}
                </td>
                <td style={{ padding: '12px', maxWidth: '300px' }}>
                  <div style={{ 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    whiteSpace: 'nowrap',
                    fontSize: '14px'
                  }}>
                    {application.problem_text}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <MathJaxContext>
      <div style={{ marginLeft: '20px', marginTop: '20px', marginRight: '20px' }}>
        {/* Navigation */}
        <div style={{ marginBottom: '20px' }}>
          <Link href="/" style={{ 
            textDecoration: 'underline', 
            color: '#556b2f', 
            marginRight: '20px' 
          }}>
            ← Back to Home
          </Link>
          <Link href="/applications" style={{ 
            textDecoration: 'underline', 
            color: '#556b2f',
            marginRight: '20px'
          }}>
            View Applications
          </Link>
          <Link href="/tables/search" style={{ 
            textDecoration: 'underline', 
            color: '#556b2f'
          }}>
            Advanced Search
          </Link>
        </div>

        {/* Page title */}
        <h1 style={{
          marginBottom: '20px',
          color: 'black',
          fontSize: '32px',
          fontWeight: 'bold'
        }}>
          Database Tables Management
        </h1>

        {/* Table selector */}
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={() => setActiveTable('formulas')}
            style={{
              backgroundColor: activeTable === 'formulas' ? '#007bff' : '#6c757d',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            Formulas Table
          </button>
          <button
            onClick={() => setActiveTable('applications')}
            style={{
              backgroundColor: activeTable === 'applications' ? '#007bff' : '#6c757d',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Applications Table
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <p>Loading {activeTable}...</p>
        ) : error ? (
          <p style={{ color: 'red', fontWeight: 'bold' }}>
            Error: {error}. Please check your API connection.
          </p>
        ) : (
          <div>
            {activeTable === 'formulas' && renderFormulasTable()}
            {activeTable === 'applications' && renderApplicationsTable()}
          </div>
        )}
      </div>
    </MathJaxContext>
  );
}
