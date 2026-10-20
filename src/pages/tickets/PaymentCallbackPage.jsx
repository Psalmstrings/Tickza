import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import AppLayout from '../../components/layout/AppLayout.jsx';
import TickzaSpinner from '../../components/ui/TickzaSpinner.jsx';
import api from '../../lib/axios.js';
import { formatNaira } from '../../lib/currency.js';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Ticket,
  Calendar,
  MapPin,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

// Explicit Payment Confirmation State Machine
const PAYMENT_STATUS = {
  VERIFYING: 'VERIFYING',
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
};

export default function PaymentCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Paystack returns 'reference' or 'trxref'
  const reference = (searchParams.get('reference') || searchParams.get('trxref') || '').trim();

  // State Machine
  const [status, setStatus] = useState(PAYMENT_STATUS.VERIFYING);
  const [statusMessage, setStatusMessage] = useState('Confirming your payment with Paystack…');
  const [orderData, setOrderData] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [errorDetails, setErrorDetails] = useState('');
  const [retryAttempt, setRetryAttempt] = useState(0);

  // Guards against concurrent duplicate requests on mount / re-renders
  const inFlightRef = useRef(false);
  const completedRef = useRef(false);
  const retryTimerRef = useRef(null);

  const verifyTransaction = async (ref, attempt = 1) => {
    if (!ref) {
      setStatus(PAYMENT_STATUS.FAILED);
      setErrorDetails('No payment transaction reference detected in the return URL.');
      return;
    }

    if (completedRef.current) return;
    if (inFlightRef.current) return;

    inFlightRef.current = true;

    try {
      const { data } = await api.post('/payments/verify', { reference: ref });

      if (data.success) {
        if (data.pending) {
          // Transaction is still processing at Paystack / bank
          inFlightRef.current = false;
          setStatus(PAYMENT_STATUS.PENDING);
          setStatusMessage(
            data.message || 'Payment is processing. Awaiting final settlement confirmation from your bank…'
          );

          // Auto-poll up to 5 times spaced by 2.5 seconds
          if (attempt < 5) {
            setRetryAttempt(attempt);
            retryTimerRef.current = setTimeout(() => {
              verifyTransaction(ref, attempt + 1);
            }, 2500);
          } else {
            // Reached polling limit; instruct user safely without reporting failure
            setStatus(PAYMENT_STATUS.PENDING);
            setStatusMessage(
              'Your payment was initiated and is awaiting bank settlement. Your tickets will be added to your account as soon as Paystack confirms the charge.'
            );
          }
          return;
        }

        // Definitive SUCCESS!
        completedRef.current = true;
        inFlightRef.current = false;
        setStatus(PAYMENT_STATUS.SUCCESS);
        setOrderData(data.data?.order);
        setTickets(data.data?.tickets || []);

        try {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 },
          });
        } catch (e) {
          // ignore confetti error
        }
      } else {
        // Explicit non-success response from verification
        inFlightRef.current = false;
        setStatus(PAYMENT_STATUS.FAILED);
        setErrorDetails(data.message || 'Payment verification could not be confirmed.');
      }
    } catch (err) {
      inFlightRef.current = false;

      // Check if transient network or 500 error that can be retried silently
      const statusHttp = err.response?.status;
      const isTransient = !statusHttp || statusHttp >= 500;

      if (isTransient && attempt < 3) {
        setRetryAttempt(attempt);
        setStatus(PAYMENT_STATUS.VERIFYING);
        setStatusMessage('Connecting with payment gateway, please hold on…');
        retryTimerRef.current = setTimeout(() => {
          verifyTransaction(ref, attempt + 1);
        }, 2000);
        return;
      }

      // Check if order was already marked paid despite the error
      if (err.response?.data?.alreadyProcessed && err.response?.data?.data?.order) {
        completedRef.current = true;
        setStatus(PAYMENT_STATUS.SUCCESS);
        setOrderData(err.response.data.data.order);
        setTickets(err.response.data.data.tickets || []);
        return;
      }

      // Definitive failure after retries
      setStatus(PAYMENT_STATUS.FAILED);
      setErrorDetails(
        err.response?.data?.message ||
          'Payment verification could not be completed. If your account was debited, your tickets will update shortly via Paystack webhook.'
      );
    }
  };

  useEffect(() => {
    if (reference) {
      verifyTransaction(reference, 1);
    } else {
      setStatus(PAYMENT_STATUS.FAILED);
      setErrorDetails('No payment reference provided in the callback URL.');
    }

    return () => {
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
      }
    };
  }, [reference]);

  return (
    <AppLayout>
      <div style={{ maxWidth: '640px', margin: '40px auto', padding: '0 16px' }}>
        
        {/* ========================================================
            STATE 1: VERIFYING (Loading state without premature errors)
            ======================================================== */}
        {status === PAYMENT_STATUS.VERIFYING && (
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
            <TickzaSpinner size="lg" message="Confirming your payment with Paystack…" />
            <p style={{ fontSize: '13px', color: '#4B5563', marginTop: '16px' }}>
              Reference: <strong style={{ fontFamily: 'monospace', color: '#1F2937' }}>{reference}</strong>
            </p>
            <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '8px 0 0' }}>
              Please do not refresh or close this window while we verify your transaction.
            </p>
          </div>
        )}

        {/* ========================================================
            STATE 2: PENDING (Bank processing / ongoing settlement)
            ======================================================== */}
        {status === PAYMENT_STATUS.PENDING && (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              padding: '48px 24px',
              textAlign: 'center',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              border: '1px solid #FEF3C7',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#FEF3C7',
                color: '#D97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <Clock size={36} />
            </div>

            <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#92400E', margin: '0 0 8px 0' }}>
              Payment Processing…
            </h1>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 20px 0', lineHeight: 1.5 }}>
              {statusMessage}
            </p>

            <div
              style={{
                backgroundColor: '#FFFBEB',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'left',
                marginBottom: '24px',
                border: '1px solid #FDE68A',
                fontSize: '13px',
                color: '#92400E',
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start',
              }}
            >
              <ShieldCheck size={20} color="#D97706" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong>Reference: {reference}</strong>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#B45309' }}>
                  Your bank is finalizing the transfer. You will receive an instant confirmation email and tickets once confirmed.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                className="btn-primary"
                style={{ width: '100%', padding: '13px', borderRadius: '10px', backgroundColor: '#D97706', borderColor: '#D97706' }}
                onClick={() => {
                  completedRef.current = false;
                  inFlightRef.current = false;
                  setStatus(PAYMENT_STATUS.VERIFYING);
                  verifyTransaction(reference, 1);
                }}
              >
                <RefreshCw size={15} style={{ marginRight: 6 }} /> Check Confirmation Status
              </button>
              <button
                className="btn-secondary"
                style={{ width: '100%', padding: '12px', borderRadius: '10px' }}
                onClick={() => navigate('/tickets')}
              >
                View My Tickets
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            STATE 3: SUCCESS (Verified, tickets issued, clear celebration)
            ======================================================== */}
        {status === PAYMENT_STATUS.SUCCESS && (
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
              Your order <strong style={{ color: 'var(--brand-accent, #397C80)' }}>#{orderData?.orderNumber || reference}</strong> has been verified and your admission tickets have been issued.
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
                  {formatNaira(orderData?.totalAmount || 0)}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: '13px', color: '#6B6B6B' }}>Tickets Issued</span>
                <strong style={{ fontSize: '14px', color: '#1F1F1F' }}>
                  {tickets.length || orderData?.items?.length || 1} Ticket(s)
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E5E5E5', paddingTop: 10 }}>
                <span style={{ fontSize: '13px', color: '#6B6B6B' }}>Payment Gateway</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#059669' }}>
                  Paystack (NGN)
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 6 }}>
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
        )}

        {/* ========================================================
            STATE 4: FAILED (Definitive failure after retries exhausted)
            ======================================================== */}
        {status === PAYMENT_STATUS.FAILED && (
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
              Payment Verification Unsuccessful
            </h1>
            <p style={{ fontSize: '14px', color: '#6B6B6B', margin: '0 0 24px 0', lineHeight: 1.5 }}>
              {errorDetails}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                className="btn-primary"
                style={{ width: '100%', padding: '12px', borderRadius: '10px' }}
                onClick={() => {
                  completedRef.current = false;
                  inFlightRef.current = false;
                  setStatus(PAYMENT_STATUS.VERIFYING);
                  verifyTransaction(reference, 1);
                }}
              >
                <RefreshCw size={15} style={{ marginRight: 6 }} /> Retry Verification
              </button>
              <button
                className="btn-secondary"
                style={{ width: '100%', padding: '12px', borderRadius: '10px' }}
                onClick={() => navigate('/explore')}
              >
                Browse Events
              </button>
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
}
