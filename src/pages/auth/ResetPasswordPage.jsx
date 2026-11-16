import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, ArrowRight, AlertCircle, ArrowLeft, ShieldCheck, KeyRound } from 'lucide-react';
import api from '../../lib/axios.js';
import TickzaLogo from '../../components/ui/TickzaLogo.jsx';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const urlToken = searchParams.get('token') || '';
  const urlEmail = searchParams.get('email') || '';

  const [token, setToken] = useState(urlToken);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('Password reset token is missing. Please use the link sent to your email.');
      return;
    }
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all password fields.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please ensure both passwords match.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/auth/reset-password', {
        token: token.trim(),
        newPassword,
        confirmPassword,
      });

      setSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to reset password. The link may have expired or is invalid.'
      );
    } finally {
      setLoading(false);
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
      {/* Top back navigation */}
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
              Password Reset!
            </h2>
            <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.5, margin: '0 0 24px' }}>
              Your Tickza account password has been successfully updated. You can now log in with your new credentials.
            </p>
            <button
              onClick={() => navigate('/login', { replace: true })}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: 'var(--brand-primary, #2457FF)',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '15px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(36, 87, 255, 0.25)',
              }}
            >
              Sign In Now <ArrowRight size={16} />
            </button>
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
              <KeyRound size={28} />
            </div>

            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#111827', margin: '0 0 8px' }}>
              Create New Password
            </h2>
            <p style={{ fontSize: '13.5px', color: '#64748B', lineHeight: 1.5, margin: '0 0 22px' }}>
              {urlEmail
                ? `Set a new secure password for ${urlEmail}`
                : 'Choose a strong, secure password for your Tickza account.'}
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

            <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
              {/* Reset token input (hidden if loaded from URL, editable if manual) */}
              {!urlToken && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                    Reset Token / Code
                  </label>
                  <input
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Paste reset token here"
                    required
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle, #E5E7EB)',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                  />
                </div>
              )}

              {/* New Password */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94A3B8',
                      display: 'flex',
                    }}
                  >
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    style={{
                      width: '100%',
                      padding: '11px 40px 11px 38px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle, #E5E7EB)',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#94A3B8',
                      display: 'flex',
                      padding: '4px',
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Confirm New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94A3B8',
                      display: 'flex',
                    }}
                  >
                    <Lock size={16} />
                  </div>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    required
                    style={{
                      width: '100%',
                      padding: '11px 40px 11px 38px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle, #E5E7EB)',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#94A3B8',
                      display: 'flex',
                      padding: '4px',
                    }}
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: loading ? 'rgba(36, 87, 255, 0.6)' : 'var(--brand-primary, #2457FF)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '15px',
                  cursor: loading ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(36, 87, 255, 0.25)',
                }}
              >
                {loading ? 'Updating Password…' : 'Reset Password'} <ArrowRight size={16} />
              </button>
            </form>
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
          <span>Encrypted with SHA-256 / Bcrypt Hash</span>
        </div>
      </div>
    </div>
  );
}
