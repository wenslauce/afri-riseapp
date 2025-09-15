import { createClient } from '@/utils/supabase/server'
import { Country, UserProfile, Application, DocumentUpload, PaymentRecord, NDASignature } from '@/types'

// Country operations
export async function getCountries(): Promise<Country[]> {
  const supabase = await createClient()
  
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
  const supabase = await createClient()
  
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

// User profile operations
export async function createUserProfile(userId: string, profile: Omit<UserProfile, 'id' | 'email' | 'created_at' | 'updated_at'>): Promise<UserProfile> {
  const supabase = await createClient()
  
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

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select(`
      *,
      countries (
        id,
        name,
        code,
        document_requirements
      )
    `)
    .eq('id', userId)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw new Error(`Failed to fetch user profile: ${error.message}`)
  }
  
  return data
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  
  if (error) {
    throw new Error(`Failed to update user profile: ${error.message}`)
  }
  
  return data
}

// Application operations
export async function createApplication(application: Omit<Application, 'id' | 'created_at' | 'updated_at'>): Promise<Application> {
  const supabase = await createClient()
  
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

export async function getApplicationsByUserId(userId: string): Promise<Application[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) {
    throw new Error(`Failed to fetch applications: ${error.message}`)
  }
  
  return data || []
}

export async function getApplicationById(id: string): Promise<Application | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw new Error(`Failed to fetch application: ${error.message}`)
  }
  
  return data
}

export async function updateApplication(id: string, updates: Partial<Application>): Promise<Application> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('applications')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    throw new Error(`Failed to update application: ${error.message}`)
  }
  
  return data
}

// Document operations
export async function createDocumentUpload(document: Omit<DocumentUpload, 'id' | 'uploaded_at'>): Promise<DocumentUpload> {
  const supabase = await createClient()
  
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

export async function getDocumentsByApplicationId(applicationId: string): Promise<DocumentUpload[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('document_uploads')
    .select('*')
    .eq('application_id', applicationId)
    .order('uploaded_at', { ascending: true })
  
  if (error) {
    throw new Error(`Failed to fetch documents: ${error.message}`)
  }
  
  return data || []
}

export async function deleteDocument(id: string): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('document_uploads')
    .delete()
    .eq('id', id)
  
  if (error) {
    throw new Error(`Failed to delete document: ${error.message}`)
  }
}

// Payment operations
export async function createPaymentRecord(payment: Omit<PaymentRecord, 'id' | 'created_at'>): Promise<PaymentRecord> {
  const supabase = await createClient()
  
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

export async function getPaymentsByApplicationId(applicationId: string): Promise<PaymentRecord[]> {
  const supabase = await createClient()
  
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

export async function updatePaymentRecord(id: string, updates: Partial<PaymentRecord>): Promise<PaymentRecord> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('payment_records')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    throw new Error(`Failed to update payment record: ${error.message}`)
  }
  
  return data
}

export async function updatePaymentRecordByReference(gatewayTransactionId: string, updates: Partial<PaymentRecord>): Promise<PaymentRecord> {
  const supabase = await createClient()
  
  console.log(`[SERVER] Looking for payment record with gateway_transaction_id: ${gatewayTransactionId}`)

  // First check if the record exists
  const { data: existingRecord, error: findError } = await supabase
    .from('payment_records')
    .select('*')
    .eq('gateway_transaction_id', gatewayTransactionId)
    .single()

  if (findError) {
    console.error('[SERVER] Failed to find payment record:', findError)
    throw new Error(`Failed to find payment record with gateway_transaction_id: ${gatewayTransactionId}. Error: ${findError.message}`)
  }

  if (!existingRecord) {
    throw new Error(`No payment record found with gateway_transaction_id: ${gatewayTransactionId}`)
  }

  console.log('[SERVER] Found existing record:', existingRecord)

  // Now update the record
  const { data, error } = await supabase
    .from('payment_records')
    .update(updates)
    .eq('gateway_transaction_id', gatewayTransactionId)
    .select()
    .single()
  
  if (error) {
    throw new Error(`Failed to update payment record: ${error.message}`)
  }
  
  console.log('[SERVER] Payment record updated successfully:', data)
  return data
}

export async function getPaymentsByGatewayTransactionId(gatewayTransactionId: string): Promise<PaymentRecord[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('payment_records')
    .select('*')
    .eq('gateway_transaction_id', gatewayTransactionId)
    .order('created_at', { ascending: false })
  
  if (error) {
    throw new Error(`Failed to fetch payments by gateway transaction ID: ${error.message}`)
  }
  
  return data || []
}

// NDA signature operations
export async function createNDASignature(signature: Omit<NDASignature, 'id' | 'signed_at'>): Promise<NDASignature> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('nda_signatures')
    .insert(signature)
    .select()
    .single()
  
  if (error) {
    throw new Error(`Failed to create NDA signature: ${error.message}`)
  }
  
  return data
}

export async function getNDASignatureByApplicationId(applicationId: string): Promise<NDASignature | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('nda_signatures')
    .select('*')
    .eq('application_id', applicationId)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw new Error(`Failed to fetch NDA signature: ${error.message}`)
  }
  
  return data
}

// Additional user-specific query functions for dashboard
export async function getPaymentsByUserId(userId: string): Promise<PaymentRecord[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('payment_records')
    .select('*')
    .eq('application_id', userId) // This should join with applications table
    .order('created_at', { ascending: false })
  
  if (error) {
    throw new Error(`Failed to fetch payments by user ID: ${error.message}`)
  }
  
  return data || []
}

export async function getDocumentsByUserId(userId: string): Promise<DocumentUpload[]> {
  const supabase = await createClient()
  
  // Get documents through applications
  const { data, error } = await supabase
    .from('document_uploads')
    .select(`
      *,
      applications!inner(user_id)
    `)
    .eq('applications.user_id', userId)
    .order('uploaded_at', { ascending: false })
  
  if (error) {
    throw new Error(`Failed to fetch documents by user ID: ${error.message}`)
  }
  
  return data || []
}

export async function getNDASignaturesByUserId(userId: string): Promise<NDASignature[]> {
  const supabase = await createClient()
  
  // Get signatures through applications
  const { data, error } = await supabase
    .from('nda_signatures')
    .select(`
      *,
      applications!inner(user_id)
    `)
    .eq('applications.user_id', userId)
    .order('signed_at', { ascending: false })
  
  if (error) {
    throw new Error(`Failed to fetch NDA signatures by user ID: ${error.message}`)
  }
  
  return data || []
}