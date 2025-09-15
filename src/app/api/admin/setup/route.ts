import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// This endpoint is for initial setup only - should be disabled in production
export async function POST(request: NextRequest) {
  try {
    // Only allow in development mode
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { success: false, error: 'This endpoint is disabled in production' },
        { status: 403 }
      )
    }

    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check if any admin users already exist
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: existingAdmins, error: checkError } = await supabase
      .from('admin_users')
      .select('id')
      .limit(1)

    if (checkError) {
      console.error('Error checking existing admins:', checkError)
      return NextResponse.json(
        { success: false, error: 'Failed to check existing admins' },
        { status: 500 }
      )
    }

    if (existingAdmins && existingAdmins.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Admin users already exist. Use the admin panel to create new admins.' },
        { status: 400 }
      )
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { success: false, error: 'Failed to create user account' },
        { status: 400 }
      )
    }

    // Create admin record
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .insert({
        user_id: authData.user.id,
        email,
        role: 'super_admin',
        is_active: true,
        created_by: null, // First admin user, no creator
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (adminError) {
      console.error('Admin creation error:', adminError)
      // Cleanup: delete the auth user if admin creation failed
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { success: false, error: 'Failed to create admin record' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Super admin created successfully',
      admin: {
        id: adminData.id,
        email: adminData.email,
        role: adminData.role
      }
    })

  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
