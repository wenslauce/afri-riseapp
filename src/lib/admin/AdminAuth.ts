/**
 * Admin Authentication and Role-Based Access Control
 */

import { createClient } from '@/utils/supabase/server'
import { User } from '@supabase/supabase-js'

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

export class AdminAuthService {
  private static instance: AdminAuthService
  private permissions: Map<AdminRole, AdminPermission[]> = new Map()

  private constructor() {
    this.initializePermissions()
  }

  static getInstance(): AdminAuthService {
    if (!AdminAuthService.instance) {
      AdminAuthService.instance = new AdminAuthService()
    }
    return AdminAuthService.instance
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
   * Authenticate admin user
   */
  async authenticateAdmin(email: string, password: string): Promise<{ success: boolean; session?: AdminSession; error?: string }> {
    try {
      const supabase = await createClient()

      // Authenticate with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authError || !authData.user) {
        return { success: false, error: 'Invalid credentials' }
      }

      // Use the database function to check admin privileges
      const { data: adminResult, error: adminError } = await supabase
        .rpc('authenticate_admin_user', {
          p_email: email,
          p_password: password
        })

      if (adminError) {
        console.error('Admin authentication RPC error:', adminError)
        return { success: false, error: 'Authentication failed' }
      }

      if (!adminResult.success) {
        return { success: false, error: adminResult.error }
      }

      const adminData = adminResult.admin

      const adminUser: AdminUser = {
        id: adminData.id,
        email: authData.user.email!,
        role: adminData.role,
        permissions: this.permissions.get(adminData.role) || [],
        created_at: adminData.created_at,
        last_login: adminData.last_login,
        is_active: adminData.is_active
      }

      const session: AdminSession = {
        user: adminUser,
        token: authData.session?.access_token || '',
        expires_at: authData.session?.expires_at ? new Date(authData.session.expires_at * 1000).toISOString() : ''
      }

      return { success: true, session }
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
      const supabase = await createClient()

      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        return null
      }

      // Use the database function to get admin data
      const { data: adminResult, error: adminError } = await supabase
        .rpc('get_current_admin')

      if (adminError) {
        console.error('Get current admin RPC error:', adminError)
        return null
      }

      if (!adminResult.success) {
        return null
      }

      const adminData = adminResult.admin

      return {
        id: adminData.id,
        email: user.email!,
        role: adminData.role,
        permissions: this.permissions.get(adminData.role) || [],
        created_at: adminData.created_at,
        last_login: adminData.last_login,
        is_active: adminData.is_active
      }
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
   * Create new admin user
   */
  async createAdminUser(
    email: string, 
    password: string, 
    role: AdminRole, 
    createdBy: string
  ): Promise<{ success: boolean; admin?: AdminUser; error?: string }> {
    try {
      const supabase = await createClient()

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      })

      if (authError || !authData.user) {
        return { success: false, error: 'Failed to create user account' }
      }

      // Create admin record
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .insert({
          user_id: authData.user.id,
          email,
          role,
          is_active: true,
          created_by: createdBy,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (adminError || !adminData) {
        // Cleanup: delete the auth user if admin creation failed
        await supabase.auth.admin.deleteUser(authData.user.id)
        return { success: false, error: 'Failed to create admin record' }
      }

      const admin: AdminUser = {
        id: adminData.id,
        email: adminData.email,
        role: adminData.role,
        permissions: this.permissions.get(adminData.role) || [],
        created_at: adminData.created_at,
        is_active: adminData.is_active
      }

      return { success: true, admin }
    } catch (error) {
      console.error('Create admin user error:', error)
      return { success: false, error: 'Failed to create admin user' }
    }
  }

  /**
   * Update admin user role
   */
  async updateAdminRole(
    adminId: string, 
    newRole: AdminRole, 
    updatedBy: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = await createClient()

      const { error } = await supabase
        .from('admin_users')
        .update({
          role: newRole,
          updated_by: updatedBy,
          updated_at: new Date().toISOString()
        })
        .eq('id', adminId)

      if (error) {
        return { success: false, error: 'Failed to update admin role' }
      }

      return { success: true }
    } catch (error) {
      console.error('Update admin role error:', error)
      return { success: false, error: 'Failed to update admin role' }
    }
  }

  /**
   * Deactivate admin user
   */
  async deactivateAdmin(
    adminId: string, 
    deactivatedBy: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = await createClient()

      const { error } = await supabase
        .from('admin_users')
        .update({
          is_active: false,
          deactivated_by: deactivatedBy,
          deactivated_at: new Date().toISOString()
        })
        .eq('id', adminId)

      if (error) {
        return { success: false, error: 'Failed to deactivate admin' }
      }

      return { success: true }
    } catch (error) {
      console.error('Deactivate admin error:', error)
      return { success: false, error: 'Failed to deactivate admin' }
    }
  }

  /**
   * Get all admin users
   */
  async getAllAdmins(): Promise<AdminUser[]> {
    try {
      const supabase = await createClient()

      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Get all admins error:', error)
        return []
      }

      return data.map(admin => ({
        id: admin.id,
        email: admin.email,
        role: admin.role,
        permissions: this.permissions.get(admin.role) || [],
        created_at: admin.created_at,
        last_login: admin.last_login,
        is_active: admin.is_active
      }))
    } catch (error) {
      console.error('Get all admins error:', error)
      return []
    }
  }

  /**
   * Logout admin user
   */
  async logout(): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = await createClient()
      const { error } = await supabase.auth.signOut()

      if (error) {
        return { success: false, error: 'Logout failed' }
      }

      return { success: true }
    } catch (error) {
      console.error('Admin logout error:', error)
      return { success: false, error: 'Logout failed' }
    }
  }
}

// Export singleton instance
export const adminAuthService = AdminAuthService.getInstance()

// Permission checking utilities
export const checkAdminPermission = (admin: AdminUser, resource: string, action: string): boolean => {
  return adminAuthService.hasPermission(admin, resource, action)
}

export const requireAdminPermission = (admin: AdminUser | null, resource: string, action: string): void => {
  if (!admin) {
    throw new Error('Authentication required')
  }
  
  if (!adminAuthService.hasPermission(admin, resource, action)) {
    throw new Error(`Permission denied: ${resource}:${action}`)
  }
}