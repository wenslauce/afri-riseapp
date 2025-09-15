import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user from auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is an admin
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (adminError || !adminUser) {
      return NextResponse.json(
        { success: false, error: 'Admin not found' },
        { status: 404 }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || undefined
    const country = searchParams.get('country') || undefined

    // Build query
    let query = supabase
      .from('user_profiles')
      .select(`
        id,
        company_name,
        contact_person,
        phone,
        official_address,
        created_at,
        updated_at,
        country_id,
        country:countries(name)
      `, { count: 'exact' })

    // Apply filters
    if (search) {
      query = query.or(`company_name.ilike.%${search}%,contact_person.ilike.%${search}%,phone.ilike.%${search}%`)
    }

    if (country) {
      query = query.eq('country_id', country)
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    // Order by creation date
    query = query.order('created_at', { ascending: false })

    const { data: users, error: usersError, count } = await query

    if (usersError) {
      console.error('Error fetching users:', usersError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch users' },
        { status: 500 }
      )
    }

    // Get total pages
    const totalPages = Math.ceil((count || 0) / limit)

    return NextResponse.json({
      success: true,
      users: users || [],
      total: count || 0,
      page,
      limit,
      totalPages
    })
  } catch (error) {
    console.error('Users API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user from auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is an admin
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (adminError || !adminUser) {
      return NextResponse.json(
        { success: false, error: 'Admin not found' },
        { status: 404 }
      )
    }

    // Only super admins can create users
    if (adminUser.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { email, password, role = 'admin' } = body

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Create auth user
    const { data: authData, error: authCreateError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    if (authCreateError || !authData.user) {
      console.error('Error creating auth user:', authCreateError)
      return NextResponse.json(
        { success: false, error: 'Failed to create user' },
        { status: 500 }
      )
    }

    // Create admin user record
    const { data: adminData, error: adminCreateError } = await supabase
      .from('admin_users')
      .insert({
        user_id: authData.user.id,
        email: email,
        role: role,
        is_active: true,
        created_by: adminUser.id
      })
      .select()
      .single()

    if (adminCreateError) {
      console.error('Error creating admin user:', adminCreateError)
      // Try to clean up the auth user
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { success: false, error: 'Failed to create admin user' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      user: adminData
    })
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
