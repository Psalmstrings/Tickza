import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../lib/axios.js';
import './organizer.css';
import {
  LayoutDashboard,
  Calendar,
  Plus,
  Ticket,
  ShoppingCart,
  Users,
  QrCode,
  BarChart2,
  Tag,
  Megaphone,
  Wallet,
  UserCog,
  FileText,
  Settings,
  X,
  Menu,
  Search,
  Bell,
  LogOut,
  ChevronRight,
  Zap,
} from 'lucide-react';

const MAIN_NAV = [
  { to: '/organizer',          label: 'Overview',      icon: LayoutDashboard, exact: true },
  { to: '/organizer/events',   label: 'My Events',     icon: Calendar },
  { to: '/organizer/create',   label: 'Create Event',  icon: Plus },
  { to: '/organizer/tickets',  label: 'Tickets',       icon: Ticket },
  { to: '/organizer/orders',   label: 'Orders',        icon: ShoppingCart },
  { to: '/organizer/attendees',label: 'Attendees',     icon: Users },
  { to: '/organizer/checkin',  label: 'Check-in',      icon: QrCode },
  { to: '/organizer/analytics',label: 'Analytics',     icon: BarChart2 },
  { to: '/organizer/promos',   label: 'Promo Codes',   icon: Tag },
  { to: '/organizer/marketing',label: 'Marketing',     icon: Megaphone },
  { to: '/organizer/payouts',  label: 'Payouts',       icon: Wallet },
];

const MGMT_NAV = [
  { to: '/organizer/team',     label: 'Team',          icon: UserCog },
  { to: '/organizer/reports',  label: 'Reports',       icon: FileText },
  { to: '/organizer/settings', label: 'Settings',      icon: Settings },
];

function NavItem({ to, label, icon: Icon, onClick }) {
  return (
    <NavLink
      to={to}
      end={to === '/organizer'}
      className={({ isActive }) => `org-nav-item${isActive ? ' active' : ''}`}
      onClick={onClick}
    >
      <Icon size={15} className="org-nav-icon" />
      {label}
    </NavLink>
  );
}

export default function OrganizerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState(0);

  const closeSidebar = () => setSidebarOpen(false);

  // Close sidebar on route change (mobile)
  useEffect(() => { closeSidebar(); }, [location.pathname]);

  // Handle escape key and lock body scroll when mobile drawer is open
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && sidebarOpen) {
        closeSidebar();
      }
    };
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [sidebarOpen]);

  // Fetch unread notification count
  useEffect(() => {
    api.get('/notifications').then(({ data }) => {
      if (data?.data) {
        const unread = data.data.filter(n => !n.read).length;
        setNotifications(unread);
      }
    }).catch(() => {});
  }, []);

  const handleSearch = useCallback(async (q) => {
    setSearchQuery(q);
    if (q.trim().length < 2) { setSearchResults(null); return; }
    try {
      const { data } = await api.get(`/organizer/search?q=${encodeURIComponent(q)}`);
      setSearchResults(data.data);
    } catch { setSearchResults(null); }
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
    : 'U';

  // Page titles based on path
  const pageTitle = () => {
    const p = location.pathname;
    if (p === '/organizer') return 'Overview';
    if (p.includes('/events')) return 'My Events';
    if (p.includes('/create')) return 'Create Event';
    if (p.includes('/tickets')) return 'Tickets';
    if (p.includes('/orders')) return 'Orders';
    if (p.includes('/attendees')) return 'Attendees';
    if (p.includes('/checkin')) return 'Check-in';
    if (p.includes('/analytics')) return 'Analytics';
    if (p.includes('/promos')) return 'Promo Codes';
    if (p.includes('/marketing')) return 'Marketing';
    if (p.includes('/payouts')) return 'Payouts';
    if (p.includes('/team')) return 'Team';
    if (p.includes('/reports')) return 'Reports';
    if (p.includes('/settings')) return 'Settings';
    return 'Dashboard';
  };

  return (
    <div className="org-shell">
      {/* Sidebar overlay (mobile) */}
      <div
        className={`org-sidebar-overlay${sidebarOpen ? ' open' : ''}`}
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <aside className={`org-sidebar${sidebarOpen ? ' open' : ''}`}>
        <button className="org-sidebar-close" onClick={closeSidebar} aria-label="Close menu">
          <X size={18} />
        </button>

        {/* Logo */}
        <div className="org-sidebar-logo">
          <div className="org-sidebar-logo-mark">
            <Zap size={16} color="#FFF" />
          </div>
          <div>
            <div className="org-sidebar-brand">Tickza</div>
            <div className="org-sidebar-sub">Organizer Hub</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="org-nav">
          <div className="org-nav-section">
            <div className="org-nav-section-label">Main</div>
          </div>
          {MAIN_NAV.map(item => (
            <NavItem key={item.to} {...item} onClick={closeSidebar} />
          ))}

          <div className="org-nav-section">
            <div className="org-nav-section-label">Management</div>
          </div>
          {MGMT_NAV.map(item => (
            <NavItem key={item.to} {...item} onClick={closeSidebar} />
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="org-sidebar-footer">
          {/* User info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '8px', marginBottom: '8px' }}>
            <div className="org-header-avatar" style={{ width: 32, height: 32, fontSize: 11 }}>{initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.firstName} {user?.lastName}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email}
              </div>
            </div>
          </div>

          {/* Back to main app + Logout */}
          <button
            onClick={() => navigate('/home')}
            className="org-nav-item"
            style={{ width: '100%', marginBottom: '2px' }}
          >
            <ChevronRight size={14} style={{ transform: 'rotate(180deg)' }} />
            Back to App
          </button>
          <button
            onClick={handleLogout}
            className="org-nav-item"
            style={{ width: '100%', color: 'rgba(239,68,68,0.8)' }}
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="org-main">
        {/* Header */}
        <header className="org-header">
          <button
            className="org-header-menu-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open organizer navigation menu"
            aria-expanded={sidebarOpen}
          >
            <Menu size={22} />
          </button>

          <span className="org-header-title">{pageTitle()}</span>

          <div className="org-header-spacer" />

          {/* Desktop search */}
          <div className="org-header-search" style={{ position: 'relative' }}>
            <Search size={14} className="org-header-search-icon" />
            <input
              type="text"
              placeholder="Search events, tickets, orders…"
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
            />
            {/* Search dropdown */}
            {searchOpen && searchResults && (
              <div style={{
                position: 'absolute', top: '44px', left: 0, right: 0,
                background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '10px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 100, overflow: 'hidden',
              }}>
                {searchResults.events?.length > 0 && (
                  <div>
                    <div style={{ padding: '8px 12px', fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', background: '#FAFBFC', borderBottom: '1px solid #F1F5F9' }}>Events</div>
                    {searchResults.events.map(ev => (
                      <div key={ev._id} style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 13, color: '#0B1026', borderBottom: '1px solid #F8FAFC' }}
                        onMouseDown={() => navigate(`/organizer/events/${ev._id}`)}>
                        {ev.title}
                      </div>
                    ))}
                  </div>
                )}
                {searchResults.tickets?.length > 0 && (
                  <div>
                    <div style={{ padding: '8px 12px', fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', background: '#FAFBFC', borderBottom: '1px solid #F1F5F9' }}>Tickets</div>
                    {searchResults.tickets.map(t => (
                      <div key={t._id} style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 13, color: '#0B1026', borderBottom: '1px solid #F8FAFC' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{t.ticketNumber}</span>
                        {' — '}{t.ownerId?.firstName} {t.ownerId?.lastName}
                      </div>
                    ))}
                  </div>
                )}
                {!searchResults.events?.length && !searchResults.tickets?.length && (
                  <div style={{ padding: '16px 12px', fontSize: 13, color: '#94A3B8', textAlign: 'center' }}>No results found</div>
                )}
              </div>
            )}
          </div>

          <div className="org-header-actions">
            {/* Notifications */}
            <button
              style={{
                position: 'relative', width: 44, height: 44, border: 'none',
                background: 'transparent', borderRadius: 8, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#475569',
              }}
              onClick={() => navigate('/notifications')}
              title="Notifications"
              aria-label="View notifications"
            >
              <Bell size={20} />
              {notifications > 0 && (
                <span style={{
                  position: 'absolute', top: 6, right: 6,
                  width: 16, height: 16, borderRadius: '50%',
                  background: '#EF4444', color: '#FFF',
                  fontSize: 9, fontWeight: 700, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  {notifications > 9 ? '9+' : notifications}
                </span>
              )}
            </button>

            {/* Avatar */}
            <div className="org-header-avatar" title={`${user?.firstName} ${user?.lastName}`}>
              {initials}
            </div>
          </div>
        </header>

        {/* Page content rendered via React Router Outlet */}
        <Outlet />
      </div>
    </div>
  );
}
