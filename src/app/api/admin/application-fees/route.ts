import { NextRequest, NextResponse } from 'next/server'
import { applicationFeeService } from '@/lib/application-fees/ApplicationFeeService'

export async function GET() {
  try {
    const fees = await applicationFeeService.getAllFees()
    return NextResponse.json({ success: true, fees })
  } catch (error) {
    console.error('Failed to fetch application fees:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch application fees' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { feeId, amount, description, paymentMode, updateMode } = body

    // Handle payment mode update
    if (updateMode && paymentMode) {
      if (!['test', 'live'].includes(paymentMode)) {
        return NextResponse.json(
          { success: false, error: 'Invalid payment mode. Must be "test" or "live"' },
          { status: 400 }
        )
      }

      const updatedFee = await applicationFeeService.updatePaymentMode(paymentMode)
      
      return NextResponse.json({ 
        success: true, 
        fee: updatedFee,
        message: `Payment mode updated to ${paymentMode.toUpperCase()} successfully`
      })
    }

    // Handle fee update
    if (!feeId || !amount) {
      return NextResponse.json(
        { success: false, error: 'Fee ID and amount are required' },
        { status: 400 }
      )
    }

    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Amount must be greater than 0' },
        { status: 400 }
      )
    }

    const updatedFee = await applicationFeeService.updateApplicationFee(amount, description, paymentMode || 'test')
    
    return NextResponse.json({ 
      success: true, 
      fee: updatedFee,
      message: 'Application fee updated successfully'
    })
  } catch (error) {
    console.error('Failed to update application fee:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update application fee' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { feeType, amount, description } = await request.json()

    if (!feeType || !amount || !description) {
      return NextResponse.json(
        { success: false, error: 'Fee type, amount, and description are required' },
        { status: 400 }
      )
    }

    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Amount must be greater than 0' },
        { status: 400 }
      )
    }

    const newFee = await applicationFeeService.createFee(feeType, amount, description)
    
    return NextResponse.json({ 
      success: true, 
      fee: newFee,
      message: 'Application fee created successfully'
    })
  } catch (error) {
    console.error('Failed to create application fee:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create application fee' },
      { status: 500 }
    )
  }
}
