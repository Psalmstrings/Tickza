import React, { useState, useEffect } from 'react';
import api from '../../lib/axios.js';
import './organizer.css';
import {
  Tag, Plus, Trash2, CheckCircle2, XCircle,
  Percent, DollarSign, Calendar, TrendingUp, X
} from 'lucide-react';

export default function OrganizerPromosPage() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [promos, setPromos] = useState([]);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    usageLimit: '',
    perCustomerLimit: '',
    maxDiscountAmount: '',
    minimumOrderAmount: '',
    validFrom: '',
    validUntil: '',
    description: '',
    applicableTicketTypes: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch events
  useEffect(() => {
    api.get('/organizer/events')
      .then(({ data }) => {
        const list = data.data || [];
        setEvents(list);
        if (list.length > 0) setSelectedEventId(list[0]._id);
      })
      .catch(() => setEvents([]));
  }, []);

  // Fetch promos & ticket types for selected event
  const fetchPromos = async (eventId) => {
    if (!eventId) return;
    setLoading(true);
    try {
      const [promosRes, ttRes] = await Promise.all([
        api.get(`/organizer/events/${eventId}/promo-codes`),
        api.get(`/organizer/events/${eventId}/ticket-types`),
      ]);
      setPromos(promosRes.data.data || []);
      setTicketTypes(ttRes.data.data || []);
    } catch {
      setPromos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedEventId) fetchPromos(selectedEventId);
  }, [selectedEventId]);

  const toggleTierSelection = (tierId) => {
    setForm(prev => {
      const exists = prev.applicableTicketTypes.includes(tierId);
      return {
        ...prev,
        applicableTicketTypes: exists
          ? prev.applicableTicketTypes.filter(id => id !== tierId)
          : [...prev.applicableTicketTypes, tierId],
      };
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!form.code || !form.discountValue) {
      setErrorMsg('Code and discount value are required.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/organizer/events/${selectedEventId}/promo-codes`, {
        code: form.code,
        discountType: form.discountType,
        discountValue: parseFloat(form.discountValue),
        usageLimit: form.usageLimit ? parseInt(form.usageLimit, 10) : null,
        perCustomerLimit: form.perCustomerLimit ? parseInt(form.perCustomerLimit, 10) : null,
        maxDiscountAmount: form.maxDiscountAmount ? parseFloat(form.maxDiscountAmount) : null,
        minimumOrderAmount: form.minimumOrderAmount ? parseFloat(form.minimumOrderAmount) : 0,
        validFrom: form.validFrom || null,
        validUntil: form.validUntil || null,
        description: form.description,
        applicableTicketTypes: form.applicableTicketTypes,
      });

      setShowCreateModal(false);
      setForm({
        code: '',
        discountType: 'PERCENTAGE',
        discountValue: '',
        usageLimit: '',
        perCustomerLimit: '',
        maxDiscountAmount: '',
        minimumOrderAmount: '',
        validFrom: '',
        validUntil: '',
        description: '',
        applicableTicketTypes: [],
      });
      fetchPromos(selectedEventId);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create promo code.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (codeId) => {
    if (!window.confirm('Are you sure you want to delete this promo code?')) return;
    try {
      await api.delete(`/organizer/events/${selectedEventId}/promo-codes/${codeId}`);
      fetchPromos(selectedEventId);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete promo code');
    }
  };

  const handleToggleActive = async (promo) => {
    try {
      await api.put(`/organizer/events/${selectedEventId}/promo-codes/${promo._id}`, {
        isActive: !promo.isActive,
      });
      fetchPromos(selectedEventId);
    } catch (err) {
      alert('Failed to update status');
    }
  };

  return (
    <div className="org-page">
      {/* Header */}
      <div className="org-page-header">
        <div>
          <h1 className="org-page-title">Promo Codes & Discounts</h1>
          <p className="org-page-subtitle">Configure percentage discounts, early bird coupons, and campaign analytics.</p>
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

          <button
            onClick={() => setShowCreateModal(true)}
            className="org-btn org-btn-primary"
            disabled={!selectedEventId}
          >
            <Plus size={15} /> Create Promo Code
          </button>
        </div>
      </div>

      {/* Promos Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="org-skeleton" style={{ height: 180, borderRadius: 12 }} />
          ))}
        </div>
      ) : promos.length === 0 ? (
        <div className="org-card">
          <div className="org-empty">
            <div className="org-empty-icon"><Tag size={22} /></div>
            <div className="org-empty-title">No promo codes yet</div>
            <div className="org-empty-subtitle">
              Create special discounts or flash-sale coupon codes to accelerate event ticket sales.
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="org-btn org-btn-primary"
              disabled={!selectedEventId}
            >
              <Plus size={15} /> Create First Promo Code
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {promos.map((p) => {
            const isPct = p.discountType === 'PERCENTAGE';
            const valueLabel = isPct ? `${p.discountValue}% OFF` : `₦${p.discountValue.toLocaleString()} OFF`;

            return (
              <div key={p._id} className="org-card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{
                      fontFamily: 'monospace', fontSize: 18, fontWeight: 800, color: '#0B1026', letterSpacing: 0.5
                    }}>
                      {p.code}
                    </div>
                    <div style={{ fontSize: 13, color: '#4F46E5', fontWeight: 700, marginTop: 2 }}>
                      {valueLabel}
                    </div>
                  </div>

                  <span className={`org-badge ${p.isActive ? 'org-badge-success' : 'org-badge-neutral'}`}>
                    {p.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {p.description && (
                  <p style={{ fontSize: 12.5, color: '#475569', margin: '0 0 12px', lineHeight: 1.4 }}>
                    {p.description}
                  </p>
                )}

                {/* Promo Stats */}
                <div style={{ background: '#F8FAFC', borderRadius: 8, padding: 12, border: '1px solid #E2E8F0', marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: '#475569', marginBottom: 4 }}>
                    <span>Redemptions:</span>
                    <strong style={{ color: '#0B1026' }}>
                      {p.usageCount} {p.usageLimit ? `/ ${p.usageLimit}` : 'uses'}
                    </strong>
                  </div>
                  {p.perCustomerLimit && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: '#475569', marginBottom: 4 }}>
                      <span>Per-Customer:</span>
                      <strong style={{ color: '#0B1026' }}>Max {p.perCustomerLimit} use{p.perCustomerLimit > 1 ? 's' : ''}</strong>
                    </div>
                  )}
                  {p.maxDiscountAmount && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: '#475569', marginBottom: 4 }}>
                      <span>Max Discount Cap:</span>
                      <strong style={{ color: '#0B1026' }}>₦{p.maxDiscountAmount.toLocaleString()}</strong>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: '#475569', marginBottom: 4 }}>
                    <span>Attributed Revenue:</span>
                    <strong style={{ color: '#10B981' }}>
                      ₦{(p.totalRevenue || 0).toLocaleString()}
                    </strong>
                  </div>
                  {Array.isArray(p.applicableTicketTypes) && p.applicableTicketTypes.length > 0 && (
                    <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px dashed #E2E8F0', fontSize: 11.5, color: '#64748B' }}>
                      <span>Applies to {p.applicableTicketTypes.length} specific tier(s)</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: 12 }}>
                  <button
                    onClick={() => handleToggleActive(p)}
                    className="org-btn org-btn-ghost org-btn-sm"
                    style={{ fontSize: 12 }}
                  >
                    {p.isActive ? 'Deactivate' : 'Activate'}
                  </button>

                  <button
                    onClick={() => handleDelete(p._id)}
                    className="org-btn org-btn-danger org-btn-sm"
                    style={{ padding: '0 8px' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Promo Modal */}
      {showCreateModal && (
        <div className="org-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="org-modal" onClick={e => e.stopPropagation()}>
            <div className="org-modal-header">
              <h3 className="org-modal-title">Create Promo Code</h3>
              <button className="org-btn org-btn-ghost org-btn-sm" onClick={() => setShowCreateModal(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="org-modal-body">
                {errorMsg && (
                  <div style={{ background: '#FEF2F2', color: '#DC2626', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 14 }}>
                    {errorMsg}
                  </div>
                )}

                <div className="org-form-group">
                  <label className="org-label">Promo Code (e.g. UNILAG10)</label>
                  <input
                    className="org-input"
                    style={{ textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: 700 }}
                    value={form.code}
                    onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder="SUMMER25"
                    required
                  />
                </div>

                <div className="org-grid-2">
                  <div className="org-form-group">
                    <label className="org-label">Discount Type</label>
                    <select
                      className="org-select"
                      value={form.discountType}
                      onChange={e => setForm({ ...form, discountType: e.target.value })}
                    >
                      <option value="PERCENTAGE">Percentage (%)</option>
                      <option value="FIXED">Fixed Amount (₦)</option>
                    </select>
                  </div>

                  <div className="org-form-group">
                    <label className="org-label">Discount Value</label>
                    <input
                      type="number"
                      step="any"
                      min="1"
                      className="org-input"
                      value={form.discountValue}
                      onChange={e => setForm({ ...form, discountValue: e.target.value })}
                      placeholder={form.discountType === 'PERCENTAGE' ? '15' : '2000'}
                      required
                    />
                  </div>
                </div>

                <div className="org-grid-2">
                  <div className="org-form-group">
                    <label className="org-label">Total Usage Limit (Optional)</label>
                    <input
                      type="number"
                      min="1"
                      className="org-input"
                      value={form.usageLimit}
                      onChange={e => setForm({ ...form, usageLimit: e.target.value })}
                      placeholder="e.g. 100"
                    />
                  </div>

                  <div className="org-form-group">
                    <label className="org-label">Per-Customer Limit (Optional)</label>
                    <input
                      type="number"
                      min="1"
                      className="org-input"
                      value={form.perCustomerLimit}
                      onChange={e => setForm({ ...form, perCustomerLimit: e.target.value })}
                      placeholder="e.g. 1 (1 use per attendee)"
                    />
                  </div>
                </div>

                <div className="org-grid-2">
                  <div className="org-form-group">
                    <label className="org-label">Min. Order Amount (₦)</label>
                    <input
                      type="number"
                      min="0"
                      className="org-input"
                      value={form.minimumOrderAmount}
                      onChange={e => setForm({ ...form, minimumOrderAmount: e.target.value })}
                      placeholder="0"
                    />
                  </div>

                  {form.discountType === 'PERCENTAGE' && (
                    <div className="org-form-group">
                      <label className="org-label">Max Discount Cap (₦, Optional)</label>
                      <input
                        type="number"
                        min="1"
                        className="org-input"
                        value={form.maxDiscountAmount}
                        onChange={e => setForm({ ...form, maxDiscountAmount: e.target.value })}
                        placeholder="e.g. 5000"
                      />
                    </div>
                  )}
                </div>

                {/* Applicable Ticket Tiers */}
                {ticketTypes.length > 0 && (
                  <div className="org-form-group">
                    <label className="org-label">Applicable Ticket Tiers (Optional)</label>
                    <p style={{ fontSize: 12, color: '#64748B', margin: '0 0 8px' }}>
                      Select specific tiers or leave all unselected to apply discount across all tickets.
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {ticketTypes.map(tt => {
                        const isSelected = form.applicableTicketTypes.includes(tt._id);
                        return (
                          <button
                            type="button"
                            key={tt._id}
                            onClick={() => toggleTierSelection(tt._id)}
                            style={{
                              padding: '5px 12px',
                              borderRadius: 6,
                              fontSize: 12.5,
                              fontWeight: 600,
                              cursor: 'pointer',
                              border: isSelected ? '1px solid #4F46E5' : '1px solid #CBD5E1',
                              background: isSelected ? '#EEF2FF' : '#FFFFFF',
                              color: isSelected ? '#4F46E5' : '#334155',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            {isSelected ? '✓ ' : '+ '}
                            {tt.name} (₦{tt.price.toLocaleString()})
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="org-grid-2">
                  <div className="org-form-group">
                    <label className="org-label">Valid From</label>
                    <input
                      type="date"
                      className="org-input"
                      value={form.validFrom}
                      onChange={e => setForm({ ...form, validFrom: e.target.value })}
                    />
                  </div>
                  <div className="org-form-group">
                    <label className="org-label">Valid Until</label>
                    <input
                      type="date"
                      className="org-input"
                      value={form.validUntil}
                      onChange={e => setForm({ ...form, validUntil: e.target.value })}
                    />
                  </div>
                </div>

                <div className="org-form-group">
                  <label className="org-label">Campaign Description</label>
                  <input
                    className="org-input"
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="e.g. Early Bird student campus promo"
                  />
                </div>
              </div>

              <div className="org-modal-footer">
                <button type="button" className="org-btn org-btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="org-btn org-btn-primary">
                  {submitting ? 'Creating…' : 'Create Promo Code'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
