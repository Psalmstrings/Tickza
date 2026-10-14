import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/axios.js';
import './organizer.css';
import {
  Wallet, DollarSign, ArrowUpRight, CheckCircle2,
  Clock, AlertCircle, Building2, CreditCard, ShieldAlert,
  ArrowRight, Download
} from 'lucide-react';

export default function OrganizerPayoutsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/organizer/payouts')
      .then(({ data: res }) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const summary = data?.summary || {
    grossRevenue: 0,
    platformFee: 0,
    processingFee: 0,
    netRevenue: 0,
    paidOut: 0,
    pending: 0,
    available: 0,
  };

  const payouts = data?.payouts || [];

  return (
    <div className="org-page">
      {/* Header */}
      <div className="org-page-header">
        <div>
          <h1 className="org-page-title">Payouts & Financial Settlement</h1>
          <p className="org-page-subtitle">Track net proceeds, automated withdrawals, platform fee deductions, and settlement history.</p>
        </div>

        <Link to="/organizer/settings" className="org-btn org-btn-secondary">
          <Building2 size={15} /> Bank Account Settings
        </Link>
      </div>

      {/* Financial Highlight Cards */}
      <div className="org-stats-grid" style={{ marginBottom: 24 }}>
        <div className="org-stat-card revenue">
          <div className="org-stat-icon" style={{ background: '#EEF2FF', color: '#4F46E5' }}>
            <DollarSign size={18} />
          </div>
          <div className="org-stat-label">Gross Ticket Sales</div>
          <div className="org-stat-value">₦{summary.grossRevenue.toLocaleString()}</div>
          <div className="org-stat-delta positive">Total ticket orders</div>
        </div>

        <div className="org-stat-card success">
          <div className="org-stat-icon" style={{ background: '#ECFDF5', color: '#10B981' }}>
            <Wallet size={18} />
          </div>
          <div className="org-stat-label">Net Organizer Revenue</div>
          <div className="org-stat-value" style={{ color: '#10B981' }}>
            ₦{summary.netRevenue.toLocaleString()}
          </div>
          <div className="org-stat-delta">After fees deduction</div>
        </div>

        <div className="org-stat-card warning">
          <div className="org-stat-icon" style={{ background: '#FFFBEB', color: '#F59E0B' }}>
            <Clock size={18} />
          </div>
          <div className="org-stat-label">Pending Settlement</div>
          <div className="org-stat-value" style={{ color: '#F59E0B' }}>
            ₦{summary.pending.toLocaleString()}
          </div>
          <div className="org-stat-delta">In processing queue</div>
        </div>

        <div className="org-stat-card info">
          <div className="org-stat-icon" style={{ background: '#ECFEFF', color: '#0891B2' }}>
            <CheckCircle2 size={18} />
          </div>
          <div className="org-stat-label">Total Disbursed</div>
          <div className="org-stat-value">₦{summary.paidOut.toLocaleString()}</div>
          <div className="org-stat-delta positive">Paid to bank</div>
        </div>
      </div>

      {/* Fee Breakdown & Bank Callout */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
        <div className="org-card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 14px', color: '#0B1026' }}>
            Fee Structure & Transparency
          </h3>
          <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, margin: '0 0 16px' }}>
            Tickza charges transparent, low platform fees to maintain high-speed QR gate scanning, redundant ticket cryptographic security, and automated payouts.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <div style={{ background: '#F8FAFC', borderRadius: 8, padding: 14, border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>Platform Fee (5%)</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0B1026', marginTop: 4 }}>
                ₦{summary.platformFee.toLocaleString()}
              </div>
            </div>

            <div style={{ background: '#F8FAFC', borderRadius: 8, padding: 14, border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>Payment Gateway (1.5%)</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0B1026', marginTop: 4 }}>
                ₦{summary.processingFee.toLocaleString()}
              </div>
            </div>

            <div style={{ background: '#EEF2FF', borderRadius: 8, padding: 14, border: '1px solid #C7D2FE' }}>
              <div style={{ fontSize: 11, color: '#4F46E5', fontWeight: 700, textTransform: 'uppercase' }}>Settlement Balance</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#4F46E5', marginTop: 4 }}>
                ₦{summary.available.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Bank Account Overview */}
        <div className="org-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Building2 size={18} color="#4F46E5" />
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: '#0B1026' }}>Disbursement Target</h3>
          </div>
          <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, margin: '0 0 16px' }}>
            Payouts are deposited automatically to your verified Nigerian settlement account after event conclusion.
          </p>
          <div style={{ background: '#F8FAFC', borderRadius: 8, padding: 14, border: '1px solid #E2E8F0', marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', fontWeight: 600 }}>Connected Account</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0B1026', marginTop: 3 }}>
              Configured in Settings
            </div>
            <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
              Verified Direct Bank Transfer (NIP)
            </div>
          </div>
          <Link to="/organizer/settings" className="org-btn org-btn-secondary org-btn-sm" style={{ width: '100%' }}>
            Update Payout Account <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* Settlement History Table */}
      <div className="org-card">
        <div className="org-card-header">
          <h3 className="org-card-title">Settlement Transfers & History</h3>
        </div>

        {loading ? (
          <div style={{ padding: 24 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="org-skeleton" style={{ height: 44, marginBottom: 8, borderRadius: 6 }} />
            ))}
          </div>
        ) : payouts.length === 0 ? (
          <div className="org-empty" style={{ padding: 48 }}>
            <div className="org-empty-icon"><Wallet size={22} /></div>
            <div className="org-empty-title">No payout records yet</div>
            <div className="org-empty-subtitle">
              Payout transfers are automatically scheduled upon successful completion of your paid events.
            </div>
          </div>
        ) : (
          <div className="org-table-wrap">
            <table className="org-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Reference</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => {
                  let badge = 'org-badge-neutral';
                  if (p.status === 'PAID') badge = 'org-badge-success';
                  if (p.status === 'PROCESSING') badge = 'org-badge-info';
                  if (p.status === 'FAILED') badge = 'org-badge-error';
                  if (p.status === 'PENDING') badge = 'org-badge-warning';

                  return (
                    <tr key={p._id}>
                      <td style={{ fontWeight: 600, color: '#0B1026' }}>
                        {p.eventId?.title || 'General Settlement'}
                      </td>
                      <td style={{ fontWeight: 700, color: '#0B1026' }}>
                        ₦{p.netAmount?.toLocaleString() || 0}
                      </td>
                      <td>
                        <span className={`org-badge ${badge}`}>{p.status}</span>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: 12, color: '#64748B' }}>
                        {p.reference || '—'}
                      </td>
                      <td style={{ color: '#64748B', fontSize: 13 }}>
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
