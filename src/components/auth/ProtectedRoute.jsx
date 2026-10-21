import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import LoadingSpinner from '../ui/LoadingSpinner.jsx';

export default function ProtectedRoute({ children, requireApproved = false, requireAdmin = false }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;

  const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';

  if (requireAdmin && !isAdmin) return <Navigate to="/home" replace />;

  const isApprovedOrganizer = isAdmin || (user.status === 'APPROVED' && ['APPROVED_USER', 'ORGANIZER'].includes(user.role));

  if (requireApproved && !isApprovedOrganizer) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-background-neutral, #FAFAF9)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '36px 28px', textAlign: 'center', maxWidth: '380px', border: '1px solid var(--color-border, #E7E5E4)', boxShadow: '0 12px 32px rgba(41, 37, 36, 0.08)' }}>
          <div style={{ width: '64px', height: '64px', background: 'var(--color-surface-soft, #FFF4EE)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '1px solid rgba(255, 90, 95, 0.2)' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary, #FF5A5F)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </div>
          <h3 style={{ color: 'var(--color-text-primary, #292524)', fontSize: '19px', fontWeight: 800, margin: '0 0 10px' }}>Organizer Access Required</h3>
          <p style={{ color: 'var(--color-text-secondary, #57534E)', fontSize: '14px', lineHeight: '1.6', margin: '0 0 24px' }}>
            Event creation and organizer tools are reserved for approved event organizers. Your account is pending admin verification.
          </p>
          <a href="/home" style={{ display: 'block', padding: '13px', background: 'var(--color-primary, #FF5A5F)', borderRadius: '10px', color: '#ffffff', fontWeight: 700, fontSize: '14px', textDecoration: 'none', boxShadow: '0 4px 12px rgba(255, 90, 95, 0.28)' }}>
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return children;
}
