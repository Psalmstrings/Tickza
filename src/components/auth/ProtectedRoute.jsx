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
      <div style={{ minHeight: '100vh', background: '#0B1025', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ background: '#101736', borderRadius: '20px', padding: '32px 24px', textAlign: 'center', maxWidth: '360px', border: '1px solid rgba(57,124,128,0.25)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
          <div style={{ width: '60px', height: '60px', background: 'rgba(57,124,128,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E6F5F7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </div>
          <h3 style={{ color: '#E6F5F7', fontSize: '18px', fontWeight: 700, margin: '0 0 10px' }}>Organizer Access Required</h3>
          <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6', margin: '0 0 24px' }}>
            Event creation and organizer tools are reserved for approved event organizers. Your account is pending admin verification.
          </p>
          <a href="/home" style={{ display: 'block', padding: '13px', background: '#397C80', borderRadius: '12px', color: '#ffffff', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}>
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return children;
}
