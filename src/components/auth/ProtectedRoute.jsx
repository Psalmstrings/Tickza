import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import LoadingSpinner from '../ui/LoadingSpinner.jsx';
import OrganizerRequestModal from '../organizer/OrganizerRequestModal.jsx';
import { Sparkles, Clock, ShieldCheck, ArrowRight } from 'lucide-react';

export default function ProtectedRoute({ children, requireApproved = false, requireAdmin = false }) {
  const { user, loading, isOrganizer } = useAuth();
  const [showApplyModal, setShowApplyModal] = useState(false);

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;

  const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';

  if (requireAdmin && !isAdmin) return <Navigate to="/home" replace />;

  // Approved organizers or admins can access organizer-restricted routes
  const isApprovedOrganizer = isOrganizer || isAdmin;

  if (requireApproved && !isApprovedOrganizer) {
    const isPendingReview = user.organizerStatus === 'REQUESTED';

    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--color-background-neutral, #FAFAF9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 16px',
        }}
      >
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            padding: '40px 32px',
            textAlign: 'center',
            maxWidth: '460px',
            width: '100%',
            border: '1px solid var(--color-border, #E7E5E4)',
            boxShadow: '0 16px 40px rgba(41, 37, 36, 0.08)',
          }}
        >
          {isPendingReview ? (
            <>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  background: '#FEF3C7',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  border: '2px solid #FDE68A',
                  color: '#D97706',
                }}
              >
                <Clock size={30} />
              </div>
              <h3 style={{ color: 'var(--color-text-primary, #292524)', fontSize: '20px', fontWeight: 800, margin: '0 0 10px' }}>
                Application Under Review
              </h3>
              <p style={{ color: 'var(--color-text-secondary, #57534E)', fontSize: '14px', lineHeight: '1.6', margin: '0 0 24px' }}>
                Your request to become an event organizer on Tickza has been received and is currently being reviewed by our admin team. You will be notified once approved.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowApplyModal(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '13px',
                    background: '#F3F4F6',
                    borderRadius: '12px',
                    color: '#1F2937',
                    fontWeight: 600,
                    fontSize: '14px',
                    border: '1px solid #E5E7EB',
                    cursor: 'pointer',
                  }}
                >
                  View Application Details
                </button>
                <a
                  href="/home"
                  style={{
                    display: 'block',
                    padding: '13px',
                    background: 'var(--color-primary, #FF5A5F)',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '14px',
                    textDecoration: 'none',
                    boxShadow: '0 4px 14px rgba(255, 90, 95, 0.28)',
                  }}
                >
                  Back to Home
                </a>
              </div>
            </>
          ) : (
            <>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  background: 'var(--color-surface-soft, #FFF4EE)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  border: '1px solid rgba(255, 90, 95, 0.2)',
                  color: 'var(--color-primary, #FF5A5F)',
                }}
              >
                <Sparkles size={30} />
              </div>
              <h3 style={{ color: 'var(--color-text-primary, #292524)', fontSize: '20px', fontWeight: 800, margin: '0 0 10px' }}>
                Become an Event Organizer
              </h3>
              <p style={{ color: 'var(--color-text-secondary, #57534E)', fontSize: '14px', lineHeight: '1.6', margin: '0 0 24px' }}>
                Event creation and ticket management tools are available for approved organizers. Submit a quick request to the admin to get started!
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowApplyModal(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '13px',
                    background: 'linear-gradient(135deg, #FF5A5F, #FF8A3D)',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '14px',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(255, 90, 95, 0.3)',
                  }}
                >
                  <span>Start Organizing Now</span>
                  <ArrowRight size={16} />
                </button>
                <a
                  href="/home"
                  style={{
                    display: 'block',
                    padding: '12px',
                    background: 'transparent',
                    borderRadius: '12px',
                    color: 'var(--color-text-secondary, #57534E)',
                    fontWeight: 600,
                    fontSize: '14px',
                    textDecoration: 'none',
                  }}
                >
                  Explore Events
                </a>
              </div>
            </>
          )}

          <OrganizerRequestModal
            isOpen={showApplyModal}
            onClose={() => setShowApplyModal(false)}
          />
        </div>
      </div>
    );
  }

  return children;
}
