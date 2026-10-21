import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/axios.js';
import { formatNaira } from '../../lib/currency.js';
import { useToast } from '../../components/ui/Toast.jsx';
import TickzaSpinner from '../../components/ui/TickzaSpinner.jsx';
import './organizer.css';
import {
  Wallet,
    ArrowUpRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  CreditCard,
  ShieldCheck,
  ArrowRight,
  Download,
  Search,
  Filter,
  RefreshCw,
  Plus,
  X,
  FileText,
} from 'lucide-react';

export default function OrganizerPayoutsPage() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('payouts'); // 'payouts' or 'ledger'

  // Payout request modal state
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestAmount, setRequestAmount] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestError, setRequestError] = useState('');

  // Ledger transactions state
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [loadingLedger, setLoadingLedger] = useState(false);
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerTypeFilter, setLedgerTypeFilter] = useState('');

  // Inline bank setup state
  const [showBankSetup, setShowBankSetup] = useState(false);
  const [banksList, setBanksList] = useState([]);
  const [bankForm, setBankForm] = useState({
    bankName: 'Guaranty Trust Bank (GTBank)',
    bankCode: '058',
    accountNumber: '',
    accountName: '',
  });
  const [resolvingBank, setResolvingBank] = useState(false);
  const [bankResolveMsg, setBankResolveMsg] = useState('');
  const [savingBank, setSavingBank] = useState(false);
  const [bankSaveError, setBankSaveError] = useState('');

  const fetchPayoutData = async () => {
    try {
      setLoading(true);
      const { data: res } = await api.get('/organizer/payouts');
      setData(res.data);
    } catch (err) {
      console.error('[Fetch Payouts Error]', err);
      toast.error('Failed to load payouts data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLedgerTransactions = async () => {
    try {
      setLoadingLedger(true);
      const params = new URLSearchParams();
      if (ledgerSearch) params.append('search', ledgerSearch);
      if (ledgerTypeFilter) params.append('type', ledgerTypeFilter);

      const { data: res } = await api.get(`/organizer/financials/transactions?${params.toString()}`);
      setLedgerEntries(res.data || []);
    } catch (err) {
      console.error('[Fetch Ledger Error]', err);
    } finally {
      setLoadingLedger(false);
    }
  };

  const fetchBanksList = async () => {
    try {
      const { data: res } = await api.get('/organizer/payouts/banks');
      if (res.data && res.data.length > 0) setBanksList(res.data);
    } catch {
      // Falls back to empty list; backend already returns curated fallback
    }
  };

  useEffect(() => {
    fetchPayoutData();
    fetchBanksList();
  }, []);

  useEffect(() => {
    if (activeTab === 'ledger') {
      fetchLedgerTransactions();
    }
  }, [activeTab, ledgerSearch, ledgerTypeFilter]);

  const summary = data?.summary || {
    grossRevenue: 0,
    platformFee: 0,
    commissionRate: 10,
    netRevenue: 0,
    available: 0,
    reserved: 0,
    paidOut: 0,
    pending: 0,
    minimumPayoutNaira: 2000,
    bankAccount: null,
  };

  const payouts = data?.payouts || [];
  const bank = summary.bankAccount;
  const isBankVerified = bank && bank.isVerified && bank.accountNumber;

  const handleBankSelectChange = (e) => {
    const selectedName = e.target.value;
    const found = banksList.find((b) => b.name === selectedName);
    setBankForm((prev) => ({
      ...prev,
      bankName: selectedName,
      bankCode: found?.code || '',
      accountName: '',
    }));
    setBankResolveMsg('');
  };

  const handleResolveInlineAccount = async () => {
    if (!bankForm.accountNumber || bankForm.accountNumber.length !== 10) {
      toast.error('Please enter a 10-digit NUBAN account number.');
      return;
    }
    if (!bankForm.bankCode) {
      toast.error('Please select a valid bank.');
      return;
    }
    setResolvingBank(true);
    setBankResolveMsg('');
    setBankSaveError('');
    try {
      const { data: res } = await api.post('/organizer/payouts/resolve-account', {
        accountNumber: bankForm.accountNumber,
        bankCode: bankForm.bankCode,
      });
      if (res.data?.accountName) {
        setBankForm((prev) => ({ ...prev, accountName: res.data.accountName }));
        setBankResolveMsg(`✓ Account verified: ${res.data.accountName}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not verify account. Check bank and account number.');
    } finally {
      setResolvingBank(false);
    }
  };

  const handleSaveInlineBank = async () => {
    if (!bankForm.accountNumber || bankForm.accountNumber.length !== 10) {
      setBankSaveError('Valid 10-digit NUBAN account number is required.');
      return;
    }
    if (!bankForm.bankCode) {
      setBankSaveError('Please select a bank first.');
      return;
    }
    if (!bankForm.accountName?.trim()) {
      setBankSaveError('Please verify your account name first using the "Verify" button.');
      return;
    }

    setSavingBank(true);
    setBankSaveError('');
    try {
      await api.post('/organizer/payouts/bank-account', {
        bankName: bankForm.bankName,
        bankCode: bankForm.bankCode,
        accountNumber: bankForm.accountNumber,
        accountName: bankForm.accountName.trim(),
      });
      toast.success('Bank account saved and registered with Paystack successfully!');
      setShowBankSetup(false);
      fetchPayoutData(); // Refresh to show updated bank details
    } catch (err) {
      setBankSaveError(err.response?.data?.message || 'Failed to save bank account.');
    } finally {
      setSavingBank(false);
    }
  };

  const handleOpenPayoutModal = () => {
    if (!isBankVerified) {
      toast.error('Please configure and verify your settlement bank account before requesting a payout.');
      setShowBankSetup(true);
      return;
    }
    if (summary.available < summary.minimumPayoutNaira) {
      toast.error(
        `Your available balance (₦${summary.available.toLocaleString()}) is below the minimum withdrawal threshold of ₦${summary.minimumPayoutNaira.toLocaleString()}.`
      );
      return;
    }
    setRequestAmount(String(summary.available));
    setRequestError('');
    setShowRequestModal(true);
  };

  const handleConfirmPayoutRequest = async (e) => {
    e.preventDefault();
    const numAmount = Number(requestAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setRequestError('Please enter a valid amount.');
      return;
    }
    if (numAmount < summary.minimumPayoutNaira) {
      setRequestError(`Minimum withdrawal amount is ₦${summary.minimumPayoutNaira.toLocaleString()}.`);
      return;
    }
    if (numAmount > summary.available) {
      setRequestError(`Requested amount exceeds your available balance of ₦${summary.available.toLocaleString()}.`);
      return;
    }

    setSubmittingRequest(true);
    setRequestError('');

    try {
      await api.post('/organizer/payouts/request', {
        amount: numAmount,
      });

      toast.success('Payout request submitted successfully for review.');
      setShowRequestModal(false);
      fetchPayoutData();
    } catch (err) {
      setRequestError(err.response?.data?.message || 'Failed to submit payout request.');
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleExportCSV = () => {
    if (ledgerEntries.length === 0) {
      toast.error('No ledger transactions available to export.');
      return;
    }

    const headers = ['Date', 'Type', 'Direction', 'Amount (NGN)', 'Balance After (NGN)', 'Reference', 'Description'];
    const rows = ledgerEntries.map((entry) => [
      new Date(entry.createdAt).toISOString().split('T')[0],
      entry.type,
      entry.direction,
      (entry.amountKobo / 100).toFixed(2),
      (entry.balanceAfterKobo / 100).toFixed(2),
      `"${entry.idempotencyKey || ''}"`,
      `"${entry.description || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tickza_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };



  return (
    <div className="org-page">
      {/* Header */}
      <div className="org-page-header">
        <div>
          <h1 className="org-page-title">Earnings & Payouts</h1>
          <p className="org-page-subtitle">
            Manage your net event proceeds, Paystack bank transfers, platform commission deductions, and auditable financial ledger.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleOpenPayoutModal}
            className="org-btn org-btn-primary"
            style={{ backgroundColor: '#2457FF', borderColor: '#2457FF' }}
          >
            <Wallet size={16} /> Request Payout
          </button>
          <Link to="/organizer/settings" className="org-btn org-btn-secondary">
            <Building2 size={15} /> Payout Account
          </Link>
        </div>
      </div>

      {/* Financial Highlight Cards */}
      <div className="org-stats-grid" style={{ marginBottom: 24 }}>
        <div className="org-stat-card revenue">
          <div className="org-stat-icon" style={{ background: '#EEF2FF', color: '#4F46E5' }}>
            <Wallet size={18} />
          </div>
          <div className="org-stat-label">Gross Ticket Sales</div>
          <div className="org-stat-value">{formatNaira(summary.grossRevenue)}</div>
          <div className="org-stat-delta positive">All paid orders</div>
        </div>

        <div className="org-stat-card warning">
          <div className="org-stat-icon" style={{ background: '#FEF3C7', color: '#D97706' }}>
            <AlertCircle size={18} />
          </div>
          <div className="org-stat-label">Tickza Commission ({summary.commissionRate}%)</div>
          <div className="org-stat-value" style={{ color: '#D97706' }}>
            -{formatNaira(summary.platformFee)}
          </div>
          <div className="org-stat-delta">Platform infrastructure fee</div>
        </div>

        <div className="org-stat-card success">
          <div className="org-stat-icon" style={{ background: '#ECFDF5', color: '#059669' }}>
            <Wallet size={18} />
          </div>
          <div className="org-stat-label">Net Vendor Earnings</div>
          <div className="org-stat-value" style={{ color: '#16A34A' }}>
            {formatNaira(summary.netRevenue)}
          </div>
          <div className="org-stat-delta">After commission</div>
        </div>

        <div className="org-stat-card info" style={{ border: '2px solid #2457FF' }}>
          <div className="org-stat-icon" style={{ background: '#EFF6FF', color: '#2457FF' }}>
            <ArrowUpRight size={18} />
          </div>
          <div className="org-stat-label" style={{ fontWeight: 800, color: '#1E40AF' }}>
            Available for Withdrawal
          </div>
          <div className="org-stat-value" style={{ color: '#2457FF', fontWeight: 900 }}>
            {formatNaira(summary.available)}
          </div>
          <div className="org-stat-delta" style={{ color: '#1E40AF' }}>
            Min: ₦{summary.minimumPayoutNaira.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Bank Account Callout & Pending Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: 20, marginBottom: 24 }}>
        {/* Payout Bank Overview */}
        <div className="org-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: isBankVerified ? '#ECFDF5' : '#FEF3C7',
                  color: isBankVerified ? '#059669' : '#D97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Building2 size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: '#0B1026' }}>
                  Connected Settlement Account
                </h3>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: isBankVerified ? '#059669' : '#D97706',
                    textTransform: 'uppercase',
                  }}
                >
                  {isBankVerified ? '✓ Verified Paystack Recipient' : '⚠ Action Required'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              {isBankVerified && (
                <button
                  onClick={() => { setShowBankSetup(!showBankSetup); setBankSaveError(''); setBankResolveMsg(''); }}
                  className="org-btn org-btn-secondary org-btn-sm"
                >
                  {showBankSetup ? <><X size={13} /> Cancel</> : 'Update Bank'}
                </button>
              )}
              {!isBankVerified && (
                <button
                  onClick={() => { setShowBankSetup(!showBankSetup); setBankSaveError(''); setBankResolveMsg(''); }}
                  className="org-btn org-btn-primary org-btn-sm"
                  style={{ backgroundColor: '#4F46E5', borderColor: '#4F46E5' }}
                >
                  {showBankSetup ? <><X size={13} /> Cancel</> : <><Plus size={13} /> Add Bank Account</>}
                </button>
              )}
            </div>
          </div>

          {/* Verified Bank Display */}
          {isBankVerified && !showBankSetup && (
            <div
              style={{
                background: '#F8FAFC',
                borderRadius: 10,
                padding: '14px 16px',
                border: '1px solid #E2E8F0',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 12,
              }}
            >
              <div>
                <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>Bank Name</span>
                <p style={{ margin: '2px 0 0', fontSize: 13, fontWeight: 700, color: '#1E293B' }}>
                  {bank.bankName}
                </p>
              </div>
              <div>
                <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>Account Number</span>
                <p style={{ margin: '2px 0 0', fontSize: 13, fontWeight: 700, color: '#1E293B', fontFamily: 'monospace' }}>
                  {bank.accountNumberMasked || `******${bank.accountNumber?.slice(-4)}`}
                </p>
              </div>
              <div>
                <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>Beneficiary Name</span>
                <p style={{ margin: '2px 0 0', fontSize: 13, fontWeight: 700, color: '#1E293B' }}>
                  {bank.accountName}
                </p>
              </div>
            </div>
          )}

          {/* Inline Bank Setup / Update Form */}
          {(showBankSetup || !isBankVerified) && (
            <div
              style={{
                background: '#F8FAFC',
                borderRadius: 10,
                padding: '18px 20px',
                border: '2px solid #E0E7FF',
                marginTop: isBankVerified ? 12 : 0,
              }}
            >
              <h4 style={{ fontSize: 13, fontWeight: 700, color: '#1E293B', margin: '0 0 14px' }}>
                {isBankVerified ? '🔄 Update Settlement Bank Account' : '🏦 Connect Your Settlement Bank Account'}
              </h4>

              {bankResolveMsg && (
                <div style={{ background: '#ECFDF5', border: '1px solid #10B981', color: '#047857', padding: '8px 12px', borderRadius: 6, fontSize: 12, marginBottom: 12 }}>
                  {bankResolveMsg}
                </div>
              )}
              {bankSaveError && (
                <div style={{ background: '#FEF2F2', border: '1px solid #EF4444', color: '#B91C1C', padding: '8px 12px', borderRadius: 6, fontSize: 12, marginBottom: 12 }}>
                  {bankSaveError}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 12 }}>
                <div className="org-form-group" style={{ margin: 0 }}>
                  <label className="org-label" style={{ fontSize: 11 }}>Nigerian Bank *</label>
                  <select
                    className="org-select"
                    value={bankForm.bankName}
                    onChange={handleBankSelectChange}
                    style={{ fontSize: 13 }}
                  >
                    {banksList.length === 0 && (
                      <option value="Guaranty Trust Bank (GTBank)">Guaranty Trust Bank (GTBank)</option>
                    )}
                    {banksList.map((b) => (
                      <option key={b.code || b.name} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div className="org-form-group" style={{ margin: 0 }}>
                  <label className="org-label" style={{ fontSize: 11 }}>NUBAN Account Number (10 digits) *</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input
                      className="org-input"
                      maxLength={10}
                      placeholder="0123456789"
                      value={bankForm.accountNumber}
                      style={{ fontSize: 13 }}
                      onChange={(e) => {
                        setBankForm((prev) => ({ ...prev, accountNumber: e.target.value.replace(/\D/g, ''), accountName: '' }));
                        setBankResolveMsg('');
                        setBankSaveError('');
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleResolveInlineAccount}
                      disabled={resolvingBank || bankForm.accountNumber.length !== 10}
                      className="org-btn org-btn-secondary"
                      style={{ whiteSpace: 'nowrap', fontSize: 12, padding: '0 10px' }}
                    >
                      {resolvingBank ? '…' : 'Verify'}
                    </button>
                  </div>
                </div>
              </div>

              {bankForm.accountName && (
                <div className="org-form-group" style={{ margin: '0 0 12px' }}>
                  <label className="org-label" style={{ fontSize: 11 }}>Verified Account Name</label>
                  <input
                    className="org-input"
                    value={bankForm.accountName}
                    readOnly
                    style={{ background: '#F0FDF4', borderColor: '#86EFAC', fontSize: 13, color: '#166534', fontWeight: 600 }}
                  />
                </div>
              )}

              <button
                type="button"
                onClick={handleSaveInlineBank}
                disabled={savingBank || !bankForm.accountNumber || !bankForm.accountName}
                className="org-btn org-btn-primary"
                style={{ backgroundColor: '#4F46E5', borderColor: '#4F46E5', width: '100%', justifyContent: 'center' }}
              >
                {savingBank ? 'Registering with Paystack…' : <><ShieldCheck size={14} /> Save &amp; Register Bank Account</>}
              </button>
            </div>
          )}

          {/* Unverified prompt when form is hidden */}
          {!isBankVerified && !showBankSetup && (
            <div
              style={{
                background: '#FFFBEB',
                borderRadius: 10,
                padding: '14px 16px',
                border: '1px solid #FDE68A',
                color: '#92400E',
                fontSize: 13,
              }}
            >
              ⚠ You have not connected a verified settlement bank account. Click <strong>Add Bank Account</strong> above to enable direct withdrawals.
            </div>
          )}
        </div>

        {/* Payout Processing Summary */}
        <div className="org-card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 14px', color: '#0B1026' }}>
            Disbursement Metrics
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: '#64748B', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={15} color="#F59E0B" /> Pending / Under Review:
              </span>
              <strong style={{ fontSize: 14, color: '#F59E0B' }}>
                ₦{summary.pending.toLocaleString()}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: '#64748B', display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={15} color="#059669" /> Total Successfully Paid:
              </span>
              <strong style={{ fontSize: 14, color: '#059669' }}>
                ₦{summary.paidOut.toLocaleString()}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2E8F0', paddingTop: 8 }}>
              <span style={{ fontSize: 13, color: '#64748B' }}>Settlement Currency:</span>
              <strong style={{ fontSize: 12, color: '#1E293B', fontFamily: 'monospace' }}>NGN (₦)</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #E2E8F0', marginBottom: 20 }}>
        <button
          onClick={() => setActiveTab('payouts')}
          style={{
            padding: '10px 18px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'payouts' ? '3px solid var(--brand-primary, #2457FF)' : '3px solid transparent',
            color: activeTab === 'payouts' ? 'var(--brand-primary, #2457FF)' : '#64748B',
            fontWeight: activeTab === 'payouts' ? 700 : 500,
            fontSize: 14,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <CreditCard size={16} /> Payout Requests ({payouts.length})
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          style={{
            padding: '10px 18px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'ledger' ? '3px solid var(--brand-primary, #2457FF)' : '3px solid transparent',
            color: activeTab === 'ledger' ? 'var(--brand-primary, #2457FF)' : '#64748B',
            fontWeight: activeTab === 'ledger' ? 700 : 500,
            fontSize: 14,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <FileText size={16} /> Financial Ledger & Audit Trail
        </button>
      </div>

      {/* TAB 1: Payout Requests History */}
      {activeTab === 'payouts' && (
        <div className="org-card">
          <div className="org-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="org-card-title">Withdrawal Requests & Transfer Outcomes</h3>
            <button
              onClick={fetchPayoutData}
              className="org-btn org-btn-secondary org-btn-sm"
              title="Refresh payouts"
            >
              <RefreshCw size={13} /> Refresh
            </button>
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <TickzaSpinner size="md" message="Loading payout history..." />
            </div>
          ) : payouts.length === 0 ? (
            <div className="org-empty" style={{ padding: 48 }}>
              <div className="org-empty-icon"><Wallet size={22} /></div>
              <div className="org-empty-title">No payout requests submitted yet</div>
              <div className="org-empty-subtitle">
                When you have eligible earnings above ₦{summary.minimumPayoutNaira.toLocaleString()}, click "Request Payout" above to initiate a direct withdrawal to your bank.
              </div>
            </div>
          ) : (
            <div className="responsive-table-container">
              <table className="org-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Requested Amount</th>
                    <th>Bank & Account</th>
                    <th>Status</th>
                    <th>Submission Date</th>
                    <th>Details / Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((p) => {
                    let badgeClass = 'org-badge-neutral';
                    if (p.status === 'PAID') badgeClass = 'org-badge-success';
                    if (p.status === 'PROCESSING') badgeClass = 'org-badge-info';
                    if (p.status === 'REJECTED' || p.status === 'FAILED') badgeClass = 'org-badge-error';
                    if (p.status === 'REQUESTED' || p.status === 'UNDER_REVIEW') badgeClass = 'org-badge-warning';

                    const amountNaira = p.amountKobo ? p.amountKobo / 100 : p.netAmount || 0;

                    return (
                      <tr key={p._id}>
                        <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0B1026', fontSize: 13 }}>
                          {p.reference}
                        </td>
                        <td style={{ fontWeight: 800, color: '#0B1026', fontSize: 14 }}>
                          ₦{amountNaira.toLocaleString()}
                        </td>
                        <td>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{p.bankAccount?.bankName || 'Direct Transfer'}</div>
                          <div style={{ fontSize: 11, color: '#64748B', fontFamily: 'monospace' }}>
                            {p.bankAccount?.accountNumberMasked || 'Verified Account'}
                          </div>
                        </td>
                        <td>
                          <span className={`org-badge ${badgeClass}`}>
                            {p.status}
                          </span>
                        </td>
                        <td style={{ color: '#64748B', fontSize: 13 }}>
                          {new Date(p.createdAt).toLocaleDateString()}
                        </td>
                        <td style={{ fontSize: 12, color: '#64748B', maxWidth: 200 }}>
                          {p.rejectionReason ? (
                            <span style={{ color: '#DC2626' }}>Reason: {p.rejectionReason}</span>
                          ) : p.paystackTransferCode ? (
                            <span style={{ fontFamily: 'monospace' }}>Code: {p.paystackTransferCode}</span>
                          ) : (
                            'Pending administrative review'
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
      )}

      {/* TAB 2: Financial Ledger Transactions */}
      {activeTab === 'ledger' && (
        <div className="org-card">
          <div className="org-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <h3 className="org-card-title">Auditable Double-Entry Ledger</h3>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ position: 'relative', width: 200 }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: 11, color: '#94A3B8' }} />
                <input
                  type="text"
                  placeholder="Search description..."
                  value={ledgerSearch}
                  onChange={(e) => setLedgerSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px 8px 30px',
                    borderRadius: 6,
                    border: '1px solid #CBD5E1',
                    fontSize: 12,
                  }}
                />
              </div>

              <select
                value={ledgerTypeFilter}
                onChange={(e) => setLedgerTypeFilter(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '1px solid #CBD5E1',
                  fontSize: 12,
                  backgroundColor: '#FFFFFF',
                }}
              >
                <option value="">All Entry Types</option>
                <option value="TICKET_SALE_NET">Ticket Sale Earnings</option>
                <option value="PAYOUT_RESERVED">Payout Reserved</option>
                <option value="PAYOUT_DISBURSED">Payout Disbursed</option>
                <option value="PAYOUT_RELEASED">Payout Released</option>
                <option value="REFUND_DEDUCTION">Refund Deduction</option>
              </select>

              <button
                onClick={handleExportCSV}
                className="org-btn org-btn-secondary org-btn-sm"
              >
                <Download size={13} /> Export CSV
              </button>
            </div>
          </div>

          {loadingLedger ? (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <TickzaSpinner size="md" message="Loading ledger records..." />
            </div>
          ) : ledgerEntries.length === 0 ? (
            <div className="org-empty" style={{ padding: 40 }}>
              <div className="org-empty-title">No ledger records match the query</div>
            </div>
          ) : (
            <div className="responsive-table-container">
              <table className="org-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Direction</th>
                    <th>Amount</th>
                    <th>Balance After</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {ledgerEntries.map((entry) => {
                    const isCredit = entry.direction === 'CREDIT';
                    const amountNaira = (entry.amountKobo / 100).toLocaleString();
                    const balanceNaira = (entry.balanceAfterKobo / 100).toLocaleString();

                    return (
                      <tr key={entry._id}>
                        <td style={{ fontSize: 12, color: '#64748B' }}>
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: 4,
                              backgroundColor: '#F1F5F9',
                              color: '#334155',
                              fontFamily: 'monospace',
                            }}
                          >
                            {entry.type}
                          </span>
                        </td>
                        <td>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 800,
                              color: isCredit ? '#059669' : '#DC2626',
                            }}
                          >
                            {isCredit ? '+ CREDIT' : '- DEBIT'}
                          </span>
                        </td>
                        <td style={{ fontWeight: 800, color: isCredit ? '#059669' : '#1E293B', fontSize: 13 }}>
                          {isCredit ? `+₦${amountNaira}` : `-₦${amountNaira}`}
                        </td>
                        <td style={{ fontSize: 13, fontWeight: 700, color: '#475569' }}>
                          ₦{balanceNaira}
                        </td>
                        <td style={{ fontSize: 12, color: '#475569', maxWidth: 280 }}>
                          {entry.description}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ===== REQUEST PAYOUT MODAL ===== */}
      {showRequestModal && (
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
          onClick={() => !submittingRequest && setShowRequestModal(false)}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Wallet size={20} color="#059669" />
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0B1026' }}>
                  Request Earnings Payout
                </h3>
              </div>
              <button
                onClick={() => setShowRequestModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={18} />
              </button>
            </div>

            {requestError && (
              <div
                style={{
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #EF4444',
                  color: '#B91C1C',
                  padding: '10px 14px',
                  borderRadius: 8,
                  fontSize: 12,
                  marginBottom: 16,
                }}
              >
                {requestError}
              </div>
            )}

            <form onSubmit={handleConfirmPayoutRequest}>
              <div style={{ backgroundColor: '#F8FAFC', padding: 14, borderRadius: 10, border: '1px solid #E2E8F0', marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748B', marginBottom: 4 }}>
                  <span>Available Balance</span>
                  <strong style={{ color: '#059669', fontSize: 14 }}>
                    ₦{summary.available.toLocaleString()}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748B' }}>
                  <span>Minimum Withdrawal</span>
                  <span>₦{summary.minimumPayoutNaira.toLocaleString()}</span>
                </div>
              </div>

              <div className="org-form-group" style={{ marginBottom: 16 }}>
                <label className="org-label">Withdrawal Amount (₦ NGN) *</label>
                <input
                  type="number"
                  step="100"
                  min={summary.minimumPayoutNaira}
                  max={summary.available}
                  className="org-input"
                  value={requestAmount}
                  onChange={(e) => setRequestAmount(e.target.value)}
                  placeholder="e.g. 50000"
                  required
                />
              </div>

              {/* Bank destination overview */}
              <div style={{ backgroundColor: '#EFF6FF', padding: 12, borderRadius: 8, border: '1px solid #BFDBFE', marginBottom: 20 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#1E40AF', textTransform: 'uppercase' }}>
                  Destination Bank Account
                </span>
                <p style={{ margin: '4px 0 2px', fontSize: 13, fontWeight: 700, color: '#1E3A8A' }}>
                  {bank?.bankName} • {bank?.accountNumberMasked || bank?.accountNumber}
                </p>
                <p style={{ margin: 0, fontSize: 11, color: '#3B82F6' }}>
                  Beneficiary: {bank?.accountName}
                </p>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  className="org-btn org-btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => setShowRequestModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRequest}
                  className="org-btn org-btn-primary"
                  style={{ flex: 1, backgroundColor: '#059669', borderColor: '#059669' }}
                >
                  {submittingRequest ? 'Submitting…' : 'Confirm Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
