import { NextRequest, NextResponse } from 'next/server'
import { paymentService } from '@/lib/payments/PaymentService'
import { PaymentInitParams } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      gateway,
      amount,
      currency,
      description,
      reference,
      customerEmail,
      customerName,
      callbackUrl,
      cancelUrl,
      metadata
    } = body

    // Validate required parameters
    if (!gateway || !amount || !currency || !reference || !customerEmail || !customerName) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required payment parameters' 
        },
        { status: 400 }
      )
    }

    // Validate gateway
    const availableGateways = paymentService.getAvailableGateways()
    if (!availableGateways.includes(gateway)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Payment gateway '${gateway}' is not available. Available gateways: ${availableGateways.join(', ')}` 
        },
        { status: 400 }
      )
    }

    // Prepare payment initialization parameters
    const paymentParams: PaymentInitParams = {
      amount: Number(amount),
      currency: String(currency).toUpperCase(),
      description: String(description),
      reference: String(reference),
      customerEmail: String(customerEmail),
      customerName: String(customerName),
      callbackUrl: String(callbackUrl),
      cancelUrl: String(cancelUrl),
      metadata: metadata || {}
    }

    // Initialize payment using the selected gateway
    console.log(`Initializing ${gateway} payment:`, {
      amount: paymentParams.amount,
      currency: paymentParams.currency,
      reference: paymentParams.reference,
      originalAmount: paymentParams.metadata?.originalAmount,
      originalCurrency: paymentParams.metadata?.originalCurrency,
      conversionRate: paymentParams.metadata?.conversionRate
    })
    const paymentResponse = await paymentService.initializePayment(paymentParams, gateway)

    if (!paymentResponse.success) {
      console.error(`${gateway} payment initialization failed:`, paymentResponse.error)
      return NextResponse.json(
        { 
          success: false, 
          error: paymentResponse.error || 'Payment initialization failed' 
        },
        { status: 400 }
      )
    }

    console.log(`${gateway} payment initialized successfully:`, {
      transactionId: paymentResponse.transactionId,
      reference: paymentResponse.reference,
      hasRedirectUrl: !!paymentResponse.redirectUrl
    })

    return NextResponse.json({
      success: true,
      transactionId: paymentResponse.transactionId,
      reference: paymentResponse.reference,
      redirectUrl: paymentResponse.redirectUrl,
      paymentUrl: paymentResponse.paymentUrl,
      gateway: gateway
    })

  } catch (error) {
    console.error('Payment initialization error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

// Handle GET requests for testing/debugging
export async function GET() {
  const availableGateways = paymentService.getAvailableGateways()
  
  return NextResponse.json({
    success: true,
    availableGateways,
    message: 'Payment initialization endpoint is ready'
  })
}
