import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const StudentResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/results/my').then(({ data }) => { setResults(data); setLoading(false); });
  }, []);

  if (loading) return <div className="loading"><div className="spinner" />Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Results</h1>
        <Link to="/student/modules" className="btn btn-primary">Browse Modules</Link>
      </div>

      {results.length === 0 && (
        <div className="card">
          <p className="text-muted" style={{ textAlign: 'center' }}>
            No quiz attempts yet. <Link to="/student/modules" style={{ color: 'var(--primary)' }}>Start a quiz!</Link>
          </p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {results.map((r) => (
          <div className="card" key={r._id}>
            <div className="flex justify-between items-center">
              <div>
                <h3 style={{ fontWeight: 600 }}>{r.quizId?.title || 'Quiz'}</h3>
                <p className="text-muted">{r.moduleId?.title} · {new Date(r.createdAt).toLocaleString()}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontSize: '1.75rem',
                  fontWeight: 700,
                  color: r.percentage < 40 ? 'var(--danger)' : r.percentage <= 70 ? 'var(--warning)' : 'var(--success)',
                }}>
                  {r.percentage}%
                </div>
                <div className="text-muted">{r.score}/{r.totalMarks} marks</div>
              </div>
            </div>

            <div style={{ marginTop: '0.75rem' }}>
              <div className="progress-bar">
                <div
                  className={`progress-fill ${r.percentage < 40 ? 'danger' : r.percentage <= 70 ? 'warning' : 'success'}`}
                  style={{ width: `${r.percentage}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2" style={{ marginTop: '0.75rem' }}>
              <span className="text-muted text-sm">⏱ {Math.round(r.timeTaken / 60)} min</span>
              <span>
                Recommended: <span className={`badge badge-${r.recommendedDifficulty === 'easy' ? 'success' : r.recommendedDifficulty === 'advanced' ? 'danger' : 'info'}`}>
                  {r.recommendedDifficulty}
                </span>
              </span>
              {r.weakTopics?.length > 0 && (
                <span className="text-muted text-sm">
                  Weak topics: {r.weakTopics.map((t) => t.title).join(', ')}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentResults;
