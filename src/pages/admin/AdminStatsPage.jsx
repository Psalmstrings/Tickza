import React, { useState, useEffect } from 'react';
import {
  Users,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
  Calendar,
  Ticket,
  ShoppingBag,
  Sparkles,
  Building2,
  FileText,
  Phone,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import TickzaSpinner from '../../components/ui/TickzaSpinner.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import api from '../../lib/axios.js';

export default function AdminStatsPage() {
  const [stats, setStats] = useState(null);
  const [organizerRequests, setOrganizerRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const toast = useToast();

  const loadData = async () => {
    try {
      const [statsRes, requestsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/organizer-requests').catch(() => ({ data: { data: [] } })),
      ]);
      setStats(statsRes.data?.data || null);
      setOrganizerRequests(requestsRes.data?.data || []);
    } catch (err) {
      console.error('[AdminStatsPage Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApproveOrganizer = async (userId, name) => {
    setProcessingId(userId);
    try {
      await api.patch(`/admin/users/${userId}/approve`);
      toast.success(`Approved ${name} as an event organizer!`);
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve organizer');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectOrganizer = async (userId, name) => {
    const reason = window.prompt(`Reason for declining ${name}'s organizer request:`, 'Application details could not be verified.');
    if (reason === null) return;

    setProcessingId(userId);
    try {
      await api.patch(`/admin/users/${userId}/reject-organizer`, { reason });
      toast.info(`Declined organizer request for ${name}`);
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to decline request');
    } finally {
      setProcessingId(null);
    }
  };

  const cards = stats
    ? [
        { label: 'Total Users', value: stats.totalUsers, icon: <Users size={22} />, color: 'var(--color-primary, #FF5A5F)', bg: 'var(--color-surface-soft, #FFF4EE)' },
        { label: 'Organizer Requests', value: stats.pendingOrganizerRequests ?? organizerRequests.length, icon: <Sparkles size={22} />, color: '#D97706', bg: '#FFFBEB', highlight: true },
        { label: 'Approved Users', value: stats.approvedUsers, icon: <CheckCircle size={22} />, color: '#059669', bg: '#ECFDF5' },
        { label: 'Suspended Accounts', value: stats.suspendedUsers, icon: <XCircle size={22} />, color: '#DC2626', bg: '#FEF2F2' },
        { label: 'Total Events', value: stats.totalEvents, icon: <Calendar size={22} />, color: '#7C3AED', bg: '#F5F3FF' },
        { label: 'Published Events', value: stats.publishedEvents, icon: <BarChart3 size={22} />, color: 'var(--color-secondary, #FF8A3D)', bg: '#FFF0E6' },
        { label: 'Total Tickets Issued', value: stats.totalTickets, icon: <Ticket size={22} />, color: '#EA580C', bg: '#FFF7ED' },
        { label: 'Total Orders Placed', value: stats.totalOrders, icon: <ShoppingBag size={22} />, color: '#059669', bg: '#ECFDF5' },
      ]
    : [];

  return (
    <div style={{ width: '100%', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: '22px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1F1F1F', margin: '0 0 4px 0' }}>
          Platform Analytics & Command Center
        </h2>
        <p style={{ fontSize: '13.5px', color: '#6B6B6B', margin: 0 }}>
          High-level operational overview across user status, organizer approvals, active catalog, tickets, and fulfillment.
        </p>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center' }}>
          <TickzaSpinner size="md" message="Loading analytics and pending requests..." />
        </div>
      ) : (
        <>
          {/* Key Metrics Grid */}
          <div className="admin-stats-grid" style={{ marginBottom: '28px' }}>
            {cards.map((card) => (
              <div
                key={card.label}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '14px',
                  padding: '16px 18px',
                  border: card.highlight && card.value > 0 ? '2px solid #F59E0B' : '1px solid #E5E7EB',
                  boxShadow: card.highlight && card.value > 0 ? '0 4px 12px rgba(245, 158, 11, 0.15)' : '0 1px 4px rgba(0,0,0,0.03)',
                  minWidth: 0,
                  transition: 'all 0.2s ease',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: card.bg,
                    color: card.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '12px',
                  }}
                >
                  {card.icon}
                </div>
                <p style={{ fontSize: 'clamp(22px, 5vw, 28px)', fontWeight: 900, color: '#1F1F1F', margin: '0 0 2px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {card.value ?? 0}
                </p>
                <p style={{ fontSize: '12.5px', fontWeight: 600, color: card.highlight && card.value > 0 ? '#B45309' : '#6B7280', margin: 0 }}>
                  {card.label}
                </p>
              </div>
            ))}
          </div>

          {/* Organizer Requests Review Section */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              overflow: 'hidden',
              marginBottom: '28px',
            }}
          >
            <div
              style={{
                padding: '18px 22px',
                borderBottom: '1px solid #F3F4F6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                background: organizerRequests.length > 0 ? 'linear-gradient(135deg, #FFFBEB 0%, #FFFFFF 100%)' : '#FFFFFF',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: organizerRequests.length > 0 ? '#FEF3C7' : '#F3F4F6',
                    color: organizerRequests.length > 0 ? '#D97706' : '#6B7280',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#111827' }}>
                    Organizer Applications Awaiting Review
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#6B7280' }}>
                    {organizerRequests.length} applicant{organizerRequests.length !== 1 ? 's' : ''} requested organizer privileges
                  </p>
                </div>
              </div>

              <Link
                to="/admin/users?organizerStatus=REQUESTED"
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#2563EB',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>View in Users Tab</span>
                <ExternalLink size={14} />
              </Link>
            </div>

            {organizerRequests.length === 0 ? (
              <div style={{ padding: '36px 20px', textAlign: 'center' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: '#ECFDF5',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px',
                  }}
                >
                  <CheckCircle size={26} />
                </div>
                <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 700, color: '#111827' }}>
                  All Caught Up!
                </h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>
                  There are no pending organizer requests requiring admin review at this time.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', divideY: '1px solid #F3F4F6' }}>
                {organizerRequests.map((req) => {
                  const applicantName = `${req.firstName || ''} ${req.lastName || ''}`.trim() || 'Applicant';
                  const isProcessing = processingId === req._id;

                  return (
                    <div
                      key={req._id}
                      style={{
                        padding: '18px 22px',
                        borderBottom: '1px solid #F3F4F6',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '16px',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F9FAFB')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <div style={{ flex: 1, minWidth: '260px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <span style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>
                            {applicantName}
                          </span>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              backgroundColor: '#FEF3C7',
                              color: '#B45309',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              border: '1px solid #FDE68A',
                            }}
                          >
                            REQUESTED
                          </span>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '13px', color: '#4B5563', marginBottom: '8px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Building2 size={14} color="#6B7280" />
                            <strong>Organization:</strong> {req.organizationName || 'N/A'}
                          </span>
                          <span>•</span>
                          <span><strong>Email:</strong> {req.email}</span>
                          {req.phone && (
                            <>
                              <span>•</span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Phone size={14} color="#6B7280" />
                                {req.phone}
                              </span>
                            </>
                          )}
                        </div>

                        {req.organizerBio && (
                          <div
                            style={{
                              backgroundColor: '#F9FAFB',
                              border: '1px solid #E5E7EB',
                              borderRadius: '8px',
                              padding: '8px 12px',
                              fontSize: '13px',
                              color: '#374151',
                              maxWidth: '680px',
                              lineHeight: 1.5,
                            }}
                          >
                            <span style={{ fontWeight: 600, color: '#111827' }}>Event Plan: </span>
                            {req.organizerBio}
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleRejectOrganizer(req._id, applicantName)}
                          style={{
                            padding: '8px 14px',
                            borderRadius: '8px',
                            border: '1px solid #DC2626',
                            backgroundColor: '#FFFFFF',
                            color: '#DC2626',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: isProcessing ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            opacity: isProcessing ? 0.6 : 1,
                          }}
                        >
                          <X size={14} />
                          <span>Decline</span>
                        </button>

                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleApproveOrganizer(req._id, applicantName)}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: '#059669',
                            color: '#FFFFFF',
                            fontSize: '13px',
                            fontWeight: 700,
                            cursor: isProcessing ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)',
                            opacity: isProcessing ? 0.6 : 1,
                          }}
                        >
                          <Check size={14} />
                          <span>Approve as Organizer</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
