import { NextRequest, NextResponse } from 'next/server'
import { adminAuthService } from '@/lib/admin/AdminAuth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const result = await adminAuthService.authenticateAdmin(email, password)

    if (result.success) {
      return NextResponse.json({
        success: true,
        session: result.session
      })
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}