import { createClient } from '@/utils/supabase/server'

/**
 * Updates application status based on completion of various steps
 */
export async function updateApplicationStatusOnCompletion(applicationId: string): Promise<void> {
  try {
    const supabase = await createClient()
    
    // Get current application status and related records
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select('id, status')
      .eq('id', applicationId)
      .single()
    
    if (appError || !application) {
      console.error('Failed to fetch application:', appError)
      return
    }
    
    // Don't update if already submitted or beyond
    if (['submitted', 'under_review', 'approved', 'rejected'].includes(application.status)) {
      return
    }
    
    // Check if payment is completed
    const { data: paymentRecord } = await supabase
      .from('payment_records')
      .select('status')
      .eq('application_id', applicationId)
      .eq('status', 'completed')
      .single()
    
    // Check if NDA is signed
    const { data: ndaSignature } = await supabase
      .from('nda_signatures')
      .select('id')
      .eq('application_id', applicationId)
      .single()
    
    // Determine new status based on completion
    let newStatus = application.status
    
    if (paymentRecord && ndaSignature) {
      // Both payment and NDA completed - mark as submitted
      newStatus = 'submitted'
    } else if (paymentRecord) {
      // Payment completed but NDA not signed yet - keep as draft but updated
      newStatus = 'draft'
    }
    
    // Update application status if it changed
    if (newStatus !== application.status) {
      const { error: updateError } = await supabase
        .from('applications')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId)
      
      if (updateError) {
        console.error('Failed to update application status:', updateError)
      } else {
        console.log(`Application ${applicationId} status updated to ${newStatus}`)
      }
    } else {
      // Even if status didn't change, update the timestamp
      const { error: updateError } = await supabase
        .from('applications')
        .update({ 
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId)
      
      if (updateError) {
        console.error('Failed to update application timestamp:', updateError)
      }
    }
    
  } catch (error) {
    console.error('Error updating application status:', error)
  }
}

/**
 * Updates application status when payment is completed
 */
export async function updateApplicationStatusOnPayment(applicationId: string): Promise<void> {
  await updateApplicationStatusOnCompletion(applicationId)
}

/**
 * Updates application status when NDA is signed
 */
export async function updateApplicationStatusOnNDA(applicationId: string): Promise<void> {
  await updateApplicationStatusOnCompletion(applicationId)
}
