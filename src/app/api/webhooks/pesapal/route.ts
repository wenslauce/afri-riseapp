import { NextRequest, NextResponse } from 'next/server'
import { paymentService } from '@/lib/payments/PaymentService'
import { updatePaymentRecordByReference } from '@/lib/database-client'
import { updateApplicationStatusOnPayment } from '@/lib/application-status-updater'

export async function POST(request: NextRequest) {
  try {
    console.log('Pesapal IPN webhook received')
    
    // Parse the form data from Pesapal IPN
    const body = await request.text()
    const params = new URLSearchParams(body)
    
    // Extract Pesapal IPN parameters
    const payload = {
      pesapal_merchant_reference: params.get('pesapal_merchant_reference'),
      pesapal_transaction_tracking_id: params.get('pesapal_transaction_tracking_id'),
      status: params.get('status') || 'PENDING'
    }
    
    console.log('Pesapal IPN payload:', payload)

    if (!payload.pesapal_merchant_reference) {
      console.error('Invalid Pesapal IPN: missing merchant reference')
      return NextResponse.json(
        { error: 'Invalid IPN payload' },
        { status: 400 }
      )
    }

    // Process the webhook using the payment service
    const webhookResult = await paymentService.handleWebhook(payload, undefined, 'pesapal')

    if (!webhookResult.success) {
      console.error('Pesapal webhook processing failed:', webhookResult.error)
      return NextResponse.json(
        { error: 'Webhook processing failed' },
        { status: 500 }
      )
    }

    // Update payment record if needed
    if (webhookResult.shouldUpdateDatabase) {
      try {
        await updatePaymentRecordByReference(webhookResult.transactionId, {
          status: webhookResult.status,
          gateway_response: {
            ipn_data: payload,
            tracking_id: payload.pesapal_transaction_tracking_id,
            webhook_processed_at: new Date().toISOString()
          }
        })
        console.log(`Payment record updated for transaction ${webhookResult.transactionId}:`, webhookResult.status)
        
        // Update application status if payment is completed
        if (webhookResult.status === 'completed') {
          // Extract application ID from the transaction ID (format: APP-{applicationId}-{timestamp})
          const applicationId = webhookResult.transactionId.split('-')[1]
          if (applicationId) {
            await updateApplicationStatusOnPayment(applicationId)
          }
        }
      } catch (dbError) {
        console.error('Failed to update payment record:', dbError)
        // Don't return error to Pesapal - the webhook was processed successfully
      }
    }

    // Pesapal expects a success response
    return NextResponse.json({ status: 'success' }, { status: 200 })

  } catch (error) {
    console.error('Pesapal webhook processing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  // Pesapal also sends IPN notifications via GET sometimes
  try {
    const { searchParams } = new URL(request.url)
    
    const payload = {
      pesapal_merchant_reference: searchParams.get('pesapal_merchant_reference'),
      pesapal_transaction_tracking_id: searchParams.get('pesapal_transaction_tracking_id'),
      status: searchParams.get('status') || 'PENDING'
    }
    
    console.log('Pesapal IPN GET notification:', payload)

    if (!payload.pesapal_merchant_reference) {
      return NextResponse.json(
        { error: 'Invalid IPN payload' },
        { status: 400 }
      )
    }

    // Process the same way as POST
    const webhookResult = await paymentService.handleWebhook(payload, undefined, 'pesapal')

    if (webhookResult.shouldUpdateDatabase) {
      try {
        await updatePaymentRecordByReference(webhookResult.transactionId, {
          status: webhookResult.status,
          gateway_response: {
            ipn_data: payload,
            tracking_id: payload.pesapal_transaction_tracking_id,
            webhook_processed_at: new Date().toISOString()
          }
        })
        
        // Update application status if payment is completed
        if (webhookResult.status === 'completed') {
          // Extract application ID from the transaction ID (format: APP-{applicationId}-{timestamp})
          const applicationId = webhookResult.transactionId.split('-')[1]
          if (applicationId) {
            await updateApplicationStatusOnPayment(applicationId)
          }
        }
      } catch (dbError) {
        console.error('Failed to update payment record:', dbError)
      }
    }

    return NextResponse.json({ status: 'success' }, { status: 200 })

  } catch (error) {
    console.error('Pesapal GET webhook processing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
