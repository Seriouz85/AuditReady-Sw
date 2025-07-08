// Content Security Policy configuration
export const getCSPDirectives = () => {
  const isDev = import.meta.env.DEV;
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  
  // Base CSP directives
  const directives = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      // Allow inline scripts in development
      ...(isDev ? ["'unsafe-inline'", "'unsafe-eval'"] : []),
      // Stripe
      'https://js.stripe.com',
      // Supabase
      supabaseUrl,
      // Analytics (if used)
      'https://www.googletagmanager.com',
      'https://www.google-analytics.com',
    ],
    'style-src': [
      "'self'",
      "'unsafe-inline'", // Required for Tailwind CSS
      'https://fonts.googleapis.com',
    ],
    'font-src': [
      "'self'",
      'https://fonts.gstatic.com',
      'data:', // For base64 encoded fonts
    ],
    'img-src': [
      "'self'",
      'data:', // For base64 images
      'blob:', // For blob URLs
      'https:', // Allow all HTTPS images
      // Specific domains
      'https://api.dicebear.com', // Avatar service
      'https://images.unsplash.com', // Stock images
      supabaseUrl, // Supabase storage
    ],
    'media-src': [
      "'self'",
      'blob:',
      supabaseUrl,
    ],
    'connect-src': [
      "'self'",
      // Supabase
      supabaseUrl,
      `wss://${new URL(supabaseUrl).host}`, // WebSocket for realtime
      // Stripe
      'https://api.stripe.com',
      // Sentry (error reporting)
      'https://o4507902234222592.ingest.us.sentry.io',
      // Development
      ...(isDev ? ['ws://localhost:*', 'http://localhost:*'] : []),
    ],
    'frame-src': [
      "'self'",
      // Stripe
      'https://js.stripe.com',
      'https://hooks.stripe.com',
      // YouTube (for video content)
      'https://www.youtube.com',
      'https://player.vimeo.com',
    ],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': [
      "'self'",
      // Stripe
      'https://api.stripe.com',
    ],
    'frame-ancestors': ["'none'"],
    'upgrade-insecure-requests': [],
  };

  // Convert to CSP string
  return Object.entries(directives)
    .map(([directive, sources]) => {
      if (sources.length === 0) {
        return directive;
      }
      return `${directive} ${sources.join(' ')}`;
    })
    .join('; ');
};

// Apply CSP to the document
export const applyCSP = () => {
  if (typeof document !== 'undefined') {
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = getCSPDirectives();
    document.head.appendChild(meta);
  }
};

// Security headers for development
export const getSecurityHeaders = () => ({
  'Content-Security-Policy': getCSPDirectives(),
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': [
    'geolocation=()',
    'microphone=()',
    'camera=()',
    'payment=*',
    'usb=()',
    'magnetometer=()',
    'gyroscope=()',
    'accelerometer=()',
  ].join(', '),
});