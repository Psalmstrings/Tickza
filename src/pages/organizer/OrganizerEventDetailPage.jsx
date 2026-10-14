import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../lib/axios.js';
import './organizer.css';
import {
  Calendar, MapPin, Ticket, Users, QrCode,
  DollarSign, ArrowLeft, ExternalLink, Share2,
  Edit, CheckCircle2, TrendingUp, Settings, Plus,
  Tag, ShoppingCart, BarChart2
} from 'lucide-react';
import { getEventImageUrl, handleImageFallback } from '../../lib/imageHelper.js';

export default function OrganizerEventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Load event detailed stats
  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/organizer/events/${id}/stats`);
      setEventData(data.data);
    } catch {
      setEventData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [id]);

  if (loading) {
    return (
      <div className="org-page">
        <div className="org-skeleton" style={{ height: 160, borderRadius: 12, marginBottom: 20 }} />
        <div className="org-skeleton" style={{ height: 320, borderRadius: 12 }} />
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="org-page">
        <div className="org-card">
          <div className="org-empty">
            <div className="org-empty-title">Event not found</div>
            <Link to="/organizer/events" className="org-btn org-btn-secondary" style={{ marginTop: 12 }}>
              <ArrowLeft size={14} /> Back to Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { event, ticketTypes = [], summary = {}, dailySales = [] } = eventData;
  const eventUrl = `${window.location.origin}/events/${event._id}`;

  return (
    <div className="org-page">
      {/* Back link */}
      <Link
        to="/organizer/events"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          color: '#475569',
          fontSize: 13,
          fontWeight: 600,
          textDecoration: 'none',
          marginBottom: 16,
        }}
      >
        <ArrowLeft size={15} /> Back to All Events
      </Link>

      {/* Event Command Header Banner */}
      <div className="org-card" style={{ padding: 24, marginBottom: 20, overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{
            width: 90, height: 90, borderRadius: 12, overflow: 'hidden', flexShrink: 0,
            background: '#0B1026'
          }}>
            <img
              src={getEventImageUrl(event.coverImage?.url || event.coverImage || event.bannerImage)}
              alt=""
              onError={handleImageFallback}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span className={`org-badge ${event.status === 'PUBLISHED' ? 'org-badge-success' : 'org-badge-neutral'}`}>
                {event.status}
              </span>
              <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>
                {event.category || 'Event'}
              </span>
            </div>

            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0B1026', margin: '0 0 6px', letterSpacing: -0.4 }}>
              {event.title}
            </h1>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: 13, color: '#475569' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Calendar size={13} color="#4F46E5" />
                {new Date(event.startDate).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} at {event.startTime || '7:00 PM'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <MapPin size={13} color="#EF4444" />
                {event.venue}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignSelf: 'flex-start' }}>
            <Link
              to={`/organizer/events/${event._id}/edit`}
              className="org-btn org-btn-secondary org-btn-sm"
            >
              <Edit size={13} /> Edit Event
            </Link>
            <a
              href={eventUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="org-btn org-btn-secondary org-btn-sm"
            >
              <ExternalLink size={13} /> View Live Page
            </a>
            <button
              onClick={() => navigate(`/organizer/checkin?event=${event._id}`)}
              className="org-btn org-btn-primary org-btn-sm"
            >
              <QrCode size={13} /> Check-in Gate
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="org-tabs" style={{ marginTop: 20 }}>
          {[
            { id: 'overview', label: 'Command Overview' },
            { id: 'tickets', label: `Ticket Tiers (${ticketTypes.length})` },
            { id: 'quicklinks', label: 'Event Actions' },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`org-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div>
          {/* Key Event Metrics */}
          <div className="org-stats-grid" style={{ marginBottom: 24 }}>
            <div className="org-stat-card revenue">
              <div className="org-stat-icon" style={{ background: '#EEF2FF', color: '#4F46E5' }}>
                <DollarSign size={18} />
              </div>
              <div className="org-stat-label">Event Gross Revenue</div>
              <div className="org-stat-value">₦{(summary.totalRevenue || 0).toLocaleString()}</div>
              <div className="org-stat-delta positive">Across all ticket sales</div>
            </div>

            <div className="org-stat-card success">
              <div className="org-stat-icon" style={{ background: '#ECFDF5', color: '#10B981' }}>
                <Ticket size={18} />
              </div>
              <div className="org-stat-label">Total Tickets Sold</div>
              <div className="org-stat-value" style={{ color: '#10B981' }}>
                {(summary.totalSold || 0).toLocaleString()}
              </div>
              <div className="org-stat-delta positive">Confirmed manifest</div>
            </div>

            <div className="org-stat-card info">
              <div className="org-stat-icon" style={{ background: '#ECFEFF', color: '#0891B2' }}>
                <CheckCircle2 size={18} />
              </div>
              <div className="org-stat-label">Guests Checked In</div>
              <div className="org-stat-value">{summary.checkedIn || 0}</div>
              <div className="org-stat-delta positive">{summary.attendanceRate || 0}% door turnout</div>
            </div>

            <div className="org-stat-card warning">
              <div className="org-stat-icon" style={{ background: '#FFFBEB', color: '#F59E0B' }}>
                <Users size={18} />
              </div>
              <div className="org-stat-label">Not Yet Arrived</div>
              <div className="org-stat-value" style={{ color: '#F59E0B' }}>
                {Math.max(0, (summary.totalSold || 0) - (summary.checkedIn || 0))}
              </div>
              <div className="org-stat-delta">Expected at gate</div>
            </div>
          </div>

          {/* Ticket Tier Breakdown Table */}
          <div className="org-card">
            <div className="org-card-header">
              <h3 className="org-card-title">Tier Quotas & Capacity Status</h3>
              <Link to="/organizer/tickets" className="org-btn org-btn-secondary org-btn-sm">
                <Plus size={13} /> Manage Tiers
              </Link>
            </div>
            <div className="org-table-wrap">
              <table className="org-table">
                <thead>
                  <tr>
                    <th>Tier / Format</th>
                    <th>Price</th>
                    <th>Sold (Packages)</th>
                    <th>Attendees Admitted</th>
                    <th>Remaining Capacity</th>
                  </tr>
                </thead>
                <tbody>
                  {ticketTypes.map((tt) => {
                    const capacity = tt.admittedPerTicket || 1;
                    const attendeesCount = (tt.sold || 0) * capacity;

                    return (
                      <tr key={tt._id}>
                        <td>
                          <div style={{ fontWeight: 600, color: '#0B1026' }}>{tt.name}</div>
                          {tt.format && tt.format !== 'INDIVIDUAL' && (
                            <span style={{ fontSize: 10, background: '#EEF2FF', color: '#4F46E5', padding: '1px 5px', borderRadius: 4, fontWeight: 700 }}>
                              {tt.format.replace('_', ' ')} (x{capacity})
                            </span>
                          )}
                        </td>
                        <td>{tt.price === 0 ? 'FREE' : `₦${tt.price.toLocaleString()}`}</td>
                        <td style={{ fontWeight: 600, color: '#0B1026' }}>{tt.sold}</td>
                        <td style={{ color: '#10B981', fontWeight: 600 }}>
                          {attendeesCount} guests ({tt.checkedIn} checked in)
                        </td>
                        <td>
                          <span className="org-badge org-badge-neutral">{tt.available} available</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Tickets */}
      {activeTab === 'tickets' && (
        <div className="org-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#0B1026' }}>
              Event Ticket Tiers
            </h3>
            <Link to="/organizer/tickets" className="org-btn org-btn-primary org-btn-sm">
              <Plus size={13} /> Edit / Add Ticket Tiers
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {ticketTypes.map(tt => (
              <div key={tt._id} style={{ background: '#F8FAFC', borderRadius: 8, padding: 16, border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#0B1026' }}>{tt.name}</div>
                  <span className="org-badge org-badge-purple">
                    {tt.price === 0 ? 'FREE' : `₦${tt.price.toLocaleString()}`}
                  </span>
                </div>
                <div style={{ fontSize: 12.5, color: '#64748B', marginTop: 8 }}>
                  Capacity: <strong>{tt.quantity}</strong> | Sold: <strong>{tt.sold}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Event Actions / Quicklinks */}
      {activeTab === 'quicklinks' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {[
            { title: 'Door Check-in Gate', desc: 'Scan and validate attendee entry via QR.', icon: QrCode, link: `/organizer/checkin?event=${event._id}` },
            { title: 'Promo Codes', desc: 'Create coupon discounts for this event.', icon: Tag, link: `/organizer/promos` },
            { title: 'Attendee Manifest', desc: 'View customer contact details and manifests.', icon: Users, link: `/organizer/attendees` },
            { title: 'Marketing Center', desc: 'Share links on WhatsApp, X, and Facebook.', icon: Share2, link: `/organizer/marketing` },
            { title: 'Post-Event Audit', desc: 'View full attendance and financial report.', icon: BarChart2, link: `/organizer/reports` },
          ].map((action, i) => (
            <div
              key={i}
              onClick={() => navigate(action.link)}
              className="org-card"
              style={{ padding: 20, cursor: 'pointer', transition: 'border-color 0.2s' }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 8, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <action.icon size={18} color="#4F46E5" />
              </div>
              <h4 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px', color: '#0B1026' }}>{action.title}</h4>
              <p style={{ fontSize: 12.5, color: '#475569', margin: 0 }}>{action.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
