/**
 * Cloudflare Pages Middleware
 * Runs before each request to handle custom logic
 *
 * Features:
 * - A/B testing headers
 * - Geographic content targeting
 * - Bot detection and handling
 * - Custom rate limiting
 */

export interface Env {
  // Add your environment variables here
  ENVIRONMENT?: 'production' | 'preview';
  ENABLE_ANALYTICS?: string;
  ANALYTICS_ENDPOINT?: string;
  ENABLE_DEBUG_HEADERS?: string;
}

export interface RequestContext {
  request: Request;
  waitUntil: (promise: Promise<unknown>) => void;
  env: Env;
  cf: RequestCf;
  next: () => Promise<Response>;
}

interface RequestCf {
  country?: string;
  city?: string;
  colo?: string;
  bot?: {
    score: number;
    verified: boolean;
  };
}

export async function onRequest(
  context: RequestContext
): Promise<Response> {
  const { request, env, cf } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Get the original response from the Pages pipeline (static asset or Function)
  const response = await context.next();

  // Fast-path: avoid extra work for non-HTML assets (keeps edge overhead low)
  // Security headers like XFO/nosniff are already handled via `_headers`.
  const contentType = response.headers.get('Content-Type') ?? '';
  const isHtmlResponse = contentType.includes('text/html') || pathname === '/' || pathname === '/index.html';
  if (!isHtmlResponse) return response;

  // Clone the response to modify headers
  const newResponse = new Response(response.body, response);

  // ============================================
  // Security Headers
  // ============================================

  // Strict-Transport-Security (only on HTTPS)
  if (request.url.startsWith('https://')) {
    const maxAge = env.ENVIRONMENT === 'production' ? 31536000 : 86400;
    if (!newResponse.headers.has('Strict-Transport-Security')) {
      newResponse.headers.set(
        'Strict-Transport-Security',
        `max-age=${maxAge}; includeSubDomains; preload`
      );
    }
  }

  // Content-Security-Policy
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com",
    "script-src-attr 'none'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https:",
    "media-src 'self' blob:",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "frame-src 'none'",
    "form-action 'self'",
    "base-uri 'self'",
    "upgrade-insecure-requests"
  ].join('; ');

  if (!newResponse.headers.has('Content-Security-Policy')) {
    newResponse.headers.set('Content-Security-Policy', cspDirectives);
  }

  // Make sure we always emit a safe Referrer-Policy even if _headers is skipped
  if (!newResponse.headers.has('Referrer-Policy')) {
    newResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  }

  // Cross-origin isolation hardening (safe default for a standalone game)
  if (!newResponse.headers.has('Cross-Origin-Opener-Policy')) {
    newResponse.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  }

  if (!newResponse.headers.has('X-Permitted-Cross-Domain-Policies')) {
    newResponse.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  }

  // ============================================
  // Performance Headers
  // ============================================

  // Add preload hints on HTML responses only (keeps headers small for assets)
  const isLikelyHtml =
    pathname === '/' ||
    pathname === '/index.html' ||
    (newResponse.headers.get('Content-Type')?.includes('text/html') ?? false);

  if (isLikelyHtml) {
    const preloadLinks = [
      '<https://cdnjs.cloudflare.com/ajax/libs/phaser/3.90.0/phaser.min.js>; rel=preload; as=script; crossorigin=anonymous',
      '<https://fonts.googleapis.com/css2?family=Oxanium:wght@300;500;700&display=swap>; rel=preload; as=style',
      '</assets/player.png>; rel=preload; as=image',
      '</assets/enemy.png>; rel=preload; as=image',
      '</assets/bullet.png>; rel=preload; as=image'
    ];

    // Merge with any existing Link header from upstream.
    const existingLink = newResponse.headers.get('Link');
    const combined = existingLink
      ? `${existingLink}, ${preloadLinks.join(', ')}`
      : preloadLinks.join(', ');
    newResponse.headers.set('Link', combined);
  }

  // ============================================
  // Analytics & Monitoring (optional)
  // ============================================

  if (env.ENABLE_ANALYTICS === 'true' && env.ANALYTICS_ENDPOINT) {
    // Fire-and-forget analytics
    context.waitUntil(
      fetch(env.ANALYTICS_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify({
          path: new URL(request.url).pathname,
          userAgent: request.headers.get('User-Agent'),
          country: cf?.country,
          colo: cf?.colo,
          timestamp: new Date().toISOString()
        })
      }).catch(() => {
        // Silently fail analytics
      })
    );
  }

  // ============================================
  // Bot Handling
  // ============================================

  const debugHeadersEnabled =
    env.ENABLE_DEBUG_HEADERS === 'true' || env.ENVIRONMENT === 'preview';

  if (debugHeadersEnabled && cf?.bot) {
    newResponse.headers.set('X-Bot-Score', String(cf.bot.score));
    if (cf.bot.verified) newResponse.headers.set('X-Bot-Verified', 'true');
  }

  // ============================================
  // Edge Location Header (for debugging)
  // ============================================

  if (debugHeadersEnabled) {
    if (cf?.colo) newResponse.headers.set('X-Edge-Location', cf.colo);
    if (cf?.country) newResponse.headers.set('X-Country', cf.country);
  }

  return newResponse;
}
