import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Content Security Policy Configuration - PERMISSIVE for development
const CSP_DIRECTIVES = {
  'default-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", "*"],
  'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", "*"],
  'style-src': ["'self'", "'unsafe-inline'", "*"],
  'img-src': ["'self'", "data:", "blob:", "https:", "http:", "*"],
  'font-src': ["'self'", "https://fonts.gstatic.com", "*"],
  'connect-src': ["'self'", "*"],
  'frame-src': ["'self'"],
  'media-src': ["'self'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'self'"],
};

// Generate CSP header string
function generateCSP(): string {
  return Object.entries(CSP_DIRECTIVES)
    .map(([directive, sources]) => {
      if (sources.length === 0) return directive;
      return `${directive} ${sources.join(' ')}`;
    })
    .join('; ');
}

// Security headers configuration
const securityHeaders = {
  'Content-Security-Policy': generateCSP(),
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  // NOTE: Strict-Transport-Security disabled for localhost development
  // Enable in production: 'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
};

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add security headers to all responses
  Object.entries(securityHeaders).forEach(([header, value]) => {
    response.headers.set(header, value);
  });

  // Add nonce for inline scripts (optional, for stricter CSP)
  // const nonce = crypto.randomUUID();
  // response.headers.set('X-Nonce', nonce);

  return response;
}

// Apply middleware to all routes
export const config = {
  matcher: [
    '/',
    '/((?!api|_next/static|_next/image|favicon.ico|site.webmanifest).*)',
  ],
};
