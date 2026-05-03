import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  HiDocumentText, HiUpload, HiVideoCamera, HiMusicNote, 
  HiLightningBolt, HiCheckCircle, HiX, HiClock 
} from 'react-icons/hi';

const ContentUpload = () => {
  const [mode, setMode] = useState('text');
  const [title, setTitle] = useState('');
  const [textContent, setTextContent] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState('upload'); // upload, processing, complete
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setUploadProgress(0);
    setCurrentStep('upload');

    try {
      // Step 1: Upload
      const formData = new FormData();
      formData.append('title', title);
      
      if (mode === 'text') {
        formData.append('textContent', textContent);
      } else if (file) {
        formData.append('file', file);
      } else {
        setError('Please select a file');
        setLoading(false);
        return;
      }

      const { data: uploadedContent } = await api.post('/content/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
      });
      
      setLoading(false);
      setCurrentStep('processing');
      setProcessing(true);

      // Step 2: Auto-process with AI
      try {
        const { data: processResult } = await api.post(`/content/${uploadedContent._id}/process`);
        
        setProcessing(false);
        setCurrentStep('complete');
        
        // Wait a moment to show success, then navigate
        setTimeout(() => {
          navigate(`/faculty/content/${uploadedContent._id}/topics`);
        }, 1500);
      } catch (processError) {
        setProcessing(false);
        setError('AI processing failed. You can try again from the content list.');
        // Still navigate after showing error
        setTimeout(() => {
          navigate('/faculty/content');
        }, 3000);
      }
      
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
      setLoading(false);
      setProcessing(false);
      setUploadProgress(0);
      setCurrentStep('upload');
    }
  };

  const modes = [
    { value: 'text', label: 'Text Input', icon: HiDocumentText, color: '#3b82f6', desc: 'Paste or type content' },
    { value: 'file', label: 'Document', icon: HiUpload, color: '#8b5cf6', desc: 'PDF or PowerPoint' },
    { value: 'video', label: 'Video', icon: HiVideoCamera, color: '#ef4444', desc: 'MP4, AVI, MOV' },
    { value: 'audio', label: 'Audio', icon: HiMusicNote, color: '#f59e0b', desc: 'MP3, WAV, M4A' },
  ];

  const getFileAccept = () => {
    switch (mode) {
      case 'file': return '.pdf,.ppt,.pptx';
      case 'video': return '.mp4,.avi,.mov,.webm';
      case 'audio': return '.mp3,.wav,.m4a';
      default: return '';
    }
  };

  const getFileSize = () => {
    if (!file) return '';
    const mb = (file.size / (1024 * 1024)).toFixed(2);
    return `${mb} MB`;
  };

  // Processing overlay
  if (processing || currentStep === 'complete') {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(26,29,46,0.95)',
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
          maxWidth: '500px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}>
          {processing ? (
            <>
              <div style={{
                width: 80,
                height: 80,
                margin: '0 auto 1.5rem',
                position: 'relative',
              }}>
                <div className="spinner" style={{
                  width: 80,
                  height: 80,
                  borderWidth: 4,
                  borderTopColor: 'var(--green)',
                }} />
                <HiLightningBolt style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '2rem',
                  color: 'var(--green)',
                }} />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem' }}>
                AI Processing Content
              </h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Extracting topics and generating summaries...
              </p>
              <div style={{
                background: 'var(--bg)',
                padding: '1rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                color: 'var(--text-sub)',
              }}>
                This usually takes 10-30 seconds depending on content length
              </div>
            </>
          ) : (
            <>
              <HiCheckCircle style={{ fontSize: '4rem', color: 'var(--green)', marginBottom: '1rem' }} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem' }}>
                Processing Complete!
              </h2>
              <p style={{ color: 'var(--text-muted)' }}>
                Redirecting to topics...
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Upload Study Material</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Upload content and AI will automatically extract topics
          </p>
        </div>
        <div style={{
          background: 'var(--green-glow)',
          padding: '0.75rem 1.25rem',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid rgba(74,222,128,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <HiLightningBolt style={{ color: 'var(--green-dark)', fontSize: '1.2rem' }} />
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--green-dark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              AI Powered
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--green-dark)' }}>
              Auto-extraction
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 800, margin: '0 auto' }}>
        {error && <div className="alert alert-error">{error}</div>}

        {/* Mode Selection */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-sub)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Content Type
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
            {modes.map((m) => {
              const Icon = m.icon;
              const isActive = mode === m.value;
              return (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => {
                    setMode(m.value);
                    setFile(null);
                    setError('');
                  }}
                  style={{
                    padding: '1.25rem 1rem',
                    border: `2px solid ${isActive ? m.color : 'var(--border)'}`,
                    borderRadius: 'var(--radius-sm)',
                    background: isActive ? `${m.color}15` : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem',
                    textAlign: 'center',
                  }}
                >
                  <Icon style={{ fontSize: '2rem', color: isActive ? m.color : 'var(--text-muted)' }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: isActive ? m.color : 'var(--text)' }}>
                      {m.label}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      {m.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              className="form-control no-icon"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g., Introduction to Machine Learning"
            />
          </div>

          {mode === 'text' ? (
            <div className="form-group">
              <label className="form-label">Study Material Content</label>
              <textarea
                className="form-control no-icon"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                required
                placeholder="Paste or type your study material here..."
                style={{ minHeight: 250, fontFamily: 'inherit' }}
              />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                {textContent.length} characters • Recommended: 500+ for better AI extraction
              </div>
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">
                Upload {mode === 'file' ? 'Document' : mode === 'video' ? 'Video' : 'Audio'} File
              </label>
              
              {!file ? (
                <label style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '3rem 2rem',
                  border: '2px dashed var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}>
                  <input
                    type="file"
                    accept={getFileAccept()}
                    onChange={handleFileChange}
                    required
                    style={{ display: 'none' }}
                  />
                  <HiUpload style={{ fontSize: '3rem', color: 'var(--text-muted)', marginBottom: '1rem' }} />
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.25rem' }}>
                    Click to upload or drag and drop
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {mode === 'file' && 'PDF or PowerPoint (max 100MB)'}
                    {mode === 'video' && 'MP4, AVI, MOV, WEBM (max 100MB)'}
                    {mode === 'audio' && 'MP3, WAV, M4A (max 100MB)'}
                  </div>
                </label>
              ) : (
                <div style={{
                  padding: '1.5rem',
                  border: '2px solid var(--green)',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--green-glow)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--green)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    flexShrink: 0,
                  }}>
                    {mode === 'video' ? <HiVideoCamera /> : mode === 'audio' ? <HiMusicNote /> : <HiDocumentText />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: '0.15rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {file.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {getFileSize()} • {file.type || 'Unknown type'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      border: 'none',
                      background: 'rgba(239,68,68,0.1)',
                      color: 'var(--danger)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    <HiX />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Info Box */}
          <div style={{
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: 'var(--radius-sm)',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <HiLightningBolt style={{ color: '#3b82f6', fontSize: '1.25rem', flexShrink: 0, marginTop: '0.1rem' }} />
              <div>
                <div style={{ fontWeight: 600, color: '#1e40af', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                  Automatic AI Processing
                </div>
                <div style={{ fontSize: '0.85rem', color: '#1e40af', lineHeight: 1.6 }}>
                  After upload, AI will automatically extract micro-topics, generate summaries, and classify difficulty levels. 
                  This takes 10-30 seconds. You'll then be able to review and edit before creating modules.
                </div>
              </div>
            </div>
          </div>

          {/* Upload Progress */}
          {loading && uploadProgress > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>
                  Uploading...
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--green)' }}>
                  {uploadProgress}%
                </span>
              </div>
              <div className="progress-bar" style={{ height: 8 }}>
                <div
                  className="progress-fill green"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading || processing}
            style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', justifyContent: 'center' }}
          >
            {loading ? (
              <>
                <span className="btn-spinner" />
                Uploading...
              </>
            ) : (
              <>
                <HiLightningBolt /> Upload & Process with AI
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContentUpload;
