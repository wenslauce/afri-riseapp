import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

// Server-side authentication utilities
export async function getUser(): Promise<User | null> {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    console.error('Error getting user:', error)
    return null
  }
  
  return user
}

export async function requireAuth(): Promise<User> {
  const user = await getUser()
  
  if (!user) {
    redirect('/')
  }
  
  return user
}

export async function signOut(): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    throw new Error(`Failed to sign out: ${error.message}`)
  }
  
  redirect('/')
}

// Authentication state management
export async function getSession() {
  const supabase = await createClient()
  
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error) {
    console.error('Error getting session:', error)
    return null
  }
  
  return session
}

// Email confirmation utilities
export async function confirmEmail(tokenHash: string, type: string) {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: type as any
  })
  
  if (error) {
    throw new Error(`Failed to confirm email: ${error.message}`)
  }
}

// Password reset utilities
export async function updateUserPassword(password: string) {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.updateUser({
    password
  })
  
  if (error) {
    throw new Error(`Failed to update password: ${error.message}`)
  }
}