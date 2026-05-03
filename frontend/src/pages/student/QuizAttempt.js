import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const QuizAttempt = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const startTime = useRef(Date.now());
  const timerRef = useRef(null);

  useEffect(() => {
    api.get(`/quizzes/${id}`).then(({ data }) => {
      setQuiz(data);
      setTimeLeft(data.timeLimit * 60);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (timeLeft === null || submitted) return;
    if (timeLeft <= 0) { handleSubmit(); return; }
    timerRef.current = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [timeLeft, submitted]);

  const handleAnswer = (questionId, option) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    clearTimeout(timerRef.current);
    const timeTaken = Math.round((Date.now() - startTime.current) / 1000);
    const answerPayload = quiz.questions.map((q) => ({
      questionId: q._id,
      selectedAnswer: answers[q._id] || '',
    }));
    try {
      const { data } = await api.post('/results/submit', {
        quizId: id,
        answers: answerPayload,
        timeTaken,
      });
      setResult(data);
      setSubmitted(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Submission failed');
      setSubmitting(false);
    }
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  if (loading) return <div className="loading"><div className="spinner" />Loading quiz...</div>;
  if (!quiz) return <div className="alert alert-error">Quiz not found.</div>;

  if (submitted && result) {
    const { percentage, recommendedDifficulty, message } = result.feedback;
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Quiz Results</h1>
        </div>
        <div className="card" style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>
            {percentage >= 70 ? '🎉' : percentage >= 40 ? '👍' : '📘'}
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 700, color: percentage >= 70 ? 'var(--success)' : percentage >= 40 ? 'var(--warning)' : 'var(--danger)' }}>
            {percentage}%
          </h2>
          <p style={{ fontSize: '1.1rem', margin: '0.5rem 0' }}>
            {result.result.score} / {result.result.totalMarks} marks
          </p>
          <div className="progress-bar" style={{ margin: '1rem auto', maxWidth: 300 }}>
            <div
              className={`progress-fill ${percentage < 40 ? 'danger' : percentage <= 70 ? 'warning' : 'success'}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className={`alert alert-${percentage >= 70 ? 'success' : percentage >= 40 ? 'info' : 'error'}`} style={{ marginTop: '1rem', textAlign: 'left' }}>
            {message}
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            <span>Recommended level: </span>
            <span className={`badge badge-${recommendedDifficulty === 'easy' ? 'success' : recommendedDifficulty === 'advanced' ? 'danger' : 'info'}`}>
              {recommendedDifficulty}
            </span>
          </div>
          <div className="flex gap-1" style={{ marginTop: '1.5rem', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => navigate('/student/modules')}>Browse Modules</button>
            <button className="btn btn-secondary" onClick={() => navigate('/student/results')}>View All Results</button>
          </div>
        </div>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{quiz.title}</h1>
        <div className="flex items-center gap-2">
          <span className="text-muted">{answeredCount}/{quiz.questions.length} answered</span>
          <span
            style={{
              fontWeight: 700,
              fontSize: '1.1rem',
              color: timeLeft < 60 ? 'var(--danger)' : 'var(--text)',
            }}
          >
            ⏱ {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      <div style={{ maxWidth: 700 }}>
        {quiz.questions.map((q, idx) => (
          <div className="card" key={q._id} style={{ marginBottom: '1rem' }}>
            <div style={{ marginBottom: '0.75rem' }}>
              <span className="text-muted text-sm">Question {idx + 1} · {q.marks} mark{q.marks > 1 ? 's' : ''}</span>
              <p style={{ fontWeight: 600, marginTop: '0.25rem', fontSize: '1rem' }}>{q.questionText}</p>
            </div>
            <div>
              {q.options?.map((opt, oi) => (
                <label
                  key={oi}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.6rem 0.875rem',
                    borderRadius: 8,
                    border: `2px solid ${answers[q._id] === opt ? 'var(--primary)' : 'var(--border)'}`,
                    background: answers[q._id] === opt ? '#ede9fe' : '#fff',
                    cursor: 'pointer',
                    marginBottom: '0.5rem',
                    transition: 'all 0.15s',
                  }}
                >
                  <input
                    type="radio"
                    name={q._id}
                    value={opt}
                    checked={answers[q._id] === opt}
                    onChange={() => handleAnswer(q._id, opt)}
                    style={{ accentColor: 'var(--primary)' }}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>
        ))}

        <div className="flex justify-between items-center" style={{ marginTop: '1rem' }}>
          <span className="text-muted">{quiz.questions.length - answeredCount} questions unanswered</span>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={submitting}
            style={{ padding: '0.75rem 2rem' }}
          >
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizAttempt;
