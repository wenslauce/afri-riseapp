import crypto from 'crypto'

export interface EncryptedData {
  encryptedData: string
  iv: string
  tag: string
}

export class EncryptionService {
  private static instance: EncryptionService
  private readonly algorithm = 'aes-256-gcm'
  private readonly keyLength = 32 // 256 bits
  private readonly ivLength = 16 // 128 bits
  private readonly tagLength = 16 // 128 bits

  private constructor() {}

  static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService()
    }
    return EncryptionService.instance
  }

  /**
   * Get encryption key from environment or generate one
   */
  private getEncryptionKey(): Buffer {
    const keyString = process.env.ENCRYPTION_KEY
    
    if (!keyString) {
      throw new Error('ENCRYPTION_KEY environment variable is required')
    }

    // Convert hex string to buffer
    if (keyString.length !== 64) { // 32 bytes = 64 hex characters
      throw new Error('ENCRYPTION_KEY must be 64 hex characters (32 bytes)')
    }

    return Buffer.from(keyString, 'hex')
  }

  /**
   * Generate a new encryption key (for setup)
   */
  static generateKey(): string {
    return crypto.randomBytes(32).toString('hex')
  }

  /**
   * Encrypt sensitive data
   */
  encrypt(plaintext: string): EncryptedData {
    try {
      const key = this.getEncryptionKey()
      const iv = crypto.randomBytes(this.ivLength)
      
      const cipher = crypto.createCipher(this.algorithm, key)
      cipher.setAAD(Buffer.from('afri-rise-loan-system', 'utf8'))
      
      let encrypted = cipher.update(plaintext, 'utf8', 'hex')
      encrypted += cipher.final('hex')
      
      const tag = cipher.getAuthTag()

      return {
        encryptedData: encrypted,
        iv: iv.toString('hex'),
        tag: tag.toString('hex')
      }
    } catch (error) {
      throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Decrypt sensitive data
   */
  decrypt(encryptedData: EncryptedData): string {
    try {
      const key = this.getEncryptionKey()
      const iv = Buffer.from(encryptedData.iv, 'hex')
      const tag = Buffer.from(encryptedData.tag, 'hex')
      
      const decipher = crypto.createDecipher(this.algorithm, key)
      decipher.setAAD(Buffer.from('afri-rise-loan-system', 'utf8'))
      decipher.setAuthTag(tag)
      
      let decrypted = decipher.update(encryptedData.encryptedData, 'hex', 'utf8')
      decrypted += decipher.final('utf8')
      
      return decrypted
    } catch (error) {
      throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Hash sensitive data (one-way)
   */
  hash(data: string, salt?: string): { hash: string; salt: string } {
    const actualSalt = salt || crypto.randomBytes(16).toString('hex')
    const hash = crypto.pbkdf2Sync(data, actualSalt, 100000, 64, 'sha512').toString('hex')
    
    return { hash, salt: actualSalt }
  }

  /**
   * Verify hashed data
   */
  verifyHash(data: string, hash: string, salt: string): boolean {
    const { hash: computedHash } = this.hash(data, salt)
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(computedHash, 'hex'))
  }

  /**
   * Encrypt personal identifiable information (PII)
   */
  encryptPII(piiData: Record<string, any>): Record<string, EncryptedData> {
    const encrypted: Record<string, EncryptedData> = {}
    
    for (const [key, value] of Object.entries(piiData)) {
      if (value !== null && value !== undefined) {
        encrypted[key] = this.encrypt(JSON.stringify(value))
      }
    }
    
    return encrypted
  }

  /**
   * Decrypt personal identifiable information (PII)
   */
  decryptPII(encryptedPII: Record<string, EncryptedData>): Record<string, any> {
    const decrypted: Record<string, any> = {}
    
    for (const [key, encryptedValue] of Object.entries(encryptedPII)) {
      try {
        const decryptedValue = this.decrypt(encryptedValue)
        decrypted[key] = JSON.parse(decryptedValue)
      } catch (error) {
        console.error(`Failed to decrypt PII field ${key}:`, error)
        decrypted[key] = null
      }
    }
    
    return decrypted
  }

  /**
   * Generate secure random token
   */
  generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex')
  }

  /**
   * Generate secure file name
   */
  generateSecureFileName(originalName: string): string {
    const extension = originalName.split('.').pop()
    const secureId = this.generateSecureToken(16)
    const timestamp = Date.now()
    
    return `${timestamp}_${secureId}.${extension}`
  }

  /**
   * Encrypt file content
   */
  encryptFile(fileBuffer: Buffer): EncryptedData {
    const base64Content = fileBuffer.toString('base64')
    return this.encrypt(base64Content)
  }

  /**
   * Decrypt file content
   */
  decryptFile(encryptedData: EncryptedData): Buffer {
    const base64Content = this.decrypt(encryptedData)
    return Buffer.from(base64Content, 'base64')
  }

  /**
   * Create secure signature for data integrity
   */
  createSignature(data: string, secret?: string): string {
    const key = secret || process.env.SIGNATURE_SECRET || 'default-secret'
    return crypto.createHmac('sha256', key).update(data).digest('hex')
  }

  /**
   * Verify data signature
   */
  verifySignature(data: string, signature: string, secret?: string): boolean {
    const expectedSignature = this.createSignature(data, secret)
    return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSignature, 'hex'))
  }

  /**
   * Sanitize sensitive data for logging
   */
  sanitizeForLogging(data: any): any {
    const sensitiveFields = [
      'password', 'token', 'secret', 'key', 'signature_data',
      'national_id', 'passport', 'ssn', 'tax_number', 'phone',
      'email', 'address', 'ip_address'
    ]

    if (typeof data !== 'object' || data === null) {
      return data
    }

    const sanitized = { ...data }

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        if (typeof sanitized[field] === 'string' && sanitized[field].length > 0) {
          // Show first 2 and last 2 characters, mask the rest
          const value = sanitized[field]
          if (value.length <= 4) {
            sanitized[field] = '*'.repeat(value.length)
          } else {
            sanitized[field] = value.substring(0, 2) + '*'.repeat(value.length - 4) + value.substring(value.length - 2)
          }
        } else {
          sanitized[field] = '[REDACTED]'
        }
      }
    }

    // Recursively sanitize nested objects
    for (const [key, value] of Object.entries(sanitized)) {
      if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeForLogging(value)
      }
    }

    return sanitized
  }
}

// Export singleton instance
export const encryptionService = EncryptionService.getInstance()

// Utility functions for common encryption tasks
export const encryptSensitiveData = (data: string): EncryptedData => {
  return encryptionService.encrypt(data)
}

export const decryptSensitiveData = (encryptedData: EncryptedData): string => {
  return encryptionService.decrypt(encryptedData)
}

export const hashPassword = (password: string): { hash: string; salt: string } => {
  return encryptionService.hash(password)
}

export const verifyPassword = (password: string, hash: string, salt: string): boolean => {
  return encryptionService.verifyHash(password, hash, salt)
}

export const generateSecureToken = (length?: number): string => {
  return encryptionService.generateSecureToken(length)
}