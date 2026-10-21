import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout.jsx';
import EventCard from '../../components/events/EventCard.jsx';
import EventCardSkeleton from '../../components/events/EventCardSkeleton.jsx';
import api from '../../lib/axios.js';
import { Search, MapPin, Calendar, SlidersHorizontal, X, Tag, Sparkles } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Concerts',
  'Festivals',
  'Nightlife & Parties',
  'Sports',
  'Arts & Theater',
  'Family',
];

const CITIES = [
  'All Cities',
  'Lagos',
  'Abuja',
  'Port Harcourt',
  'Ibadan',
  'Benin City',
  'Enugu',
  'Calabar',
  'Online / Virtual',
];

const DATES = [
  { label: 'All Dates', value: '' },
  { label: 'Today', value: 'today' },
  { label: 'This Weekend', value: 'this_weekend' },
  { label: 'This Month', value: 'this_month' },
];

export default function ExplorePage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [city, setCity] = useState('All Cities');
  const [date, setDate] = useState('');
  const [price, setPrice] = useState('all'); // 'all' | 'free' | 'paid'
  const [sort, setSort] = useState('date_asc');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Parse query params on load or change
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('search') || '';
    const cat = params.get('category') || 'All';
    const c = params.get('city') || 'All Cities';
    const d = params.get('date') || '';
    const p = params.get('price') || 'all';

    setSearch(q);
    setCategory(cat);
    setCity(c);
    setDate(d);
    setPrice(p);

    fetchFilteredEvents(q, cat, c, d, p, sort);
  }, [location.search, sort]);

  const fetchFilteredEvents = async (q, cat, c, d, p, s) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.append('search', q.trim());
      if (cat && cat !== 'All') params.append('category', cat);
      if (c && c !== 'All Cities') params.append('city', c);
      if (d) params.append('date', d);
      if (s === 'date_desc') params.append('sort', 'date_desc');

      const { data } = await api.get(`/events?${params.toString()}`);
      let list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];

      // Filter by price if requested
      if (p === 'free') {
        list = list.filter((e) => e.admissionType === 'FREE' || e.isFree || e.minPrice === 0);
      } else if (p === 'paid') {
        list = list.filter(
          (e) =>
            e.admissionType !== 'FREE' &&
            !e.isFree &&
            (e.minPrice > 0 || (Array.isArray(e.ticketTypes) && e.ticketTypes.some((t) => t.price > 0)))
        );
      }

      setEvents(list);
    } catch (err) {
      console.error(err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = (newCategory, newCity, newDate, newPrice) => {
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (newCategory && newCategory !== 'All') params.set('category', newCategory);
    if (newCity && newCity !== 'All Cities') params.set('city', newCity);
    if (newDate) params.set('date', newDate);
    if (newPrice && newPrice !== 'all') params.set('price', newPrice);
    navigate(`/explore?${params.toString()}`);
  };

  const clearAllFilters = () => {
    setSearch('');
    setCategory('All');
    setCity('All Cities');
    setDate('');
    setPrice('all');
    navigate('/explore');
  };

  const hasActiveFilters =
    search ||
    (category && category !== 'All') ||
    (city && city !== 'All Cities') ||
    date ||
    (price && price !== 'all');

  return (
    <AppLayout>
      {/* Header Search & Filter Bar */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid var(--color-border, #E7E5E4)',
          padding: '24px 0 16px',
        }}
      >
        <div className="tm-container" style={{ padding: '0 16px' }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              marginBottom: '16px',
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: 'clamp(22px, 3.5vw, 28px)',
                  fontWeight: 900,
                  color: 'var(--color-text-primary, #292524)',
                  margin: 0,
                  letterSpacing: '-0.02em',
                }}
              >
                {category !== 'All'
                  ? `${category} in Nigeria`
                  : price === 'free'
                  ? 'Free Events & Passes'
                  : 'Find your next experience.'}
              </h1>
              <p style={{ fontSize: '13.5px', color: 'var(--color-text-secondary, #57534E)', margin: '4px 0 0 0' }}>
                {city !== 'All Cities'
                  ? `Showing live events and passes in ${city}`
                  : 'Discover concerts, festivals, sports games, workshops, parties, and free admission events.'}
              </p>
            </div>

            {/* Sort & Mobile Filter Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                className="mobile-only"
                onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  backgroundColor: hasActiveFilters ? 'var(--color-surface-soft, #FFF4EE)' : '#FAFAF9',
                  border: `1px solid ${hasActiveFilters ? 'var(--color-primary, #FF5A5F)' : 'var(--color-border, #E7E5E4)'}`,
                  color: hasActiveFilters ? 'var(--color-primary, #FF5A5F)' : 'var(--color-text-primary, #292524)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <SlidersHorizontal size={14} /> Filters {hasActiveFilters && '•'}
              </button>

              <span style={{ fontSize: '13px', color: 'var(--color-text-muted, #78716C)' }} className="desktop-only">
                Sort:
              </span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="input"
                style={{ width: 'auto', padding: '8px 28px 8px 12px', fontSize: '13px', borderRadius: '8px' }}
              >
                <option value="date_asc">Upcoming First</option>
                <option value="date_desc">Furthest Out</option>
              </select>
            </div>
          </div>

          {/* Desktop Filter Controls Row */}
          <div className="desktop-flex" style={{ display: 'none', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', minWidth: '220px', flex: 1 }}>
              <Search
                size={15}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted, #78716C)',
                }}
              />
              <input
                type="text"
                placeholder="Search event, artist or venue..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleApplyFilter(category, city, date, price);
                }}
                className="input"
                style={{ paddingLeft: '36px', paddingRight: '12px', borderRadius: '8px' }}
              />
            </div>

            {/* City Dropdown */}
            <div style={{ minWidth: '150px' }}>
              <select
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  handleApplyFilter(category, e.target.value, date, price);
                }}
                className="input"
                style={{ borderRadius: '8px' }}
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Dropdown */}
            <div style={{ minWidth: '140px' }}>
              <select
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  handleApplyFilter(category, city, e.target.value, price);
                }}
                className="input"
                style={{ borderRadius: '8px' }}
              >
                {DATES.map((d) => (
                  <option key={d.label} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Filter (All / Free / Paid) */}
            <div style={{ minWidth: '130px' }}>
              <select
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value);
                  handleApplyFilter(category, city, date, e.target.value);
                }}
                className="input"
                style={{ borderRadius: '8px' }}
              >
                <option value="all">All Prices</option>
                <option value="free">Free Events Only</option>
                <option value="paid">Paid Events Only</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="btn-ghost"
                style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#DC2626' }}
              >
                <X size={14} /> Clear
              </button>
            )}
          </div>

          {/* Mobile Filter Slide Panel */}
          {isMobileFilterOpen && (
            <div
              className="mobile-only"
              style={{
                marginTop: '12px',
                padding: '16px',
                backgroundColor: 'var(--color-surface-soft, #FFF4EE)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 90, 95, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div style={{ position: 'relative' }}>
                <Search
                  size={15}
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-text-muted, #78716C)',
                  }}
                />
                <input
                  type="text"
                  placeholder="Search event, artist or venue..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input"
                  style={{ paddingLeft: '36px', paddingRight: '12px', backgroundColor: '#FFFFFF' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="input"
                  style={{ backgroundColor: '#FFFFFF' }}
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <select
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input"
                  style={{ backgroundColor: '#FFFFFF' }}
                >
                  {DATES.map((d) => (
                    <option key={d.label} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>

              <select
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="input"
                style={{ backgroundColor: '#FFFFFF' }}
              >
                <option value="all">All Prices</option>
                <option value="free">Free Events Only</option>
                <option value="paid">Paid Events Only</option>
              </select>

              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => {
                    handleApplyFilter(category, city, date, price);
                    setIsMobileFilterOpen(false);
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: 'var(--color-primary, #FF5A5F)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Apply Filters
                </button>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={() => {
                      clearAllFilters();
                      setIsMobileFilterOpen(false);
                    }}
                    style={{
                      padding: '10px 14px',
                      backgroundColor: 'transparent',
                      border: '1px solid var(--color-border, #E7E5E4)',
                      borderRadius: '8px',
                      color: '#DC2626',
                      fontWeight: 600,
                      fontSize: '13px',
                    }}
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Category Chips Bar */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingTop: '16px', scrollbarWidth: 'none' }}>
            {CATEGORIES.map((cat) => {
              const isSelected = category === cat;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setCategory(cat);
                    handleApplyFilter(cat, city, date, price);
                  }}
                  style={{
                    padding: '7px 16px',
                    borderRadius: '24px',
                    border: isSelected ? '1.5px solid var(--color-primary, #FF5A5F)' : '1px solid var(--color-border, #E7E5E4)',
                    backgroundColor: isSelected ? 'var(--color-surface-soft, #FFF4EE)' : '#FFFFFF',
                    color: isSelected ? 'var(--color-primary, #FF5A5F)' : 'var(--color-text-secondary, #57534E)',
                    fontSize: '13px',
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results Content Area */}
      <div className="tm-container" style={{ padding: '32px 16px 60px' }}>
        {/* Results Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-muted, #78716C)', margin: 0 }}>
            {loading ? 'Searching events...' : `${events.length} event${events.length === 1 ? '' : 's'} available`}
          </p>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <EventCardSkeleton key={n} />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid var(--color-border, #E7E5E4)',
              maxWidth: '500px',
              margin: '0 auto',
              boxShadow: '0 4px 16px rgba(41, 37, 36, 0.04)',
            }}
          >
            <Search size={44} color="var(--color-border, #E7E5E4)" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-primary, #292524)', margin: '0 0 6px 0' }}>
              No matching events found
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--color-text-secondary, #57534E)', margin: '0 0 20px 0', lineHeight: 1.5 }}>
              We couldn't find any events matching your selected filters. Try searching for a different city or category.
            </p>
            <button
              onClick={clearAllFilters}
              style={{
                backgroundColor: 'var(--color-primary, #FF5A5F)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                fontWeight: 700,
                fontSize: '13.5px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(255, 90, 95, 0.25)',
              }}
            >
              Reset Search Filters
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {events.map((ev) => (
              <EventCard key={ev._id || ev.id} event={ev} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
