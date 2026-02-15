'use client';

import Link from 'next/link';
import { useState } from 'react';
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

interface ProblemMatch {
  formula: Formula;
  relevance_score: number;
  match_reasons: string[];
}

interface MatchResult {
  matches: ProblemMatch[];
  total_matches: number;
}

export default function AdvancedSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [problemText, setProblemText] = useState('');
  const [searchResults, setSearchResults] = useState<Formula[]>([]);
  const [problemMatches, setProblemMatches] = useState<ProblemMatch[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState<'formula' | 'problem'>('formula');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const handleFormulaSearch = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);

      const response = await fetch(`${apiUrl}/api/formulas/search?${params}`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      setSearchResults(data);
      setProblemMatches([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleProblemMatch = async () => {
    if (!problemText.trim()) {
      setError('Please enter a problem description');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${apiUrl}/api/problems/match`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          problem_text: problemText
        })
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data: MatchResult = await response.json();
      setProblemMatches(data.matches);
      setSearchResults([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 10) return '#28a745';
    if (score >= 5) return '#ffc107';
    return '#dc3545';
  };

  return (
    <MathJaxContext>
      <div style={{ marginLeft: '20px', marginTop: '20px', marginRight: '20px' }}>
        {/* Navigation */}
        <div style={{ marginBottom: '20px' }}>
          <Link href="/tables" className="text-[#6b7c3d] visited:text-[#6b7c3d] hover:underline font-semibold mr-5">
            ← Back to Tables
          </Link>
          <Link href="/" style={{ 
            textDecoration: 'underline', 
            color: '#556b2f'
          }}>
            Home
          </Link>
        </div>

        {/* Page title */}
        <h1 style={{
          marginBottom: '20px',
          color: 'black',
          fontSize: '32px',
          fontWeight: 'bold'
        }}>
          Advanced Search & Problem Matching
        </h1>

        {/* Search type selector */}
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={() => setSearchType('formula')}
            style={{
              backgroundColor: searchType === 'formula' ? '#007bff' : '#6c757d',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            Formula Search
          </button>
          <button
            onClick={() => setSearchType('problem')}
            style={{
              backgroundColor: searchType === 'problem' ? '#007bff' : '#6c757d',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Problem Matching
          </button>
        </div>

        {/* Search forms */}
        {searchType === 'formula' ? (
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '20px', 
            borderRadius: '8px', 
            marginBottom: '20px' 
          }}>
            <h3>Formula Search</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Search Query:
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter formula name or description..."
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>
            </div>
            <button
              onClick={handleFormulaSearch}
              disabled={loading}
              style={{
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Searching...' : 'Search Formulas'}
            </button>
          </div>
        ) : (
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '20px', 
            borderRadius: '8px', 
            marginBottom: '20px' 
          }}>
            <h3>Problem Matching</h3>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Problem Description:
              </label>
              <textarea
                value={problemText}
                onChange={(e) => setProblemText(e.target.value)}
                placeholder="Describe your problem here. Include any relevant details, keywords, or context..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  resize: 'vertical'
                }}
              />
            </div>
            <button
              onClick={handleProblemMatch}
              disabled={loading || !problemText.trim()}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                cursor: loading || !problemText.trim() ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Matching...' : 'Find Matching Formulas'}
            </button>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div style={{ 
            backgroundColor: '#f8d7da', 
            color: '#721c24', 
            padding: '10px', 
            borderRadius: '4px', 
            marginBottom: '20px' 
          }}>
            Error: {error}
          </div>
        )}

        {/* Results */}
        {searchResults.length > 0 && (
          <div>
            <h3>Search Results ({searchResults.length} formulas found)</h3>
            <div style={{ display: 'grid', gap: '15px' }}>
              {searchResults.map((formula) => (
                <div key={formula.id} style={{ 
                  border: '1px solid #ddd', 
                  borderRadius: '8px', 
                  padding: '15px',
                  backgroundColor: 'white'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 10px 0' }}>{formula.formula_name}</h4>
                      <MathJax>{`\\(${formula.latex}\\)`}</MathJax>
                      {formula.formula_description && (
                        <p style={{ margin: '10px 0', color: '#666' }}>{formula.formula_description}</p>
                      )}
                    </div>
                    {/* category/difficulty_level removed from schema */}
                  </div>
                  
                  {formula.keywords && formula.keywords.length > 0 && (
                    <div style={{ marginTop: '10px' }}>
                      <strong style={{ fontSize: '14px' }}>Keywords: </strong>
                      {formula.keywords.map((keyword, index) => (
                        <span key={index} style={{
                          backgroundColor: '#e9ecef',
                          padding: '2px 6px',
                          borderRadius: '3px',
                          fontSize: '11px',
                          marginRight: '5px'
                        }}>
                          {keyword.keyword}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {problemMatches.length > 0 && (
          <div>
            <h3>Problem Matches ({problemMatches.length} formulas found)</h3>
            <div style={{ display: 'grid', gap: '15px' }}>
              {problemMatches.map((match, index) => (
                <div key={index} style={{ 
                  border: '1px solid #ddd', 
                  borderRadius: '8px', 
                  padding: '15px',
                  backgroundColor: 'white'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <h4 style={{ margin: 0 }}>{match.formula.formula_name}</h4>
                        <span style={{
                          backgroundColor: getScoreColor(match.relevance_score),
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          Score: {match.relevance_score.toFixed(1)}
                        </span>
                      </div>
                      <MathJax>{`\\(${match.formula.latex}\\)`}</MathJax>
                      {match.formula.formula_description && (
                        <p style={{ margin: '10px 0', color: '#666' }}>{match.formula.formula_description}</p>
                      )}
                    </div>
                    {/* category/difficulty_level removed from schema */}
                  </div>
                  
                  <div style={{ marginTop: '10px' }}>
                    <strong style={{ fontSize: '14px' }}>Match Reasons: </strong>
                    <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                      {match.match_reasons.map((reason, reasonIndex) => (
                        <li key={reasonIndex} style={{ fontSize: '13px', color: '#666' }}>{reason}</li>
                      ))}
                    </ul>
                  </div>

                  {match.formula.variables && match.formula.variables.length > 0 && (
                    <div style={{ marginTop: '10px' }}>
                      <strong style={{ fontSize: '14px' }}>Variables: </strong>
                      <div style={{ fontSize: '13px', color: '#666' }}>
                        {match.formula.variables.map((variable, varIndex) => (
                          <span key={varIndex} style={{ marginRight: '10px' }}>
                            <strong>{variable.name}</strong> ({variable.type})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && searchResults.length === 0 && problemMatches.length === 0 && !error && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <p>No results yet. Use the search forms above to find formulas or match problems.</p>
          </div>
        )}
      </div>
    </MathJaxContext>
  );
}
