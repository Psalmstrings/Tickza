import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../lib/axios.js';
import { getEventImageUrl, handleImageFallback } from '../../lib/imageHelper.js';
import './organizer.css';
import {
  ArrowLeft, Save, Calendar, Clock, MapPin,
  Upload, Image as ImageIcon, Check, AlertCircle,
  Eye, Ticket, Trash2, Globe
} from 'lucide-react';

const CATEGORIES = [
  'Music', 'Concerts', 'Sports', 'Arts & Theater',
  'Family', 'Conference', 'Comedy', 'Festival', 'Campus', 'Party'
];

const STATUS_OPTIONS = [
  { value: 'PUBLISHED', label: 'Published (Live & Selling)' },
  { value: 'DRAFT', label: 'Draft (Hidden from Public)' },
  { value: 'SUSPENDED', label: 'Suspended / Cancelled (Sales Stopped)' },
  { value: 'ENDED', label: 'Ended (Archived Event)' },
];

export default function OrganizerEditEventPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form state
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Music',
    venue: '',
    address: '',
    entranceInfo: '',
    startDate: '',
    startTime: '19:00',
    endDate: '',
    endTime: '',
    doorsOpen: '',
    status: 'PUBLISHED',
    countdownEnabled: true,
    multiDay: false,
    coverImageUrl: '',
  });

  const [originalEvent, setOriginalEvent] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch event details
  useEffect(() => {
    setLoading(true);
    api.get(`/events/${id}`)
      .then(({ data }) => {
        const ev = data.data || data;
        setOriginalEvent(ev);
        setForm({
          title: ev.title || '',
          description: ev.description || '',
          category: ev.category || 'Music',
          venue: ev.venue || '',
          address: ev.address || '',
          entranceInfo: ev.entranceInfo || '',
          startDate: ev.startDate ? new Date(ev.startDate).toISOString().slice(0, 10) : '',
          startTime: ev.startTime || '19:00',
          endDate: ev.endDate ? new Date(ev.endDate).toISOString().slice(0, 10) : '',
          endTime: ev.endTime || '',
          doorsOpen: ev.doorsOpen || '',
          status: ev.status || 'PUBLISHED',
          countdownEnabled: ev.countdownEnabled !== false,
          multiDay: Boolean(ev.multiDay),
          coverImageUrl: ev.coverImage?.url || ev.coverImageUrl || '',
        });
      })
      .catch((err) => {
        setErrorMsg(err.response?.data?.message || 'Failed to load event for editing.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Image Upload handler
  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setErrorMsg('');
    try {
      const fd = new FormData();
      fd.append('image', file);
      const { data } = await api.post('/upload/image', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const resolvedUrl = data.data?.url || data.url;
      setForm((prev) => ({ ...prev, coverImageUrl: resolvedUrl }));
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Image upload failed. You can paste a direct URL.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Submit update
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setErrorMsg('Event title is required.');
      return;
    }
    if (!form.venue.trim()) {
      setErrorMsg('Venue is required.');
      return;
    }
    if (!form.startDate) {
      setErrorMsg('Event start date is required.');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description,
        category: form.category,
        venue: form.venue.trim(),
        address: form.address,
        entranceInfo: form.entranceInfo,
        startDate: form.startDate,
        startTime: form.startTime,
        endDate: form.endDate || null,
        endTime: form.endTime || '',
        doorsOpen: form.doorsOpen || '',
        status: form.status,
        countdownEnabled: form.countdownEnabled,
        multiDay: form.multiDay,
        coverImageUrl: form.coverImageUrl,
      };

      const { data } = await api.put(`/organizer/events/${id}`, payload);
      setSuccessMsg('Event updated successfully! All changes are now live.');
      if (data.data) {
        setOriginalEvent(data.data);
      }
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update event.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="org-page">
        <div className="org-skeleton" style={{ height: 60, borderRadius: 12, marginBottom: 20 }} />
        <div className="org-skeleton" style={{ height: 400, borderRadius: 12 }} />
      </div>
    );
  }

  return (
    <div className="org-page">
      {/* Top Header */}
      <div className="org-page-header">
        <div>
          <Link
            to="/organizer/events"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              color: '#475569',
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'none',
              marginBottom: 8,
            }}
          >
            <ArrowLeft size={14} /> Back to Events List
          </Link>
          <h1 className="org-page-title">Edit Event: {originalEvent?.title || 'Event Details'}</h1>
          <p className="org-page-subtitle">Update venue, schedules, cover artwork, and publication visibility.</p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <a
            href={`/events/${id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="org-btn org-btn-secondary"
          >
            <Eye size={14} /> View Public Page
          </a>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="org-btn org-btn-primary"
          >
            <Save size={14} /> {saving ? 'Saving Changes…' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div style={{
          background: '#ECFDF5', border: '1px solid #10B981', color: '#047857',
          padding: '12px 16px', borderRadius: 8, fontSize: 13, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8
        }}>
          <Check size={16} /> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div style={{
          background: '#FEF2F2', border: '1px solid #EF4444', color: '#B91C1C',
          padding: '12px 16px', borderRadius: 8, fontSize: 13, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8
        }}>
          <AlertCircle size={16} /> {errorMsg}
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
          {/* Left Column: Core Event Information */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Basic Info Card */}
            <div className="org-card" style={{ padding: 22 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 16px', color: '#0B1026' }}>
                Event Details & Title
              </h3>

              <div className="org-form-group">
                <label className="org-label">Event Title</label>
                <input
                  className="org-input"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Afro Nation Lagos 2026"
                  required
                />
              </div>

              <div className="org-grid-2">
                <div className="org-form-group">
                  <label className="org-label">Category</label>
                  <select
                    className="org-select"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="org-form-group">
                  <label className="org-label">Publication Status</label>
                  <select
                    className="org-select"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="org-form-group">
                <label className="org-label">Event Description & Artist Lineup</label>
                <textarea
                  className="org-textarea"
                  style={{ minHeight: 120 }}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Provide complete details about event program, schedule, VIP access, and rules."
                />
              </div>
            </div>

            {/* Date & Schedule Card */}
            <div className="org-card" style={{ padding: 22 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 16px', color: '#0B1026' }}>
                Date, Time & Venue
              </h3>

              <div className="org-grid-2">
                <div className="org-form-group">
                  <label className="org-label">Start Date</label>
                  <input
                    type="date"
                    className="org-input"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="org-form-group">
                  <label className="org-label">Start Time</label>
                  <input
                    type="time"
                    className="org-input"
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="org-grid-2">
                <div className="org-form-group">
                  <label className="org-label">End Date (Optional for multi-day)</label>
                  <input
                    type="date"
                    className="org-input"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  />
                </div>
                <div className="org-form-group">
                  <label className="org-label">End Time / Doors Open</label>
                  <input
                    type="text"
                    className="org-input"
                    placeholder="e.g. 23:00 or Doors open 17:00"
                    value={form.doorsOpen}
                    onChange={(e) => setForm({ ...form, doorsOpen: e.target.value })}
                  />
                </div>
              </div>

              <div className="org-form-group">
                <label className="org-label">Venue / Stadium / Hall Name</label>
                <input
                  className="org-input"
                  value={form.venue}
                  onChange={(e) => setForm({ ...form, venue: e.target.value })}
                  placeholder="e.g. Eko Convention Centre"
                  required
                />
              </div>

              <div className="org-form-group">
                <label className="org-label">Physical Address & City</label>
                <input
                  className="org-input"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="e.g. Plot 1415 Adetokunbo Ademola St, Victoria Island, Lagos"
                />
              </div>

              <div className="org-form-group">
                <label className="org-label">Gate / Parking / Entrance Instructions</label>
                <input
                  className="org-input"
                  value={form.entranceInfo}
                  onChange={(e) => setForm({ ...form, entranceInfo: e.target.value })}
                  placeholder="e.g. Enter through Gate B. Free parking on premises."
                />
              </div>
            </div>
          </div>

          {/* Right Column: Image Artwork & Quick Navigation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Cover Image Replacement */}
            <div className="org-card" style={{ padding: 22 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 14px', color: '#0B1026' }}>
                Event Banner & Artwork
              </h3>

              {/* Current Preview */}
              <div style={{
                width: '100%', height: 180, borderRadius: 10, overflow: 'hidden',
                background: '#0B1026', marginBottom: 14, position: 'relative', border: '1px solid #E2E8F0'
              }}>
                <img
                  src={getEventImageUrl(form.coverImageUrl)}
                  alt="Event Banner Preview"
                  onError={handleImageFallback}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {uploadingImage && (
                  <div style={{
                    position: 'absolute', inset: 0, background: 'rgba(11,16,38,0.75)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontSize: 13, fontWeight: 600
                  }}>
                    Uploading image…
                  </div>
                )}
              </div>

              {/* Replace Image Button */}
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/png,image/jpeg,image/webp"
                onChange={handleImageFileChange}
              />

              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="org-btn org-btn-secondary"
                  style={{ flex: 1 }}
                >
                  <Upload size={14} /> {uploadingImage ? 'Uploading…' : 'Replace Image File'}
                </button>
              </div>

              <div className="org-form-group">
                <label className="org-label">Or Image URL</label>
                <input
                  className="org-input"
                  style={{ fontSize: 12 }}
                  value={form.coverImageUrl}
                  onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <p style={{ fontSize: 11, color: '#64748B', margin: 0 }}>
                Recommended resolution: 1200 × 630px (JPG, PNG or WEBP).
              </p>
            </div>

            {/* Ticket Management Quick Link */}
            <div className="org-card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <Ticket size={16} color="#4F46E5" />
                <h4 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: '#0B1026' }}>
                  Ticket Tiers & Pricing
                </h4>
              </div>
              <p style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.4, margin: '0 0 14px' }}>
                Ticket pricing and capacity tiers are managed independently to safeguard historical bookings.
              </p>
              <Link
                to={`/organizer/tickets?event=${id}`}
                className="org-btn org-btn-secondary org-btn-sm"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Manage Ticket Tiers
              </Link>
            </div>

            {/* Save Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                type="submit"
                disabled={saving}
                className="org-btn org-btn-primary"
                style={{ height: 44, fontSize: 14 }}
              >
                <Save size={15} /> {saving ? 'Saving Changes…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
