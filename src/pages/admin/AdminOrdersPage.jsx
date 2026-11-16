import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, RotateCcw, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../../lib/axios.js';
import { formatNaira } from '../../lib/currency.js';

const STATUS_BADGE = {
  PAID:            { bg: '#F0FDF4', color: '#16A34A', label: 'Paid' },
  PENDING:         { bg: '#FFF7ED', color: '#D97706', label: 'Pending' },
  FREE_REGISTERED: { bg: '#EFF6FF', color: '#2563EB', label: 'Free Reg' },
  CANCELLED:       { bg: '#FEF2F2', color: '#DC2626', label: 'Cancelled' },
  REFUNDED:        { bg: '#F3F4F6', color: '#6B7280', label: 'Refunded' },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Refund modal state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [refundReason, setRefundReason] = useState('');
  const [refunding, setRefunding] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const [actionType, setActionType] = useState('success');

  const fetchOrders = () => {
    setLoading(true);
    api.get('/admin/orders')
      .then(({ data }) => {
        const list = Array.isArray(data?.data) ? data.data : Array.isArray(data?.orders) ? data.orders : Array.isArray(data) ? data : [];
        setOrders(list);
      })
      .catch((err) => { console.error(err); setOrders([]); })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleRefund = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setRefunding(true);
    try {
      await api.post(`/admin/orders/${selectedOrder._id}/refund`, {
        reason: refundReason || 'Administrator refund processed',
      });
      setActionType('success');
      setActionMsg(`Order #${selectedOrder.orderNumber} successfully refunded and inventory restored.`);
      setSelectedOrder(null);
      setRefundReason('');
      fetchOrders();
    } catch (err) {
      setActionType('error');
      setActionMsg(err.response?.data?.message || 'Failed to process refund');
    } finally {
      setRefunding(false);
      setTimeout(() => setActionMsg(''), 4000);
    }
  };

  const safeOrders = Array.isArray(orders) ? orders : [];
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  // Filtered orders
  const filteredOrders = safeOrders.filter((o) => {
    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    const query = search.trim().toLowerCase();
    const matchesSearch = !query ||
      (o.orderNumber && o.orderNumber.toLowerCase().includes(query)) ||
      (o.userId?.email && o.userId.email.toLowerCase().includes(query)) ||
      (o.eventId?.title && o.eventId.title.toLowerCase().includes(query));
    return matchesStatus && matchesSearch;
  });

  // Summary stats
  const totalRevenue = safeOrders.filter(o => o.status === 'PAID').reduce((s, o) => s + (o.totalAmount || 0), 0);
  const paidCount = safeOrders.filter(o => o.status === 'PAID').length;
  const refundedCount = safeOrders.filter(o => o.status === 'REFUNDED').length;

  return (
    <div style={{ padding: '8px 0 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <ShoppingBag size={22} color="#1F1F1F" />
          <h2 style={{ color: '#1F1F1F', fontSize: '22px', fontWeight: 800, margin: 0 }}>Orders & Financial Operations</h2>
        </div>
        <p style={{ color: '#6B6B6B', fontSize: '14px', margin: 0 }}>{safeOrders.length} order{safeOrders.length !== 1 ? 's' : ''} total recorded across platform</p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Total Orders', value: safeOrders.length, color: '#1F1F1F' },
          { label: 'Paid Orders', value: paidCount, color: '#16A34A' },
          { label: 'Refunded Orders', value: refundedCount, color: '#6B7280' },
          { label: 'Gross Revenue', value: totalRevenue === 0 ? '₦0' : formatNaira(totalRevenue), color: 'var(--brand-primary, #2457FF)' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: '8px', padding: '16px 18px' }}>
            <p style={{ color, fontSize: '22px', fontWeight: 800, margin: '0 0 2px' }}>{value}</p>
            <p style={{ color: '#6B6B6B', fontSize: '12px', margin: 0, fontWeight: 500 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Action Notification */}
      {actionMsg && (
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E5E5E5',
          borderLeft: `4px solid ${actionType === 'success' ? '#16A34A' : '#DC2626'}`,
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: actionType === 'success' ? '#15803D' : '#DC2626',
          fontSize: '13px',
          fontWeight: 600,
        }}>
          <span>{actionMsg}</span>
          <button onClick={() => setActionMsg('')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Filters & Search */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: '8px', padding: '14px 16px', marginBottom: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px', maxWidth: '380px' }}>
          <Search size={16} color="#9CA3AF" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by order #, buyer email, or event title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '9px 12px 9px 36px', border: '1px solid #E5E5E5', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {['ALL', 'PAID', 'PENDING', 'FREE_REGISTERED', 'REFUNDED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #E5E5E5',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                background: statusFilter === st ? 'var(--brand-primary, #2457FF)' : '#FFFFFF',
                color: statusFilter === st ? '#FFFFFF' : '#4B5563',
                transition: 'all 0.15s ease',
              }}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: '8px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#6B6B6B', fontSize: '14px' }}>Loading orders…</div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <ShoppingBag size={32} color="#D1D5DB" style={{ marginBottom: '10px' }} />
            <p style={{ color: '#6B6B6B', fontSize: '14px', margin: 0 }}>No matching orders found</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E5E5' }}>
                  {['Order #', 'Buyer', 'Event', 'Qty', 'Total', 'Status', 'Date', 'Action'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#6B6B6B', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(o => {
                  const badge = STATUS_BADGE[o.status] || { bg: '#F3F4F6', color: '#6B7280', label: o.status };
                  const isRefundable = o.status === 'PAID' || o.status === 'FREE_REGISTERED';

                  return (
                    <tr key={o._id} style={{ borderBottom: '1px solid #F3F4F6', transition: 'background 0.1s' }} onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: '12px', color: '#1F1F1F', fontWeight: 600, whiteSpace: 'nowrap' }}>{o.orderNumber}</td>
                      <td style={{ padding: '14px 16px', color: '#4B5563', fontSize: '13px' }}>
                        {o.userId?.email || '—'}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#1F1F1F', fontWeight: 600, fontSize: '14px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {o.eventId?.title || o.items?.[0]?.eventId?.title || '—'}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#4B5563', fontSize: '13px', textAlign: 'center' }}>
                        {o.items?.reduce((sum, it) => sum + (it.quantity || 1), 0) || o.quantity || 1}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#1F1F1F', fontWeight: 700, fontSize: '14px', whiteSpace: 'nowrap' }}>
                        {o.totalAmount === 0 ? 'FREE' : formatNaira(o.totalAmount || 0)}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ display: 'inline-block', background: badge.bg, color: badge.color, padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap' }}>
                          {badge.label}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#6B6B6B', fontSize: '13px', whiteSpace: 'nowrap' }}>{formatDate(o.createdAt)}</td>
                      <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                        {isRefundable ? (
                          <button
                            onClick={() => setSelectedOrder(o)}
                            style={{
                              padding: '5px 10px',
                              background: '#FEF2F2',
                              border: '1px solid #FECACA',
                              borderRadius: '6px',
                              color: '#DC2626',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <RotateCcw size={13} />
                            Refund
                          </button>
                        ) : (
                          <span style={{ color: '#9CA3AF', fontSize: '12px' }}>—</span>
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

      {/* Admin Refund Confirmation Modal */}
      {selectedOrder && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '24px',
        }} onClick={() => setSelectedOrder(null)}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            padding: '28px',
            width: '100%',
            maxWidth: '460px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <RotateCcw size={18} color="#DC2626" />
                </div>
                <h3 style={{ color: '#1F1F1F', fontSize: '18px', fontWeight: 800, margin: 0 }}>Refund Order</h3>
              </div>
              <button onClick={() => setSelectedOrder(null)} style={{ background: '#F5F5F5', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} color="#6B6B6B" />
              </button>
            </div>

            <p style={{ color: '#4B5563', fontSize: '14px', lineHeight: 1.5, margin: '0 0 16px' }}>
              You are processing an administrative refund for order <strong>#{selectedOrder.orderNumber}</strong> ({formatNaira(selectedOrder.totalAmount)}).
              This will invalidate all issued tickets, restore available ticket tier inventory, reverse the organizer net share ledger, and notify the customer.
            </p>

            <form onSubmit={handleRefund}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', color: '#1F1F1F', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Refund Reason (included in audit record & customer notification)
                </label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="e.g. Customer requested cancellation, event rescheduled, dispute resolution..."
                  rows={3}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  disabled={refunding}
                  style={{
                    padding: '10px 18px',
                    background: '#FFFFFF',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#374151',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={refunding}
                  style={{
                    padding: '10px 20px',
                    background: '#DC2626',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    cursor: refunding ? 'not-allowed' : 'pointer',
                    opacity: refunding ? 0.7 : 1,
                  }}
                >
                  {refunding ? 'Processing Refund...' : 'Confirm Refund'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
