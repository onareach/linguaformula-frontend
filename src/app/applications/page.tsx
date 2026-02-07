// applications/page.tsx

'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

// TypeScript interface for application data
interface Application {
  id: number;
  title: string;
  problem_text: string;
  subject_area?: string | null;
  difficulty_level?: string | null;
  created_at?: string | null;
}

export default function Applications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_API_URL) {
      setError("API URL is not set.");
      setLoading(false);
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/applications`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setApplications(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

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

  return (
    <div style={{ marginLeft: '20px', marginTop: '20px', marginRight: '20px' }}>
      {/* Navigation */}
      <div style={{ marginBottom: '20px' }}>
        <Link href="/" style={{ 
          textDecoration: 'underline', 
          color: '#556b2f', 
          marginRight: '20px' 
        }}>
          ← Back to Formulas
        </Link>
        <Link href="/applications/create" style={{ 
          textDecoration: 'underline', 
          color: '#556b2f' 
        }}>
          + Create New Application
        </Link>
      </div>

      {/* Page title */}
      <h1 style={{
        marginBottom: '20px',
        color: 'black',
        fontSize: '32px',
        fontWeight: 'bold'
      }}>
        Problem Applications
      </h1>

      {loading ? (
        <p>Loading applications...</p>
      ) : error ? (
        <p style={{ color: 'red', fontWeight: 'bold' }}>
          Error: {error}. Please check your API connection.
        </p>
      ) : applications.length === 0 ? (
        <div>
          <p>No applications found.</p>
          <Link href="/applications/create" style={{ 
            textDecoration: 'underline', 
            color: '#556b2f' 
          }}>
            Create the first application
          </Link>
        </div>
      ) : (
        <div>
          {applications.map((application) => (
            <div key={application.id} style={{ 
              marginBottom: '25px', 
              padding: '15px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              backgroundColor: '#f9f9f9'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <Link 
                    href={`/applications/${application.id}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <h3 style={{ 
                      margin: '0 0 10px 0', 
                      color: '#556b2f',
                      cursor: 'pointer',
                      fontSize: '20px'
                    }}>
                      {application.title}
                    </h3>
                  </Link>
                  
                  <p style={{ 
                    margin: '0 0 10px 0', 
                    color: '#333',
                    lineHeight: '1.4'
                  }}>
                    {application.problem_text.length > 200 
                      ? `${application.problem_text.substring(0, 200)}...` 
                      : application.problem_text}
                  </p>
                  
                  <div style={{ display: 'flex', gap: '15px', fontSize: '14px', color: '#666' }}>
                    {application.subject_area && (
                      <span style={{ 
                        backgroundColor: '#e9ecef', 
                        padding: '2px 8px', 
                        borderRadius: '4px' 
                      }}>
                        Subject: {application.subject_area}
                      </span>
                    )}
                    
                    {application.difficulty_level && (
                      <span style={{ 
                        backgroundColor: getDifficultyColor(application.difficulty_level),
                        color: 'white',
                        padding: '2px 8px', 
                        borderRadius: '4px' 
                      }}>
                        {application.difficulty_level}
                      </span>
                    )}
                    
                    <span>Created: {formatDate(application.created_at ?? null)}</span>
                  </div>
                </div>
                
                <div style={{ marginLeft: '15px' }}>
                  <Link 
                    href={`/applications/${application.id}/link-formulas`}
                    style={{ 
                      backgroundColor: '#6b7c3d',
                      color: 'white',
                      padding: '8px 12px',
                      textDecoration: 'none',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  >
                    Link Formulas
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
