/**
 * Client-side Admin Application Management Service
 */

import { ApplicationWithDetails, ApplicationFilters, ApplicationStats } from './ApplicationManagement'

export class ApplicationManagementClient {
  private static instance: ApplicationManagementClient

  static getInstance(): ApplicationManagementClient {
    if (!ApplicationManagementClient.instance) {
      ApplicationManagementClient.instance = new ApplicationManagementClient()
    }
    return ApplicationManagementClient.instance
  }

  /**
   * Get all applications with details
   */
  async getAllApplications(filters?: ApplicationFilters): Promise<ApplicationWithDetails[]> {
    try {
      const queryParams = new URLSearchParams()
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value.toString())
          }
        })
      }

      const response = await fetch(`/api/admin/applications?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch applications')
      }

      const result = await response.json()
      return result.applications || []
    } catch (error) {
      console.error('Error fetching applications:', error)
      return []
    }
  }

  /**
   * Get application by ID
   */
  async getApplicationById(id: string): Promise<ApplicationWithDetails | null> {
    try {
      const response = await fetch(`/api/admin/applications/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        throw new Error('Failed to fetch application')
      }

      const result = await response.json()
      return result.application
    } catch (error) {
      console.error('Error fetching application:', error)
      return null
    }
  }

  /**
   * Update application status
   */
  async updateApplicationStatus(
    id: string, 
    status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected',
    notes?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`/api/admin/applications/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, notes })
      })

      const result = await response.json()

      if (!response.ok) {
        return { success: false, error: result.error || 'Failed to update status' }
      }

      return { success: true }
    } catch (error) {
      console.error('Error updating application status:', error)
      return { success: false, error: 'Failed to update status' }
    }
  }

  /**
   * Add review note to application
   */
  async addReviewNote(
    applicationId: string, 
    note: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`/api/admin/applications/${applicationId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ note })
      })

      const result = await response.json()

      if (!response.ok) {
        return { success: false, error: result.error || 'Failed to add note' }
      }

      return { success: true }
    } catch (error) {
      console.error('Error adding review note:', error)
      return { success: false, error: 'Failed to add note' }
    }
  }

  /**
   * Get application statistics
   */
  async getApplicationStats(): Promise<ApplicationStats | null> {
    try {
      const response = await fetch('/api/admin/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch statistics')
      }

      const result = await response.json()
      return result.stats
    } catch (error) {
      console.error('Error fetching statistics:', error)
      return null
    }
  }

  /**
   * Export applications data
   */
  async exportApplications(filters?: ApplicationFilters): Promise<Blob | null> {
    try {
      const queryParams = new URLSearchParams()
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value.toString())
          }
        })
      }

      const response = await fetch(`/api/admin/applications/export?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error('Failed to export applications')
      }

      return await response.blob()
    } catch (error) {
      console.error('Error exporting applications:', error)
      return null
    }
  }
}

// Export singleton instance
export const applicationManagementClient = ApplicationManagementClient.getInstance()
