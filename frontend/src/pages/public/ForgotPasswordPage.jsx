import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Send, ShieldCheck, KeyRound, Eye, EyeOff, CheckCircle2, AlertCircle, Loader, RefreshCw } from 'lucide-react';
import api from '../../services/api';

// ─── Reusable alert box ─────────────────────────────────────────────────────
const AlertBox = ({ type, message }) => {
  const isError = type === 'error';
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.6rem',
      padding: '0.8rem 1rem',
      borderRadius: 'var(--radius-sm)',
      background: isError ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)',
      border: `1px solid ${isError ? 'rgba(239,68,68,0.35)' : 'rgba(16,185,129,0.35)'}`,
      color: isError ? '#f87171' : '#34d399',
      fontSize: '0.85rem',
      lineHeight: 1.45,
      marginBottom: '1rem',
      animation: 'fadeSlideIn 0.25s ease',
    }}>
      {isError
        ? <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
        : <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: '1px' }} />}
      <span>{message}</span>
    </div>
  );
};

// ─── Step indicator dots ─────────────────────────────────────────────────────
const StepDots = ({ step }) => (
  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
    {[1, 2, 3].map(s => (
      <div key={s} style={{
        width: s === step ? '24px' : '8px',
        height: '8px',
        borderRadius: '9999px',
        background: s === step
          ? 'var(--accent-primary)'
          : s < step
            ? 'var(--accent-primary)'
            : 'var(--border-color)',
        transition: 'all 0.3s ease',
        opacity: s < step ? 0.5 : 1,
      }} />
    ))}
  </div>
);

// ─── Main component ──────────────────────────────────────────────────────────
export const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  // Step 1 state
  const [email, setEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  // Step 2 state  
  const [code, setCode] = useState('');
  const [demoCode, setDemoCode] = useState(''); // shown since no real email service
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeError, setCodeError] = useState('');

  // Step 3 state (success)
  const [step, setStep] = useState(1); // 1 = enter email, 2 = enter code, 3 = success

  // ── Step 1: Check email ───────────────────────────────────────────────────
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setEmailError('');
    setEmailLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email: email.trim().toLowerCase() });
      setDemoCode(res.data.demo_code || '');
      setStep(2);
    } catch (err) {
      setEmailError(err.response?.data?.detail || 'Something went wrong. Please try again.');
    } finally {
      setEmailLoading(false);
    }
  };

  // ── Step 2: Submit code ───────────────────────────────────────────────────
  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    setCodeError('');
    if (code.trim().length !== 6) {
      setCodeError('Please enter the full 6-digit code.');
      return;
    }
    setCodeLoading(true);
    try {
      // We just verify the code matches (the actual reset happens on a subsequent step)
      // For simplicity, we verify it client-side against demoCode, then step 3
      if (code.trim() !== demoCode) {
        setCodeError('Incorrect code. Please try again.');
        setCodeLoading(false);
        return;
      }
      setStep(3);
    } catch (err) {
      setCodeError(err.response?.data?.detail || 'Verification failed.');
    } finally {
      setCodeLoading(false);
    }
  };

  // ── Step: Resend code ─────────────────────────────────────────────────────
  const handleResend = async () => {
    setCodeError('');
    setCode('');
    setEmailLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email: email.trim().toLowerCase() });
      setDemoCode(res.data.demo_code || '');
    } catch {
      setCodeError('Failed to resend. Please go back and try again.');
    } finally {
      setEmailLoading(false);
    }
  };

  // Shared input style
  const inputStyle = {
    width: '100%',
    padding: '0.8rem 1rem 0.8rem 2.6rem',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-main)',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    boxSizing: 'border-box',
  };

  return (
    <div>
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fp-input:focus {
          border-color: var(--accent-primary) !important;
          box-shadow: 0 0 0 3px rgba(40,167,69,0.15) !important;
        }
        .fp-code-input {
          text-align: center;
          font-size: 1.6rem !important;
          font-weight: 800 !important;
          letter-spacing: 0.5em !important;
          padding-left: 1rem !important;
        }
      `}</style>

      {/* ── Back link ─────────────────────────────────────── */}
      <Link
        to="/login"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          textDecoration: 'none',
          marginBottom: '1.5rem',
          transition: 'color 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-primary)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
      >
        <ArrowLeft size={15} /> Back to Sign In
      </Link>

      {/* ── Icon header ───────────────────────────────────── */}
      <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'rgba(40,167,69,0.12)',
          border: '1.5px solid rgba(40,167,69,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem',
        }}>
          {step === 3
            ? <CheckCircle2 size={26} color="var(--accent-primary)" />
            : step === 2
              ? <ShieldCheck size={26} color="var(--accent-primary)" />
              : <KeyRound size={26} color="var(--accent-primary)" />}
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.35rem', color: 'var(--text-main)' }}>
          {step === 1 && 'Forgot Password?'}
          {step === 2 && 'Enter Reset Code'}
          {step === 3 && 'Code Verified!'}
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          {step === 1 && 'Enter your registered email address and we\'ll send you a reset code.'}
          {step === 2 && <>A 6-digit code was sent to <strong style={{ color: 'var(--text-main)' }}>{email}</strong>.</>}
          {step === 3 && 'Your identity has been verified. You can now go back and log in or contact your admin to reset your password.'}
        </p>
      </div>

      <StepDots step={step} />

      {/* ════════════════════════════════════════════════════ */}
      {/* STEP 1 — Enter Email                                 */}
      {/* ════════════════════════════════════════════════════ */}
      {step === 1 && (
        <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {emailError && <AlertBox type="error" message={emailError} />}

          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.45rem', display: 'block' }}>
            Email Address
          </label>
          <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
            <Mail size={16} style={{
              position: 'absolute', left: '12px', top: '50%',
              transform: 'translateY(-50%)', color: 'var(--text-dim)',
              pointerEvents: 'none',
            }} />
            <input
              type="email"
              required
              className="fp-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="e.g. alex@craems.edu"
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={emailLoading}
            style={{
              width: '100%',
              padding: '0.85rem',
              background: emailLoading ? 'var(--border-color)' : 'var(--accent-primary)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: emailLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'background 0.2s ease, transform 0.1s ease',
            }}
            onMouseEnter={e => { if (!emailLoading) e.currentTarget.style.background = '#1e7e34'; }}
            onMouseLeave={e => { if (!emailLoading) e.currentTarget.style.background = 'var(--accent-primary)'; }}
          >
            {emailLoading
              ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Checking...</>
              : <><Send size={16} /> Continue</>}
          </button>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </form>
      )}

      {/* ════════════════════════════════════════════════════ */}
      {/* STEP 2 — Enter Code                                  */}
      {/* ════════════════════════════════════════════════════ */}
      {step === 2 && (
        <form onSubmit={handleCodeSubmit}>
          {codeError && <AlertBox type="error" message={codeError} />}

          {/* Demo code hint box */}
          {demoCode && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(40,167,69,0.08)',
              border: '1px dashed rgba(40,167,69,0.4)',
              marginBottom: '1.25rem',
              fontSize: '0.82rem',
              color: 'var(--text-muted)',
            }}>
              <ShieldCheck size={16} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
              <span>
                Demo mode — no email sent. Your code:{' '}
                <strong style={{
                  fontSize: '1rem',
                  color: 'var(--accent-primary)',
                  fontFamily: 'monospace',
                  letterSpacing: '0.15em',
                }}>
                  {demoCode}
                </strong>
              </span>
            </div>
          )}

          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.45rem', display: 'block' }}>
            6-Digit Reset Code
          </label>

          <div style={{ display: 'flex', gap: '0.65rem', marginBottom: '1.25rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <ShieldCheck size={16} style={{
                position: 'absolute', left: '12px', top: '50%',
                transform: 'translateY(-50%)', color: 'var(--text-dim)',
                pointerEvents: 'none',
              }} />
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                className="fp-input fp-code-input"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                style={{
                  ...inputStyle,
                  textAlign: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  letterSpacing: '0.4em',
                  paddingLeft: '1rem',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={codeLoading || code.length !== 6}
              style={{
                padding: '0.8rem 1.25rem',
                background: (codeLoading || code.length !== 6) ? 'var(--border-color)' : 'var(--accent-primary)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: (codeLoading || code.length !== 6) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                whiteSpace: 'nowrap',
                transition: 'background 0.2s ease',
                flexShrink: 0,
              }}
              onMouseEnter={e => { if (!codeLoading && code.length === 6) e.currentTarget.style.background = '#1e7e34'; }}
              onMouseLeave={e => { if (!codeLoading && code.length === 6) e.currentTarget.style.background = 'var(--accent-primary)'; }}
            >
              {codeLoading
                ? <Loader size={15} style={{ animation: 'spin 1s linear infinite' }} />
                : <><ShieldCheck size={15} /> Submit</>}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
            <button
              type="button"
              onClick={() => { setStep(1); setCode(''); setCodeError(''); }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.82rem',
              }}
            >
              <ArrowLeft size={13} /> Change email
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={emailLoading}
              style={{
                background: 'none',
                border: 'none',
                color: emailLoading ? 'var(--text-dim)' : 'var(--accent-primary)',
                cursor: emailLoading ? 'not-allowed' : 'pointer',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.82rem',
                fontWeight: 600,
              }}
            >
              <RefreshCw size={13} /> Resend code
            </button>
          </div>
        </form>
      )}

      {/* ════════════════════════════════════════════════════ */}
      {/* STEP 3 — Verified Success                            */}
      {/* ════════════════════════════════════════════════════ */}
      {step === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeSlideIn 0.3s ease' }}>
          <AlertBox type="success" message="Code verified successfully! Please contact your administrator to complete the password reset, or use the login page to try signing in." />

          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            padding: '1rem',
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
          }}>
            <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '0.3rem' }}>
              📧 For a full password reset:
            </strong>
            In this demo environment, the reset code is shown on screen. In a production deployment, the code would be emailed to you, and you'd enter a new password after verification.
          </div>

          <button
            onClick={() => navigate('/login')}
            style={{
              width: '100%',
              padding: '0.85rem',
              background: 'var(--accent-primary)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'background 0.2s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#1e7e34'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--accent-primary)'}
          >
            <ArrowLeft size={16} /> Back to Sign In
          </button>
        </div>
      )}
    </div>
  );
};
