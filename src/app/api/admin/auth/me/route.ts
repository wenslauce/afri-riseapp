import { NextRequest, NextResponse } from 'next/server'
import { adminAuthService } from '@/lib/admin/AdminAuth'

export async function GET(request: NextRequest) {
  try {
    const admin = await adminAuthService.getCurrentAdmin()

    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      admin
    })
  } catch (error) {
    console.error('Get current admin error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
