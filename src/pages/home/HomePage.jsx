import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout.jsx';
import EventCard from '../../components/events/EventCard.jsx';
import EventCardSkeleton from '../../components/events/EventCardSkeleton.jsx';
import api from '../../lib/axios.js';
import {
  Search,
  MapPin,
  Calendar,
  Sparkles,
  ArrowRight,
  Music,
  Trophy,
  Drama,
  Users,
  CheckCircle,
  Tag,
  Zap,
  ShieldCheck,
  QrCode,
  CreditCard,
  TrendingUp,
  Ticket,
  ChevronRight,
  Layers,
  Banknote,
  Smartphone,
  Flame,
} from 'lucide-react';

const CATEGORIES = [
  { id: 'All', label: 'All Experiences', icon: Flame },
  { id: 'Concerts', label: 'Concerts & Music', icon: Music },
  { id: 'Festivals', label: 'Festivals & Culture', icon: Sparkles },
  { id: 'Nightlife & Parties', label: 'Nightlife & Parties', icon: Zap },
  { id: 'Sports', label: 'Sports & Gaming', icon: Trophy },
  { id: 'Arts & Theater', label: 'Arts & Theater', icon: Drama },
  { id: 'Family', label: 'Tech, Campus & Business', icon: Users },
];

const NIGERIAN_HUBS = [
  {
    name: 'Lagos',
    state: 'Lagos State',
    image: 'https://images.unsplash.com/photo-1618828665011-0abb72338b23?w=600&auto=format&fit=crop&q=80',
    highlight: 'Victoria Island, Landmark & Ikeja',
  },
  {
    name: 'Abuja',
    state: 'FCT',
    image: 'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?w=600&auto=format&fit=crop&q=80',
    highlight: 'Maitama, Central Area & Baze',
  },
  {
    name: 'Port Harcourt',
    state: 'Rivers',
    image: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=600&auto=format&fit=crop&q=80',
    highlight: 'Garden City Concerts & Festivals',
  },
  {
    name: 'Ibadan',
    state: 'Oyo',
    image: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?w=600&auto=format&fit=crop&q=80',
    highlight: 'Live Shows & Campus Summits',
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCity, setSearchCity] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/events?limit=32');
      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      setEvents(list);
    } catch (err) {
      console.error('Failed to load events:', err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (searchCity) params.set('city', searchCity);
    navigate(`/explore?${params.toString()}`);
  };

  // Curated event groupings from live API
  const freeEvents = events.filter((e) => e.admissionType === 'FREE' || e.isFree || e.minPrice === 0);
  const featuredEvent = events.find((e) => e.featured) || events[0];

  const filteredEvents =
    selectedCategory === 'All'
      ? events
      : events.filter((e) => e.category?.toLowerCase().includes(selectedCategory.toLowerCase()));

  return (
    <AppLayout>
      {/* =========================================================================
          SECTION 2: EDITORIAL HERO SECTION (Warm, inviting, modern tone)
          ========================================================================= */}
      <section
        style={{
          background: 'linear-gradient(180deg, #FFF4EE 0%, #FFFFFF 100%)',
          position: 'relative',
          overflow: 'hidden',
          padding: '48px 0 64px',
          borderBottom: '1px solid var(--color-border, #E7E5E4)',
        }}
      >
        {/* Subtle decorative warm accents */}
        <div
          style={{
            position: 'absolute',
            top: '-15%',
            right: '-10%',
            width: '520px',
            height: '520px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 90, 95, 0.12) 0%, rgba(255, 138, 61, 0.05) 50%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-20%',
            left: '-10%',
            width: '460px',
            height: '460px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 138, 61, 0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div className="tm-container" style={{ position: 'relative', zIndex: 1, padding: '0 16px' }}>
          <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center' }}>
            {/* Eyebrow Pill */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#FFFFFF',
                border: '1px solid rgba(255, 90, 95, 0.25)',
                color: 'var(--color-primary, #FF5A5F)',
                padding: '6px 16px',
                borderRadius: '24px',
                fontSize: '12.5px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                marginBottom: '20px',
                boxShadow: '0 2px 8px rgba(255, 90, 95, 0.08)',
              }}
            >
              <Sparkles size={14} color="var(--color-secondary, #FF8A3D)" />
              <span>Nigeria's Live Experiences & Ticketing Platform</span>
            </div>

            {/* Headline */}
            <h1
              style={{
                fontSize: 'clamp(32px, 5.5vw, 56px)',
                fontWeight: 900,
                lineHeight: 1.15,
                color: 'var(--color-text-primary, #292524)',
                letterSpacing: '-0.03em',
                marginBottom: '18px',
              }}
            >
              Your next unforgettable experience starts here.
            </h1>

            {/* Subhead */}
            <p
              style={{
                fontSize: 'clamp(15px, 2vw, 18px)',
                lineHeight: 1.55,
                color: 'var(--color-text-secondary, #57534E)',
                marginBottom: '32px',
                maxWidth: '680px',
                margin: '0 auto 32px',
              }}
            >
              Discover concerts, festivals, conferences, comedy shows, campus events, and gatherings happening around you. Get your tickets or register for free events in seconds.
            </p>

            {/* Interactive Search Bar in Hero */}
            <form
              onSubmit={handleHeroSearch}
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#FFFFFF',
                border: '1.5px solid var(--color-border, #E7E5E4)',
                borderRadius: '36px',
                padding: '6px 6px 6px 16px',
                boxShadow: '0 12px 36px rgba(41, 37, 36, 0.08)',
                maxWidth: '640px',
                width: '100%',
                margin: '0 auto 24px',
                boxSizing: 'border-box',
                gap: '8px',
              }}
            >
              <Search size={18} color="var(--color-primary, #FF5A5F)" style={{ flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search events, artists, venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: 0,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--color-text-primary, #292524)',
                  fontSize: '14.5px',
                }}
              />

              {/* City Quick Picker */}
              <select
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                style={{
                  border: 'none',
                  background: 'var(--color-surface-soft, #FFF4EE)',
                  color: 'var(--color-text-primary, #292524)',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  padding: '8px 12px',
                  borderRadius: '20px',
                  outline: 'none',
                  cursor: 'pointer',
                  maxWidth: '120px',
                }}
                className="desktop-only"
              >
                <option value="">All Cities</option>
                <option value="Lagos">Lagos</option>
                <option value="Abuja">Abuja</option>
                <option value="Port Harcourt">Port Harcourt</option>
                <option value="Ibadan">Ibadan</option>
              </select>

              <button
                type="submit"
                style={{
                  backgroundColor: 'var(--color-primary, #FF5A5F)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '24px',
                  padding: '12px 22px',
                  boxShadow: '0 4px 14px rgba(255, 90, 95, 0.3)',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'background-color 0.15s ease',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-primary-hover, #E94B50)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-primary, #FF5A5F)')}
              >
                <span>Explore</span>
                <ArrowRight size={14} />
              </button>
            </form>

            {/* Dual CTAs & Trust Badges */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
              <Link
                to="/explore"
                className="btn-primary"
                style={{
                  padding: '12px 26px',
                  fontSize: '14px',
                  fontWeight: 700,
                  borderRadius: '10px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Ticket size={16} />
                Explore Events
              </Link>
              <Link
                to="/create"
                style={{
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: 700,
                  borderRadius: '10px',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--color-secondary, #FF8A3D)',
                  border: '1.5px solid var(--color-secondary, #FF8A3D)',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-surface-soft, #FFF4EE)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                }}
              >
                <span>Create an Event</span>
                <ChevronRight size={15} />
              </Link>
            </div>

            {/* Trust Assurances */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '20px',
                flexWrap: 'wrap',
                fontSize: '12.5px',
                color: 'var(--color-text-secondary, #57534E)',
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={14} color="var(--color-primary, #FF5A5F)" /> Verified Paystack Processing
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={14} color="var(--color-secondary, #FF8A3D)" /> Free & Paid Admission
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={14} color="#16A34A" /> Instant QR Passes
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          CATEGORY TABS BAR (Quick Discovery Chips)
          ========================================================================= */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid var(--color-border, #E7E5E4)',
          position: 'sticky',
          top: '70px',
          zIndex: 100,
          boxShadow: '0 2px 8px rgba(41, 37, 36, 0.03)',
        }}
      >
        <div className="tm-container" style={{ padding: '12px 16px', display: 'flex', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '24px',
                  fontSize: '13px',
                  fontWeight: isSelected ? 700 : 500,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  border: isSelected ? '1.5px solid var(--color-primary, #FF5A5F)' : '1px solid var(--color-border, #E7E5E4)',
                  backgroundColor: isSelected ? 'var(--color-surface-soft, #FFF4EE)' : '#FFFFFF',
                  color: isSelected ? 'var(--color-primary, #FF5A5F)' : 'var(--color-text-secondary, #57534E)',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={14} color={isSelected ? 'var(--color-primary, #FF5A5F)' : 'var(--color-text-secondary, #57534E)'} />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="tm-container" style={{ padding: '40px 16px' }}>
        {/* =========================================================================
            SECTION 3: EVENT DISCOVERY PREVIEW ("There's always something happening.")
            ========================================================================= */}
        <section style={{ marginBottom: '56px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: 'var(--color-secondary, #FF8A3D)',
                  letterSpacing: '0.06em',
                  marginBottom: '4px',
                }}
              >
                Live Discovery
              </div>
              <h2 style={{ fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: 800, color: 'var(--color-text-primary, #292524)', margin: 0 }}>
                There's always something happening.
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary, #57534E)', margin: '4px 0 0 0' }}>
                Curated live experiences, concerts, conferences, and community gatherings happening across Nigeria.
              </p>
            </div>
            <Link
              to="/explore"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '14px',
                fontWeight: 700,
                color: 'var(--color-primary, #FF5A5F)',
                textDecoration: 'none',
              }}
            >
              <span>Browse All Events</span>
              <ChevronRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {[1, 2, 3, 4].map((n) => (
                <EventCardSkeleton key={n} />
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 20px',
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid var(--color-border, #E7E5E4)',
              }}
            >
              <Flame size={40} color="var(--color-border, #E7E5E4)" style={{ marginBottom: '12px' }} />
              <p style={{ fontSize: '17px', fontWeight: 700, color: 'var(--color-text-primary, #292524)', margin: '0 0 6px 0' }}>
                No events found in this category right now
              </p>
              <p style={{ fontSize: '13.5px', color: 'var(--color-text-secondary, #57534E)', margin: '0 0 16px 0' }}>
                Try exploring all events or browse other entertainment categories.
              </p>
              <button
                className="btn-outline"
                style={{ padding: '8px 20px', fontSize: '13px' }}
                onClick={() => setSelectedCategory('All')}
              >
                View All Categories
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {filteredEvents.slice(0, 8).map((event) => (
                <EventCard key={event._id || event.id} event={event} />
              ))}
            </div>
          )}
        </section>

        {/* =========================================================================
            SECTION 4: WHY PEOPLE USE TICKZA (Attendee Value Props)
            ========================================================================= */}
        <section
          style={{
            marginBottom: '56px',
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            padding: '40px 24px',
            border: '1px solid var(--color-border, #E7E5E4)',
            boxShadow: '0 4px 20px rgba(41, 37, 36, 0.03)',
          }}
        >
          <div style={{ maxWidth: '640px', margin: '0 auto 36px', textAlign: 'center' }}>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 800,
                textTransform: 'uppercase',
                color: 'var(--color-primary, #FF5A5F)',
                letterSpacing: '0.06em',
                display: 'block',
                marginBottom: '6px',
              }}
            >
              The Tickza Experience
            </span>
            <h2 style={{ fontSize: 'clamp(22px, 3.5vw, 30px)', fontWeight: 800, color: 'var(--color-text-primary, #292524)', margin: '0 0 10px' }}>
              More than a ticket. It's your next experience.
            </h2>
            <p style={{ fontSize: '14.5px', color: 'var(--color-text-secondary, #57534E)', margin: 0, lineHeight: 1.5 }}>
              Built specifically for Nigerian attendees and organizers to make discovering, booking, and attending events effortless, transparent, and secure.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '24px',
            }}
          >
            {/* Value 1 */}
            <div
              style={{
                padding: '24px',
                borderRadius: '14px',
                backgroundColor: 'var(--color-surface-soft, #FFF4EE)',
                border: '1px solid rgba(255, 90, 95, 0.15)',
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-primary, #FF5A5F)',
                  marginBottom: '16px',
                  boxShadow: '0 2px 6px rgba(255, 90, 95, 0.15)',
                }}
              >
                <Sparkles size={20} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-text-primary, #292524)', margin: '0 0 6px' }}>
                Discover what's next
              </h3>
              <p style={{ fontSize: '13.5px', color: 'var(--color-text-secondary, #57534E)', margin: 0, lineHeight: 1.5 }}>
                From intimate acoustic nights to stadium concerts, comedy shows, and campus conferences — find what fits your vibe.
              </p>
            </div>

            {/* Value 2 */}
            <div
              style={{
                padding: '24px',
                borderRadius: '14px',
                backgroundColor: 'var(--color-surface-soft, #FFF4EE)',
                border: '1px solid rgba(255, 90, 95, 0.15)',
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-secondary, #FF8A3D)',
                  marginBottom: '16px',
                  boxShadow: '0 2px 6px rgba(255, 138, 61, 0.15)',
                }}
              >
                <CreditCard size={20} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-text-primary, #292524)', margin: '0 0 6px' }}>
                Book with confidence
              </h3>
              <p style={{ fontSize: '13.5px', color: 'var(--color-text-secondary, #57534E)', margin: 0, lineHeight: 1.5 }}>
                Direct Paystack integration ensures seamless payment in Nigerian Naira with cards, bank transfers, or USSD. Zero surprise charges.
              </p>
            </div>

            {/* Value 3 */}
            <div
              style={{
                padding: '24px',
                borderRadius: '14px',
                backgroundColor: 'var(--color-surface-soft, #FFF4EE)',
                border: '1px solid rgba(255, 90, 95, 0.15)',
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#16A34A',
                  marginBottom: '16px',
                  boxShadow: '0 2px 6px rgba(22, 163, 74, 0.15)',
                }}
              >
                <QrCode size={20} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-text-primary, #292524)', margin: '0 0 6px' }}>
                Keep passes together
              </h3>
              <p style={{ fontSize: '13.5px', color: 'var(--color-text-secondary, #57534E)', margin: 0, lineHeight: 1.5 }}>
                Your tickets and free admission passes are instantly issued and permanently stored in your account, ready for gate entry anytime.
              </p>
            </div>

            {/* Value 4 */}
            <div
              style={{
                padding: '24px',
                borderRadius: '14px',
                backgroundColor: 'var(--color-surface-soft, #FFF4EE)',
                border: '1px solid rgba(255, 90, 95, 0.15)',
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-primary, #FF5A5F)',
                  marginBottom: '16px',
                  boxShadow: '0 2px 6px rgba(255, 90, 95, 0.15)',
                }}
              >
                <Smartphone size={20} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-text-primary, #292524)', margin: '0 0 6px' }}>
                Show up ready
              </h3>
              <p style={{ fontSize: '13.5px', color: 'var(--color-text-secondary, #57534E)', margin: 0, lineHeight: 1.5 }}>
                No printing required. Simply show your digital QR code on your mobile phone at the gate for fast, touchless verification.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 5: DEDICATED ORGANIZER & VENDOR SECTION (id="for-organizers")
            ========================================================================= */}
        <section
          id="for-organizers"
          style={{
            marginBottom: '56px',
            backgroundColor: '#1C1917',
            borderRadius: '24px',
            padding: '48px 28px',
            color: '#FFFFFF',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 12px 36px rgba(28, 25, 23, 0.35)',
          }}
        >
          {/* Subtle warm glow background */}
          <div
            style={{
              position: 'absolute',
              top: '-30%',
              right: '-15%',
              width: '500px',
              height: '500px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255, 90, 95, 0.18) 0%, rgba(255, 138, 61, 0.08) 50%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ position: 'relative', zIndex: 1, maxWidth: '840px', margin: '0 auto', textAlign: 'center' }}>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 800,
                textTransform: 'uppercase',
                color: 'var(--color-secondary, #FF8A3D)',
                letterSpacing: '0.08em',
                display: 'inline-block',
                marginBottom: '8px',
              }}
            >
              For Event Organizers & Promoters
            </span>
            <h2
              style={{
                fontSize: 'clamp(24px, 4vw, 36px)',
                fontWeight: 900,
                color: '#FFFFFF',
                margin: '0 0 14px',
                lineHeight: 1.2,
              }}
            >
              You bring the vision. Tickza helps you make it happen.
            </h2>
            <p
              style={{
                fontSize: '15px',
                color: '#D6D3D1',
                margin: '0 auto 36px',
                maxWidth: '680px',
                lineHeight: 1.6,
              }}
            >
              Whether you're hosting an intimate workshop, a campus summit, or a 10,000-attendee stadium festival, Tickza gives you complete control over ticketing, registrations, attendee check-ins, and direct bank payouts.
            </p>

            {/* 5 Key Organizer Capabilities Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '16px',
                textAlign: 'left',
                marginBottom: '36px',
              }}
            >
              <div
                style={{
                  padding: '20px',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <Layers size={20} color="var(--color-primary, #FF5A5F)" style={{ marginBottom: '10px' }} />
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF', margin: '0 0 4px' }}>
                  Multi-Tier Tickets
                </h4>
                <p style={{ fontSize: '12.5px', color: '#A8A29E', margin: 0, lineHeight: 1.45 }}>
                  Set up Early Bird, VIP, Tables, or Free Admission Passes with individual capacity caps.
                </p>
              </div>

              <div
                style={{
                  padding: '20px',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <Banknote size={20} color="var(--color-secondary, #FF8A3D)" style={{ marginBottom: '10px' }} />
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF', margin: '0 0 4px' }}>
                  Direct Paystack Payouts
                </h4>
                <p style={{ fontSize: '12.5px', color: '#A8A29E', margin: 0, lineHeight: 1.45 }}>
                  Withdraw event earnings directly to your verified Nigerian commercial bank account seamlessly.
                </p>
              </div>

              <div
                style={{
                  padding: '20px',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <QrCode size={20} color="#16A34A" style={{ marginBottom: '10px' }} />
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF', margin: '0 0 4px' }}>
                  Built-in QR Scanner
                </h4>
                <p style={{ fontSize: '12.5px', color: '#A8A29E', margin: 0, lineHeight: 1.45 }}>
                  High-speed gate check-in directly using mobile phone cameras. Zero expensive hardware needed.
                </p>
              </div>

              <div
                style={{
                  padding: '20px',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <TrendingUp size={20} color="var(--color-primary, #FF5A5F)" style={{ marginBottom: '10px' }} />
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF', margin: '0 0 4px' }}>
                  Live Analytics
                </h4>
                <p style={{ fontSize: '12.5px', color: '#A8A29E', margin: 0, lineHeight: 1.45 }}>
                  Real-time visibility over sales volume, attendee roster, and gate check-in progress.
                </p>
              </div>
            </div>

            {/* Dual CTAs for Organizers */}
            <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                to="/create"
                style={{
                  backgroundColor: 'var(--color-primary, #FF5A5F)',
                  color: '#FFFFFF',
                  padding: '12px 28px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(255, 90, 95, 0.35)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>Start Organizing</span>
                <ArrowRight size={16} />
              </Link>
              <a
                href="#how-it-works"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  padding: '12px 22px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                See How It Works
              </a>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 6: HOW TICKZA WORKS (id="how-it-works")
            Two parallel journeys side-by-side: Attendee & Organizer
            ========================================================================= */}
        <section id="how-it-works" style={{ marginBottom: '56px' }}>
          <div style={{ maxWidth: '640px', margin: '0 auto 36px', textAlign: 'center' }}>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 800,
                textTransform: 'uppercase',
                color: 'var(--color-secondary, #FF8A3D)',
                letterSpacing: '0.06em',
                display: 'block',
                marginBottom: '6px',
              }}
            >
              Step-by-Step Flow
            </span>
            <h2 style={{ fontSize: 'clamp(22px, 3.5vw, 30px)', fontWeight: 800, color: 'var(--color-text-primary, #292524)', margin: '0 0 10px' }}>
              Simple from discovery to the main stage.
            </h2>
            <p style={{ fontSize: '14.5px', color: 'var(--color-text-secondary, #57534E)', margin: 0 }}>
              Whether you're attending or hosting, Tickza keeps every step effortless.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px',
            }}
          >
            {/* Column 1: For Attendees */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '30px 24px',
                border: '1.5px solid var(--color-border, #E7E5E4)',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'var(--color-primary, #FF5A5F)',
                  backgroundColor: 'var(--color-surface-soft, #FFF4EE)',
                  padding: '4px 12px',
                  borderRadius: '16px',
                  fontSize: '12px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  marginBottom: '16px',
                }}
              >
                <Ticket size={13} />
                For Attendees
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-surface-soft, #FFF4EE)',
                      color: 'var(--color-primary, #FF5A5F)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '13px',
                      flexShrink: 0,
                    }}
                  >
                    1
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary, #292524)' }}>
                      Find your event
                    </h4>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary, #57534E)', lineHeight: 1.45 }}>
                      Search by keyword, city, music genre, or discover zero-cost community gatherings.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-surface-soft, #FFF4EE)',
                      color: 'var(--color-primary, #FF5A5F)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '13px',
                      flexShrink: 0,
                    }}
                  >
                    2
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary, #292524)' }}>
                      Claim ticket or free pass
                    </h4>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary, #57534E)', lineHeight: 1.45 }}>
                      Instant Paystack checkout with any Nigerian bank card, transfer, or 1-click free registration.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-surface-soft, #FFF4EE)',
                      color: 'var(--color-primary, #FF5A5F)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '13px',
                      flexShrink: 0,
                    }}
                  >
                    3
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary, #292524)' }}>
                      Scan & enter seamlessly
                    </h4>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary, #57534E)', lineHeight: 1.45 }}>
                      Access your digital ticket from your phone and breeze through the gate in seconds.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: For Organizers */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '30px 24px',
                border: '1.5px solid var(--color-border, #E7E5E4)',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'var(--color-secondary, #FF8A3D)',
                  backgroundColor: '#FFF0E6',
                  padding: '4px 12px',
                  borderRadius: '16px',
                  fontSize: '12px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  marginBottom: '16px',
                }}
              >
                <Zap size={13} />
                For Organizers
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: '#FFF0E6',
                      color: 'var(--color-secondary, #FF8A3D)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '13px',
                      flexShrink: 0,
                    }}
                  >
                    1
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary, #292524)' }}>
                      Publish in 2 minutes
                    </h4>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary, #57534E)', lineHeight: 1.45 }}>
                      Set up event details, add ticket tiers with custom pricing, or offer free registration passes.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: '#FFF0E6',
                      color: 'var(--color-secondary, #FF8A3D)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '13px',
                      flexShrink: 0,
                    }}
                  >
                    2
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary, #292524)' }}>
                      Spread the word & sell
                    </h4>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary, #57534E)', lineHeight: 1.45 }}>
                      Share event links across social channels, track real-time sales, and manage attendee orders.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: '#FFF0E6',
                      color: 'var(--color-secondary, #FF8A3D)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '13px',
                      flexShrink: 0,
                    }}
                  >
                    3
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary, #292524)' }}>
                      Check-in & get paid
                    </h4>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary, #57534E)', lineHeight: 1.45 }}>
                      Scan tickets using the mobile camera scanner and withdraw earnings straight to your bank account.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 7: FREE EVENTS SHOWCASE
            ========================================================================= */}
        {freeEvents.length > 0 && (
          <section style={{ marginBottom: '56px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#16A34A',
                    fontSize: '12px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: '4px',
                  }}
                >
                  <Tag size={13} />
                  Zero Cost Admission
                </div>
                <h2 style={{ fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: 800, color: 'var(--color-text-primary, #292524)', margin: 0 }}>
                  Good experiences don't always need a ticket price.
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--color-text-secondary, #57534E)', margin: '4px 0 0 0' }}>
                  Discover workshops, open mics, campus rallies, community meetups, and worship gatherings with 100% free passes.
                </p>
              </div>

              <Link
                to="/explore?price=free"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: 'var(--color-primary, #FF5A5F)',
                  textDecoration: 'none',
                }}
              >
                <span>Discover Free Events</span>
                <ChevronRight size={16} />
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {freeEvents.slice(0, 4).map((ev) => (
                <EventCard key={ev._id || ev.id} event={ev} />
              ))}
            </div>
          </section>
        )}

        {/* =========================================================================
            SECTION 8: TOP ENTERTAINMENT HUBS
            ========================================================================= */}
        <section style={{ marginBottom: '56px' }}>
          <div style={{ marginBottom: '24px' }}>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 800,
                textTransform: 'uppercase',
                color: 'var(--color-secondary, #FF8A3D)',
                letterSpacing: '0.06em',
                display: 'block',
                marginBottom: '4px',
              }}
            >
              Major Cities
            </span>
            <h2 style={{ fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: 800, color: 'var(--color-text-primary, #292524)', margin: 0 }}>
              Top Entertainment Hubs in Nigeria
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary, #57534E)', margin: '4px 0 0 0' }}>
              Explore what's happening live across the country's most vibrant entertainment cities.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
            }}
          >
            {NIGERIAN_HUBS.map((hub) => (
              <div
                key={hub.name}
                onClick={() => navigate(`/explore?city=${encodeURIComponent(hub.name)}`)}
                style={{
                  position: 'relative',
                  height: '180px',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: '1px solid var(--color-border, #E7E5E4)',
                  boxShadow: '0 4px 16px rgba(41, 37, 36, 0.06)',
                }}
              >
                <img
                  src={hub.image}
                  alt={hub.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(28, 25, 23, 0.85) 0%, rgba(28, 25, 23, 0.2) 60%, transparent 100%)' }} />
                <div style={{ position: 'absolute', bottom: '16px', left: '16px', right: '16px', color: '#FFFFFF' }}>
                  <h4 style={{ margin: 0, fontSize: '19px', fontWeight: 800, color: '#FFFFFF' }}>
                    {hub.name}
                  </h4>
                  <span style={{ fontSize: '12px', color: '#E7E5E4', display: 'block', marginTop: '2px' }}>
                    {hub.highlight}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================================
            SECTION 8B: TRUST, CLARITY, AND PLATFORM VALUE
            ========================================================================= */}
        <section
          style={{
            marginBottom: '56px',
            backgroundColor: 'var(--color-surface-soft, #FFF4EE)',
            borderRadius: '20px',
            padding: '36px 24px',
            border: '1px solid rgba(255, 90, 95, 0.15)',
          }}
        >
          <div style={{ maxWidth: '640px', margin: '0 auto 32px', textAlign: 'center' }}>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 800,
                textTransform: 'uppercase',
                color: 'var(--color-primary, #FF5A5F)',
                letterSpacing: '0.06em',
                display: 'block',
                marginBottom: '6px',
              }}
            >
              Reliability Guaranteed
            </span>
            <h2 style={{ fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: 800, color: 'var(--color-text-primary, #292524)', margin: '0 0 8px' }}>
              Built on trust, speed, and reliability.
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary, #57534E)', margin: 0 }}>
              Everything we build ensures safety for both attendees and event organizers.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '20px',
            }}
          >
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <ShieldCheck size={22} color="var(--color-primary, #FF5A5F)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--color-text-primary, #292524)', margin: '0 0 3px' }}>
                  Paystack Verified
                </h4>
                <p style={{ fontSize: '12.5px', color: 'var(--color-text-secondary, #57534E)', margin: 0, lineHeight: 1.4 }}>
                  All financial transactions pass through 256-bit bank-grade encryption with instant receipts.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <QrCode size={22} color="var(--color-secondary, #FF8A3D)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--color-text-primary, #292524)', margin: '0 0 3px' }}>
                  Anti-Counterfeit Passes
                </h4>
                <p style={{ fontSize: '12.5px', color: 'var(--color-text-secondary, #57534E)', margin: 0, lineHeight: 1.4 }}>
                  Every pass contains an encrypted cryptographic hash that prevents duplicate or fake tickets.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <Tag size={22} color="#16A34A" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--color-text-primary, #292524)', margin: '0 0 3px' }}>
                  Transparent Naira Pricing
                </h4>
                <p style={{ fontSize: '12.5px', color: 'var(--color-text-secondary, #57534E)', margin: 0, lineHeight: 1.4 }}>
                  Prices shown are in Nigerian Naira (₦). No surprise conversion fees or hidden surcharges.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <Users size={22} color="var(--color-primary, #FF5A5F)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--color-text-primary, #292524)', margin: '0 0 3px' }}>
                  Dedicated Support
                </h4>
                <p style={{ fontSize: '12.5px', color: 'var(--color-text-secondary, #57534E)', margin: 0, lineHeight: 1.4 }}>
                  Responsive local support ready to assist attendees with pass issues and organizers with live events.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 9: FINAL CALL TO ACTION (Warm Dual CTAs)
            ========================================================================= */}
        <section
          style={{
            background: 'linear-gradient(135deg, #FF5A5F 0%, #FF8A3D 100%)',
            borderRadius: '24px',
            padding: '48px 28px',
            color: '#FFFFFF',
            textAlign: 'center',
            boxShadow: '0 12px 36px rgba(255, 90, 95, 0.3)',
          }}
        >
          <div style={{ maxWidth: '640px', margin: '0 auto' }}>
            <h2
              style={{
                fontSize: 'clamp(24px, 4vw, 36px)',
                fontWeight: 900,
                color: '#FFFFFF',
                margin: '0 0 12px',
                letterSpacing: '-0.02em',
              }}
            >
              Your next great experience is waiting.
            </h2>
            <p
              style={{
                fontSize: '15px',
                color: '#FFFFFF',
                opacity: 0.95,
                margin: '0 0 28px',
                lineHeight: 1.55,
              }}
            >
              Whether you're looking for your next weekend plan or hosting the city's biggest event, Tickza is built for you.
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                to="/explore"
                style={{
                  backgroundColor: '#FFFFFF',
                  color: 'var(--color-primary, #FF5A5F)',
                  padding: '12px 26px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>Find Your Next Event</span>
                <ArrowRight size={15} />
              </Link>
              <Link
                to="/create"
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  color: '#FFFFFF',
                  border: '1.5px solid rgba(255, 255, 255, 0.6)',
                  padding: '12px 22px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Host Your Event
              </Link>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
