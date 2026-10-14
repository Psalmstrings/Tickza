import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../lib/axios.js';
import {
  TrendingUp, Ticket, Users, Calendar,
  ArrowUpRight, ArrowRight, AlertCircle,
  DollarSign, BarChart2, Activity, Clock, Zap,
} from 'lucide-react';
import { getEventImageUrl, handleImageFallback } from '../../lib/imageHelper.js';

const RANGES = [
  { label: 'Today', value: '1' },
  { label: '7 Days', value: '7' },
  { label: '30 Days', value: '30' },
  { label: 'This Year', value: '365' },
];

function StatCard({ label, value, icon: Icon, variant = 'revenue', delta, sub, loading }) {
  return (
    <div className={`org-stat-card ${variant}`}>
      {Icon && (
        <div className="org-stat-icon">
          <Icon size={16} />
        </div>
      )}
      <div className="org-stat-label">{label}</div>
      {loading ? (
        <div className="org-skeleton" style={{ height: 32, width: '60%', marginBottom: 6 }} />
      ) : (
        <div className="org-stat-value">{value}</div>
      )}
      {sub && <div className="org-stat-delta">{sub}</div>}
    </div>
  );
}

function EventStatusBadge({ status }) {
  const map = {
    PUBLISHED: { cls: 'org-badge-success', label: 'Published' },
    DRAFT:     { cls: 'org-badge-neutral', label: 'Draft' },
    ENDED:     { cls: 'org-badge-info',    label: 'Ended' },
    SUSPENDED: { cls: 'org-badge-error',   label: 'Cancelled' },
    PENDING_APPROVAL: { cls: 'org-badge-warning', label: 'Pending' },
  };
  const { cls, label } = map[status] || { cls: 'org-badge-neutral', label: status };
  return <span className={`org-badge ${cls}`}>{label}</span>;
}

function formatNGN(amount) {
  if (amount >= 1_000_000) return `₦${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `₦${(amount / 1_000).toFixed(1)}K`;
  return `₦${amount.toLocaleString()}`;
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function MiniBarChart({ data, height = 60 }) {
  if (!data || data.length === 0) return (
    <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: 12 }}>
      No data
    </div>
  );
  const max = Math.max(...data.map(d => d.count || d.revenue || 0), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height }}>
      {data.slice(-14).map((d, i) => {
        const val = d.count || d.revenue || 0;
        const h = Math.max(2, (val / max) * height);
        return (
          <div
            key={i}
            title={`${d._id}: ${val}`}
            style={{
              flex: 1, height: h,
              background: 'linear-gradient(180deg, #4F46E5, #7C3AED)',
              borderRadius: 3, opacity: 0.7 + (i / data.length) * 0.3,
            }}
          />
        );
      })}
    </div>
  );
}

export default function OrganizerOverviewPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [range, setRange] = useState('30');
  const [overview, setOverview] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const isApproved = user?.status === 'APPROVED' || user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  const fetchData = async (r) => {
    setLoading(true);
    // Run all three requests independently so a single failure doesn't wipe all data
    const [ovResult, anResult, evResult] = await Promise.allSettled([
      api.get(`/organizer/overview?range=${r}`),
      api.get(`/organizer/analytics?range=${r}`),
      api.get('/organizer/events?limit=5'),
    ]);
    setOverview(ovResult.status === 'fulfilled' ? ovResult.value.data.data : null);
    setAnalytics(anResult.status === 'fulfilled' ? anResult.value.data.data : null);
    setEvents(evResult.status === 'fulfilled' ? (evResult.value.data.data || []) : []);
    setLoading(false);
  };

  useEffect(() => { fetchData(range); }, [range]);

  const greeting = `${getGreeting()}, ${user?.firstName || 'there'} 👋`;

  if (!isApproved) {
    return (
      <div className="org-page">
        <div className="org-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{
            background: 'linear-gradient(135deg, #0B1026 0%, #1e2b5e 100%)',
            padding: '48px 32px',
            textAlign: 'center',
          }}>
            <div style={{
              width: 56, height: 56,
              background: 'rgba(79,70,229,0.3)',
              borderRadius: 14, margin: '0 auto 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Zap size={24} color="#A5B4FC" />
            </div>
            <h2 style={{ color: '#FFFFFF', fontSize: 22, fontWeight: 700, margin: '0 0 10px', letterSpacing: -0.5 }}>
              Account Pending Approval
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.6, maxWidth: 420, margin: '0 auto' }}>
              Your account is currently under review. Once approved, you'll have full access to the organizer dashboard to create events, manage tickets, and track sales.
            </p>
            <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/home" className="org-btn org-btn-secondary" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#FFF' }}>
                Browse Events
              </Link>
              <Link to="/tickets" className="org-btn org-btn-primary">
                My Tickets
              </Link>
            </div>
          </div>

          <div style={{ padding: '24px 32px', borderTop: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              {['Event Creation', 'Ticket Management', 'Sales Analytics', 'QR Check-in', 'Payout Processing'].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#475569', fontSize: 13.5 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#E2E8F0' }} />
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="org-page">
      {/* Welcome Row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0B1026', margin: '0 0 4px', letterSpacing: -0.4 }}>{greeting}</h1>
          <p style={{ fontSize: 13.5, color: '#475569', margin: 0 }}>Here's what's happening with your events.</p>
        </div>

        {/* Date Range Filter */}
        <div style={{ display: 'flex', gap: 4, background: '#F1F5F9', borderRadius: 9, padding: 3 }}>
          {RANGES.map(r => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              style={{
                padding: '6px 14px',
                borderRadius: 7,
                border: 'none',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
                background: range === r.value ? '#FFFFFF' : 'transparent',
                color: range === r.value ? '#0B1026' : '#64748B',
                boxShadow: range === r.value ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="org-stats-grid" style={{ marginBottom: 24 }}>
        <StatCard
          label="Total Revenue"
          value={overview ? formatNGN(overview.totalRevenue) : '₦0'}
          icon={DollarSign}
          variant="revenue"
          loading={loading}
          sub={<><ArrowUpRight size={12} /> from ticket sales</>}
        />
        <StatCard
          label="Tickets Sold"
          value={loading ? '—' : (overview?.ticketsSold || 0).toLocaleString()}
          icon={Ticket}
          variant="success"
          loading={loading}
          sub={`${overview?.upcomingEvents || 0} upcoming events`}
        />
        <StatCard
          label="Total Attendees"
          value={loading ? '—' : (overview?.totalAttendees || 0).toLocaleString()}
          icon={Users}
          variant="info"
          loading={loading}
          sub={`Avg ticket ₦${(overview?.avgTicketValue || 0).toLocaleString()}`}
        />
        <StatCard
          label="Active Events"
          value={loading ? '—' : (overview?.activeEvents || 0).toString()}
          icon={Calendar}
          variant="warning"
          loading={loading}
          sub={`${overview?.totalEvents || 0} total events created`}
        />
      </div>

      {/* Secondary Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Conversion Rate', value: `${overview?.conversionRate || 0}%`, icon: BarChart2, color: '#7C3AED' },
          { label: 'Avg Ticket Value', value: `₦${(overview?.avgTicketValue || 0).toLocaleString()}`, icon: TrendingUp, color: '#10B981' },
          { label: 'Upcoming Events', value: (overview?.upcomingEvents || 0).toString(), icon: Clock, color: '#F59E0B' },
        ].map((m, i) => (
          <div key={i} className="org-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: `${m.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <m.icon size={16} style={{ color: m.color }} />
            </div>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>{m.label}</div>
              {loading
                ? <div className="org-skeleton" style={{ height: 20, width: 60 }} />
                : <div style={{ fontSize: 20, fontWeight: 700, color: '#0B1026', letterSpacing: -0.3 }}>{m.value}</div>
              }
            </div>
          </div>
        ))}
      </div>

      {/* Two-column: Chart + Top Events */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, marginBottom: 20 }}>
        {/* Sales Chart */}
        <div className="org-card">
          <div className="org-card-header">
            <h3 className="org-card-title">Ticket Sales</h3>
            <span style={{ fontSize: 11.5, color: '#94A3B8' }}>Last {range} day{range !== '1' ? 's' : ''}</span>
          </div>
          <div style={{ padding: '20px 20px 8px' }}>
            {loading ? (
              <div className="org-skeleton" style={{ height: 80, borderRadius: 8 }} />
            ) : (
              <>
                <MiniBarChart data={analytics?.timeSeries?.tickets || []} height={80} />
                {/* X-axis hint */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                  <span style={{ fontSize: 10.5, color: '#94A3B8' }}>
                    {analytics?.timeSeries?.tickets?.[0]?._id || '—'}
                  </span>
                  <span style={{ fontSize: 10.5, color: '#94A3B8' }}>
                    {analytics?.timeSeries?.tickets?.slice(-1)[0]?._id || '—'}
                  </span>
                </div>
              </>
            )}
          </div>
          <div style={{ padding: '8px 20px 16px', borderTop: '1px solid #F1F5F9', display: 'flex', gap: 24 }}>
            {[
              { label: 'Total Tickets', value: analytics?.summary?.totalTickets || 0 },
              { label: 'Total Orders', value: analytics?.summary?.totalOrders || 0 },
              { label: 'Avg Order', value: `₦${(analytics?.summary?.avgOrderValue || 0).toLocaleString()}` },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ fontSize: 10.5, color: '#94A3B8', marginBottom: 2 }}>{s.label}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#0B1026' }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Events */}
        <div className="org-card">
          <div className="org-card-header">
            <h3 className="org-card-title">Top Events</h3>
            <Link to="/organizer/events" className="org-btn org-btn-ghost org-btn-sm" style={{ fontSize: 12 }}>
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {loading ? (
            <div style={{ padding: '16px 20px' }}>
              {[1,2,3].map(i => <div key={i} className="org-skeleton" style={{ height: 48, borderRadius: 8, marginBottom: 8 }} />)}
            </div>
          ) : !overview?.topEvents?.length ? (
            <div className="org-empty" style={{ padding: '32px 20px' }}>
              <div className="org-empty-icon"><Calendar size={20} /></div>
              <div className="org-empty-title">No events yet</div>
              <div className="org-empty-subtitle">Create your first event to see stats here.</div>
              <Link to="/organizer/create" className="org-btn org-btn-primary org-btn-sm">Create Event</Link>
            </div>
          ) : (
            <div>
              {(overview.topEvents || []).map((ev, i) => (
                <div
                  key={ev.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 20px', borderBottom: '1px solid #F1F5F9', cursor: 'pointer',
                  }}
                  onClick={() => navigate(`/organizer/events/${ev.id}`)}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: 7,
                    background: i === 0 ? '#EEF2FF' : '#F8FAFC',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700,
                    color: i === 0 ? '#4F46E5' : '#94A3B8',
                    flexShrink: 0,
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0B1026', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ev.title}
                    </div>
                    <div style={{ fontSize: 11.5, color: '#94A3B8', marginTop: 1 }}>{formatDate(ev.date)}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0B1026' }}>{ev.ticketsSold}</div>
                    <div style={{ fontSize: 10.5, color: '#94A3B8' }}>tickets</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Events Table */}
      <div className="org-card">
        <div className="org-card-header">
          <h3 className="org-card-title">Recent Events</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link to="/organizer/create" className="org-btn org-btn-primary org-btn-sm">
              + Create Event
            </Link>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '16px 20px' }}>
            {[1,2,3].map(i => <div key={i} className="org-skeleton" style={{ height: 52, borderRadius: 8, marginBottom: 8 }} />)}
          </div>
        ) : events.length === 0 ? (
          <div className="org-empty">
            <div className="org-empty-icon"><Calendar size={22} /></div>
            <div className="org-empty-title">No events yet</div>
            <div className="org-empty-subtitle">
              Create your first event and start selling tickets to your audience.
            </div>
            <Link to="/organizer/create" className="org-btn org-btn-primary">
              Create Your First Event
            </Link>
          </div>
        ) : (
          <div className="org-table-wrap">
            <table className="org-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Date</th>
                  <th>Venue</th>
                  <th>Tickets Sold</th>
                  <th>Revenue</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {events.map(ev => (
                  <tr key={ev._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 8, overflow: 'hidden', flexShrink: 0,
                          background: '#F1F5F9',
                        }}>
                          {ev.coverImage?.url || typeof ev.coverImage === 'string' ? (
                            <img
                              src={getEventImageUrl(ev.coverImage?.url || ev.coverImage)}
                              alt=""
                              onError={handleImageFallback}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Calendar size={14} color="#94A3B8" />
                            </div>
                          )}
                        </div>
                        <div style={{ fontWeight: 600, color: '#0B1026', fontSize: 13.5, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {ev.title}
                        </div>
                      </div>
                    </td>
                    <td style={{ color: '#475569', fontSize: 13 }}>{formatDate(ev.startDate)}</td>
                    <td style={{ color: '#475569', fontSize: 13, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.venue}</td>
                    <td style={{ fontWeight: 600, color: '#0B1026' }}>{(ev.ticketsSold || 0).toLocaleString()}</td>
                    <td style={{ fontWeight: 600, color: '#0B1026' }}>₦{(ev.revenue || 0).toLocaleString()}</td>
                    <td><EventStatusBadge status={ev.status} /></td>
                    <td>
                      <Link
                        to={`/organizer/events/${ev._id}`}
                        className="org-btn org-btn-ghost org-btn-sm"
                        style={{ color: '#4F46E5' }}
                      >
                        Manage <ArrowRight size={12} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
