import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar, Check, X, Search, PauseCircle, PlayCircle,
  Trash2, AlertTriangle, Eye, RefreshCw, Filter
} from 'lucide-react';
import api from '../../lib/axios.js';

const STATUS_BADGE = {
  PUBLISHED:        { bg: '#F0FDF4', color: '#16A34A', border: '#DCFCE7', label: 'Published' },
  PENDING_APPROVAL: { bg: '#FFFBEB', color: '#D97706', border: '#FEF3C7', label: 'Pending Approval' },
  SUSPENDED:        { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA', label: 'Suspended (Hidden)' },
  DELETED:          { bg: '#F1F5F9', color: '#64748B', border: '#E2E8F0', label: 'Deleted (Hidden)' },
  REJECTED:         { bg: '#FEF2F2', color: '#B91C1C', border: '#FECACA', label: 'Rejected' },
  DRAFT:            { bg: '#F3F4F6', color: '#6B7280', border: '#E5E7EB', label: 'Draft' },
  ENDED:            { bg: '#F3F4F6', color: '#6B7280', border: '#E5E7EB', label: 'Ended' },
};

const TABS = [
  { id: 'ALL', label: 'All' },
  { id: 'PUBLISHED', label: 'Published' },
  { id: 'PENDING_APPROVAL', label: 'Pending' },
  { id: 'SUSPENDED', label: 'Suspended' },
  { id: 'REJECTED', label: 'Rejected' },
  { id: 'DELETED', label: 'Deleted' },
];

export default function AdminEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [actionMsg, setActionMsg] = useState('');
  const [actionType, setActionType] = useState('success');
  const [actionLoading, setActionLoading] = useState(false);

  // Modal State for Confirmations (Suspend / Delete / Reject)
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: null, // 'SUSPEND' | 'DELETE' | 'REJECT'
    event: null,
    reason: '',
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/events?limit=200');
      const list = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.events)
        ? data.events
        : Array.isArray(data)
        ? data
        : [];
      setEvents(list);
    } catch (err) {
      console.error('[Admin fetchEvents Error]', err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg, type = 'success') => {
    setActionMsg(msg);
    setActionType(type);
    setTimeout(() => setActionMsg(''), 4000);
  };

  // Direct Quick Actions (Approve / Unsuspend)
  const handleQuickAction = async (eventId, action) => {
    setActionLoading(true);
    try {
      if (action === 'approve' || action === 'unsuspend') {
        if (action === 'approve') {
          await api.patch(`/admin/events/${eventId}/approve`);
          showNotification('Event approved and published live.');
        } else {
          await api.patch(`/admin/events/${eventId}/unsuspend`);
          showNotification('Event unsuspended! It is now published and visible to the public.');
        }
      }
      await fetchEvents();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Action failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Open Confirmation Modal
  const openConfirmModal = (type, event) => {
    let defaultReason = '';
    if (type === 'SUSPEND') defaultReason = 'Event suspended by platform administrator.';
    if (type === 'DELETE') defaultReason = 'Event removed by platform administrator.';
    if (type === 'REJECT') defaultReason = 'Event did not meet platform community guidelines.';

    setModalState({
      isOpen: true,
      type,
      event,
      reason: defaultReason,
    });
  };

  const closeConfirmModal = () => {
    setModalState({
      isOpen: false,
      type: null,
      event: null,
      reason: '',
    });
  };

  // Execute Modal Action
  const handleModalSubmit = async (e) => {
    e?.preventDefault();
    const { type, event, reason } = modalState;
    if (!event) return;

    setActionLoading(true);
    try {
      if (type === 'SUSPEND') {
        await api.patch(`/admin/events/${event._id}/suspend`, { reason });
        showNotification(`"${event.title}" has been SUSPENDED and will no longer display publicly.`, 'success');
      } else if (type === 'DELETE') {
        await api.delete(`/admin/events/${event._id}`, { data: { reason, hardDelete: false } });
        showNotification(`"${event.title}" has been DELETED and removed from public display.`, 'success');
      } else if (type === 'REJECT') {
        await api.patch(`/admin/events/${event._id}/reject`, { reason });
        showNotification(`"${event.title}" has been rejected.`, 'success');
      }
      closeConfirmModal();
      await fetchEvents();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Operation failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (e) {
      return '—';
    }
  };

  // Filtered Events
  const filteredEvents = useMemo(() => {
    let result = Array.isArray(events) ? [...events] : [];

    // Tab filter
    if (activeTab !== 'ALL') {
      result = result.filter((e) => e.status === activeTab);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((e) => {
        const title = (e.title || '').toLowerCase();
        const venue = (e.venue || '').toLowerCase();
        const category = (e.category || '').toLowerCase();
        const orgName = `${e.organizerId?.firstName || ''} ${e.organizerId?.lastName || ''}`.toLowerCase();
        const orgEmail = (e.organizerId?.email || '').toLowerCase();
        return title.includes(q) || venue.includes(q) || category.includes(q) || orgName.includes(q) || orgEmail.includes(q);
      });
    }

    return result;
  }, [events, activeTab, searchQuery]);

  // Tab counts
  const tabCounts = useMemo(() => {
    const counts = { ALL: events.length };
    events.forEach((e) => {
      counts[e.status] = (counts[e.status] || 0) + 1;
    });
    return counts;
  }, [events]);

  return (
    <div style={{ padding: '8px 0 32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <Calendar size={24} color="#1F1F1F" />
            <h2 style={{ color: '#1F1F1F', fontSize: '22px', fontWeight: 800, margin: 0 }}>
              Event Management
            </h2>
          </div>
          <p style={{ color: '#6B6B6B', fontSize: '13.5px', margin: 0 }}>
            Approve, suspend, or delete events. Suspended and deleted events are immediately hidden from public display.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchEvents}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            color: '#1E293B',
            cursor: loading ? 'wait' : 'pointer',
          }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Action Notification Alert */}
      {actionMsg && (
        <div
          style={{
            backgroundColor: actionType === 'success' ? '#F0FDF4' : '#FEF2F2',
            border: `1px solid ${actionType === 'success' ? '#BBF7D0' : '#FECACA'}`,
            borderLeft: `4px solid ${actionType === 'success' ? '#16A34A' : '#DC2626'}`,
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: actionType === 'success' ? '#15803D' : '#DC2626',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          <span>{actionMsg}</span>
          <button
            onClick={() => setActionMsg('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {TABS.map((tab) => {
            const count = tabCounts[tab.id] || 0;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '20px',
                  border: isActive ? '1px solid #1E293B' : '1px solid #E2E8F0',
                  backgroundColor: isActive ? '#1E293B' : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : '#64748B',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{tab.label}</span>
                <span
                  style={{
                    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : '#F1F5F9',
                    color: isActive ? '#FFFFFF' : '#475569',
                    fontSize: '11px',
                    padding: '1px 6px',
                    borderRadius: '10px',
                    fontWeight: 700,
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '420px' }}>
          <Search
            size={16}
            color="#94A3B8"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, organizer, or venue…"
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#94A3B8',
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '10px',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#6B7280', fontSize: '14px' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 10px', color: '#10B981' }} />
            Loading events…
          </div>
        ) : filteredEvents.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <Calendar size={36} color="#CBD5E1" style={{ marginBottom: '10px' }} />
            <p style={{ color: '#64748B', fontSize: '14px', margin: 0, fontWeight: 600 }}>
              No events found {activeTab !== 'ALL' ? `with status "${activeTab}"` : ''}
            </p>
            {searchQuery && (
              <p style={{ color: '#94A3B8', fontSize: '12px', margin: '4px 0 0' }}>
                Try clearing your search query.
              </p>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  {['Event', 'Category', 'Date', 'Organizer', 'Status', 'Admin Actions'].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '12px 16px',
                        color: '#64748B',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((event) => {
                  const badge = STATUS_BADGE[event.status] || {
                    bg: '#F3F4F6',
                    color: '#6B7280',
                    border: '#E5E7EB',
                    label: event.status,
                  };
                  const isSuspended = event.status === 'SUSPENDED';
                  const isDeleted = event.status === 'DELETED';
                  const isPublished = event.status === 'PUBLISHED';
                  const isPending = event.status === 'PENDING_APPROVAL';

                  return (
                    <tr
                      key={event._id}
                      style={{
                        borderBottom: '1px solid #F1F5F9',
                        transition: 'background 0.15s ease',
                        backgroundColor: isSuspended ? '#FFFBFB' : isDeleted ? '#F8FAFC' : 'transparent',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#F8FAFC')}
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = isSuspended ? '#FFFBFB' : isDeleted ? '#F8FAFC' : '')
                      }
                    >
                      {/* Event Title & Cover */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {event.coverImage?.url ? (
                            <img
                              src={event.coverImage.url}
                              alt=""
                              style={{
                                width: '48px',
                                height: '36px',
                                borderRadius: '6px',
                                objectFit: 'cover',
                                flexShrink: 0,
                                opacity: isSuspended || isDeleted ? 0.6 : 1,
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: '48px',
                                height: '36px',
                                borderRadius: '6px',
                                backgroundColor: '#E2E8F0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#94A3B8',
                                fontSize: '10px',
                                fontWeight: 700,
                                flexShrink: 0,
                              }}
                            >
                              EVENT
                            </div>
                          )}
                          <div style={{ minWidth: 0 }}>
                            <span
                              style={{
                                color: isSuspended || isDeleted ? '#64748B' : '#0F172A',
                                fontWeight: 700,
                                fontSize: '13.5px',
                                maxWidth: '240px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                display: 'block',
                                textDecoration: isDeleted ? 'line-through' : 'none',
                              }}
                            >
                              {event.title}
                            </span>
                            <span
                              style={{
                                color: '#94A3B8',
                                fontSize: '11.5px',
                                display: 'block',
                                maxWidth: '240px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {event.venue || event.address || 'Online Event'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td style={{ padding: '14px 16px', color: '#64748B', fontSize: '12.5px', whiteSpace: 'nowrap' }}>
                        {event.category || '—'}
                      </td>

                      {/* Date */}
                      <td style={{ padding: '14px 16px', color: '#64748B', fontSize: '12.5px', whiteSpace: 'nowrap' }}>
                        {formatDate(event.startDate)}
                      </td>

                      {/* Organizer */}
                      <td style={{ padding: '14px 16px', color: '#475569', fontSize: '12.5px' }}>
                        <span style={{ fontWeight: 600, display: 'block' }}>
                          {event.organizerId?.firstName} {event.organizerId?.lastName}
                        </span>
                        <span style={{ color: '#94A3B8', fontSize: '11px', display: 'block' }}>
                          {event.organizerId?.email || ''}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: badge.bg,
                            color: badge.color,
                            border: `1px solid ${badge.border || 'transparent'}`,
                            padding: '3px 10px',
                            borderRadius: '20px',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {isSuspended && <AlertTriangle size={12} />}
                          {badge.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          {/* Pending Approval: Approve & Reject */}
                          {isPending && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleQuickAction(event._id, 'approve')}
                                disabled={actionLoading}
                                title="Approve and publish live"
                                style={{
                                  padding: '5px 10px',
                                  backgroundColor: '#10B981',
                                  border: 'none',
                                  borderRadius: '6px',
                                  color: '#FFFFFF',
                                  fontSize: '11.5px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <Check size={12} /> Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => openConfirmModal('REJECT', event)}
                                disabled={actionLoading}
                                title="Reject event"
                                style={{
                                  padding: '5px 10px',
                                  backgroundColor: '#FFFFFF',
                                  border: '1px solid #EF4444',
                                  borderRadius: '6px',
                                  color: '#EF4444',
                                  fontSize: '11.5px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <X size={12} /> Reject
                              </button>
                            </>
                          )}

                          {/* Published: Suspend & Delete */}
                          {isPublished && (
                            <button
                              type="button"
                              onClick={() => openConfirmModal('SUSPEND', event)}
                              disabled={actionLoading}
                              title="Suspend this event (hides from public)"
                              style={{
                                padding: '5px 10px',
                                backgroundColor: '#FFFBEB',
                                border: '1px solid #FCD34D',
                                borderRadius: '6px',
                                color: '#B45309',
                                fontSize: '11.5px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <PauseCircle size={13} /> Suspend
                            </button>
                          )}

                          {/* Suspended: Unsuspend / Reactivate & Delete */}
                          {isSuspended && (
                            <button
                              type="button"
                              onClick={() => handleQuickAction(event._id, 'unsuspend')}
                              disabled={actionLoading}
                              title="Unsuspend event and republish live"
                              style={{
                                padding: '5px 10px',
                                backgroundColor: '#10B981',
                                border: 'none',
                                borderRadius: '6px',
                                color: '#FFFFFF',
                                fontSize: '11.5px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <PlayCircle size={13} /> Unsuspend
                            </button>
                          )}

                          {/* Rejected or Draft: Quick Publish option */}
                          {(event.status === 'REJECTED' || event.status === 'DRAFT') && (
                            <button
                              type="button"
                              onClick={() => handleQuickAction(event._id, 'approve')}
                              disabled={actionLoading}
                              title="Publish live"
                              style={{
                                padding: '5px 10px',
                                backgroundColor: '#10B981',
                                border: 'none',
                                borderRadius: '6px',
                                color: '#FFFFFF',
                                fontSize: '11.5px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <PlayCircle size={13} /> Publish
                            </button>
                          )}

                          {/* Delete Action (Available for non-deleted events) */}
                          {!isDeleted && (
                            <button
                              type="button"
                              onClick={() => openConfirmModal('DELETE', event)}
                              disabled={actionLoading}
                              title="Delete event permanently from public listings"
                              style={{
                                padding: '5px 9px',
                                backgroundColor: '#FFFFFF',
                                border: '1px solid #E2E8F0',
                                borderRadius: '6px',
                                color: '#EF4444',
                                fontSize: '11.5px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <Trash2 size={13} /> Delete
                            </button>
                          )}

                          {/* If Deleted: Restore option */}
                          {isDeleted && (
                            <button
                              type="button"
                              onClick={() => handleQuickAction(event._id, 'approve')}
                              disabled={actionLoading}
                              title="Restore and re-publish this event"
                              style={{
                                padding: '5px 10px',
                                backgroundColor: '#F8FAFC',
                                border: '1px solid #CBD5E1',
                                borderRadius: '6px',
                                color: '#475569',
                                fontSize: '11.5px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <PlayCircle size={13} /> Restore Live
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation & Reason Modal */}
      {modalState.isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
            backdropFilter: 'blur(3px)',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              maxWidth: '480px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor:
                    modalState.type === 'DELETE'
                      ? '#FEE2E2'
                      : modalState.type === 'SUSPEND'
                      ? '#FEF3C7'
                      : '#FEE2E2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color:
                    modalState.type === 'DELETE'
                      ? '#DC2626'
                      : modalState.type === 'SUSPEND'
                      ? '#D97706'
                      : '#DC2626',
                  flexShrink: 0,
                }}
              >
                {modalState.type === 'DELETE' ? (
                  <Trash2 size={20} />
                ) : modalState.type === 'SUSPEND' ? (
                  <PauseCircle size={22} />
                ) : (
                  <AlertTriangle size={20} />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 4px', fontSize: '17px', fontWeight: 800, color: '#0F172A' }}>
                  {modalState.type === 'SUSPEND'
                    ? 'Suspend Event'
                    : modalState.type === 'DELETE'
                    ? 'Delete Event'
                    : 'Reject Event'}
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748B', lineHeight: 1.45 }}>
                  {modalState.type === 'SUSPEND' && (
                    <>
                      Are you sure you want to suspend <strong>"{modalState.event?.title}"</strong>? Once suspended, it
                      will immediately stop displaying publicly across Tickza.
                    </>
                  )}
                  {modalState.type === 'DELETE' && (
                    <>
                      Are you sure you want to delete <strong>"{modalState.event?.title}"</strong>? It will be removed
                      from all public listings, search results, and public URLs.
                    </>
                  )}
                  {modalState.type === 'REJECT' && (
                    <>
                      Rejecting <strong>"{modalState.event?.title}"</strong> will notify the organizer to make updates
                      and resubmit.
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Reason input */}
            <form onSubmit={handleModalSubmit}>
              <label
                style={{
                  display: 'block',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  color: '#334155',
                  marginBottom: '6px',
                }}
              >
                Reason / Note to Organizer:
              </label>
              <textarea
                value={modalState.reason}
                onChange={(e) => setModalState({ ...modalState, reason: e.target.value })}
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13px',
                  color: '#1E293B',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
                placeholder="Enter reason for this action…"
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={closeConfirmModal}
                  disabled={actionLoading}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#475569',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  style={{
                    padding: '9px 18px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor:
                      modalState.type === 'DELETE'
                        ? '#DC2626'
                        : modalState.type === 'SUSPEND'
                        ? '#D97706'
                        : '#DC2626',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: actionLoading ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {actionLoading ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : modalState.type === 'DELETE' ? (
                    'Confirm Delete'
                  ) : modalState.type === 'SUSPEND' ? (
                    'Confirm Suspend'
                  ) : (
                    'Confirm Reject'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
