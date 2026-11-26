import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../lib/axios.js';
import './organizer.css';
import {
  QrCode, Check, X, AlertCircle, RotateCcw,
  Users, Activity, Ticket, ArrowUpRight, Search,
  Radio, Clock, CheckCircle2, AlertTriangle, ShieldCheck,
  Volume2, VolumeX, Sparkles, ChevronRight, Hash, UserCheck
} from 'lucide-react';
import CameraQRScanner from '../../components/scan/CameraQRScanner.jsx';

export default function OrganizerCheckInPage() {
  const [searchParams] = useSearchParams();
  const preselectedEvent = searchParams.get('event') || '';

  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(preselectedEvent);
  const [statsData, setStatsData] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Mobile segmented tab: 'scanner' | 'manifest' | 'feed'
  const [activeTab, setActiveTab] = useState('scanner');

  const [qrInput, setQrInput] = useState('');
  const [validating, setValidating] = useState(false);
  const [scanResult, setScanResult] = useState(null); // { status: 'VALID'|'USED'|'INVALID', message, ticket, event, checkedInAt }
  const [liveMode, setLiveMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const inputRef = useRef(null);
  const autoResetTimerRef = useRef(null);

  // Play audio chime
  const playChime = useCallback((status) => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (status === 'VALID') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.35, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch (e) {}
  }, [soundEnabled]);

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
  const fetchStats = useCallback(async (evId) => {
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
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      fetchStats(selectedEventId);
    }
  }, [selectedEventId, fetchStats]);

  // Reset scan result helper
  const handleResetScan = useCallback(() => {
    if (autoResetTimerRef.current) {
      clearTimeout(autoResetTimerRef.current);
      autoResetTimerRef.current = null;
    }
    setScanResult(null);
    setQrInput('');
    if (inputRef.current) inputRef.current.focus();
  }, []);

  // Handle Scan / Manual Validation
  const executeValidate = async (tokenOverride) => {
    const raw = (tokenOverride !== undefined ? tokenOverride : qrInput).trim();
    if (!raw) return;

    if (autoResetTimerRef.current) {
      clearTimeout(autoResetTimerRef.current);
      autoResetTimerRef.current = null;
    }

    setValidating(true);
    setScanResult(null);

    try {
      const { data } = await api.post('/tickets/checkin/scan', {
        qrToken: raw,
        ticketId: raw,
        ticketNumber: raw,
        token: raw,
        eventId: selectedEventId || undefined,
      });

      const result = {
        status: 'VALID',
        ticket: data.data?.ticket,
        event: data.data?.event,
        message: data.message || 'Ticket checked in successfully! Valid admission.',
        checkedInAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };

      setScanResult(result);
      playChime('VALID');

      // Refresh event manifest stats
      if (selectedEventId) fetchStats(selectedEventId);
      setQrInput('');

      // If Live Gate Mode is active, auto-clear after 2.5s for seamless high-throughput queue scanning
      if (liveMode) {
        autoResetTimerRef.current = setTimeout(() => {
          handleResetScan();
        }, 2500);
      }
    } catch (err) {
      const code = err.response?.data?.code;
      const msg = err.response?.data?.message || 'Ticket validation failed.';
      const statusType = code === 'ALREADY_CHECKED_IN' ? 'USED' : 'INVALID';

      setScanResult({
        status: statusType,
        ticket: err.response?.data?.data?.ticket,
        event: err.response?.data?.data?.event,
        message: msg,
      });
      playChime(statusType);
    } finally {
      setValidating(false);
    }
  };

  const handleManualSubmit = (e) => {
    if (e) e.preventDefault();
    executeValidate();
  };

  const handleCameraScan = (decodedText) => {
    if (!validating && decodedText) {
      // In mobile gate scanning, switch to scanner tab if not already active
      setActiveTab('scanner');
      setQrInput(decodedText);
      executeValidate(decodedText);
    }
  };

  const stats = statsData?.stats || { totalSold: 0, totalCheckedIn: 0, notArrived: 0, attendanceRate: 0 };
  const recentCheckIns = statsData?.recentCheckIns || [];
  const byTicketType = statsData?.byTicketType || [];

  return (
    <div className="org-page" style={{ maxWidth: 1400, margin: '0 auto', overflowX: 'hidden' }}>
      {/* Page Header */}
      <div className="org-page-header">
        <div>
          <h1 className="org-page-title">Check-in Command Center</h1>
          <p className="org-page-subtitle">
            High-speed gate verification, attendee arrival manifest, and live venue admission tracking.
          </p>
        </div>

        {/* Header Controls: Live Mode Toggle, Sound, and Event Selector */}
        <div className="org-checkin-controls">
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Chime sound enabled' : 'Chime sound muted'}
            style={{
              height: 40,
              padding: '0 12px',
              borderRadius: 8,
              border: '1px solid #E2E8F0',
              backgroundColor: soundEnabled ? '#ECFDF5' : '#FFFFFF',
              color: soundEnabled ? '#059669' : '#94A3B8',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              touchAction: 'manipulation',
            }}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span className="hidden sm:inline">{soundEnabled ? 'Chime ON' : 'Muted'}</span>
          </button>

          {/* Live Continuous Mode Button */}
          <button
            type="button"
            onClick={() => {
              setLiveMode(!liveMode);
              if (!liveMode && scanResult) handleResetScan();
            }}
            className="org-btn"
            style={{
              height: 40,
              backgroundColor: liveMode ? '#10B981' : '#FFFFFF',
              color: liveMode ? '#FFFFFF' : '#0B1026',
              border: '1px solid',
              borderColor: liveMode ? '#10B981' : '#E2E8F0',
              fontWeight: 700,
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: liveMode ? '0 2px 8px rgba(16, 185, 129, 0.3)' : 'none',
              touchAction: 'manipulation',
            }}
          >
            <Radio size={14} className={liveMode ? 'animate-pulse' : ''} />
            <span>{liveMode ? 'CONTINUOUS LIVE ON' : 'GATE CONTINUOUS MODE'}</span>
          </button>

          {/* Event Dropdown */}
          <select
            className="org-select"
            style={{ minWidth: 200, height: 40, fontSize: 13, fontWeight: 600 }}
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
          >
            <option value="">All Events (Auto-Detect Gate)</option>
            {events.map((ev) => (
              <option key={ev._id} value={ev._id}>
                {ev.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Key Metric Highlights (Responsive 4-stat grid on desktop, compact 2x2 on mobile) */}
      <div className="org-stats-grid" style={{ marginBottom: 18 }}>
        <div className="org-stat-card">
          <div className="org-stat-icon" style={{ background: '#EEF2FF', color: '#4F46E5' }}>
            <Ticket size={18} />
          </div>
          <div className="org-stat-label">Manifest Sold</div>
          <div className="org-stat-value">{stats.totalSold.toLocaleString()}</div>
          <div className="org-stat-delta positive">Total passes</div>
        </div>

        <div className="org-stat-card">
          <div className="org-stat-icon" style={{ background: '#ECFDF5', color: '#10B981' }}>
            <CheckCircle2 size={18} />
          </div>
          <div className="org-stat-label">Admitted In</div>
          <div className="org-stat-value" style={{ color: '#10B981' }}>
            {stats.totalCheckedIn.toLocaleString()}
          </div>
          <div className="org-stat-delta positive">{stats.attendanceRate}% arrival</div>
        </div>

        <div className="org-stat-card">
          <div className="org-stat-icon" style={{ background: '#FFFBEB', color: '#F59E0B' }}>
            <Clock size={18} />
          </div>
          <div className="org-stat-label">Awaiting Arrival</div>
          <div className="org-stat-value" style={{ color: '#F59E0B' }}>
            {stats.notArrived.toLocaleString()}
          </div>
          <div className="org-stat-delta">Expected guests</div>
        </div>

        <div className="org-stat-card">
          <div className="org-stat-icon" style={{ background: '#ECFEFF', color: '#0891B2' }}>
            <Activity size={18} />
          </div>
          <div className="org-stat-label">Turnout Rate</div>
          <div className="org-stat-value">{stats.attendanceRate}%</div>
          <div className="org-stat-delta">Gate progress</div>
        </div>
      </div>

      {/* Mobile Segmented Navigation Tabs (Only visible on screens <= 960px) */}
      <div className="org-checkin-mobile-tabs">
        <button
          type="button"
          onClick={() => setActiveTab('scanner')}
          className={`org-checkin-tab-btn ${activeTab === 'scanner' ? 'active' : ''}`}
        >
          <QrCode size={15} />
          <span>Gate Scanner</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('manifest')}
          className={`org-checkin-tab-btn ${activeTab === 'manifest' ? 'active' : ''}`}
        >
          <Ticket size={15} />
          <span>Tiers ({byTicketType.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('feed')}
          className={`org-checkin-tab-btn ${activeTab === 'feed' ? 'active' : ''}`}
        >
          <Activity size={15} />
          <span>Gate Feed</span>
          {recentCheckIns.length > 0 && (
            <span className="org-checkin-tab-badge">{recentCheckIns.length}</span>
          )}
        </button>
      </div>

      {/* Main Grid: Scanner (Left), Manifest & Feed (Right) */}
      <div className="org-checkin-grid">
        {/* Scanner Column: Visible on desktop OR when activeTab === 'scanner' on mobile */}
        <div
          className="org-checkin-card"
          style={{
            display: (typeof window !== 'undefined' && window.innerWidth <= 960 && activeTab !== 'scanner') ? 'none' : 'block',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0B1026', margin: '0 0 4px' }}>
              Gate QR Scanner
            </h3>
            <p style={{ fontSize: 12.5, color: '#64748B', margin: 0 }}>
              Point device camera at attendee ticket QR code or laser scan token.
            </p>
          </div>

          {/* Live Device Camera Scanner */}
          <div style={{ marginBottom: 18 }}>
            <CameraQRScanner
              onScan={handleCameraScan}
              paused={validating || Boolean(scanResult && !liveMode)}
              autoStart={false}
            />
          </div>

          {/* Validation Result Box */}
          {scanResult && (
            <div
              style={{
                borderRadius: 14,
                padding: '18px 16px',
                marginBottom: 18,
                textAlign: 'center',
                border: '2px solid',
                borderColor:
                  scanResult.status === 'VALID'
                    ? '#10B981'
                    : scanResult.status === 'USED'
                    ? '#F59E0B'
                    : '#EF4444',
                backgroundColor:
                  scanResult.status === 'VALID'
                    ? '#ECFDF5'
                    : scanResult.status === 'USED'
                    ? '#FFFBEB'
                    : '#FEF2F2',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
                transition: 'all 0.2s ease',
              }}
            >
              {/* Status Icon */}
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  margin: '0 auto 10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor:
                    scanResult.status === 'VALID'
                      ? '#10B981'
                      : scanResult.status === 'USED'
                      ? '#F59E0B'
                      : '#EF4444',
                  color: '#FFFFFF',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.15)',
                }}
              >
                {scanResult.status === 'VALID' ? (
                  <Check size={26} strokeWidth={3} />
                ) : scanResult.status === 'USED' ? (
                  <AlertTriangle size={26} strokeWidth={2.5} />
                ) : (
                  <X size={26} strokeWidth={3} />
                )}
              </div>

              {/* Status Header */}
              <div
                style={{
                  fontSize: 17,
                  fontWeight: 800,
                  letterSpacing: -0.3,
                  color:
                    scanResult.status === 'VALID'
                      ? '#047857'
                      : scanResult.status === 'USED'
                      ? '#B45309'
                      : '#B91C1C',
                }}
              >
                {scanResult.status === 'VALID'
                  ? 'VALID TICKET — ADMIT GUEST ✓'
                  : scanResult.status === 'USED'
                  ? 'ALREADY CHECKED IN'
                  : 'INVALID TICKET / PASS'}
              </div>

              <p style={{ fontSize: 13, margin: '6px 0 12px', color: '#1F2937', fontWeight: 500 }}>
                {scanResult.message}
              </p>

              {/* Auto-advance Countdown Bar in Live Mode */}
              {liveMode && scanResult.status === 'VALID' && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#059669', marginBottom: 4, fontWeight: 600 }}>
                    <span>Continuous Gate Mode</span>
                    <span>Ready for next in 2.5s</span>
                  </div>
                  <div style={{ width: '100%', height: 4, background: '#D1FAE5', borderRadius: 99, overflow: 'hidden' }}>
                    <div className="org-autoadvance-bar" />
                  </div>
                </div>
              )}

              {/* Guest & Pass Manifest Details */}
              {scanResult.ticket && (
                <div
                  style={{
                    fontSize: 12.5,
                    textAlign: 'left',
                    background: '#FFFFFF',
                    borderRadius: 10,
                    padding: '12px 14px',
                    border: '1px solid #E2E8F0',
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                >
                  {scanResult.ticket.owner && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <UserCheck size={14} color="#4F46E5" />
                      <span style={{ fontWeight: 700, color: '#0B1026' }}>Guest:</span>
                      <span style={{ color: '#1E293B' }}>
                        {scanResult.ticket.owner.firstName} {scanResult.ticket.owner.lastName}
                      </span>
                    </div>
                  )}

                  {scanResult.ticket.owner?.email && (
                    <div style={{ fontSize: 11.5, color: '#64748B', paddingLeft: 20 }}>
                      {scanResult.ticket.owner.email}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                    <span>
                      <strong style={{ color: '#0B1026' }}>Tier:</strong> {scanResult.ticket.ticketType || 'Standard'}
                    </span>
                    {scanResult.ticket.format && scanResult.ticket.format !== 'INDIVIDUAL' && (
                      <span style={{ fontSize: 11, background: '#EEF2FF', color: '#4F46E5', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                        {scanResult.ticket.format}
                      </span>
                    )}
                  </div>

                  {scanResult.ticket.admittedCapacity > 1 && (
                    <div style={{ color: '#059669', fontWeight: 600, fontSize: 12 }}>
                      👥 Group Capacity: {scanResult.ticket.attendeesCheckedIn || scanResult.ticket.admittedCapacity} of {scanResult.ticket.admittedCapacity} Admitted
                    </div>
                  )}

                  {scanResult.ticket.tableNumber && (
                    <div style={{ color: '#D97706', fontWeight: 600, fontSize: 12 }}>
                      🍾 Reserved Table: #{scanResult.ticket.tableNumber}
                    </div>
                  )}

                  <div style={{ fontFamily: 'monospace', color: '#64748B', fontSize: 11.5, marginTop: 4, borderTop: '1px dashed #E2E8F0', paddingTop: 6 }}>
                    #{scanResult.ticket.ticketNumber || scanResult.ticket.id}
                  </div>
                </div>
              )}

              {/* Ready for Next Guest Button */}
              <button
                type="button"
                onClick={handleResetScan}
                style={{
                  marginTop: 14,
                  width: '100%',
                  minHeight: 46,
                  borderRadius: 10,
                  border: 'none',
                  backgroundColor: scanResult.status === 'VALID' ? '#10B981' : '#0B1026',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  touchAction: 'manipulation',
                }}
              >
                <RotateCcw size={16} /> Ready for Next Guest
              </button>
            </div>
          )}

          {/* Manual Entry Form */}
          <form onSubmit={handleManualSubmit}>
            <div className="org-form-group" style={{ marginBottom: 12 }}>
              <label className="org-label" style={{ fontSize: 12.5, fontWeight: 600, color: '#334155' }}>
                Manual QR Token / Ticket Number
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  ref={inputRef}
                  className="org-input"
                  style={{
                    fontFamily: 'monospace',
                    fontSize: 16, // 16px avoids iOS Safari auto-zoom
                    height: 44,
                    paddingRight: qrInput ? 36 : 12,
                    borderRadius: 8,
                  }}
                  inputMode="text"
                  placeholder="Paste or type token / #TICK..."
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                />
                {qrInput && (
                  <button
                    type="button"
                    onClick={() => setQrInput('')}
                    style={{
                      position: 'absolute',
                      right: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: '#94A3B8',
                      cursor: 'pointer',
                      padding: 4,
                    }}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={validating || !qrInput.trim()}
              className="org-btn org-btn-primary"
              style={{
                width: '100%',
                minHeight: 44,
                fontSize: 14,
                fontWeight: 700,
                borderRadius: 8,
                touchAction: 'manipulation',
              }}
            >
              {validating ? (
                <>
                  <RefreshCw size={15} className="animate-spin" /> Verifying Admission…
                </>
              ) : (
                'Validate & Check In'
              )}
            </button>
          </form>
        </div>

        {/* Right Column / Tabbed Panels: Tiers Breakdown & Live Activity Feed */}
        <div
          style={{
            display: (typeof window !== 'undefined' && window.innerWidth <= 960 && activeTab === 'scanner') ? 'none' : 'flex',
            flexDirection: 'column',
            gap: 18,
          }}
        >
          {/* Tiers Breakdown Card (Visible on desktop OR when activeTab === 'manifest') */}
          <div
            className="org-card"
            style={{
              display: (typeof window !== 'undefined' && window.innerWidth <= 960 && activeTab !== 'manifest') ? 'none' : 'block',
            }}
          >
            <div className="org-card-header" style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Ticket size={16} color="#4F46E5" />
                <h3 className="org-card-title" style={{ fontSize: 15, margin: 0 }}>
                  Admission By Ticket Tier
                </h3>
              </div>
              <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>
                {byTicketType.reduce((acc, t) => acc + t.checkedIn, 0)} of {stats.totalSold} checked in
              </span>
            </div>

            <div className="org-table-wrap" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table className="org-table" style={{ width: '100%', minWidth: 320 }}>
                <thead>
                  <tr>
                    <th>Tier</th>
                    <th>Sold</th>
                    <th>In</th>
                    <th>Remaining</th>
                    <th>Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {byTicketType.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', color: '#94A3B8', padding: '24px' }}>
                        No tier statistics recorded for this event yet.
                      </td>
                    </tr>
                  ) : (
                    byTicketType.map((tt, i) => {
                      const pct = tt.total > 0 ? Math.round((tt.checkedIn / tt.total) * 100) : 0;
                      return (
                        <tr key={i}>
                          <td style={{ fontWeight: 600, color: '#0B1026', whiteSpace: 'nowrap' }}>
                            {tt.name}
                          </td>
                          <td>{tt.total}</td>
                          <td style={{ color: '#10B981', fontWeight: 700 }}>{tt.checkedIn}</td>
                          <td style={{ color: '#F59E0B' }}>{tt.notArrived}</td>
                          <td style={{ minWidth: 100 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ flex: 1, height: 6, background: '#F1F5F9', borderRadius: 99 }}>
                                <div
                                  style={{
                                    width: `${pct}%`,
                                    height: '100%',
                                    background: pct >= 80 ? '#10B981' : '#4F46E5',
                                    borderRadius: 99,
                                  }}
                                />
                              </div>
                              <span style={{ fontSize: 11, color: '#64748B', minWidth: 26, fontWeight: 600 }}>
                                {pct}%
                              </span>
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

          {/* Live Check-in Activity Feed (Visible on desktop OR when activeTab === 'feed') */}
          <div
            className="org-card"
            style={{
              display: (typeof window !== 'undefined' && window.innerWidth <= 960 && activeTab !== 'feed') ? 'none' : 'block',
            }}
          >
            <div className="org-card-header" style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Activity size={16} color="#10B981" />
                <h3 className="org-card-title" style={{ fontSize: 15, margin: 0 }}>
                  Live Gate Admission Feed
                </h3>
              </div>
              <span className="org-badge org-badge-success" style={{ fontSize: 11, fontWeight: 700 }}>
                ● Active Gate
              </span>
            </div>

            <div style={{ padding: '8px 16px', maxHeight: 380, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
              {recentCheckIns.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#94A3B8', padding: '36px 0', fontSize: 13 }}>
                  Waiting for first guest to scan in at the gate…
                </div>
              ) : (
                recentCheckIns.map((ci) => {
                  const guestName = ci.ticketId?.ownerId
                    ? `${ci.ticketId.ownerId.firstName} ${ci.ticketId.ownerId.lastName}`
                    : 'Registered Guest';
                  const tierName = ci.ticketId?.ticketTypeId?.name || 'Standard Pass';
                  const time = new Date(ci.checkInTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  });

                  return (
                    <div key={ci._id} className="org-activity-item" style={{ padding: '10px 0' }}>
                      <div className="org-activity-dot" style={{ background: '#10B981', flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#0B1026', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {guestName}
                        </div>
                        <div style={{ fontSize: 11.5, color: '#64748B' }}>
                          {tierName} • #{ci.ticketId?.ticketNumber || 'TICK'}
                        </div>
                      </div>
                      <div className="org-activity-time" style={{ fontSize: 11.5, color: '#94A3B8', flexShrink: 0 }}>
                        {time}
                      </div>
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
