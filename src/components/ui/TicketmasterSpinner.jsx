import React from 'react';
import TickzaSpinner from './TickzaSpinner.jsx';

/**
 * Re-export TickzaSpinner under TicketmasterSpinner for seamless backwards compatibility.
 */
export default function TicketmasterSpinner(props) {
  return <TickzaSpinner {...props} />;
}
