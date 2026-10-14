import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../lib/axios.js';
import './organizer.css';
import {
  QrCode, Check, X, AlertCircle, RotateCcw,
  Users, Activity, Ticket, ArrowUpRight, Search,
  Radio, Clock, CheckCircle2, AlertTriangle, ShieldCheck
} from 'lucide-react';

export default function OrganizerCheckInPage() {
  const [searchParams] = useSearchParams();
  const preselectedEvent = searchParams.get('event') || '';

  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(preselectedEvent);
  const [statsData, setStatsData] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const [qrInput, setQrInput] = useState('');
  const [validating, setValidating] = useState(false);
  const [scanResult, setScanResult] = useState(null); // { status: 'VALID'|'USED'|'INVALID', message, ticket, event }
  const [liveMode, setLiveMode] = useState(false);

  const inputRef = useRef(null);

  // Load organizer's events
  useEffect(() => {
    api.get('/organizer/events')
      .then(({ data }) => {
        const evList = data.data || [];
        setEvents(evList);
        if (!selectedEventId && evList.length > 0) {
          setSelectedEventId(evList[0]._id);
        }
      })
      .catch(() => setEvents([]));
  }, []);

  // Fetch check-in stats when selectedEventId changes
  const fetchStats = async (evId) => {
    if (!evId) return;
    setLoadingStats(true);
    try {
      const { data } = await api.get(`/organizer/events/${evId}/checkins`);
      setStatsData(data.data);
    } catch (err) {
      setStatsData(null);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (selectedEventId) {
      fetchStats(selectedEventId);
    }
  }, [selectedEventId]);

  // Handle Scan / Manual Validation
  const handleValidate = async (e) => {
    if (e) e.preventDefault();
    if (!qrInput.trim()) return;

    setValidating(true);
    setScanResult(null);

    try {
      const { data } = await api.post('/tickets/checkin/scan', { qrToken: qrInput.trim() });
      setScanResult({
        status: 'VALID',
        ticket: data.data?.ticket,
        event: data.data?.event,
        message: data.message || 'Ticket checked in successfully!',
        checkedInAt: new Date().toLocaleTimeString(),
      });
      // Refresh stats
      if (selectedEventId) fetchStats(selectedEventId);
      setQrInput('');
    } catch (err) {
      const code = err.response?.data?.code;
      const msg = err.response?.data?.message || 'Ticket validation failed';
      setScanResult({
        status: code === 'ALREADY_CHECKED_IN' ? 'USED' : 'INVALID',
        ticket: err.response?.data?.data?.ticket,
        event: err.response?.data?.data?.event,
        message: msg,
      });
    } finally {
      setValidating(false);
      if (inputRef.current) inputRef.current.focus();
    }
  };

  const handleResetScan = () => {
    setScanResult(null);
    setQrInput('');
    if (inputRef.current) inputRef.current.focus();
  };

  const stats = statsData?.stats || { totalSold: 0, totalCheckedIn: 0, notArrived: 0, attendanceRate: 0 };
  const recentCheckIns = statsData?.recentCheckIns || [];
  const byTicketType = statsData?.byTicketType || [];

  return (
    <div className="org-page">
      {/* Page Header */}
      <div className="org-page-header">
        <div>
          <h1 className="org-page-title">Check-in Command Center</h1>
          <p className="org-page-subtitle">Real-time gate validation, attendee arrival tracking, and live venue manifest.</p>
        </div>

        {/* Live Mode Toggle & Event Selector */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => setLiveMode(!liveMode)}
            className="org-btn"
            style={{
              background: liveMode ? '#10B981' : '#FFFFFF',
              color: liveMode ? '#FFFFFF' : '#0B1026',
              border: '1px solid',
              borderColor: liveMode ? '#10B981' : '#E2E8F0',
              fontWeight: 700,
            }}
          >
            <Radio size={14} className={liveMode ? 'animate-pulse' : ''} />
            {liveMode ? 'LIVE MODE ON' : 'ENTER LIVE MODE'}
          </button>

          <select
            className="org-select"
            style={{ width: 220 }}
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
          >
            {events.map((ev) => (
              <option key={ev._id} value={ev._id}>
                {ev.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Key Metric Highlights */}
      <div className="org-stats-grid" style={{ marginBottom: 24 }}>
        <div className="org-stat-card">
          <div className="org-stat-icon" style={{ background: '#EEF2FF', color: '#4F46E5' }}>
            <Ticket size={18} />
          </div>
          <div className="org-stat-label">Tickets Issued</div>
          <div className="org-stat-value">{stats.totalSold.toLocaleString()}</div>
          <div className="org-stat-delta positive">Manifest count</div>
        </div>

        <div className="org-stat-card">
          <div className="org-stat-icon" style={{ background: '#ECFDF5', color: '#10B981' }}>
            <CheckCircle2 size={18} />
          </div>
          <div className="org-stat-label">Checked In</div>
          <div className="org-stat-value" style={{ color: '#10B981' }}>{stats.totalCheckedIn.toLocaleString()}</div>
          <div className="org-stat-delta positive">{stats.attendanceRate}% arrival</div>
        </div>

        <div className="org-stat-card">
          <div className="org-stat-icon" style={{ background: '#FFFBEB', color: '#F59E0B' }}>
            <Clock size={18} />
          </div>
          <div className="org-stat-label">Not Arrived</div>
          <div className="org-stat-value" style={{ color: '#F59E0B' }}>{stats.notArrived.toLocaleString()}</div>
          <div className="org-stat-delta">Awaiting check-in</div>
        </div>

        <div className="org-stat-card">
          <div className="org-stat-icon" style={{ background: '#ECFEFF', color: '#0891B2' }}>
            <Activity size={18} />
          </div>
          <div className="org-stat-label">Attendance Rate</div>
          <div className="org-stat-value">{stats.attendanceRate}%</div>
          <div className="org-stat-delta">Turnout percentage</div>
        </div>
      </div>

      {/* Main Grid: Scanner Left, Feeds Right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 460px) 1fr', gap: 24 }}>
        {/* Scanner Panel */}
        <div className="org-card" style={{ padding: 24 }}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0B1026', margin: '0 0 6px' }}>Scan Gate Ticket</h3>
            <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>
              Use camera hardware, an external laser scanner, or enter token manually.
            </p>
          </div>

          {/* Scanner Visual Frame */}
          <div className="org-scanner-frame" style={{ marginBottom: 20 }}>
            <div className="org-scanner-corner tl" />
            <div className="org-scanner-corner tr" />
            <div className="org-scanner-corner bl" />
            <div className="org-scanner-corner br" />
            <div className="org-scanline" />
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', borderRadius: 8 }}>
              <QrCode size={72} color="#CBD5E1" />
            </div>
          </div>

          {/* Validation Result Box */}
          {scanResult && (
            <div style={{
              borderRadius: 10,
              padding: 18,
              marginBottom: 18,
              textAlign: 'center',
              border: '1.5px solid',
              borderColor: scanResult.status === 'VALID' ? '#10B981' : scanResult.status === 'USED' ? '#F59E0B' : '#EF4444',
              background: scanResult.status === 'VALID' ? '#ECFDF5' : scanResult.status === 'USED' ? '#FFFBEB' : '#FEF2F2',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%', margin: '0 auto 10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: scanResult.status === 'VALID' ? '#10B981' : scanResult.status === 'USED' ? '#F59E0B' : '#EF4444',
                color: '#FFF'
              }}>
                {scanResult.status === 'VALID' ? <Check size={24} /> : scanResult.status === 'USED' ? <AlertTriangle size={24} /> : <X size={24} />}
              </div>

              <div style={{
                fontSize: 16, fontWeight: 800, letterSpacing: -0.3,
                color: scanResult.status === 'VALID' ? '#047857' : scanResult.status === 'USED' ? '#B45309' : '#B91C1C'
              }}>
                {scanResult.status === 'VALID' ? 'VALID TICKET ✓' : scanResult.status === 'USED' ? 'ALREADY CHECKED IN' : 'INVALID TICKET'}
              </div>

              <p style={{ fontSize: 13, margin: '6px 0 10px', color: '#1F2937', fontWeight: 500 }}>
                {scanResult.message}
              </p>

                  {scanResult.ticket && (
                    <div style={{
                      fontSize: 12.5, textAlign: 'left', background: '#FFFFFF', borderRadius: 8, padding: 12, border: '1px solid #E2E8F0', marginTop: 10
                    }}>
                      {scanResult.ticket.owner && (
                        <div style={{ marginBottom: 4 }}>
                          <strong style={{ color: '#0B1026' }}>Guest:</strong> {scanResult.ticket.owner.firstName} {scanResult.ticket.owner.lastName} ({scanResult.ticket.owner.email})
                        </div>
                      )}
                      <div style={{ marginBottom: 4, display: 'flex', justifyContent: 'space-between' }}>
                        <span><strong style={{ color: '#0B1026' }}>Tier:</strong> {scanResult.ticket.ticketType || 'Standard'}</span>
                        {scanResult.ticket.format && scanResult.ticket.format !== 'INDIVIDUAL' && (
                          <span style={{ fontSize: 11, background: '#EEF2FF', color: '#4F46E5', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>
                            {scanResult.ticket.format}
                          </span>
                        )}
                      </div>
                      {scanResult.ticket.admittedCapacity > 1 && (
                        <div style={{ marginBottom: 4, color: '#059669', fontWeight: 600 }}>
                          👥 Group Capacity: {scanResult.ticket.attendeesCheckedIn || scanResult.ticket.admittedCapacity} of {scanResult.ticket.admittedCapacity} Admitted
                        </div>
                      )}
                      {scanResult.ticket.tableNumber && (
                        <div style={{ marginBottom: 4, color: '#D97706', fontWeight: 600 }}>
                          🍾 Reserved Table: {scanResult.ticket.tableNumber}
                        </div>
                      )}
                      <div style={{ fontFamily: 'monospace', color: '#64748B' }}>
                        #{scanResult.ticket.ticketNumber || scanResult.ticket.id}
                      </div>
                    </div>
                  )}

              <button
                onClick={handleResetScan}
                className="org-btn org-btn-secondary org-btn-sm"
                style={{ marginTop: 12 }}
              >
                <RotateCcw size={13} /> Reset for Next Guest
              </button>
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleValidate}>
            <div className="org-form-group">
              <label className="org-label">QR Token or Ticket ID</label>
              <input
                ref={inputRef}
                className="org-input"
                style={{ fontFamily: 'monospace', fontSize: 14 }}
                placeholder="Scan or type QR token / Ticket ID..."
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={validating || !qrInput.trim()}
              className="org-btn org-btn-primary"
              style={{ width: '100%', height: 42, fontSize: 14 }}
            >
              {validating ? 'Verifying Ticket…' : 'Validate & Mark Checked-in'}
            </button>
          </form>
        </div>

        {/* Right Column: Breakdown & Live Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Tiers Breakdown Card */}
          <div className="org-card">
            <div className="org-card-header">
              <h3 className="org-card-title">Admission By Ticket Tier</h3>
            </div>
            <div className="org-table-wrap">
              <table className="org-table">
                <thead>
                  <tr>
                    <th>Tier</th>
                    <th>Sold</th>
                    <th>Checked In</th>
                    <th>Remaining</th>
                    <th>Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {byTicketType.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', color: '#94A3B8', padding: '24px' }}>
                        No tier statistics recorded yet.
                      </td>
                    </tr>
                  ) : (
                    byTicketType.map((tt, i) => {
                      const pct = tt.total > 0 ? Math.round((tt.checkedIn / tt.total) * 100) : 0;
                      return (
                        <tr key={i}>
                          <td style={{ fontWeight: 600, color: '#0B1026' }}>{tt.name}</td>
                          <td>{tt.total}</td>
                          <td style={{ color: '#10B981', fontWeight: 600 }}>{tt.checkedIn}</td>
                          <td style={{ color: '#F59E0B' }}>{tt.notArrived}</td>
                          <td style={{ width: 120 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ flex: 1, height: 6, background: '#F1F5F9', borderRadius: 99 }}>
                                <div style={{ width: `${pct}%`, height: '100%', background: '#4F46E5', borderRadius: 99 }} />
                              </div>
                              <span style={{ fontSize: 11, color: '#64748B', minWidth: 28 }}>{pct}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Live Check-in Activity Feed */}
          <div className="org-card">
            <div className="org-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Activity size={16} color="#10B981" />
                <h3 className="org-card-title">Live Gate Feed</h3>
              </div>
              <span className="org-badge org-badge-success" style={{ fontSize: 11 }}>Active Scanner</span>
            </div>
            <div style={{ padding: '8px 20px', maxHeight: 320, overflowY: 'auto' }}>
              {recentCheckIns.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#94A3B8', padding: '32px 0', fontSize: 13 }}>
                  Waiting for first guest to scan in…
                </div>
              ) : (
                recentCheckIns.map((ci) => {
                  const guestName = ci.ticketId?.ownerId
                    ? `${ci.ticketId.ownerId.firstName} ${ci.ticketId.ownerId.lastName}`
                    : 'Registered Guest';
                  const tierName = ci.ticketId?.ticketTypeId?.name || 'General Admission';
                  const time = new Date(ci.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

                  return (
                    <div key={ci._id} className="org-activity-item">
                      <div className="org-activity-dot" style={{ background: '#10B981' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#0B1026' }}>{guestName}</div>
                        <div style={{ fontSize: 11.5, color: '#64748B' }}>
                          {tierName} • #{ci.ticketId?.ticketNumber || 'TICK'}
                        </div>
                      </div>
                      <div className="org-activity-time">{time}</div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
