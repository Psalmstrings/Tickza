/**
 * Dynamic Open Graph & Twitter Cards Serverless Function for Vercel
 * Serves dynamic rich HTML preview metadata to social media crawlers
 * (WhatsApp, Twitter/X, Facebook, Telegram, LinkedIn, Discord, Applebot, etc.)
 */

export default async function handler(req, res) {
  const { id, type = 'event' } = req.query;

  if (!id) {
    return res.redirect(302, 'https://tickza.vercel.app/home');
  }

  const backendUrl = (
    process.env.VITE_API_URL ||
    process.env.BACKEND_URL ||
    'https://ticketapp-backend-9o6o.onrender.com/api'
  ).replace(/\/+$/, '');

  let event = null;
  let canonicalUrl = `https://tickza.vercel.app/events/${id}`;

  try {
    if (type === 'ticket') {
      canonicalUrl = `https://tickza.vercel.app/tickets/${id}`;
      // Fetch ticket to get associated event
      const tRes = await fetch(`${backendUrl}/tickets/${id}`, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(6000),
      });
      if (tRes.ok) {
        const tData = await tRes.json();
        const ticket = tData.data || tData;
        if (ticket.eventId && typeof ticket.eventId === 'object') {
          event = ticket.eventId;
        } else if (ticket.eventId) {
          const eRes = await fetch(`${backendUrl}/events/${ticket.eventId}`, {
            headers: { 'Accept': 'application/json' },
            signal: AbortSignal.timeout(5000),
          });
          if (eRes.ok) {
            const eData = await eRes.json();
            event = eData.event || eData.data || eData;
          }
        }
      }
    } else {
      // Fetch event directly
      const eRes = await fetch(`${backendUrl}/events/${id}`, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(6000),
      });
      if (eRes.ok) {
        const eData = await eRes.json();
        event = eData.event || eData.data || eData;
      }
    }
  } catch (fetchErr) {
    console.warn('[OG Handler Warning] Error fetching event data:', fetchErr.message);
  }

  // Fallbacks if data fetch fails or times out
  const title = event?.title
    ? `${event.title} | Tickza Tickets`
    : 'Discover Live Events & Tickets | Tickza';

  let dateStr = '';
  if (event?.startDate) {
    try {
      const d = new Date(event.startDate);
      dateStr = d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      if (event.startTime) dateStr += ` at ${event.startTime}`;
    } catch (e) {}
  }

  const venueStr = event?.venue || event?.address || '';
  const priceStr = event?.admissionType === 'FREE'
    ? 'FREE Admission'
    : event?.ticketTypes?.length
    ? `Tickets from ₦${Number(Math.min(...event.ticketTypes.map((t) => t.price || 0))).toLocaleString()}`
    : 'Official Tickets Available';

  // Construct structured social preview description
  let description = '';
  const parts = [];
  if (dateStr) parts.push(`📅 ${dateStr}`);
  if (venueStr) parts.push(`📍 ${venueStr}`);
  if (priceStr) parts.push(`🎟️ ${priceStr}`);
  if (parts.length > 0) {
    description = parts.join(' • ');
  }

  if (event?.description) {
    const rawDesc = event.description.replace(/<[^>]*>?/gm, '').trim();
    description += description ? ` — ${rawDesc.slice(0, 160)}` : rawDesc.slice(0, 200);
  }

  if (!description) {
    description = 'Get authentic live concert, festival, conference, and event tickets securely on Tickza.';
  }

  // Ensure image URL is absolute and publicly accessible
  let imageUrl = event?.coverImage?.url || event?.thumbnail?.url || '';
  if (!imageUrl || imageUrl.startsWith('/')) {
    if (imageUrl) {
      imageUrl = `https://tickza.vercel.app${imageUrl}`;
    } else {
      imageUrl = 'https://tickza.vercel.app/tickza-official-logo.jpg';
    }
  }

  // Helper to escape HTML characters safely
  const escapeHtml = (str) => {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const safeImage = escapeHtml(imageUrl);
  const safeUrl = escapeHtml(canonicalUrl);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${safeTitle}</title>
  <meta name="description" content="${safeDescription}">
  <link rel="canonical" href="${safeUrl}">

  <!-- Open Graph / Facebook / WhatsApp / LinkedIn / Telegram -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${safeUrl}">
  <meta property="og:site_name" content="Tickza">
  <meta property="og:title" content="${safeTitle}">
  <meta property="og:description" content="${safeDescription}">
  <meta property="og:image" content="${safeImage}">
  <meta property="og:image:secure_url" content="${safeImage}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${safeTitle}">

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@Tickza">
  <meta name="twitter:creator" content="@Tickza">
  <meta name="twitter:title" content="${safeTitle}">
  <meta name="twitter:description" content="${safeDescription}">
  <meta name="twitter:image" content="${safeImage}">
  <meta name="twitter:image:alt" content="${safeTitle}">

  <!-- Automatic redirect in case a real human browser opens this link directly -->
  <meta http-equiv="refresh" content="0;url=${safeUrl}">
  <script>window.location.replace(${JSON.stringify(canonicalUrl)});</script>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; text-align: center;">
  <h1>${safeTitle}</h1>
  <p>${safeDescription}</p>
  <img src="${safeImage}" alt="${safeTitle}" style="max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0;" />
  <p><a href="${safeUrl}" style="color: #2457FF; font-weight: 700;">Open on Tickza &rarr;</a></p>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=86400');
  return res.status(200).send(html);
}
