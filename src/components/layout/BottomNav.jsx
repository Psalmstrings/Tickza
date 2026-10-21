import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Compass, Search, Ticket, LayoutDashboard, User, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function BottomNav() {
  const { user, isOrganizer } = useAuth();
  const location = useLocation();

  // Role-based navigation items
  let navItems = [];

  if (!user) {
    // 1. Signed-out users: Discover, Browse Events, Sign In
    navItems = [
      { to: '/home', icon: Compass, label: 'Discover' },
      { to: '/explore', icon: Search, label: 'Browse Events' },
      { to: '/login', icon: LogIn, label: 'Sign In' },
    ];
  } else if (!isOrganizer) {
    // 2. Ordinary Attendees: Discover, Browse Events, My Tickets, My Account (NO Sell, NO Organizer)
    navItems = [
      { to: '/home', icon: Compass, label: 'Discover' },
      { to: '/explore', icon: Search, label: 'Browse Events' },
      { to: '/tickets', icon: Ticket, label: 'My Tickets' },
      { to: '/profile', icon: User, label: 'My Account' },
    ];
  } else {
    // 3. Approved Organizers & Admins: Discover, Browse Events, My Tickets, Organizer Dashboard, My Account
    navItems = [
      { to: '/home', icon: Compass, label: 'Discover' },
      { to: '/explore', icon: Search, label: 'Browse Events' },
      { to: '/tickets', icon: Ticket, label: 'My Tickets' },
      { to: '/organizer', icon: LayoutDashboard, label: 'Organizer' },
      { to: '/profile', icon: User, label: 'My Account' },
    ];
  }

  return (
    <nav
      className="mobile-only"
      aria-label="Mobile Navigation"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'var(--surface-card, #FFFFFF)',
        borderTop: '1px solid var(--border-subtle, #E5E7EB)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        minHeight: '62px',
        paddingTop: '6px',
        paddingBottom: 'calc(6px + env(safe-area-inset-bottom, 0px))',
        zIndex: 1000,
        boxShadow: '0 -4px 20px rgba(17, 24, 39, 0.06)',
      }}
    >
      {navItems.map(({ to, icon: Icon, label }) => {
        const isActive =
          location.pathname === to ||
          (to === '/home' && location.pathname === '/') ||
          (to !== '/home' && location.pathname.startsWith(to));

        return (
          <NavLink
            key={to}
            to={to}
            style={{
              flex: 1,
              minWidth: 0,
              minHeight: '48px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              textDecoration: 'none',
              padding: '2px 4px',
              color: isActive ? 'var(--color-primary, #FF5A5F)' : 'var(--color-text-secondary, #57534E)',
              transition: 'all 0.15s ease',
              position: 'relative',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '12px',
                backgroundColor: isActive ? 'var(--color-surface-soft, #FFF4EE)' : 'transparent',
                transition: 'background-color 0.15s ease',
              }}
            >
              <Icon
                size={19}
                color={isActive ? 'var(--color-primary, #FF5A5F)' : 'var(--color-text-secondary, #57534E)'}
                strokeWidth={isActive ? 2.4 : 1.8}
              />
            </div>
            <span
              style={{
                fontSize: '10.5px',
                fontWeight: isActive ? 700 : 500,
                lineHeight: 1.1,
                color: isActive ? 'var(--color-primary, #FF5A5F)' : 'var(--color-text-secondary, #57534E)',
                textAlign: 'center',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
              }}
            >
              {label}
            </span>

            {/* Active top line accent indicator */}
            {isActive && (
              <div
                style={{
                  position: 'absolute',
                  top: '-6px',
                  left: '28%',
                  right: '28%',
                  height: '3px',
                  backgroundColor: 'var(--color-primary, #FF5A5F)',
                  borderRadius: '0 0 3px 3px',
                }}
              />
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
