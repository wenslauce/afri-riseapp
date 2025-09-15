import { createClient } from '@/utils/supabase/server'
import { encryptionService } from './EncryptionService'

export interface SecureFileUpload {
  fileName: string
  fileSize: number
  mimeType: string
  secureUrl: string
  expiresAt: Date
}

export interface FileAccessPermission {
  userId: string
  fileId: string
  permission: 'read' | 'write' | 'delete'
  expiresAt?: Date
  conditions?: {
    ipAddress?: string
    userAgent?: string
    maxDownloads?: number
  }
}

export class FileAccessControl {
  private static instance: FileAccessControl
  private readonly bucketName = 'documents'
  private readonly signedUrlExpiry = 3600 // 1 hour in seconds

  private constructor() {}

  static getInstance(): FileAccessControl {
    if (!FileAccessControl.instance) {
      FileAccessControl.instance = new FileAccessControl()
    }
    return FileAccessControl.instance
  }

  /**
   * Generate secure signed URL for file upload
   */
  async generateUploadUrl(
    userId: string,
    fileName: string,
    fileSize: number,
    mimeType: string,
    applicationId: string
  ): Promise<SecureFileUpload> {
    try {
      const supabase = await createClient()
      
      // Generate secure file name
      const secureFileName = encryptionService.generateSecureFileName(fileName)
      const filePath = `${userId}/${applicationId}/${secureFileName}`
      
      // Create signed URL for upload
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .createSignedUploadUrl(filePath, {
          upsert: false
        })

      if (error) {
        throw new Error(`Failed to create upload URL: ${error.message}`)
      }

      // Store file metadata with encryption
      const metadata = {
        originalFileName: fileName,
        secureFileName,
        fileSize,
        mimeType,
        userId,
        applicationId,
        uploadedAt: new Date().toISOString()
      }

      const encryptedMetadata = encryptionService.encryptPII(metadata)
      
      // Store in database (you would need a file_metadata table)
      // This is a placeholder - implement according to your schema
      
      return {
        fileName: secureFileName,
        fileSize,
        mimeType,
        secureUrl: data.signedUrl,
        expiresAt: new Date(Date.now() + this.signedUrlExpiry * 1000)
      }
    } catch (error) {
      throw new Error(`Upload URL generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Generate secure signed URL for file download
   */
  async generateDownloadUrl(
    userId: string,
    filePath: string,
    permission?: FileAccessPermission
  ): Promise<string> {
    try {
      // Verify user has access to this file
      if (!await this.verifyFileAccess(userId, filePath, 'read')) {
        throw new Error('Access denied: User does not have permission to access this file')
      }

      const supabase = await createClient()
      
      // Create signed URL for download
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .createSignedUrl(filePath, this.signedUrlExpiry)

      if (error) {
        throw new Error(`Failed to create download URL: ${error.message}`)
      }

      // Log access attempt
      await this.logFileAccess(userId, filePath, 'download', {
        timestamp: new Date(),
        ipAddress: permission?.conditions?.ipAddress,
        userAgent: permission?.conditions?.userAgent
      })

      return data.signedUrl
    } catch (error) {
      throw new Error(`Download URL generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Verify user has access to file
   */
  private async verifyFileAccess(
    userId: string,
    filePath: string,
    permission: 'read' | 'write' | 'delete'
  ): Promise<boolean> {
    try {
      // Extract user ID and application ID from file path
      const pathParts = filePath.split('/')
      if (pathParts.length < 3) {
        return false
      }

      const fileUserId = pathParts[0]
      const applicationId = pathParts[1]

      // Check if user owns the file
      if (fileUserId !== userId) {
        return false
      }

      // Verify user owns the application
      const supabase = await createClient()
      const { data: application, error } = await supabase
        .from('applications')
        .select('user_id')
        .eq('id', applicationId)
        .eq('user_id', userId)
        .single()

      if (error || !application) {
        return false
      }

      return true
    } catch (error) {
      console.error('File access verification failed:', error)
      return false
    }
  }

  /**
   * Log file access for audit trail
   */
  private async logFileAccess(
    userId: string,
    filePath: string,
    action: string,
    metadata: {
      timestamp: Date
      ipAddress?: string
      userAgent?: string
    }
  ): Promise<void> {
    try {
      const supabase = await createClient()
      
      // Log to audit table
      await supabase
        .from('audit_log')
        .insert({
          table_name: 'file_access',
          operation: action,
          user_id: userId,
          new_values: {
            filePath,
            action,
            ...metadata
          }
        })
    } catch (error) {
      console.error('Failed to log file access:', error)
      // Don't throw error as this shouldn't block file access
    }
  }

  /**
   * Secure file deletion
   */
  async deleteFile(userId: string, filePath: string): Promise<boolean> {
    try {
      // Verify user has delete permission
      if (!await this.verifyFileAccess(userId, filePath, 'delete')) {
        throw new Error('Access denied: User does not have permission to delete this file')
      }

      const supabase = await createClient()
      
      // Delete file from storage
      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove([filePath])

      if (error) {
        throw new Error(`Failed to delete file: ${error.message}`)
      }

      // Log deletion
      await this.logFileAccess(userId, filePath, 'delete', {
        timestamp: new Date()
      })

      return true
    } catch (error) {
      console.error('File deletion failed:', error)
      return false
    }
  }

  /**
   * List user's files with secure access
   */
  async listUserFiles(userId: string, applicationId?: string): Promise<string[]> {
    try {
      const supabase = await createClient()
      
      let prefix = userId
      if (applicationId) {
        prefix = `${userId}/${applicationId}`
      }

      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .list(prefix, {
          limit: 100,
          sortBy: { column: 'created_at', order: 'desc' }
        })

      if (error) {
        throw new Error(`Failed to list files: ${error.message}`)
      }

      return data?.map(file => `${prefix}/${file.name}`) || []
    } catch (error) {
      console.error('File listing failed:', error)
      return []
    }
  }

  /**
   * Get file metadata securely
   */
  async getFileMetadata(userId: string, filePath: string): Promise<any> {
    try {
      // Verify access
      if (!await this.verifyFileAccess(userId, filePath, 'read')) {
        throw new Error('Access denied')
      }

      const supabase = await createClient()
      
      // Get file info from storage
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .list(filePath.substring(0, filePath.lastIndexOf('/')), {
          search: filePath.substring(filePath.lastIndexOf('/') + 1)
        })

      if (error || !data || data.length === 0) {
        throw new Error('File not found')
      }

      const fileInfo = data[0]
      
      return {
        name: fileInfo.name,
        size: fileInfo.metadata?.size,
        mimeType: fileInfo.metadata?.mimetype,
        lastModified: fileInfo.updated_at,
        created: fileInfo.created_at
      }
    } catch (error) {
      throw new Error(`Failed to get file metadata: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Scan file for security threats
   */
  async scanFile(filePath: string): Promise<{
    safe: boolean
    threats: string[]
    scanDate: Date
  }> {
    try {
      // This is a placeholder for virus/malware scanning
      // In production, integrate with services like:
      // - ClamAV
      // - VirusTotal API
      // - AWS GuardDuty
      // - Azure Defender
      
      const threats: string[] = []
      
      // Basic file extension check
      const extension = filePath.split('.').pop()?.toLowerCase()
      const dangerousExtensions = [
        'exe', 'bat', 'cmd', 'com', 'pif', 'scr', 'vbs', 'js', 'jar'
      ]
      
      if (extension && dangerousExtensions.includes(extension)) {
        threats.push(`Potentially dangerous file extension: .${extension}`)
      }

      // File size check (prevent extremely large files)
      const metadata = await this.getFileMetadata('system', filePath)
      if (metadata.size > 100 * 1024 * 1024) { // 100MB limit
        threats.push('File size exceeds maximum allowed limit')
      }

      return {
        safe: threats.length === 0,
        threats,
        scanDate: new Date()
      }
    } catch (error) {
      console.error('File scanning failed:', error)
      return {
        safe: false,
        threats: ['File scanning failed'],
        scanDate: new Date()
      }
    }
  }

  /**
   * Generate temporary access token for file sharing
   */
  generateTemporaryAccessToken(
    userId: string,
    filePath: string,
    expiresIn: number = 3600
  ): string {
    const payload = {
      userId,
      filePath,
      expiresAt: Date.now() + (expiresIn * 1000),
      action: 'read'
    }

    return encryptionService.createSignature(JSON.stringify(payload))
  }

  /**
   * Verify temporary access token
   */
  verifyTemporaryAccessToken(token: string, filePath: string): boolean {
    try {
      // This is a simplified implementation
      // In production, you'd want to store and validate tokens properly
      return encryptionService.verifySignature(filePath, token)
    } catch (error) {
      return false
    }
  }
}

// Export singleton instance
export const fileAccessControl = FileAccessControl.getInstance()

// Utility functions
export const generateSecureUploadUrl = async (
  userId: string,
  fileName: string,
  fileSize: number,
  mimeType: string,
  applicationId: string
): Promise<SecureFileUpload> => {
  return fileAccessControl.generateUploadUrl(userId, fileName, fileSize, mimeType, applicationId)
}

export const generateSecureDownloadUrl = async (
  userId: string,
  filePath: string
): Promise<string> => {
  return fileAccessControl.generateDownloadUrl(userId, filePath)
}

export const secureDeleteFile = async (userId: string, filePath: string): Promise<boolean> => {
  return fileAccessControl.deleteFile(userId, filePath)
}