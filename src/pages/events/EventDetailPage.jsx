import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import AppLayout from '../../components/layout/AppLayout.jsx';
import TickzaSpinner from '../../components/ui/TickzaSpinner.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import api from '../../lib/axios.js';
import {
  Calendar,
  MapPin,
  Clock,
  ShieldCheck,
  Share2,
  Heart,
  ChevronLeft,
  Users,
  CheckCircle2,
  Info,
  CreditCard,
  Lock,
  ArrowRight,
  Tag,
} from 'lucide-react';
import { getEventImageUrl, handleImageFallback } from '../../lib/imageHelper.js';

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  // Checkout modal state
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [purchasing, setPurchasing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(null);

  // Free registration state
  const [showFreeRegModal, setShowFreeRegModal] = useState(false);
  const [registeringFree, setRegisteringFree] = useState(false);
  const [freeRegistrationComplete, setFreeRegistrationComplete] = useState(null);
  const [attendeeForm, setAttendeeForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    notes: '',
  });

  // Promo code state
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [promoError, setPromoError] = useState('');

  useEffect(() => {
    fetchEvent();
  }, [id]);

  useEffect(() => {
    if (user) {
      setAttendeeForm(prev => ({
        ...prev,
        firstName: prev.firstName || user.firstName || '',
        lastName: prev.lastName || user.lastName || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [user]);

  const fetchEvent = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/events/${id}`);
      const ev = data.data || data.event || data;
      setEvent(ev);
      if (ev.ticketTypes && ev.ticketTypes.length > 0) {
        setSelectedType(ev.ticketTypes[0]);
      }
    } catch (err) {
      toast.error('Event could not be loaded.');
      navigate('/explore');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.title,
        text: `Check out tickets for ${event?.title} on Tickza!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Event link copied to clipboard!');
    }
  };

  const handleOpenCheckout = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!selectedType) {
      toast.error('Please select a ticket tier.');
      return;
    }
    // Reset promo state upon opening checkout
    setPromoError('');
    setShowCheckoutModal(true);
  };

  const handleApplyPromo = async () => {
    if (!promoCodeInput.trim()) {
      setPromoError('Please enter a promo code.');
      return;
    }
    setPromoError('');
    setValidatingPromo(true);
    const subtotalNow = (selectedType?.price || 0) * quantity;
    try {
      const { data } = await api.post(`/events/${event._id || event.id}/validate-promo`, {
        code: promoCodeInput.trim(),
        eventId: event._id || event.id,
        orderAmount: subtotalNow,
        ticketTypeId: selectedType._id || selectedType.id,
        quantity,
      });

      if (data.success && data.data) {
        setAppliedPromo(data.data);
        toast.success(data.data.message || `Code ${data.data.code} applied!`);
      }
    } catch (err) {
      setPromoError(err.response?.data?.message || 'Invalid or expired promo code.');
      setAppliedPromo(null);
    } finally {
      setValidatingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCodeInput('');
    setPromoError('');
  };

  const handleConfirmPurchase = async () => {
    setPurchasing(true);
    try {
      const { data } = await api.post('/orders', {
        eventId: event._id || event.id,
        ticketTypeId: selectedType._id || selectedType.id,
        quantity,
        promoCode: appliedPromo?.code || '',
      });

      // If paid order requiring Paystack checkout
      if (data.requiresPayment && data.paymentData) {
        const { authorizationUrl, reference } = data.paymentData;
        toast.success('Order placed. Redirecting to Paystack checkout...');
        
        // If live Paystack authorization URL is provided, redirect to Paystack
        if (authorizationUrl && authorizationUrl.startsWith('https://checkout.paystack.com/')) {
          window.location.href = authorizationUrl;
          return;
        }

        // Otherwise navigate to internal verification callback
        navigate(`/tickets/verify-payment?reference=${encodeURIComponent(reference)}`);
        return;
      }

      // Free or instant fulfillment
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // ignore if canvas confetti fails
      }

      setOrderComplete(data.data || data);
      toast.success('Tickets confirmed! Added to My Tickets.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Purchase could not be completed.');
      setShowCheckoutModal(false);
    } finally {
      setPurchasing(false);
    }
  };

  const handleOpenFreeRegistration = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    const isFull = event.registrationCapacity && (event.registeredCount || 0) >= event.registrationCapacity;
    if (isFull) {
      toast.error('Registration is currently full for this event.');
      return;
    }
    setFreeRegistrationComplete(null);
    setShowFreeRegModal(true);
  };

  const handleConfirmFreeRegistration = async (e) => {
    e?.preventDefault();
    if (!attendeeForm.firstName.trim() || !attendeeForm.lastName.trim() || !attendeeForm.email.trim()) {
      toast.error('First name, last name, and email are required.');
      return;
    }

    setRegisteringFree(true);
    try {
      const { data } = await api.post(`/events/${event._id || event.id}/register`, {
        firstName: attendeeForm.firstName.trim(),
        lastName: attendeeForm.lastName.trim(),
        email: attendeeForm.email.trim(),
        phone: attendeeForm.phone.trim(),
        notes: attendeeForm.notes.trim(),
      });

      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch (err) {}

      setFreeRegistrationComplete(data.data);
      setEvent(prev => prev ? ({ ...prev, registeredCount: (prev.registeredCount || 0) + 1 }) : prev);
      toast.success(data.message || 'Free registration confirmed! Your pass is ready.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete registration.');
    } finally {
      setRegisteringFree(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <TickzaSpinner size="lg" message="Loading event information..." />
        </div>
      </AppLayout>
    );
  }

  if (!event) return null;

  const dateObj = event.startDate ? new Date(event.startDate) : null;
  const dateFormatted = dateObj
    ? dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : 'Date TBA';
  const timeFormatted = event.startTime || (dateObj ? dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '');

  const imageUrl = getEventImageUrl(
    event.coverImage?.url ||
    event.bannerImage ||
    event.coverImageUrl ||
    (typeof event.coverImage === 'string' ? event.coverImage : '')
  );

  const ticketTypes = event.ticketTypes || [];
  const isFreeEvent = event.admissionType === 'FREE' || event.isFree;
  const isFreeEventCapacityFull = isFreeEvent && event.registrationCapacity && (event.registeredCount || 0) >= event.registrationCapacity;
  const isSoldOut = !isFreeEvent && ticketTypes.length > 0 && ticketTypes.every((t) => (t.availableQuantity || t.quantity) <= 0);

  // Price calculations
  const unitPrice = selectedType ? (selectedType.price || 0) : 0;
  const subtotal = unitPrice * quantity;
  const capacityPerUnit = selectedType ? (selectedType.admittedPerTicket || 1) : 1;
  const totalAttendeesAdmitted = quantity * capacityPerUnit;
  const discountAmount = appliedPromo ? (appliedPromo.discountAmount || 0) : 0;
  const totalAmount = Math.max(0, subtotal - discountAmount);

  return (
    <AppLayout>
      {/* ===== HERO ARTWORK BANNER ===== */}
      <div
        style={{
          position: 'relative',
          backgroundColor: '#111827',
          color: '#FFFFFF',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'relative',
            minHeight: '360px',
            background: `linear-gradient(180deg, rgba(17,24,39,0.4) 0%, rgba(17,24,39,0.85) 75%, #111827 100%), url(${imageUrl}) center/cover no-repeat`,
            display: 'flex',
            alignItems: 'flex-end',
          }}
        >
          <div className="tm-container" style={{ padding: '40px 20px', width: '100%' }}>
            {/* Back link */}
            <Link
              to="/explore"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: '#E0E0E0',
                fontSize: '13px',
                fontWeight: 600,
                textDecoration: 'none',
                marginBottom: '16px',
                backgroundColor: 'rgba(0,0,0,0.4)',
                padding: '6px 12px',
                borderRadius: '20px',
                backdropFilter: 'blur(4px)',
              }}
            >
              <ChevronLeft size={16} /> All Events
            </Link>

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  {isFreeEvent && (
                    <span style={{ backgroundColor: '#059669', color: '#FFFFFF', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', padding: '3px 8px', borderRadius: '4px', letterSpacing: '0.04em' }}>
                      FREE ADMISSION
                    </span>
                  )}
                  <span style={{ backgroundColor: '#026CDF', color: '#FFFFFF', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', padding: '3px 8px', borderRadius: '4px', letterSpacing: '0.04em' }}>
                    {event.category || 'Concert'}
                  </span>
                  <StatusBadge status={event.status} />
                </div>

                <h1 style={{ fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 900, color: '#FFFFFF', margin: '0 0 10px 0', lineHeight: 1.15 }}>
                  {event.title}
                </h1>

                <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.9)', margin: 0, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '14px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={16} color="#60A5FA" /> {dateFormatted}
                  </span>
                  <span>•</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={16} color="#60A5FA" /> {timeFormatted || 'Doors at 19:00'}
                  </span>
                  <span>•</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={16} color="#60A5FA" /> {event.venue} {event.address ? `, ${event.address}` : ''}
                  </span>
                </p>
              </div>

              {/* Share & Favorite Buttons */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handleShare}
                  aria-label="Share event"
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <Share2 size={18} />
                </button>

                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  aria-label="Add to favorites"
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: isFavorite ? '#DC2626' : '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <Heart size={18} fill={isFavorite ? '#DC2626' : 'none'} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== TWO-COLUMN MAIN CONTENT (RESPONSIVE) ===== */}
      <div className="tm-container" style={{ padding: '36px 20px' }}>
        <div className="event-details-layout">
          {/* Left Column: Event Details & Venue Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {/* About the Event */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '24px', border: '1px solid #E5E5E5', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1F1F1F', margin: '0 0 12px 0' }}>
                About This Event
              </h2>
              <p style={{ fontSize: '14px', color: '#4B4B4B', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-line' }}>
                {event.description || 'Join fellow attendees for an unforgettable event experience featuring premium live production.'}
              </p>

              {event.entranceInfo && (
                <div style={{ marginTop: '16px', padding: '12px 14px', backgroundColor: '#F8F9FA', borderRadius: '8px', border: '1px solid #E5E5E5' }}>
                  <p style={{ margin: 0, fontSize: '13px', color: '#1F1F1F', fontWeight: 600 }}>
                    🚪 Entrance Information: <span style={{ fontWeight: 400, color: '#4B4B4B' }}>{event.entranceInfo}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Venue & Location Information */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '24px', border: '1px solid #E5E5E5', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1F1F1F', margin: '0 0 14px 0' }}>
                Venue & Admission Details
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#4B4B4B' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <MapPin size={18} color="#026CDF" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ color: '#1F1F1F' }}>{event.venue}</strong>
                    <p style={{ margin: '2px 0 0', color: '#6B6B6B' }}>{event.address || 'Address provided upon booking'}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Clock size={18} color="#026CDF" />
                  <span>Doors Open: <strong>{event.doorsOpen || 'Doors open before showtime'}</strong></span>
                </div>

                {event.organizerId && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Users size={18} color="var(--brand-accent, #397C80)" />
                    <span>Presented by: <strong>{event.organizerId.firstName} {event.organizerId.lastName}</strong></span>
                  </div>
                )}
              </div>
            </div>

            {/* 100% Buyer Guarantee & Security */}
            <div style={{ backgroundColor: 'rgba(57, 124, 128, 0.08)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(57, 124, 128, 0.25)', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <ShieldCheck size={26} color="var(--brand-accent, #397C80)" style={{ flexShrink: 0 }} />
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--brand-primary, #0B1025)', margin: '0 0 4px 0' }}>
                  Tickza Verified Authentic
                </h4>
                <p style={{ fontSize: '13px', color: '#424B5D', margin: 0, lineHeight: 1.5 }}>
                  Every ticket purchased on Tickza features a cryptographically secured QR code verified at turnstiles. Safe transfers, reliable entry, and zero duplicate admissions.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Ticket Selector / Free Pass Panel */}
          <div
            style={{
              position: 'sticky',
              top: '90px',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E5E5E5',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            }}
          >
            {isFreeEvent ? (
              /* FREE EVENT REGISTRATION PANEL */
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1F1F1F', margin: 0 }}>
                    Free Registration
                  </h2>
                  <span style={{ backgroundColor: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', fontSize: '12px', fontWeight: 800, padding: '3px 8px', borderRadius: '4px' }}>
                    FREE
                  </span>
                </div>

                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#F0FDF4', border: '1px solid #A7F3D0', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#065F46' }}>
                      {event.freePassName || 'Free Event Pass'}
                    </h3>
                    <span style={{ fontSize: '16px', fontWeight: 800, color: '#059669' }}>₦0</span>
                  </div>
                  <p style={{ margin: '0 0 10px 0', fontSize: '12.5px', color: '#047857', lineHeight: 1.5 }}>
                    Zero ticket fees. Register to instantly receive your digital admission pass with an authentic Tickza QR code.
                  </p>

                  {event.registrationCapacity && (
                    <div style={{ paddingTop: '8px', borderTop: '1px dashed #A7F3D0', display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#065F46', fontWeight: 600 }}>
                      <span>Availability:</span>
                      <span>
                        {Math.max(0, event.registrationCapacity - (event.registeredCount || 0))} of {event.registrationCapacity} spots left
                      </span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px', fontSize: '13px', color: '#4B4B4B' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={16} color="#059669" /> Free digital QR admission pass issued instantly
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={16} color="#059669" /> Real-time QR check-in & verification at venue
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={16} color="#059669" /> Stored safely in your Tickza tickets wallet
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={16} color="#059669" /> No credit card, bank details, or checkout fees
                  </div>
                </div>

                {isFreeEventCapacityFull ? (
                  <button
                    disabled
                    className="btn-secondary"
                    style={{ width: '100%', padding: '14px', borderRadius: '10px', fontSize: '15px', opacity: 0.6, cursor: 'not-allowed' }}
                  >
                    REGISTRATION FULL
                  </button>
                ) : (
                  <button
                    className="btn-primary"
                    style={{ width: '100%', padding: '14px', borderRadius: '10px', fontSize: '15px', backgroundColor: '#059669', borderColor: '#059669' }}
                    onClick={handleOpenFreeRegistration}
                  >
                    REGISTER FOR FREE • ₦0
                  </button>
                )}
              </div>
            ) : (
              /* PAID TICKET OPTIONS */
              <>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1F1F1F', margin: '0 0 16px 0' }}>
                  Select Ticket Options
                </h2>

                {/* Ticket Tier Cards List */}
                {ticketTypes.length === 0 ? (
                  <p style={{ color: '#6B6B6B', fontSize: '14px' }}>No tickets currently available for this event.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                    {ticketTypes.map((tt) => {
                      const ttId = tt._id || tt.id;
                      const isSelected = selectedType && (selectedType._id || selectedType.id) === ttId;
                      const available = tt.availableQuantity !== undefined ? tt.availableQuantity : tt.quantity;
                      const isTierSoldOut = available <= 0;
                      const format = tt.format || 'INDIVIDUAL';
                      const capacity = tt.admittedPerTicket || 1;

                      return (
                        <div
                          key={ttId}
                          onClick={() => !isTierSoldOut && setSelectedType(tt)}
                          style={{
                            padding: '14px 16px',
                            borderRadius: '12px',
                            border: isSelected ? '2px solid var(--brand-accent, #397C80)' : '1px solid #E5E5E5',
                            backgroundColor: isSelected ? 'rgba(57, 124, 128, 0.08)' : isTierSoldOut ? '#F9FAFB' : '#FFFFFF',
                            cursor: isTierSoldOut ? 'not-allowed' : 'pointer',
                            opacity: isTierSoldOut ? 0.6 : 1,
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1, paddingRight: 10 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <p style={{ fontSize: '15px', fontWeight: 700, color: '#1F1F1F', margin: 0 }}>
                                  {tt.name}
                                </p>
                                {format === 'RESERVED_TABLE' && (
                                  <span style={{ fontSize: 10, background: '#FEF3C7', color: '#92400E', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                                    TABLE
                                  </span>
                                )}
                                {format === 'GROUP_BUNDLE' && (
                                  <span style={{ fontSize: 10, background: '#E0E7FF', color: '#3730A3', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                                    GROUP
                                  </span>
                                )}
                                {isSelected && <CheckCircle2 size={16} color="var(--brand-accent, #397C80)" />}
                              </div>

                              <p style={{ fontSize: '12px', color: '#6B6B6B', margin: '3px 0 0 0' }}>
                                {format === 'RESERVED_TABLE'
                                  ? `Reserved Table • Admits ${capacity} Guests`
                                  : format === 'GROUP_BUNDLE'
                                  ? `Group Pass • Admits ${capacity} Persons`
                                  : 'Individual Entry'}
                                {tt.section ? ` • Section ${tt.section}` : ''}
                              </p>

                              {tt.description && (
                                <p style={{ fontSize: '12px', color: '#4B5563', margin: '4px 0 0 0' }}>
                                  {tt.description}
                                </p>
                              )}

                              {Array.isArray(tt.benefits) && tt.benefits.length > 0 && (
                                <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                  {tt.benefits.map((b, i) => (
                                    <span key={i} style={{ fontSize: 10.5, background: '#ECFDF5', color: '#047857', padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>
                                      ✓ {b}
                                    </span>
                                  ))}
                                </div>
                              )}

                              <p style={{ fontSize: '11px', color: available < 20 ? '#DC2626' : '#059669', margin: '6px 0 0 0', fontWeight: 600 }}>
                                {isTierSoldOut ? 'Sold Out' : `${available} ${format === 'RESERVED_TABLE' ? 'tables' : format === 'GROUP_BUNDLE' ? 'bundles' : 'tickets'} remaining`}
                              </p>
                            </div>

                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                              <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--brand-accent, #397C80)' }}>
                                {tt.price === 0 ? 'FREE' : `₦${tt.price.toLocaleString()}`}
                              </span>
                              {capacity > 1 && tt.price > 0 && (
                                <div style={{ fontSize: 11, color: '#6B7280' }}>
                                  ~₦{Math.round(tt.price / capacity).toLocaleString()}/person
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Quantity Stepper */}
                {selectedType && !isSoldOut && (
                  <div style={{ marginBottom: '20px', padding: '14px', backgroundColor: '#F8F9FA', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#1F1F1F' }}>
                          {selectedType.format === 'RESERVED_TABLE' ? 'Number of Tables' : selectedType.format === 'GROUP_BUNDLE' ? 'Number of Bundles' : 'Ticket Quantity'}
                        </span>
                        {capacityPerUnit > 1 && (
                          <div style={{ fontSize: 12, color: '#4F46E5', fontWeight: 600 }}>
                            Admits {totalAttendeesAdmitted} attendees total
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button
                          onClick={() => setQuantity((q) => Math.max(selectedType.minPerOrder || 1, q - 1))}
                          disabled={quantity <= (selectedType.minPerOrder || 1)}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '6px',
                            border: '1px solid #D1D5DB',
                            backgroundColor: '#FFFFFF',
                            fontSize: '16px',
                            fontWeight: 700,
                            cursor: quantity <= (selectedType.minPerOrder || 1) ? 'not-allowed' : 'pointer',
                            opacity: quantity <= (selectedType.minPerOrder || 1) ? 0.4 : 1,
                          }}
                        >
                          -
                        </button>
                        <span style={{ fontSize: '16px', fontWeight: 800, minWidth: '24px', textAlign: 'center' }}>
                          {quantity}
                        </span>
                        <button
                          onClick={() => setQuantity((q) => Math.min(selectedType.maxPerCustomer || selectedType.availableQuantity || 10, q + 1))}
                          disabled={quantity >= (selectedType.maxPerCustomer || selectedType.availableQuantity || 10)}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '6px',
                            border: '1px solid #D1D5DB',
                            backgroundColor: '#FFFFFF',
                            fontSize: '16px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pricing Summary */}
                {selectedType && (
                  <div style={{ marginBottom: '20px', borderTop: '1px solid #F0F0F0', paddingTop: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#6B6B6B', marginBottom: '6px' }}>
                      <span>{selectedType.name} (₦{unitPrice.toLocaleString()} × {quantity})</span>
                      <span>₦{subtotal.toLocaleString()}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 800, color: '#1F1F1F', borderTop: '1px solid #E5E5E5', paddingTop: '10px', marginTop: '10px' }}>
                      <span>Total Due</span>
                      <span style={{ color: 'var(--brand-accent, #397C80)' }}>
                        {totalAmount === 0 ? 'FREE' : `₦${totalAmount.toLocaleString()}`}
                      </span>
                    </div>
                  </div>
                )}

                {/* Primary Action Button */}
                <button
                  className="btn-primary"
                  style={{ width: '100%', padding: '14px', borderRadius: '10px', fontSize: '15px' }}
                  disabled={isSoldOut || !selectedType}
                  onClick={handleOpenCheckout}
                >
                  {isSoldOut ? 'SOLD OUT' : totalAmount === 0 ? 'CLAIM FREE TICKET' : `GET TICKETS • ₦${totalAmount.toLocaleString()}`}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ===== CHECKOUT & PAYMENT MODAL ===== */}
      {showCheckoutModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(5px)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '480px',
              width: '100%',
              overflow: 'hidden',
              boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
            }}
          >
            {orderComplete ? (
              /* Confirmation Screen */
              <div style={{ padding: '36px 24px', textAlign: 'center' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: '#ECFDF5',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}
                >
                  <CheckCircle2 size={38} />
                </div>

                <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#1F1F1F', margin: '0 0 6px 0' }}>
                  Tickets Confirmed! 🎉
                </h3>
                <p style={{ fontSize: '14px', color: '#6B6B6B', margin: '0 0 20px 0' }}>
                  Your {quantity} ticket(s) for <strong>{event.title}</strong> have been secured and assigned to your wallet.
                </p>

                <div style={{ backgroundColor: '#F8F9FA', borderRadius: '12px', padding: '14px', textAlign: 'left', marginBottom: '24px', border: '1px solid #E5E5E5' }}>
                  <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#6B6B6B' }}>Order Number: <strong>{orderComplete.order?.orderNumber || 'ORD-TK-2026'}</strong></p>
                  <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#6B6B6B' }}>Tier: <strong>{selectedType.name}</strong></p>
                  {appliedPromo && (
                    <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#059669' }}>
                      Promo Code: <strong>{appliedPromo.code}</strong> (-₦{discountAmount.toLocaleString()})
                    </p>
                  )}
                  <p style={{ margin: 0, fontSize: '13px', color: '#6B6B6B' }}>Total Paid: <strong>{totalAmount === 0 ? 'FREE' : `₦${totalAmount.toLocaleString()}`}</strong></p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button
                    className="btn-primary"
                    style={{ padding: '14px', borderRadius: '10px', fontSize: '15px' }}
                    onClick={() => navigate('/tickets')}
                  >
                    View in My Tickets <ArrowRight size={16} />
                  </button>
                  <button
                    className="btn-secondary"
                    style={{ padding: '12px', borderRadius: '10px' }}
                    onClick={() => {
                      setShowCheckoutModal(false);
                      setOrderComplete(null);
                      setAppliedPromo(null);
                      setPromoCodeInput('');
                    }}
                  >
                    Continue Browsing
                  </button>
                </div>
              </div>
            ) : (
              /* Checkout Form */
              <div>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E5E5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Confirm Order & Payment</h3>
                  <button
                    onClick={() => setShowCheckoutModal(false)}
                    style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#6B6B6B' }}
                  >
                    ×
                  </button>
                </div>

                <div style={{ padding: '20px 24px' }}>
                  {/* Event summary snippet */}
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #F0F0F0' }}>
                    <img
                      src={imageUrl}
                      alt=""
                      onError={handleImageFallback}
                      style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }}
                    />
                    <div>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>{event.title}</h4>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6B6B6B' }}>
                        {dateFormatted} • {selectedType.name} ({quantity} {selectedType.format === 'RESERVED_TABLE' ? 'table' : selectedType.format === 'GROUP_BUNDLE' ? 'package' : 'ticket'}{quantity > 1 ? 's' : ''})
                      </p>
                      {capacityPerUnit > 1 && (
                        <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#4F46E5', fontWeight: 600 }}>
                          Admits {totalAttendeesAdmitted} guests to the venue
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Promo code field */}
                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                      <Tag size={14} color="#4F46E5" /> Promo Code (Optional)
                    </label>

                    {appliedPromo ? (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        backgroundColor: '#ECFDF5',
                        border: '1px solid #A7F3D0',
                        borderRadius: '10px',
                      }}>
                        <div>
                          <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#065F46', fontSize: '14px' }}>
                            {appliedPromo.code}
                          </span>
                          <span style={{ fontSize: '12px', color: '#047857', marginLeft: 8 }}>
                            ({appliedPromo.discountType === 'PERCENTAGE' ? `${appliedPromo.discountValue}% OFF` : `₦${appliedPromo.discountValue.toLocaleString()} OFF`})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemovePromo}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#DC2626',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input
                          type="text"
                          value={promoCodeInput}
                          onChange={(e) => {
                            setPromoCodeInput(e.target.value.toUpperCase());
                            setPromoError('');
                          }}
                          placeholder="e.g. TICKZA20"
                          style={{
                            flex: 1,
                            padding: '10px 12px',
                            borderRadius: '8px',
                            border: '1px solid #D1D5DB',
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            fontSize: '13px',
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleApplyPromo}
                          disabled={validatingPromo || !promoCodeInput.trim()}
                          className="btn-secondary"
                          style={{
                            padding: '10px 16px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: 700,
                            cursor: validatingPromo || !promoCodeInput.trim() ? 'not-allowed' : 'pointer',
                          }}
                        >
                          {validatingPromo ? 'Checking…' : 'Apply'}
                        </button>
                      </div>
                    )}
                    {promoError && (
                      <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#DC2626' }}>
                        {promoError}
                      </p>
                    )}
                  </div>

                  {/* Paystack Exclusive Payment Method */}
                  <div style={{ marginBottom: '20px' }}>
                    <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Lock size={14} color="#059669" /> Payment Method
                    </label>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '13px 16px',
                        borderRadius: '10px',
                        border: '1.5px solid #10B981',
                        backgroundColor: '#F0FDF4',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            backgroundColor: '#059669',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Lock size={18} />
                        </div>
                        <div>
                          <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#065F46' }}>
                            Paystack Checkout
                          </p>
                          <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#047857' }}>
                            Cards, Instant Bank Transfer, Apple Pay, USSD & QR
                          </p>
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          backgroundColor: '#DCFCE7',
                          color: '#15803D',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}
                      >
                        Active
                      </span>
                    </div>
                  </div>

                  {/* Total breakdown */}
                  <div style={{ padding: '14px', backgroundColor: '#F8F9FA', borderRadius: '10px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#6B6B6B', marginBottom: 6 }}>
                      <span>Subtotal ({quantity} {quantity > 1 ? 'tickets' : 'ticket'})</span>
                      <span>₦{subtotal.toLocaleString()}</span>
                    </div>

                    {discountAmount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#059669', fontWeight: 600, marginBottom: 6 }}>
                        <span>Promo Discount ({appliedPromo?.code})</span>
                        <span>-₦{discountAmount.toLocaleString()}</span>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 800, borderTop: '1px solid #E5E5E5', paddingTop: 8, marginTop: 4 }}>
                      <span>Total Due</span>
                      <span style={{ color: 'var(--brand-accent, #397C80)' }}>
                        {totalAmount === 0 ? 'FREE' : `₦${totalAmount.toLocaleString()}`}
                      </span>
                    </div>
                    <p style={{ margin: '6px 0 0', fontSize: '11px', color: '#6B6B6B' }}>
                      Includes 100% verified ticket authentication and instant QR admission passes.
                    </p>
                  </div>

                  <button
                    onClick={handleConfirmPurchase}
                    disabled={purchasing}
                    className="btn-primary"
                    style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: '10px',
                      fontSize: '15px',
                      backgroundColor: 'var(--brand-accent, #397C80)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    {purchasing ? (
                      <TickzaSpinner size="sm" color="#FFFFFF" message="Connecting to Paystack..." />
                    ) : (
                      totalAmount === 0 ? 'Claim Free Pass • ₦0' : `Pay with Paystack • ₦${totalAmount.toLocaleString()}`
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== FREE EVENT REGISTRATION MODAL ===== */}
      {showFreeRegModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(5px)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => !registeringFree && setShowFreeRegModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '480px',
              width: '100%',
              overflow: 'hidden',
              boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
            }}
          >
            {freeRegistrationComplete ? (
              /* Free Pass Confirmation Screen */
              <div style={{ padding: '36px 24px', textAlign: 'center' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: '#ECFDF5',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}
                >
                  <CheckCircle2 size={38} />
                </div>

                <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#1F1F1F', margin: '0 0 6px 0' }}>
                  Pass Confirmed! 🎉
                </h3>
                <p style={{ fontSize: '14px', color: '#6B6B6B', margin: '0 0 20px 0' }}>
                  Your free admission pass for <strong>{event.title}</strong> has been secured.
                </p>

                {/* Digital Pass Preview Card */}
                <div style={{ backgroundColor: '#F0FDF4', borderRadius: '12px', padding: '16px', textAlign: 'center', marginBottom: '20px', border: '1px solid #A7F3D0' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {event.freePassName || 'Free Event Pass'}
                  </span>
                  <p style={{ margin: '4px 0 2px', fontSize: '15px', fontWeight: 800, color: '#065F46' }}>
                    {attendeeForm.firstName} {attendeeForm.lastName}
                  </p>
                  <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#047857', fontFamily: 'monospace' }}>
                    Ref: {freeRegistrationComplete.pass?.registrationRef || freeRegistrationComplete.ticket?.registrationRef || freeRegistrationComplete.ticket?.ticketNumber || 'TICKZA-FREE'}
                  </p>

                  {freeRegistrationComplete.pass?.qrCodeDataUrl ? (
                    <img
                      src={freeRegistrationComplete.pass.qrCodeDataUrl}
                      alt="Tickza Verified QR Code"
                      style={{
                        width: '160px',
                        height: '160px',
                        margin: '0 auto',
                        display: 'block',
                        borderRadius: '8px',
                        backgroundColor: '#FFFFFF',
                        padding: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      }}
                    />
                  ) : (
                    <div style={{ padding: '20px', backgroundColor: '#FFFFFF', borderRadius: '8px', color: '#059669', fontWeight: 600, fontSize: '13px' }}>
                      QR Pass generated & stored in your wallet
                    </div>
                  )}

                  <p style={{ margin: '12px 0 0', fontSize: '11px', color: '#065F46' }}>
                    🔒 Scan at venue turnstile for admission verification.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button
                    className="btn-primary"
                    style={{ padding: '14px', borderRadius: '10px', fontSize: '15px', backgroundColor: '#059669', borderColor: '#059669' }}
                    onClick={() => navigate('/tickets')}
                  >
                    View in My Tickets <ArrowRight size={16} />
                  </button>
                  <button
                    className="btn-secondary"
                    style={{ padding: '12px', borderRadius: '10px' }}
                    onClick={() => {
                      setShowFreeRegModal(false);
                      setFreeRegistrationComplete(null);
                    }}
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              /* Free Registration Form */
              <div>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E5E5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Free Event Registration</h3>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6B6B6B' }}>Reserve your complimentary admission pass</p>
                  </div>
                  <button
                    onClick={() => setShowFreeRegModal(false)}
                    style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#6B6B6B' }}
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleConfirmFreeRegistration} style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                    <div>
                      <label className="input-label">First Name *</label>
                      <input
                        type="text"
                        required
                        className="input"
                        value={attendeeForm.firstName}
                        onChange={(e) => setAttendeeForm({ ...attendeeForm, firstName: e.target.value })}
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="input-label">Last Name *</label>
                      <input
                        type="text"
                        required
                        className="input"
                        value={attendeeForm.lastName}
                        onChange={(e) => setAttendeeForm({ ...attendeeForm, lastName: e.target.value })}
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label className="input-label">Email Address *</label>
                    <input
                      type="email"
                      required
                      className="input"
                      value={attendeeForm.email}
                      onChange={(e) => setAttendeeForm({ ...attendeeForm, email: e.target.value })}
                      placeholder="john@example.com"
                    />
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label className="input-label">Phone Number (Optional)</label>
                    <input
                      type="tel"
                      className="input"
                      value={attendeeForm.phone}
                      onChange={(e) => setAttendeeForm({ ...attendeeForm, phone: e.target.value })}
                      placeholder="+234 800 000 0000"
                    />
                  </div>

                  <div style={{ marginBottom: '18px' }}>
                    <label className="input-label">Special Requests / Dietary Notes (Optional)</label>
                    <input
                      type="text"
                      className="input"
                      value={attendeeForm.notes}
                      onChange={(e) => setAttendeeForm({ ...attendeeForm, notes: e.target.value })}
                      placeholder="Wheelchair access, dietary preferences, etc."
                    />
                  </div>

                  {/* Summary Box */}
                  <div style={{ padding: '14px', backgroundColor: '#F0FDF4', borderRadius: '10px', marginBottom: '20px', border: '1px solid #A7F3D0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#065F46', marginBottom: 4 }}>
                      <span>Admission Type</span>
                      <strong style={{ color: '#059669' }}>FREE PASS</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 800, borderTop: '1px solid #D1FAE5', paddingTop: 8, marginTop: 4 }}>
                      <span style={{ color: '#065F46' }}>Total Amount</span>
                      <span style={{ color: '#059669' }}>₦0.00</span>
                    </div>
                    <p style={{ margin: '6px 0 0', fontSize: '11px', color: '#047857' }}>
                      No payment required. Your authenticated digital QR pass will be issued immediately upon confirmation.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={registeringFree}
                    className="btn-primary"
                    style={{ width: '100%', padding: '14px', borderRadius: '10px', fontSize: '15px', backgroundColor: '#059669', borderColor: '#059669' }}
                  >
                    {registeringFree ? (
                      <TickzaSpinner size="sm" color="#FFFFFF" message="Generating QR pass..." />
                    ) : (
                      'Confirm Free Registration • ₦0'
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
