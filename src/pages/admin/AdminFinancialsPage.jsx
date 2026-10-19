import React, { useState, useEffect } from 'react';
import api from '../../lib/axios.js';
import { useToast } from '../../components/ui/Toast.jsx';
import TickzaSpinner from '../../components/ui/TickzaSpinner.jsx';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Settings,
  RefreshCw,
  Search,
  Filter,
  Check,
  X,
  ExternalLink,
  Shield,
  ArrowRight,
} from 'lucide-react';

export default function AdminFinancialsPage() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Settings state
  const [settingsForm, setSettingsForm] = useState({
    commissionRate: 10,
    minimumPayoutNaira: 2000,
    feeBearer: 'VENDOR',
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // Payouts list state
  const [payouts, setPayouts] = useState([]);
  const [loadingPayouts, setLoadingPayouts] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Action modals
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [actionType, setActionType] = useState(null); // 'APPROVE' or 'REJECT'
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingAction, setProcessingAction] = useState(false);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const { data: res } = await api.get('/admin/financials/overview');
      setData(res.data);
      if (res.data?.settings) {
        setSettingsForm({
          commissionRate: res.data.settings.commissionRate,
          minimumPayoutNaira: res.data.settings.minimumPayoutNaira,
          feeBearer: res.data.settings.feeBearer || 'VENDOR',
        });
      }
    } catch (err) {
      console.error('[Admin Financials Error]', err);
      toast.error('Failed to load financial overview.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPayoutsList = async () => {
    try {
      setLoadingPayouts(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (searchQuery) params.append('search', searchQuery);

      const { data: res } = await api.get(`/admin/financials/payouts?${params.toString()}`);
      setPayouts(res.data || []);
    } catch (err) {
      console.error('[Admin Payouts Error]', err);
    } finally {
      setLoadingPayouts(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    fetchPayoutsList();
  }, [statusFilter, searchQuery]);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await api.put('/admin/financials/settings', settingsForm);
      toast.success('Platform commission and financial settings updated successfully.');
      fetchOverview();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update commission settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleOpenActionModal = (payout, type) => {
    setSelectedPayout(payout);
    setActionType(type);
    setRejectionReason('');
  };

  const handleExecuteApproval = async () => {
    if (!selectedPayout) return;
    setProcessingAction(true);
    try {
      const { data: res } = await api.post(`/admin/financials/payouts/${selectedPayout._id}/approve`);
      toast.success(res.message || 'Payout transfer initiated successfully via Paystack.');
      setSelectedPayout(null);
      setActionType(null);
      fetchOverview();
      fetchPayoutsList();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process payout approval.');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleExecuteRejection = async () => {
    if (!selectedPayout) return;
    if (!rejectionReason.trim()) {
      toast.error('Please specify a rejection reason for the vendor.');
      return;
    }

    setProcessingAction(true);
    try {
      await api.post(`/admin/financials/payouts/${selectedPayout._id}/reject`, {
        reason: rejectionReason.trim(),
      });
      toast.success('Payout request rejected. Vendor balance has been safely restored.');
      setSelectedPayout(null);
      setActionType(null);
      fetchOverview();
      fetchPayoutsList();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject payout.');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleRetryPayout = async (payoutId) => {
    try {
      await api.post(`/admin/financials/payouts/${payoutId}/retry`);
      toast.success('Payout marked Under Review. You can now re-attempt approval.');
      fetchPayoutsList();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to retry payout.');
    }
  };

  const metrics = data || {
    totalGrossTicketSales: 0,
    totalPlatformCommission: 0,
    totalProcessingFees: 0,
    totalVendorEarnings: 0,
    totalVendorAvailable: 0,
    totalVendorReserved: 0,
    pendingPayoutRequestsCount: 0,
    pendingPayoutRequestsAmount: 0,
    processingPayoutsAmount: 0,
    completedPayoutsAmount: 0,
    failedPayoutsAmount: 0,
    totalTransactionsCount: 0,
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1F1F1F', margin: '0 0 4px 0' }}>
            Financial Management & Marketplace Settlement
          </h2>
          <p style={{ fontSize: '13px', color: '#6B6B6B', margin: 0 }}>
            Central platform revenue accounting, Tickza commission rules, and Paystack vendor payout approvals.
          </p>
        </div>

        <button
          onClick={() => {
            fetchOverview();
            fetchPayoutsList();
          }}
          className="btn-secondary"
          style={{ padding: '8px 14px', borderRadius: 8, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <RefreshCw size={14} /> Refresh Data
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 14, padding: 18, border: '1px solid #E5E5E5', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#6B6B6B', textTransform: 'uppercase' }}>Gross Ticket Volume</span>
            <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#EFF6FF', color: '#026CDF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={16} />
            </div>
          </div>
          <p style={{ fontSize: 24, fontWeight: 900, color: '#1F1F1F', margin: '0 0 4px 0' }}>
            ₦{metrics.totalGrossTicketSales.toLocaleString()}
          </p>
          <span style={{ fontSize: 11, color: '#059669', fontWeight: 600 }}>{metrics.totalTransactionsCount} paid orders</span>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 14, padding: 18, border: '2px solid #026CDF', boxShadow: '0 2px 8px rgba(2,108,223,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#026CDF', textTransform: 'uppercase' }}>Tickza Net Commission</span>
            <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#EFF6FF', color: '#026CDF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={16} />
            </div>
          </div>
          <p style={{ fontSize: 24, fontWeight: 900, color: '#026CDF', margin: '0 0 4px 0' }}>
            ₦{metrics.totalPlatformCommission.toLocaleString()}
          </p>
          <span style={{ fontSize: 11, color: '#6B6B6B' }}>Platform net revenue</span>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 14, padding: 18, border: '1px solid #E5E5E5', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#6B6B6B', textTransform: 'uppercase' }}>Vendor Earnings Accrued</span>
            <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={16} />
            </div>
          </div>
          <p style={{ fontSize: 24, fontWeight: 900, color: '#059669', margin: '0 0 4px 0' }}>
            ₦{metrics.totalVendorEarnings.toLocaleString()}
          </p>
          <span style={{ fontSize: 11, color: '#6B6B6B' }}>Avail: ₦{metrics.totalVendorAvailable.toLocaleString()}</span>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 14, padding: 18, border: '1px solid #E5E5E5', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#D97706', textTransform: 'uppercase' }}>Pending Payout Requests</span>
            <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#FFFBEB', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={16} />
            </div>
          </div>
          <p style={{ fontSize: 24, fontWeight: 900, color: '#D97706', margin: '0 0 4px 0' }}>
            ₦{metrics.pendingPayoutRequestsAmount.toLocaleString()}
          </p>
          <span style={{ fontSize: 11, color: '#D97706', fontWeight: 600 }}>{metrics.pendingPayoutRequestsCount} request(s) awaiting approval</span>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 14, padding: 18, border: '1px solid #E5E5E5', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>Disbursed Payouts</span>
            <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <p style={{ fontSize: 24, fontWeight: 900, color: '#1F1F1F', margin: '0 0 4px 0' }}>
            ₦{metrics.completedPayoutsAmount.toLocaleString()}
          </p>
          <span style={{ fontSize: 11, color: '#6B6B6B' }}>Paid via Paystack Transfers</span>
        </div>
      </div>

      {/* Main Layout: Commission Configuration & Payout Requests */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2.8fr', gap: 20, alignItems: 'start' }}>
        {/* Commission & Settings Panel */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, border: '1px solid #E5E5E5', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Settings size={18} color="#026CDF" />
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#1F1F1F' }}>
              Commission & Payout Policy
            </h3>
          </div>

          <form onSubmit={handleSaveSettings}>
            <div style={{ marginBottom: 16 }}>
              <label className="input-label" style={{ fontSize: 12, fontWeight: 700 }}>
                Platform Commission Rate (% of paid ticket sales) *
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="50"
                  className="input"
                  value={settingsForm.commissionRate}
                  onChange={(e) => setSettingsForm({ ...settingsForm, commissionRate: Number(e.target.value) })}
                  required
                />
                <span style={{ fontWeight: 800, color: '#4B4B4B' }}>%</span>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: 11, color: '#6B6B6B' }}>
                Applied to all new paid ticket orders. Historical orders preserve their locked rate.
              </p>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label className="input-label" style={{ fontSize: 12, fontWeight: 700 }}>
                Minimum Vendor Payout Threshold (₦ NGN) *
              </label>
              <input
                type="number"
                step="500"
                min="500"
                className="input"
                value={settingsForm.minimumPayoutNaira}
                onChange={(e) => setSettingsForm({ ...settingsForm, minimumPayoutNaira: Number(e.target.value) })}
                required
              />
              <p style={{ margin: '4px 0 0', fontSize: 11, color: '#6B6B6B' }}>
                Vendors must accumulate at least this balance to request a withdrawal.
              </p>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label className="input-label" style={{ fontSize: 12, fontWeight: 700 }}>
                Paystack Gateway Fee Bearer
              </label>
              <select
                className="input"
                value={settingsForm.feeBearer}
                onChange={(e) => setSettingsForm({ ...settingsForm, feeBearer: e.target.value })}
              >
                <option value="VENDOR">Vendor Bears Processing Fee (Standard)</option>
                <option value="PLATFORM">Tickza Absorbs Gateway Fee (Promotional)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={savingSettings}
              className="btn-primary"
              style={{ width: '100%', padding: '10px', borderRadius: 8, fontSize: 13 }}
            >
              {savingSettings ? 'Saving Settings…' : 'Save Commission Rules'}
            </button>
          </form>
        </div>

        {/* Payout Approval Management Table */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 16, border: '1px solid #E5E5E5', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #F0F0F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#1F1F1F' }}>
                Vendor Payout Requests
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6B6B6B' }}>
                Review and disburse electronic transfers via Paystack Transfers API.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #D1D5DB', fontSize: 12, backgroundColor: '#FFFFFF' }}
              >
                <option value="">All Statuses</option>
                <option value="REQUESTED">Requested (New)</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="PROCESSING">Processing</option>
                <option value="PAID">Paid (Completed)</option>
                <option value="REJECTED">Rejected</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
          </div>

          {loadingPayouts ? (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <TickzaSpinner size="md" message="Loading payout requests..." />
            </div>
          ) : payouts.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#6B6B6B' }}>
              <CheckCircle2 size={32} color="#059669" style={{ margin: '0 auto 8px' }} />
              <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>No payout requests matching filter</p>
            </div>
          ) : (
            <div className="responsive-table-container">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                <thead>
                  <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E5E5', color: '#4B5563', fontSize: 12, textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px 16px' }}>Vendor</th>
                    <th style={{ padding: '12px 16px' }}>Reference</th>
                    <th style={{ padding: '12px 16px' }}>Amount</th>
                    <th style={{ padding: '12px 16px' }}>Bank Account</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((p) => {
                    const amountNaira = p.amountKobo ? p.amountKobo / 100 : p.netAmount || 0;
                    const vendor = p.organizerId;
                    const isPending = ['REQUESTED', 'UNDER_REVIEW'].includes(p.status);
                    const isFailed = p.status === 'FAILED';

                    let badgeColor = '#6B7280';
                    let badgeBg = '#F3F4F6';
                    if (p.status === 'PAID') {
                      badgeColor = '#059669';
                      badgeBg = '#ECFDF5';
                    } else if (p.status === 'PROCESSING') {
                      badgeColor = '#2563EB';
                      badgeBg = '#EFF6FF';
                    } else if (p.status === 'REQUESTED' || p.status === 'UNDER_REVIEW') {
                      badgeColor = '#D97706';
                      badgeBg = '#FFFBEB';
                    } else if (p.status === 'REJECTED' || p.status === 'FAILED') {
                      badgeColor = '#DC2626';
                      badgeBg = '#FEF2F2';
                    }

                    return (
                      <tr key={p._id} style={{ borderBottom: '1px solid #F0F0F0' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <strong style={{ color: '#1F1F1F' }}>
                            {vendor?.firstName} {vendor?.lastName}
                          </strong>
                          <div style={{ fontSize: 11, color: '#6B7280' }}>{vendor?.email}</div>
                        </td>
                        <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: 600, color: '#4B5563' }}>
                          {p.reference}
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 800, color: '#1F1F1F' }}>
                          ₦{amountNaira.toLocaleString()}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: 600, fontSize: 12 }}>{p.bankAccount?.bankName}</div>
                          <div style={{ fontSize: 11, color: '#6B7280', fontFamily: 'monospace' }}>
                            {p.bankAccount?.accountNumberMasked} • {p.bankAccount?.accountName}
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span
                            style={{
                              backgroundColor: badgeBg,
                              color: badgeColor,
                              padding: '3px 8px',
                              borderRadius: 4,
                              fontSize: 11,
                              fontWeight: 800,
                              textTransform: 'uppercase',
                            }}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          {isPending && (
                            <div style={{ display: 'inline-flex', gap: 6 }}>
                              <button
                                onClick={() => handleOpenActionModal(p, 'APPROVE')}
                                style={{
                                  backgroundColor: '#059669',
                                  color: '#FFFFFF',
                                  border: 'none',
                                  padding: '5px 10px',
                                  borderRadius: 6,
                                  fontSize: 11,
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                }}
                              >
                                Approve & Pay
                              </button>
                              <button
                                onClick={() => handleOpenActionModal(p, 'REJECT')}
                                style={{
                                  backgroundColor: '#FEF2F2',
                                  color: '#DC2626',
                                  border: '1px solid #FECACA',
                                  padding: '5px 10px',
                                  borderRadius: 6,
                                  fontSize: 11,
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                }}
                              >
                                Reject
                              </button>
                            </div>
                          )}
                          {isFailed && (
                            <button
                              onClick={() => handleRetryPayout(p._id)}
                              style={{
                                backgroundColor: '#EFF6FF',
                                color: '#2563EB',
                                border: '1px solid #BFDBFE',
                                padding: '5px 10px',
                                borderRadius: 6,
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              Retry
                            </button>
                          )}
                          {!isPending && !isFailed && (
                            <span style={{ fontSize: 11, color: '#9CA3AF' }}>Settled</span>
                          )}
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

      {/* ===== ACTION MODAL: APPROVE OR REJECT ===== */}
      {selectedPayout && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={() => !processingAction && setSelectedPayout(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              maxWidth: 460,
              width: '100%',
              padding: 24,
              boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
            }}
          >
            {actionType === 'APPROVE' ? (
              <div>
                <h3 style={{ margin: '0 0 10px 0', fontSize: 18, fontWeight: 800, color: '#059669' }}>
                  Confirm Payout Transfer
                </h3>
                <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                  You are about to approve and initiate a Paystack Transfer of{' '}
                  <strong>
                    ₦{((selectedPayout.amountKobo || 0) / 100 || selectedPayout.netAmount || 0).toLocaleString()}
                  </strong>{' '}
                  to <strong>{selectedPayout.bankAccount?.accountName}</strong> ({selectedPayout.bankAccount?.bankName} • {selectedPayout.bankAccount?.accountNumberMasked}).
                </p>

                <div style={{ backgroundColor: '#F8FAFC', padding: 12, borderRadius: 8, border: '1px solid #E2E8F0', marginBottom: 20 }}>
                  <span style={{ fontSize: 11, color: '#64748B' }}>Paystack Recipient Code:</span>
                  <p style={{ margin: '2px 0 0', fontFamily: 'monospace', fontSize: 12, fontWeight: 700 }}>
                    {selectedPayout.bankAccount?.recipientCode || 'RCP_registered'}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    className="btn-secondary"
                    style={{ flex: 1, padding: '10px', borderRadius: 8 }}
                    onClick={() => setSelectedPayout(null)}
                    disabled={processingAction}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn-primary"
                    style={{ flex: 1, padding: '10px', borderRadius: 8, backgroundColor: '#059669', borderColor: '#059669' }}
                    onClick={handleExecuteApproval}
                    disabled={processingAction}
                  >
                    {processingAction ? 'Initiating Transfer…' : 'Confirm & Disburse'}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h3 style={{ margin: '0 0 10px 0', fontSize: 18, fontWeight: 800, color: '#DC2626' }}>
                  Reject Payout Request
                </h3>
                <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                  The requested amount will be safely unlocked and restored to the vendor's available balance in the ledger.
                </p>

                <div style={{ marginBottom: 16 }}>
                  <label className="input-label">Reason for Rejection *</label>
                  <textarea
                    rows={3}
                    className="input"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="e.g. Account name mismatch or documentation update needed..."
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    className="btn-secondary"
                    style={{ flex: 1, padding: '10px', borderRadius: 8 }}
                    onClick={() => setSelectedPayout(null)}
                    disabled={processingAction}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn-primary"
                    style={{ flex: 1, padding: '10px', borderRadius: 8, backgroundColor: '#DC2626', borderColor: '#DC2626' }}
                    onClick={handleExecuteRejection}
                    disabled={processingAction}
                  >
                    {processingAction ? 'Rejecting…' : 'Confirm Rejection'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
