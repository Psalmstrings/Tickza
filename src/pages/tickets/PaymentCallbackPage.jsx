import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import AppLayout from '../../components/layout/AppLayout.jsx';
import TickzaSpinner from '../../components/ui/TickzaSpinner.jsx';
import api from '../../lib/axios.js';
import {
  CheckCircle2,
  XCircle,
  Ticket,
  Calendar,
  MapPin,
  ArrowRight,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

export default function PaymentCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Paystack returns 'reference' or 'trxref'
  const reference = searchParams.get('reference') || searchParams.get('trxref') || '';

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [orderData, setOrderData] = useState(null);
  const [tickets, setTickets] = useState([]);

  const verifyPaymentReference = async (ref) => {
    if (!ref) {
      setErrorMsg('No payment transaction reference detected in URL.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const { data } = await api.post('/payments/verify', { reference: ref });
      if (data.success) {
        setSuccess(true);
        setOrderData(data.data?.order);
        setTickets(data.data?.tickets || []);

        try {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 },
          });
        } catch (e) {}
      } else {
        setSuccess(false);
        setErrorMsg(data.message || 'Payment verification could not be confirmed.');
      }
    } catch (err) {
      console.error('[Payment Verification Failure]', err);
      setSuccess(false);
      setErrorMsg(
        err.response?.data?.message ||
          'Payment verification failed. If your account was debited, your tickets will update shortly via Paystack webhook confirmation.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (reference) {
      verifyPaymentReference(reference);
    } else {
      setErrorMsg('No reference provided for payment verification.');
      setLoading(false);
    }
  }, [reference]);

  return (
    <AppLayout>
      <div style={{ maxWidth: '640px', margin: '40px auto', padding: '0 16px' }}>
        {loading ? (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              padding: '60px 24px',
              textAlign: 'center',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              border: '1px solid #E5E5E5',
            }}
          >
            <TickzaSpinner size="lg" message="Verifying payment with Paystack..." />
            <p style={{ fontSize: '13px', color: '#6B6B6B', marginTop: '16px' }}>
              Reference: <strong style={{ fontFamily: 'monospace' }}>{reference}</strong>
            </p>
          </div>
        ) : success ? (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              padding: '36px 24px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              border: '1px solid #E5E5E5',
              textAlign: 'center',
            }}
          >
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
              <CheckCircle2 size={36} />
            </div>

            <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#1F1F1F', margin: '0 0 6px 0' }}>
              Payment Confirmed! 🎉
            </h1>
            <p style={{ fontSize: '14px', color: '#6B6B6B', margin: '0 0 24px 0' }}>
              Your order <strong style={{ color: '#026CDF' }}>#{orderData?.orderNumber || reference}</strong> has been verified and your admission tickets have been issued.
            </p>

            {/* Order Highlight Card */}
            <div
              style={{
                backgroundColor: '#F8F9FA',
                borderRadius: '14px',
                padding: '18px',
                textAlign: 'left',
                marginBottom: '24px',
                border: '1px solid #E5E5E5',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: '13px', color: '#6B6B6B' }}>Amount Paid</span>
                <strong style={{ fontSize: '16px', color: '#059669' }}>
                  ₦{(orderData?.totalAmount || 0).toLocaleString()}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: '13px', color: '#6B6B6B' }}>Tickets Issued</span>
                <strong style={{ fontSize: '14px', color: '#1F1F1F' }}>
                  {tickets.length || orderData?.items?.length || 1} Ticket(s)
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E5E5E5', paddingTop: 10 }}>
                <span style={{ fontSize: '13px', color: '#6B6B6B' }}>Paystack Reference</span>
                <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#4B4B4B' }}>
                  {reference}
                </span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                className="btn-primary"
                style={{ width: '100%', padding: '14px', borderRadius: '10px', fontSize: '15px' }}
                onClick={() => navigate('/tickets')}
              >
                View Tickets in My Wallet <ArrowRight size={16} />
              </button>
              <Link
                to="/explore"
                className="btn-secondary"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  textAlign: 'center',
                  textDecoration: 'none',
                  display: 'block',
                }}
              >
                Explore More Events
              </Link>
            </div>
          </div>
        ) : (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              padding: '36px 24px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              border: '1px solid #E5E5E5',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#FEF2F2',
                color: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <XCircle size={36} />
            </div>

            <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#1F1F1F', margin: '0 0 8px 0' }}>
              Verification Incomplete
            </h1>
            <p style={{ fontSize: '14px', color: '#6B6B6B', margin: '0 0 24px 0', lineHeight: 1.5 }}>
              {errorMsg}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                className="btn-primary"
                style={{ width: '100%', padding: '12px', borderRadius: '10px' }}
                onClick={() => verifyPaymentReference(reference)}
              >
                <RefreshCw size={15} style={{ marginRight: 6 }} /> Re-verify Transaction
              </button>
              <button
                className="btn-secondary"
                style={{ width: '100%', padding: '12px', borderRadius: '10px' }}
                onClick={() => navigate('/tickets')}
              >
                Go to My Tickets
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
