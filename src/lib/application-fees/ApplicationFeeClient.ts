'use client'

import { createClient } from '@/utils/supabase/client'

export interface ApplicationFee {
  id: string
  fee_type: string
  amount_usd: number
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  created_by: string | null
  updated_by: string | null
}

export class ApplicationFeeClient {
  private supabase = createClient()

  /**
   * Get the current application fee amount (client-side)
   */
  async getApplicationFee(paymentMode: 'test' | 'live' = 'test'): Promise<number> {
    try {
      const response = await fetch(`/api/application-fee?mode=${paymentMode}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (!result.success) {
        console.error('Failed to fetch application fee:', result.error)
        return 300.00
      }

      return result.fee || 300.00
    } catch (error) {
      console.error('Failed to fetch application fee:', error)
      // Return default fee if API call fails
      return 300.00
    }
  }

  /**
   * Get all application fees (admin only)
   */
  async getAllFees(): Promise<ApplicationFee[]> {
    try {
      const response = await fetch('/api/admin/application-fees', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch application fees')
      }

      return result.fees || []
    } catch (error) {
      throw new Error(`Failed to fetch application fees: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

// Export singleton instance
export const applicationFeeClient = new ApplicationFeeClient()
