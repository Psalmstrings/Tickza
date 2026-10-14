import React, { useState, useEffect, useCallback } from 'react';
import api from '../../lib/axios.js';
import './organizer.css';
import {
  ShoppingCart, Search, Download, CheckCircle2,
  Clock, AlertCircle, RotateCcw, ChevronRight, X
} from 'lucide-react';

export default function OrganizerOrdersPage() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [refunding, setRefunding] = useState(false);

  // Load events
  useEffect(() => {
    api.get('/organizer/events')
      .then(({ data }) => {
        const list = data.data || [];
        setEvents(list);
        if (list.length > 0) setSelectedEventId(list[0]._id);
      })
      .catch(() => setEvents([]));
  }, []);

  // Fetch orders for selected event
  const fetchOrders = useCallback(async (evId = selectedEventId, p = 1) => {
    if (!evId) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/organizer/events/${evId}/orders?page=${p}&limit=50`);
      setOrders(data.data || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [selectedEventId]);

  useEffect(() => {
    if (selectedEventId) fetchOrders(selectedEventId, page);
  }, [selectedEventId, page, fetchOrders]);

  // Export Orders CSV
  const handleExportCSV = () => {
    if (orders.length === 0) return;
    const headers = ['Order Number', 'Customer Name', 'Email', 'Total Amount', 'Status', 'Date'];
    const rows = orders.map(o => [
      o.orderNumber || '',
      o.userId ? `${o.userId.firstName} ${o.userId.lastName}` : 'Guest',
      o.userId?.email || '',
      o.totalAmount || 0,
      o.status || '',
      new Date(o.createdAt).toLocaleString(),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Tickza_Orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Refund Order Handler
  const handleProcessRefund = async (orderId) => {
    if (!window.confirm('Are you sure you want to process a refund for this order? This will cancel all associated tickets and notify the customer.')) return;

    setRefunding(true);
    try {
      await api.post(`/organizer/orders/${orderId}/refund`);
      alert('Order successfully marked as refunded.');
      setSelectedOrder(null);
      fetchOrders(selectedEventId, page);
    } catch (err) {
      alert(err.response?.data?.message || 'Refund processing failed.');
    } finally {
      setRefunding(false);
    }
  };

  const filteredOrders = search
    ? orders.filter(o =>
        o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
        o.userId?.email?.toLowerCase().includes(search.toLowerCase()) ||
        `${o.userId?.firstName} ${o.userId?.lastName}`.toLowerCase().includes(search.toLowerCase())
      )
    : orders;

  const totalRevenue = orders.reduce((s, o) => s + (o.status === 'PAID' ? o.totalAmount : 0), 0);

  return (
    <div className="org-page">
      {/* Header */}
      <div className="org-page-header">
        <div>
          <h1 className="org-page-title">Orders & Transactions</h1>
          <p className="org-page-subtitle">View customer transactions, order receipts, payment methods, and handle refunds.</p>
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
            onClick={handleExportCSV}
            className="org-btn org-btn-secondary"
            disabled={orders.length === 0}
          >
            <Download size={15} /> Export Orders CSV
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input
            className="org-input"
            style={{ paddingLeft: 34 }}
            placeholder="Search by order #, customer name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ marginLeft: 'auto', fontSize: 13, color: '#64748B' }}>
          Total Paid: <strong style={{ color: '#10B981', fontSize: 14 }}>₦{totalRevenue.toLocaleString()}</strong>
        </div>
      </div>

      {/* Orders Table */}
      <div className="org-card">
        {loading ? (
          <div style={{ padding: 24 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="org-skeleton" style={{ height: 44, marginBottom: 8, borderRadius: 6 }} />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="org-empty" style={{ padding: 48 }}>
            <div className="org-empty-icon"><ShoppingCart size={22} /></div>
            <div className="org-empty-title">No orders found</div>
            <div className="org-empty-subtitle">
              {search ? 'Try adjusting your search criteria.' : 'When guests purchase tickets for this event, their orders will appear here.'}
            </div>
          </div>
        ) : (
          <div className="org-table-wrap">
            <table className="org-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Items / Tiers</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((o) => {
                  let badge = 'org-badge-success';
                  if (o.status === 'REFUNDED') badge = 'org-badge-purple';
                  if (o.status === 'CANCELLED') badge = 'org-badge-error';
                  if (o.status === 'PENDING') badge = 'org-badge-warning';

                  const customerName = o.userId ? `${o.userId.firstName} ${o.userId.lastName}` : 'Guest User';

                  return (
                    <tr
                      key={o._id}
                      onClick={() => setSelectedOrder(o)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0B1026' }}>
                          #{o.orderNumber || o._id.slice(-6)}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#0B1026' }}>{customerName}</div>
                        <div style={{ fontSize: 11, color: '#94A3B8' }}>{o.userId?.email}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: 13, color: '#475569' }}>
                          {o.items?.map(i => `${i.quantity}x ${i.ticketTypeId?.name || 'Ticket'}`).join(', ') || '1x Pass'}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0B1026' }}>
                          ₦{o.totalAmount?.toLocaleString() || 0}
                        </div>
                      </td>
                      <td>
                        <span className={`org-badge ${badge}`}>{o.status}</span>
                      </td>
                      <td style={{ color: '#64748B', fontSize: 13 }}>
                        {new Date(o.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <ChevronRight size={15} color="#94A3B8" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '16px 20px', borderTop: '1px solid #E2E8F0' }}>
            <button
              className="org-btn org-btn-secondary org-btn-sm"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </button>
            <span style={{ display: 'flex', alignItems: 'center', fontSize: 13, color: '#64748B' }}>
              Page {page} of {pages}
            </span>
            <button
              className="org-btn org-btn-secondary org-btn-sm"
              disabled={page >= pages}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Order Details & Refund Modal */}
      {selectedOrder && (
        <div className="org-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="org-modal" onClick={e => e.stopPropagation()}>
            <div className="org-modal-header">
              <h3 className="org-modal-title">Order #{selectedOrder.orderNumber}</h3>
              <button className="org-btn org-btn-ghost org-btn-sm" onClick={() => setSelectedOrder(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="org-modal-body">
              <div style={{ background: '#F8FAFC', borderRadius: 8, padding: 14, border: '1px solid #E2E8F0', marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: '#64748B' }}>Customer:</span>
                  <strong style={{ color: '#0B1026' }}>
                    {selectedOrder.userId?.firstName} {selectedOrder.userId?.lastName}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: '#64748B' }}>Email:</span>
                  <span style={{ color: '#0B1026' }}>{selectedOrder.userId?.email}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: '#64748B' }}>Date Placed:</span>
                  <span style={{ color: '#0B1026' }}>{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: '#64748B' }}>Status:</span>
                  <span className={`org-badge ${selectedOrder.status === 'PAID' ? 'org-badge-success' : 'org-badge-purple'}`}>
                    {selectedOrder.status}
                  </span>
                </div>
              </div>

              <div style={{ fontSize: 13, fontWeight: 700, color: '#0B1026', marginBottom: 8 }}>Order Items</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px solid #F1F5F9', paddingBottom: 6 }}>
                    <span>{item.quantity}x {item.ticketTypeId?.name || 'Ticket'}</span>
                    <strong>₦{(item.totalPrice || 0).toLocaleString()}</strong>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, paddingTop: 4 }}>
                  <strong>Total Paid</strong>
                  <strong style={{ color: '#10B981' }}>₦{selectedOrder.totalAmount?.toLocaleString()}</strong>
                </div>
              </div>
            </div>

            <div className="org-modal-footer">
              {selectedOrder.status === 'PAID' && (
                <button
                  onClick={() => handleProcessRefund(selectedOrder._id)}
                  disabled={refunding}
                  className="org-btn org-btn-danger"
                >
                  {refunding ? 'Refunding…' : 'Issue Full Refund'}
                </button>
              )}
              <button className="org-btn org-btn-secondary" onClick={() => setSelectedOrder(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
