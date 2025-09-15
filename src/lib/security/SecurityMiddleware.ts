import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { encryptionService } from './EncryptionService'

export interface SecurityConfig {
  rateLimiting?: {
    enabled: boolean
    maxRequests: number
    windowMs: number
  }
  authentication?: {
    required: boolean
    allowedRoles?: string[]
  }
  validation?: {
    sanitizeInput: boolean
    maxBodySize: number
  }
  logging?: {
    enabled: boolean
    logSensitiveData: boolean
  }
}

export interface SecurityContext {
  userId?: string
  userRole?: string
  ipAddress: string
  userAgent: string
  requestId: string
}

export class SecurityMiddleware {
  private static instance: SecurityMiddleware
  private rateLimitStore: Map<string, { count: number; resetTime: number }> = new Map()

  private constructor() {}

  static getInstance(): SecurityMiddleware {
    if (!SecurityMiddleware.instance) {
      SecurityMiddleware.instance = new SecurityMiddleware()
    }
    return SecurityMiddleware.instance
  }

  /**
   * Main security middleware function
   */
  async processRequest(
    request: NextRequest,
    config: SecurityConfig = {}
  ): Promise<{ 
    success: boolean
    response?: NextResponse
    context?: SecurityContext
    error?: string 
  }> {
    try {
      // Generate request ID for tracking
      const requestId = encryptionService.generateSecureToken(16)
      
      // Extract security context
      const context = this.extractSecurityContext(request, requestId)
      
      // Rate limiting check
      if (config.rateLimiting?.enabled) {
        const rateLimitResult = await this.checkRateLimit(context, config.rateLimiting)
        if (!rateLimitResult.allowed) {
          return {
            success: false,
            response: NextResponse.json(
              { error: 'Rate limit exceeded', retryAfter: rateLimitResult.retryAfter },
              { status: 429 }
            ),
            error: 'Rate limit exceeded'
          }
        }
      }

      // Authentication check
      if (config.authentication?.required) {
        const authResult = await this.checkAuthentication(request, config.authentication)
        if (!authResult.success) {
          return {
            success: false,
            response: NextResponse.json(
              { error: 'Authentication required' },
              { status: 401 }
            ),
            error: 'Authentication failed'
          }
        }
        context.userId = authResult.userId
        context.userRole = authResult.userRole
      }

      // Input validation
      if (config.validation?.sanitizeInput) {
        const validationResult = await this.validateRequest(request, config.validation)
        if (!validationResult.valid) {
          return {
            success: false,
            response: NextResponse.json(
              { error: 'Invalid request data' },
              { status: 400 }
            ),
            error: 'Validation failed'
          }
        }
      }

      // Security logging
      if (config.logging?.enabled) {
        await this.logSecurityEvent(context, 'request_processed', {
          path: request.nextUrl.pathname,
          method: request.method,
          sanitized: !config.logging.logSensitiveData
        })
      }

      return {
        success: true,
        context
      }
    } catch (error) {
      console.error('Security middleware error:', error)
      return {
        success: false,
        response: NextResponse.json(
          { error: 'Security check failed' },
          { status: 500 }
        ),
        error: error instanceof Error ? error.message : 'Unknown security error'
      }
    }
  }

  /**
   * Extract security context from request
   */
  private extractSecurityContext(request: NextRequest, requestId: string): SecurityContext {
    const forwarded = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const cfConnectingIp = request.headers.get('cf-connecting-ip')
    
    const ipAddress = cfConnectingIp || realIp || forwarded?.split(',')[0] || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    return {
      ipAddress: ipAddress.trim(),
      userAgent,
      requestId
    }
  }

  /**
   * Check rate limiting
   */
  private async checkRateLimit(
    context: SecurityContext,
    config: { maxRequests: number; windowMs: number }
  ): Promise<{ allowed: boolean; retryAfter?: number }> {
    const key = `${context.ipAddress}:${context.userId || 'anonymous'}`
    const now = Date.now()
    const windowStart = now - config.windowMs

    // Clean up old entries
    const entries = Array.from(this.rateLimitStore.entries())
    for (const [k, v] of entries) {
      if (v.resetTime < now) {
        this.rateLimitStore.delete(k)
      }
    }

    const current = this.rateLimitStore.get(key)
    
    if (!current) {
      this.rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      })
      return { allowed: true }
    }

    if (current.count >= config.maxRequests) {
      return {
        allowed: false,
        retryAfter: Math.ceil((current.resetTime - now) / 1000)
      }
    }

    current.count++
    return { allowed: true }
  }

  /**
   * Check authentication
   */
  private async checkAuthentication(
    request: NextRequest,
    config: { allowedRoles?: string[] }
  ): Promise<{ success: boolean; userId?: string; userRole?: string }> {
    try {
      const supabase = await createClient()
      
      // Get user from Supabase auth
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        return { success: false }
      }

      const userRole = user.app_metadata?.role || 'user'

      // Check role permissions
      if (config.allowedRoles && !config.allowedRoles.includes(userRole)) {
        return { success: false }
      }

      return {
        success: true,
        userId: user.id,
        userRole
      }
    } catch (error) {
      console.error('Authentication check failed:', error)
      return { success: false }
    }
  }

  /**
   * Validate request data
   */
  private async validateRequest(
    request: NextRequest,
    config: { maxBodySize: number }
  ): Promise<{ valid: boolean; sanitizedBody?: any }> {
    try {
      // Check content length
      const contentLength = request.headers.get('content-length')
      if (contentLength && parseInt(contentLength) > config.maxBodySize) {
        return { valid: false }
      }

      // Basic input sanitization
      if (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') {
        try {
          const body = await request.json()
          const sanitizedBody = this.sanitizeInput(body)
          return { valid: true, sanitizedBody }
        } catch (error) {
          // Invalid JSON
          return { valid: false }
        }
      }

      return { valid: true }
    } catch (error) {
      return { valid: false }
    }
  }

  /**
   * Sanitize input data
   */
  private sanitizeInput(data: any): any {
    if (typeof data === 'string') {
      // Basic XSS prevention
      return data
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;')
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeInput(item))
    }

    if (typeof data === 'object' && data !== null) {
      const sanitized: any = {}
      for (const [key, value] of Object.entries(data)) {
        // Sanitize key names
        const sanitizedKey = key.replace(/[^a-zA-Z0-9_]/g, '')
        sanitized[sanitizedKey] = this.sanitizeInput(value)
      }
      return sanitized
    }

    return data
  }

  /**
   * Log security events
   */
  private async logSecurityEvent(
    context: SecurityContext,
    event: string,
    metadata: any
  ): Promise<void> {
    try {
      const supabase = await createClient()
      
      const logData = {
        event_type: event,
        user_id: context.userId,
        ip_address: context.ipAddress,
        user_agent: context.userAgent,
        request_id: context.requestId,
        metadata: encryptionService.sanitizeForLogging(metadata),
        created_at: new Date().toISOString()
      }

      // Log to audit table
      await supabase
        .from('audit_log')
        .insert({
          table_name: 'security_events',
          operation: event,
          user_id: context.userId,
          new_values: logData
        })
    } catch (error) {
      console.error('Security logging failed:', error)
      // Don't throw error as this shouldn't block the request
    }
  }

  /**
   * Check for suspicious activity
   */
  async detectSuspiciousActivity(context: SecurityContext): Promise<{
    suspicious: boolean
    reasons: string[]
    riskScore: number
  }> {
    const reasons: string[] = []
    let riskScore = 0

    try {
      const supabase = await createClient()
      
      // Check for multiple failed login attempts
      const { data: failedLogins } = await supabase
        .from('audit_log')
        .select('*')
        .eq('table_name', 'security_events')
        .eq('operation', 'login_failed')
        .gte('created_at', new Date(Date.now() - 3600000).toISOString()) // Last hour
        .limit(10)

      if (failedLogins && failedLogins.length > 5) {
        reasons.push('Multiple failed login attempts')
        riskScore += 30
      }

      // Check for unusual IP address
      const { data: recentActivity } = await supabase
        .from('audit_log')
        .select('new_values')
        .eq('user_id', context.userId)
        .gte('created_at', new Date(Date.now() - 86400000).toISOString()) // Last 24 hours
        .limit(50)

      if (recentActivity) {
        const ipAddresses = new Set(
          recentActivity
            .map(log => log.new_values?.ip_address)
            .filter(ip => ip && ip !== context.ipAddress)
        )

        if (ipAddresses.size > 3) {
          reasons.push('Multiple IP addresses used')
          riskScore += 20
        }
      }

      // Check for rapid requests
      const requestKey = `${context.ipAddress}:${context.userId || 'anonymous'}`
      const recentRequests = this.rateLimitStore.get(requestKey)
      
      if (recentRequests && recentRequests.count > 50) {
        reasons.push('Unusually high request rate')
        riskScore += 25
      }

      return {
        suspicious: riskScore > 50,
        reasons,
        riskScore
      }
    } catch (error) {
      console.error('Suspicious activity detection failed:', error)
      return {
        suspicious: false,
        reasons: [],
        riskScore: 0
      }
    }
  }

  /**
   * Generate security headers
   */
  generateSecurityHeaders(): Record<string, string> {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self'",
        "connect-src 'self' https://api.supabase.co wss://realtime.supabase.co",
        "frame-ancestors 'none'"
      ].join('; '),
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
    }
  }
}

// Export singleton instance
export const securityMiddleware = SecurityMiddleware.getInstance()

// Utility function for API routes
export const withSecurity = (
  handler: (request: NextRequest, context: SecurityContext) => Promise<NextResponse>,
  config: SecurityConfig = {}
) => {
  return async (request: NextRequest): Promise<NextResponse> => {
    const result = await securityMiddleware.processRequest(request, config)
    
    if (!result.success) {
      return result.response!
    }

    try {
      const response = await handler(request, result.context!)
      
      // Add security headers
      const securityHeaders = securityMiddleware.generateSecurityHeaders()
      for (const [key, value] of Object.entries(securityHeaders)) {
        response.headers.set(key, value)
      }
      
      return response
    } catch (error) {
      console.error('Handler error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}