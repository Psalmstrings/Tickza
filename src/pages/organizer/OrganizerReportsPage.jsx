import React, { useState, useEffect } from 'react';
import api from '../../lib/axios.js';
import './organizer.css';
import {
  FileText, Download, Printer, CheckCircle2,
  DollarSign, Ticket, Users, TrendingUp, ShieldCheck,
  Award, Clock, Calendar
} from 'lucide-react';

export default function OrganizerReportsPage() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/organizer/events')
      .then(({ data }) => {
        const list = data.data || [];
        setEvents(list);
        if (list.length > 0) setSelectedEventId(list[0]._id);
      })
      .catch(() => setEvents([]));
  }, []);

  const fetchReport = async (eventId) => {
    if (!eventId) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/organizer/events/${eventId}/report`);
      setReport(data.data);
    } catch {
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedEventId) fetchReport(selectedEventId);
  }, [selectedEventId]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!report) return;
    const rows = [
      ['Metric', 'Value'],
      ['Event Title', report.event?.title || ''],
      ['Venue', report.event?.venue || ''],
      ['Date', report.event?.startDate ? new Date(report.event.startDate).toLocaleDateString() : ''],
      ['Total Tickets Sold', report.summary?.totalSold || 0],
      ['Paid Tickets Count', report.summary?.paidTicketsCount || 0],
      ['Complimentary Passes', report.summary?.compTicketsCount || 0],
      ['Refunded Orders', report.summary?.refundedCount || 0],
      ['Gross Sales Revenue (NGN)', report.summary?.grossRevenue || 0],
      ['Platform Fee (5%)', report.summary?.platformFee || 0],
      ['Payment Gateway Fee (1.5%)', report.summary?.processingFee || 0],
      ['Net Organizer Revenue', report.summary?.netRevenue || 0],
      ['Guests Checked In', report.summary?.checkedInCount || 0],
      ['No-Shows', report.summary?.noShowCount || 0],
      ['Attendance Rate (%)', `${report.summary?.attendanceRate || 0}%`],
      ['Best Selling Tier', report.summary?.bestSellingTicket || ''],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.map(val => `"${val}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Tickza_Report_${report.event?.title?.replace(/\s+/g, '_') || 'Event'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const summary = report?.summary || {};

  return (
    <div className="org-page">
      {/* Header */}
      <div className="org-page-header">
        <div>
          <h1 className="org-page-title">Post-Event Executive Audit</h1>
          <p className="org-page-subtitle">Comprehensive post-mortem analysis of revenue, door turnout, complimentary allocations, and payouts.</p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <select
            className="org-select"
            style={{ width: 220 }}
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
          >
            {events.map((ev) => (
              <option key={ev._id} value={ev._id}>{ev.title}</option>
            ))}
          </select>

          <button onClick={handlePrint} className="org-btn org-btn-secondary">
            <Printer size={15} /> Print
          </button>

          <button onClick={handleExportCSV} disabled={!report} className="org-btn org-btn-primary">
            <Download size={15} /> Export Audit CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 32 }}>
          <div className="org-skeleton" style={{ height: 240, borderRadius: 12 }} />
        </div>
      ) : !report ? (
        <div className="org-card">
          <div className="org-empty">
            <div className="org-empty-icon"><FileText size={22} /></div>
            <div className="org-empty-title">Select an event to view report</div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Executive Header Banner */}
          <div className="org-card" style={{ padding: 24, background: 'linear-gradient(135deg, #0B1026 0%, #1e2b5e 100%)', color: '#FFF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <span className="org-badge org-badge-cyan" style={{ marginBottom: 8 }}>
                  OFFICIAL AUDIT REPORT
                </span>
                <h2 style={{ fontSize: 22, fontWeight: 800, margin: '4px 0 6px', color: '#FFFFFF' }}>
                  {report.event?.title}
                </h2>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', display: 'flex', gap: 14 }}>
                  <span>📍 {report.event?.venue}</span>
                  <span>📅 {new Date(report.event?.startDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>Net Settled Proceeds</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#22D3EE' }}>
                  ₦{(summary.netRevenue || 0).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Sales & Revenue Breakdown */}
          <div className="org-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px', color: '#0B1026' }}>
              1. Sales & Revenue Breakdown
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 16 }}>
              <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 8, border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: 11.5, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>Gross Revenue</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#0B1026', marginTop: 4 }}>
                  ₦{(summary.grossRevenue || 0).toLocaleString()}
                </div>
              </div>

              <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 8, border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: 11.5, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>Paid Tickets</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#4F46E5', marginTop: 4 }}>
                  {summary.paidTicketsCount || 0}
                </div>
              </div>

              <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 8, border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: 11.5, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>Complimentary Passes</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#F59E0B', marginTop: 4 }}>
                  {summary.compTicketsCount || 0}
                </div>
              </div>

              <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 8, border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: 11.5, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>Best Selling Tier</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#10B981', marginTop: 4 }}>
                  {summary.bestSellingTicket || 'Standard'}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Gate & Attendance Audit */}
          <div className="org-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px', color: '#0B1026' }}>
              2. Venue Gate Attendance Audit
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              <div style={{ background: '#ECFDF5', padding: 16, borderRadius: 8, border: '1px solid #A7F3D0' }}>
                <div style={{ fontSize: 11.5, color: '#047857', fontWeight: 700, textTransform: 'uppercase' }}>Verified Checked In</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#047857', marginTop: 4 }}>
                  {summary.checkedInCount || 0}
                </div>
                <div style={{ fontSize: 12, color: '#065F46', marginTop: 4 }}>{summary.attendanceRate || 0}% manifest arrival rate</div>
              </div>

              <div style={{ background: '#FFFBEB', padding: 16, borderRadius: 8, border: '1px solid #FDE68A' }}>
                <div style={{ fontSize: 11.5, color: '#B45309', fontWeight: 700, textTransform: 'uppercase' }}>No-Shows</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#B45309', marginTop: 4 }}>
                  {summary.noShowCount || 0}
                </div>
                <div style={{ fontSize: 12, color: '#92400E', marginTop: 4 }}>Unchecked ticket holders</div>
              </div>

              <div style={{ background: '#FEF2F2', padding: 16, borderRadius: 8, border: '1px solid #FECACA' }}>
                <div style={{ fontSize: 11.5, color: '#B91C1C', fontWeight: 700, textTransform: 'uppercase' }}>Refunded Passes</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#B91C1C', marginTop: 4 }}>
                  {summary.refundedCount || 0}
                </div>
                <div style={{ fontSize: 12, color: '#991B1B', marginTop: 4 }}>Voided tickets</div>
              </div>
            </div>
          </div>

          {/* Section 3: Financial Settlement Ledger */}
          <div className="org-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px', color: '#0B1026' }}>
              3. Financial Settlement Statement
            </h3>

            <div style={{ border: '1px solid #E2E8F0', borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: '#FAFBFC', borderBottom: '1px solid #E2E8F0', fontSize: 13 }}>
                <span>Gross Ticket Sales</span>
                <strong>₦{(summary.grossRevenue || 0).toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #E2E8F0', fontSize: 13, color: '#64748B' }}>
                <span>Tickza Platform Fee (5.0%)</span>
                <span>- ₦{(summary.platformFee || 0).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #E2E8F0', fontSize: 13, color: '#64748B' }}>
                <span>Payment Processing Fee (1.5%)</span>
                <span>- ₦{(summary.processingFee || 0).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 16px', background: '#F0FDF4', fontSize: 15 }}>
                <strong style={{ color: '#0B1026' }}>Final Net Settlement</strong>
                <strong style={{ color: '#10B981', fontSize: 17 }}>₦{(summary.netRevenue || 0).toLocaleString()}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
