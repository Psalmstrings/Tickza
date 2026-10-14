import React, { useState, useEffect } from 'react';
import api from '../../lib/axios.js';
import './organizer.css';
import {
  Settings, Building2, User, Palette, Bell,
  Check, Save, ShieldCheck, AlertCircle
} from 'lucide-react';

const NIGERIAN_BANKS = [
  'Access Bank', 'Citibank Nigeria', 'Ecobank Nigeria', 'Fidelity Bank',
  'First Bank of Nigeria', 'First City Monument Bank (FCMB)', 'Guaranty Trust Bank (GTBank)',
  'Heritage Bank', 'Keystone Bank', 'Kuda Bank', 'Moniepoint MFB', 'OPay', 'Palmpay',
  'Polaris Bank', 'Providus Bank', 'Stanbic IBTC Bank', 'Standard Chartered Bank',
  'Sterling Bank', 'SunTrust Bank', 'Titan Trust Bank', 'Union Bank of Nigeria',
  'United Bank for Africa (UBA)', 'Unity Bank', 'Wema Bank', 'Zenith Bank'
];

export default function OrganizerSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    bankAccount: {
      bankName: 'Guaranty Trust Bank (GTBank)',
      accountNumber: '',
      accountName: '',
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
    }
  });

  useEffect(() => {
    api.get('/organizer/settings')
      .then(({ data }) => {
        if (data.data) {
          setForm(prev => ({
            ...prev,
            firstName: data.data.firstName || '',
            lastName: data.data.lastName || '',
            phone: data.data.phone || '',
            bankAccount: {
              bankName: data.data.bankAccount?.bankName || 'Guaranty Trust Bank (GTBank)',
              accountNumber: data.data.bankAccount?.accountNumber || '',
              accountName: data.data.bankAccount?.accountName || '',
            },
            branding: {
              brandColor: data.data.branding?.brandColor || '#4F46E5',
              logoUrl: data.data.branding?.logoUrl || '',
            }
          }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSavedSuccess(false);

    try {
      await api.put('/organizer/settings', form);
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
          <p className="org-page-subtitle">Manage payout bank details, brand custom identity, notifications, and profile.</p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="org-btn org-btn-primary"
        >
          {savedSuccess ? <Check size={15} /> : <Save size={15} />}
          {saving ? 'Saving…' : savedSuccess ? 'Saved Changes!' : 'Save Settings'}
        </button>
      </div>

      {savedSuccess && (
        <div style={{
          background: '#ECFDF5', border: '1px solid #10B981', color: '#047857',
          padding: '12px 16px', borderRadius: 8, fontSize: 13, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8
        }}>
          <Check size={16} /> All organizer profile and bank settlement settings have been updated.
        </div>
      )}

      {errorMsg && (
        <div style={{
          background: '#FEF2F2', border: '1px solid #EF4444', color: '#B91C1C',
          padding: '12px 16px', borderRadius: 8, fontSize: 13, marginBottom: 20
        }}>
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSave}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Section 1: Settlement Bank Account */}
          <div className="org-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={16} color="#4F46E5" />
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: '#0B1026' }}>
                  Bank Settlement Account (Nigeria)
                </h3>
                <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>Required to receive direct event payouts.</p>
              </div>
            </div>

            <div className="org-form-group">
              <label className="org-label">Settlement Bank</label>
              <select
                className="org-select"
                value={form.bankAccount.bankName}
                onChange={e => setForm({ ...form, bankAccount: { ...form.bankAccount, bankName: e.target.value } })}
              >
                {NIGERIAN_BANKS.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div className="org-form-group">
              <label className="org-label">NUBAN Account Number (10 Digits)</label>
              <input
                className="org-input"
                maxLength={10}
                placeholder="0123456789"
                value={form.bankAccount.accountNumber}
                onChange={e => setForm({ ...form, bankAccount: { ...form.bankAccount, accountNumber: e.target.value.replace(/\D/g, '') } })}
              />
            </div>

            <div className="org-form-group">
              <label className="org-label">Account Beneficiary Name</label>
              <input
                className="org-input"
                placeholder="e.g. Abimbola Events Ltd"
                value={form.bankAccount.accountName}
                onChange={e => setForm({ ...form, bankAccount: { ...form.bankAccount, accountName: e.target.value } })}
              />
            </div>

            <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 8, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
              <ShieldCheck size={18} color="#10B981" />
              <span style={{ fontSize: 12, color: '#475569' }}>
                Account details are verified against the NIBSS directory prior to initiating automated payouts.
              </span>
            </div>
          </div>

          {/* Section 2: Organizer Profile */}
          <div className="org-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                  onChange={e => setForm({ ...form, firstName: e.target.value })}
                />
              </div>
              <div className="org-form-group">
                <label className="org-label">Last Name</label>
                <input
                  className="org-input"
                  value={form.lastName}
                  onChange={e => setForm({ ...form, lastName: e.target.value })}
                />
              </div>
            </div>

            <div className="org-form-group">
              <label className="org-label">Direct Phone / WhatsApp Contact</label>
              <input
                className="org-input"
                placeholder="08012345678"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
              />
            </div>

            <div className="org-form-group" style={{ marginTop: 16 }}>
              <label className="org-label">Brand Primary Accent Color</label>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input
                  type="color"
                  value={form.branding.brandColor}
                  onChange={e => setForm({ ...form, branding: { ...form.branding, brandColor: e.target.value } })}
                  style={{ width: 44, height: 38, border: '1px solid #E2E8F0', borderRadius: 6, cursor: 'pointer', padding: 2 }}
                />
                <input
                  className="org-input"
                  value={form.branding.brandColor}
                  onChange={e => setForm({ ...form, branding: { ...form.branding, brandColor: e.target.value } })}
                  style={{ width: 140, fontFamily: 'monospace' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Notification Alerts */}
        <div className="org-card" style={{ padding: 24, marginTop: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bell size={16} color="#F59E0B" />
            </div>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: '#0B1026' }}>
                Notification Preferences
              </h3>
              <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>Configure triggers for in-app, SMS, and WhatsApp alerts.</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {[
              { id: 'newSale', label: 'New Ticket Purchase', desc: 'Alert whenever a customer buys a ticket.' },
              { id: 'soldOutAlert', label: 'Tier Approaching Sold-Out', desc: 'Alert when a ticket tier reaches 90% capacity.' },
              { id: 'checkInNotice', label: 'Door Gate Check-in Milestones', desc: 'Alert at 50% and 100% door turnout milestones.' },
              { id: 'payoutProcessed', label: 'Payout Settlement Completed', desc: 'Immediate notification when payout reaches your bank.' },
            ].map((n) => (
              <label
                key={n.id}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12, padding: 14,
                  background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0', cursor: 'pointer'
                }}
              >
                <input
                  type="checkbox"
                  style={{ marginTop: 3 }}
                  checked={form.notifications[n.id]}
                  onChange={e => setForm({
                    ...form,
                    notifications: { ...form.notifications, [n.id]: e.target.checked }
                  })}
                />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0B1026' }}>{n.label}</div>
                  <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{n.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
