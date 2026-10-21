import React, { useState, useEffect } from 'react';
import api from '../../lib/axios.js';
import './organizer.css';
import {
  Settings,
  Building2,
  User,
  Palette,
  Bell,
  Check,
  Save,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

const FALLBACK_BANKS = [
  { name: 'Access Bank', code: '044' },
  { name: 'Citibank Nigeria', code: '023' },
  { name: 'Ecobank Nigeria', code: '050' },
  { name: 'Fidelity Bank', code: '070' },
  { name: 'First Bank of Nigeria', code: '011' },
  { name: 'First City Monument Bank (FCMB)', code: '214' },
  { name: 'Guaranty Trust Bank (GTBank)', code: '058' },
  { name: 'Heritage Bank', code: '030' },
  { name: 'Keystone Bank', code: '082' },
  { name: 'Kuda Bank', code: '50211' },
  { name: 'Moniepoint MFB', code: '50515' },
  { name: 'OPay Digital Services', code: '999992' },
  { name: 'PalmPay', code: '999991' },
  { name: 'Polaris Bank', code: '076' },
  { name: 'Providus Bank', code: '101' },
  { name: 'Stanbic IBTC Bank', code: '221' },
  { name: 'Standard Chartered Bank', code: '068' },
  { name: 'Sterling Bank', code: '232' },
  { name: 'SunTrust Bank', code: '100' },
  { name: 'Titan Trust Bank', code: '102' },
  { name: 'Union Bank of Nigeria', code: '032' },
  { name: 'United Bank for Africa (UBA)', code: '033' },
  { name: 'Unity Bank', code: '215' },
  { name: 'Wema Bank', code: '035' },
  { name: 'Zenith Bank', code: '057' },
];

export default function OrganizerSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resolvingAccount, setResolvingAccount] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [resolveSuccessMsg, setResolveSuccessMsg] = useState('');

  const [banksList, setBanksList] = useState(FALLBACK_BANKS);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    bankAccount: {
      bankName: 'Guaranty Trust Bank (GTBank)',
      bankCode: '058',
      accountNumber: '',
      accountName: '',
      isVerified: false,
    },
    branding: {
      brandColor: '#4F46E5',
      logoUrl: '',
    },
    notifications: {
      newSale: true,
      soldOutAlert: true,
      checkInNotice: true,
      payoutProcessed: true,
    },
  });

  useEffect(() => {
    // 1. Fetch live Nigerian banks from Paystack API
    api
      .get('/organizer/payouts/banks')
      .then(({ data }) => {
        if (data.data && data.data.length > 0) {
          setBanksList(data.data);
        }
      })
      .catch((err) => console.warn('[Banks load warning]', err.message));

    // 2. Fetch current organizer settings
    api
      .get('/organizer/settings')
      .then(({ data }) => {
        if (data.data) {
          const bank = data.data.bankAccount || {};
          setForm((prev) => ({
            ...prev,
            firstName: data.data.firstName || '',
            lastName: data.data.lastName || '',
            phone: data.data.phone || '',
            bankAccount: {
              bankName: bank.bankName || 'Guaranty Trust Bank (GTBank)',
              bankCode: bank.bankCode || '058',
              accountNumber: bank.accountNumber || '',
              accountName: bank.accountName || '',
              isVerified: bank.isVerified || false,
            },
            branding: {
              brandColor: data.data.branding?.brandColor || '#4F46E5',
              logoUrl: data.data.branding?.logoUrl || '',
            },
          }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleBankChange = (e) => {
    const selectedBankName = e.target.value;
    const foundBank = banksList.find((b) => b.name === selectedBankName);
    setForm({
      ...form,
      bankAccount: {
        ...form.bankAccount,
        bankName: selectedBankName,
        bankCode: foundBank?.code || '',
        isVerified: false,
      },
    });
    setResolveSuccessMsg('');
  };

  const handleResolveAccount = async () => {
    const { accountNumber, bankCode } = form.bankAccount;
    if (!accountNumber || accountNumber.length !== 10) {
      setErrorMsg('Please enter a 10-digit NUBAN account number.');
      return;
    }
    if (!bankCode) {
      setErrorMsg('Please select a valid bank.');
      return;
    }

    setResolvingAccount(true);
    setErrorMsg('');
    setResolveSuccessMsg('');

    try {
      const { data } = await api.post('/organizer/payouts/resolve-account', {
        accountNumber,
        bankCode,
      });

      if (data.data?.accountName) {
        setForm((prev) => ({
          ...prev,
          bankAccount: {
            ...prev.bankAccount,
            accountName: data.data.accountName,
            isVerified: true,
          },
        }));
        setResolveSuccessMsg(`Account verified: ${data.data.accountName}`);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Could not verify account name with Paystack.');
    } finally {
      setResolvingAccount(false);
    }
  };

  const [savingBank, setSavingBank] = useState(false);
  const [bankSavedSuccess, setBankSavedSuccess] = useState(false);
  const [bankErrorMsg, setBankErrorMsg] = useState('');

  const handleSaveBankAccount = async () => {
    const { accountNumber, bankCode, bankName, accountName } = form.bankAccount;
    if (!accountNumber || accountNumber.length !== 10) {
      setBankErrorMsg('Please enter a valid 10-digit NUBAN account number.');
      return;
    }
    if (!bankCode) {
      setBankErrorMsg('Please select a valid Nigerian bank.');
      return;
    }
    if (!accountName || !accountName.trim()) {
      setBankErrorMsg('Please verify the account name using the "Verify Name" button first.');
      return;
    }

    setSavingBank(true);
    setBankErrorMsg('');
    setBankSavedSuccess(false);

    try {
      await api.post('/organizer/payouts/bank-account', {
        bankName,
        bankCode,
        accountNumber,
        accountName: accountName.trim() || `${form.firstName} ${form.lastName}`,
      });
      setBankSavedSuccess(true);
      setForm((prev) => ({
        ...prev,
        bankAccount: { ...prev.bankAccount, isVerified: true },
      }));
      setTimeout(() => setBankSavedSuccess(false), 4000);
    } catch (err) {
      setBankErrorMsg(err.response?.data?.message || 'Failed to save bank account. Please try again.');
    } finally {
      setSavingBank(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSavedSuccess(false);

    try {
      // Only update general profile (firstName, lastName, phone, branding)
      // Bank account is saved separately via handleSaveBankAccount
      await api.put('/organizer/settings', {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        branding: form.branding,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };


  return (
    <div className="org-page">
      {/* Header */}
      <div className="org-page-header">
        <div>
          <h1 className="org-page-title">Settings & Configurations</h1>
          <p className="org-page-subtitle">
            Manage payout bank details, brand identity, notifications, and profile.
          </p>
        </div>

        <button onClick={handleSave} disabled={saving} className="org-btn org-btn-primary">
          {savedSuccess ? <Check size={15} /> : <Save size={15} />}
          {saving ? 'Saving…' : savedSuccess ? 'Profile Saved!' : 'Save Profile'}
        </button>
      </div>

      {savedSuccess && (
        <div
          style={{
            background: '#ECFDF5',
            border: '1px solid #10B981',
            color: '#047857',
            padding: '12px 16px',
            borderRadius: 8,
            fontSize: 13,
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Check size={16} /> Organizer profile settings updated successfully.
        </div>
      )}

      {errorMsg && (
        <div
          style={{
            background: '#FEF2F2',
            border: '1px solid #EF4444',
            color: '#B91C1C',
            padding: '12px 16px',
            borderRadius: 8,
            fontSize: 13,
            marginBottom: 20,
          }}
        >
          {errorMsg}
        </div>
      )}

      {resolveSuccessMsg && (
        <div
          style={{
            background: '#EFF6FF',
            border: '1px solid #3B82F6',
            color: '#1E40AF',
            padding: '12px 16px',
            borderRadius: 8,
            fontSize: 13,
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <ShieldCheck size={16} color="#2563EB" /> {resolveSuccessMsg} — Now click "Save Bank Account" to register with Paystack.
        </div>
      )}

      <form onSubmit={handleSave}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          {/* Section 1: Settlement Bank Account */}
          <div className="org-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: '#EEF2FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Building2 size={16} color="#4F46E5" />
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: '#0B1026' }}>
                  Bank Settlement Account (Nigeria)
                </h3>
                <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>
                  Validated via Paystack & NIBSS directory for automated event withdrawals.
                </p>
              </div>
            </div>

            {form.bankAccount.isVerified && (
              <div
                style={{
                  background: '#ECFDF5',
                  border: '1px solid #10B981',
                  borderRadius: 8,
                  padding: '10px 14px',
                  marginBottom: 16,
                  fontSize: 12,
                  color: '#047857',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <ShieldCheck size={14} color="#10B981" />
                ✓ Bank account registered with Paystack Transfers — ready for withdrawals.
              </div>
            )}

            {bankSavedSuccess && (
              <div
                style={{
                  background: '#ECFDF5',
                  border: '1px solid #10B981',
                  color: '#047857',
                  padding: '10px 14px',
                  borderRadius: 8,
                  fontSize: 12,
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Check size={14} /> Bank account saved and registered with Paystack successfully!
              </div>
            )}

            {bankErrorMsg && (
              <div
                style={{
                  background: '#FEF2F2',
                  border: '1px solid #EF4444',
                  color: '#B91C1C',
                  padding: '10px 14px',
                  borderRadius: 8,
                  fontSize: 12,
                  marginBottom: 16,
                }}
              >
                {bankErrorMsg}
              </div>
            )}

            <div className="org-form-group">
              <label className="org-label">Settlement Bank *</label>
              <select
                className="org-select"
                value={form.bankAccount.bankName}
                onChange={handleBankChange}
              >
                {banksList.map((b) => (
                  <option key={b.code || b.name} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="org-form-group">
              <label className="org-label">NUBAN Account Number (10 Digits) *</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="org-input"
                  maxLength={10}
                  placeholder="0123456789"
                  value={form.bankAccount.accountNumber}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      bankAccount: {
                        ...form.bankAccount,
                        accountNumber: e.target.value.replace(/\D/g, ''),
                        isVerified: false,
                      },
                    });
                    setResolveSuccessMsg('');
                    setBankErrorMsg('');
                  }}
                />
                <button
                  type="button"
                  onClick={handleResolveAccount}
                  disabled={resolvingAccount || form.bankAccount.accountNumber.length !== 10}
                  className="org-btn org-btn-secondary"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {resolvingAccount ? 'Verifying…' : 'Verify Name'}
                </button>
              </div>
            </div>

            <div className="org-form-group">
              <label className="org-label">Account Beneficiary Name *</label>
              <input
                className="org-input"
                placeholder="Auto-filled after verification"
                value={form.bankAccount.accountName}
                onChange={(e) =>
                  setForm({
                    ...form,
                    bankAccount: { ...form.bankAccount, accountName: e.target.value },
                  })
                }
              />
            </div>

            <div
              style={{
                background: '#F8FAFC',
                padding: 12,
                borderRadius: 8,
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 16,
              }}
            >
              <ShieldCheck size={18} color="#10B981" />
              <span style={{ fontSize: 12, color: '#475569' }}>
                Bank details are registered with Paystack Transfers to ensure reliable electronic disbursements.
              </span>
            </div>

            <button
              type="button"
              onClick={handleSaveBankAccount}
              disabled={savingBank || !form.bankAccount.accountNumber || !form.bankAccount.accountName}
              className="org-btn org-btn-primary"
              style={{ width: '100%', padding: '11px', backgroundColor: '#4F46E5', borderColor: '#4F46E5' }}
            >
              {savingBank ? (
                'Registering with Paystack…'
              ) : bankSavedSuccess ? (
                <><Check size={14} /> Bank Account Saved!</>
              ) : (
                <><Building2 size={14} /> Save Bank Account</>
              )}
            </button>
          </div>

          {/* Section 2: Organizer Profile */}
          <div className="org-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: '#ECFDF5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <User size={16} color="#10B981" />
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: '#0B1026' }}>
                  Organizer Contact Profile
                </h3>
                <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>Public contact info shown on event receipts.</p>
              </div>
            </div>

            <div className="org-grid-2">
              <div className="org-form-group">
                <label className="org-label">First Name</label>
                <input
                  className="org-input"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                />
              </div>

              <div className="org-form-group">
                <label className="org-label">Last Name</label>
                <input
                  className="org-input"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                />
              </div>
            </div>

            <div className="org-form-group">
              <label className="org-label">Phone Number</label>
              <input
                className="org-input"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+234 800 000 0000"
              />
            </div>

            <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #E2E8F0' }}>
              <button
                type="submit"
                disabled={saving}
                className="org-btn org-btn-primary"
                style={{ width: '100%', padding: '12px' }}
              >
                {saving ? 'Saving Profile…' : 'Save Profile Changes'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
