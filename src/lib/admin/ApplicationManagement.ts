/**
 * Admin Application Management Service
 */

import { createClient } from '@/utils/supabase/server'
import { Application, UserProfile, DocumentUpload, PaymentRecord, NDASignature } from '@/types'
import { AdminUser, checkAdminPermission } from './AdminAuth'
import { emailService } from '@/lib/email/EmailService'

export interface ApplicationWithDetails extends Application {
  user_profile: UserProfile
  documents: DocumentUpload[]
  payments: PaymentRecord[]
  nda_signature?: NDASignature
  review_notes?: ApplicationReviewNote[]
}

export interface ApplicationReviewNote {
  id: string
  application_id: string
  admin_id: string
  admin_email: string
  note: string
  note_type: 'info' | 'warning' | 'approval' | 'rejection'
  created_at: string
}

export interface ApplicationStatusUpdate {
  status: Application['status']
  reason?: string
  admin_notes?: string
}

export interface ApplicationFilters {
  status?: Application['status'][]
  country?: string[]
  industry?: string[]
  amount_min?: number
  amount_max?: number
  date_from?: string
  date_to?: string
  search?: string
}

export interface ApplicationStats {
  total: number
  by_status: Record<Application['status'], number>
  by_country: Record<string, number>
  by_industry: Record<string, number>
  average_amount: number
  total_amount: number
  approval_rate: number
  processing_time_avg: number
}

export class ApplicationManagementService {
  private static instance: ApplicationManagementService

  static getInstance(): ApplicationManagementService {
    if (!ApplicationManagementService.instance) {
      ApplicationManagementService.instance = new ApplicationManagementService()
    }
    return ApplicationManagementService.instance
  }

  /**
   * Get all applications with filters and pagination
   */
  async getApplications(
    admin: AdminUser,
    filters: ApplicationFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<{
    applications: ApplicationWithDetails[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    checkAdminPermission(admin, 'applications', 'read')

    try {
      const supabase = await createClient()
      const offset = (page - 1) * limit

      let query = supabase
        .from('applications')
        .select(`
          *,
          user_profile:user_profiles!applications_user_id_fkey(*),
          documents:document_uploads!document_uploads_application_id_fkey(*),
          payments:payment_records!payment_records_application_id_fkey(*),
          nda_signature:nda_signatures!nda_signatures_application_id_fkey(*)
        `)

      // Apply filters
      if (filters.status && filters.status.length > 0) {
        query = query.in('status', filters.status)
      }

      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from)
      }

      if (filters.date_to) {
        query = query.lte('created_at', filters.date_to)
      }

      if (filters.amount_min) {
        query = query.gte('application_data->financing_amount', filters.amount_min)
      }

      if (filters.amount_max) {
        query = query.lte('application_data->financing_amount', filters.amount_max)
      }

      if (filters.industry && filters.industry.length > 0) {
        query = query.in('application_data->industry', filters.industry)
      }

      // Get total count
      const { count } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })

      // Get paginated results
      const { data, error } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        throw error
      }

      // Filter by country if specified
      let applications = data || []
      if (filters.country && filters.country.length > 0) {
        applications = applications.filter(app => 
          filters.country!.includes(app.user_profile?.country_id)
        )
      }

      // Apply search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        applications = applications.filter(app => 
          app.user_profile?.company_name?.toLowerCase().includes(searchTerm) ||
          app.user_profile?.contact_person?.toLowerCase().includes(searchTerm) ||
          app.user_profile?.email?.toLowerCase().includes(searchTerm) ||
          app.id.toLowerCase().includes(searchTerm)
        )
      }

      // Get review notes for each application
      const applicationsWithNotes = await Promise.all(
        applications.map(async (app) => {
          const notes = await this.getApplicationNotes(app.id)
          return {
            ...app,
            review_notes: notes
          }
        })
      )

      return {
        applications: applicationsWithNotes,
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      }
    } catch (error) {
      console.error('Get applications error:', error)
      throw new Error('Failed to fetch applications')
    }
  }

  /**
   * Get single application with full details
   */
  async getApplicationById(admin: AdminUser, applicationId: string): Promise<ApplicationWithDetails | null> {
    checkAdminPermission(admin, 'applications', 'read')

    try {
      const supabase = await createClient()

      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          user_profile:user_profiles!applications_user_id_fkey(*),
          documents:document_uploads!document_uploads_application_id_fkey(*),
          payments:payment_records!payment_records_application_id_fkey(*),
          nda_signature:nda_signatures!nda_signatures_application_id_fkey(*)
        `)
        .eq('id', applicationId)
        .single()

      if (error || !data) {
        return null
      }

      // Get review notes
      const notes = await this.getApplicationNotes(applicationId)

      return {
        ...data,
        review_notes: notes
      }
    } catch (error) {
      console.error('Get application by ID error:', error)
      return null
    }
  }

  /**
   * Update application status
   */
  async updateApplicationStatus(
    admin: AdminUser,
    applicationId: string,
    statusUpdate: ApplicationStatusUpdate
  ): Promise<{ success: boolean; error?: string }> {
    checkAdminPermission(admin, 'applications', 'approve')

    try {
      const supabase = await createClient()

      // Get current application
      const application = await this.getApplicationById(admin, applicationId)
      if (!application) {
        return { success: false, error: 'Application not found' }
      }

      // Update application status
      const { error: updateError } = await supabase
        .from('applications')
        .update({
          status: statusUpdate.status,
          updated_at: new Date().toISOString(),
          ...(statusUpdate.status === 'approved' && { approved_at: new Date().toISOString() }),
          ...(statusUpdate.status === 'rejected' && { rejected_at: new Date().toISOString() })
        })
        .eq('id', applicationId)

      if (updateError) {
        throw updateError
      }

      // Add review note
      if (statusUpdate.admin_notes || statusUpdate.reason) {
        await this.addApplicationNote(admin, applicationId, {
          note: statusUpdate.admin_notes || statusUpdate.reason || `Status changed to ${statusUpdate.status}`,
          note_type: statusUpdate.status === 'approved' ? 'approval' : 
                    statusUpdate.status === 'rejected' ? 'rejection' : 'info'
        })
      }

      // Send notification email
      await this.sendStatusUpdateEmail(application, statusUpdate.status, statusUpdate.reason)

      return { success: true }
    } catch (error) {
      console.error('Update application status error:', error)
      return { success: false, error: 'Failed to update application status' }
    }
  }

  /**
   * Add review note to application
   */
  async addApplicationNote(
    admin: AdminUser,
    applicationId: string,
    note: {
      note: string
      note_type: ApplicationReviewNote['note_type']
    }
  ): Promise<{ success: boolean; error?: string }> {
    checkAdminPermission(admin, 'applications', 'read')

    try {
      const supabase = await createClient()

      const { error } = await supabase
        .from('application_review_notes')
        .insert({
          application_id: applicationId,
          admin_id: admin.id,
          admin_email: admin.email,
          note: note.note,
          note_type: note.note_type,
          created_at: new Date().toISOString()
        })

      if (error) {
        throw error
      }

      return { success: true }
    } catch (error) {
      console.error('Add application note error:', error)
      return { success: false, error: 'Failed to add note' }
    }
  }

  /**
   * Get application review notes
   */
  async getApplicationNotes(applicationId: string): Promise<ApplicationReviewNote[]> {
    try {
      const supabase = await createClient()

      const { data, error } = await supabase
        .from('application_review_notes')
        .select('*')
        .eq('application_id', applicationId)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Get application notes error:', error)
      return []
    }
  }

  /**
   * Get application statistics
   */
  async getApplicationStats(
    admin: AdminUser,
    filters: ApplicationFilters = {}
  ): Promise<ApplicationStats> {
    checkAdminPermission(admin, 'analytics', 'read')

    try {
      const supabase = await createClient()

      let query = supabase
        .from('applications')
        .select(`
          *,
          user_profile:user_profiles!applications_user_id_fkey(country_id)
        `)

      // Apply same filters as getApplications
      if (filters.status && filters.status.length > 0) {
        query = query.in('status', filters.status)
      }

      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from)
      }

      if (filters.date_to) {
        query = query.lte('created_at', filters.date_to)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      const applications = data || []

      // Calculate statistics
      const stats: ApplicationStats = {
        total: applications.length,
        by_status: {
          draft: 0,
          submitted: 0,
          under_review: 0,
          approved: 0,
          rejected: 0
        },
        by_country: {},
        by_industry: {},
        average_amount: 0,
        total_amount: 0,
        approval_rate: 0,
        processing_time_avg: 0
      }

      let totalAmount = 0
      let approvedCount = 0
      let processingTimes: number[] = []

      applications.forEach(app => {
        // Status distribution
        if (app.status in stats.by_status) {
          stats.by_status[app.status as keyof typeof stats.by_status]++
        }

        // Country distribution
        const country = app.user_profile?.country_id || 'Unknown'
        stats.by_country[country] = (stats.by_country[country] || 0) + 1

        // Industry distribution
        const industry = app.application_data?.industry || 'Unknown'
        stats.by_industry[industry] = (stats.by_industry[industry] || 0) + 1

        // Amount calculations
        const amount = app.application_data?.financing_amount || 0
        totalAmount += amount

        // Approval rate
        if (app.status === 'approved') {
          approvedCount++
        }

        // Processing time (for completed applications)
        if (app.status === 'approved' || app.status === 'rejected') {
          const created = new Date(app.created_at)
          const completed = new Date(app.approved_at || app.rejected_at || app.updated_at)
          const processingTime = (completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24) // days
          processingTimes.push(processingTime)
        }
      })

      stats.total_amount = totalAmount
      stats.average_amount = applications.length > 0 ? totalAmount / applications.length : 0
      stats.approval_rate = applications.length > 0 ? (approvedCount / applications.length) * 100 : 0
      stats.processing_time_avg = processingTimes.length > 0 
        ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length 
        : 0

      return stats
    } catch (error) {
      console.error('Get application stats error:', error)
      throw new Error('Failed to fetch application statistics')
    }
  }

  /**
   * Export applications data
   */
  async exportApplications(
    admin: AdminUser,
    filters: ApplicationFilters = {},
    format: 'csv' | 'json' = 'csv'
  ): Promise<{ success: boolean; data?: string; error?: string }> {
    checkAdminPermission(admin, 'analytics', 'export')

    try {
      const { applications } = await this.getApplications(admin, filters, 1, 10000) // Get all

      if (format === 'json') {
        return {
          success: true,
          data: JSON.stringify(applications, null, 2)
        }
      }

      // CSV format
      const headers = [
        'Application ID',
        'Company Name',
        'Contact Person',
        'Email',
        'Country',
        'Industry',
        'Financing Amount',
        'Status',
        'Created At',
        'Updated At'
      ]

      const rows = applications.map(app => [
        app.id,
        app.user_profile?.company_name || '',
        app.user_profile?.contact_person || '',
        app.user_profile?.email || '',
        app.user_profile?.country_id || '',
        app.application_data?.industry || '',
        app.application_data?.financing_amount || 0,
        app.status,
        app.created_at,
        app.updated_at
      ])

      const csvContent = [headers, ...rows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n')

      return {
        success: true,
        data: csvContent
      }
    } catch (error) {
      console.error('Export applications error:', error)
      return { success: false, error: 'Failed to export applications' }
    }
  }

  /**
   * Send status update email to user
   */
  private async sendStatusUpdateEmail(
    application: ApplicationWithDetails,
    newStatus: Application['status'],
    reason?: string
  ): Promise<void> {
    try {
      switch (newStatus) {
        case 'approved':
          await emailService.sendApplicationApprovedEmail(application, application.user_profile)
          break
        case 'rejected':
          await emailService.sendApplicationRejectedEmail(application, application.user_profile, reason)
          break
        case 'under_review':
          // Could send a "under review" email if needed
          break
      }
    } catch (error) {
      console.error('Send status update email error:', error)
      // Don't throw error as this is not critical
    }
  }

  /**
   * Get recent activity for dashboard
   */
  async getRecentActivity(admin: AdminUser, limit: number = 10): Promise<any[]> {
    checkAdminPermission(admin, 'applications', 'read')

    try {
      const supabase = await createClient()

      // Get recent applications
      const { data: recentApps, error: appsError } = await supabase
        .from('applications')
        .select(`
          id,
          status,
          created_at,
          updated_at,
          user_profile:user_profiles!applications_user_id_fkey(*)
        `)
        .order('updated_at', { ascending: false })
        .limit(limit)

      if (appsError) {
        throw appsError
      }

      // Get recent review notes
      const { data: recentNotes, error: notesError } = await supabase
        .from('application_review_notes')
        .select(`
          *,
          application:applications(
            id,
            user_profile:user_profiles!applications_user_id_fkey(*)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (notesError) {
        throw notesError
      }

      // Combine and sort activities
      const activities = [
        ...(recentApps || []).map(app => ({
          type: 'application_update',
          id: app.id,
          title: `Application ${app.status}`,
          description: `${(app.user_profile as any)?.company_name || 'Unknown Company'} - Status: ${app.status}`,
          timestamp: app.updated_at,
          data: app
        })),
        ...(recentNotes || []).map(note => ({
          type: 'review_note',
          id: note.id,
          title: `Review note added`,
          description: `${(note.application?.user_profile as any)?.company_name || 'Unknown Company'} - ${note.note_type}`,
          timestamp: note.created_at,
          data: note
        }))
      ]

      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit)
    } catch (error) {
      console.error('Get recent activity error:', error)
      return []
    }
  }
}

// Export singleton instance
export const applicationManagementService = ApplicationManagementService.getInstance()