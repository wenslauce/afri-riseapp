/**
 * Client-side Admin Authentication Service
 */

import { createClient } from '@/utils/supabase/client'

export type AdminRole = 'super_admin' | 'admin' | 'reviewer' | 'analyst'

export interface AdminUser {
  id: string
  email: string
  role: AdminRole
  permissions: AdminPermission[]
  created_at: string
  last_login?: string
  is_active: boolean
}

export interface AdminPermission {
  id: string
  name: string
  resource: string
  action: string
  description: string
}

export interface AdminSession {
  user: AdminUser
  token: string
  expires_at: string
}

export class AdminAuthClient {
  private static instance: AdminAuthClient
  private permissions: Map<AdminRole, AdminPermission[]> = new Map()

  private constructor() {
    this.initializePermissions()
  }

  static getInstance(): AdminAuthClient {
    if (!AdminAuthClient.instance) {
      AdminAuthClient.instance = new AdminAuthClient()
    }
    return AdminAuthClient.instance
  }

  /**
   * Initialize role-based permissions
   */
  private initializePermissions(): void {
    const permissions = {
      // Application management permissions
      applications_view: {
        id: 'applications_view',
        name: 'View Applications',
        resource: 'applications',
        action: 'read',
        description: 'View loan applications'
      },
      applications_edit: {
        id: 'applications_edit',
        name: 'Edit Applications',
        resource: 'applications',
        action: 'update',
        description: 'Edit application details'
      },
      applications_approve: {
        id: 'applications_approve',
        name: 'Approve Applications',
        resource: 'applications',
        action: 'approve',
        description: 'Approve or reject applications'
      },
      applications_delete: {
        id: 'applications_delete',
        name: 'Delete Applications',
        resource: 'applications',
        action: 'delete',
        description: 'Delete applications'
      },

      // User management permissions
      users_view: {
        id: 'users_view',
        name: 'View Users',
        resource: 'users',
        action: 'read',
        description: 'View user profiles'
      },
      users_edit: {
        id: 'users_edit',
        name: 'Edit Users',
        resource: 'users',
        action: 'update',
        description: 'Edit user profiles'
      },
      users_delete: {
        id: 'users_delete',
        name: 'Delete Users',
        resource: 'users',
        action: 'delete',
        description: 'Delete user accounts'
      },

      // Document management permissions
      documents_view: {
        id: 'documents_view',
        name: 'View Documents',
        resource: 'documents',
        action: 'read',
        description: 'View uploaded documents'
      },
      documents_verify: {
        id: 'documents_verify',
        name: 'Verify Documents',
        resource: 'documents',
        action: 'verify',
        description: 'Verify document authenticity'
      },
      documents_delete: {
        id: 'documents_delete',
        name: 'Delete Documents',
        resource: 'documents',
        action: 'delete',
        description: 'Delete documents'
      },

      // Analytics and reporting permissions
      analytics_view: {
        id: 'analytics_view',
        name: 'View Analytics',
        resource: 'analytics',
        action: 'read',
        description: 'View analytics and reports'
      },
      analytics_export: {
        id: 'analytics_export',
        name: 'Export Analytics',
        resource: 'analytics',
        action: 'export',
        description: 'Export analytics data'
      },

      // System administration permissions
      admin_manage: {
        id: 'admin_manage',
        name: 'Manage Admins',
        resource: 'admins',
        action: 'manage',
        description: 'Manage admin users and roles'
      },
      system_config: {
        id: 'system_config',
        name: 'System Configuration',
        resource: 'system',
        action: 'configure',
        description: 'Configure system settings'
      }
    }

    // Define role permissions
    this.permissions.set('super_admin', Object.values(permissions))
    
    this.permissions.set('admin', [
      permissions.applications_view,
      permissions.applications_edit,
      permissions.applications_approve,
      permissions.users_view,
      permissions.users_edit,
      permissions.documents_view,
      permissions.documents_verify,
      permissions.analytics_view,
      permissions.analytics_export
    ])

    this.permissions.set('reviewer', [
      permissions.applications_view,
      permissions.applications_edit,
      permissions.documents_view,
      permissions.documents_verify,
      permissions.analytics_view
    ])

    this.permissions.set('analyst', [
      permissions.applications_view,
      permissions.users_view,
      permissions.documents_view,
      permissions.analytics_view,
      permissions.analytics_export
    ])
  }

  /**
   * Authenticate admin user via API
   */
  async authenticateAdmin(email: string, password: string): Promise<{ success: boolean; session?: AdminSession; error?: string }> {
    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      })

      const result = await response.json()

      if (!response.ok) {
        return { success: false, error: result.error || 'Login failed' }
      }

      return { success: true, session: result.session }
    } catch (error) {
      console.error('Admin authentication error:', error)
      return { success: false, error: 'Authentication failed' }
    }
  }

  /**
   * Get current admin user from session
   */
  async getCurrentAdmin(): Promise<AdminUser | null> {
    try {
      const response = await fetch('/api/admin/auth/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        return null
      }

      const result = await response.json()
      return result.admin
    } catch (error) {
      console.error('Get current admin error:', error)
      return null
    }
  }

  /**
   * Check if admin has specific permission
   */
  hasPermission(admin: AdminUser, resource: string, action: string): boolean {
    return admin.permissions.some(permission => 
      permission.resource === resource && permission.action === action
    )
  }

  /**
   * Check if admin has any permission for a resource
   */
  hasResourceAccess(admin: AdminUser, resource: string): boolean {
    return admin.permissions.some(permission => permission.resource === resource)
  }

  /**
   * Get all permissions for a role
   */
  getRolePermissions(role: AdminRole): AdminPermission[] {
    return this.permissions.get(role) || []
  }

  /**
   * Logout admin user
   */
  async logout(): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/admin/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const result = await response.json()

      if (!response.ok) {
        return { success: false, error: result.error || 'Logout failed' }
      }

      return { success: true }
    } catch (error) {
      console.error('Admin logout error:', error)
      return { success: false, error: 'Logout failed' }
    }
  }
}

// Export singleton instance
export const adminAuthClient = AdminAuthClient.getInstance()

// Permission checking utilities
export const checkAdminPermission = (admin: AdminUser, resource: string, action: string): boolean => {
  return adminAuthClient.hasPermission(admin, resource, action)
}

export const requireAdminPermission = (admin: AdminUser | null, resource: string, action: string): void => {
  if (!admin) {
    throw new Error('Authentication required')
  }
  
  if (!adminAuthClient.hasPermission(admin, resource, action)) {
    throw new Error(`Permission denied: ${resource}:${action}`)
  }
}
