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

  const navCategories = [
    { label: 'Discover', path: '/home' },
    { label: 'Explore', path: '/explore' },
    { label: 'Concerts', path: '/explore?category=Concerts' },
    { label: 'Festivals', path: '/explore?category=Festivals' },
    { label: 'Sports', path: '/explore?category=Sports' },
    { label: 'Parties', path: '/explore?category=Nightlife%20%26%20Parties' },
  ];

  return (
    <header
      style={{
        backgroundColor: 'var(--brand-primary, #0B1025)',
        borderBottom: '1px solid rgba(230, 245, 247, 0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 4px 20px rgba(11, 16, 37, 0.4)',
      }}
    >
      {/* Pending Account Notice Banner */}
      {user && isPending && (
        <div
          style={{
            backgroundColor: '#1C1917',
            borderBottom: '1px solid var(--brand-warm-accent, #D6BE92)',
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
        {/* Left: Brand Logo & Desktop Nav Categories */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexShrink: 0 }}>
          <Link
            to="/home"
            style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
            aria-label="Tickza Home"
          >
            <TickzaLogo height={32} color="var(--brand-pale-ice, #E6F5F7)" />
          </Link>

          {/* Desktop Categories */}
          <nav className="desktop-flex" style={{ display: 'none', alignItems: 'center', gap: '16px' }}>
            {navCategories.map((item) => {
              const isMatch = location.pathname + location.search === item.path;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  style={{
                    fontSize: '13.5px',
                    fontWeight: isMatch ? 700 : 500,
                    color: isMatch ? 'var(--brand-pale-ice, #E6F5F7)' : 'rgba(230, 245, 247, 0.72)',
                    textDecoration: 'none',
                    padding: '8px 2px',
                    borderBottom: isMatch ? '2px solid var(--brand-accent, #397C80)' : '2px solid transparent',
                    transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#FFFFFF';
                  }}
                  onMouseLeave={(e) => {
                    if (!isMatch) e.currentTarget.style.color = 'rgba(230, 245, 247, 0.72)';
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
              backgroundColor: 'rgba(230, 245, 247, 0.07)',
              border: '1px solid rgba(230, 245, 247, 0.16)',
              borderRadius: '24px',
              padding: '4px 6px 4px 14px',
              transition: 'all 0.2s ease',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--brand-accent, #397C80)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(230, 245, 247, 0.16)')}
          >
            {/* Search Input */}
            <div style={{ display: 'flex', alignItems: 'center', flex: 1, gap: '8px' }}>
              <Search size={15} color="var(--brand-pale-ice, #E6F5F7)" style={{ opacity: 0.6 }} />
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
                  color: '#FFFFFF',
                }}
              />
            </div>

            {/* Divider */}
            <div style={{ width: '1px', height: '20px', backgroundColor: 'rgba(230, 245, 247, 0.15)', margin: '0 8px' }} />

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
                  color: 'var(--brand-pale-ice, #E6F5F7)',
                  cursor: 'pointer',
                  padding: '5px 8px',
                  borderRadius: '16px',
                }}
              >
                <MapPin size={13} color="var(--brand-accent, #397C80)" />
                <span style={{ maxWidth: '85px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {selectedCity}
                </span>
                <ChevronDown size={12} color="rgba(230, 245, 247, 0.6)" />
              </button>

              {isCityDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '120%',
                    right: 0,
                    width: '180px',
                    backgroundColor: 'var(--brand-secondary, #111831)',
                    border: '1px solid rgba(230, 245, 247, 0.15)',
                    borderRadius: '10px',
                    boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
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
                        background: selectedCity === c ? 'rgba(57, 124, 128, 0.25)' : 'transparent',
                        border: 'none',
                        color: selectedCity === c ? 'var(--brand-pale-ice, #E6F5F7)' : 'rgba(230, 245, 247, 0.8)',
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
            <div style={{ width: '1px', height: '20px', backgroundColor: 'rgba(230, 245, 247, 0.15)', margin: '0 8px' }} />

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
                  color: 'var(--brand-pale-ice, #E6F5F7)',
                  cursor: 'pointer',
                  padding: '5px 8px',
                  borderRadius: '16px',
                }}
              >
                <Calendar size={13} color="var(--brand-warm-accent, #D6BE92)" />
                <span>{DATES.find((d) => d.value === selectedDate)?.label || 'All Dates'}</span>
                <ChevronDown size={12} color="rgba(230, 245, 247, 0.6)" />
              </button>

              {isDateDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '120%',
                    right: 0,
                    width: '160px',
                    backgroundColor: 'var(--brand-secondary, #111831)',
                    border: '1px solid rgba(230, 245, 247, 0.15)',
                    borderRadius: '10px',
                    boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
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
                        background: selectedDate === d.value ? 'rgba(57, 124, 128, 0.25)' : 'transparent',
                        border: 'none',
                        color: selectedDate === d.value ? 'var(--brand-pale-ice, #E6F5F7)' : 'rgba(230, 245, 247, 0.8)',
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
                backgroundColor: 'var(--brand-accent, #397C80)',
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
                  color: 'var(--brand-pale-ice, #E6F5F7)',
                  backgroundColor: 'rgba(230, 245, 247, 0.1)',
                  border: '1px solid rgba(230, 245, 247, 0.2)',
                  borderRadius: '20px',
                  padding: '6px 14px',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(230, 245, 247, 0.18)';
                  e.currentTarget.style.borderColor = 'var(--brand-pale-ice, #E6F5F7)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(230, 245, 247, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(230, 245, 247, 0.2)';
                }}
              >
                <PlusCircle size={15} color="var(--brand-accent, #397C80)" />
                <span>Create Event</span>
              </Link>

              <Link
                to="/organizer"
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--brand-pale-ice, #E6F5F7)',
                  textDecoration: 'none',
                  padding: '6px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--brand-pale-ice, #E6F5F7)')}
              >
                <LayoutDashboard size={15} color="var(--brand-accent, #397C80)" />
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
              color: 'var(--brand-pale-ice, #E6F5F7)',
              cursor: 'pointer',
              padding: '6px 10px',
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--brand-pale-ice, #E6F5F7)')}
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
                    background: 'rgba(230, 245, 247, 0.08)',
                    border: '1px solid rgba(230, 245, 247, 0.2)',
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
                      backgroundColor: 'var(--brand-accent, #397C80)',
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
                      color: 'var(--brand-pale-ice, #E6F5F7)',
                      maxWidth: '100px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {user.firstName || 'My Account'}
                  </span>
                  <ChevronDown size={13} color="rgba(230, 245, 247, 0.7)" />
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
                      border: '1px solid var(--border-subtle, #E1E7EC)',
                      borderRadius: '12px',
                      boxShadow: '0 12px 36px rgba(11, 16, 37, 0.2)',
                      zIndex: 1100,
                      overflow: 'hidden',
                    }}
                  >
                    {/* Account Header */}
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid #F0F0F0', backgroundColor: '#FAFAFA' }}>
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#1F1F1F' }}>
                        {user.firstName} {user.lastName}
                      </p>
                      <p style={{ margin: '2px 0 6px 0', fontSize: '12px', color: '#6B6B6B' }}>{user.email}</p>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            backgroundColor: isOrganizer ? '#ECFDF5' : '#FFFBEB',
                            color: isOrganizer ? '#059669' : '#D97706',
                            border: `1px solid ${isOrganizer ? '#A7F3D0' : '#FDE68A'}`,
                          }}
                        >
                          {isAdmin ? 'ADMIN' : isOrganizer ? 'ORGANIZER' : 'ATTENDEE'}
                        </span>

                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--brand-accent, #397C80)' }}>
                          {formatNaira(user.balance || 0)}
                        </span>
                      </div>
                    </div>

                    {/* Nav Links */}
                    <div style={{ padding: '6px 0' }}>
                      <Link
                        to="/tickets"
                        onClick={() => setIsUserMenuOpen(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', fontSize: '13px', color: '#1F1F1F', textDecoration: 'none' }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8F9FA')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <Ticket size={16} color="var(--brand-accent, #397C80)" /> My Tickets
                      </Link>

                      {/* Organizer Links for approved organizers only */}
                      {isOrganizer && (
                        <>
                          <Link
                            to="/organizer"
                            onClick={() => setIsUserMenuOpen(false)}
                            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', fontSize: '13px', color: '#1F1F1F', textDecoration: 'none' }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8F9FA')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            <LayoutDashboard size={16} color="var(--brand-accent, #397C80)" /> Organizer Dashboard
                          </Link>
                          <Link
                            to="/create"
                            onClick={() => setIsUserMenuOpen(false)}
                            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', fontSize: '13px', color: '#1F1F1F', textDecoration: 'none' }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8F9FA')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            <PlusCircle size={16} color="var(--brand-accent, #397C80)" /> Create Event
                          </Link>
                        </>
                      )}

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', fontSize: '13px', color: 'var(--brand-primary, #0B1025)', fontWeight: 600, textDecoration: 'none', backgroundColor: 'rgba(57, 124, 128, 0.08)' }}
                        >
                          <Shield size={16} color="var(--brand-accent, #397C80)" /> Admin Console
                        </Link>
                      )}

                      <Link
                        to="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', fontSize: '13px', color: '#1F1F1F', textDecoration: 'none' }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8F9FA')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <Settings size={16} color="#6B6B6B" /> My Account & Settings
                      </Link>
                    </div>

                    {/* Sign Out */}
                    <div style={{ borderTop: '1px solid #F0F0F0', padding: '6px 0' }}>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Link
                  to="/login"
                  style={{
                    padding: '7px 16px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--brand-pale-ice, #E6F5F7)',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    border: '1px solid rgba(230, 245, 247, 0.3)',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(230, 245, 247, 0.1)';
                    e.currentTarget.style.borderColor = 'var(--brand-pale-ice, #E6F5F7)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = 'rgba(230, 245, 247, 0.3)';
                  }}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  style={{
                    padding: '7px 16px',
                    fontSize: '13px',
                    fontWeight: 600,
                    backgroundColor: 'var(--brand-accent, #397C80)',
                    color: '#FFFFFF',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    boxShadow: '0 2px 8px rgba(57, 124, 128, 0.3)',
                    transition: 'filter 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.filter = 'brightness(1)')}
                >
                  Register
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
                background: isMobileSearchOpen ? 'rgba(57, 124, 128, 0.25)' : 'transparent',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--brand-pale-ice, #E6F5F7)',
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
                background: isMobileMenuOpen ? 'rgba(57, 124, 128, 0.25)' : 'transparent',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--brand-pale-ice, #E6F5F7)',
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
            backgroundColor: 'var(--brand-secondary, #111831)',
            borderTop: '1px solid rgba(230, 245, 247, 0.1)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          }}
        >
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'rgba(230, 245, 247, 0.08)',
                border: '1px solid rgba(230, 245, 247, 0.2)',
                borderRadius: '8px',
                padding: '8px 12px',
                gap: '8px',
              }}
            >
              <Search size={16} color="var(--brand-pale-ice, #E6F5F7)" style={{ opacity: 0.7 }} />
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
                  color: '#FFFFFF',
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
                  backgroundColor: 'var(--brand-primary, #0B1025)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(230, 245, 247, 0.2)',
                  borderRadius: '6px',
                  minHeight: '44px',
                }}
              >
                {CITIES.map((c) => (
                  <option key={c} value={c} style={{ background: '#0B1025', color: '#FFF' }}>
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
                  backgroundColor: 'var(--brand-primary, #0B1025)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(230, 245, 247, 0.2)',
                  borderRadius: '6px',
                  minHeight: '44px',
                }}
              >
                {DATES.map((d) => (
                  <option key={d.label} value={d.value} style={{ background: '#0B1025', color: '#FFF' }}>
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
                backgroundColor: 'var(--brand-accent, #397C80)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
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
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
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
            backgroundColor: 'var(--brand-primary, #0B1025)',
            zIndex: 999,
            padding: '20px 20px 96px 20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {/* USER INFO HEADER (When signed in) */}
          {user && (
            <div
              style={{
                backgroundColor: 'rgba(230, 245, 247, 0.05)',
                border: '1px solid rgba(230, 245, 247, 0.12)',
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
                  backgroundColor: 'var(--brand-accent, #397C80)',
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
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.firstName} {user.lastName}
                </p>
                <p style={{ margin: '2px 0 6px 0', fontSize: '12px', color: 'rgba(230, 245, 247, 0.6)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.email}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '8px',
                      backgroundColor: isOrganizer ? 'rgba(57, 124, 128, 0.25)' : 'rgba(214, 190, 146, 0.2)',
                      color: isOrganizer ? 'var(--brand-pale-ice, #E6F5F7)' : 'var(--brand-warm-accent, #D6BE92)',
                      border: `1px solid ${isOrganizer ? 'rgba(57, 124, 128, 0.5)' : 'rgba(214, 190, 146, 0.4)'}`,
                    }}
                  >
                    {isAdmin ? 'ADMIN' : isOrganizer ? 'ORGANIZER' : isPending ? 'PENDING APPROVAL' : 'ATTENDEE'}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--brand-pale-ice, #E6F5F7)' }}>
                    {formatNaira(user.balance || 0)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ROLE 1: SIGNED-OUT MENU */}
          {!user && (
            <>
              {/* Auth Actions in Drawer for Signed-Out Users */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--brand-warm-accent, #D6BE92)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Account Access
                </span>
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
                    color: 'var(--brand-pale-ice, #E6F5F7)',
                    backgroundColor: 'rgba(230, 245, 247, 0.08)',
                    borderRadius: '8px',
                    border: '1px solid rgba(230, 245, 247, 0.2)',
                    textDecoration: 'none',
                  }}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{
                    minHeight: '46px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    backgroundColor: 'var(--brand-accent, #397C80)',
                    borderRadius: '8px',
                    textDecoration: 'none',
                  }}
                >
                  Create Account
                </Link>
              </div>

              {/* Discover & Categories */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--brand-warm-accent, #D6BE92)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Explore Events
                </span>
                {[
                  { label: 'Discover Home', path: '/home' },
                  { label: 'Browse All Events', path: '/explore' },
                  { label: 'Concerts & Live Music', path: '/explore?category=Concerts' },
                  { label: 'Festivals & Culture', path: '/explore?category=Festivals' },
                  { label: 'Sports & Fitness', path: '/explore?category=Sports' },
                  { label: 'Nightlife & Parties', path: '/explore?category=Nightlife%20%26%20Parties' },
                ].map((cat) => (
                  <Link
                    key={cat.label}
                    to={cat.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{
                      minHeight: '44px',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '8px 0',
                      fontSize: '15px',
                      fontWeight: 600,
                      color: 'var(--brand-pale-ice, #E6F5F7)',
                      textDecoration: 'none',
                      borderBottom: '1px solid rgba(230, 245, 247, 0.08)',
                    }}
                  >
                    {cat.label}
                  </Link>
                ))}
              </div>
            </>
          )}

          {/* ROLE 2: ATTENDEE MENU (Ordinary authenticated user - NO Sell, NO Organizer) */}
          {user && !isOrganizer && (
            <>
              {/* Attendee Navigation */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--brand-warm-accent, #D6BE92)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
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
                    padding: '8px 0',
                    fontSize: '15px',
                    fontWeight: 600,
                    color: 'var(--brand-pale-ice, #E6F5F7)',
                    textDecoration: 'none',
                    borderBottom: '1px solid rgba(230, 245, 247, 0.08)',
                  }}
                >
                  <Ticket size={18} color="var(--brand-accent, #397C80)" />
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
                    padding: '8px 0',
                    fontSize: '15px',
                    fontWeight: 600,
                    color: 'var(--brand-pale-ice, #E6F5F7)',
                    textDecoration: 'none',
                    borderBottom: '1px solid rgba(230, 245, 247, 0.08)',
                  }}
                >
                  <User size={18} color="var(--brand-accent, #397C80)" />
                  My Account & Settings
                </Link>
              </div>

              {/* Browse Events */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--brand-warm-accent, #D6BE92)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Explore Events
                </span>
                <Link
                  to="/home"
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{ minHeight: '44px', display: 'flex', alignItems: 'center', padding: '8px 0', fontSize: '15px', fontWeight: 600, color: 'var(--brand-pale-ice, #E6F5F7)', textDecoration: 'none', borderBottom: '1px solid rgba(230, 245, 247, 0.08)' }}
                >
                  Discover Home
                </Link>
                <Link
                  to="/explore"
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{ minHeight: '44px', display: 'flex', alignItems: 'center', padding: '8px 0', fontSize: '15px', fontWeight: 600, color: 'var(--brand-pale-ice, #E6F5F7)', textDecoration: 'none', borderBottom: '1px solid rgba(230, 245, 247, 0.08)' }}
                >
                  Browse All Events
                </Link>
              </div>
            </>
          )}

          {/* ROLE 3: APPROVED ORGANIZER / ADMIN MENU */}
          {user && isOrganizer && (
            <>
              {/* Organizer Management Tools */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--brand-warm-accent, #D6BE92)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Organizer Management
                </span>
                <Link
                  to="/organizer"
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 0',
                    fontSize: '15px',
                    fontWeight: 600,
                    color: 'var(--brand-pale-ice, #E6F5F7)',
                    textDecoration: 'none',
                    borderBottom: '1px solid rgba(230, 245, 247, 0.08)',
                  }}
                >
                  <LayoutDashboard size={18} color="var(--brand-accent, #397C80)" />
                  Organizer Dashboard
                </Link>
                <Link
                  to="/create"
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 0',
                    fontSize: '15px',
                    fontWeight: 600,
                    color: 'var(--brand-pale-ice, #E6F5F7)',
                    textDecoration: 'none',
                    borderBottom: '1px solid rgba(230, 245, 247, 0.08)',
                  }}
                >
                  <PlusCircle size={18} color="var(--brand-accent, #397C80)" />
                  Create New Event
                </Link>
                <Link
                  to="/organizer/events"
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 0',
                    fontSize: '15px',
                    fontWeight: 600,
                    color: 'var(--brand-pale-ice, #E6F5F7)',
                    textDecoration: 'none',
                    borderBottom: '1px solid rgba(230, 245, 247, 0.08)',
                  }}
                >
                  <Calendar size={18} color="var(--brand-accent, #397C80)" />
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
                    padding: '8px 0',
                    fontSize: '15px',
                    fontWeight: 600,
                    color: 'var(--brand-pale-ice, #E6F5F7)',
                    textDecoration: 'none',
                    borderBottom: '1px solid rgba(230, 245, 247, 0.08)',
                  }}
                >
                  <Search size={18} color="var(--brand-accent, #397C80)" />
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
                      padding: '8px 0',
                      fontSize: '15px',
                      fontWeight: 700,
                      color: 'var(--brand-accent, #397C80)',
                      textDecoration: 'none',
                      borderBottom: '1px solid rgba(230, 245, 247, 0.08)',
                    }}
                  >
                    <Shield size={18} color="var(--brand-accent, #397C80)" />
                    Admin Console
                  </Link>
                )}
              </div>

              {/* Personal & Discovery */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--brand-warm-accent, #D6BE92)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Personal & Discovery
                </span>
                <Link
                  to="/home"
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{ minHeight: '44px', display: 'flex', alignItems: 'center', padding: '8px 0', fontSize: '15px', fontWeight: 600, color: 'var(--brand-pale-ice, #E6F5F7)', textDecoration: 'none', borderBottom: '1px solid rgba(230, 245, 247, 0.08)' }}
                >
                  Discover Home
                </Link>
                <Link
                  to="/explore"
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{ minHeight: '44px', display: 'flex', alignItems: 'center', padding: '8px 0', fontSize: '15px', fontWeight: 600, color: 'var(--brand-pale-ice, #E6F5F7)', textDecoration: 'none', borderBottom: '1px solid rgba(230, 245, 247, 0.08)' }}
                >
                  Browse All Events
                </Link>
                <Link
                  to="/tickets"
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{ minHeight: '44px', display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', fontSize: '15px', fontWeight: 600, color: 'var(--brand-pale-ice, #E6F5F7)', textDecoration: 'none', borderBottom: '1px solid rgba(230, 245, 247, 0.08)' }}
                >
                  <Ticket size={18} color="var(--brand-accent, #397C80)" />
                  My Personal Tickets
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{ minHeight: '44px', display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', fontSize: '15px', fontWeight: 600, color: 'var(--brand-pale-ice, #E6F5F7)', textDecoration: 'none', borderBottom: '1px solid rgba(230, 245, 247, 0.08)' }}
                >
                  <User size={18} color="var(--brand-accent, #397C80)" />
                  My Account & Settings
                </Link>
              </div>
            </>
          )}

          {/* Help & Support Button (For all users) */}
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
              padding: '8px 0',
              fontSize: '15px',
              fontWeight: 600,
              color: 'rgba(230, 245, 247, 0.8)',
              background: 'transparent',
              border: 'none',
              borderBottom: '1px solid rgba(230, 245, 247, 0.08)',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
            }}
          >
            <HelpCircle size={18} color="var(--brand-warm-accent, #D6BE92)" />
            Help & FAQs
          </button>

          {/* Sign Out Button (When authenticated) */}
          {user && (
            <button
              onClick={handleLogout}
              style={{
                marginTop: '12px',
                minHeight: '46px',
                padding: '12px',
                color: '#F87171',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
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
            backgroundColor: 'rgba(11, 16, 37, 0.75)',
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
              boxShadow: '0 20px 40px rgba(11, 16, 37, 0.3)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HelpCircle size={22} color="var(--brand-accent, #397C80)" />
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--brand-primary, #0B1025)' }}>
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
                  color: '#6B6B6B',
                  padding: '4px',
                }}
                aria-label="Close help modal"
              >
                ×
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px', color: '#4B4B4B' }}>
              <div>
                <p style={{ fontWeight: 700, color: '#1F1F1F', margin: '0 0 4px' }}>How do Paystack payments work?</p>
                <p style={{ margin: 0 }}>All transactions are processed securely in Nigerian Naira (₦) through Paystack with instant receipt and digital ticket issuance.</p>
              </div>

              <div>
                <p style={{ fontWeight: 700, color: '#1F1F1F', margin: '0 0 4px' }}>Where do I find my tickets?</p>
                <p style={{ margin: 0 }}>Tickets and free event passes are stored in your account under "My Tickets" with unique verification QR codes.</p>
              </div>

              <div>
                <p style={{ fontWeight: 700, color: '#1F1F1F', margin: '0 0 4px' }}>How do organizer payouts work?</p>
                <p style={{ margin: 0 }}>Approved organizers can request withdrawals to any verified Nigerian bank account directly from the Organizer Payouts dashboard.</p>
              </div>
            </div>

            <button
              className="btn-primary"
              style={{ width: '100%', marginTop: '20px', minHeight: '44px', padding: '12px', fontSize: '14px' }}
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
