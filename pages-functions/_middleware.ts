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
}

export interface RequestContext {
  request: Request;
  waitUntil: (promise: Promise<unknown>) => void;
  env: Env;
  cf: RequestCf;
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

  // Get the original response
  const response = await fetch(request);

  // Clone the response to modify headers
  const newResponse = new Response(response.body, response);

  // ============================================
  // Security Headers
  // ============================================

  // Strict-Transport-Security (only on HTTPS)
  if (request.url.startsWith('https://')) {
    const maxAge = env.ENVIRONMENT === 'production' ? 31536000 : 86400;
    newResponse.headers.set(
      'Strict-Transport-Security',
      `max-age=${maxAge}; includeSubDomains; preload`
    );
  }

  // Content-Security-Policy
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https:",
    "media-src 'self' blob:",
    "worker-src 'self' blob:",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'",
    "upgrade-insecure-requests"
  ].join('; ');

  newResponse.headers.set('Content-Security-Policy', cspDirectives);

  // ============================================
  // Performance Headers
  // ============================================

  // Enable Early Hints
  const earlyHintsLinks = [
    '<https://cdnjs.cloudflare.com/ajax/libs/phaser/3.90.0/phaser.min.js>; rel=preload; as=script',
    '<https://fonts.googleapis.com/css2?family=Oxanium:wght@300;500;700&display=swap>; rel=preload; as=style',
    '</assets/player.png>; rel=preload; as=image',
    '</assets/enemy.png>; rel=preload; as=image',
    '</assets/bullet.png>; rel=preload; as=image'
  ];

  // In a real implementation, you'd use the Early Hints API
  // newResponse.headers.set('Link', earlyHintsLinks.join(', '));

  // ============================================
  // Analytics & Monitoring (optional)
  // ============================================

  if (env.ENABLE_ANALYTICS === 'true') {
    // Fire-and-forget analytics
    context.waitUntil(
      fetch('https://analytics.example.com/track', {
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

  if (cf?.bot) {
    // Add bot score header for monitoring
    newResponse.headers.set(
      'X-Bot-Score',
      String(cf.bot.score)
    );

    // Log verified bots
    if (cf.bot.verified) {
      newResponse.headers.set('X-Bot-Verified', 'true');
    }
  }

  // ============================================
  // Edge Location Header (for debugging)
  // ============================================

  if (cf?.colo) {
    newResponse.headers.set('X-Edge-Location', cf.colo);
  }

  if (cf?.country) {
    newResponse.headers.set('X-Country', cf.country);
  }

  return newResponse;
}
