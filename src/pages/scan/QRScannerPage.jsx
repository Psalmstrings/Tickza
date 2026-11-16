import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, QrCode, Check, X, AlertCircle, RotateCcw, ShieldCheck } from 'lucide-react';
import api from '../../lib/axios.js';
import AppLayout from '../../components/layout/AppLayout.jsx';
import CameraQRScanner from '../../components/scan/CameraQRScanner.jsx';

export default function QRScannerPage() {
  const navigate = useNavigate();
  const [qrInput, setQrInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { status: 'VALID'|'INVALID'|'USED', ticket, event, message }

  const executeValidation = async (token) => {
    if (!token || !token.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const { data } = await api.post('/tickets/checkin/scan', { qrToken: token.trim() });
      setResult({
        status: 'VALID',
        ticket: data.data?.ticket,
        event: data.data?.event,
        message: data.message || 'Ticket checked in successfully!',
        admittedCapacity: data.data?.ticket?.admittedCapacity || 1,
        attendeesCheckedIn: data.data?.ticket?.attendeesCheckedIn || 1,
      });
      setQrInput('');
    } catch (err) {
      const code = err.response?.data?.code;
      const msg = err.response?.data?.message || 'Ticket validation failed';
      setResult({
        status: code === 'ALREADY_CHECKED_IN' ? 'USED' : 'INVALID',
        ticket: err.response?.data?.data?.ticket,
        event: err.response?.data?.data?.event,
        message: msg,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCameraScan = (decodedText) => {
    if (!loading && decodedText) {
      setQrInput(decodedText);
      executeValidation(decodedText);
    }
  };

  const handleManualScan = (e) => {
    e.preventDefault();
    if (qrInput.trim()) {
      executeValidation(qrInput.trim());
    }
  };

  const reset = () => {
    setResult(null);
    setQrInput('');
  };

  return (
    <AppLayout>
      <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', paddingBottom: '80px' }}>
        {/* Header bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', borderBottom: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
          <button
            onClick={() => navigate(-1)}
            style={{ border: 'none', background: '#F1F5F9', borderRadius: '8px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#0F172A' }}
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 style={{ color: '#0F172A', fontSize: '18px', fontWeight: 800, margin: 0 }}>Gate Ticket Scanner</h1>
            <p style={{ color: '#64748B', fontSize: '12px', margin: 0 }}>Verifiable attendance & gate check-in</p>
          </div>
        </div>

        <div style={{ padding: '20px 16px', maxWidth: '480px', margin: '0 auto' }}>
          {/* Camera Scanner Card */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '24px 20px', textAlign: 'center', marginBottom: '16px', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.05)' }}>
            <CameraQRScanner onScan={handleCameraScan} />
          </div>

          {/* Validation Result Box */}
          {result && (
            <div
              style={{
                borderRadius: '16px',
                padding: '24px 20px',
                textAlign: 'center',
                marginBottom: '16px',
                border: '2px solid',
                borderColor: result.status === 'VALID' ? '#10B981' : result.status === 'USED' ? '#F59E0B' : '#EF4444',
                background: result.status === 'VALID' ? '#ECFDF5' : result.status === 'USED' ? '#FFFBEB' : '#FEF2F2',
                boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
              }}
            >
              {/* Icon badge */}
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                  background: result.status === 'VALID' ? '#10B981' : result.status === 'USED' ? '#F59E0B' : '#EF4444',
                  color: '#FFFFFF',
                }}
              >
                {result.status === 'VALID' ? <Check size={32} /> : result.status === 'USED' ? <AlertCircle size={32} /> : <X size={32} />}
              </div>

              {/* Status title */}
              <h2
                style={{
                  fontSize: '20px',
                  fontWeight: 900,
                  margin: '0 0 6px',
                  letterSpacing: '-0.4px',
                  color: result.status === 'VALID' ? '#047857' : result.status === 'USED' ? '#B45309' : '#B91C1C',
                }}
              >
                {result.status === 'VALID' ? 'VALID TICKET ✓' : result.status === 'USED' ? 'ALREADY CHECKED IN' : 'INVALID TICKET'}
              </h2>

              <p style={{ fontSize: '14px', margin: '0 0 16px', color: '#334155', fontWeight: 500 }}>
                {result.message}
              </p>

              {/* Ticket Details summary */}
              {result.ticket && (
                <div style={{ background: '#FFFFFF', borderRadius: '10px', padding: '14px', textAlign: 'left', border: '1px solid #E2E8F0', marginBottom: '16px', fontSize: '13px' }}>
                  {result.ticket.owner && (
                    <div style={{ marginBottom: '6px' }}>
                      <strong style={{ color: '#0F172A' }}>Guest:</strong> {result.ticket.owner.firstName} {result.ticket.owner.lastName} ({result.ticket.owner.email})
                    </div>
                  )}
                  {result.event && (
                    <div style={{ marginBottom: '6px' }}>
                      <strong style={{ color: '#0F172A' }}>Event:</strong> {result.event.title}
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span><strong style={{ color: '#0F172A' }}>Tier:</strong> {result.ticket.ticketType || 'Standard'}</span>
                    {result.ticket.format && result.ticket.format !== 'INDIVIDUAL' && (
                      <span style={{ fontSize: '11px', background: '#EEF2FF', color: '#4F46E5', padding: '1px 8px', borderRadius: '4px', fontWeight: 700 }}>
                        {result.ticket.format}
                      </span>
                    )}
                  </div>
                  {result.ticket.admittedCapacity > 1 && (
                    <div style={{ color: '#059669', fontWeight: 600, marginBottom: '6px' }}>
                      👥 Group Admission: {result.ticket.attendeesCheckedIn || result.ticket.admittedCapacity} of {result.ticket.admittedCapacity} Admitted
                    </div>
                  )}
                  {result.ticket.tableNumber && (
                    <div style={{ color: '#D97706', fontWeight: 600, marginBottom: '6px' }}>
                      🍾 Reserved Table: {result.ticket.tableNumber}
                    </div>
                  )}
                  <div style={{ fontFamily: 'monospace', color: '#64748B', fontSize: '12px' }}>
                    #{result.ticket.ticketNumber || result.ticket.id}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={reset}
                style={{
                  background: 'none',
                  border: '1.5px solid #CBD5E1',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#475569',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <RotateCcw size={14} /> Scan Next Ticket
              </button>
            </div>
          )}

          {/* Manual Entry Form */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', margin: '0 0 4px' }}>Manual Token Input / Laser Gun</h3>
            <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 12px' }}>Type or paste a ticket token, or connect an external barcode scanner.</p>
            <form onSubmit={handleManualScan}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Paste QR token / Ticket ID..."
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    fontFamily: 'monospace',
                    outline: 'none',
                  }}
                />
                <button
                  type="submit"
                  disabled={loading || !qrInput.trim()}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--brand-primary, #2457FF)',
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: loading || !qrInput.trim() ? 'not-allowed' : 'pointer',
                    whiteSpace: 'nowrap',
                    opacity: loading || !qrInput.trim() ? 0.6 : 1,
                  }}
                >
                  {loading ? 'Checking…' : 'Check In'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
