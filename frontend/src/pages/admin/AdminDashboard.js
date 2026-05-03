import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/analytics').then(({ data }) => {
      setAnalytics(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner" />Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <Link to="/admin/users" className="btn btn-primary">Manage Users</Link>
      </div>

      <div className="stats-grid">
        {[
          { label: 'Total Users', value: analytics?.totalUsers || 0 },
          { label: 'Content Uploads', value: analytics?.totalContent || 0 },
          { label: 'Modules', value: analytics?.totalModules || 0 },
          { label: 'Quizzes', value: analytics?.totalQuizzes || 0 },
          { label: 'Quiz Attempts', value: analytics?.totalResults || 0 },
        ].map((s) => (
          <div className="stat-card" key={s.label}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header"><h2 className="card-title">Users by Role</h2></div>
          {analytics?.usersByRole?.map((r) => (
            <div key={r._id} className="flex justify-between items-center" style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ textTransform: 'capitalize' }}>{r._id}</span>
              <span className="badge badge-info">{r.count}</span>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-header"><h2 className="card-title">Recent Users</h2></div>
          {analytics?.recentUsers?.map((u) => (
            <div key={u._id} className="flex justify-between items-center" style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontWeight: 500 }}>{u.name}</div>
                <div className="text-muted">{u.email}</div>
              </div>
              <span className={`badge badge-${u.role === 'admin' ? 'danger' : u.role === 'faculty' ? 'warning' : 'success'}`}>
                {u.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
