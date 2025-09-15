import { createClient } from '@/utils/supabase/server'

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

export class ApplicationFeeService {
  private async getSupabaseClient() {
    return await createClient()
  }

  /**
   * Get the current application fee amount
   */
  async getApplicationFee(paymentMode: 'test' | 'live' = 'test'): Promise<number> {
    const supabase = await this.getSupabaseClient()
    const { data, error } = await supabase
      .from('application_fees')
      .select('amount_usd')
      .eq('fee_type', 'application_fee')
      .eq('is_active', true)
      .eq('payment_mode', paymentMode)
      .single()

    if (error) {
      console.error('Failed to fetch application fee:', error)
      // Return default fee if database query fails
      return 300.00
    }

    return data?.amount_usd || 300.00
  }

  /**
   * Get all application fees (admin only)
   */
  async getAllFees(): Promise<ApplicationFee[]> {
    const supabase = await this.getSupabaseClient()
    const { data, error } = await supabase
      .from('application_fees')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch application fees: ${error.message}`)
    }

    return data || []
  }

  /**
   * Update application fee (super admin only)
   */
  async updateApplicationFee(amount: number, description?: string, paymentMode: 'test' | 'live' = 'test'): Promise<ApplicationFee> {
    const supabase = await this.getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    // First, deactivate all current active fees
    const { error: deactivateError } = await supabase
      .from('application_fees')
      .update({
        is_active: false,
        updated_by: user.id
      })
      .eq('is_active', true)

    if (deactivateError) {
      throw new Error(`Failed to deactivate current fees: ${deactivateError.message}`)
    }

    // Then, create a new fee entry
    const { data, error } = await supabase
      .from('application_fees')
      .insert({
        fee_type: 'application_fee',
        amount_usd: amount,
        description: description || 'Application processing fee',
        is_active: true,
        payment_mode: paymentMode,
        created_by: user.id,
        updated_by: user.id
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update application fee: ${error.message}`)
    }

    return data
  }

  /**
   * Create a new fee type (super admin only)
   */
  async createFee(feeType: string, amount: number, description: string): Promise<ApplicationFee> {
    const supabase = await this.getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('application_fees')
      .insert({
        fee_type: feeType,
        amount_usd: amount,
        description,
        is_active: true,
        created_by: user.id,
        updated_by: user.id
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create application fee: ${error.message}`)
    }

    return data
  }

  /**
   * Update payment mode for all active fees (super admin only)
   */
  async updatePaymentMode(paymentMode: 'test' | 'live'): Promise<ApplicationFee> {
    const supabase = await this.getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    // First, deactivate all current active fees
    const { error: deactivateError } = await supabase
      .from('application_fees')
      .update({
        is_active: false,
        updated_by: user.id
      })
      .eq('is_active', true)

    if (deactivateError) {
      throw new Error(`Failed to deactivate current fees: ${deactivateError.message}`)
    }

    // Then, create a new fee entry for the new payment mode
    const { data, error } = await supabase
      .from('application_fees')
      .insert({
        fee_type: 'application_fee',
        amount_usd: 300.00, // Default amount
        description: 'Application processing fee',
        is_active: true,
        payment_mode: paymentMode,
        created_by: user.id,
        updated_by: user.id
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update payment mode: ${error.message}`)
    }

    return data
  }

  /**
   * Deactivate a fee (super admin only)
   */
  async deactivateFee(feeId: string): Promise<void> {
    const supabase = await this.getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { error } = await supabase
      .from('application_fees')
      .update({
        is_active: false,
        updated_by: user.id
      })
      .eq('id', feeId)

    if (error) {
      throw new Error(`Failed to deactivate application fee: ${error.message}`)
    }
  }
}

// Export singleton instance
export const applicationFeeService = new ApplicationFeeService()
