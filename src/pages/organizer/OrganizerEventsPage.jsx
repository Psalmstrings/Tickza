import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../lib/axios.js';
import { getEventImageUrl, handleImageFallback } from '../../lib/imageHelper.js';
import './organizer.css';
import {
  Calendar, Search, Filter, Plus, ArrowRight,
  MapPin, Ticket, DollarSign, Users, MoreVertical,
  Edit, Eye, BarChart2, QrCode, Tag, Trash2,
  Copy, Check, Globe, AlertTriangle, X
} from 'lucide-react';

const STATUS_TABS = [
  { label: 'All', value: '' },
  { label: 'Published', value: 'PUBLISHED' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Ended', value: 'ENDED' },
  { label: 'Cancelled', value: 'SUSPENDED' },
];

function EventStatusBadge({ status }) {
  const map = {
    PUBLISHED: { cls: 'org-badge-success', label: 'Published' },
    DRAFT:     { cls: 'org-badge-neutral', label: 'Draft' },
    ENDED:     { cls: 'org-badge-info',    label: 'Ended' },
    SUSPENDED: { cls: 'org-badge-error',   label: 'Cancelled / Suspended' },
    PENDING_APPROVAL: { cls: 'org-badge-warning', label: 'Pending' },
  };
  const { cls, label } = map[status] || { cls: 'org-badge-neutral', label: status };
  return <span className={`org-badge ${cls}`}>{label}</span>;
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

function EventDropdown({ ev, onClose, onToggleStatus, onRequestDelete, onCopyLink }) {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [onClose]);

  const items = [
    { label: 'View Public Event', icon: Eye, action: () => navigate(`/events/${ev._id}`) },
    { label: 'Edit Event Details', icon: Edit, action: () => navigate(`/organizer/events/${ev._id}/edit`) },
    { label: 'Manage Ticket Tiers', icon: Ticket, action: () => navigate(`/organizer/tickets?event=${ev._id}`) },
    { label: 'Attendee Manifest', icon: Users, action: () => navigate(`/organizer/attendees?event=${ev._id}`) },
    { label: 'Gate Check-In', icon: QrCode, action: () => navigate(`/organizer/checkin?event=${ev._id}`) },
    { label: 'Sales & Analytics', icon: BarChart2, action: () => navigate(`/organizer/analytics?eventId=${ev._id}`) },
    { label: 'Copy Share Link', icon: Copy, action: () => onCopyLink(ev) },
    {
      label: ev.status === 'PUBLISHED' ? 'Unpublish (Make Draft)' : 'Publish Live',
      icon: Globe,
      action: () => onToggleStatus(ev),
    },
    { label: 'Delete Event', icon: Trash2, danger: true, action: () => onRequestDelete(ev) },
  ];

  return (
    <div
      ref={dropdownRef}
      style={{
        position: 'absolute', top: '100%', right: 0, zIndex: 100,
        background: '#FFF', border: '1px solid #E2E8F0', borderRadius: 10,
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)', minWidth: 200, overflow: 'hidden',
        marginTop: 4,
      }}
    >
      {items.map((item, i) => (
        <button
          key={i}
          onClick={() => { item.action(); onClose(); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 10, width: '100%',
            padding: '9px 14px', border: 'none', background: 'none', cursor: 'pointer',
            fontSize: 12.5, color: item.danger ? '#DC2626' : '#0B1026', textAlign: 'left', fontFamily: 'inherit',
            fontWeight: item.danger ? 600 : 500,
            borderTop: item.danger ? '1px solid #F1F5F9' : 'none',
          }}
          onMouseEnter={e => e.currentTarget.style.background = item.danger ? '#FEF2F2' : '#F8FAFC'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <item.icon size={13} color={item.danger ? '#DC2626' : '#64748B'} /> {item.label}
        </button>
      ))}
    </div>
  );
}

function EventCard({ ev, onToggleStatus, onRequestDelete, onCopyLink }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const imageUrl = getEventImageUrl(ev.coverImage);

  return (
    <div className="org-card" style={{ overflow: 'visible', position: 'relative' }}>
      <div className="org-event-card-inner">
        {/* Image with fallback */}
        <div className="org-event-card-img">
          <img
            src={imageUrl}
            alt={ev.title}
            onError={handleImageFallback}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: '14px 16px', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <EventStatusBadge status={ev.status} />
                <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                  {ev.category}
                </span>
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0B1026', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {ev.title}
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#64748B' }}>
                  <Calendar size={11} /> {formatDate(ev.startDate)}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#64748B' }}>
                  <MapPin size={11} /> {ev.venue}
                </span>
              </div>
            </div>

            {/* Menu Dropdown */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <button
                onClick={() => setMenuOpen(v => !v)}
                style={{
                  width: 44, height: 44, border: '1px solid #E2E8F0', borderRadius: 8,
                  background: '#FFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  touchAction: 'manipulation',
                }}
                aria-label="Event Options"
              >
                <MoreVertical size={16} color="#64748B" />
              </button>
              {menuOpen && (
                <EventDropdown
                  ev={ev}
                  onClose={() => setMenuOpen(false)}
                  onToggleStatus={onToggleStatus}
                  onRequestDelete={onRequestDelete}
                  onCopyLink={onCopyLink}
                />
              )}
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
            {[
              { icon: Ticket, label: `${(ev.ticketsSold || 0).toLocaleString()} sold`, color: '#4F46E5' },
              { icon: DollarSign, label: `₦${(ev.revenue || 0).toLocaleString()}`, color: '#10B981' },
              { icon: Users, label: `${(ev.checkedIn || 0)} checked in`, color: '#F59E0B' },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <s.icon size={11} style={{ color: s.color }} />
                <span style={{ fontSize: 12, color: '#475569' }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrganizerEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  // Deletion modal state
  const [eventToDelete, setEventToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [copyToast, setCopyToast] = useState('');

  const fetchEvents = useCallback(async (s = statusFilter, p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: 20 });
      if (s) params.append('status', s);
      const { data } = await api.get(`/organizer/events?${params}`);
      setEvents(data.data || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const handleStatusFilter = (s) => {
    setStatusFilter(s);
    setPage(1);
    fetchEvents(s, 1);
  };

  // Toggle publish / unpublish
  const handleToggleStatus = async (ev) => {
    const newStatus = ev.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      await api.put(`/organizer/events/${ev._id}`, { status: newStatus });
      fetchEvents(statusFilter, page);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update event status');
    }
  };

  // Copy share link
  const handleCopyLink = (ev) => {
    const url = `${window.location.origin}/events/${ev._id}`;
    navigator.clipboard.writeText(url);
    setCopyToast(`Link copied to clipboard for "${ev.title}"!`);
    setTimeout(() => setCopyToast(''), 3000);
  };

  // Delete event confirmation
  const handleConfirmDelete = async () => {
    if (!eventToDelete) return;
    setDeleting(true);
    setDeleteError('');
    try {
      const { data } = await api.delete(`/organizer/events/${eventToDelete._id}`);
      if (data.archived) {
        alert(data.message);
      }
      setEventToDelete(null);
      fetchEvents(statusFilter, page);
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete event.');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = search
    ? events.filter(ev => ev.title.toLowerCase().includes(search.toLowerCase()) || ev.venue?.toLowerCase().includes(search.toLowerCase()))
    : events;

  return (
    <div className="org-page">
      {/* Header */}
      <div className="org-page-header">
        <div>
          <h1 className="org-page-title">My Events</h1>
          <p className="org-page-subtitle">{total} total registered events</p>
        </div>
        <Link to="/organizer/create" className="org-btn org-btn-primary">
          <Plus size={15} /> Create Event
        </Link>
      </div>

      {copyToast && (
        <div style={{
          background: '#ECFDF5', border: '1px solid #10B981', color: '#047857',
          padding: '10px 16px', borderRadius: 8, fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8
        }}>
          <Check size={15} /> {copyToast}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div className="org-date-filter-group">
          {STATUS_TABS.map(t => (
            <button
              key={t.value}
              onClick={() => handleStatusFilter(t.value)}
              className="org-date-filter-btn"
              style={{
                background: statusFilter === t.value ? '#FFFFFF' : 'transparent',
                color: statusFilter === t.value ? '#0B1026' : '#64748B',
                boxShadow: statusFilter === t.value ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
          <input
            className="org-input"
            style={{ paddingLeft: 32 }}
            placeholder="Search events by title or venue…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Event List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1,2,3,4].map(i => (
            <div key={i} className="org-skeleton" style={{ height: 95, borderRadius: 12 }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="org-card">
          <div className="org-empty">
            <div className="org-empty-icon"><Calendar size={22} /></div>
            <div className="org-empty-title">
              {search ? 'No events match your search' : 'No events yet'}
            </div>
            <div className="org-empty-subtitle">
              {search ? 'Try a different search term.' : 'Create your first event and start selling tickets.'}
            </div>
            {!search && (
              <Link to="/organizer/create" className="org-btn org-btn-primary">
                <Plus size={14} /> Create Event
              </Link>
            )}
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(ev => (
              <EventCard
                key={ev._id}
                ev={ev}
                onToggleStatus={handleToggleStatus}
                onRequestDelete={(event) => setEventToDelete(event)}
                onCopyLink={handleCopyLink}
              />
            ))}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
              <button
                className="org-btn org-btn-secondary org-btn-sm"
                disabled={page === 1}
                onClick={() => { setPage(p => p - 1); fetchEvents(statusFilter, page - 1); }}
              >
                Previous
              </button>
              <span style={{ padding: '6px 12px', fontSize: 12.5, color: '#64748B' }}>
                Page {page} of {pages}
              </span>
              <button
                className="org-btn org-btn-secondary org-btn-sm"
                disabled={page >= pages}
                onClick={() => { setPage(p => p + 1); fetchEvents(statusFilter, page + 1); }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Delete Event Confirmation Modal */}
      {eventToDelete && (
        <div className="org-overlay" onClick={() => !deleting && setEventToDelete(null)}>
          <div className="org-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <div className="org-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={18} color="#DC2626" />
                <h3 className="org-modal-title" style={{ color: '#DC2626' }}>Delete Event</h3>
              </div>
              <button
                className="org-btn org-btn-ghost org-btn-sm"
                onClick={() => !deleting && setEventToDelete(null)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="org-modal-body">
              <p style={{ fontSize: 14, color: '#0B1026', margin: '0 0 10px', fontWeight: 600 }}>
                Are you sure you want to delete "{eventToDelete.title}"?
              </p>
              <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, margin: '0 0 14px' }}>
                {eventToDelete.ticketsSold > 0 ? (
                  <span style={{ color: '#B45309', background: '#FFFBEB', padding: '6px 10px', borderRadius: 6, display: 'block', border: '1px solid #FDE68A' }}>
                    ⚠️ This event has {eventToDelete.ticketsSold} ticket(s) issued. To protect attendee records and financial history, it will be safely cancelled and unlisted from public discovery instead of destroying ticket records.
                  </span>
                ) : (
                  'This event has 0 ticket sales. Deleting it will permanently remove it along with all configured ticket tiers.'
                )}
              </p>

              {deleteError && (
                <div style={{ background: '#FEF2F2', color: '#DC2626', padding: '8px 12px', borderRadius: 6, fontSize: 12, marginBottom: 12 }}>
                  {deleteError}
                </div>
              )}
            </div>

            <div className="org-modal-footer">
              <button
                type="button"
                className="org-btn org-btn-secondary"
                disabled={deleting}
                onClick={() => setEventToDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                className="org-btn org-btn-danger"
                onClick={handleConfirmDelete}
              >
                {deleting ? 'Processing…' : eventToDelete.ticketsSold > 0 ? 'Archive & Cancel Event' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
