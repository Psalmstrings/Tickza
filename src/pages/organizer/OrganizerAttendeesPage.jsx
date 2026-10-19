import React, { useState, useEffect, useCallback } from 'react';
import api from '../../lib/axios.js';
import './organizer.css';
import {
  Users, Search, Download, Filter, CheckCircle2,
  Clock, Mail, Phone, Ticket, Plus, ChevronRight, X
} from 'lucide-react';

export default function OrganizerAttendeesPage() {
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const [search, setSearch] = useState('');
  const [checkedInFilter, setCheckedInFilter] = useState('');
  const [admissionFilter, setAdmissionFilter] = useState('');
  const [eventFilter, setEventFilter] = useState('');
  const [stats, setStats] = useState(null);
  const [selectedAttendee, setSelectedAttendee] = useState(null);

  // Complimentary modal state
  const [showCompModal, setShowCompModal] = useState(false);
  const [events, setEvents] = useState([]);
  const [compEventId, setCompEventId] = useState('');
  const [ticketTypes, setTicketTypes] = useState([]);
  const [compTicketTypeId, setCompTicketTypeId] = useState('');
  const [compGuest, setCompGuest] = useState({ firstName: '', lastName: '', email: '', phone: '', quantity: 1, note: '' });
  const [issuingComp, setIssuingComp] = useState(false);

  const fetchAttendees = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: 50 });
      if (search) params.append('search', search);
      if (checkedInFilter) params.append('checkedIn', checkedInFilter);
      if (admissionFilter) params.append('admissionType', admissionFilter);
      if (eventFilter) params.append('eventId', eventFilter);

      const { data } = await api.get(`/organizer/attendees?${params}`);
      setAttendees(data.data || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
      if (data.stats) setStats(data.stats);
    } catch {
      setAttendees([]);
    } finally {
      setLoading(false);
    }
  }, [search, checkedInFilter, admissionFilter, eventFilter]);

  useEffect(() => {
    fetchAttendees(page);
  }, [fetchAttendees, page]);

  // Load events for complimentary ticket issuance and event filter
  useEffect(() => {
    api.get('/organizer/events')
      .then(({ data }) => {
        const evs = data.data || [];
        setEvents(evs);
        if (evs.length > 0) {
          setCompEventId(evs[0]._id);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch ticket types when comp event selected
  useEffect(() => {
    if (compEventId) {
      api.get(`/organizer/events/${compEventId}/ticket-types`)
        .then(({ data }) => {
          const tts = data.data || [];
          setTicketTypes(tts);
          if (tts.length > 0) setCompTicketTypeId(tts[0]._id);
        })
        .catch(() => setTicketTypes([]));
    }
  }, [compEventId]);

  // Export Attendees to CSV
  const handleExportCSV = () => {
    if (attendees.length === 0) return;
    const headers = ['Ticket Number', 'Registration Ref', 'Admission Type', 'First Name', 'Last Name', 'Email', 'Phone', 'Event', 'Tier', 'Price', 'Checked In', 'Check In Time'];
    const rows = attendees.map(t => [
      t.ticketNumber || '',
      t.registrationRef || '',
      t.admissionType || (t.price === 0 ? 'FREE' : 'PAID'),
      t.ownerId?.firstName || '',
      t.ownerId?.lastName || '',
      t.ownerId?.email || '',
      t.ownerId?.phone || '',
      t.eventId?.title || '',
      t.ticketTypeId?.name || (t.admissionType === 'FREE' ? 'Free Pass' : 'Standard'),
      t.price || 0,
      t.checkedInAt ? 'YES' : 'NO',
      t.checkedInAt ? new Date(t.checkedInAt).toLocaleString() : ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Tickza_Attendees_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Submit complimentary ticket
  const handleIssueComp = async (e) => {
    e.preventDefault();
    if (!compEventId || !compTicketTypeId || !compGuest.email) return;

    setIssuingComp(true);
    try {
      await api.post(`/organizer/events/${compEventId}/complimentary`, {
        ticketTypeId: compTicketTypeId,
        guests: [{
          firstName: compGuest.firstName,
          lastName: compGuest.lastName,
          email: compGuest.email,
          phone: compGuest.phone,
          quantity: parseInt(compGuest.quantity, 10) || 1,
        }],
        note: compGuest.note,
      });

      setShowCompModal(false);
      setCompGuest({ firstName: '', lastName: '', email: '', phone: '', quantity: 1, note: '' });
      fetchAttendees(1);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to issue complimentary tickets');
    } finally {
      setIssuingComp(false);
    }
  };

  const checkedInCount = attendees.filter(a => a.checkedInAt).length;

  return (
    <div className="org-page">
      {/* Header */}
      <div className="org-page-header">
        <div>
          <h1 className="org-page-title">Attendee Manifest & CRM</h1>
          <p className="org-page-subtitle">Track ticket holders, attendance verification, VIP passes, and guest history.</p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowCompModal(true)}
            className="org-btn org-btn-secondary"
          >
            <Plus size={15} /> Issue Complimentary Pass
          </button>
          <button
            onClick={handleExportCSV}
            className="org-btn org-btn-primary"
            disabled={attendees.length === 0}
          >
            <Download size={15} /> Export CSV
          </button>
        </div>
      </div>

      {/* Summary Statistics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
        <div className="org-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Total Registered</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', marginTop: 4 }}>
            {stats?.totalRegistrations ?? total}
          </div>
          <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
            Across matching attendees
          </div>
        </div>

        <div className="org-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>Checked In</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#059669', marginTop: 4 }}>
            {stats?.checkedIn ?? attendees.filter(a => a.checkedInAt).length}
          </div>
          <div style={{ fontSize: 11, color: '#047857', marginTop: 2 }}>
            Verified at entrance
          </div>
        </div>

        <div className="org-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#D97706', textTransform: 'uppercase' }}>Not Yet Arrived</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#D97706', marginTop: 4 }}>
            {stats?.notCheckedIn ?? Math.max(0, total - (stats?.checkedIn || attendees.filter(a => a.checkedInAt).length))}
          </div>
          <div style={{ fontSize: 11, color: '#B45309', marginTop: 2 }}>
            Awaiting arrival
          </div>
        </div>

        <div className="org-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#026CDF', textTransform: 'uppercase' }}>Attendance Rate</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#026CDF', marginTop: 4 }}>
            {stats?.attendancePercentage !== undefined ? `${stats.attendancePercentage}%` : '0%'}
          </div>
          <div style={{ fontSize: 11, color: '#0369A1', marginTop: 2 }}>
            Admitted percentage
          </div>
        </div>

        <div className="org-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase' }}>Admission Breakdown</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#4C1D95', marginTop: 6, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span>🎉 {stats?.freeRegistrations ?? attendees.filter(a => a.admissionType === 'FREE' || a.price === 0).length} Free</span>
            <span>•</span>
            <span>💳 {stats?.paidTicketsSold ?? attendees.filter(a => a.admissionType !== 'FREE' && a.price > 0).length} Paid</span>
          </div>
          <div style={{ fontSize: 11, color: '#6D28D9', marginTop: 2 }}>
            Passes vs Paid Tickets
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input
            className="org-input"
            style={{ paddingLeft: 34 }}
            placeholder="Search by name, email, or pass/ticket #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Event Filter */}
        <select
          className="org-select"
          style={{ width: 180 }}
          value={eventFilter}
          onChange={(e) => setEventFilter(e.target.value)}
        >
          <option value="">All Events</option>
          {events.map((ev) => (
            <option key={ev._id} value={ev._id}>
              {ev.title}
            </option>
          ))}
        </select>

        {/* Admission Type Filter */}
        <select
          className="org-select"
          style={{ width: 170 }}
          value={admissionFilter}
          onChange={(e) => setAdmissionFilter(e.target.value)}
        >
          <option value="">All Admission Types</option>
          <option value="FREE">🎉 Free Passes (RSVP)</option>
          <option value="PAID">💳 Paid Tickets</option>
        </select>

        {/* Check-in Filter */}
        <select
          className="org-select"
          style={{ width: 160 }}
          value={checkedInFilter}
          onChange={(e) => setCheckedInFilter(e.target.value)}
        >
          <option value="">All Check-in Status</option>
          <option value="true">Checked In</option>
          <option value="false">Not Yet Arrived</option>
        </select>
      </div>

      {/* Attendees Table Card */}
      <div className="org-card">
        {loading ? (
          <div style={{ padding: 24 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="org-skeleton" style={{ height: 44, marginBottom: 8, borderRadius: 6 }} />
            ))}
          </div>
        ) : attendees.length === 0 ? (
          <div className="org-empty">
            <div className="org-empty-icon"><Users size={22} /></div>
            <div className="org-empty-title">No attendees found</div>
            <div className="org-empty-subtitle">
              {search || admissionFilter || eventFilter ? 'Try adjusting your search or filters.' : 'When guests register or purchase tickets, they appear here.'}
            </div>
          </div>
        ) : (
          <div className="org-table-wrap responsive-table-container">
            <table className="org-table">
              <thead>
                <tr>
                  <th>Attendee</th>
                  <th>Contact</th>
                  <th>Event</th>
                  <th>Tier & Reference</th>
                  <th>Admission / Fee</th>
                  <th>Status</th>
                  <th>Check-In Time</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {attendees.map((t) => {
                  const name = t.ownerId ? `${t.ownerId.firstName} ${t.ownerId.lastName}` : 'Guest Attendee';
                  const isChecked = !!t.checkedInAt;
                  const isFree = t.admissionType === 'FREE' || t.price === 0;

                  return (
                    <tr
                      key={t._id}
                      onClick={() => setSelectedAttendee(t)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <div style={{ fontWeight: 600, color: '#0B1026' }}>{name}</div>
                        <div style={{ fontSize: 11, color: '#94A3B8' }}>{t.ownerId?.email}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: 13, color: '#475569' }}>{t.ownerId?.phone || '—'}</div>
                      </td>
                      <td style={{ maxWidth: 160 }}>
                        <div className="org-truncate" style={{ fontSize: 13, color: '#0B1026', fontWeight: 500 }}>
                          {t.eventId?.title || 'Event'}
                        </div>
                      </td>
                      <td>
                        <span className={`org-badge ${isFree ? 'org-badge-success' : 'org-badge-purple'}`} style={{ marginRight: 6 }}>
                          {isFree ? (t.ticketTypeId?.name || 'Free Pass') : (t.ticketTypeId?.name || 'Standard')}
                        </span>
                        <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#64748B' }}>
                          #{t.registrationRef || t.ticketNumber?.slice(-8) || 'PASS'}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600, color: isFree ? '#059669' : '#0B1026' }}>
                        {isFree ? 'FREE PASS' : `₦${t.price.toLocaleString()}`}
                      </td>
                      <td>
                        {isChecked ? (
                          <span className="org-badge org-badge-success">
                            <CheckCircle2 size={11} /> Checked In
                          </span>
                        ) : (
                          <span className="org-badge org-badge-neutral">
                            <Clock size={11} /> Not Arrived
                          </span>
                        )}
                      </td>
                      <td style={{ fontSize: 12, color: '#64748B' }}>
                        {t.checkedInAt ? new Date(t.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <ChevronRight size={15} color="#94A3B8" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '16px 20px', borderTop: '1px solid #E2E8F0' }}>
            <button
              className="org-btn org-btn-secondary org-btn-sm"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </button>
            <span style={{ display: 'flex', alignItems: 'center', fontSize: 13, color: '#64748B' }}>
              Page {page} of {pages}
            </span>
            <button
              className="org-btn org-btn-secondary org-btn-sm"
              disabled={page >= pages}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Attendee Profile Drawer / Modal */}
      {selectedAttendee && (
        <div className="org-overlay" onClick={() => setSelectedAttendee(null)}>
          <div className="org-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="org-modal-header">
              <h3 className="org-modal-title">Attendee Profile</h3>
              <button className="org-btn org-btn-ghost org-btn-sm" onClick={() => setSelectedAttendee(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="org-modal-body">
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%', background: '#EEF2FF', color: '#4F46E5',
                  fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px'
                }}>
                  {selectedAttendee.ownerId?.firstName?.[0] || 'A'}
                </div>
                <h4 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 4px', color: '#0B1026' }}>
                  {selectedAttendee.ownerId?.firstName} {selectedAttendee.ownerId?.lastName}
                </h4>
                <div style={{ fontSize: 13, color: '#64748B' }}>
                  Attendee since {selectedAttendee.ownerId?.createdAt ? new Date(selectedAttendee.ownerId.createdAt).toLocaleDateString() : '2026'}
                </div>
              </div>

              <div style={{ background: '#F8FAFC', borderRadius: 8, padding: 16, border: '1px solid #E2E8F0', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, fontSize: 13, color: '#475569' }}>
                  <Mail size={14} color="#64748B" /> {selectedAttendee.ownerId?.email}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#475569' }}>
                  <Phone size={14} color="#64748B" /> {selectedAttendee.ownerId?.phone || 'No phone recorded'}
                </div>
              </div>

              <div style={{ fontSize: 13, fontWeight: 700, color: '#0B1026', marginBottom: 8 }}>Ticket Details</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: '#475569', marginBottom: 16 }}>
                <div><strong>Event:</strong> {selectedAttendee.eventId?.title}</div>
                <div><strong>Tier:</strong> {selectedAttendee.ticketTypeId?.name}</div>
                <div><strong>Ticket Number:</strong> <span style={{ fontFamily: 'monospace' }}>#{selectedAttendee.ticketNumber}</span></div>
                <div><strong>Admission:</strong> {selectedAttendee.checkedInAt ? `Checked in at ${new Date(selectedAttendee.checkedInAt).toLocaleString()}` : 'Not checked in yet'}</div>
                <div><strong>Price Paid:</strong> {selectedAttendee.price === 0 ? 'Complimentary' : `₦${selectedAttendee.price.toLocaleString()}`}</div>
              </div>
            </div>
            <div className="org-modal-footer">
              <button className="org-btn org-btn-secondary" onClick={() => setSelectedAttendee(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complimentary Pass Modal */}
      {showCompModal && (
        <div className="org-overlay" onClick={() => setShowCompModal(false)}>
          <div className="org-modal" onClick={e => e.stopPropagation()}>
            <div className="org-modal-header">
              <h3 className="org-modal-title">Issue Complimentary Pass</h3>
              <button className="org-btn org-btn-ghost org-btn-sm" onClick={() => setShowCompModal(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleIssueComp}>
              <div className="org-modal-body">
                <div className="org-form-group">
                  <label className="org-label">Event</label>
                  <select
                    className="org-select"
                    value={compEventId}
                    onChange={(e) => setCompEventId(e.target.value)}
                    required
                  >
                    {events.map((ev) => (
                      <option key={ev._id} value={ev._id}>{ev.title}</option>
                    ))}
                  </select>
                </div>

                <div className="org-form-group">
                  <label className="org-label">Ticket Tier</label>
                  <select
                    className="org-select"
                    value={compTicketTypeId}
                    onChange={(e) => setCompTicketTypeId(e.target.value)}
                    required
                  >
                    {ticketTypes.map((tt) => (
                      <option key={tt._id} value={tt._id}>{tt.name} (Capacity: {tt.quantity})</option>
                    ))}
                  </select>
                </div>

                <div className="org-grid-2">
                  <div className="org-form-group">
                    <label className="org-label">First Name</label>
                    <input
                      className="org-input"
                      value={compGuest.firstName}
                      onChange={e => setCompGuest({ ...compGuest, firstName: e.target.value })}
                      placeholder="Jane"
                      required
                    />
                  </div>
                  <div className="org-form-group">
                    <label className="org-label">Last Name</label>
                    <input
                      className="org-input"
                      value={compGuest.lastName}
                      onChange={e => setCompGuest({ ...compGuest, lastName: e.target.value })}
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>

                <div className="org-form-group">
                  <label className="org-label">Email Address</label>
                  <input
                    type="email"
                    className="org-input"
                    value={compGuest.email}
                    onChange={e => setCompGuest({ ...compGuest, email: e.target.value })}
                    placeholder="guest@example.com"
                    required
                  />
                </div>

                <div className="org-grid-2">
                  <div className="org-form-group">
                    <label className="org-label">Phone Number</label>
                    <input
                      className="org-input"
                      value={compGuest.phone}
                      onChange={e => setCompGuest({ ...compGuest, phone: e.target.value })}
                      placeholder="08012345678"
                    />
                  </div>
                  <div className="org-form-group">
                    <label className="org-label">Number of Passes</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      className="org-input"
                      value={compGuest.quantity}
                      onChange={e => setCompGuest({ ...compGuest, quantity: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="org-form-group">
                  <label className="org-label">Reason / VIP Note</label>
                  <input
                    className="org-input"
                    value={compGuest.note}
                    onChange={e => setCompGuest({ ...compGuest, note: e.target.value })}
                    placeholder="e.g. Speaker pass, Artist guest, Media pass"
                  />
                </div>
              </div>
              <div className="org-modal-footer">
                <button type="button" className="org-btn org-btn-secondary" onClick={() => setShowCompModal(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={issuingComp} className="org-btn org-btn-primary">
                  {issuingComp ? 'Issuing Passes…' : 'Generate & Issue Pass'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
