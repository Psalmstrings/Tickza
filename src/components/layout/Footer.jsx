import React from 'react';
import { Link } from 'react-router-dom';
import TickzaLogo from '../ui/TickzaLogo.jsx';
import { ShieldCheck, HelpCircle, Ticket } from 'lucide-react';

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: 'var(--brand-primary, #0B1025)',
        color: '#FFFFFF',
        marginTop: 'auto',
        borderTop: '1px solid rgba(230, 245, 247, 0.1)',
        paddingTop: '48px',
        paddingBottom: '32px',
      }}
    >
      <div className="tm-container">
        {/* Top Feature Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '24px',
            paddingBottom: '36px',
            borderBottom: '1px solid rgba(230, 245, 247, 0.1)',
            marginBottom: '40px',
          }}
        >
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: 'rgba(57, 124, 128, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: '1px solid rgba(57, 124, 128, 0.3)',
              }}
            >
              <ShieldCheck size={22} color="var(--brand-accent, #397C80)" />
            </div>
            <div>
              <h4 style={{ color: 'var(--brand-pale-ice, #E6F5F7)', fontSize: '15px', fontWeight: 700, margin: '0 0 4px 0' }}>
                100% Buyer Guarantee
              </h4>
              <p style={{ color: '#9AA7B6', fontSize: '13px', margin: 0, lineHeight: 1.45 }}>
                Authentic tickets with secure transfer and verified Paystack transactions.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: 'rgba(214, 190, 146, 0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: '1px solid rgba(214, 190, 146, 0.3)',
              }}
            >
              <Ticket size={22} color="var(--brand-warm-accent, #D6BE92)" />
            </div>
            <div>
              <h4 style={{ color: 'var(--brand-pale-ice, #E6F5F7)', fontSize: '15px', fontWeight: 700, margin: '0 0 4px 0' }}>
                Official Ticketing
              </h4>
              <p style={{ color: '#9AA7B6', fontSize: '13px', margin: 0, lineHeight: 1.45 }}>
                Direct access to concert tours, festivals, sports matches, and theatrical shows.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: 'rgba(57, 124, 128, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: '1px solid rgba(57, 124, 128, 0.3)',
              }}
            >
              <HelpCircle size={22} color="var(--brand-accent, #397C80)" />
            </div>
            <div>
              <h4 style={{ color: 'var(--brand-pale-ice, #E6F5F7)', fontSize: '15px', fontWeight: 700, margin: '0 0 4px 0' }}>
                Help Center & Support
              </h4>
              <p style={{ color: '#9AA7B6', fontSize: '13px', margin: 0, lineHeight: 1.45 }}>
                Order assistance, event updates, and ticket wallet management.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Navigation Columns */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '32px',
            marginBottom: '40px',
          }}
        >
          <div>
            <h5
              style={{
                color: 'var(--brand-pale-ice, #E6F5F7)',
                fontSize: '13px',
                fontWeight: 800,
                marginBottom: '16px',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Explore Events
            </h5>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li><Link to="/explore?category=Concerts" style={{ color: '#9AA7B6', fontSize: '13px', textDecoration: 'none' }}>Concerts</Link></li>
              <li><Link to="/explore?category=Festivals" style={{ color: '#9AA7B6', fontSize: '13px', textDecoration: 'none' }}>Festivals</Link></li>
              <li><Link to="/explore?category=Sports" style={{ color: '#9AA7B6', fontSize: '13px', textDecoration: 'none' }}>Sports</Link></li>
              <li><Link to="/explore?category=Nightlife%20%26%20Parties" style={{ color: '#9AA7B6', fontSize: '13px', textDecoration: 'none' }}>Nightlife & Parties</Link></li>
              <li><Link to="/explore?category=Arts%20%26%20Theater" style={{ color: '#9AA7B6', fontSize: '13px', textDecoration: 'none' }}>Arts & Theater</Link></li>
              <li><Link to="/explore" style={{ color: '#9AA7B6', fontSize: '13px', textDecoration: 'none' }}>All Events</Link></li>
            </ul>
          </div>

          <div>
            <h5
              style={{
                color: 'var(--brand-pale-ice, #E6F5F7)',
                fontSize: '13px',
                fontWeight: 800,
                marginBottom: '16px',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Top Nigerian Hubs
            </h5>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li><Link to="/explore?city=Lagos" style={{ color: '#9AA7B6', fontSize: '13px', textDecoration: 'none' }}>Lagos Events</Link></li>
              <li><Link to="/explore?city=Abuja" style={{ color: '#9AA7B6', fontSize: '13px', textDecoration: 'none' }}>Abuja Events</Link></li>
              <li><Link to="/explore?city=Port%20Harcourt" style={{ color: '#9AA7B6', fontSize: '13px', textDecoration: 'none' }}>Port Harcourt</Link></li>
              <li><Link to="/explore?city=Ibadan" style={{ color: '#9AA7B6', fontSize: '13px', textDecoration: 'none' }}>Ibadan Events</Link></li>
            </ul>
          </div>

          <div>
            <h5
              style={{
                color: 'var(--brand-pale-ice, #E6F5F7)',
                fontSize: '13px',
                fontWeight: 800,
                marginBottom: '16px',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Tickets & Access
            </h5>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li><Link to="/tickets" style={{ color: '#9AA7B6', fontSize: '13px', textDecoration: 'none' }}>My Tickets</Link></li>
              <li><Link to="/transfers" style={{ color: '#9AA7B6', fontSize: '13px', textDecoration: 'none' }}>Ticket Transfer</Link></li>
              <li><Link to="/explore" style={{ color: '#9AA7B6', fontSize: '13px', textDecoration: 'none' }}>Find Events</Link></li>
            </ul>
          </div>

          <div>
            <h5
              style={{
                color: 'var(--brand-pale-ice, #E6F5F7)',
                fontSize: '13px',
                fontWeight: 800,
                marginBottom: '16px',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Account & Organizers
            </h5>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li><Link to="/profile" style={{ color: '#9AA7B6', fontSize: '13px', textDecoration: 'none' }}>My Profile</Link></li>
              <li><Link to="/login" style={{ color: '#9AA7B6', fontSize: '13px', textDecoration: 'none' }}>Sign In</Link></li>
              <li><Link to="/register" style={{ color: '#9AA7B6', fontSize: '13px', textDecoration: 'none' }}>Create Account</Link></li>
              <li><Link to="/organizer" style={{ color: '#9AA7B6', fontSize: '13px', textDecoration: 'none' }}>Organizer Dashboard</Link></li>
              <li><Link to="/scan" style={{ color: '#9AA7B6', fontSize: '13px', textDecoration: 'none' }}>QR Check-in Scanner</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & Disclaimer Row */}
        <div
          style={{
            paddingTop: '24px',
            borderTop: '1px solid rgba(230, 245, 247, 0.1)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            fontSize: '12px',
            color: '#7E8B9B',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <TickzaLogo color="var(--brand-pale-ice, #E6F5F7)" height={22} />
            <span>© 2026 Tickza. All rights reserved.</span>
          </div>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <span style={{ color: '#9AA7B6' }}>Privacy Policy</span>
            <span style={{ color: '#9AA7B6' }}>Terms of Use</span>
            <span style={{ color: '#9AA7B6' }}>Purchase Policy</span>
            <span style={{ color: '#9AA7B6' }}>Cookie Settings</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
