import { NextRequest, NextResponse } from 'next/server'
import { adminAuthService } from '@/lib/admin/AdminAuth'

export async function POST(request: NextRequest) {
  try {
    const result = await adminAuthService.logout()

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Logged out successfully'
      })
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Admin logout error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
