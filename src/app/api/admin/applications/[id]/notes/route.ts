import { NextRequest, NextResponse } from 'next/server'
import { adminAuthService } from '@/lib/admin/AdminAuth'
import { applicationManagementService } from '@/lib/admin/ApplicationManagement'

export async function POST(
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

    const body = await request.json()
    const { note } = body

    if (!note) {
      return NextResponse.json(
        { success: false, error: 'Note is required' },
        { status: 400 }
      )
    }

    const result = await applicationManagementService.addApplicationNote(
      admin,
      params.id,
      { note, note_type: 'info' }
    )

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Note added successfully'
      })
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Add application note error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add note' },
      { status: 500 }
    )
  }
}

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

    const notes = await applicationManagementService.getApplicationNotes(params.id)

    return NextResponse.json({
      success: true,
      notes
    })
  } catch (error) {
    console.error('Get application notes error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notes' },
      { status: 500 }
    )
  }
}