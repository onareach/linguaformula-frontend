"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { MathJax, MathJaxContext } from "better-react-mathjax";

interface Formula {
  id: number;
  formula_name: string;
  latex?: string | null;
  formula_description?: string | null;
  english_verbalization?: string;
  symbolic_verbalization?: string;
  units?: string;
  example?: string;
  historical_context?: string;
}

function FormulaPageContent() {
  const { id } = useParams(); // Get formula ID from URL
  const searchParams = useSearchParams();
  const [formula, setFormula] = useState<Formula | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [renderKey, setRenderKey] = useState(0);
  const [isRendering, setIsRendering] = useState(false);
  
  // Build back link with preserved filter parameters
  const getBackLink = () => {
    const params = new URLSearchParams();
    const disciplines = searchParams.get('disciplines');
    const includeChildren = searchParams.get('include_children');
    
    if (disciplines) {
      params.set('disciplines', disciplines);
    }
    if (includeChildren === 'false') {
      params.set('include_children', 'false');
    }
    
    const queryString = params.toString();
    return `/formulas${queryString ? `?${queryString}` : ''}`;
  };

  useEffect(() => {
    // Check if ID is correctly retrieved
    if (!id) {
      setError("Formula ID is missing.");
      setLoading(false);
      return;
    }

    if (!process.env.NEXT_PUBLIC_API_URL) {
      // Log error for API URL not being defined
      setError("API URL is not set.");
      setLoading(false);
      return;
    }

    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/formulas/${id}`;
    
    fetch(apiUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Formula not found (HTTP ${response.status})`);
        }
        return response.json();
      })
      .then((data) => {
        setFormula(data);
        setLoading(false);
        // Delay MathJax rendering to ensure DOM is stable
        setIsRendering(true);
        setTimeout(() => {
          setIsRendering(false);
          setRenderKey(prev => prev + 1);
        }, 150);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p>Loading formula...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <Link
        href={getBackLink()}
        style={{ 
          textDecoration: "underline", 
          color: "blue", 
          cursor: "pointer",
          display: "inline-block",
          marginBottom: "16px"
        }}
      >
        ← Back to Formula List
      </Link>
      <h1 style={{
          marginBottom: '20px',
          color: 'black',
          fontSize: '32px',
          fontWeight: 'bold'
        }}>
          {formula?.formula_name}
        </h1>
        <MathJaxContext>
          {formula?.formula_description && !isRendering && (
            <MathJax key={`description-${renderKey}`}>    
              <p style={{ marginBottom: "24px" }}><strong>Full Description:</strong> {formula.formula_description}</p>
            </MathJax>
          )}
          {formula?.latex && !isRendering && (
            <MathJax key={`formula-${renderKey}`}>
              <p style={{ fontSize: "24px", marginBottom: "20px" }}>{`\\(${formula.latex}\\)`}</p>
            </MathJax>
          )}
          {formula?.english_verbalization && (
            <div style={{ marginTop: "24px", marginBottom: "24px" }}>
              <p style={{ 
                marginBottom: "8px",
                fontWeight: "bold",
                fontSize: "18px"
              }}>
                In words:
              </p>
              <p style={{ 
                fontStyle: "italic",
                color: "#555",
                fontSize: "16px"
              }}>
                {formula.english_verbalization}
              </p>
            </div>
          )}
          {formula?.symbolic_verbalization && (
            <div style={{ marginTop: "24px", marginBottom: "24px" }}>
              <p style={{ 
                marginBottom: "8px",
                fontWeight: "bold",
                fontSize: "18px"
              }}>
                Pronunciation:
              </p>
              <p style={{ 
                color: "#555",
                fontSize: "16px"
              }}>
                {formula.symbolic_verbalization}
              </p>
            </div>
          )}
          {formula?.units && (
            <div style={{ marginTop: "24px", marginBottom: "24px" }}>
              <p style={{ 
                marginBottom: "8px",
                fontWeight: "bold",
                fontSize: "18px"
              }}>
                Units:
              </p>
              <p style={{ 
                color: "#555",
                fontSize: "16px"
              }}>
                {formula.units}
              </p>
            </div>
          )}
          {formula?.example && (
            <div style={{ marginTop: "24px", marginBottom: "24px" }}>
              <p style={{ 
                marginBottom: "8px",
                fontWeight: "bold",
                fontSize: "18px"
              }}>
                Example:
              </p>
              <p style={{ 
                color: "#555",
                fontSize: "16px"
              }}>
                {formula.example}
              </p>
            </div>
          )}
          {formula?.historical_context && (
            <div style={{ marginTop: "24px", marginBottom: "24px" }}>
              <p style={{ 
                marginBottom: "8px",
                fontWeight: "bold",
                fontSize: "18px"
              }}>
                Historical Context:
              </p>
              <p style={{ 
                color: "#555",
                fontSize: "16px"
              }}>
                {formula.historical_context}
              </p>
            </div>
          )}
        </MathJaxContext>
      <Link
        href={getBackLink()}
        style={{ textDecoration: "underline", color: "blue", cursor: "pointer" }}
      >
        ← Back to Formula List
      </Link>
    </div>
  );
}

export default function FormulaPage() {
  return (
    <Suspense fallback={<p>Loading formula...</p>}>
      <FormulaPageContent />
    </Suspense>
  );
}
