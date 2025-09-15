import { NextRequest, NextResponse } from 'next/server'
import { adminAuthService } from '@/lib/admin/AdminAuth'
import { applicationManagementService } from '@/lib/admin/ApplicationManagement'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await adminAuthService.getCurrentAdmin()
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const application = await applicationManagementService.getApplicationById(admin, params.id)
    
    if (!application) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      application
    })
  } catch (error) {
    console.error('Get application error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch application' },
      { status: 500 }
    )
  }
}