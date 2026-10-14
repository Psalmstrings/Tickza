import React from 'react';
import TickzaLogo from './TickzaLogo.jsx';

/**
 * Re-export TickzaLogo under TicketmasterLogo for seamless backwards compatibility.
 */
export default function TicketmasterLogo(props) {
  return <TickzaLogo {...props} />;
}