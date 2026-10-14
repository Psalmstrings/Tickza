// Centralized image URL resolver and fallback helper for Tickza
export const DEFAULT_EVENT_BANNER =
  'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1200&auto=format&fit=crop&q=80';

const BACKEND_BASE = (
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BACKEND_URL) ||
  'http://localhost:5090'
).replace(/\/api\/?$/, '');

/**
 * Resolves an event or asset image URL to a reliable absolute URL.
 * Supports Cloudinary URLs, absolute HTTP/HTTPS links, and server /uploads/ fallbacks.
 */
export function getEventImageUrl(imageInput) {
  if (!imageInput) return DEFAULT_EVENT_BANNER;

  let rawUrl = '';
  if (typeof imageInput === 'string') {
    rawUrl = imageInput.trim();
  } else if (typeof imageInput === 'object') {
    rawUrl = imageInput.url || imageInput.secure_url || imageInput.coverImageUrl || '';
  }

  if (!rawUrl) return DEFAULT_EVENT_BANNER;

  // Already an absolute HTTP/HTTPS URL
  if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
    return rawUrl;
  }

  // Server uploads relative path
  if (rawUrl.startsWith('/uploads/') || rawUrl.startsWith('uploads/')) {
    const cleanPath = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`;
    return `${BACKEND_BASE}${cleanPath}`;
  }

  // Other relative paths
  if (rawUrl.startsWith('/')) {
    return `${BACKEND_BASE}${rawUrl}`;
  }

  return rawUrl;
}

/**
 * Image onError handler to avoid broken images across cards and details pages.
 */
export function handleImageFallback(e, customFallback = DEFAULT_EVENT_BANNER) {
  if (e?.target && e.target.src !== customFallback) {
    e.target.onerror = null; // Prevent infinite loop if fallback fails
    e.target.src = customFallback;
  }
}
