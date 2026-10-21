import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  MapPin,
  Calendar,
  ChevronDown,
  Menu,
  X,
  Ticket,
  Shield,
  HelpCircle,
  LogOut,
  Settings,
  PlusCircle,
  LayoutDashboard,
  User,
} from 'lucide-react';
import TickzaLogo from '../ui/TickzaLogo.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { formatNaira } from '../../lib/currency.js';

const CITIES = ['All Cities', 'Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Benin City', 'Enugu', 'Calabar'];
const DATES = [
  { label: 'All Dates', value: '' },
  { label: 'Today', value: 'today' },
  { label: 'This Weekend', value: 'this_weekend' },
  { label: 'This Month', value: 'this_month' },
];

export default function Header() {
  const { user, logout, isOrganizer, isAdmin, isApproved } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [selectedDate, setSelectedDate] = useState('');

  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const cityRef = useRef(null);
  const dateRef = useRef(null);
  const userMenuRef = useRef(null);

  const isPending = Boolean(user && user.status === 'PENDING' && !isAdmin);

  // Sync search input if in explore URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('search');
    const c = params.get('city');
    const d = params.get('date');
    if (q) setSearchTerm(q);
    if (c) setSelectedCity(c);
    if (d) setSelectedDate(d);
  }, [location.search]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (cityRef.current && !cityRef.current.contains(e.target)) setIsCityDropdownOpen(false);
      if (dateRef.current && !dateRef.current.contains(e.target)) setIsDateDropdownOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setIsUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock body scroll and listen for Escape key when mobile menu or modal is open
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setIsMobileSearchOpen(false);
        setIsUserMenuOpen(false);
        setShowHelpModal(false);
      }
    };

    if (isMobileMenuOpen || showHelpModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileMenuOpen, showHelpModal]);

  // Close mobile menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMobileSearchOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname, location.search]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set('search', searchTerm.trim());
    if (selectedCity && selectedCity !== 'All Cities') params.set('city', selectedCity);
    if (selectedDate) params.set('date', selectedDate);
    setIsMobileSearchOpen(false);
    navigate(`/explore?${params.toString()}`);
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    navigate('/home');
  };

  const navLinks = [
    { label: 'Home', path: '/home' },
    { label: 'Explore Events', path: '/explore' },
    { label: 'For Organizers', path: '/home#for-organizers' },
    { label: 'How It Works', path: '/home#how-it-works' },
  ];

  return (
    <header
      style={{
        backgroundColor: 'var(--surface-card, #FFFFFF)',
        borderBottom: '1px solid var(--border-subtle, #E7E5E4)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 2px 10px rgba(41, 37, 36, 0.04)',
      }}
    >
      {/* Pending Account Notice Banner */}
      {user && isPending && (
        <div
          style={{
            backgroundColor: '#1C1917',
            borderBottom: '1px solid var(--brand-accent, #FF8A3D)',
            color: '#FDE68A',
            padding: '7px 16px',
            fontSize: '12px',
            fontWeight: 500,
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <span>⏳ Your account is currently <strong>Pending Admin Review</strong>. Once approved, you can create and transfer tickets.</span>
        </div>
      )}

      {/* Main Top Navigation Row */}
      <div
        className="tm-container"
        style={{
          height: '70px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          padding: '0 16px',
          maxWidth: '100%',
        }}
      >
        {/* Left: Brand Logo & Desktop Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px', flexShrink: 0 }}>
          <Link
            to="/home"
            style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
            aria-label="Tickza Home"
          >
            <TickzaLogo height={32} color="var(--brand-primary, #FF5A5F)" />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="desktop-flex" style={{ display: 'none', alignItems: 'center', gap: '18px' }}>
            {navLinks.map((item) => {
              const isMatch = location.pathname + location.hash === item.path || (item.path === '/home' && location.pathname === '/');
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  style={{
                    fontSize: '14px',
                    fontWeight: isMatch ? 700 : 500,
                    color: isMatch ? 'var(--brand-primary, #FF5A5F)' : 'var(--text-secondary, #57534E)',
                    textDecoration: 'none',
                    padding: '8px 2px',
                    borderBottom: isMatch ? '2px solid var(--brand-primary, #FF5A5F)' : '2px solid transparent',
                    transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--text-primary, #292524)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isMatch) e.currentTarget.style.color = 'var(--text-secondary, #57534E)';
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Center: Desktop Global Search Bar */}
        <div className="desktop-only" style={{ flex: 1, maxWidth: '540px', margin: '0 16px' }}>
          <form
            onSubmit={handleSearchSubmit}
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--surface-page, #F5F7FF)',
              border: '1px solid var(--border-subtle, #E5E7EB)',
              borderRadius: '24px',
              padding: '4px 6px 4px 14px',
              transition: 'all 0.2s ease',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-primary, #FF5A5F)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-border, #E7E5E4)')}
          >
            {/* Search Input */}
            <div style={{ display: 'flex', alignItems: 'center', flex: 1, gap: '8px' }}>
              <Search size={15} color="var(--color-primary, #FF5A5F)" />
              <input
                type="text"
                placeholder="Search events, venues, artists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  width: '100%',
                  fontSize: '13px',
                  color: 'var(--text-primary, #111827)',
                }}
              />
            </div>

            {/* Divider */}
            <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border-subtle, #E7E5E4)', margin: '0 8px' }} />

            {/* City Selector */}
            <div ref={cityRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--text-primary, #292524)',
                  cursor: 'pointer',
                  padding: '5px 8px',
                  borderRadius: '16px',
                }}
              >
                <MapPin size={13} color="var(--brand-primary, #FF5A5F)" />
                <span style={{ maxWidth: '85px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {selectedCity}
                </span>
                <ChevronDown size={12} color="var(--text-secondary, #57534E)" />
              </button>

              {isCityDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '120%',
                    right: 0,
                    width: '180px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--border-subtle, #E7E5E4)',
                    borderRadius: '10px',
                    boxShadow: '0 12px 30px rgba(41, 37, 36, 0.1)',
                    zIndex: 1050,
                    padding: '6px 0',
                  }}
                >
                  {CITIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        setSelectedCity(c);
                        setIsCityDropdownOpen(false);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 14px',
                        background: selectedCity === c ? 'var(--color-surface-soft, #FFF4EE)' : 'transparent',
                        border: 'none',
                        color: selectedCity === c ? 'var(--brand-primary, #FF5A5F)' : 'var(--text-primary, #292524)',
                        fontSize: '13px',
                        fontWeight: selectedCity === c ? 700 : 400,
                        cursor: 'pointer',
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Divider */}
            <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border-subtle, #E7E5E4)', margin: '0 8px' }} />

            {/* Date Selector */}
            <div ref={dateRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--text-primary, #292524)',
                  cursor: 'pointer',
                  padding: '5px 8px',
                  borderRadius: '16px',
                }}
              >
                <Calendar size={13} color="var(--brand-accent, #FF8A3D)" />
                <span>{DATES.find((d) => d.value === selectedDate)?.label || 'All Dates'}</span>
                <ChevronDown size={12} color="var(--text-secondary, #57534E)" />
              </button>

              {isDateDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '120%',
                    right: 0,
                    width: '160px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--border-subtle, #E7E5E4)',
                    borderRadius: '10px',
                    boxShadow: '0 12px 30px rgba(41, 37, 36, 0.1)',
                    zIndex: 1050,
                    padding: '6px 0',
                  }}
                >
                  {DATES.map((d) => (
                    <button
                      key={d.label}
                      type="button"
                      onClick={() => {
                        setSelectedDate(d.value);
                        setIsDateDropdownOpen(false);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 14px',
                        background: selectedDate === d.value ? 'var(--color-surface-soft, #FFF4EE)' : 'transparent',
                        border: 'none',
                        color: selectedDate === d.value ? 'var(--brand-primary, #FF5A5F)' : 'var(--text-primary, #292524)',
                        fontSize: '13px',
                        fontWeight: selectedDate === d.value ? 700 : 400,
                        cursor: 'pointer',
                      }}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search Submit Icon */}
            <button
              type="submit"
              aria-label="Search"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--brand-primary, #FF5A5F)',
                border: 'none',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                marginLeft: '6px',
                flexShrink: 0,
                transition: 'opacity 0.15s ease',
              }}
            >
              <Search size={14} />
            </button>
          </form>
        </div>

        {/* Right Section: Desktop CTAs & Mobile Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* DESKTOP-ONLY: Organizer Quick Actions (Only shown to approved organizers) */}
          {isOrganizer && (
            <div className="desktop-flex" style={{ display: 'none', alignItems: 'center', gap: '10px' }}>
              <Link
                to="/create"
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  backgroundColor: 'var(--brand-primary, #FF5A5F)',
                  border: '1px solid var(--brand-primary, #FF5A5F)',
                  borderRadius: '20px',
                  padding: '6px 14px',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 2px 8px rgba(255, 90, 95, 0.25)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--brand-primary-hover, #E94B50)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--brand-primary, #FF5A5F)';
                }}
              >
                <PlusCircle size={15} color="#FFFFFF" />
                <span>Create Event</span>
              </Link>

              <Link
                to="/organizer"
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text-secondary, #57534E)',
                  textDecoration: 'none',
                  padding: '6px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--brand-primary, #FF5A5F)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary, #57534E)')}
              >
                <LayoutDashboard size={15} color="var(--brand-primary, #FF5A5F)" />
                <span>Dashboard</span>
              </Link>
            </div>
          )}

          {/* DESKTOP-ONLY: Help Center Modal Trigger */}
          <button
            onClick={() => setShowHelpModal(true)}
            className="desktop-only"
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '13.5px',
              fontWeight: 600,
              color: 'var(--text-secondary, #57534E)',
              cursor: 'pointer',
              padding: '6px 10px',
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--brand-primary, #FF5A5F)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary, #57534E)')}
          >
            Help
          </button>

          {/* DESKTOP-ONLY: User Account Menu or Desktop Auth Buttons */}
          <div className="desktop-flex" style={{ display: 'none', alignItems: 'center' }}>
            {user ? (
              <div ref={userMenuRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  aria-expanded={isUserMenuOpen}
                  aria-label="User Account Menu"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'var(--surface-page, #FAFAF9)',
                    border: '1px solid var(--border-subtle, #E7E5E4)',
                    borderRadius: '24px',
                    padding: '4px 10px 4px 6px',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--brand-primary, #FF5A5F)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '13px',
                      fontWeight: 700,
                      overflow: 'hidden',
                    }}
                  >
                    {user.avatar?.url ? (
                      <img src={user.avatar.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      (user.firstName?.[0] || 'U').toUpperCase()
                    )}
                  </div>

                  <span
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--text-primary, #111827)',
                      maxWidth: '100px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {user.firstName || 'My Account'}
                  </span>
                  <ChevronDown size={13} color="var(--text-secondary, #57534E)" />
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '115%',
                      right: 0,
                      width: '260px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid var(--border-subtle, #E7E5E4)',
                      borderRadius: '12px',
                      boxShadow: '0 12px 36px rgba(41, 37, 36, 0.15)',
                      zIndex: 1100,
                      overflow: 'hidden',
                    }}
                  >
                    {/* Account Header */}
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid #F5F5F4', backgroundColor: 'var(--color-background-neutral, #FAFAF9)' }}>
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--text-primary, #292524)' }}>
                        {user.firstName} {user.lastName}
                      </p>
                      <p style={{ margin: '2px 0 6px 0', fontSize: '12px', color: 'var(--text-muted, #78716C)' }}>{user.email}</p>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            backgroundColor: isOrganizer ? '#ECFDF5' : 'var(--color-surface-soft, #FFF4EE)',
                            color: isOrganizer ? '#059669' : 'var(--brand-accent, #FF8A3D)',
                            border: `1px solid ${isOrganizer ? '#A7F3D0' : '#FED7AA'}`,
                          }}
                        >
                          {isAdmin ? 'ADMIN' : isOrganizer ? 'ORGANIZER' : 'ATTENDEE'}
                        </span>

                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--brand-primary, #FF5A5F)' }}>
                          {formatNaira(user.balance || 0)}
                        </span>
                      </div>
                    </div>

                    {/* Nav Links */}
                    <div style={{ padding: '6px 0' }}>
                      <Link
                        to="/tickets"
                        onClick={() => setIsUserMenuOpen(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', fontSize: '13px', color: 'var(--text-primary, #292524)', textDecoration: 'none' }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-surface-soft, #FFF4EE)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <Ticket size={16} color="var(--brand-primary, #FF5A5F)" /> My Tickets
                      </Link>

                      {/* Organizer Links for approved organizers only */}
                      {isOrganizer && (
                        <>
                          <Link
                            to="/organizer"
                            onClick={() => setIsUserMenuOpen(false)}
                            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', fontSize: '13px', color: 'var(--text-primary, #292524)', textDecoration: 'none' }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-surface-soft, #FFF4EE)')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            <LayoutDashboard size={16} color="var(--brand-primary, #FF5A5F)" /> Organizer Dashboard
                          </Link>
                          <Link
                            to="/create"
                            onClick={() => setIsUserMenuOpen(false)}
                            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', fontSize: '13px', color: 'var(--text-primary, #292524)', textDecoration: 'none' }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-surface-soft, #FFF4EE)')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            <PlusCircle size={16} color="var(--brand-primary, #FF5A5F)" /> Create Event
                          </Link>
                        </>
                      )}

                      {!isOrganizer && (
                        <Link
                          to="/create"
                          onClick={() => setIsUserMenuOpen(false)}
                          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', fontSize: '13px', color: 'var(--brand-accent, #FF8A3D)', fontWeight: 600, textDecoration: 'none' }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-surface-soft, #FFF4EE)')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <PlusCircle size={16} color="var(--brand-accent, #FF8A3D)" /> Start Organizing
                        </Link>
                      )}

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', fontSize: '13px', color: 'var(--text-primary, #292524)', fontWeight: 600, textDecoration: 'none', backgroundColor: 'var(--color-surface-soft, #FFF4EE)' }}
                        >
                          <Shield size={16} color="var(--brand-primary, #FF5A5F)" /> Admin Console
                        </Link>
                      )}

                      <Link
                        to="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', fontSize: '13px', color: 'var(--text-primary, #292524)', textDecoration: 'none' }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-surface-soft, #FFF4EE)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <Settings size={16} color="var(--text-muted, #78716C)" /> My Account & Settings
                      </Link>
                    </div>

                    {/* Sign Out */}
                    <div style={{ borderTop: '1px solid #F5F5F4', padding: '6px 0' }}>
                      <button
                        onClick={handleLogout}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 16px',
                          fontSize: '13px',
                          color: '#DC2626',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        <LogOut size={16} color="#DC2626" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Link
                  to="/login"
                  style={{
                    padding: '8px 16px',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    color: 'var(--text-primary, #292524)',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle, #E7E5E4)',
                    backgroundColor: '#FFFFFF',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-surface-soft, #FFF4EE)';
                    e.currentTarget.style.borderColor = 'var(--brand-primary, #FF5A5F)';
                    e.currentTarget.style.color = 'var(--brand-primary, #FF5A5F)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                    e.currentTarget.style.borderColor = 'var(--border-subtle, #E7E5E4)';
                    e.currentTarget.style.color = 'var(--text-primary, #292524)';
                  }}
                >
                  Sign In
                </Link>
                <Link
                  to="/create"
                  style={{
                    padding: '8px 18px',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    backgroundColor: 'var(--brand-primary, #FF5A5F)',
                    color: '#FFFFFF',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 14px rgba(255, 90, 95, 0.28)',
                    transition: 'background-color 0.15s ease, transform 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--brand-primary-hover, #E94B50)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--brand-primary, #FF5A5F)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <PlusCircle size={15} color="#FFFFFF" />
                  <span>Create an Event</span>
                </Link>
              </div>
            )}
          </div>

          {/* MOBILE CONTROLS (<= 768px): Strictly Search + Hamburger, Min 44px Touch Targets */}
          <div className="mobile-only" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {/* Mobile Search Toggle Button */}
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              aria-label="Search events"
              aria-expanded={isMobileSearchOpen}
              style={{
                width: '44px',
                height: '44px',
                minWidth: '44px',
                minHeight: '44px',
                background: isMobileSearchOpen ? 'var(--color-surface-soft, #FFF4EE)' : 'transparent',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isMobileSearchOpen ? 'var(--brand-primary, #FF5A5F)' : 'var(--text-primary, #292524)',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <Search size={22} />
            </button>

            {/* Mobile Hamburger Drawer Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Navigation menu"
              aria-expanded={isMobileMenuOpen}
              style={{
                width: '44px',
                height: '44px',
                minWidth: '44px',
                minHeight: '44px',
                background: isMobileMenuOpen ? 'var(--color-surface-soft, #FFF4EE)' : 'transparent',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isMobileMenuOpen ? 'var(--brand-primary, #FF5A5F)' : 'var(--text-primary, #292524)',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Expandable Search Bar */}
      {isMobileSearchOpen && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#FFFFFF',
            borderTop: '1px solid var(--border-subtle, #E7E5E4)',
            boxShadow: '0 8px 24px rgba(41, 37, 36, 0.08)',
          }}
        >
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'var(--surface-page, #FAFAF9)',
                border: '1px solid var(--border-subtle, #E7E5E4)',
                borderRadius: '8px',
                padding: '8px 12px',
                gap: '8px',
              }}
            >
              <Search size={16} color="var(--brand-primary, #FF5A5F)" />
              <input
                type="text"
                placeholder="Search events, artists, venues"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  width: '100%',
                  fontSize: '14px',
                  background: 'transparent',
                  color: 'var(--text-primary, #292524)',
                }}
                autoFocus
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                aria-label="Filter by city"
                style={{
                  padding: '10px 10px',
                  fontSize: '13px',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--text-primary, #292524)',
                  border: '1px solid var(--border-subtle, #E7E5E4)',
                  borderRadius: '6px',
                  minHeight: '44px',
                }}
              >
                {CITIES.map((c) => (
                  <option key={c} value={c} style={{ background: '#FFF', color: '#292524' }}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                aria-label="Filter by date"
                style={{
                  padding: '10px 10px',
                  fontSize: '13px',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--text-primary, #292524)',
                  border: '1px solid var(--border-subtle, #E7E5E4)',
                  borderRadius: '6px',
                  minHeight: '44px',
                }}
              >
                {DATES.map((d) => (
                  <option key={d.label} value={d.value} style={{ background: '#FFF', color: '#292524' }}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              style={{
                minHeight: '44px',
                fontSize: '14px',
                fontWeight: 700,
                backgroundColor: 'var(--brand-primary, #FF5A5F)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(255, 90, 95, 0.25)',
              }}
            >
              Search Events
            </button>
          </form>
        </div>
      )}

      {/* Accessible Backdrop Overlay for Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            top: '70px',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(41, 37, 36, 0.65)',
            backdropFilter: 'blur(3px)',
            zIndex: 998,
          }}
          aria-hidden="true"
        />
      )}

      {/* Role-Based Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Navigation drawer"
          style={{
            position: 'fixed',
            top: '70px',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#FFFFFF',
            zIndex: 999,
            padding: '20px 20px 96px 20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
          }}
        >
          {/* USER INFO HEADER (When signed in) */}
          {user && (
            <div
              style={{
                backgroundColor: 'var(--surface-page, #FAFAF9)',
                border: '1px solid var(--border-subtle, #E7E5E4)',
                borderRadius: '12px',
                padding: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--brand-primary, #FF5A5F)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  fontWeight: 700,
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                {user.avatar?.url ? (
                  <img src={user.avatar.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  (user.firstName?.[0] || 'U').toUpperCase()
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--text-primary, #292524)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.firstName} {user.lastName}
                </p>
                <p style={{ margin: '2px 0 6px 0', fontSize: '12px', color: 'var(--text-secondary, #57534E)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.email}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '8px',
                      backgroundColor: isOrganizer ? '#ECFDF5' : 'var(--color-surface-soft, #FFF4EE)',
                      color: isOrganizer ? '#059669' : 'var(--brand-accent, #FF8A3D)',
                      border: `1px solid ${isOrganizer ? '#A7F3D0' : '#FED7AA'}`,
                    }}
                  >
                    {isAdmin ? 'ADMIN' : isOrganizer ? 'ORGANIZER' : isPending ? 'PENDING APPROVAL' : 'ATTENDEE'}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--brand-primary, #FF5A5F)' }}>
                    {formatNaira(user.balance || 0)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* PRIMARY NAVIGATION LINKS (Matches Header hierarchy) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--brand-accent, #FF8A3D)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
              Navigation
            </span>
            {[
              { label: 'Home', path: '/home' },
              { label: 'Explore Events', path: '/explore' },
              { label: 'For Organizers', path: isOrganizer ? '/organizer' : '/home#for-organizers' },
              { label: 'How It Works', path: '/home#how-it-works' },
            ].map((navItem) => {
              const isActive = location.pathname + location.hash === navItem.path || (navItem.path === '/home' && location.pathname === '/');
              return (
                <Link
                  key={navItem.label}
                  to={navItem.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px 12px',
                    fontSize: '15px',
                    fontWeight: isActive ? 700 : 600,
                    color: isActive ? 'var(--brand-primary, #FF5A5F)' : 'var(--text-primary, #292524)',
                    backgroundColor: isActive ? 'var(--color-surface-soft, #FFF4EE)' : 'transparent',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {navItem.label}
                </Link>
              );
            })}
          </div>

          {/* SIGNED-OUT PRIMARY CTA & AUTH */}
          {!user && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '4px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--brand-accent, #FF8A3D)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Get Started
              </span>
              <Link
                to="/create"
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  minHeight: '46px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  backgroundColor: 'var(--brand-primary, #FF5A5F)',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(255, 90, 95, 0.28)',
                }}
              >
                <PlusCircle size={16} color="#FFFFFF" />
                <span>Create an Event</span>
              </Link>
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  minHeight: '46px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--text-primary, #292524)',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle, #E7E5E4)',
                  textDecoration: 'none',
                }}
              >
                Sign In
              </Link>
            </div>
          )}

          {/* ATTENDEE HUB */}
          {user && !isOrganizer && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--brand-accent, #FF8A3D)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                My Attendee Hub
              </span>
              <Link
                to="/tickets"
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  minHeight: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: 'var(--text-primary, #292524)',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  backgroundColor: location.pathname === '/tickets' ? 'var(--color-surface-soft, #FFF4EE)' : 'transparent',
                }}
              >
                <Ticket size={18} color="var(--brand-primary, #FF5A5F)" />
                My Tickets & Passes
              </Link>
              <Link
                to="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  minHeight: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: 'var(--text-primary, #292524)',
                  textDecoration: 'none',
                  borderRadius: '8px',
                }}
              >
                <User size={18} color="var(--brand-primary, #FF5A5F)" />
                My Account & Settings
              </Link>
              <Link
                to="/create"
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  minHeight: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: 'var(--brand-accent, #FF8A3D)',
                  textDecoration: 'none',
                  borderRadius: '8px',
                }}
              >
                <PlusCircle size={18} color="var(--brand-accent, #FF8A3D)" />
                Start Organizing Events
              </Link>
            </div>
          )}

          {/* ORGANIZER / ADMIN MANAGEMENT TOOLS */}
          {user && isOrganizer && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--brand-accent, #FF8A3D)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                Organizer Management
              </span>
              <Link
                to="/create"
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  minHeight: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  fontSize: '15px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  backgroundColor: 'var(--brand-primary, #FF5A5F)',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  boxShadow: '0 2px 8px rgba(255, 90, 95, 0.25)',
                  marginBottom: '4px',
                }}
              >
                <PlusCircle size={18} color="#FFFFFF" />
                Create New Event
              </Link>
              <Link
                to="/organizer"
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  minHeight: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: 'var(--text-primary, #292524)',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  backgroundColor: location.pathname === '/organizer' ? 'var(--color-surface-soft, #FFF4EE)' : 'transparent',
                }}
              >
                <LayoutDashboard size={18} color="var(--brand-primary, #FF5A5F)" />
                Organizer Dashboard
              </Link>
              <Link
                to="/organizer/events"
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  minHeight: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: 'var(--text-primary, #292524)',
                  textDecoration: 'none',
                  borderRadius: '8px',
                }}
              >
                <Calendar size={18} color="var(--brand-primary, #FF5A5F)" />
                Manage Events
              </Link>
              <Link
                to="/scan"
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  minHeight: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: 'var(--text-primary, #292524)',
                  textDecoration: 'none',
                  borderRadius: '8px',
                }}
              >
                <Search size={18} color="var(--brand-primary, #FF5A5F)" />
                Staff Check-in Scanner
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    fontSize: '15px',
                    fontWeight: 700,
                    color: 'var(--brand-primary, #FF5A5F)',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    backgroundColor: 'var(--color-surface-soft, #FFF4EE)',
                  }}
                >
                  <Shield size={18} color="var(--brand-primary, #FF5A5F)" />
                  Admin Console
                </Link>
              )}
              <Link
                to="/tickets"
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  minHeight: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: 'var(--text-primary, #292524)',
                  textDecoration: 'none',
                  borderRadius: '8px',
                }}
              >
                <Ticket size={18} color="var(--brand-primary, #FF5A5F)" />
                My Personal Tickets
              </Link>
              <Link
                to="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  minHeight: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: 'var(--text-primary, #292524)',
                  textDecoration: 'none',
                  borderRadius: '8px',
                }}
              >
                <User size={18} color="var(--brand-primary, #FF5A5F)" />
                My Account & Settings
              </Link>
            </div>
          )}

          {/* Help & Support Trigger */}
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              setShowHelpModal(true);
            }}
            style={{
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              fontSize: '15px',
              fontWeight: 600,
              color: 'var(--text-secondary, #57534E)',
              background: 'transparent',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
            }}
          >
            <HelpCircle size={18} color="var(--brand-accent, #FF8A3D)" />
            Help & FAQs
          </button>

          {/* Sign Out Button (When authenticated) */}
          {user && (
            <button
              onClick={handleLogout}
              style={{
                marginTop: '8px',
                minHeight: '46px',
                padding: '12px',
                color: '#DC2626',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              <LogOut size={16} /> Sign Out
            </button>
          )}
        </div>
      )}

      {/* Help & Support Modal */}
      {showHelpModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(41, 37, 36, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setShowHelpModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '480px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(41, 37, 36, 0.25)',
              border: '1px solid var(--border-subtle, #E7E5E4)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HelpCircle size={22} color="var(--brand-primary, #FF5A5F)" />
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--text-primary, #292524)' }}>
                  Tickza Help Center
                </h3>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  lineHeight: 1,
                  cursor: 'pointer',
                  color: 'var(--text-muted, #78716C)',
                  padding: '4px',
                }}
                aria-label="Close help modal"
              >
                ×
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px', color: 'var(--text-secondary, #57534E)' }}>
              <div>
                <p style={{ fontWeight: 700, color: 'var(--text-primary, #292524)', margin: '0 0 4px' }}>How do Paystack payments work?</p>
                <p style={{ margin: 0 }}>All transactions are processed securely in Nigerian Naira (₦) through Paystack with instant receipt and digital ticket issuance.</p>
              </div>

              <div>
                <p style={{ fontWeight: 700, color: 'var(--text-primary, #292524)', margin: '0 0 4px' }}>Where do I find my tickets?</p>
                <p style={{ margin: 0 }}>Tickets and free event passes are stored in your account under "My Tickets" with unique verification QR codes.</p>
              </div>

              <div>
                <p style={{ fontWeight: 700, color: 'var(--text-primary, #292524)', margin: '0 0 4px' }}>How do organizer payouts work?</p>
                <p style={{ margin: 0 }}>Approved organizers can request withdrawals to any verified Nigerian bank account directly from the Organizer Payouts dashboard.</p>
              </div>
            </div>

            <button
              className="btn-primary"
              style={{ width: '100%', marginTop: '20px', minHeight: '44px', padding: '12px', fontSize: '14px', borderRadius: '8px' }}
              onClick={() => setShowHelpModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
