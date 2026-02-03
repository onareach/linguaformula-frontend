// formulas/page.tsx

'use client'; 

import Link from 'next/link';
import { useEffect, useState } from 'react';  
import { MathJax, MathJaxContext } from 'better-react-mathjax'; 

// TypeScript interface for formula data
interface Formula {
  id: number;
  formula_name: string;
  latex: string;
  formula_description?: string | null;
}

export default function Formulas() {
  const [formulas, setFormulas] = useState<Formula[]>([]); 
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); 
  const [hoveredFormula, setHoveredFormula] = useState<number | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false); 

  useEffect(() => {
    // Detect if device supports touch (mobile devices)
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_API_URL) {
      // API URL is not defined
      setError("API URL is not set.");
      setLoading(false);
      return;
    }

    // Check for cached data in sessionStorage
    const cacheKey = 'linguaformula_formulas_cache';
    const cachedData = sessionStorage.getItem(cacheKey);
    
    if (cachedData) {
      try {
        const parsedData = JSON.parse(cachedData);
        setFormulas(parsedData);
        setLoading(false);
        // Still fetch in background to update cache, but don't show loading
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/formulas`)
          .then((res) => {
            if (res.ok) {
              return res.json();
            }
            return null;
          })
          .then((data) => {
            if (data) {
              sessionStorage.setItem(cacheKey, JSON.stringify(data));
              setFormulas(data);
            }
          })
          .catch(() => {
            // Silently fail background update
          });
        return;
      } catch (e) {
        // If cache is corrupted, clear it and fetch fresh data
        sessionStorage.removeItem(cacheKey);
      }
    }

    // No cache found, fetch from API
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/formulas`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setFormulas(data);
        // Cache the data in sessionStorage
        sessionStorage.setItem(cacheKey, JSON.stringify(data));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <MathJaxContext>
      <div>
        {/* Page title */}
        <h1 style={{
          marginBottom: '20px',
          fontSize: '32px',
          fontWeight: 'bold'
        }}>
          LinguaFormula
        </h1>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
            <div className="spinner"></div>
            <p style={{ color: '#666', fontSize: '16px', marginTop: '20px' }}>Loading formulas...</p>
          </div>
        ) : error ? (
          <p style={{ color: 'red', fontWeight: 'bold' }}>
            Error: {error}. Please check your API connection.
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
