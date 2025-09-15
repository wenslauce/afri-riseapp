import { PaymentGateway, PaymentInitParams, PaymentResponse, PaymentStatus, WebhookResult } from '@/types'
import { CurrencyService } from './CurrencyService'

interface PaystackConfig {
  publicKey: string
  secretKey: string
  environment: 'test' | 'live'
}

interface PaystackInitializeResponse {
  status: boolean
  message: string
  data: {
    authorization_url: string
    access_code: string
    reference: string
  }
}

interface PaystackVerifyResponse {
  status: boolean
  message: string
  data: {
    id: number
    domain: string
    status: string
    reference: string
    amount: number
    message: string
    gateway_response: string
    paid_at: string
    created_at: string
    channel: string
    currency: string
    ip_address: string
    metadata: any
    log: any
    fees: number
    fees_split: any
    authorization: any
    customer: any
    plan: any
    split: any
    order_id: any
    paidAt: string
    createdAt: string
    requested_amount: number
    pos_transaction_data: any
    source: any
    fees_breakdown: any
  }
}

export class PaystackGateway implements PaymentGateway {
  name = 'paystack'
  private config: PaystackConfig
  private baseUrl: string

  constructor(config: PaystackConfig) {
    this.config = config
    this.baseUrl = config.environment === 'live'
      ? 'https://api.paystack.co'
      : 'https://api.paystack.co' // Paystack uses same URL for both test and live
  }

  async initializePayment(params: PaymentInitParams): Promise<PaymentResponse> {
    try {
      // Use the currency and amount as provided (conversion should be done in frontend)
      const paymentCurrency = params.currency
      const paymentAmount = params.amount
      
      // Convert amount to lowest currency unit
      // NGN uses kobo (x100), KES uses cents (x100), USD uses cents (x100)
      let amount: number
      switch (paymentCurrency) {
        case 'NGN':
        case 'KES':
        case 'USD':
          amount = Math.round(paymentAmount * 100) // Convert to kobo/cents
          break
        default:
          amount = Math.round(paymentAmount * 100) // Default to cents
          break
      }

      const response = await fetch(`${this.baseUrl}/transaction/initialize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.secretKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: params.customerEmail,
          amount: amount,
          currency: paymentCurrency,
          reference: params.reference,
          callback_url: params.callbackUrl,
          metadata: {
            custom_fields: [
              {
                display_name: 'Customer Name',
                variable_name: 'customer_name',
                value: params.customerName
              },
              {
                display_name: 'Application ID',
                variable_name: 'application_id',
                value: params.metadata?.application_id || ''
              }
            ]
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Payment initialization failed: ${errorData.message || response.statusText}`)
      }

      const data: PaystackInitializeResponse = await response.json()

      if (!data.status) {
        return {
          success: false,
          transactionId: '',
          error: data.message || 'Payment initialization failed'
        }
      }

      return {
        success: true,
        transactionId: data.data.reference,
        redirectUrl: data.data.authorization_url,
        reference: data.data.reference,
        gatewayResponse: data
      }
    } catch (error) {
      console.error('Paystack payment initialization failed:', error)
      return {
        success: false,
        transactionId: '',
        error: error instanceof Error ? error.message : 'Payment initialization failed'
      }
    }
  }

  async verifyPayment(transactionId: string): Promise<PaymentStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/transaction/verify/${transactionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.secretKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Payment verification failed: ${response.status} ${response.statusText}`)
      }

      const data: PaystackVerifyResponse = await response.json()

      if (!data.status) {
        return {
          status: 'failed',
          transactionId,
          error: data.message || 'Payment verification failed'
        }
      }

      // Map Paystack status to our standard status
      let status: PaymentStatus['status'] = 'pending'

      switch (data.data.status?.toLowerCase()) {
        case 'success':
          status = 'completed'
          break
        case 'failed':
          status = 'failed'
          break
        case 'pending':
        default:
          status = 'pending'
          break
      }

      // Convert amount back from lowest unit to main currency unit
      let amount: number
      switch (data.data.currency) {
        case 'NGN':
        case 'KES':
        case 'USD':
          amount = Math.round(data.data.amount / 100) // Convert from kobo/cents to main unit
          break
        default:
          amount = Math.round(data.data.amount / 100) // Default conversion
          break
      }

      return {
        status,
        transactionId,
        amount,
        currency: data.data.currency,
        reference: data.data.reference,
        paidAt: data.data.paid_at || data.data.paidAt,
        gatewayReference: data.data.reference
      }
    } catch (error) {
      console.error('Paystack payment verification failed:', error)
      return {
        status: 'failed',
        transactionId,
        error: error instanceof Error ? error.message : 'Payment verification failed'
      }
    }
  }

  async handleWebhook(payload: any, signature?: string): Promise<WebhookResult> {
    try {
      // Verify webhook signature if provided
      if (signature && !this.verifyWebhookSignature(payload, signature)) {
        throw new Error('Invalid webhook signature')
      }

      const { event, data } = payload

      if (event === 'charge.success') {
        return {
          success: true,
          transactionId: data.reference,
          status: 'completed',
          shouldUpdateDatabase: true
        }
      } else if (event === 'charge.failed') {
        return {
          success: true,
          transactionId: data.reference,
          status: 'failed',
          shouldUpdateDatabase: true
        }
      }

      return {
        success: true,
        transactionId: data.reference || '',
        status: 'pending',
        shouldUpdateDatabase: false
      }
    } catch (error) {
      console.error('Paystack webhook handling failed:', error)
      return {
        success: false,
        transactionId: payload?.data?.reference || '',
        status: 'failed',
        shouldUpdateDatabase: false,
        error: error instanceof Error ? error.message : 'Webhook handling failed'
      }
    }
  }

  private verifyWebhookSignature(payload: any, signature: string): boolean {
    // Implement webhook signature verification
    // This is a simplified version - in production, you should use proper HMAC verification
    const crypto = require('crypto')
    const expectedSignature = crypto
      .createHmac('sha512', this.config.secretKey)
      .update(JSON.stringify(payload))
      .digest('hex')
    
    return signature === expectedSignature
  }
}
