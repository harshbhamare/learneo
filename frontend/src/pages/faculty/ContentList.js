import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const ContentList = () => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});

  useEffect(() => {
    api.get('/content').then(({ data }) => { setContent(data); setLoading(false); });
  }, []);

  const handleProcess = async (id) => {
    setProcessing((p) => ({ ...p, [id]: true }));
    try {
      await api.post(`/content/${id}/process`);
      const { data } = await api.get('/content');
      setContent(data);
    } catch (err) {
      alert(err.response?.data?.message || 'Processing failed');
    } finally {
      setProcessing((p) => ({ ...p, [id]: false }));
    }
  };

  if (loading) return <div className="loading"><div className="spinner" />Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Content</h1>
        <Link to="/faculty/upload" className="btn btn-primary">+ Upload New</Link>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Title</th><th>Type</th><th>Status</th><th>Uploaded</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {content.map((c) => (
                <tr key={c._id}>
                  <td style={{ fontWeight: 500 }}>{c.title}</td>
                  <td><span className="badge badge-info">{c.fileType.toUpperCase()}</span></td>
                  <td>
                    <span className={`badge badge-${c.status === 'processed' ? 'success' : c.status === 'processing' ? 'warning' : c.status === 'failed' ? 'danger' : 'info'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="text-muted">{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="flex gap-1">
                      {c.status === 'uploaded' || c.status === 'failed' ? (
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleProcess(c._id)}
                          disabled={processing[c._id]}
                        >
                          {processing[c._id] ? 'Processing...' : '🤖 Process with AI'}
                        </button>
                      ) : null}
                      {c.status === 'processed' && (
                        <Link to={`/faculty/content/${c._id}/topics`} className="btn btn-sm btn-secondary">
                          View Topics
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {content.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No content uploaded yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ContentList;
