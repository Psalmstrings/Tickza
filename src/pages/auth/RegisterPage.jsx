import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, Eye, EyeOff, CheckCircle, ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';
import api from '../../lib/axios.js';
import TickzaLogo from '../../components/ui/TickzaLogo.jsx';

function Field({ label, icon, type = 'text', value, onChange, placeholder, required = true }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <label
        style={{
          display: 'block',
          color: 'var(--brand-pale-ice, #E6F5F7)',
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
              color: 'rgba(230, 245, 247, 0.5)',
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
            backgroundColor: 'rgba(230, 245, 247, 0.06)',
            border: '1px solid rgba(230, 245, 247, 0.16)',
            borderRadius: '8px',
            color: '#FFFFFF',
            fontSize: '14px',
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
            minHeight: '46px',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--brand-accent, #397C80)';
            e.target.style.boxShadow = '0 0 0 3px rgba(57, 124, 128, 0.25)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'rgba(230, 245, 247, 0.16)';
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const navigate = useNavigate();
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

  const setF = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.password) {
      setError('All fields are required.');
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
      const { data } = await api.post('/auth/register', form);
      localStorage.setItem('tickapp_token', data.token);
      setSuccess(true);
      setTimeout(() => navigate('/home', { replace: true }), 2200);
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
          backgroundColor: 'var(--brand-primary, #0B1025)',
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
            backgroundColor: 'var(--brand-secondary, #111831)',
            borderRadius: '16px',
            border: '1px solid rgba(230, 245, 247, 0.15)',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.6)',
            padding: '40px 28px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '72px',
              height: '72px',
              backgroundColor: 'rgba(57, 124, 128, 0.2)',
              border: '2px solid var(--brand-accent, #397C80)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}
          >
            <CheckCircle size={38} color="var(--brand-pale-ice, #E6F5F7)" />
          </div>
          <h2 style={{ color: 'var(--brand-pale-ice, #E6F5F7)', fontSize: '24px', fontWeight: 800, margin: '0 0 10px' }}>
            Account Created!
          </h2>
          <p style={{ color: 'rgba(230, 245, 247, 0.75)', fontSize: '14px', lineHeight: '1.6', margin: '0 0 24px' }}>
            Welcome to Tickza! You can now browse events, register for free passes, and purchase tickets via Paystack.
          </p>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--brand-warm-accent, #D6BE92)',
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
        backgroundColor: 'var(--brand-primary, #0B1025)',
        backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(57, 124, 128, 0.22) 0%, rgba(11, 16, 37, 0) 70%)',
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
            color: 'rgba(230, 245, 247, 0.75)',
            fontSize: '13px',
            fontWeight: 600,
            textDecoration: 'none',
            padding: '8px 12px',
            borderRadius: '8px',
            backgroundColor: 'rgba(230, 245, 247, 0.05)',
            border: '1px solid rgba(230, 245, 247, 0.1)',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#FFFFFF';
            e.currentTarget.style.backgroundColor = 'rgba(230, 245, 247, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(230, 245, 247, 0.75)';
            e.currentTarget.style.backgroundColor = 'rgba(230, 245, 247, 0.05)';
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
          backgroundColor: 'var(--brand-secondary, #111831)',
          borderRadius: '16px',
          border: '1px solid rgba(230, 245, 247, 0.14)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(230, 245, 247, 0.05)',
          overflow: 'hidden',
        }}
      >
        {/* Brand Header Banner */}
        <div
          style={{
            padding: '32px 28px 22px',
            textAlign: 'center',
            borderBottom: '1px solid rgba(230, 245, 247, 0.08)',
            backgroundColor: 'rgba(230, 245, 247, 0.03)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
            <TickzaLogo height={36} color="var(--brand-pale-ice, #E6F5F7)" />
          </div>
          <h1
            style={{
              color: 'var(--brand-pale-ice, #E6F5F7)',
              fontSize: '22px',
              fontWeight: 800,
              margin: '0 0 6px',
              letterSpacing: '-0.02em',
            }}
          >
            Create Your Account
          </h1>
          <p style={{ color: 'rgba(230, 245, 247, 0.7)', fontSize: '13.5px', margin: 0, lineHeight: 1.4 }}>
            Join Tickza to discover, purchase, and manage events
          </p>
        </div>

        {/* Form Body */}
        <div style={{ padding: '28px 28px 32px' }}>
          {error && (
            <div
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                padding: '12px 14px',
                marginBottom: '20px',
                color: '#FCA5A5',
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
            <div style={{ marginBottom: '14px' }}>
              <label
                style={{
                  display: 'block',
                  color: 'var(--brand-pale-ice, #E6F5F7)',
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
                  color="rgba(230, 245, 247, 0.5)"
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
                    backgroundColor: 'rgba(230, 245, 247, 0.06)',
                    border: '1px solid rgba(230, 245, 247, 0.16)',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                    minHeight: '46px',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--brand-accent, #397C80)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(57, 124, 128, 0.25)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(230, 245, 247, 0.16)';
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
                    color: 'rgba(230, 245, 247, 0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: '18px' }}>
              <label
                style={{
                  display: 'block',
                  color: 'var(--brand-pale-ice, #E6F5F7)',
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
                  color="rgba(230, 245, 247, 0.5)"
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
                    backgroundColor: 'rgba(230, 245, 247, 0.06)',
                    border: '1px solid rgba(230, 245, 247, 0.16)',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                    minHeight: '46px',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--brand-accent, #397C80)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(57, 124, 128, 0.25)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(230, 245, 247, 0.16)';
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
                    color: 'rgba(230, 245, 247, 0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Informative Security & Access Note */}
            <div
              style={{
                backgroundColor: 'rgba(214, 190, 146, 0.1)',
                border: '1px solid rgba(214, 190, 146, 0.28)',
                borderRadius: '8px',
                padding: '12px 14px',
                marginBottom: '20px',
              }}
            >
              <p
                style={{
                  color: 'var(--brand-warm-accent, #D6BE92)',
                  fontSize: '12.5px',
                  margin: 0,
                  lineHeight: '1.5',
                }}
              >
                ✨ New accounts can instantly discover events and purchase tickets. Organizers can request event creation approval via the dashboard.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                minHeight: '48px',
                padding: '12px',
                backgroundColor: loading ? 'rgba(57, 124, 128, 0.6)' : 'var(--brand-accent, #397C80)',
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
                marginBottom: '16px',
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.filter = 'brightness(1.12)';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.filter = 'brightness(1)';
              }}
            >
              {loading ? 'Creating Account…' : 'Create Account'}
            </button>
          </form>

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
                color: 'var(--brand-pale-ice, #E6F5F7)',
                fontWeight: 700,
                textDecoration: 'none',
                borderBottom: '1px solid var(--brand-accent, #397C80)',
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
              borderTop: '1px solid rgba(230, 245, 247, 0.08)',
              color: 'rgba(230, 245, 247, 0.5)',
              fontSize: '12px',
            }}
          >
            <ShieldCheck size={14} color="var(--brand-accent, #397C80)" />
            <span>Secured with Paystack payment gateway</span>
          </div>
        </div>
      </div>
    </div>
  );
}
