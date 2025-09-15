import { NextRequest, NextResponse } from 'next/server'
import { paymentService } from '@/lib/payments/PaymentService'
import { updatePaymentRecord } from '@/lib/database-client'

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    const signature = request.headers.get('x-paystack-signature')

    console.log('Paystack webhook received:', payload)

    // Handle the webhook using the payment service
    const result = await paymentService.handleWebhook(payload, signature || undefined, 'paystack')

    if (result.success && result.shouldUpdateDatabase) {
      // Update payment record in database
      try {
        await updatePaymentRecord(result.transactionId, {
          status: result.status,
          gateway_response: payload,
          updated_at: new Date().toISOString()
        })
        console.log('Payment record updated successfully')
      } catch (error) {
        console.error('Failed to update payment record:', error)
        // Don't fail the webhook if database update fails
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processed successfully' 
    })
  } catch (error) {
    console.error('Paystack webhook error:', error)
    return NextResponse.json(
      { success: false, error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
