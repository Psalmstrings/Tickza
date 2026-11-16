import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, Eye, EyeOff, CheckCircle, ArrowLeft, ShieldCheck, Sparkles, FileText } from 'lucide-react';
import api from '../../lib/axios.js';
import { useAuth } from '../../context/AuthContext.jsx';
import TickzaLogo from '../../components/ui/TickzaLogo.jsx';
import TermsModal from '../../components/auth/TermsModal.jsx';

function Field({ label, icon, type = 'text', value, onChange, placeholder, required = true }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <label
        style={{
          display: 'block',
          color: 'var(--text-primary, #111827)',
          fontSize: '13px',
          fontWeight: 600,
          marginBottom: '6px',
        }}
      >
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        {icon && (
          <div
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              color: 'var(--text-secondary, #64748B)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          style={{
            width: '100%',
            padding: `12px 14px 12px ${icon ? '42px' : '14px'}`,
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
  );
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const setF = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.password) {
      setError('All fields are required.');
      return;
    }
    if (!acceptedTerms) {
      setError('You must read and accept the Terms and Conditions before registering.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await register({ ...form, acceptedTerms: true });
      if (res?.requiresVerification) {
        navigate(`/verify-email?email=${encodeURIComponent(form.email.trim())}`, { replace: true });
      } else {
        setSuccess(true);
        setTimeout(() => navigate('/home', { replace: true }), 2200);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: 'var(--surface-page, #F5F7FF)',
          backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(57, 124, 128, 0.25) 0%, rgba(11, 16, 37, 0) 70%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            maxWidth: '440px',
            width: '100%',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid var(--border-subtle, #E5E7EB)',
            boxShadow: '0 20px 40px rgba(17, 24, 39, 0.08)',
            padding: '40px 28px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '72px',
              height: '72px',
              backgroundColor: '#ECFDF5',
              border: '2px solid var(--state-success, #16A34A)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}
          >
            <CheckCircle size={38} color="var(--state-success, #16A34A)" />
          </div>
          <h2 style={{ color: 'var(--text-primary, #111827)', fontSize: '24px', fontWeight: 800, margin: '0 0 10px' }}>
            Account Created!
          </h2>
          <p style={{ color: 'var(--text-secondary, #64748B)', fontSize: '14px', lineHeight: '1.6', margin: '0 0 24px' }}>
            Welcome to Tickza! You can now browse events, register for free passes, and purchase tickets via Paystack.
          </p>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--brand-accent, #FF6B35)',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            <Sparkles size={16} /> Redirecting to home...
          </div>
        </div>
      </div>
    );
  }

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
      <div style={{ width: '100%', maxWidth: '480px', marginBottom: '16px' }}>
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
          maxWidth: '480px',
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
            padding: '32px 28px 22px',
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
            Create Your Account
          </h1>
          <p style={{ color: 'var(--text-secondary, #64748B)', fontSize: '13.5px', margin: 0, lineHeight: 1.4 }}>
            Join Tickza to discover, purchase, and manage events
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

          <form onSubmit={handleSubmit}>
            {/* First & Last Name row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '12px' }}>
              <Field
                label="First Name"
                icon={<User size={16} />}
                value={form.firstName}
                onChange={(e) => setF('firstName', e.target.value)}
                placeholder="First name"
              />
              <Field
                label="Last Name"
                value={form.lastName}
                onChange={(e) => setF('lastName', e.target.value)}
                placeholder="Last name"
              />
            </div>

            {/* Email Address */}
            <Field
              label="Email Address"
              icon={<Mail size={16} />}
              type="email"
              value={form.email}
              onChange={(e) => setF('email', e.target.value)}
              placeholder="you@example.com"
            />

            {/* Phone Number */}
            <Field
              label="Phone Number"
              icon={<Phone size={16} />}
              type="tel"
              value={form.phone}
              onChange={(e) => setF('phone', e.target.value)}
              placeholder="+234 800 000 0000"
            />

            {/* Password */}
            <div style={{ marginBottom: '16px' }}>
              <label
                style={{
                  display: 'block',
                  color: 'var(--text-primary, #111827)',
                  fontSize: '13px',
                  fontWeight: 600,
                  marginBottom: '6px',
                }}
              >
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  color="var(--text-secondary, #64748B)"
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setF('password', e.target.value)}
                  placeholder="Minimum 6 characters"
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
                  onClick={() => setShowPw(!showPw)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
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
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Live Password Visual Feedback */}
              {form.password.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px', fontSize: '12px' }}>
                  <span style={{ color: form.password.length >= 6 ? '#16A34A' : '#D97706', fontWeight: 600 }}>
                    {form.password.length >= 6 ? '✓ Minimum length satisfied' : `• ${form.password.length}/6 characters typed`}
                  </span>
                  <span style={{ color: '#64748B', fontWeight: 500 }}>
                    {form.password.length >= 10 ? '🔒 Strong password' : form.password.length >= 6 ? 'Good' : 'Keep typing…'}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: '18px' }}>
              <label
                style={{
                  display: 'block',
                  color: 'var(--text-primary, #111827)',
                  fontSize: '13px',
                  fontWeight: 600,
                  marginBottom: '6px',
                }}
              >
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  color="var(--text-secondary, #64748B)"
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                />
                <input
                  type={showConfirmPw ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={(e) => setF('confirmPassword', e.target.value)}
                  placeholder="Repeat your password"
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
                  onClick={() => setShowConfirmPw(!showConfirmPw)}
                  aria-label={showConfirmPw ? 'Hide password' : 'Show password'}
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
                  {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Live Confirm Password Feedback */}
              {form.confirmPassword.length > 0 && (
                <div style={{ marginTop: '6px', fontSize: '12px' }}>
                  <span style={{ color: form.password === form.confirmPassword ? '#16A34A' : '#DC2626', fontWeight: 600 }}>
                    {form.password === form.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </span>
                </div>
              )}
            </div>

            {/* Terms and Conditions Checkbox & Agreement */}
            <div
              style={{
                backgroundColor: 'rgba(230, 245, 247, 0.04)',
                border: acceptedTerms
                  ? '1px solid rgba(22, 163, 74, 0.4)'
                  : '1px solid var(--border-subtle, #E5E7EB)',
                borderRadius: '8px',
                padding: '12px 14px',
                marginBottom: '20px',
                transition: 'all 0.2s ease',
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  color: 'var(--text-primary, #111827)',
                  lineHeight: '1.5',
                }}
              >
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  required
                  style={{
                    width: '18px',
                    height: '18px',
                    marginTop: '2px',
                    cursor: 'pointer',
                    accentColor: 'var(--brand-primary, #2457FF)',
                    flexShrink: 0,
                  }}
                />
                <span>
                  I have read, understood, and accept the{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowTermsModal(true);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      color: 'var(--brand-primary, #2457FF)',
                      fontWeight: 700,
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      fontSize: '13px',
                    }}
                  >
                    Terms & Conditions of Service
                  </button>{' '}
                  and Privacy Policy.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !acceptedTerms}
              style={{
                width: '100%',
                minHeight: '48px',
                padding: '12px',
                backgroundColor:
                  loading || !acceptedTerms
                    ? 'rgba(36, 87, 255, 0.45)'
                    : 'var(--brand-primary, #2457FF)',
                border: 'none',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '15px',
                cursor: loading || !acceptedTerms ? 'not-allowed' : 'pointer',
                transition: 'filter 0.15s ease, background-color 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
              onMouseEnter={(e) => {
                if (!loading && acceptedTerms) e.currentTarget.style.filter = 'brightness(1.12)';
              }}
              onMouseLeave={(e) => {
                if (!loading && acceptedTerms) e.currentTarget.style.filter = 'brightness(1)';
              }}
            >
              {loading ? 'Creating Account…' : 'Create Account'}
            </button>
          </form>

          {/* Terms Modal */}
          <TermsModal
            isOpen={showTermsModal}
            onClose={() => setShowTermsModal(false)}
            onAccept={() => {
              setAcceptedTerms(true);
              setShowTermsModal(false);
            }}
          />

          {/* Prompt to Sign In */}
          <p
            style={{
              textAlign: 'center',
              color: 'rgba(230, 245, 247, 0.7)',
              fontSize: '14px',
              margin: '20px 0 0',
            }}
          >
            Already have an account?{' '}
            <Link
              to="/login"
              style={{
                color: 'var(--text-primary, #111827)',
                fontWeight: 700,
                textDecoration: 'none',
                borderBottom: '1.5px solid var(--brand-primary, #2457FF)',
                paddingBottom: '1px',
              }}
            >
              Sign In
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
    </div>
  );
}
