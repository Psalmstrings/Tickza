import React, { useState, useEffect } from 'react';
import api from '../../lib/axios.js';
import './organizer.css';
import {
  UserCog, Plus, Trash2, Mail, Shield, CheckCircle2,
  Clock, X, Edit, Info
} from 'lucide-react';

const ROLE_DEFINITIONS = [
  { role: 'MANAGER', label: 'Manager', badge: 'org-badge-info', desc: 'Can manage events, ticket tiers, orders, and view attendees.' },
  { role: 'CHECKIN_STAFF', label: 'Check-in Staff', badge: 'org-badge-success', desc: 'Authorized strictly for QR gate scanning and verifying guest entry.' },
  { role: 'FINANCE', label: 'Finance', badge: 'org-badge-warning', desc: 'Access to revenue reports, order transactions, and payout settlements.' },
  { role: 'MARKETING', label: 'Marketing', badge: 'org-badge-cyan', desc: 'Access to promo codes, social campaigns, and guest referral links.' },
];

export default function OrganizerTeamPage() {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  // Invite Modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [form, setForm] = useState({ email: '', firstName: '', lastName: '', role: 'CHECKIN_STAFF' });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/organizer/team');
      setTeam(data.data || []);
    } catch {
      setTeam([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleInvite = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!form.email) {
      setErrorMsg('Email is required.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/organizer/team', form);
      setShowInviteModal(false);
      setForm({ email: '', firstName: '', lastName: '', role: 'CHECKIN_STAFF' });
      fetchTeam();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to invite team member.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this staff member?')) return;
    try {
      await api.delete(`/organizer/team/${memberId}`);
      fetchTeam();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove member');
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    try {
      await api.put(`/organizer/team/${memberId}`, { role: newRole });
      fetchTeam();
    } catch (err) {
      alert('Failed to update role');
    }
  };

  return (
    <div className="org-page">
      {/* Header */}
      <div className="org-page-header">
        <div>
          <h1 className="org-page-title">Team & Staff Roles</h1>
          <p className="org-page-subtitle">Delegate gate scanning, marketing campaigns, and financial management with strict RBAC access.</p>
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="org-btn org-btn-primary"
        >
          <Plus size={15} /> Invite Staff Member
        </button>
      </div>

      {/* Role Guide Callout */}
      <div className="org-card" style={{ padding: 18, marginBottom: 24, background: '#F8FAFC' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Shield size={16} color="#4F46E5" />
          <h4 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: '#0B1026' }}>
            Role-Based Access Control (RBAC) Permissions
          </h4>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          {ROLE_DEFINITIONS.map((r, i) => (
            <div key={i} style={{ background: '#FFFFFF', borderRadius: 8, padding: 12, border: '1px solid #E2E8F0' }}>
              <span className={`org-badge ${r.badge}`} style={{ marginBottom: 6 }}>
                {r.label}
              </span>
              <p style={{ fontSize: 12, color: '#475569', margin: 0, lineHeight: 1.4 }}>
                {r.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Team Table */}
      <div className="org-card">
        <div className="org-card-header">
          <h3 className="org-card-title">Staff Manifest ({team.length})</h3>
        </div>

        {loading ? (
          <div style={{ padding: 24 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="org-skeleton" style={{ height: 44, marginBottom: 8, borderRadius: 6 }} />
            ))}
          </div>
        ) : team.length === 0 ? (
          <div className="org-empty" style={{ padding: 48 }}>
            <div className="org-empty-icon"><UserCog size={22} /></div>
            <div className="org-empty-title">No staff added yet</div>
            <div className="org-empty-subtitle">
              Add check-in scanners or managers so your event runs smoothly without sharing account passwords.
            </div>
            <button
              onClick={() => setShowInviteModal(true)}
              className="org-btn org-btn-primary"
            >
              <Plus size={15} /> Invite First Staff Member
            </button>
          </div>
        ) : (
          <div className="org-table-wrap">
            <table className="org-table">
              <thead>
                <tr>
                  <th>Staff Member</th>
                  <th>Email</th>
                  <th>Current Role</th>
                  <th>Status</th>
                  <th>Invited Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {team.map((m) => {
                  const roleDef = ROLE_DEFINITIONS.find(r => r.role === m.role) || { label: m.role, badge: 'org-badge-neutral' };
                  return (
                    <tr key={m._id}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#0B1026' }}>
                          {m.firstName ? `${m.firstName} ${m.lastName}` : 'Invited Staff'}
                        </div>
                      </td>
                      <td style={{ color: '#475569', fontSize: 13 }}>{m.email}</td>
                      <td>
                        <select
                          className="org-select"
                          style={{ height: 30, padding: '0 24px 0 8px', fontSize: 12, width: 140 }}
                          value={m.role}
                          onChange={(e) => handleRoleChange(m._id, e.target.value)}
                        >
                          {ROLE_DEFINITIONS.map(r => (
                            <option key={r.role} value={r.role}>{r.label}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <span className={`org-badge ${m.status === 'ACTIVE' ? 'org-badge-success' : 'org-badge-warning'}`}>
                          {m.status === 'ACTIVE' ? 'Active' : 'Pending Invite'}
                        </span>
                      </td>
                      <td style={{ color: '#64748B', fontSize: 13 }}>
                        {new Date(m.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => handleRemove(m._id)}
                          className="org-btn org-btn-danger org-btn-sm"
                          style={{ padding: '0 8px' }}
                          title="Remove Staff"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invite Staff Modal */}
      {showInviteModal && (
        <div className="org-overlay" onClick={() => setShowInviteModal(false)}>
          <div className="org-modal" onClick={e => e.stopPropagation()}>
            <div className="org-modal-header">
              <h3 className="org-modal-title">Invite Team Member</h3>
              <button className="org-btn org-btn-ghost org-btn-sm" onClick={() => setShowInviteModal(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleInvite}>
              <div className="org-modal-body">
                {errorMsg && (
                  <div style={{ background: '#FEF2F2', color: '#DC2626', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 14 }}>
                    {errorMsg}
                  </div>
                )}

                <div className="org-grid-2">
                  <div className="org-form-group">
                    <label className="org-label">First Name (Optional)</label>
                    <input
                      className="org-input"
                      value={form.firstName}
                      onChange={e => setForm({ ...form, firstName: e.target.value })}
                      placeholder="e.g. Tunde"
                    />
                  </div>
                  <div className="org-form-group">
                    <label className="org-label">Last Name (Optional)</label>
                    <input
                      className="org-input"
                      value={form.lastName}
                      onChange={e => setForm({ ...form, lastName: e.target.value })}
                      placeholder="e.g. Adebayo"
                    />
                  </div>
                </div>

                <div className="org-form-group">
                  <label className="org-label">Email Address</label>
                  <input
                    type="email"
                    className="org-input"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="staff@example.com"
                    required
                  />
                </div>

                <div className="org-form-group">
                  <label className="org-label">Assigned Role</label>
                  <select
                    className="org-select"
                    value={form.role}
                    onChange={e => setForm({ ...form, role: e.target.value })}
                  >
                    {ROLE_DEFINITIONS.map(r => (
                      <option key={r.role} value={r.role}>{r.label} — {r.desc.slice(0, 48)}…</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="org-modal-footer">
                <button type="button" className="org-btn org-btn-secondary" onClick={() => setShowInviteModal(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="org-btn org-btn-primary">
                  {submitting ? 'Sending Invite…' : 'Send Staff Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
