import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { 
  HiCheckCircle, HiClock, HiLightningBolt, HiStar, 
  HiTrendingUp, HiAcademicCap, HiChip 
} from 'react-icons/hi';

const ModuleBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', difficulty: 'normal' });
  const [allTopics, setAllTopics] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  // Gamification state
  const [step, setStep] = useState(1); // 1: Details, 2: Topics, 3: Review
  const [completionScore, setCompletionScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: contents } = await api.get('/content');
      const topicPromises = contents
        .filter((c) => c.status === 'processed')
        .map((c) => api.get(`/content/${c._id}/topics`).then((r) => r.data));
      const topicArrays = await Promise.all(topicPromises);
      setAllTopics(topicArrays.flat());

      if (id) {
        const { data: mod } = await api.get(`/modules/${id}`);
        setForm({ title: mod.title, description: mod.description || '', difficulty: mod.difficulty });
        setSelectedTopics(mod.topics.map((t) => t._id || t));
        setStep(2); // Start at topics if editing
      }
      setLoading(false);
    };
    fetchData().catch(() => setLoading(false));
  }, [id]);

  // Calculate completion score
  useEffect(() => {
    let score = 0;
    if (form.title.length > 3) score += 20;
    if (form.description.length > 10) score += 20;
    if (form.difficulty) score += 10;
    if (selectedTopics.length > 0) score += 25;
    if (selectedTopics.length >= 3) score += 15;
    if (selectedTopics.length >= 5) score += 10;
    setCompletionScore(score);
  }, [form, selectedTopics]);

  const toggleTopic = (topicId) => {
    setSelectedTopics((prev) =>
      prev.includes(topicId) ? prev.filter((t) => t !== topicId) : [...prev, topicId]
    );
  };

  const handleSubmit = async () => {
    if (!form.title || selectedTopics.length === 0) {
      setError('Please provide a title and select at least one topic');
      return;
    }
    
    setError('');
    setSaving(true);
    try {
      const payload = { ...form, topicIds: selectedTopics };
      if (id) {
        await api.put(`/modules/${id}`, payload);
      } else {
        await api.post('/modules', payload);
      }
      
      // Show success animation
      setShowConfetti(true);
      setTimeout(() => {
        navigate('/faculty/modules');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving module');
      setSaving(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && !form.title) {
      setError('Please enter a module title');
      return;
    }
    setError('');
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  if (loading) return <div className="loading"><div className="spinner" />Loading...</div>;

  const difficultyColors = {
    easy: { bg: '#dcfce7', text: '#15803d', icon: HiAcademicCap },
    normal: { bg: '#dbeafe', text: '#1d4ed8', icon: HiChip },
    advanced: { bg: '#fef3c7', text: '#a16207', icon: HiLightningBolt },
  };

  return (
    <div>
      {/* Confetti effect */}
      {showConfetti && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(74,222,128,0.1)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fadeIn 0.3s ease',
        }}>
          <div style={{
            background: 'white',
            padding: '3rem',
            borderRadius: '16px',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            <HiCheckCircle style={{ fontSize: '4rem', color: 'var(--green)', marginBottom: '1rem' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)' }}>
              Module {id ? 'Updated' : 'Created'}!
            </h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Redirecting to modules...
            </p>
          </div>
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">{id ? 'Edit Module' : 'Create New Module'}</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Step {step} of 3 • {completionScore}% Complete
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Progress ring */}
          <div style={{ position: 'relative', width: 60, height: 60 }}>
            <svg width="60" height="60" style={{ transform: 'rotate(-90deg)' }}>
              <circle
                cx="30"
                cy="30"
                r="26"
                fill="none"
                stroke="var(--border)"
                strokeWidth="4"
              />
              <circle
                cx="30"
                cy="30"
                r="26"
                fill="none"
                stroke="var(--green)"
                strokeWidth="4"
                strokeDasharray={`${2 * Math.PI * 26}`}
                strokeDashoffset={`${2 * Math.PI * 26 * (1 - completionScore / 100)}`}
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
              />
            </svg>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '0.9rem',
              fontWeight: 700,
              color: 'var(--green)',
            }}>
              {completionScore}%
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        background: 'var(--card)',
        padding: '1.5rem',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
      }}>
        {[
          { num: 1, label: 'Module Details', icon: HiStar },
          { num: 2, label: 'Select Topics', icon: HiAcademicCap },
          { num: 3, label: 'Review & Save', icon: HiCheckCircle },
        ].map((s) => {
          const Icon = s.icon;
          const isActive = step === s.num;
          const isComplete = step > s.num;
          return (
            <div
              key={s.num}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem',
                borderRadius: 'var(--radius-sm)',
                background: isActive ? 'var(--green-glow)' : isComplete ? '#f0fdf4' : 'transparent',
                border: `2px solid ${isActive ? 'var(--green)' : isComplete ? '#bbf7d0' : 'var(--border)'}`,
                cursor: isComplete ? 'pointer' : 'default',
                transition: 'all 0.3s ease',
              }}
              onClick={() => isComplete && setStep(s.num)}
            >
              <div style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: isActive ? 'var(--green)' : isComplete ? '#22c55e' : 'var(--border)',
                color: isActive || isComplete ? 'white' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                transition: 'all 0.3s ease',
              }}>
                {isComplete ? <HiCheckCircle /> : <Icon />}
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Step {s.num}
                </div>
                <div style={{ fontWeight: 600, color: isActive ? 'var(--green-dark)' : 'var(--text)' }}>
                  {s.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Step 1: Module Details */}
      {step === 1 && (
        <div className="card" style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <HiStar style={{ color: 'var(--green)' }} />
            Module Details
          </h2>
          
          <div className="form-group">
            <label className="form-label">Module Title *</label>
            <input
              className="form-control no-icon"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g., Introduction to Machine Learning"
              style={{ fontSize: '1rem' }}
            />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {form.title.length}/100 characters
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-control no-icon"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Brief description of what students will learn..."
              rows={4}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Difficulty Level</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              {Object.entries(difficultyColors).map(([level, colors]) => {
                const Icon = colors.icon;
                const isSelected = form.difficulty === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setForm({ ...form, difficulty: level })}
                    style={{
                      padding: '1rem',
                      border: `2px solid ${isSelected ? colors.text : 'var(--border)'}`,
                      borderRadius: 'var(--radius-sm)',
                      background: isSelected ? colors.bg : 'white',
                      color: isSelected ? colors.text : 'var(--text-sub)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <Icon style={{ fontSize: '1.5rem' }} />
                    <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{level}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
            <button className="btn btn-primary" onClick={nextStep} style={{ padding: '0.75rem 2rem' }}>
              Next: Select Topics →
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Select Topics */}
      {step === 2 && (
        <div>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <HiAcademicCap style={{ color: 'var(--green)' }} />
                  Select Topics ({selectedTopics.length} selected)
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                  Choose topics to include in this module
                </p>
              </div>
              {selectedTopics.length > 0 && (
                <div style={{
                  background: 'var(--green-glow)',
                  padding: '0.75rem 1.25rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(74,222,128,0.3)',
                }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--green-dark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Progress
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--green-dark)' }}>
                    {selectedTopics.length} topics
                  </div>
                </div>
              )}
            </div>
          </div>

          {allTopics.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <HiClock style={{ fontSize: '3rem', color: 'var(--text-muted)', marginBottom: '1rem' }} />
              <p style={{ color: 'var(--text-muted)' }}>
                No processed topics available. Upload and process content first.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
              {allTopics.map((topic) => {
                const isSelected = selectedTopics.includes(topic._id);
                const diffColor = difficultyColors[topic.difficulty] || difficultyColors.normal;
                const DiffIcon = diffColor.icon;
                
                return (
                  <div
                    key={topic._id}
                    onClick={() => toggleTopic(topic._id)}
                    style={{
                      background: isSelected ? 'var(--green-glow)' : 'var(--card)',
                      border: `2px solid ${isSelected ? 'var(--green)' : 'var(--border)'}`,
                      borderRadius: 'var(--radius)',
                      padding: '1.25rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {isSelected && (
                      <div style={{
                        position: 'absolute',
                        top: '0.75rem',
                        right: '0.75rem',
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: 'var(--green)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1rem',
                      }}>
                        <HiCheckCircle />
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <div style={{
                        padding: '0.35rem 0.65rem',
                        background: diffColor.bg,
                        color: diffColor.text,
                        borderRadius: '12px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}>
                        <DiffIcon /> {topic.difficulty}
                      </div>
                    </div>
                    
                    <h3 style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.5rem', color: isSelected ? 'var(--green-dark)' : 'var(--text)' }}>
                      {topic.title}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      {topic.summary?.substring(0, 120)}...
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
            <button className="btn btn-secondary" onClick={prevStep}>
              ← Back
            </button>
            <button 
              className="btn btn-primary" 
              onClick={nextStep}
              disabled={selectedTopics.length === 0}
              style={{ padding: '0.75rem 2rem' }}
            >
              Next: Review →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <HiCheckCircle style={{ color: 'var(--green)' }} />
              Review & Confirm
            </h2>

            <div style={{ background: 'var(--bg)', padding: '1.5rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                  Module Title
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)' }}>
                  {form.title}
                </div>
              </div>

              {form.description && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                    Description
                  </div>
                  <div style={{ color: 'var(--text-sub)' }}>
                    {form.description}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '2rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                    Difficulty
                  </div>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.35rem 0.75rem',
                    background: difficultyColors[form.difficulty].bg,
                    color: difficultyColors[form.difficulty].text,
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    textTransform: 'capitalize',
                  }}>
                    {React.createElement(difficultyColors[form.difficulty].icon)}
                    {form.difficulty}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                    Topics
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--green-dark)' }}>
                    {selectedTopics.length}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-sub)' }}>
                Selected Topics
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {allTopics.filter(t => selectedTopics.includes(t._id)).map((topic, idx) => (
                  <div key={topic._id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    background: 'var(--bg)',
                    borderRadius: 'var(--radius-sm)',
                  }}>
                    <div style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: 'var(--green)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}>
                      {idx + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{topic.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {topic.difficulty} • {topic.summary?.substring(0, 80)}...
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button className="btn btn-secondary" onClick={prevStep}>
              ← Back
            </button>
            <button 
              className="btn btn-success" 
              onClick={handleSubmit}
              disabled={saving}
              style={{ padding: '0.75rem 2.5rem', fontSize: '1rem' }}
            >
              {saving ? (
                <>
                  <span className="btn-spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
                  Saving...
                </>
              ) : (
                <>
                  <HiCheckCircle /> {id ? 'Update Module' : 'Create Module'}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModuleBuilder;
