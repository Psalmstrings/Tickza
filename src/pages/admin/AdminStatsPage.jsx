import React, { useState, useEffect } from 'react';
import { Users, Clock, CheckCircle, XCircle, BarChart3, Calendar, Ticket, ShoppingBag } from 'lucide-react';
import TickzaSpinner from '../../components/ui/TickzaSpinner.jsx';
import api from '../../lib/axios.js';

export default function AdminStatsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin/stats')
      .then(({ data }) => setStats(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const cards = stats
    ? [
        { label: 'Total Users', value: stats.totalUsers, icon: <Users size={22} />, color: '#026CDF', bg: '#EBF3FD' },
        { label: 'Pending Approval', value: stats.pendingUsers, icon: <Clock size={22} />, color: '#D97706', bg: '#FFFBEB' },
        { label: 'Approved Users', value: stats.approvedUsers, icon: <CheckCircle size={22} />, color: '#059669', bg: '#ECFDF5' },
        { label: 'Suspended Accounts', value: stats.suspendedUsers, icon: <XCircle size={22} />, color: '#DC2626', bg: '#FEF2F2' },
        { label: 'Total Events', value: stats.totalEvents, icon: <Calendar size={22} />, color: '#7C3AED', bg: '#F5F3FF' },
        { label: 'Published Events', value: stats.publishedEvents, icon: <BarChart3 size={22} />, color: '#026CDF', bg: '#EBF3FD' },
        { label: 'Total Tickets Issued', value: stats.totalTickets, icon: <Ticket size={22} />, color: '#EA580C', bg: '#FFF7ED' },
        { label: 'Total Orders Placed', value: stats.totalOrders, icon: <ShoppingBag size={22} />, color: '#059669', bg: '#ECFDF5' },
      ]
    : [];

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1F1F1F', margin: '0 0 4px 0' }}>
          Platform Analytics & Metrics
        </h2>
        <p style={{ fontSize: '13px', color: '#6B6B6B', margin: 0 }}>
          High-level operational overview across user status, active catalog, tickets, and fulfillment.
        </p>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center' }}>
          <TickzaSpinner size="md" message="Loading analytics..." />
        </div>
      ) : (
        <div className="admin-stats-grid">
          {cards.map((card) => (
            <div
              key={card.label}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                padding: '16px 18px',
                border: '1px solid #E5E7EB',
                boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                minWidth: 0,
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: card.bg,
                  color: card.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px',
                }}
              >
                {card.icon}
              </div>
              <p style={{ fontSize: 'clamp(22px, 5vw, 28px)', fontWeight: 900, color: '#1F1F1F', margin: '0 0 2px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {card.value ?? 0}
              </p>
              <p style={{ fontSize: '12.5px', fontWeight: 600, color: '#6B7280', margin: 0 }}>{card.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
