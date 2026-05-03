import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';

const ModuleView = () => {
  const { id } = useParams();
  const [module, setModule] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [activeTopic, setActiveTopic] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/modules/${id}`),
      api.get(`/quizzes/module/${id}`),
    ]).then(([mod, qz]) => {
      setModule(mod.data);
      setQuizzes(qz.data.filter((q) => q.status === 'published'));
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="loading"><div className="spinner" />Loading...</div>;
  if (!module) return <div className="alert alert-error">Module not found.</div>;

  const topics = module.topics || [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{module.title}</h1>
          <p className="text-muted">{module.description}</p>
        </div>
        <span className={`badge badge-${module.difficulty === 'easy' ? 'success' : module.difficulty === 'advanced' ? 'danger' : 'info'}`} style={{ fontSize: '0.9rem', padding: '0.4rem 0.8rem' }}>
          {module.difficulty}
        </span>
      </div>

      <div className="grid-2">
        {/* Topic list */}
        <div>
          <div className="card" style={{ marginBottom: '1rem' }}>
            <h2 className="card-title" style={{ marginBottom: '1rem' }}>Topics ({topics.length})</h2>
            {topics.map((topic, idx) => (
              <button
                key={topic._id}
                onClick={() => setActiveTopic(idx)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '0.75rem',
                  borderRadius: 8,
                  border: 'none',
                  background: activeTopic === idx ? '#ede9fe' : 'transparent',
                  cursor: 'pointer',
                  marginBottom: '0.25rem',
                  color: activeTopic === idx ? 'var(--primary)' : 'var(--text)',
                  fontWeight: activeTopic === idx ? 600 : 400,
                }}
              >
                <span className="text-muted text-sm" style={{ marginRight: '0.5rem' }}>{idx + 1}.</span>
                {topic.title}
              </button>
            ))}
            {topics.length === 0 && <p className="text-muted">No topics in this module.</p>}
          </div>

          {quizzes.length > 0 && (
            <div className="card">
              <h2 className="card-title" style={{ marginBottom: '1rem' }}>Available Quizzes</h2>
              {quizzes.map((quiz) => (
                <div key={quiz._id} className="flex justify-between items-center" style={{ padding: '0.6rem 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>{quiz.title}</div>
                    <div className="text-muted">{quiz.questions?.length || 0} questions · {quiz.timeLimit} min</div>
                  </div>
                  <Link to={`/student/quiz/${quiz._id}`} className="btn btn-sm btn-primary">
                    Attempt →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Topic content */}
        <div>
          {topics[activeTopic] ? (
            <div className="card">
              <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
                <h2 style={{ fontWeight: 700, fontSize: '1.2rem' }}>{topics[activeTopic].title}</h2>
                <span className={`badge badge-${topics[activeTopic].difficulty === 'easy' ? 'success' : topics[activeTopic].difficulty === 'advanced' ? 'danger' : 'info'}`}>
                  {topics[activeTopic].difficulty}
                </span>
              </div>
              <p style={{ lineHeight: 1.7, color: 'var(--text)' }}>{topics[activeTopic].summary}</p>

              <div className="flex justify-between" style={{ marginTop: '1.5rem' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => setActiveTopic((p) => Math.max(0, p - 1))}
                  disabled={activeTopic === 0}
                >
                  ← Previous
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => setActiveTopic((p) => Math.min(topics.length - 1, p + 1))}
                  disabled={activeTopic === topics.length - 1}
                >
                  Next →
                </button>
              </div>
            </div>
          ) : (
            <div className="card">
              <p className="text-muted">Select a topic to read.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModuleView;
