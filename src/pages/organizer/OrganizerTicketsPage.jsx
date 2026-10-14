import React, { useState, useEffect } from 'react';
import api from '../../lib/axios.js';
import './organizer.css';
import {
  Ticket, Plus, Edit2, Trash2, CheckCircle2,
  DollarSign, Users, AlertCircle, X, Layers,
  Calendar, Eye, ArrowRight, Copy, Sparkles,
  ShieldCheck, HelpCircle, ToggleLeft, ToggleRight,
  ListPlus, Info, Check
} from 'lucide-react';

const TICKET_FORMATS = [
  {
    id: 'INDIVIDUAL',
    title: 'Individual Admission',
    desc: 'Standard single entry (e.g. Regular Male, Female, Early Bird, VIP)',
    defaultCapacity: 1,
    icon: '👤',
  },
  {
    id: 'GROUP_BUNDLE',
    title: 'Group & Bundle Pass',
    desc: 'Multi-person package (e.g. Two-Pack, Circle of 5, Couple Pass)',
    defaultCapacity: 5,
    icon: '👥',
  },
  {
    id: 'RESERVED_TABLE',
    title: 'Reserved Table',
    desc: 'Table reservation with seating capacity & VIP hospitality perks',
    defaultCapacity: 10,
    icon: '🍾',
  },
  {
    id: 'CUSTOM',
    title: 'Custom Ticket Type',
    desc: 'Bespoke admission tier with tailored pricing, capacity & custom terms',
    defaultCapacity: 1,
    icon: '✨',
  },
];

const PRESETS_BY_FORMAT = {
  INDIVIDUAL: [
    { name: 'Regular Male', price: 5000, desc: 'General admission for male attendees' },
    { name: 'Regular Female', price: 3000, desc: 'General admission for female attendees' },
    { name: 'Early Bird', price: 3000, desc: 'Discounted early admission tickets' },
    { name: 'Regular Admission', price: 10000, desc: 'Standard entry pass' },
    { name: 'VIP Admission', price: 50000, desc: 'VIP lounge access, priority gate lane & welcome drink' },
    { name: 'Backstage Pass', price: 75000, desc: 'Full artist backstage access, sound check & VIP badge' },
  ],
  GROUP_BUNDLE: [
    { name: 'Two-Pack Ticket', price: 27000, admitted: 2, desc: 'Admits 2 persons under one order pass' },
    { name: 'Couple Pass', price: 25000, admitted: 2, desc: 'Romantic couple admission with photo op' },
    { name: 'Circle of 5', price: 40000, admitted: 5, desc: 'Group package admitting up to 5 squad members' },
    { name: 'Circle of 7', price: 55000, admitted: 7, desc: 'Group package admitting up to 7 squad members' },
    { name: 'Friends & Family Package', price: 65000, admitted: 6, desc: 'Complete friends and family entry package' },
  ],
  RESERVED_TABLE: [
    { name: 'Silver Table', price: 100000, admitted: 6, desc: 'Reserved table for 6 with 1 premium bottle' },
    { name: 'Gold Table', price: 200000, admitted: 8, desc: 'Reserved prime table for 8 with 2 premium bottles & platter' },
    { name: 'Platinum Table', price: 300000, admitted: 10, desc: 'Ultra-exclusive stage-side VIP table for 10 with dedicated hostess' },
  ],
  CUSTOM: [
    { name: 'Student Pass', price: 2500, admitted: 1, desc: 'Valid university student ID required at gate' },
    { name: 'Media / Press Pass', price: 0, admitted: 1, desc: 'Accredited press & content creators' },
    { name: 'Vendor Staff Pass', price: 0, admitted: 2, desc: 'Entry pass for vendor crew' },
  ],
};

export default function OrganizerTicketsPage() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [ticketTypes, setTicketTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    format: 'INDIVIDUAL',
    description: '',
    price: 5000,
    currency: 'NGN',
    quantity: 100,
    admittedPerTicket: 1,
    section: 'General',
    row: '',
    benefits: '',
    minPerOrder: 1,
    maxPerCustomer: '',
    transferable: true,
    resellable: true,
    isActive: true,
    visibility: 'PUBLIC',
    saleStartDate: '',
    saleEndDate: '',
    terms: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [previewTab, setPreviewTab] = useState('card'); // 'card' or 'details'

  // Fetch events
  useEffect(() => {
    api.get('/organizer/events')
      .then(({ data }) => {
        const list = data.data || [];
        setEvents(list);
        if (list.length > 0) setSelectedEventId(list[0]._id);
      })
      .catch(() => setEvents([]));
  }, []);

  // Fetch ticket types for selected event
  const fetchTicketTypes = async (eventId) => {
    if (!eventId) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/organizer/events/${eventId}/ticket-types`);
      setTicketTypes(data.data || []);
    } catch {
      setTicketTypes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedEventId) fetchTicketTypes(selectedEventId);
  }, [selectedEventId]);

  const handleOpenCreate = (preselectedFormat = 'INDIVIDUAL') => {
    setEditingId(null);
    setForm({
      name: preselectedFormat === 'GROUP_BUNDLE' ? 'Circle of 5' : preselectedFormat === 'RESERVED_TABLE' ? 'Gold Table' : 'Regular Admission',
      format: preselectedFormat,
      description: preselectedFormat === 'GROUP_BUNDLE' ? 'Group bundle admitting 5 attendees together' : preselectedFormat === 'RESERVED_TABLE' ? 'Reserved VIP Table including bottle service' : 'General event entry pass',
      price: preselectedFormat === 'GROUP_BUNDLE' ? 40000 : preselectedFormat === 'RESERVED_TABLE' ? 200000 : 5000,
      currency: 'NGN',
      quantity: preselectedFormat === 'RESERVED_TABLE' ? 10 : 100,
      admittedPerTicket: preselectedFormat === 'GROUP_BUNDLE' ? 5 : preselectedFormat === 'RESERVED_TABLE' ? 8 : 1,
      section: preselectedFormat === 'RESERVED_TABLE' ? 'VIP Terrace' : 'General',
      row: '',
      benefits: preselectedFormat === 'RESERVED_TABLE' ? 'Dedicated VIP Table\n2 Premium Bottles\nPriority Turnstile Entrance' : '',
      minPerOrder: 1,
      maxPerCustomer: '',
      transferable: true,
      resellable: true,
      isActive: true,
      visibility: 'PUBLIC',
      saleStartDate: '',
      saleEndDate: '',
      terms: '',
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const handleOpenEdit = (tt) => {
    setEditingId(tt._id);
    setForm({
      name: tt.name || '',
      format: tt.format || 'INDIVIDUAL',
      description: tt.description || '',
      price: tt.price !== undefined ? tt.price : 0,
      currency: tt.currency || 'NGN',
      quantity: tt.quantity || 100,
      admittedPerTicket: tt.admittedPerTicket || 1,
      section: tt.section || 'General',
      row: tt.row || '',
      benefits: Array.isArray(tt.benefits) ? tt.benefits.join('\n') : (tt.benefits || ''),
      minPerOrder: tt.minPerOrder || 1,
      maxPerCustomer: tt.maxPerCustomer || '',
      transferable: tt.transferable !== false,
      resellable: tt.resellable !== false,
      isActive: tt.isActive !== false,
      visibility: tt.visibility || 'PUBLIC',
      saleStartDate: tt.saleStartDate ? tt.saleStartDate.slice(0, 10) : '',
      saleEndDate: tt.saleEndDate ? tt.saleEndDate.slice(0, 10) : '',
      terms: tt.terms || '',
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const applyPreset = (preset) => {
    setForm((prev) => ({
      ...prev,
      name: preset.name,
      price: preset.price,
      description: preset.desc || prev.description,
      admittedPerTicket: preset.admitted || prev.admittedPerTicket || 1,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setErrorMsg('Please specify a ticket type name.');
      return;
    }
    if (form.quantity < 1) {
      setErrorMsg('Quantity must be at least 1.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        format: form.format,
        description: form.description.trim(),
        price: Math.max(0, parseFloat(form.price) || 0),
        currency: form.currency || 'NGN',
        quantity: parseInt(form.quantity, 10),
        admittedPerTicket: Math.max(1, parseInt(form.admittedPerTicket, 10) || 1),
        section: form.section.trim(),
        row: form.row.trim(),
        benefits: form.benefits.split('\n').map((b) => b.trim()).filter(Boolean),
        minPerOrder: form.minPerOrder ? Math.max(1, parseInt(form.minPerOrder, 10)) : 1,
        maxPerCustomer: form.maxPerCustomer ? Math.max(1, parseInt(form.maxPerCustomer, 10)) : null,
        transferable: form.transferable,
        resellable: form.resellable,
        isActive: form.isActive,
        visibility: form.visibility,
        saleStartDate: form.saleStartDate || null,
        saleEndDate: form.saleEndDate || null,
        terms: form.terms.trim(),
      };

      if (editingId) {
        await api.put(`/organizer/events/${selectedEventId}/ticket-types/${editingId}`, payload);
      } else {
        await api.post(`/organizer/events/${selectedEventId}/ticket-types`, payload);
      }

      setShowModal(false);
      fetchTicketTypes(selectedEventId);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save ticket tier');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDuplicate = async (ttId) => {
    setActionLoadingId(ttId);
    try {
      await api.post(`/organizer/events/${selectedEventId}/ticket-types/${ttId}/duplicate`);
      fetchTicketTypes(selectedEventId);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to duplicate ticket type');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleActive = async (tt) => {
    setActionLoadingId(tt._id);
    try {
      await api.put(`/organizer/events/${selectedEventId}/ticket-types/${tt._id}`, {
        isActive: !tt.isActive,
      });
      fetchTicketTypes(selectedEventId);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update ticket status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (ttId, name) => {
    if (!window.confirm(`Delete "${name}"? If any tickets were already purchased for this tier, deletion will be safely rejected to protect sales history.`)) return;
    setActionLoadingId(ttId);
    try {
      await api.delete(`/organizer/events/${selectedEventId}/ticket-types/${ttId}`);
      fetchTicketTypes(selectedEventId);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete tier');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Metrics
  const totalPackages = ticketTypes.reduce((s, t) => s + (t.quantity || 0), 0);
  const totalAvailablePackages = ticketTypes.reduce((s, t) => s + (t.availableQuantity || 0), 0);
  const totalSoldPackages = totalPackages - totalAvailablePackages;
  const totalPotentialAttendees = ticketTypes.reduce((s, t) => s + (t.quantity || 0) * (t.admittedPerTicket || 1), 0);
  const totalAdmittedSold = ticketTypes.reduce((s, t) => {
    const sold = (t.quantity || 0) - (t.availableQuantity || 0);
    return s + sold * (t.admittedPerTicket || 1);
  }, 0);

  const selectedEvent = events.find((e) => e._id === selectedEventId);

  // Live preview calculations
  const previewBenefitsList = form.benefits.split('\n').map((b) => b.trim()).filter(Boolean);
  const previewGrossPerUnit = (parseFloat(form.price) || 0);
  const previewCapacity = parseInt(form.admittedPerTicket, 10) || 1;

  return (
    <div className="org-page">
      {/* Header */}
      <div className="org-page-header">
        <div>
          <h1 className="org-page-title">Flexible Ticket Creation & Pricing</h1>
          <p className="org-page-subtitle">
            Define custom ticket tiers, individual tickets, group bundles, and reserved tables for any campus event.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            className="org-select"
            style={{ minWidth: 220 }}
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
          >
            {events.map((ev) => (
              <option key={ev._id} value={ev._id}>{ev.title}</option>
            ))}
          </select>

          <button
            onClick={() => handleOpenCreate('INDIVIDUAL')}
            className="org-btn org-btn-primary"
            disabled={!selectedEventId}
          >
            <Plus size={15} /> Create Ticket Type
          </button>
        </div>
      </div>

      {/* Format Quick Launch Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 20 }}>
        {TICKET_FORMATS.map((fmt) => (
          <div
            key={fmt.id}
            onClick={() => selectedEventId && handleOpenCreate(fmt.id)}
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: 12,
              padding: '14px 16px',
              cursor: selectedEventId ? 'pointer' : 'default',
              transition: 'all 0.15s ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
            className="org-format-card"
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 20 }}>{fmt.icon}</span>
                <span style={{ fontWeight: 700, fontSize: 14, color: '#0B1026' }}>{fmt.title}</span>
              </div>
              <p style={{ fontSize: 12, color: '#64748B', margin: 0, lineHeight: 1.4 }}>
                {fmt.desc}
              </p>
            </div>
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 4, color: '#4F46E5', fontSize: 12, fontWeight: 700 }}>
              <Plus size={13} /> Add {fmt.title}
            </div>
          </div>
        ))}
      </div>

      {/* Inventory & Capacity Overview */}
      <div className="org-stats-grid" style={{ marginBottom: 24 }}>
        <div className="org-stat-card">
          <div className="org-stat-icon" style={{ background: '#EEF2FF', color: '#4F46E5' }}>
            <Layers size={18} />
          </div>
          <div className="org-stat-label">Total Packages / Passes</div>
          <div className="org-stat-value">{totalPackages.toLocaleString()}</div>
          <div className="org-stat-delta">{ticketTypes.length} configured ticket types</div>
        </div>

        <div className="org-stat-card info">
          <div className="org-stat-icon" style={{ background: '#ECFEFF', color: '#0891B2' }}>
            <Users size={18} />
          </div>
          <div className="org-stat-label">Max Turnstile Capacity</div>
          <div className="org-stat-value" style={{ color: '#0891B2' }}>{totalPotentialAttendees.toLocaleString()}</div>
          <div className="org-stat-delta positive">Includes group and table seats</div>
        </div>

        <div className="org-stat-card success">
          <div className="org-stat-icon" style={{ background: '#ECFDF5', color: '#10B981' }}>
            <Ticket size={18} />
          </div>
          <div className="org-stat-label">Packages Sold</div>
          <div className="org-stat-value" style={{ color: '#10B981' }}>{totalSoldPackages.toLocaleString()}</div>
          <div className="org-stat-delta positive">
            {totalAdmittedSold} attendees admitted ({totalPackages > 0 ? Math.round((totalSoldPackages / totalPackages) * 100) : 0}% booked)
          </div>
        </div>

        <div className="org-stat-card warning">
          <div className="org-stat-icon" style={{ background: '#FFFBEB', color: '#F59E0B' }}>
            <AlertCircle size={18} />
          </div>
          <div className="org-stat-label">Available Inventory</div>
          <div className="org-stat-value" style={{ color: '#F59E0B' }}>{totalAvailablePackages.toLocaleString()}</div>
          <div className="org-stat-delta">Open for purchase</div>
        </div>
      </div>

      {/* Ticket Types Table */}
      <div className="org-card">
        <div className="org-card-header">
          <h3 className="org-card-title">Event Ticket Types & Admission Inventory</h3>
          {selectedEvent && (
            <span style={{ fontSize: 13, color: '#64748B' }}>
              Showing tickets for <strong>{selectedEvent.title}</strong>
            </span>
          )}
        </div>

        {loading ? (
          <div style={{ padding: 24 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="org-skeleton" style={{ height: 60, marginBottom: 8, borderRadius: 8 }} />
            ))}
          </div>
        ) : ticketTypes.length === 0 ? (
          <div className="org-empty" style={{ padding: 48 }}>
            <div className="org-empty-icon"><Ticket size={24} /></div>
            <div className="org-empty-title">No ticket types created yet</div>
            <div className="org-empty-subtitle">
              Organizers have complete freedom to define unlimited varieties of Individual tickets (Regular Male/Female, VIP, Early Bird), Group packages (Circle of 5, Couple Pass), and Reserved Tables (Silver, Gold, Platinum).
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <button onClick={() => handleOpenCreate('INDIVIDUAL')} className="org-btn org-btn-primary">
                <Plus size={15} /> Add Individual Ticket
              </button>
              <button onClick={() => handleOpenCreate('GROUP_BUNDLE')} className="org-btn org-btn-secondary">
                <Users size={15} /> Add Group Pass
              </button>
              <button onClick={() => handleOpenCreate('RESERVED_TABLE')} className="org-btn org-btn-secondary">
                🍾 Add Reserved Table
              </button>
            </div>
          </div>
        ) : (
          <div className="org-table-wrap">
            <table className="org-table">
              <thead>
                <tr>
                  <th>Ticket Name & Type</th>
                  <th>Format / Capacity</th>
                  <th>Price</th>
                  <th>Inventory Sold / Left</th>
                  <th>Sales Window</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {ticketTypes.map((tt) => {
                  const sold = (tt.quantity || 0) - (tt.availableQuantity || 0);
                  const pct = tt.quantity > 0 ? Math.round((sold / tt.quantity) * 100) : 0;
                  const capacity = tt.admittedPerTicket || 1;
                  const isSoldOut = (tt.availableQuantity || 0) <= 0;

                  return (
                    <tr key={tt._id}>
                      <td style={{ maxWidth: 260 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontWeight: 700, color: '#0B1026', fontSize: 14 }}>
                            {tt.name}
                          </span>
                          {tt.format === 'RESERVED_TABLE' && (
                            <span style={{ fontSize: 10, background: '#FEF3C7', color: '#92400E', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                              TABLE
                            </span>
                          )}
                          {tt.format === 'GROUP_BUNDLE' && (
                            <span style={{ fontSize: 10, background: '#E0E7FF', color: '#3730A3', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                              GROUP
                            </span>
                          )}
                        </div>
                        {tt.description && (
                          <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                            {tt.description}
                          </div>
                        )}
                        {Array.isArray(tt.benefits) && tt.benefits.length > 0 && (
                          <div style={{ fontSize: 11, color: '#059669', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Sparkles size={11} /> {tt.benefits.length} perk(s) included: {tt.benefits.slice(0, 2).join(', ')}{tt.benefits.length > 2 ? '…' : ''}
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#1E293B' }}>
                          {tt.format === 'RESERVED_TABLE'
                            ? `Table (${capacity} seats)`
                            : tt.format === 'GROUP_BUNDLE'
                            ? `Bundle (${capacity} persons)`
                            : 'Individual (1 person)'}
                        </div>
                        <div style={{ fontSize: 11, color: '#64748B' }}>
                          {tt.section || 'General'} {tt.row ? `• Row ${tt.row}` : ''}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: 15, fontWeight: 800, color: '#0B1026' }}>
                          {tt.price === 0 ? 'FREE' : `₦${tt.price.toLocaleString()}`}
                        </div>
                        {capacity > 1 && tt.price > 0 && (
                          <div style={{ fontSize: 11, color: '#64748B' }}>
                            ~₦{Math.round(tt.price / capacity).toLocaleString()}/person
                          </div>
                        )}
                      </td>
                      <td style={{ minWidth: 160 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#475569', marginBottom: 4 }}>
                          <span>{sold} sold ({sold * capacity} guests)</span>
                          <strong style={{ color: isSoldOut ? '#EF4444' : '#0B1026' }}>
                            {isSoldOut ? 'Sold Out' : `${tt.availableQuantity} left`}
                          </strong>
                        </div>
                        <div style={{ height: 6, background: '#F1F5F9', borderRadius: 99, overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${pct}%`,
                              height: '100%',
                              background: isSoldOut ? '#EF4444' : pct > 75 ? '#F59E0B' : '#4F46E5',
                              borderRadius: 99,
                            }}
                          />
                        </div>
                      </td>
                      <td style={{ fontSize: 12, color: '#475569' }}>
                        {tt.saleStartDate || tt.saleEndDate ? (
                          <div>
                            {tt.saleStartDate && <div>Starts: {new Date(tt.saleStartDate).toLocaleDateString()}</div>}
                            {tt.saleEndDate && <div>Ends: {new Date(tt.saleEndDate).toLocaleDateString()}</div>}
                          </div>
                        ) : (
                          <span style={{ color: '#94A3B8' }}>Available until event</span>
                        )}
                      </td>
                      <td>
                        <span
                          className={`org-badge ${
                            isSoldOut
                              ? 'org-badge-danger'
                              : tt.isActive !== false
                              ? 'org-badge-success'
                              : 'org-badge-neutral'
                          }`}
                        >
                          {isSoldOut ? 'Sold Out' : tt.isActive !== false ? 'Active' : 'Paused'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                          {/* Toggle Active/Pause */}
                          <button
                            onClick={() => handleToggleActive(tt)}
                            disabled={actionLoadingId === tt._id}
                            className="org-btn org-btn-secondary org-btn-sm"
                            style={{ padding: '0 8px' }}
                            title={tt.isActive ? 'Pause sales' : 'Resume sales'}
                          >
                            {tt.isActive ? <ToggleRight size={15} color="#10B981" /> : <ToggleLeft size={15} color="#94A3B8" />}
                          </button>

                          {/* Duplicate */}
                          <button
                            onClick={() => handleDuplicate(tt._id)}
                            disabled={actionLoadingId === tt._id}
                            className="org-btn org-btn-secondary org-btn-sm"
                            style={{ padding: '0 8px' }}
                            title="Duplicate Ticket Type"
                          >
                            <Copy size={13} />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEdit(tt)}
                            className="org-btn org-btn-secondary org-btn-sm"
                            style={{ padding: '0 8px' }}
                            title="Edit Ticket Details"
                          >
                            <Edit2 size={13} />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(tt._id, tt.name)}
                            disabled={actionLoadingId === tt._id}
                            className="org-btn org-btn-danger org-btn-sm"
                            style={{ padding: '0 8px' }}
                            title="Delete Ticket Type (Safe Check)"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL WITH LIVE PREVIEW */}
      {showModal && (
        <div className="org-overlay" onClick={() => setShowModal(false)}>
          <div
            className="org-modal"
            style={{ maxWidth: 940, width: '95%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="org-modal-header">
              <div>
                <h3 className="org-modal-title">
                  {editingId ? 'Edit Ticket Configuration' : 'Create Flexible Ticket Tier'}
                </h3>
                <p style={{ margin: 0, fontSize: 12, color: '#64748B' }}>
                  Organizers have full control to define names, prices, admission capacity, perks, and availability.
                </p>
              </div>
              <button className="org-btn org-btn-ghost org-btn-sm" onClick={() => setShowModal(false)}>
                <X size={16} />
              </button>
            </div>

            {/* Modal Body - Two Columns (Form + Live Customer Preview) */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div
                className="org-modal-body"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1.4fr) minmax(320px, 1fr)',
                  gap: 24,
                  overflowY: 'auto',
                  padding: 24,
                }}
              >
                {/* Left Column: Form Fields */}
                <div>
                  {errorMsg && (
                    <div
                      style={{
                        background: '#FEF2F2',
                        color: '#DC2626',
                        padding: '10px 14px',
                        borderRadius: 8,
                        fontSize: 13,
                        marginBottom: 16,
                        border: '1px solid #FECACA',
                      }}
                    >
                      {errorMsg}
                    </div>
                  )}

                  {/* 1. Ticket Format Selection */}
                  <div style={{ marginBottom: 18 }}>
                    <label className="org-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Ticket Format *</span>
                      <span style={{ fontSize: 11, color: '#64748B', fontWeight: 500 }}>Select admission style</span>
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {TICKET_FORMATS.map((fmt) => (
                        <div
                          key={fmt.id}
                          onClick={() => {
                            setForm((prev) => ({
                              ...prev,
                              format: fmt.id,
                              admittedPerTicket: fmt.defaultCapacity,
                            }));
                          }}
                          style={{
                            border: form.format === fmt.id ? '2px solid #4F46E5' : '1px solid #E2E8F0',
                            background: form.format === fmt.id ? '#EEF2FF' : '#FFFFFF',
                            borderRadius: 8,
                            padding: '10px 12px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div style={{ fontWeight: 700, fontSize: 13, color: form.format === fmt.id ? '#4F46E5' : '#0B1026', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span>{fmt.icon}</span>
                            <span>{fmt.title}</span>
                          </div>
                          <div style={{ fontSize: 11, color: '#64748B', marginTop: 2, lineHeight: 1.3 }}>
                            {fmt.desc}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Presets for current format */}
                  {!editingId && PRESETS_BY_FORMAT[form.format] && (
                    <div style={{ marginBottom: 18 }}>
                      <label className="org-label">Instant Presets for {form.format.replace('_', ' ')}</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {PRESETS_BY_FORMAT[form.format].map((p) => (
                          <button
                            key={p.name}
                            type="button"
                            onClick={() => applyPreset(p)}
                            style={{
                              padding: '5px 10px',
                              borderRadius: 6,
                              border: form.name === p.name ? '1px solid #4F46E5' : '1px solid #E2E8F0',
                              background: form.name === p.name ? '#EEF2FF' : '#FFFFFF',
                              color: form.name === p.name ? '#4F46E5' : '#475569',
                              fontSize: 12,
                              cursor: 'pointer',
                              fontWeight: 600,
                            }}
                          >
                            {p.name} (₦{p.price.toLocaleString()})
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* General Fields */}
                  <div className="org-form-group">
                    <label className="org-label">Ticket Name *</label>
                    <input
                      className="org-input"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Regular Male, VIP Lounge, Circle of 5, Platinum Table"
                      required
                    />
                  </div>

                  <div className="org-grid-2">
                    <div className="org-form-group">
                      <label className="org-label">Price (₦ NGN - 0 for Free) *</label>
                      <input
                        type="number"
                        min="0"
                        className="org-input"
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                        required
                      />
                    </div>

                    <div className="org-form-group">
                      <label className="org-label">
                        {form.format === 'RESERVED_TABLE'
                          ? 'Available Tables *'
                          : form.format === 'GROUP_BUNDLE'
                          ? 'Available Packages *'
                          : 'Total Quantity Available *'}
                      </label>
                      <input
                        type="number"
                        min="1"
                        className="org-input"
                        value={form.quantity}
                        onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Capacity & Seating (Dynamic per Format) */}
                  <div className="org-grid-2">
                    <div className="org-form-group">
                      <label className="org-label">
                        {form.format === 'RESERVED_TABLE'
                          ? 'Seats / Attendees Per Table *'
                          : form.format === 'GROUP_BUNDLE'
                          ? 'People Admitted Per Package *'
                          : 'People Admitted (Standard: 1) *'}
                      </label>
                      <input
                        type="number"
                        min="1"
                        className="org-input"
                        value={form.admittedPerTicket}
                        onChange={(e) => setForm({ ...form, admittedPerTicket: e.target.value })}
                        required
                      />
                      <span style={{ fontSize: 11, color: '#64748B', marginTop: 3, display: 'block' }}>
                        {form.format === 'RESERVED_TABLE'
                          ? 'Number of seats and QR passes provided with table'
                          : form.format === 'GROUP_BUNDLE'
                          ? 'Individual guest passes issued to this bundle'
                          : 'Standard admission for single attendee'}
                      </span>
                    </div>

                    <div className="org-form-group">
                      <label className="org-label">Seating Section / Area</label>
                      <input
                        className="org-input"
                        value={form.section}
                        onChange={(e) => setForm({ ...form, section: e.target.value })}
                        placeholder="General, VIP Deck, Stage Front, Balcony"
                      />
                    </div>
                  </div>

                  {/* Limits and Schedule */}
                  <div className="org-grid-2">
                    <div className="org-form-group">
                      <label className="org-label">Min Purchase Per Order</label>
                      <input
                        type="number"
                        min="1"
                        className="org-input"
                        value={form.minPerOrder}
                        onChange={(e) => setForm({ ...form, minPerOrder: e.target.value })}
                        placeholder="1"
                      />
                    </div>

                    <div className="org-form-group">
                      <label className="org-label">Max Limit Per Customer</label>
                      <input
                        type="number"
                        min="1"
                        className="org-input"
                        value={form.maxPerCustomer}
                        onChange={(e) => setForm({ ...form, maxPerCustomer: e.target.value })}
                        placeholder="Unlimited if empty"
                      />
                    </div>
                  </div>

                  {/* Sales Start and End Dates */}
                  <div className="org-grid-2">
                    <div className="org-form-group">
                      <label className="org-label">Sales Start Date & Time</label>
                      <input
                        type="date"
                        className="org-input"
                        value={form.saleStartDate}
                        onChange={(e) => setForm({ ...form, saleStartDate: e.target.value })}
                      />
                    </div>

                    <div className="org-form-group">
                      <label className="org-label">Sales End Date & Time</label>
                      <input
                        type="date"
                        className="org-input"
                        value={form.saleEndDate}
                        onChange={(e) => setForm({ ...form, saleEndDate: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="org-form-group">
                    <label className="org-label">Ticket Description</label>
                    <textarea
                      rows={2}
                      className="org-textarea"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Explain what this ticket includes, entry doors, or restrictions..."
                    />
                  </div>

                  {/* Inclusions & Benefits */}
                  <div className="org-form-group">
                    <label className="org-label">
                      Ticket Benefits & Hospitality Inclusions (One per line)
                    </label>
                    <textarea
                      rows={3}
                      className="org-textarea"
                      value={form.benefits}
                      onChange={(e) => setForm({ ...form, benefits: e.target.value })}
                      placeholder="e.g.&#10;Express VIP Turnstile Entry&#10;Complimentary Welcome Champagne&#10;Backstage Meet & Greet"
                    />
                  </div>

                  {/* Status & Visibility */}
                  <div style={{ display: 'flex', gap: 20, marginTop: 10, padding: '12px 14px', background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                      <input
                        type="checkbox"
                        checked={form.isActive}
                        onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                      />
                      <span>Active for Sale</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                      <input
                        type="checkbox"
                        checked={form.transferable}
                        onChange={(e) => setForm({ ...form, transferable: e.target.checked })}
                      />
                      <span>Allow Ticket Transfer</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                      <input
                        type="checkbox"
                        checked={form.resellable}
                        onChange={(e) => setForm({ ...form, resellable: e.target.checked })}
                      />
                      <span>Allow Resale Marketplace</span>
                    </label>
                  </div>
                </div>

                {/* Right Column: LIVE TICKET PREVIEW */}
                <div style={{ borderLeft: '1px solid #E2E8F0', paddingLeft: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#0B1026', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Eye size={15} color="#4F46E5" /> Live Customer Preview
                    </div>
                    <span style={{ fontSize: 11, background: '#ECFDF5', color: '#059669', padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>
                      Real-time Sync
                    </span>
                  </div>

                  {/* Public Event Page Preview Card */}
                  <div
                    style={{
                      border: '2px solid #026CDF',
                      borderRadius: 14,
                      background: '#FFFFFF',
                      padding: 18,
                      boxShadow: '0 4px 14px rgba(2, 108, 223, 0.08)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontWeight: 800, fontSize: 16, color: '#1F1F1F' }}>
                            {form.name || 'Untitled Ticket Tier'}
                          </span>
                          <CheckCircle2 size={16} color="#026CDF" />
                        </div>
                        <div style={{ fontSize: 12, color: '#6B6B6B', marginTop: 2 }}>
                          {form.format === 'RESERVED_TABLE'
                            ? `🍾 Reserved Table (${previewCapacity} Seats)`
                            : form.format === 'GROUP_BUNDLE'
                            ? `👥 Group Bundle (${previewCapacity} Persons)`
                            : '👤 Individual Admission'}
                          {' • '}Section {form.section || 'General'}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 20, fontWeight: 900, color: '#026CDF' }}>
                          {previewGrossPerUnit === 0 ? 'FREE' : `₦${previewGrossPerUnit.toLocaleString()}`}
                        </div>
                        {previewCapacity > 1 && previewGrossPerUnit > 0 && (
                          <div style={{ fontSize: 11, color: '#8C8C8C' }}>
                            ₦{Math.round(previewGrossPerUnit / previewCapacity).toLocaleString()}/guest
                          </div>
                        )}
                      </div>
                    </div>

                    {form.description && (
                      <p style={{ fontSize: 12.5, color: '#4B4B4B', margin: '8px 0 12px', lineHeight: 1.5, background: '#F8FAFC', padding: 10, borderRadius: 8 }}>
                        {form.description}
                      </p>
                    )}

                    {previewBenefitsList.length > 0 && (
                      <div style={{ margin: '12px 0', borderTop: '1px dashed #E5E5E5', paddingTop: 10 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                          <Sparkles size={12} /> Included Hospitality Benefits
                        </span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {previewBenefitsList.map((b, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#1F2937' }}>
                              <Check size={12} color="#10B981" />
                              <span>{b}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 10, borderTop: '1px solid #F0F0F0', fontSize: 12 }}>
                      <span style={{ color: form.quantity < 20 ? '#DC2626' : '#059669', fontWeight: 600 }}>
                        {form.quantity} available
                      </span>
                      <span style={{ color: '#64748B' }}>
                        {form.minPerOrder > 1 ? `Min: ${form.minPerOrder} • ` : ''}
                        {form.maxPerCustomer ? `Max: ${form.maxPerCustomer}` : 'No limit'}
                      </span>
                    </div>

                    <div style={{ marginTop: 12 }}>
                      <button
                        type="button"
                        style={{
                          width: '100%',
                          padding: '10px',
                          background: '#026CDF',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: 8,
                          fontWeight: 700,
                          fontSize: 13,
                          cursor: 'default',
                        }}
                      >
                        Select Tier — {previewGrossPerUnit === 0 ? 'Claim Free' : `₦${previewGrossPerUnit.toLocaleString()}`}
                      </button>
                    </div>
                  </div>

                  {/* Summary Metric Pill */}
                  <div style={{ marginTop: 20, padding: 14, background: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#0B1026', marginBottom: 6 }}>
                      Expected Gross Sales
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#10B981' }}>
                      ₦{((parseInt(form.quantity, 10) || 0) * (parseFloat(form.price) || 0)).toLocaleString()}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                      Capacity: {((parseInt(form.quantity, 10) || 0) * previewCapacity).toLocaleString()} total guest admissions
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="org-modal-footer">
                <button type="button" className="org-btn org-btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="org-btn org-btn-primary">
                  {submitting ? 'Saving…' : editingId ? 'Update Ticket Type' : 'Publish Ticket Type'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
