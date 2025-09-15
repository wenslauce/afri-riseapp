/**
 * Security Configuration
 * Centralized security settings for the application
 */

export interface SecuritySettings {
  encryption: {
    algorithm: string
    keyLength: number
    ivLength: number
    tagLength: number
  }
  rateLimiting: {
    enabled: boolean
    windowMs: number
    maxRequests: {
      general: number
      auth: number
      upload: number
      download: number
    }
  }
  fileUpload: {
    maxFileSize: number
    allowedMimeTypes: string[]
    dangerousExtensions: string[]
    scanEnabled: boolean
  }
  authentication: {
    sessionTimeout: number
    maxFailedAttempts: number
    lockoutDuration: number
    requireMFA: boolean
  }
  audit: {
    enabled: boolean
    retentionDays: number
    logSensitiveData: boolean
    realTimeAlerts: boolean
  }
  cors: {
    allowedOrigins: string[]
    allowedMethods: string[]
    allowedHeaders: string[]
    credentials: boolean
  }
  headers: {
    hsts: {
      maxAge: number
      includeSubDomains: boolean
      preload: boolean
    }
    csp: {
      defaultSrc: string[]
      scriptSrc: string[]
      styleSrc: string[]
      imgSrc: string[]
      connectSrc: string[]
      fontSrc: string[]
      objectSrc: string[]
      mediaSrc: string[]
      frameSrc: string[]
    }
  }
}

export const defaultSecuritySettings: SecuritySettings = {
  encryption: {
    algorithm: 'aes-256-gcm',
    keyLength: 32, // 256 bits
    ivLength: 16,  // 128 bits
    tagLength: 16  // 128 bits
  },
  rateLimiting: {
    enabled: true,
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: {
      general: 100,
      auth: 5,
      upload: 10,
      download: 50
    }
  },
  fileUpload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ],
    dangerousExtensions: [
      'exe', 'bat', 'cmd', 'com', 'pif', 'scr', 'vbs', 'js', 'jar',
      'app', 'deb', 'pkg', 'rpm', 'dmg', 'iso', 'msi'
    ],
    scanEnabled: true
  },
  authentication: {
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
    maxFailedAttempts: 5,
    lockoutDuration: 30 * 60 * 1000, // 30 minutes
    requireMFA: false
  },
  audit: {
    enabled: true,
    retentionDays: 365,
    logSensitiveData: false,
    realTimeAlerts: true
  },
  cors: {
    allowedOrigins: [
      process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    ],
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin'
    ],
    credentials: true
  },
  headers: {
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true
    },
    csp: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: [
        "'self'",
        'https://api.supabase.co',
        'wss://realtime.supabase.co',
        'https://cybqa.pesapal.com',
        'https://pay.pesapal.com'
      ],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  }
}

/**
 * Environment-specific security overrides
 */
export const getSecuritySettings = (): SecuritySettings => {
  const settings = { ...defaultSecuritySettings }
  
  // Production overrides
  if (process.env.NODE_ENV === 'production') {
    settings.rateLimiting.maxRequests.general = 200
    settings.audit.realTimeAlerts = true
    settings.headers.hsts.preload = true
    
    // Stricter CSP in production
    settings.headers.csp.scriptSrc = ["'self'"]
    settings.headers.csp.styleSrc = ["'self'"]
  }
  
  // Development overrides
  if (process.env.NODE_ENV === 'development') {
    settings.rateLimiting.enabled = false
    settings.audit.logSensitiveData = true
    settings.fileUpload.scanEnabled = false
  }
  
  // Test environment overrides
  if (process.env.NODE_ENV === 'test') {
    settings.rateLimiting.enabled = false
    settings.audit.enabled = false
    settings.fileUpload.scanEnabled = false
    settings.authentication.maxFailedAttempts = 10
  }
  
  return settings
}

/**
 * Validate security configuration
 */
export const validateSecurityConfig = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  // Check required environment variables
  if (!process.env.ENCRYPTION_KEY) {
    errors.push('ENCRYPTION_KEY environment variable is required')
  } else if (process.env.ENCRYPTION_KEY.length !== 64) {
    errors.push('ENCRYPTION_KEY must be 64 hex characters (32 bytes)')
  }
  
  if (!process.env.SIGNATURE_SECRET) {
    errors.push('SIGNATURE_SECRET environment variable is required')
  }
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL environment variable is required')
  }
  
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    errors.push('SUPABASE_SERVICE_ROLE_KEY environment variable is required')
  }
  
  // Validate Pesapal configuration
  if (!process.env.PESAPAL_CONSUMER_KEY) {
    errors.push('PESAPAL_CONSUMER_KEY environment variable is required')
  }
  
  if (!process.env.PESAPAL_CONSUMER_SECRET) {
    errors.push('PESAPAL_CONSUMER_SECRET environment variable is required')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Security headers generator
 */
export const generateSecurityHeaders = (settings: SecuritySettings): Record<string, string> => {
  const csp = Object.entries(settings.headers.csp)
    .map(([directive, sources]) => `${directive.replace(/([A-Z])/g, '-$1').toLowerCase()} ${sources.join(' ')}`)
    .join('; ')
  
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': csp,
    'Strict-Transport-Security': `max-age=${settings.headers.hsts.maxAge}${
      settings.headers.hsts.includeSubDomains ? '; includeSubDomains' : ''
    }${settings.headers.hsts.preload ? '; preload' : ''}`,
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin'
  }
}

/**
 * CORS configuration generator
 */
export const generateCorsConfig = (settings: SecuritySettings) => {
  return {
    origin: settings.cors.allowedOrigins,
    methods: settings.cors.allowedMethods,
    allowedHeaders: settings.cors.allowedHeaders,
    credentials: settings.cors.credentials,
    optionsSuccessStatus: 200
  }
}

/**
 * Rate limiting configuration generator
 */
export const generateRateLimitConfig = (settings: SecuritySettings, type: keyof SecuritySettings['rateLimiting']['maxRequests'] = 'general') => {
  return {
    windowMs: settings.rateLimiting.windowMs,
    max: settings.rateLimiting.maxRequests[type],
    message: {
      error: 'Too many requests',
      retryAfter: Math.ceil(settings.rateLimiting.windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false
  }
}