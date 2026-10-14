import React, { useState, useEffect } from 'react';
import api from '../../lib/axios.js';
import './organizer.css';
import {
  Megaphone, Copy, Check, Share2, MessageCircle,
  Globe, Sparkles, ExternalLink, Calendar, MapPin
} from 'lucide-react';
import { getEventImageUrl, handleImageFallback } from '../../lib/imageHelper.js';

const XIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const FacebookIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

export default function OrganizerMarketingPage() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [copied, setCopied] = useState(false);
  const [utmSource, setUtmSource] = useState('instagram');
  const [utmCampaign, setUtmCampaign] = useState('earlybird');

  useEffect(() => {
    api.get('/organizer/events')
      .then(({ data }) => {
        const list = data.data || [];
        setEvents(list);
        if (list.length > 0) setSelectedEvent(list[0]);
      })
      .catch(() => setEvents([]));
  }, []);

  const eventUrl = selectedEvent
    ? `${window.location.origin}/events/${selectedEvent._id}`
    : window.location.origin;

  const campaignUrl = `${eventUrl}?utm_source=${utmSource}&utm_campaign=${utmCampaign}`;

  const handleCopy = (urlToCopy) => {
    navigator.clipboard.writeText(urlToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    if (!selectedEvent) return;
    const text = encodeURIComponent(`🎟️ Get tickets for ${selectedEvent.title} on Tickza!\n📅 ${new Date(selectedEvent.startDate).toLocaleDateString()}\n📍 ${selectedEvent.venue}\n\nBook your tickets here: ${campaignUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleShareX = () => {
    if (!selectedEvent) return;
    const text = encodeURIComponent(`Tickets are now live for ${selectedEvent.title}! 🎟️ Get yours on @Tickza: ${campaignUrl}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(campaignUrl)}`, '_blank');
  };

  return (
    <div className="org-page">
      {/* Header */}
      <div className="org-page-header">
        <div>
          <h1 className="org-page-title">Marketing & Event Promotion</h1>
          <p className="org-page-subtitle">Generate trackable share links, social promo graphics, and viral WhatsApp campaign triggers.</p>
        </div>

        <select
          className="org-select"
          style={{ width: 240 }}
          value={selectedEvent?._id || ''}
          onChange={(e) => {
            const ev = events.find(item => item._id === e.target.value);
            if (ev) setSelectedEvent(ev);
          }}
        >
          {events.map((ev) => (
            <option key={ev._id} value={ev._id}>{ev.title}</option>
          ))}
        </select>
      </div>

      {/* Grid: Share Tools Left, Visual Card Preview Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
        {/* Left Column: Promotion Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Quick Direct Link */}
          <div className="org-card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 10px', color: '#0B1026' }}>
              Public Event Ticket Link
            </h3>
            <p style={{ fontSize: 13, color: '#475569', margin: '0 0 14px' }}>
              Direct link to this event's checkout page for attendees.
            </p>

            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="org-input"
                readOnly
                value={eventUrl}
                style={{ background: '#F8FAFC', color: '#0B1026', fontFamily: 'monospace', fontSize: 13 }}
              />
              <button
                onClick={() => handleCopy(eventUrl)}
                className="org-btn org-btn-primary"
                style={{ flexShrink: 0 }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>

          {/* Social Quick Share */}
          <div className="org-card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 14px', color: '#0B1026' }}>
              1-Click Social Sharing
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              <button
                onClick={handleShareWhatsApp}
                className="org-btn org-btn-secondary"
                style={{ height: 44, color: '#16A34A', borderColor: '#BBF7D0', background: '#F0FDF4' }}
              >
                <MessageCircle size={16} /> WhatsApp
              </button>

              <button
                onClick={handleShareX}
                className="org-btn org-btn-secondary"
                style={{ height: 44, color: '#0F172A' }}
              >
                <XIcon size={15} /> X (Twitter)
              </button>

              <button
                onClick={handleShareFacebook}
                className="org-btn org-btn-secondary"
                style={{ height: 44, color: '#1D4ED8', borderColor: '#BFDBFE', background: '#EFF6FF' }}
              >
                <FacebookIcon size={16} /> Facebook
              </button>
            </div>
          </div>

          {/* UTM Campaign URL Builder */}
          <div className="org-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Sparkles size={16} color="#4F46E5" />
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: '#0B1026' }}>
                Trackable Campaign Link Builder (UTM)
              </h3>
            </div>
            <p style={{ fontSize: 13, color: '#475569', margin: '0 0 14px' }}>
              Create designated links for influencers, Instagram bios, or email blasts to track where your sales originate.
            </p>

            <div className="org-grid-2" style={{ marginBottom: 14 }}>
              <div>
                <label className="org-label">Traffic Channel (Source)</label>
                <select
                  className="org-select"
                  value={utmSource}
                  onChange={e => setUtmSource(e.target.value)}
                >
                  <option value="instagram">Instagram Bio / Story</option>
                  <option value="tiktok">TikTok Video</option>
                  <option value="whatsapp">WhatsApp Broadcast</option>
                  <option value="twitter">X / Twitter Thread</option>
                  <option value="influencer">Influencer Promo</option>
                  <option value="newsletter">Email Newsletter</option>
                </select>
              </div>

              <div>
                <label className="org-label">Campaign Name</label>
                <input
                  className="org-input"
                  value={utmCampaign}
                  onChange={e => setUtmCampaign(e.target.value)}
                  placeholder="e.g. flash_sale_v1"
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="org-input"
                readOnly
                value={campaignUrl}
                style={{ background: '#F8FAFC', fontSize: 12, fontFamily: 'monospace' }}
              />
              <button
                onClick={() => handleCopy(campaignUrl)}
                className="org-btn org-btn-secondary"
                style={{ flexShrink: 0 }}
              >
                <Copy size={14} /> Copy
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Promotional Card Mockup Preview */}
        <div>
          <div className="org-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: '#0B1026' }}>
                Live Digital Ticket Preview
              </h3>
              <span className="org-badge org-badge-purple">Tickza High-Fi</span>
            </div>

            {selectedEvent ? (
              <div style={{
                background: '#FFFFFF',
                borderRadius: 14,
                border: '1px solid #E2E8F0',
                boxShadow: '0 10px 25px rgba(11,16,38,0.08)',
                overflow: 'hidden'
              }}>
                <div style={{ height: 160, background: '#0B1026', position: 'relative' }}>
                  <img
                    src={getEventImageUrl(selectedEvent.coverImage?.url || selectedEvent.coverImage || selectedEvent.bannerImage)}
                    alt=""
                    onError={handleImageFallback}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
                  />
                  <div style={{
                    position: 'absolute', top: 12, left: 12,
                    background: 'rgba(11,16,38,0.8)', color: '#FFF',
                    fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6
                  }}>
                    {selectedEvent.category || 'Event'}
                  </div>
                </div>

                <div style={{ padding: 18 }}>
                  <h4 style={{ fontSize: 17, fontWeight: 800, color: '#0B1026', margin: '0 0 8px' }}>
                    {selectedEvent.title}
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: '#475569', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Calendar size={13} color="#4F46E5" />
                      {new Date(selectedEvent.startDate).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} at {selectedEvent.startTime || '7:00 PM'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MapPin size={13} color="#EF4444" />
                      {selectedEvent.venue}
                    </div>
                  </div>

                  <div style={{
                    padding: '12px 14px',
                    background: '#F8FAFC',
                    borderRadius: 8,
                    border: '1px dashed #CBD5E1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', fontWeight: 600 }}>Official Tickets</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#0B1026' }}>Verified On Tickza</div>
                    </div>
                    <a
                      href={eventUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="org-btn org-btn-primary org-btn-sm"
                    >
                      Visit Event <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#94A3B8', padding: '40px 0' }}>
                Select an event to preview share card.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
