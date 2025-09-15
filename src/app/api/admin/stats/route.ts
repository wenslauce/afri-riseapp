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

    // Get application statistics using a simpler approach
    console.log('Querying applications table...')
    const { data: applications, error: appsError } = await supabase
      .from('applications')
      .select(`
        id,
        status,
        application_data,
        created_at,
        user_id
      `)
    
    console.log('Applications query result:', { applications, appsError, count: applications?.length })

    if (appsError) {
      console.error('Error fetching applications:', appsError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch applications' },
        { status: 500 }
      )
    }

    // Calculate statistics
    const total = applications?.length || 0
    const byStatus = {
      draft: 0,
      submitted: 0,
      under_review: 0,
      approved: 0,
      rejected: 0
    }

    // Get user profiles for the applications
    const userIds = applications?.map(app => app.user_id) || []
    const { data: userProfiles } = await supabase
      .from('user_profiles')
      .select('id, company_name, country_id')
      .in('id', userIds)

    // Get country information
    const { data: countries } = await supabase
      .from('countries')
      .select('id, name')

    const countryMap = new Map(countries?.map(c => [c.id, c.name]) || [])
    const userProfileMap = new Map(userProfiles?.map(up => [up.id, up]) || [])

    const byCountry: Record<string, number> = {}
    const byIndustry: Record<string, number> = {}
    let totalAmount = 0
    let approvedCount = 0

    applications?.forEach(app => {
      const userProfile = userProfileMap.get(app.user_id)
      
      // Count by status
      if (app.status in byStatus) {
        byStatus[app.status as keyof typeof byStatus]++
      }

      // Count by country
      const countryName = countryMap.get(userProfile?.country_id)?.toLowerCase() || 'unknown'
      byCountry[countryName] = (byCountry[countryName] || 0) + 1

      // Count by industry
      const industry = app.application_data?.industry || 'Unknown'
      byIndustry[industry] = (byIndustry[industry] || 0) + 1

      // Calculate total amount
      const amount = app.application_data?.financing_amount || 0
      totalAmount += amount

      // Count approved applications
      if (app.status === 'approved') {
        approvedCount++
      }
    })

    const approvalRate = total > 0 ? (approvedCount / total) * 100 : 0
    const averageAmount = total > 0 ? totalAmount / total : 0

    // Get recent activity (last 10 applications)
    const recentActivity = applications
      ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10)
      .map(app => {
        const userProfile = userProfileMap.get(app.user_id)
        return {
          type: 'application_update',
          title: 'Application Update',
          description: `${userProfile?.company_name || 'Unknown Company'} - ${app.status.replace('_', ' ')}`,
          timestamp: app.created_at
        }
      }) || []

    const stats = {
      total,
      by_status: byStatus,
      by_country: byCountry,
      by_industry: byIndustry,
      average_amount: averageAmount,
      total_amount: totalAmount,
      approval_rate: approvalRate,
      processing_time_avg: 0, // TODO: Calculate based on actual processing times
      recent_activity: recentActivity
    }

    console.log('Dashboard stats calculated:', stats)
    console.log('Applications found:', applications?.length, applications)

    return NextResponse.json({
      success: true,
      ...stats
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}