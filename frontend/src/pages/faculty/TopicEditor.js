import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const TopicEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchTopics = () => {
    api.get(`/content/${id}/topics`).then(({ data }) => {
      setTopics(data);
      setLoading(false);
    });
  };

  useEffect(() => { fetchTopics(); }, [id]);

  const startEdit = (topic) => {
    setEditingId(topic._id);
    setEditForm({ title: topic.title, summary: topic.summary, difficulty: topic.difficulty });
  };

  const saveEdit = async (topicId) => {
    setSaving(true);
    await api.put(`/topics/${topicId}`, editForm);
    setEditingId(null);
    fetchTopics();
    setSaving(false);
  };

  const deleteTopic = async (topicId) => {
    if (!window.confirm('Delete this topic?')) return;
    await api.delete(`/topics/${topicId}`);
    fetchTopics();
  };

  if (loading) return <div className="loading"><div className="spinner" />Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Edit Topics ({topics.length})</h1>
        <button className="btn btn-primary" onClick={() => navigate('/faculty/modules/new')}>
          → Create Module
        </button>
      </div>

      <div className="alert alert-info" style={{ marginBottom: '1rem' }}>
        Review and edit AI-generated topics before grouping them into modules.
      </div>

      {topics.map((topic, idx) => (
        <div className="card" key={topic._id} style={{ marginBottom: '1rem' }}>
          {editingId === topic._id ? (
            <div>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input
                  className="form-control"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Summary</label>
                <textarea
                  className="form-control"
                  value={editForm.summary}
                  onChange={(e) => setEditForm({ ...editForm, summary: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Difficulty</label>
                <select
                  className="form-control"
                  value={editForm.difficulty}
                  onChange={(e) => setEditForm({ ...editForm, difficulty: e.target.value })}
                >
                  <option value="easy">Easy</option>
                  <option value="normal">Normal</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div className="flex gap-1">
                <button className="btn btn-success btn-sm" onClick={() => saveEdit(topic._id)} disabled={saving}>
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => setEditingId(null)}>Cancel</button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
                <div className="flex items-center gap-1">
                  <span className="text-muted text-sm">#{idx + 1}</span>
                  <h3 style={{ fontWeight: 600 }}>{topic.title}</h3>
                  <span className={`badge badge-${topic.difficulty === 'easy' ? 'success' : topic.difficulty === 'advanced' ? 'danger' : 'info'}`}>
                    {topic.difficulty}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button className="btn btn-sm btn-secondary" onClick={() => startEdit(topic)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => deleteTopic(topic._id)}>Delete</button>
                </div>
              </div>
              <p className="text-muted">{topic.summary}</p>
            </div>
          )}
        </div>
      ))}

      {topics.length === 0 && (
        <div className="card">
          <p className="text-muted" style={{ textAlign: 'center' }}>No topics found. Make sure AI processing completed successfully.</p>
        </div>
      )}
    </div>
  );
};

export default TopicEditor;
