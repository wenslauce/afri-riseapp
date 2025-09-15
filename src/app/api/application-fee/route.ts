import { NextRequest, NextResponse } from 'next/server'
import { applicationFeeService } from '@/lib/application-fees/ApplicationFeeService'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const mode = (searchParams.get('mode') as 'test' | 'live') || 'test'
    
    const fee = await applicationFeeService.getApplicationFee(mode)
    return NextResponse.json({ success: true, fee, mode })
  } catch (error) {
    console.error('Failed to fetch application fee:', error)
    // Return default fee if there's an error
    return NextResponse.json({ success: true, fee: 300.00, mode: 'test' })
  }
}
