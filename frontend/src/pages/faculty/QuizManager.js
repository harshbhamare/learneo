import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';

const emptyQuestion = { questionText: '', options: ['', '', '', ''], correctAnswer: '', marks: 1, difficulty: 'normal' };

const QuizManager = () => {
  const { id: moduleId } = useParams();
  const [module, setModule] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [editingQ, setEditingQ] = useState(null);
  const [newQuestion, setNewQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    const [mod, qz] = await Promise.all([
      api.get(`/modules/${moduleId}`),
      api.get(`/quizzes/module/${moduleId}`),
    ]);
    setModule(mod.data);
    setQuizzes(qz.data);
    if (qz.data.length > 0) setActiveQuiz(qz.data[0]);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [moduleId]);

  const generateQuiz = async () => {
    setGenerating(true);
    setError('');
    try {
      const { data } = await api.post(`/quizzes/generate/${moduleId}`);
      setQuizzes((prev) => [...prev, data]);
      setActiveQuiz(data);
    } catch (err) {
      setError(err.response?.data?.message || 'AI generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const publishQuiz = async (quizId) => {
    const { data } = await api.put(`/quizzes/${quizId}/publish`);
    setQuizzes((prev) => prev.map((q) => (q._id === quizId ? data : q)));
    setActiveQuiz(data);
  };

  const saveQuestion = async (questionIdx) => {
    const updated = [...activeQuiz.questions];
    updated[questionIdx] = editingQ;
    const { data } = await api.put(`/quizzes/${activeQuiz._id}`, { questions: updated });
    setActiveQuiz(data);
    setQuizzes((prev) => prev.map((q) => (q._id === data._id ? data : q)));
    setEditingQ(null);
  };

  const addQuestion = async () => {
    const updated = [...(activeQuiz.questions || []), newQuestion];
    const { data } = await api.put(`/quizzes/${activeQuiz._id}`, { questions: updated });
    setActiveQuiz(data);
    setQuizzes((prev) => prev.map((q) => (q._id === data._id ? data : q)));
    setNewQuestion(null);
  };

  const deleteQuestion = async (idx) => {
    const updated = activeQuiz.questions.filter((_, i) => i !== idx);
    const { data } = await api.put(`/quizzes/${activeQuiz._id}`, { questions: updated });
    setActiveQuiz(data);
    setQuizzes((prev) => prev.map((q) => (q._id === data._id ? data : q)));
  };

  if (loading) return <div className="loading"><div className="spinner" />Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Quiz Manager: {module?.title}</h1>
        <div className="flex gap-1">
          <button className="btn btn-primary" onClick={generateQuiz} disabled={generating}>
            {generating ? '🤖 Generating...' : '🤖 Generate Quiz with AI'}
          </button>
          {activeQuiz && (
            <button
              className={`btn btn-${activeQuiz.status === 'published' ? 'warning' : 'success'}`}
              onClick={() => publishQuiz(activeQuiz._id)}
            >
              {activeQuiz.status === 'published' ? 'Unpublish' : 'Publish Quiz'}
            </button>
          )}
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {quizzes.length > 1 && (
        <div className="flex gap-1" style={{ marginBottom: '1rem' }}>
          {quizzes.map((q) => (
            <button
              key={q._id}
              className={`btn btn-sm ${activeQuiz?._id === q._id ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveQuiz(q)}
            >
              {q.title}
            </button>
          ))}
        </div>
      )}

      {!activeQuiz && (
        <div className="card">
          <p className="text-muted" style={{ textAlign: 'center' }}>
            No quiz yet. Click "Generate Quiz with AI" to auto-generate questions from module topics.
          </p>
        </div>
      )}

      {activeQuiz && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">{activeQuiz.title} ({activeQuiz.questions?.length || 0} questions)</h2>
            <span className={`badge badge-${activeQuiz.status === 'published' ? 'success' : 'warning'}`}>
              {activeQuiz.status}
            </span>
          </div>

          {activeQuiz.questions?.map((q, idx) => (
            <div key={idx} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 8, marginBottom: '0.75rem' }}>
              {editingQ && editingQ._idx === idx ? (
                <div>
                  <div className="form-group">
                    <label className="form-label">Question</label>
                    <textarea className="form-control" value={editingQ.questionText}
                      onChange={(e) => setEditingQ({ ...editingQ, questionText: e.target.value })} />
                  </div>
                  {editingQ.options.map((opt, oi) => (
                    <div className="form-group" key={oi}>
                      <label className="form-label">Option {oi + 1}</label>
                      <input className="form-control" value={opt}
                        onChange={(e) => {
                          const opts = [...editingQ.options];
                          opts[oi] = e.target.value;
                          setEditingQ({ ...editingQ, options: opts });
                        }} />
                    </div>
                  ))}
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Correct Answer</label>
                      <select className="form-control" value={editingQ.correctAnswer}
                        onChange={(e) => setEditingQ({ ...editingQ, correctAnswer: e.target.value })}>
                        <option value="">Select correct answer</option>
                        {editingQ.options.map((o, i) => <option key={i} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Marks</label>
                      <input type="number" className="form-control" value={editingQ.marks}
                        onChange={(e) => setEditingQ({ ...editingQ, marks: Number(e.target.value) })} min={1} />
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button className="btn btn-sm btn-success" onClick={() => saveQuestion(idx)}>Save</button>
                    <button className="btn btn-sm btn-secondary" onClick={() => setEditingQ(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center">
                    <strong>Q{idx + 1}: {q.questionText}</strong>
                    <div className="flex gap-1">
                      <button className="btn btn-sm btn-secondary" onClick={() => setEditingQ({ ...q, _idx: idx })}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => deleteQuestion(idx)}>Delete</button>
                    </div>
                  </div>
                  <div style={{ marginTop: '0.5rem' }}>
                    {q.options?.map((opt, oi) => (
                      <span key={oi} className={`badge ${opt === q.correctAnswer ? 'badge-success' : 'badge-info'}`} style={{ marginRight: '0.5rem' }}>
                        {opt === q.correctAnswer ? '✓ ' : ''}{opt}
                      </span>
                    ))}
                  </div>
                  <div className="text-muted text-sm" style={{ marginTop: '0.25rem' }}>Marks: {q.marks} | Difficulty: {q.difficulty}</div>
                </div>
              )}
            </div>
          ))}

          {newQuestion ? (
            <div style={{ padding: '1rem', border: '2px dashed var(--primary)', borderRadius: 8, marginBottom: '0.75rem' }}>
              <h4 style={{ marginBottom: '0.75rem' }}>New Question</h4>
              <div className="form-group">
                <label className="form-label">Question</label>
                <textarea className="form-control" value={newQuestion.questionText}
                  onChange={(e) => setNewQuestion({ ...newQuestion, questionText: e.target.value })} />
              </div>
              {newQuestion.options.map((opt, oi) => (
                <div className="form-group" key={oi}>
                  <label className="form-label">Option {oi + 1}</label>
                  <input className="form-control" value={opt}
                    onChange={(e) => {
                      const opts = [...newQuestion.options];
                      opts[oi] = e.target.value;
                      setNewQuestion({ ...newQuestion, options: opts });
                    }} />
                </div>
              ))}
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Correct Answer</label>
                  <select className="form-control" value={newQuestion.correctAnswer}
                    onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })}>
                    <option value="">Select correct answer</option>
                    {newQuestion.options.filter(Boolean).map((o, i) => <option key={i} value={o}>{o}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Marks</label>
                  <input type="number" className="form-control" value={newQuestion.marks}
                    onChange={(e) => setNewQuestion({ ...newQuestion, marks: Number(e.target.value) })} min={1} />
                </div>
              </div>
              <div className="flex gap-1">
                <button className="btn btn-sm btn-success" onClick={addQuestion}>Add Question</button>
                <button className="btn btn-sm btn-secondary" onClick={() => setNewQuestion(null)}>Cancel</button>
              </div>
            </div>
          ) : (
            <button className="btn btn-secondary" onClick={() => setNewQuestion({ ...emptyQuestion })}>
              + Add Manual Question
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizManager;
