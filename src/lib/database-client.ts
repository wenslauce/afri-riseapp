'use client'

import { createClient } from '@/utils/supabase/client'
import { UserProfile } from '@/types'

// Client-side database operations for components
export async function createUserProfile(userId: string, profile: Omit<UserProfile, 'id' | 'email' | 'created_at' | 'updated_at'>): Promise<UserProfile> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('user_profiles')
    .insert({ id: userId, ...profile })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create user profile: ${error.message}`)
  }

  return data
}

// Get current user's profile (client-side)
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .select(`
      *,
      countries (
        id,
        name,
        code
      )
    `)
    .eq('id', user.id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw new Error(`Failed to fetch user profile: ${error.message}`)
  }

  return data
}

// Update user profile (client-side)
export async function updateCurrentUserProfile(profile: Partial<Omit<UserProfile, 'id' | 'email' | 'created_at' | 'updated_at'>>): Promise<UserProfile> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .update(profile)
    .eq('id', user.id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update user profile: ${error.message}`)
  }

  return data
}

// Update user profile by ID (client-side)
export async function updateUserProfile(userId: string, profile: Partial<Omit<UserProfile, 'id' | 'email' | 'created_at' | 'updated_at'>>): Promise<UserProfile> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('user_profiles')
    .update(profile)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update user profile: ${error.message}`)
  }

  return data
}
// Import additional types
import { Country, Application, DocumentUpload, PaymentRecord, NDASignature, ApplicationData } from '@/types'

// Country operations (client-side)
export async function getCountries(): Promise<Country[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('countries')
    .select('*')
    .order('name')

  if (error) {
    throw new Error(`Failed to fetch countries: ${error.message}`)
  }

  return data || []
}

export async function getCountryById(id: string): Promise<Country | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('countries')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw new Error(`Failed to fetch country: ${error.message}`)
  }

  return data
}

// Application operations (client-side)
export async function createApplication(application: Omit<Application, 'id' | 'created_at' | 'updated_at'>): Promise<Application> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('applications')
    .insert(application)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create application: ${error.message}`)
  }

  return data
}

export async function updateApplication(id: string, application: Partial<ApplicationData>): Promise<Application> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('applications')
    .update(application)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update application: ${error.message}`)
  }

  return data
}

// Document operations (client-side)
export async function createDocumentUpload(document: Omit<DocumentUpload, 'id' | 'uploaded_at'>): Promise<DocumentUpload> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('document_uploads')
    .insert(document)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create document upload: ${error.message}`)
  }

  return data
}

export async function deleteDocument(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('document_uploads')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to delete document: ${error.message}`)
  }
}

// Payment operations (client-side)
export async function createPaymentRecord(payment: Omit<PaymentRecord, 'id' | 'created_at'>): Promise<PaymentRecord> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('payment_records')
    .insert(payment)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create payment record: ${error.message}`)
  }

  return data
}

export async function updatePaymentRecord(id: string, payment: Partial<PaymentRecord>): Promise<PaymentRecord> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('payment_records')
    .update(payment)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update payment record: ${error.message}`)
  }

  return data
}

export async function updatePaymentRecordByReference(gatewayTransactionId: string, payment: Partial<PaymentRecord>): Promise<PaymentRecord> {
  const supabase = createClient()

  console.log(`Looking for payment record with gateway_transaction_id: ${gatewayTransactionId}`)

  // First check if the record exists
  const { data: existingRecord, error: findError } = await supabase
    .from('payment_records')
    .select('*')
    .eq('gateway_transaction_id', gatewayTransactionId)
    .single()

  if (findError) {
    console.error('Failed to find payment record:', findError)
    throw new Error(`Failed to find payment record with gateway_transaction_id: ${gatewayTransactionId}. Error: ${findError.message}`)
  }

  if (!existingRecord) {
    throw new Error(`No payment record found with gateway_transaction_id: ${gatewayTransactionId}`)
  }

  console.log('Found existing record:', existingRecord)

  // Now update the record
  const { data, error } = await supabase
    .from('payment_records')
    .update(payment)
    .eq('gateway_transaction_id', gatewayTransactionId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update payment record: ${error.message}`)
  }

  console.log('Payment record updated successfully:', data)
  return data
}

export async function getPaymentsByApplicationId(applicationId: string): Promise<PaymentRecord[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('payment_records')
    .select('*')
    .eq('application_id', applicationId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch payments: ${error.message}`)
  }

  return data || []
}

// NDA signature operations (client-side)
export async function createNDASignature(signature: Omit<NDASignature, 'id' | 'signed_at'>): Promise<NDASignature> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('nda_signatures')
    .insert(signature)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create NDA signature: ${error.message}`)
  }

  // Update application status after NDA is signed
  try {
    const response = await fetch('/api/applications/update-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        applicationId: signature.application_id,
        trigger: 'nda_signed'
      })
    })
    
    if (!response.ok) {
      console.warn('Failed to update application status after NDA signing')
    }
  } catch (error) {
    console.warn('Error updating application status after NDA signing:', error)
  }

  return data
}