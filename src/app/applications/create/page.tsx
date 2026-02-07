// applications/create/page.tsx

'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateApplication() {
  const [title, setTitle] = useState('');
  const [problemText, setProblemText] = useState('');
  const [subjectArea, setSubjectArea] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !problemText.trim()) {
      setError('Title and problem text are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (!process.env.NEXT_PUBLIC_API_URL) {
        throw new Error("API URL is not set");
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          problem_text: problemText.trim(),
          subject_area: subjectArea.trim() || null,
          difficulty_level: difficultyLevel || null,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      
      // Redirect to the applications list or the new application page
      router.push('/applications');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginLeft: '20px', marginTop: '20px', marginRight: '20px', maxWidth: '800px' }}>
      {/* Navigation */}
      <div style={{ marginBottom: '20px' }}>
        <Link href="/applications" style={{ 
          textDecoration: 'underline', 
          color: '#556b2f' 
        }}>
          ← Back to Applications
        </Link>
      </div>

      {/* Page title */}
      <h1 style={{
        marginBottom: '20px',
        color: 'black',
        fontSize: '32px',
        fontWeight: 'bold'
      }}>
        Create New Application
      </h1>

      {error && (
        <div style={{ 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          padding: '10px', 
          borderRadius: '4px', 
          marginBottom: '20px',
          border: '1px solid #f5c6cb'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '5px', 
            fontWeight: 'bold',
            color: '#333'
          }}>
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px'
            }}
            placeholder="Enter a descriptive title for the problem"
            required
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '5px', 
            fontWeight: 'bold',
            color: '#333'
          }}>
            Problem Text *
          </label>
          <textarea
            value={problemText}
            onChange={(e) => setProblemText(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px',
              minHeight: '150px',
              resize: 'vertical'
            }}
            placeholder="Describe the problem or application in detail..."
            required
          />
        </div>

        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '5px', 
              fontWeight: 'bold',
              color: '#333'
            }}>
              Subject Area
            </label>
            <select
              value={subjectArea}
              onChange={(e) => setSubjectArea(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            >
              <option value="">Select subject area</option>
              <option value="physics">Physics</option>
              <option value="statistics">Statistics</option>
              <option value="mathematics">Mathematics</option>
              <option value="chemistry">Chemistry</option>
              <option value="engineering">Engineering</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '5px', 
              fontWeight: 'bold',
              color: '#333'
            }}>
              Difficulty Level
            </label>
            <select
              value={difficultyLevel}
              onChange={(e) => setDifficultyLevel(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            >
              <option value="">Select difficulty</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: loading ? '#6c757d' : '#28a745',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Creating...' : 'Create Application'}
          </button>

          <Link 
            href="/applications"
            style={{
              backgroundColor: '#6c757d',
              color: 'white',
              padding: '12px 24px',
              textDecoration: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              display: 'inline-block'
            }}
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
