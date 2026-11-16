import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Check, AlertTriangle, Trash2, X, Users, Sparkles, Building2 } from 'lucide-react';
import api from '../../lib/axios.js';

const STATUS_BADGE = {
  PENDING:   { bg: '#FFF7ED', color: '#D97706', label: 'Pending' },
  APPROVED:  { bg: '#F0FDF4', color: '#16A34A', label: 'Approved' },
  SUSPENDED: { bg: '#FEF2F2', color: '#DC2626', label: 'Suspended' },
  DELETED:   { bg: '#F3F4F6', color: '#6B7280', label: 'Deleted' },
};

function SuspendModal({ user, onClose, onConfirm }) {
  const [reason, setReason] = useState('');
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }} onClick={onClose}>
      <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '28px', width: '100%', maxWidth: '440px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h3 style={{ color: '#1F1F1F', fontSize: '18px', fontWeight: 700, margin: 0 }}>Suspend User</h3>
          <button onClick={onClose} style={{ background: '#F5F5F5', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} color="#6B6B6B" />
          </button>
        </div>
        <p style={{ color: '#6B6B6B', fontSize: '13px', margin: '0 0 16px' }}>
          Suspending: <strong style={{ color: '#1F1F1F' }}>{user.firstName} {user.lastName}</strong> ({user.email})
        </p>
        <label style={{ display: 'block', color: '#1F1F1F', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Reason for suspension</label>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Enter a reason..."
          rows={3}
          style={{ width: '100%', padding: '12px', background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: '6px', color: '#1F1F1F', fontSize: '14px', outline: 'none', boxSizing: 'border-box', marginBottom: '16px', resize: 'vertical' }}
          onFocus={e => e.target.style.borderColor = '#DC2626'}
          onBlur={e => e.target.style.borderColor = '#E5E5E5'}
        />
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px', background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: '6px', color: '#1F1F1F', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={() => onConfirm(reason)} style={{ flex: 1, padding: '11px', background: '#DC2626', border: 'none', borderRadius: '6px', color: '#FFFFFF', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
            Suspend User
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const [searchParams] = useSearchParams();
  const initialFilter = searchParams.get('organizerStatus') === 'REQUESTED' ? 'ORGANIZER_REQUESTS' : 'All';

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialFilter);
  const [suspendTarget, setSuspendTarget] = useState(null);
  const [actionMsg, setActionMsg] = useState('');
  const [actionType, setActionType] = useState('success');

  const STATUS_FILTERS = [
    { id: 'All', label: 'All Users' },
    { id: 'ORGANIZER_REQUESTS', label: 'Organizer Requests', highlight: true },
    { id: 'APPROVED', label: 'Approved' },
    { id: 'PENDING', label: 'Pending' },
    { id: 'SUSPENDED', label: 'Suspended' },
  ];

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/users');
      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data?.users) ? data.users : Array.isArray(data) ? data : [];
      setUsers(list);
    } catch (err) { console.error(err); setUsers([]); }
    finally { setLoading(false); }
  };

  const showMsg = (msg, type = 'success') => { setActionMsg(msg); setActionType(type); setTimeout(() => setActionMsg(''), 3000); };

  const handleApprove = async (userId, asOrganizer = false) => {
    try {
      await api.patch(`/admin/users/${userId}/approve`);
      showMsg(asOrganizer ? 'Organizer approved successfully!' : 'User approved successfully.');
      fetchUsers();
    } catch (err) { showMsg(err.response?.data?.message || 'Failed', 'error'); }
  };

  const handleRejectOrganizer = async (userId, name) => {
    const reason = window.prompt(`Reason for declining organizer request for ${name}:`, 'Application details could not be verified.');
    if (reason === null) return;
    try {
      await api.patch(`/admin/users/${userId}/reject-organizer`, { reason });
      showMsg('Organizer request declined.');
      fetchUsers();
    } catch (err) { showMsg(err.response?.data?.message || 'Failed to decline request', 'error'); }
  };

  const handleSuspend = async (userId, reason) => {
    try {
      await api.patch(`/admin/users/${userId}/suspend`, { reason });
      showMsg('User suspended.');
      setSuspendTarget(null);
      fetchUsers();
    } catch (err) { showMsg(err.response?.data?.message || 'Failed', 'error'); }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Delete this user? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      showMsg('User deleted.');
      fetchUsers();
    } catch (err) { showMsg(err.response?.data?.message || 'Failed', 'error'); }
  };

  const pendingRequestsCount = users.filter(u => u.organizerStatus === 'REQUESTED').length;

  const filtered = (Array.isArray(users) ? users : []).filter(u => {
    const matchSearch = !search || `${u.firstName} ${u.lastName} ${u.email} ${u.phone} ${u.organizationName || ''}`.toLowerCase().includes(search.toLowerCase());
    let matchStatus = true;
    if (statusFilter === 'ORGANIZER_REQUESTS') {
      matchStatus = u.organizerStatus === 'REQUESTED';
    } else if (statusFilter !== 'All') {
      matchStatus = u.status === statusFilter;
    }
    return matchSearch && matchStatus;
  });

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  const btnStyle = (variant) => ({
    padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap',
    ...(variant === 'approve' ? { background: '#059669', color: '#FFFFFF', border: 'none' }
      : variant === 'reject' ? { background: '#FFFFFF', color: '#DC2626', border: '1px solid #DC2626' }
      : variant === 'suspend' ? { background: '#FFFFFF', color: '#D97706', border: '1px solid #D97706' }
      : { background: '#FFFFFF', color: '#DC2626', border: '1px solid #DC2626' }),
  });

  return (
    <div style={{ padding: '24px', maxWidth: '100%', boxSizing: 'border-box' }}>
      {/* Page header */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <Users size={22} color="#1F1F1F" />
          <h2 style={{ color: '#1F1F1F', fontSize: '22px', fontWeight: 800, margin: 0 }}>Users & Organizer Approvals</h2>
        </div>
        <p style={{ color: '#6B6B6B', fontSize: '14px', margin: 0 }}>
          {filtered.length} user{filtered.length !== 1 ? 's' : ''} {statusFilter !== 'All' ? `· ${statusFilter.replace('_', ' ')}` : ''}
          {pendingRequestsCount > 0 && statusFilter !== 'ORGANIZER_REQUESTS' && (
            <span style={{ color: '#D97706', fontWeight: 700, marginLeft: '8px' }}>
              ({pendingRequestsCount} pending organizer request{pendingRequestsCount !== 1 ? 's' : ''})
            </span>
          )}
        </p>
      </div>

      {/* Action message */}
      {actionMsg && (
        <div style={{ background: '#FFFFFF', border: `1px solid #E5E5E5`, borderLeft: `4px solid ${actionType === 'success' ? '#16A34A' : '#DC2626'}`, borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: actionType === 'success' ? '#15803D' : '#DC2626', fontSize: '13px', fontWeight: 600 }}>
          {actionMsg}
          <button onClick={() => setActionMsg('')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={14} color={actionType === 'success' ? '#15803D' : '#DC2626'} /></button>
        </div>
      )}

      {/* Search & Filter */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: '12px', padding: '16px', marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '220px', border: '1px solid #E5E5E5', borderRadius: '8px', padding: '8px 12px', background: '#FAFAFA' }}>
          <Search size={16} color="#6B6B6B" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, organization, phone…" style={{ background: 'transparent', border: 'none', outline: 'none', color: '#1F1F1F', fontSize: '14px', flex: 1 }} />
        </div>
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', maxWidth: '100%', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', paddingBottom: '2px' }}>
          {STATUS_FILTERS.map(f => {
            const isSelected = statusFilter === f.id;
            const isHighlighted = f.highlight && pendingRequestsCount > 0;
            return (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '20px',
                  border: isSelected ? '1px solid #026CDF' : isHighlighted ? '1px solid #F59E0B' : '1px solid #E5E5E5',
                  background: isSelected ? '#026CDF' : isHighlighted ? '#FFFBEB' : '#FFFFFF',
                  color: isSelected ? '#FFFFFF' : isHighlighted ? '#B45309' : '#6B6B6B',
                  fontSize: '12px',
                  fontWeight: isSelected || isHighlighted ? 700 : 400,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                {f.highlight && <Sparkles size={12} />}
                <span>{f.label}</span>
                {f.id === 'ORGANIZER_REQUESTS' && pendingRequestsCount > 0 && (
                  <span style={{ background: isSelected ? '#FFFFFF' : '#F59E0B', color: isSelected ? '#026CDF' : '#FFFFFF', fontSize: '10px', padding: '1px 6px', borderRadius: '10px', fontWeight: 800 }}>
                    {pendingRequestsCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: '12px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#6B6B6B', fontSize: '14px' }}>Loading users…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <Users size={32} color="#D1D5DB" style={{ marginBottom: '10px' }} />
            <p style={{ color: '#6B6B6B', fontSize: '14px', margin: 0 }}>No users found matching this filter</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '760px' }}>
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E5E5' }}>
                  {['User & Organization', 'Email', 'Role / Privileges', 'Status', 'Organizer Status', 'Joined', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#6B6B6B', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(user => {
                  const badge = STATUS_BADGE[user.status] || { bg: '#F3F4F6', color: '#6B7280', label: user.status };
                  const isOrganizerRequested = user.organizerStatus === 'REQUESTED';
                  const applicantName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';

                  return (
                    <tr
                      key={user._id}
                      style={{
                        borderBottom: '1px solid #F3F4F6',
                        backgroundColor: isOrganizerRequested ? '#FFFDF7' : 'transparent',
                        transition: 'background 0.1s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = isOrganizerRequested ? '#FFFBEB' : '#F9FAFB'}
                      onMouseLeave={e => e.currentTarget.style.background = isOrganizerRequested ? '#FFFDF7' : ''}
                    >
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: isOrganizerRequested ? '#FEF3C7' : '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {user.avatar?.url
                              ? <img src={user.avatar.url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                              : <span style={{ color: isOrganizerRequested ? '#B45309' : '#026CDF', fontWeight: 700, fontSize: '12px' }}>{user.firstName?.[0]}{user.lastName?.[0]}</span>
                            }
                          </div>
                          <div>
                            <div style={{ color: '#1F1F1F', fontWeight: 700, fontSize: '14px', whiteSpace: 'nowrap' }}>
                              {applicantName}
                            </div>
                            {user.organizationName ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#4B5563', marginTop: '2px' }}>
                                <Building2 size={12} color="#6B7280" />
                                <span>{user.organizationName}</span>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#4B5563', fontSize: '13px' }}>
                        <div>{user.email}</div>
                        {user.phone && <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{user.phone}</div>}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#1F1F1F', fontSize: '13px', fontWeight: 600 }}>
                        {user.role || 'USER'}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ display: 'inline-block', background: badge.bg, color: badge.color, padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap' }}>
                          {badge.label}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {isOrganizerRequested ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#FEF3C7', color: '#B45309', border: '1px solid #FDE68A', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                            <Sparkles size={11} /> REQUESTED
                          </span>
                        ) : user.organizerStatus === 'APPROVED' ? (
                          <span style={{ display: 'inline-block', background: '#ECFDF5', color: '#059669', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                            APPROVED
                          </span>
                        ) : (
                          <span style={{ color: '#9CA3AF', fontSize: '12px' }}>Standard</span>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#6B6B6B', fontSize: '13px', whiteSpace: 'nowrap' }}>
                        {formatDate(user.createdAt)}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'nowrap' }}>
                          {isOrganizerRequested ? (
                            <>
                              <button onClick={() => handleApprove(user._id, true)} style={btnStyle('approve')}>
                                <Check size={12} /> Approve Organizer
                              </button>
                              <button onClick={() => handleRejectOrganizer(user._id, applicantName)} style={btnStyle('reject')}>
                                <X size={12} /> Decline
                              </button>
                            </>
                          ) : (
                            <>
                              {user.status === 'SUSPENDED' && (
                                <button onClick={() => handleApprove(user._id)} style={btnStyle('approve')}>
                                  <Check size={12} /> Reinstate
                                </button>
                              )}
                              {user.status === 'APPROVED' && (
                                <button onClick={() => setSuspendTarget(user)} style={btnStyle('suspend')}>
                                  <AlertTriangle size={12} /> Suspend
                                </button>
                              )}
                            </>
                          )}
                          <button onClick={() => handleDelete(user._id)} style={btnStyle('delete')}>
                            <Trash2 size={12} />
                          </button>
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

      {suspendTarget && (
        <SuspendModal
          user={suspendTarget}
          onClose={() => setSuspendTarget(null)}
          onConfirm={(reason) => handleSuspend(suspendTarget._id, reason)}
        />
      )}
    </div>
  );
}
