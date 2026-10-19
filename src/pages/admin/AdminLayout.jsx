import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import {
  Users,
  Calendar,
  Ticket,
  ShoppingBag,
  FileText,
  BarChart3,
  Shield,
  ExternalLink,
  DollarSign,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import TickzaLogo from '../../components/ui/TickzaLogo.jsx';
import './admin.css';

const NAV_ITEMS = [
  { to: '/admin', icon: <BarChart3 size={18} />, label: 'Analytics', end: true },
  { to: '/admin/financials', icon: <DollarSign size={18} />, label: 'Financials & Payouts' },
  { to: '/admin/users', icon: <Users size={18} />, label: 'Users & Approval' },
  { to: '/admin/events', icon: <Calendar size={18} />, label: 'Events' },
  { to: '/admin/tickets', icon: <Ticket size={18} />, label: 'Tickets' },
  { to: '/admin/orders', icon: <ShoppingBag size={18} />, label: 'Orders' },
  { to: '/admin/logs', icon: <FileText size={18} />, label: 'Audit Logs' },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const closeDrawer = () => setDrawerOpen(false);

  // Close drawer on route change
  useEffect(() => {
    closeDrawer();
  }, [location.pathname]);

  // Handle escape key and body scroll lock
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && drawerOpen) {
        closeDrawer();
      }
    };
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [drawerOpen]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
      {/* Mobile Drawer Backdrop */}
      <div
        className={`admin-drawer-overlay${drawerOpen ? ' open' : ''}`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Mobile Navigation Drawer */}
      <aside className={`admin-mobile-drawer${drawerOpen ? ' open' : ''}`}>
        <div className="admin-drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TickzaLogo height={22} color="#026CDF" />
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#026CDF', backgroundColor: '#EFF6FF', padding: '2px 6px', borderRadius: '4px' }}>
              ADMIN
            </span>
          </div>
          <button
            onClick={closeDrawer}
            style={{
              width: 36, height: 36, border: 'none', background: '#F1F5F9',
              borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#64748B'
            }}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="admin-drawer-nav">
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', padding: '8px 12px', letterSpacing: '0.05em' }}>
            Navigation
          </div>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={closeDrawer}
              className={({ isActive }) => `admin-drawer-item${isActive ? ' active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-drawer-footer">
          <Link
            to="/home"
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              color: '#475569', textDecoration: 'none', fontSize: '13px', fontWeight: 600,
              padding: '8px 0'
            }}
          >
            <ExternalLink size={16} /> Exit to Main Marketplace
          </Link>
        </div>
      </aside>

      {/* Admin Top Header */}
      <header
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E5E7EB',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}
      >
        <div className="admin-header-bar tm-container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Hamburger Button for Mobile */}
            <button
              className="admin-menu-toggle"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open admin navigation menu"
              aria-expanded={drawerOpen}
            >
              <Menu size={22} />
            </button>

            <Link to="/home" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
              <TickzaLogo height={22} color="#026CDF" />
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#EFF6FF', color: '#026CDF', padding: '3px 8px', borderRadius: '4px', fontSize: '10.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <Shield size={12} />
              <span className="desktop-only">Enterprise Admin</span>
              <span className="mobile-only">Admin</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link
              to="/home"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12.5px',
                fontWeight: 600,
                color: '#6B7280',
                textDecoration: 'none',
                padding: '8px 10px',
                borderRadius: '6px',
              }}
              title="Exit to Marketplace"
            >
              <span className="desktop-only">Exit to Marketplace</span>
              <ExternalLink size={16} />
            </Link>
          </div>
        </div>

        {/* Sub-Nav Tabs Bar (Visible on tablets and desktop) */}
        <div className="admin-desktop-tabs" style={{ borderTop: '1px solid #F1F5F9', backgroundColor: '#FFFFFF' }}>
          <div className="admin-subnav-scroll tm-container">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '11px 14px',
                  fontSize: '13px',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#026CDF' : '#64748B',
                  textDecoration: 'none',
                  borderBottom: isActive ? '3px solid #026CDF' : '3px solid transparent',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                })}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </header>

      {/* Main Admin View Container */}
      <main style={{ flex: 1, padding: '16px 0 40px' }}>
        <div className="tm-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

