import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const StudentModules = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/modules').then(({ data }) => { setModules(data); setLoading(false); });
  }, []);

  if (loading) return <div className="loading"><div className="spinner" />Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Available Modules</h1>
      </div>

      {modules.length === 0 && (
        <div className="card">
          <p className="text-muted" style={{ textAlign: 'center' }}>No modules available yet. Check back later.</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {modules.map((m) => (
          <div className="card" key={m._id} style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1 }}>
              <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
                <span className={`badge badge-${m.difficulty === 'easy' ? 'success' : m.difficulty === 'advanced' ? 'danger' : 'info'}`}>
                  {m.difficulty}
                </span>
                <span className="text-muted text-sm">{m.topics?.length || 0} topics</span>
              </div>
              <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{m.title}</h3>
              <p className="text-muted text-sm">{m.description || 'No description provided.'}</p>
              <p className="text-muted text-sm" style={{ marginTop: '0.5rem' }}>
                By: {m.createdBy?.name}
              </p>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <Link to={`/student/modules/${m._id}`} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                Start Learning →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentModules;
