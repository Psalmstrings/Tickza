import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout.jsx';
import EventCard from '../../components/events/EventCard.jsx';
import EventCardSkeleton from '../../components/events/EventCardSkeleton.jsx';
import api from '../../lib/axios.js';
import {
  ChevronRight,
  MapPin,
  Calendar,
  Sparkles,
  Flame,
  ArrowRight,
  Music,
  Trophy,
  Drama,
  Users,
  Search,
  CheckCircle,
  Tag,
  Zap,
} from 'lucide-react';

const CATEGORIES = [
  { id: 'All', label: 'All Events', icon: Flame },
  { id: 'Concerts', label: 'Concerts', icon: Music },
  { id: 'Festivals', label: 'Festivals', icon: Sparkles },
  { id: 'Sports', label: 'Sports', icon: Trophy },
  { id: 'Nightlife & Parties', label: 'Parties & Nightlife', icon: Zap },
  { id: 'Arts & Theater', label: 'Arts & Theater', icon: Drama },
  { id: 'Family', label: 'Family & Tech', icon: Users },
];

const NIGERIAN_HUBS = [
  {
    name: 'Lagos',
    state: 'Lagos State',
    image: 'https://images.unsplash.com/photo-1618828665011-0abb72338b23?w=600&auto=format&fit=crop&q=80',
    highlight: 'Eko Hotel, Landmark & Victoria Island',
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
    highlight: 'Live Shows & Campus Festivals',
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

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
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/explore');
    }
  };

  // Group events for curated sections
  const heroEvent = events.find((e) => e.featured) || events[0];
  const freeEvents = events.filter((e) => e.admissionType === 'FREE' || e.isFree || e.minPrice === 0);
  const concerts = events.filter((e) => e.category?.match(/music|concert|festival/i));
  const sports = events.filter((e) => e.category?.match(/sport|tournament|match/i));

  const filteredEvents =
    selectedCategory === 'All'
      ? events
      : events.filter((e) => e.category?.toLowerCase().includes(selectedCategory.toLowerCase()));

  return (
    <AppLayout>
      {/* ===== BRAND HERO SECTION (Midnight Navy & Pale Ice) ===== */}
      <section
        style={{
          backgroundColor: 'var(--brand-primary, #0B1025)',
          color: '#FFFFFF',
          position: 'relative',
          overflow: 'hidden',
          padding: '60px 0 72px',
          borderBottom: '1px solid rgba(230, 245, 247, 0.1)',
        }}
      >
        {/* Subtle decorative glow */}
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(57, 124, 128, 0.25) 0%, rgba(11, 16, 37, 0) 70%)',
            pointerEvents: 'none',
          }}
        />

        <div className="tm-container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '780px', margin: '0 auto', textAlign: 'center' }}>
            {/* Brand Eyebrow Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(230, 245, 247, 0.08)',
                border: '1px solid rgba(230, 245, 247, 0.2)',
                color: 'var(--brand-pale-ice, #E6F5F7)',
                padding: '6px 16px',
                borderRadius: '24px',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: '20px',
              }}
            >
              <Sparkles size={14} color="var(--brand-warm-accent, #D6BE92)" />
              <span>Nigeria's Official Live Experience Platform</span>
            </div>

            {/* Official Headline */}
            <h1
              style={{
                fontSize: 'clamp(32px, 5.5vw, 54px)',
                fontWeight: 900,
                lineHeight: 1.12,
                color: 'var(--brand-pale-ice, #E6F5F7)',
                letterSpacing: '-0.03em',
                marginBottom: '16px',
              }}
            >
              Find your next unforgettable experience.
            </h1>

            {/* Official Subheadline */}
            <p
              style={{
                fontSize: 'clamp(15px, 2vw, 18px)',
                lineHeight: 1.5,
                color: 'rgba(230, 245, 247, 0.8)',
                marginBottom: '32px',
                maxWidth: '640px',
                margin: '0 auto 32px',
              }}
            >
              Discover concerts, festivals, sports, parties, and experiences worth showing up for across Nigeria.
            </p>

            {/* Interactive Search Bar in Hero */}
            <form
              onSubmit={handleHeroSearch}
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'var(--brand-secondary, #111831)',
                border: '1px solid rgba(230, 245, 247, 0.22)',
                borderRadius: '32px',
                padding: '5px 6px 5px 14px',
                boxShadow: '0 12px 36px rgba(0,0,0,0.4)',
                maxWidth: '620px',
                width: '100%',
                margin: '0 auto 28px',
                boxSizing: 'border-box',
              }}
            >
              <Search size={17} color="var(--brand-pale-ice, #E6F5F7)" style={{ opacity: 0.7, marginRight: '8px', flexShrink: 0 }} />
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
                  color: '#FFFFFF',
                  fontSize: '14px',
                }}
              />
              <button
                type="submit"
                style={{
                  backgroundColor: 'var(--brand-accent, #397C80)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '24px',
                  padding: '10px 18px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'filter 0.15s ease',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.12)')}
                onMouseLeave={(e) => (e.currentTarget.style.filter = 'brightness(1)')}
              >
                Explore <ArrowRight size={14} />
              </button>
            </form>

            {/* Trust Points */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '24px',
                flexWrap: 'wrap',
                fontSize: '12.5px',
                color: 'rgba(230, 245, 247, 0.7)',
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={14} color="var(--brand-accent, #397C80)" /> 100% Paystack Secured
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={14} color="var(--brand-accent, #397C80)" /> Instant QR Pass Issuance
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={14} color="var(--brand-accent, #397C80)" /> Verified Resale & Transfer
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURED EVENT SPOTLIGHT (If available) ===== */}
      {heroEvent && (
        <section style={{ backgroundColor: 'var(--brand-secondary, #111831)', padding: '24px 0', borderBottom: '1px solid rgba(230, 245, 247, 0.08)' }}>
          <div className="tm-container">
            <div
              style={{
                position: 'relative',
                borderRadius: '16px',
                overflow: 'hidden',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                backgroundColor: 'rgba(230, 245, 247, 0.04)',
                border: '1px solid rgba(230, 245, 247, 0.12)',
              }}
            >
              {/* Media preview */}
              <div
                style={{
                  minHeight: '260px',
                  background: `url(${
                    heroEvent.coverImage?.url || heroEvent.bannerImage || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1600&auto=format&fit=crop&q=80'
                  }) center/cover no-repeat`,
                  position: 'relative',
                }}
              >
                <div style={{ position: 'absolute', top: 14, left: 14 }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      backgroundColor: 'rgba(11, 16, 37, 0.85)',
                      backdropFilter: 'blur(4px)',
                      color: 'var(--brand-warm-accent, #D6BE92)',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    <Sparkles size={12} /> Spotlight
                  </span>
                </div>
              </div>

              {/* Spotlight Meta Details */}
              <div style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', color: '#FFFFFF' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--brand-accent, #397C80)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                  {heroEvent.category || 'Featured Event'}
                </span>
                <h3 style={{ fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: 800, color: 'var(--brand-pale-ice, #E6F5F7)', margin: '0 0 10px 0', lineHeight: 1.25 }}>
                  {heroEvent.title}
                </h3>
                <p style={{ fontSize: '13.5px', color: 'rgba(230, 245, 247, 0.75)', margin: '0 0 18px 0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} color="var(--brand-warm-accent, #D6BE92)" />
                    {heroEvent.startDate ? new Date(heroEvent.startDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'Dates Available'}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={14} color="var(--brand-warm-accent, #D6BE92)" />
                    {heroEvent.venue} {heroEvent.address ? `• ${heroEvent.address}` : ''}
                  </span>
                </p>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <button
                    onClick={() => navigate(`/events/${heroEvent._id || heroEvent.id}`)}
                    style={{
                      backgroundColor: 'var(--brand-accent, #397C80)',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 20px',
                      fontSize: '13.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    View Tickets <ArrowRight size={14} />
                  </button>
                  <span style={{ fontSize: '13px', color: 'rgba(230, 245, 247, 0.65)' }}>
                    Instant Paystack Checkout
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===== CATEGORY PILLS BAR ===== */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid var(--border-subtle, #E1E7EC)',
          position: 'sticky',
          top: '70px',
          zIndex: 100,
          boxShadow: '0 2px 8px rgba(11, 16, 37, 0.03)',
        }}
      >
        <div className="tm-container" style={{ padding: '12px 20px', display: 'flex', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none' }}>
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
                  padding: '7px 16px',
                  borderRadius: '24px',
                  fontSize: '13px',
                  fontWeight: isSelected ? 700 : 500,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  border: isSelected ? '1.5px solid var(--brand-accent, #397C80)' : '1px solid var(--border-subtle, #E1E7EC)',
                  backgroundColor: isSelected ? 'rgba(57, 124, 128, 0.1)' : '#FFFFFF',
                  color: isSelected ? 'var(--brand-accent, #397C80)' : 'var(--text-slate, #424B5D)',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={14} color={isSelected ? 'var(--brand-accent, #397C80)' : 'var(--text-muted, #788394)'} />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="tm-container" style={{ padding: '40px 20px' }}>
        {/* ===== POPULAR / TRENDING EXPERIENCES ===== */}
        <section style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--brand-primary, #0B1025)', margin: 0 }}>
                Popular in Nigeria
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted, #788394)', margin: '4px 0 0 0' }}>
                Top trending live events, bestselling tickets, and upcoming festivals.
              </p>
            </div>
            <Link
              to="/explore"
              style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13.5px', fontWeight: 700, color: 'var(--brand-accent, #397C80)', textDecoration: 'none' }}
            >
              See All <ChevronRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {[1, 2, 3, 4].map((n) => (
                <EventCardSkeleton key={n} />
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid var(--border-subtle, #E1E7EC)' }}>
              <Flame size={40} color="#D1D5DB" style={{ marginBottom: '12px' }} />
              <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--brand-primary, #0B1025)', margin: '0 0 6px 0' }}>
                No events found in this category
              </p>
              <p style={{ fontSize: '13px', color: 'var(--text-muted, #788394)', margin: '0 0 16px 0' }}>
                Check back soon or explore other entertainment categories.
              </p>
              <button className="btn-outline" onClick={() => setSelectedCategory('All')}>
                View All Events
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

        {/* ===== FREE PASSES & COMMUNITY EVENTS ROW ===== */}
        {freeEvents.length > 0 && selectedCategory === 'All' && (
          <section style={{ marginBottom: '48px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#059669', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <Tag size={13} /> Zero Cost Entry
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--brand-primary, #0B1025)', margin: '2px 0 0' }}>
                  Free Events & Passes
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--text-muted, #788394)', margin: '4px 0 0 0' }}>
                  Reserve your free QR pass without any checkout or payment required.
                </p>
              </div>
              <Link
                to="/explore?price=free"
                style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13.5px', fontWeight: 700, color: 'var(--brand-accent, #397C80)', textDecoration: 'none' }}
              >
                All Free Passes <ChevronRight size={16} />
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {freeEvents.slice(0, 4).map((ev) => (
                <EventCard key={ev._id || ev.id} event={ev} />
              ))}
            </div>
          </section>
        )}

        {/* ===== CONCERTS & FESTIVALS SHOWCASE ===== */}
        {concerts.length > 0 && selectedCategory === 'All' && (
          <section style={{ marginBottom: '48px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--brand-primary, #0B1025)', margin: 0 }}>
                  Concerts & Live Shows
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--text-muted, #788394)', margin: '4px 0 0 0' }}>
                  Afrobeats, headline live performances, and music tours.
                </p>
              </div>
              <Link
                to="/explore?category=Concerts"
                style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13.5px', fontWeight: 700, color: 'var(--brand-accent, #397C80)', textDecoration: 'none' }}
              >
                See All Concerts <ChevronRight size={16} />
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {concerts.slice(0, 4).map((ev) => (
                <EventCard key={ev._id || ev.id} event={ev} />
              ))}
            </div>
          </section>
        )}

        {/* ===== NIGERIAN EVENT HUBS ===== */}
        <section style={{ marginBottom: '48px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--brand-primary, #0B1025)', margin: 0 }}>
              Top Entertainment Hubs in Nigeria
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted, #788394)', margin: '4px 0 0 0' }}>
              Find live concerts, parties, and matches in top cities.
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
                  height: '170px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-card, 0 4px 16px rgba(11,16,37,0.08))',
                  border: '1px solid var(--border-subtle, #E1E7EC)',
                }}
              >
                <img
                  src={hub.image}
                  alt={hub.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(11,16,37,0.85) 0%, rgba(11,16,37,0.2) 60%, transparent 100%)' }} />
                <div style={{ position: 'absolute', bottom: '14px', left: '16px', right: '16px', color: '#FFFFFF' }}>
                  <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--brand-pale-ice, #E6F5F7)' }}>
                    {hub.name}
                  </h4>
                  <span style={{ fontSize: '11.5px', color: 'rgba(230, 245, 247, 0.75)', display: 'block', marginTop: '2px' }}>
                    {hub.highlight}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===== ORGANIZER CALL TO ACTION ===== */}
        <section
          style={{
            backgroundColor: 'var(--brand-primary, #0B1025)',
            borderRadius: '16px',
            padding: '40px 28px',
            color: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            border: '1px solid rgba(230, 245, 247, 0.1)',
            boxShadow: '0 12px 36px rgba(11, 16, 37, 0.25)',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'rgba(57, 124, 128, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              border: '1px solid rgba(57, 124, 128, 0.4)',
            }}
          >
            <Sparkles size={24} color="var(--brand-warm-accent, #D6BE92)" />
          </div>

          <h2 style={{ fontSize: 'clamp(22px, 3.5vw, 30px)', fontWeight: 800, color: 'var(--brand-pale-ice, #E6F5F7)', margin: '0 0 10px 0' }}>
            Are you an event organizer or promoter?
          </h2>
          <p style={{ fontSize: '15px', color: 'rgba(230, 245, 247, 0.75)', maxWidth: '580px', margin: '0 0 24px 0', lineHeight: 1.5 }}>
            Create events, sell tickets in Nigerian Naira via Paystack, issue instant QR passes, and withdraw earnings directly to your Nigerian bank.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link
              to="/organizer"
              style={{
                backgroundColor: 'var(--brand-accent, #397C80)',
                color: '#FFFFFF',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              Organizer Command Center <ArrowRight size={15} />
            </Link>
            <Link
              to="/create"
              style={{
                backgroundColor: 'rgba(230, 245, 247, 0.08)',
                color: 'var(--brand-pale-ice, #E6F5F7)',
                border: '1px solid rgba(230, 245, 247, 0.2)',
                padding: '12px 20px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Create New Event
            </Link>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
