import { NextRequest, NextResponse } from 'next/server'
import { paymentService } from '@/lib/payments/PaymentService'
import { updatePaymentRecord } from '@/lib/database-client'

export async function POST(request: NextRequest) {
  try {
    const { reference } = await request.json()

    if (!reference) {
      return NextResponse.json(
        { success: false, error: 'Payment reference is required' },
        { status: 400 }
      )
    }

    // Verify payment with Paystack
    const paymentStatus = await paymentService.verifyPayment(reference, 'paystack')

    if (paymentStatus.status === 'completed') {
      // Update payment record in database
      try {
        await updatePaymentRecord(reference, {
          status: 'completed',
          gateway_response: paymentStatus,
          updated_at: new Date().toISOString()
        })
      } catch (error) {
        console.error('Failed to update payment record:', error)
        // Don't fail the verification if database update fails
      }
    }

    return NextResponse.json({
      success: true,
      status: paymentStatus.status,
      transactionId: paymentStatus.transactionId,
      amount: paymentStatus.amount,
      currency: paymentStatus.currency,
      paidAt: paymentStatus.paidAt
    })
  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { success: false, error: 'Payment verification failed' },
      { status: 500 }
    )
  }
}
