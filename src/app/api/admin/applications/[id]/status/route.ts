import { NextRequest, NextResponse } from 'next/server'
import { adminAuthService } from '@/lib/admin/AdminAuth'
import { applicationManagementService } from '@/lib/admin/ApplicationManagement'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const admin = await adminAuthService.getCurrentAdmin()
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { status, reason, admin_notes } = body

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Status is required' },
        { status: 400 }
      )
    }

    const result = await applicationManagementService.updateApplicationStatus(
      admin,
      id,
      { status, reason, admin_notes }
    )

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Application status updated successfully'
      })
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Update application status error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update application status' },
      { status: 500 }
    )
  }
}