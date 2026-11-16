import React, { useState } from 'react';
import { X, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

export default function TermsModal({ isOpen, onClose, onAccept }) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  if (!isOpen) return null;

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollTop + clientHeight >= scrollHeight - 30) {
      setHasScrolledToBottom(true);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(11, 16, 37, 0.82)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 3000,
        padding: '16px',
        boxSizing: 'border-box',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '18px',
          width: '100%',
          maxWidth: '640px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.45)',
          border: '1px solid var(--border-subtle, #E5E7EB)',
          overflow: 'hidden',
          animation: 'fadeInScale 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-subtle, #E5E7EB)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#FAFAFC',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'rgba(36, 87, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--brand-primary, #2457FF)',
              }}
            >
              <FileText size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#111827', margin: 0 }}>
                Terms & Conditions of Service
              </h2>
              <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0' }}>
                Tickza Digital Ticketing & Event Marketplace
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Terms"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              color: '#64748B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div
          onScroll={handleScroll}
          style={{
            padding: '24px',
            overflowY: 'auto',
            fontSize: '13.5px',
            lineHeight: '1.65',
            color: '#374151',
            flex: 1,
          }}
        >
          <div
            style={{
              backgroundColor: '#EFF6FF',
              border: '1px solid #BFDBFE',
              borderRadius: '10px',
              padding: '12px 16px',
              marginBottom: '20px',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
            }}
          >
            <ShieldCheck size={20} color="#2563EB" style={{ flexShrink: 0, marginTop: '2px' }} />
            <p style={{ margin: 0, fontSize: '12.5px', color: '#1E40AF', fontWeight: 500 }}>
              Please review these terms carefully before registering. By checking the agreement box and creating an account, you legally bind yourself to these platform policies.
            </p>
          </div>

          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: '16px 0 6px' }}>
            1. Acceptance of Terms & Eligibility
          </h3>
          <p style={{ margin: '0 0 14px' }}>
            By creating an account on Tickza, you confirm that you are at least 18 years of age (or have reached the age of majority in your jurisdiction) and that all information submitted during registration is accurate, current, and complete. You are responsible for safeguarding your login credentials.
          </p>

          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: '16px 0 6px' }}>
            2. Email Verification & Security
          </h3>
          <p style={{ margin: '0 0 14px' }}>
            Tickza requires two-factor email verification for all newly registered accounts to safeguard our ticketing marketplace against bots and unauthorized access. You agree to verify your registered Gmail/email address before buying, transferring, or selling event tickets.
          </p>

          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: '16px 0 6px' }}>
            3. Ticket Purchases & Paystack Payments
          </h3>
          <p style={{ margin: '0 0 14px' }}>
            All paid ticket purchases are processed via our secure PCI-DSS certified payment provider (Paystack) in Nigerian Naira (NGN). Orders are finalized only after real-time payment settlement confirmation. Digital tickets include dynamic cryptographic QR codes for on-site scanning.
          </p>

          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: '16px 0 6px' }}>
            4. Safe Ticket Transfers & Secondary Resale Rules
          </h3>
          <p style={{ margin: '0 0 14px' }}>
            Tickza supports official ticket transfers and verified peer-to-peer resale. To prevent scalping and fraud:
          </p>
          <ul style={{ paddingLeft: '20px', margin: '0 0 14px' }}>
            <li>When a ticket is transferred or resold, its original QR code is permanently revoked and regenerated for the new buyer.</li>
            <li>Resale pricing is strictly capped at maximum 110% of the original face value.</li>
            <li>Tickets may only be transferred once verified by Tickza platform rules.</li>
          </ul>

          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: '16px 0 6px' }}>
            5. Refunds & Event Cancellations
          </h3>
          <p style={{ margin: '0 0 14px' }}>
            Ticket refund requests are subject to the individual event organizer's published cancellation policy. In the event of a verified event cancellation, funds are processed back to the original funding account or credited to your Tickza digital wallet.
          </p>

          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: '16px 0 6px' }}>
            6. Prohibited Activities
          </h3>
          <p style={{ margin: '0 0 14px' }}>
            Users are strictly forbidden from fabricating tickets, attempting to duplicate QR codes, conducting unauthorized chargebacks, or utilizing automated scripts to scrape inventory. Violations will result in immediate account suspension and referral to authorities.
          </p>

          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: '16px 0 6px' }}>
            7. Privacy & Data Handling
          </h3>
          <p style={{ margin: '0 0 14px' }}>
            We respect your privacy. Personal data including your name, email, phone number, and event history is handled strictly according to the Nigerian Data Protection Act (NDPA) and global privacy benchmarks. We never sell your personal data to external advertisers.
          </p>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border-subtle, #E5E7EB)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#FAFAFC',
          }}
        >
          <span style={{ fontSize: '12px', color: '#64748B' }}>
            {hasScrolledToBottom ? '✓ Full terms reviewed' : 'Scroll down to read all terms'}
          </span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={onClose}
              style={{
                padding: '9px 18px',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle, #E5E7EB)',
                backgroundColor: '#FFFFFF',
                color: '#374151',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Close
            </button>
            <button
              onClick={() => {
                if (onAccept) onAccept();
                onClose();
              }}
              style={{
                padding: '9px 20px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: 'var(--brand-primary, #2457FF)',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(36, 87, 255, 0.25)',
              }}
            >
              <CheckCircle2 size={16} /> I Accept the Terms
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
