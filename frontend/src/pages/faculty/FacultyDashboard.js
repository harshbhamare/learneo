import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const FacultyDashboard = () => {
  const { user } = useAuth();
  const [content, setContent] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/content'),
      api.get('/modules'),
    ]).then(([c, m]) => {
      setContent(c.data);
      setModules(m.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner" />Loading...</div>;

  const published = modules.filter((m) => m.status === 'published').length;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Welcome, {user?.name}</h1>
        <Link to="/faculty/upload" className="btn btn-primary">+ Upload Content</Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Content Uploads</div>
          <div className="stat-value">{content.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Modules</div>
          <div className="stat-value">{modules.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Published</div>
          <div className="stat-value">{published}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Drafts</div>
          <div className="stat-value">{modules.length - published}</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Content</h2>
            <Link to="/faculty/content" className="btn btn-sm btn-secondary">View All</Link>
          </div>
          {content.slice(0, 5).map((c) => (
            <div key={c._id} className="flex justify-between items-center" style={{ padding: '0.6rem 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontWeight: 500 }}>{c.title}</div>
                <div className="text-muted">{c.fileType.toUpperCase()}</div>
              </div>
              <span className={`badge badge-${c.status === 'processed' ? 'success' : c.status === 'processing' ? 'warning' : c.status === 'failed' ? 'danger' : 'info'}`}>
                {c.status}
              </span>
            </div>
          ))}
          {content.length === 0 && <p className="text-muted">No content uploaded yet.</p>}
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Modules</h2>
            <Link to="/faculty/modules" className="btn btn-sm btn-secondary">View All</Link>
          </div>
          {modules.slice(0, 5).map((m) => (
            <div key={m._id} className="flex justify-between items-center" style={{ padding: '0.6rem 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontWeight: 500 }}>{m.title}</div>
                <div className="text-muted">{m.topics?.length || 0} topics</div>
              </div>
              <span className={`badge badge-${m.status === 'published' ? 'success' : 'warning'}`}>
                {m.status}
              </span>
            </div>
          ))}
          {modules.length === 0 && <p className="text-muted">No modules created yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;
