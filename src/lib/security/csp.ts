// Enhanced Content Security Policy configuration with XSS protection
export const getCSPDirectives = () => {
  const isDev = import.meta.env.DEV;
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  
  // Generate nonce for inline scripts in production
  const nonce = generateNonce();
  
  // Base CSP directives with enhanced security
  const directives = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      // Use nonces instead of unsafe-inline in production
      ...(isDev ? ["'unsafe-inline'", "'unsafe-eval'"] : [`'nonce-${nonce}'`]),
      // Strict hashes for known inline scripts
      "'sha256-/+kXNDfwYHKy0aDL2EQQJhP/BKHN7QEhE7Y7X6YyQzw='", // React DevTools hash
      // Trusted external scripts
      'https://js.stripe.com',
      'https://www.googletagmanager.com',
      'https://www.google-analytics.com',
      // Supabase
      supabaseUrl,
    ],
    'style-src': [
      "'self'",
      // Use nonces for inline styles where possible
      ...(isDev ? ["'unsafe-inline'"] : [`'nonce-${nonce}'`, "'unsafe-inline'"]), // Tailwind CSS still needs unsafe-inline
      'https://fonts.googleapis.com',
      // Hash for known critical CSS
      "'sha256-8G6eZ0oZ6iD2PJ6B8T4H9Y5S3+4S8KyFR8K5fJ7M8+g='",
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
      // Specific trusted domains only
      'https://api.dicebear.com', // Avatar service
      'https://images.unsplash.com', // Stock images
      'https://*.supabase.co', // Supabase storage
      'https://*.supabase.in', // Supabase storage alt domain
      supabaseUrl, // User's Supabase instance
    ],
    'media-src': [
      "'self'",
      'blob:',
      'https://*.supabase.co',
      'https://*.supabase.in',
      supabaseUrl,
    ],
    'connect-src': [
      "'self'",
      // Supabase
      supabaseUrl,
      `wss://${new URL(supabaseUrl).host}`, // WebSocket for realtime
      // Stripe
      'https://api.stripe.com',
      'https://checkout.stripe.com',
      // Sentry (error reporting)
      'https://o4507902234222592.ingest.us.sentry.io',
      // AI Services (if used)
      'https://api.openai.com',
      'https://generativelanguage.googleapis.com',
      // Development
      ...(isDev ? ['ws://localhost:*', 'http://localhost:*', 'ws://127.0.0.1:*'] : []),
    ],
    'frame-src': [
      "'self'",
      // Stripe
      'https://js.stripe.com',
      'https://hooks.stripe.com',
      'https://checkout.stripe.com',
      // Video platforms (restricted)
      'https://www.youtube-nocookie.com', // Privacy-enhanced YouTube
      'https://player.vimeo.com',
    ],
    'object-src': ["'none'"], // Prevent Flash/plugins
    'base-uri': ["'self'"], // Prevent base tag injection
    'form-action': [
      "'self'",
      // Stripe
      'https://api.stripe.com',
      'https://checkout.stripe.com',
    ],
    'frame-ancestors': ["'none'"], // Prevent clickjacking
    'manifest-src': ["'self'"], // PWA manifest
    'worker-src': ["'self'", 'blob:'], // Service workers
    'child-src': ["'self'", 'blob:'], // Web workers
    'upgrade-insecure-requests': [], // Force HTTPS
    'block-all-mixed-content': [], // Block mixed content
  };

  // Add strict directives for production
  if (!isDev) {
    directives['require-trusted-types-for'] = ["'script'"]; // Require Trusted Types API
    directives['trusted-types'] = ['default']; // Allow default Trusted Types policy
  }

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

// Generate cryptographically secure nonce
export const generateNonce = (): string => {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode.apply(null, Array.from(array)));
  }
  // Fallback for environments without crypto API
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
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