import React, { useState } from 'react';
import { X, Sparkles, Building2, FileText, Phone, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../ui/Toast.jsx';

export default function OrganizerRequestModal({ isOpen, onClose }) {
  const { user, requestOrganizerAccess } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    organizationName: user?.organizationName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || '',
    organizerBio: user?.organizerBio || '',
    phone: user?.phone || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const isPendingReview = user?.organizerStatus === 'REQUESTED' || success;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.organizationName.trim()) {
      setError('Please provide your organization or brand name');
      return;
    }

    if (!formData.organizerBio.trim()) {
      setError('Please briefly describe the events you plan to host');
      return;
    }

    try {
      setIsSubmitting(true);
      await requestOrganizerAccess(formData);
      setSuccess(true);
      toast.success('Organizer request submitted successfully! An admin will review it shortly.');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit organizer request. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '520px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 45px rgba(0, 0, 0, 0.2)',
          border: '1px solid var(--border-subtle, #E5E7EB)',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-subtle, #E5E7EB)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #FFF5F5 0%, #FFFFFF 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #FF5A5F, #FF8A3D)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#111827' }}>
                {isPendingReview ? 'Organizer Request Pending' : 'Become a Tickza Organizer'}
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#6B7280' }}>
                {isPendingReview ? 'Your application is currently under review' : 'Host, sell tickets and manage events effortlessly'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#9CA3AF',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
          {isPendingReview ? (
            <div style={{ textAlign: 'center', padding: '12px 6px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#FEF3C7',
                  color: '#D97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  border: '2px solid #FDE68A',
                }}
              >
                <Clock size={32} />
              </div>
              <h4 style={{ margin: '0 0 8px', fontSize: '17px', fontWeight: 700, color: '#111827' }}>
                Application Under Review
              </h4>
              <p style={{ margin: '0 0 20px', fontSize: '14px', color: '#4B5563', lineHeight: 1.6 }}>
                We received your request to become an organizer on Tickza. Our administration team reviews organizer profiles to guarantee high-quality experiences for attendees. You will be notified as soon as you are approved!
              </p>

              <div
                style={{
                  background: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  padding: '14px',
                  textAlign: 'left',
                  fontSize: '13px',
                  color: '#374151',
                  marginBottom: '24px',
                }}
              >
                <div><strong>Organization:</strong> {user?.organizationName || formData.organizationName || 'Registered'}</div>
                <div style={{ marginTop: '6px' }}><strong>Status:</strong> <span style={{ color: '#D97706', fontWeight: 600 }}>Awaiting Admin Approval</span></div>
              </div>

              <button
                type="button"
                onClick={onClose}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#111827',
                  color: '#FFFFFF',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div
                  style={{
                    backgroundColor: '#FEE2E2',
                    border: '1px solid #FCA5A5',
                    color: '#991B1B',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    marginBottom: '18px',
                  }}
                >
                  {error}
                </div>
              )}

              <div style={{ marginBottom: '16px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '6px',
                  }}
                >
                  Organization or Brand Name <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Building2
                    size={16}
                    color="#9CA3AF"
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Entertainment, Pulse Events"
                    value={formData.organizationName}
                    onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 36px',
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      fontSize: '14px',
                      color: '#111827',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '6px',
                  }}
                >
                  What type of events will you host? <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <FileText
                    size={16}
                    color="#9CA3AF"
                    style={{ position: 'absolute', left: '12px', top: '12px' }}
                  />
                  <textarea
                    rows={3}
                    required
                    placeholder="Briefly describe your events (e.g. music concerts, tech conferences, networking mixers)..."
                    value={formData.organizerBio}
                    onChange={(e) => setFormData({ ...formData, organizerBio: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 36px',
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      fontSize: '14px',
                      color: '#111827',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box',
                      outline: 'none',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '22px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '6px',
                  }}
                >
                  Contact Phone Number
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone
                    size={16}
                    color="#9CA3AF"
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    type="tel"
                    placeholder="e.g. +234 801 234 5678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 36px',
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      fontSize: '14px',
                      color: '#111827',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    flex: 1,
                    padding: '11px',
                    border: '1px solid #D1D5DB',
                    backgroundColor: '#FFFFFF',
                    color: '#374151',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    flex: 2,
                    padding: '11px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #FF5A5F, #FF8A3D)',
                    color: '#FFFFFF',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting ? 0.7 : 1,
                    boxShadow: '0 4px 14px rgba(255, 90, 95, 0.3)',
                  }}
                >
                  {isSubmitting ? 'Submitting Request...' : 'Send Request to Admin'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
