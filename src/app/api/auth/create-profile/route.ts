import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { UserProfile } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the profile data from the request body
    const { userId, ...profileData } = await request.json()
    
    // If userId is provided, use it directly (for registration flow)
    if (userId) {
      // Use the database function to create the profile with elevated privileges
      const { data, error } = await supabase.rpc('create_user_profile', {
        user_id: userId,
        country_id: profileData.country_id,
        company_name: profileData.company_name,
        contact_person: profileData.contact_person,
        official_address: profileData.official_address,
        phone: profileData.phone
      })
      
      if (error) {
        console.error('Profile creation error:', error)
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        )
      }
      
      return NextResponse.json({
        success: true,
        profile: data
      })
    }
    
    // Fallback: Get the current user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 }
      )
    }
    
    // Create the user profile
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        id: user.id,
        ...profileData
      })
      .select()
      .single()
    
    if (error) {
      console.error('Profile creation error:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json({
      success: true,
      profile: data
    })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
