import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/results/dashboard').then(({ data }) => {
      setDashboard(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner" />Loading...</div>;

  const difficultyColor = {
    easy: 'success', normal: 'info', advanced: 'danger',
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Welcome, {user?.name}</h1>
        <Link to="/student/modules" className="btn btn-primary">Browse Modules</Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Quizzes Taken</div>
          <div className="stat-value">{dashboard?.totalQuizzes || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Average Score</div>
          <div className="stat-value">{dashboard?.avgScore || 0}%</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Recommended Level</div>
          <div className="stat-value" style={{ fontSize: '1.25rem', textTransform: 'capitalize' }}>
            {dashboard?.recommendedDifficulty || 'normal'}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Weak Topics</div>
          <div className="stat-value">{dashboard?.weakTopics?.length || 0}</div>
        </div>
      </div>

      {dashboard?.recommendedDifficulty && (
        <div className={`alert alert-${difficultyColor[dashboard.recommendedDifficulty] === 'success' ? 'success' : difficultyColor[dashboard.recommendedDifficulty] === 'danger' ? 'error' : 'info'}`} style={{ marginBottom: '1.5rem' }}>
          {dashboard.recommendedDifficulty === 'easy' && '📘 Based on your performance, we recommend reviewing easier content to strengthen your foundation.'}
          {dashboard.recommendedDifficulty === 'normal' && '📗 You\'re on track! Keep practicing at the current difficulty level.'}
          {dashboard.recommendedDifficulty === 'advanced' && '🚀 Great work! You\'re ready for advanced content and challenges.'}
        </div>
      )}

      <div className="grid-2">
        {dashboard?.weakTopics?.length > 0 && (
          <div className="card">
            <div className="card-header"><h2 className="card-title">Weak Topics to Review</h2></div>
            {dashboard.weakTopics.map((topic, i) => (
              <div key={i} className="flex items-center gap-1" style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                <span>⚠️</span>
                <span>{topic}</span>
              </div>
            ))}
          </div>
        )}

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Quiz Results</h2>
            <Link to="/student/results" className="btn btn-sm btn-secondary">View All</Link>
          </div>
          {dashboard?.recentResults?.length === 0 && (
            <p className="text-muted">No quiz attempts yet. <Link to="/student/modules" style={{ color: 'var(--primary)' }}>Start learning!</Link></p>
          )}
          {dashboard?.recentResults?.map((r) => (
            <div key={r._id} className="flex justify-between items-center" style={{ padding: '0.6rem 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontWeight: 500 }}>{r.moduleId?.title || 'Quiz'}</div>
                <div className="text-muted">{new Date(r.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="flex items-center gap-1">
                <div className="progress-bar" style={{ width: 60 }}>
                  <div
                    className={`progress-fill ${r.percentage < 40 ? 'danger' : r.percentage <= 70 ? 'warning' : 'success'}`}
                    style={{ width: `${r.percentage}%` }}
                  />
                </div>
                <span style={{ fontWeight: 600 }}>{r.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
