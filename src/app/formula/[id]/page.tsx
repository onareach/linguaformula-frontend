"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { MathJax, MathJaxContext } from "better-react-mathjax";

interface Formula {
  id: number;
  formula_name: string;
  latex: string;
  formula_description: string;
  english_verbalization?: string;
}

function FormulaPageContent() {
  const { id } = useParams(); // Get formula ID from URL
  const searchParams = useSearchParams();
  const [formula, setFormula] = useState<Formula | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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
      <h1 style={{
          marginBottom: '20px',
          color: 'black',
          fontSize: '32px',
          fontWeight: 'bold'
        }}>
          {formula?.formula_name}
        </h1>
        <MathJaxContext>
          <MathJax>    
            <p style={{ marginBottom: "24px" }}><strong>Full Description:</strong> {formula?.formula_description}</p>
          </MathJax>
          <MathJax>
            <p style={{ fontSize: "24px", marginBottom: "20px" }}>{`\\(${formula?.latex}\\)`}</p>
          </MathJax>
          {formula?.english_verbalization && (
            <p style={{ 
              marginTop: "16px", 
              marginBottom: "24px", 
              fontStyle: "italic",
              color: "#555",
              fontSize: "18px"
            }}>
              <strong>In words:</strong> {formula.english_verbalization}
            </p>
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
