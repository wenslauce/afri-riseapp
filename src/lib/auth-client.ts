'use client'

import { createClient } from '@/utils/supabase/client'

// Client-side authentication utilities
export function useSupabaseAuth() {
  const supabase = createClient()
  
  const signUp = async (email: string, password: string, metadata?: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    
    if (error) {
      throw new Error(error.message)
    }
    
    return data
  }
  
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) {
      throw new Error(error.message)
    }
    
    return data
  }
  
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      throw new Error(error.message)
    }
  }
  
  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })
    
    if (error) {
      throw new Error(error.message)
    }
  }
  
  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({
      password
    })
    
    if (error) {
      throw new Error(error.message)
    }
  }
  
  return {
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    supabase
  }
}

// Get current user client-side
export async function getCurrentUser() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    console.error('Error getting user:', error)
    return null
  }
  
  return user
}

// Get current session client-side
export async function getCurrentSession() {
  const supabase = createClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error) {
    console.error('Error getting session:', error)
    return null
  }
  
  return session
}