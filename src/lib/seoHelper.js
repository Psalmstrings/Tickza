/**
 * SEO & Dynamic Meta Tags Helper for Client-Side Navigation
 * Updates document title, Open Graph, and Twitter tags in the DOM.
 */

const DEFAULT_TITLE = 'Tickza | Live Events, Concerts & Digital Tickets';
const DEFAULT_DESCRIPTION = 'Discover, buy, transfer, and resell authentic tickets for concerts, sports, theater, and festivals on Tickza.';
const DEFAULT_IMAGE = 'https://tickza.vercel.app/tickza-official-logo.jpg';
const DEFAULT_URL = 'https://tickza.vercel.app';

function setMetaTag(selectorType, keyName, value) {
  if (!value) return;
  let element = document.querySelector(`meta[${selectorType}="${keyName}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(selectorType, keyName);
    document.head.appendChild(element);
  }
  element.setAttribute('content', value);
}

/**
 * Updates head metadata for an event.
 */
export function updateEventMeta(event) {
  if (!event) return;

  const title = event.title
    ? `${event.title} | Tickza Tickets`
    : DEFAULT_TITLE;

  // Format date and venue summary
  let dateStr = '';
  if (event.startDate) {
    try {
      const d = new Date(event.startDate);
      dateStr = d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
      if (event.startTime) dateStr += ` at ${event.startTime}`;
    } catch (e) {}
  }

  const venueStr = event.venue || event.address || '';
  const priceStr = event.admissionType === 'FREE'
    ? 'FREE Admission'
    : event.ticketTypes?.length
    ? `From ₦${Number(Math.min(...event.ticketTypes.map((t) => t.price || 0))).toLocaleString()}`
    : '';

  const summaryParts = [];
  if (dateStr) summaryParts.push(`📅 ${dateStr}`);
  if (venueStr) summaryParts.push(`📍 ${venueStr}`);
  if (priceStr) summaryParts.push(`🎟️ ${priceStr}`);

  let description = summaryParts.join(' • ');
  if (event.description) {
    const raw = event.description.replace(/<[^>]*>?/gm, '').trim();
    description += description ? ` — ${raw.slice(0, 160)}` : raw.slice(0, 180);
  }
  if (!description) description = DEFAULT_DESCRIPTION;

  let imageUrl = event.coverImage?.url || event.thumbnail?.url || DEFAULT_IMAGE;
  if (imageUrl.startsWith('/')) {
    imageUrl = `${window.location.origin}${imageUrl}`;
  }

  const pageUrl = window.location.href;

  // Set Document Title
  document.title = title;

  // Standard Meta
  setMetaTag('name', 'description', description);

  // Open Graph / Facebook / WhatsApp
  setMetaTag('property', 'og:type', 'website');
  setMetaTag('property', 'og:site_name', 'Tickza');
  setMetaTag('property', 'og:title', title);
  setMetaTag('property', 'og:description', description);
  setMetaTag('property', 'og:image', imageUrl);
  setMetaTag('property', 'og:image:secure_url', imageUrl);
  setMetaTag('property', 'og:url', pageUrl);

  // Twitter Cards
  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:site', '@Tickza');
  setMetaTag('name', 'twitter:title', title);
  setMetaTag('name', 'twitter:description', description);
  setMetaTag('name', 'twitter:image', imageUrl);
}

/**
 * Reset meta tags to site defaults upon page unmount
 */
export function resetMeta() {
  document.title = DEFAULT_TITLE;
  setMetaTag('name', 'description', DEFAULT_DESCRIPTION);
  setMetaTag('property', 'og:title', DEFAULT_TITLE);
  setMetaTag('property', 'og:description', DEFAULT_DESCRIPTION);
  setMetaTag('property', 'og:image', DEFAULT_IMAGE);
  setMetaTag('property', 'og:url', DEFAULT_URL);
  setMetaTag('name', 'twitter:title', DEFAULT_TITLE);
  setMetaTag('name', 'twitter:description', DEFAULT_DESCRIPTION);
  setMetaTag('name', 'twitter:image', DEFAULT_IMAGE);
}
