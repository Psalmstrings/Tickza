import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Mail, CheckCircle2, ArrowRight, RefreshCw, AlertCircle, ArrowLeft, ShieldCheck } from 'lucide-react';
import api from '../../lib/axios.js';
import { useAuth } from '../../context/AuthContext.jsx';
import TickzaLogo from '../../components/ui/TickzaLogo.jsx';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  const urlEmail = searchParams.get('email') || '';
  const urlCode = searchParams.get('code') || '';

  const [email, setEmail] = useState(urlEmail);
  const [code, setCode] = useState(urlCode);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMessage, setResendMessage] = useState('');

  // Handle countdown timer for resend code
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // If email and 6-digit code are provided in the URL query string, auto-verify immediately!
  useEffect(() => {
    if (urlEmail && urlCode && urlCode.length === 6 && !success && !loading) {
      handleVerify(urlEmail, urlCode);
    }
  }, [urlEmail, urlCode]);

  const handleVerify = async (verifyEmailVal, verifyCodeVal) => {
    const targetEmail = (verifyEmailVal || email).trim();
    const targetCode = (verifyCodeVal || code).trim();

    if (!targetEmail) {
      setError('Please provide your email address.');
      return;
    }
    if (!targetCode || targetCode.length < 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }

    setLoading(true);
    setError('');
    setResendMessage('');

    try {
      const { data } = await api.post('/auth/verify-email', {
        email: targetEmail,
        code: targetCode,
      });

      if (data.token) {
        localStorage.setItem('tickapp_token', data.token);
      }
      if (data.user) {
        updateUser(data.user);
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/home', { replace: true });
      }, 2500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Verification failed. Please ensure the code is correct or request a new one.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError('Please enter your email address to resend the code.');
      return;
    }
    if (resendCooldown > 0) return;

    setResending(true);
    setError('');
    setResendMessage('');

    try {
      const { data } = await api.post('/auth/resend-verification', {
        email: email.trim(),
      });
      setResendMessage(data.message || 'A new verification code has been sent to your email.');
      setResendCooldown(45); // 45 seconds cooldown
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend verification code. Please try again.');
    } finally {
      setResending(false);
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
          to="/login"
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
        >
          <ArrowLeft size={15} /> Back to Sign In
        </Link>
      </div>

      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid var(--border-subtle, #E5E7EB)',
          boxShadow: '0 20px 40px rgba(17, 24, 39, 0.08)',
          padding: '36px 32px',
          boxSizing: 'border-box',
          textAlign: 'center',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <TickzaLogo height={32} />
        </div>

        {success ? (
          <div>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#ECFDF5',
                border: '2px solid var(--state-success, #16A34A)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px',
              }}
            >
              <CheckCircle2 size={36} color="var(--state-success, #16A34A)" />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#111827', margin: '0 0 10px' }}>
              Email Verified!
            </h2>
            <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.5, margin: '0 0 24px' }}>
              Your account email is successfully verified. We are redirecting you to your Tickza home dashboard now…
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  border: '3px solid rgba(36, 87, 255, 0.2)',
                  borderTopColor: 'var(--brand-primary, #2457FF)',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
            </div>
          </div>
        ) : (
          <div>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '14px',
                backgroundColor: 'rgba(36, 87, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                color: 'var(--brand-primary, #2457FF)',
              }}
            >
              <Mail size={30} />
            </div>

            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#111827', margin: '0 0 8px' }}>
              Verify Your Email
            </h2>
            <p style={{ fontSize: '13.5px', color: '#64748B', lineHeight: 1.5, margin: '0 0 22px' }}>
              We've sent a 6-digit confirmation code to your Gmail/email address. Enter the code below to verify your account:
            </p>

            {error && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '11px 14px',
                  borderRadius: '8px',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: '#DC2626',
                  fontSize: '13px',
                  marginBottom: '18px',
                  textAlign: 'left',
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {resendMessage && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '11px 14px',
                  borderRadius: '8px',
                  backgroundColor: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  color: '#065F46',
                  fontSize: '13px',
                  marginBottom: '18px',
                  textAlign: 'left',
                }}
              >
                <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                <span>{resendMessage}</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleVerify();
              }}
            >
              {/* Email Address field */}
              <div style={{ textAlign: 'left', marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Account Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle, #E5E7EB)',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>

              {/* 6-digit Code input */}
              <div style={{ textAlign: 'left', marginBottom: '22px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  autoFocus
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '2px solid var(--brand-primary, #2457FF)',
                    fontSize: '24px',
                    fontWeight: 700,
                    letterSpacing: '8px',
                    textAlign: 'center',
                    boxSizing: 'border-box',
                    outline: 'none',
                    backgroundColor: '#F8FAFC',
                    fontFamily: 'monospace',
                  }}
                />
              </div>

              {/* Submit Verification Button */}
              <button
                type="submit"
                disabled={loading || code.length < 6}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: loading || code.length < 6 ? 'rgba(36, 87, 255, 0.5)' : 'var(--brand-primary, #2457FF)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '15px',
                  cursor: loading || code.length < 6 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginBottom: '16px',
                  boxShadow: '0 4px 12px rgba(36, 87, 255, 0.25)',
                }}
              >
                {loading ? 'Verifying Code…' : 'Verify Account'} <ArrowRight size={16} />
              </button>
            </form>

            {/* Resend Code Section */}
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle, #E5E7EB)' }}>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 10px' }}>
                Didn't receive the email? Check your Spam folder or resend:
              </p>
              <button
                type="button"
                onClick={handleResend}
                disabled={resending || resendCooldown > 0}
                style={{
                  background: 'none',
                  border: 'none',
                  color: resendCooldown > 0 ? '#94A3B8' : 'var(--brand-primary, #2457FF)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                }}
              >
                <RefreshCw size={14} className={resending ? 'animate-spin' : ''} />
                {resendCooldown > 0 ? `Resend Code in ${resendCooldown}s` : 'Resend Verification Code'}
              </button>
            </div>
          </div>
        )}

        {/* Security Trust Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-subtle, #E5E7EB)',
            color: 'var(--text-secondary, #64748B)',
            fontSize: '12px',
          }}
        >
          <ShieldCheck size={14} color="var(--state-success, #16A34A)" />
          <span>Tickza Protected Two-Factor Verification</span>
        </div>
      </div>
    </div>
  );
}
