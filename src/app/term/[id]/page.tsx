"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";

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

function TermPageContent() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const [term, setTerm] = useState<Term | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getBackLink = () => {
    const params = new URLSearchParams();
    const disciplines = searchParams.get("disciplines");
    const includeChildren = searchParams.get("include_children");
    if (disciplines) params.set("disciplines", disciplines);
    if (includeChildren === "false") params.set("include_children", "false");
    const queryString = params.toString();
    return `/terms${queryString ? `?${queryString}` : ""}`;
  };

  useEffect(() => {
    if (!id) {
      setError("Term ID is missing.");
      setLoading(false);
      return;
    }
    if (!process.env.NEXT_PUBLIC_API_URL) {
      setError("API URL is not set.");
      setLoading(false);
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/terms/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Term not found (HTTP ${res.status})`);
        return res.json();
      })
      .then((data) => {
        setTerm(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p>Loading term...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <Link
        href={getBackLink()}
        style={{
          textDecoration: "underline",
          color: "#556b2f",
          cursor: "pointer",
          display: "inline-block",
          marginBottom: "16px",
        }}
      >
        ← Back to Term List
      </Link>
      <h1
        style={{
          marginBottom: "20px",
          color: "black",
          fontSize: "32px",
          fontWeight: "bold",
        }}
      >
        {term?.term_name}
      </h1>
      <p style={{ marginBottom: "16px" }}>
        <Link
          href={`/term/${id}/quiz`}
          style={{ color: "#556b2f", textDecoration: "underline", fontWeight: 500 }}
        >
          Quiz Me!
        </Link>
      </p>
      {term?.definition && (
        <div style={{ marginBottom: "24px" }}>
          <p style={{ marginBottom: "8px", fontWeight: "bold", fontSize: "18px" }}>
            Definition:
          </p>
          <p style={{ color: "#555", fontSize: "18px" }}>{capitalizeSentences(term.definition)}</p>
        </div>
      )}
      <Link
        href={getBackLink()}
        style={{ textDecoration: "underline", color: "#556b2f", cursor: "pointer" }}
      >
        ← Back to Term List
      </Link>
    </div>
  );
}

export default function TermPage() {
  return (
    <Suspense fallback={<p>Loading term...</p>}>
      <TermPageContent />
    </Suspense>
  );
}
