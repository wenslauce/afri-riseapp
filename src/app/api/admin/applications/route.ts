import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { applicationManagementService } from '@/lib/admin/ApplicationManagement'

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

    // Create admin object for the service
    const admin = {
      id: adminUser.id,
      email: user.email!,
      role: adminUser.role,
      permissions: [],
      created_at: adminUser.created_at,
      is_active: adminUser.is_active
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    
    const filters = {
      status: searchParams.get('status')?.split(',') as any,
      country: searchParams.get('country')?.split(','),
      industry: searchParams.get('industry')?.split(','),
      amount_min: searchParams.get('amount_min') ? parseInt(searchParams.get('amount_min')!) : undefined,
      amount_max: searchParams.get('amount_max') ? parseInt(searchParams.get('amount_max')!) : undefined,
      date_from: searchParams.get('date_from') || undefined,
      date_to: searchParams.get('date_to') || undefined,
      search: searchParams.get('search') || undefined
    }

    // Remove undefined values
    Object.keys(filters).forEach(key => {
      if (filters[key as keyof typeof filters] === undefined) {
        delete filters[key as keyof typeof filters]
      }
    })

    const result = await applicationManagementService.getApplications(admin, filters, page, limit)

    return NextResponse.json({
      success: true,
      applications: result.applications,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages
    })
  } catch (error) {
    console.error('Get applications error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch applications' },
      { status: 500 }
    )
  }
}