import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, X, CheckCircle, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import TickzaLogo from '../../components/ui/TickzaLogo.jsx';
import api from '../../lib/axios.js';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(form.email.trim(), form.password);
      navigate('/home', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: forgotEmail });
    } catch (err) {
      // show success for security purposes
    } finally {
      setForgotSent(true);
      setForgotLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--surface-page, #F5F7FF)',
        backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(36, 87, 255, 0.08) 0%, rgba(245, 247, 255, 0) 70%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        boxSizing: 'border-box',
        position: 'relative',
      }}
    >
      {/* Top back navigation button */}
      <div style={{ width: '100%', maxWidth: '440px', marginBottom: '16px' }}>
        <Link
          to="/home"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--text-primary, #111827)',
            fontSize: '13px',
            fontWeight: 600,
            textDecoration: 'none',
            padding: '8px 14px',
            borderRadius: '8px',
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--border-subtle, #E5E7EB)',
            boxShadow: '0 1px 3px rgba(17, 24, 39, 0.05)',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--subtle-blue, #EAF0FF)';
            e.currentTarget.style.color = 'var(--brand-primary, #2457FF)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#FFFFFF';
            e.currentTarget.style.color = 'var(--text-primary, #111827)';
          }}
        >
          <ArrowLeft size={15} /> Back to Events
        </Link>
      </div>

      {/* Main Authentication Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid var(--border-subtle, #E5E7EB)',
          boxShadow: '0 20px 40px rgba(17, 24, 39, 0.08)',
          overflow: 'hidden',
        }}
      >
        {/* Brand Header Banner */}
        <div
          style={{
            padding: '32px 28px 24px',
            textAlign: 'center',
            borderBottom: '1px solid var(--border-subtle, #E5E7EB)',
            backgroundColor: 'transparent',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
            <TickzaLogo height={36} color="var(--brand-primary, #2457FF)" />
          </div>
          <h1
            style={{
              color: 'var(--text-primary, #111827)',
              fontSize: '22px',
              fontWeight: 800,
              margin: '0 0 6px',
              letterSpacing: '-0.02em',
            }}
          >
            Welcome Back
          </h1>
          <p style={{ color: 'var(--text-secondary, #64748B)', fontSize: '13.5px', margin: 0, lineHeight: 1.4 }}>
            Sign in to access your tickets, passes, and events
          </p>
        </div>

        {/* Form Body */}
        <div style={{ padding: '28px 28px 32px' }}>
          {error && (
            <div
              style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FCA5A5',
                borderRadius: '8px',
                padding: '12px 14px',
                marginBottom: '20px',
                color: '#DC2626',
                fontSize: '13px',
                lineHeight: 1.45,
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Email Field */}
            <div>
              <label
                style={{
                  display: 'block',
                  color: 'var(--text-primary, #111827)',
                  fontSize: '13px',
                  fontWeight: 600,
                  marginBottom: '6px',
                }}
              >
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  color="var(--text-secondary, #64748B)"
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--border-subtle, #E5E7EB)',
                    borderRadius: '8px',
                    color: 'var(--text-primary, #111827)',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                    minHeight: '46px',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--brand-primary, #2457FF)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(36, 87, 255, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--border-subtle, #E5E7EB)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label
                  style={{
                    color: 'var(--text-primary, #111827)',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgot(true);
                    setForgotSent(false);
                    setForgotEmail(form.email || '');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--brand-primary, #2457FF)',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: 0,
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                  onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                >
                  Forgot password?
                </button>
              </div>

              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  color="var(--text-secondary, #64748B)"
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder="Your password"
                  autoComplete="current-password"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 46px 12px 42px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--border-subtle, #E5E7EB)',
                    borderRadius: '8px',
                    color: 'var(--text-primary, #111827)',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                    minHeight: '46px',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--brand-primary, #2457FF)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(36, 87, 255, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--border-subtle, #E5E7EB)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px',
                    color: 'var(--text-secondary, #64748B)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                minHeight: '48px',
                padding: '12px',
                backgroundColor: loading ? 'rgba(36, 87, 255, 0.6)' : 'var(--brand-primary, #2457FF)',
                border: 'none',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '15px',
                cursor: loading ? 'wait' : 'pointer',
                transition: 'filter 0.15s ease, background-color 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: '6px',
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.filter = 'brightness(1.12)';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.filter = 'brightness(1)';
              }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Prompt to Register */}
          <p
            style={{
              textAlign: 'center',
              color: 'var(--text-secondary, #64748B)',
              fontSize: '14px',
              margin: '24px 0 0',
            }}
          >
            Don't have an account?{' '}
            <Link
              to="/register"
              style={{
                color: 'var(--text-primary, #111827)',
                fontWeight: 700,
                textDecoration: 'none',
                borderBottom: '1.5px solid var(--brand-primary, #2457FF)',
                paddingBottom: '1px',
              }}
            >
              Create Account
            </Link>
          </p>

          {/* Secure transaction badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginTop: '24px',
              paddingTop: '18px',
              borderTop: '1px solid var(--border-subtle, #E5E7EB)',
              color: 'var(--text-secondary, #64748B)',
              fontSize: '12px',
            }}
          >
            <ShieldCheck size={14} color="var(--state-success, #16A34A)" />
            <span>Secured with Paystack payment gateway</span>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal (Midnight Navy Theme) */}
      {showForgot && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(11, 16, 37, 0.8)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '20px',
          }}
          onClick={() => setShowForgot(false)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '28px',
              width: '100%',
              maxWidth: '420px',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.6)',
              border: '1px solid rgba(230, 245, 247, 0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ color: 'var(--text-primary, #111827)', fontSize: '18px', fontWeight: 800, margin: 0 }}>
                Reset Password
              </h3>
              <button
                onClick={() => setShowForgot(false)}
                style={{
                  background: 'rgba(230, 245, 247, 0.08)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'rgba(230, 245, 247, 0.8)',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {forgotSent ? (
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <CheckCircle size={46} color="var(--state-success, #16A34A)" style={{ marginBottom: '12px' }} />
                <p style={{ color: 'var(--text-primary, #111827)', fontWeight: 700, fontSize: '16px', margin: '0 0 8px' }}>
                  Check your email
                </p>
                <p style={{ color: 'var(--text-secondary, #64748B)', fontSize: '13.5px', margin: '0 0 24px', lineHeight: 1.5 }}>
                  If an account exists for <strong>{forgotEmail}</strong>, password reset instructions have been sent.
                </p>
                <button
                  onClick={() => setShowForgot(false)}
                  style={{
                    width: '100%',
                    minHeight: '44px',
                    padding: '11px 24px',
                    backgroundColor: 'var(--brand-primary, #2457FF)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword}>
                <p style={{ color: 'var(--text-secondary, #64748B)', fontSize: '13.5px', margin: '0 0 18px', lineHeight: 1.5 }}>
                  Enter your email address and we will send you a secure link to reset your account password.
                </p>
                <div style={{ marginBottom: '20px' }}>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      backgroundColor: 'rgba(230, 245, 247, 0.06)',
                      border: '1px solid rgba(230, 245, 247, 0.16)',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      minHeight: '46px',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setShowForgot(false)}
                    style={{
                      flex: 1,
                      minHeight: '44px',
                      backgroundColor: 'rgba(230, 245, 247, 0.08)',
                      border: '1px solid rgba(230, 245, 247, 0.15)',
                      borderRadius: '8px',
                      color: 'var(--text-primary, #111827)',
                      fontWeight: 600,
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    style={{
                      flex: 1,
                      minHeight: '44px',
                      backgroundColor: 'var(--brand-primary, #2457FF)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: '14px',
                      cursor: forgotLoading ? 'wait' : 'pointer',
                    }}
                  >
                    {forgotLoading ? 'Sending…' : 'Send Link'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
