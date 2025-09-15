import { PaymentGateway, PaymentInitParams, PaymentResponse, PaymentStatus, WebhookResult } from '@/types'
import { CurrencyService } from './CurrencyService'

// Pesapal SDK types (since the package may not have proper TypeScript definitions)
interface PesapalConfig {
  consumer_key: string
  consumer_secret: string
  debug?: boolean
  callbackUrl?: string
  ipnUrl?: string
}

interface PesapalCustomer {
  firstname: string
  lastname: string
  email: string
  phonenumber: string
}

interface PesapalOrder {
  itemID: string
  particulars: string
  quantity: number
  unitCost: number
  details?: string
}

interface PesapalPaymentRequest {
  reference: string
  customerDetails: PesapalCustomer
  description: string
  orders: PesapalOrder[]
}

interface PesapalResponse {
  redirect_url?: string
  status?: string
  message?: string
  reference?: string
}

// Pesapal API endpoints
const PESAPAL_ENDPOINTS = {
  sandbox: 'https://cybqa.pesapal.com/pesapalv3',
  production: 'https://pay.pesapal.com/v3'
}

// Helper function to get Pesapal API base URL
function getPesapalBaseUrl(debug: boolean = true): string {
  return debug ? PESAPAL_ENDPOINTS.sandbox : PESAPAL_ENDPOINTS.production
}

export class PesapalGateway implements PaymentGateway {
  name = 'pesapal'
  private config: PesapalConfig
  private baseUrl: string

  constructor(config: PesapalConfig) {
    this.config = config
    this.baseUrl = getPesapalBaseUrl(config.debug || false)
  }

  private async getAccessToken(): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/api/Auth/RequestToken`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          consumer_key: this.config.consumer_key,
          consumer_secret: this.config.consumer_secret
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to get access token: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (!data.token) {
        throw new Error('No access token received from Pesapal')
      }

      return data.token
    } catch (error) {
      console.error('Pesapal access token error:', error)
      throw new Error('Failed to authenticate with Pesapal')
    }
  }

  async initializePayment(params: PaymentInitParams): Promise<PaymentResponse> {
    try {
      // Use the currency and amount as provided (conversion should be done in frontend)
      const paymentCurrency = params.currency
      const paymentAmount = params.amount
      
      // Extract conversion metadata if available
      const conversionMetadata = params.metadata?.conversionRate ? {
        original_currency: params.metadata.originalCurrency,
        original_amount: params.metadata.originalAmount,
        conversion_rate: params.metadata.conversionRate,
        converted_currency: params.currency,
        converted_amount: params.amount,
        conversion_timestamp: new Date().toISOString()
      } : {}

      // Get access token
      const token = await this.getAccessToken()

      // Get base URL for callback URLs
      const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

      // Prepare payment request for Pesapal API v3
      const paymentRequest = {
        id: params.reference,
        currency: paymentCurrency,
        amount: paymentAmount,
        description: params.description || 'Application Fee Payment',
        callback_url: this.config.callbackUrl || `${appBaseUrl}/payment/callback`,
        notification_id: `${params.reference}-notification`,
        billing_address: {
          email_address: params.customerEmail,
          phone_number: params.metadata?.phone || '',
          country_code: params.metadata?.country || 'KE',
          first_name: params.customerName.split(' ')[0] || 'Customer',
          last_name: params.customerName.split(' ').slice(1).join(' ') || 'User',
          line_1: params.metadata?.address || '',
          city: params.metadata?.city || ''
        }
      }

      // Submit order to Pesapal
      const response = await fetch(`${this.baseUrl}/api/Transactions/SubmitOrderRequest`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(paymentRequest)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(`Pesapal API error: ${response.status} ${response.statusText}${errorData ? ` - ${errorData.message}` : ''}`)
      }

      const data = await response.json()

      if (!data.redirect_url) {
        return {
          success: false,
          transactionId: params.reference,
          error: data.message || 'Failed to get payment URL from Pesapal'
        }
      }

      return {
        success: true,
        transactionId: params.reference,
        redirectUrl: data.redirect_url,
        paymentUrl: data.redirect_url,
        reference: params.reference,
        gatewayResponse: {
          ...data,
          currency_conversion: conversionMetadata,
          payment_currency: paymentCurrency,
          payment_amount: paymentAmount
        }
      }

    } catch (error) {
      console.error('Pesapal payment initialization failed:', error)
      return {
        success: false,
        transactionId: params.reference,
        error: error instanceof Error ? error.message : 'Pesapal payment initialization failed'
      }
    }
  }

  async verifyPayment(transactionId: string): Promise<PaymentStatus> {
    try {
      const token = await this.getAccessToken()

      // Get transaction status from Pesapal
      const response = await fetch(`${this.baseUrl}/api/Transactions/GetTransactionStatus?orderTrackingId=${transactionId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to verify payment: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      // Map Pesapal status to our standard status
      let status: PaymentStatus['status'] = 'pending'

      switch (data.payment_status_description?.toLowerCase()) {
        case 'completed':
        case 'success':
          status = 'completed'
          break
        case 'failed':
        case 'cancelled':
          status = 'failed'
          break
        case 'pending':
        default:
          status = 'pending'
          break
      }

      return {
        status,
        transactionId,
        amount: data.amount,
        currency: data.currency,
        reference: data.merchant_reference,
        paidAt: data.created_date,
        gatewayReference: data.order_tracking_id
      }

    } catch (error) {
      console.error('Pesapal payment verification failed:', error)
      return {
        status: 'failed',
        transactionId,
        error: error instanceof Error ? error.message : 'Payment verification failed'
      }
    }
  }

  async handleWebhook(payload: any, signature?: string): Promise<WebhookResult> {
    try {
      // Pesapal uses IPN (Instant Payment Notification)
      // The payload typically contains: pesapal_merchant_reference, pesapal_transaction_tracking_id, status
      
      const {
        pesapal_merchant_reference: reference,
        pesapal_transaction_tracking_id: trackingId,
        status
      } = payload

      if (!reference) {
        throw new Error('Invalid IPN payload - missing merchant reference')
      }

      // Map Pesapal status to our standard status
      let paymentStatus: PaymentStatus['status'] = 'pending'

      switch (status?.toLowerCase()) {
        case 'completed':
        case 'success':
          paymentStatus = 'completed'
          break
        case 'failed':
        case 'cancelled':
          paymentStatus = 'failed'
          break
        case 'pending':
        default:
          paymentStatus = 'pending'
          break
      }

      return {
        success: true,
        transactionId: reference,
        status: paymentStatus,
        shouldUpdateDatabase: paymentStatus === 'completed' || paymentStatus === 'failed'
      }

    } catch (error) {
      console.error('Pesapal webhook handling failed:', error)
      return {
        success: false,
        transactionId: payload?.pesapal_merchant_reference || '',
        status: 'failed',
        shouldUpdateDatabase: false,
        error: error instanceof Error ? error.message : 'Webhook handling failed'
      }
    }
  }

  /**
   * Get supported currencies for Pesapal
   * Pesapal primarily supports KES and USD in Kenya
   */
  static getSupportedCurrencies(): string[] {
    return ['KES', 'USD']
  }

  /**
   * Check if currency is natively supported
   */
  static isCurrencyNativelySupported(currency: string): boolean {
    return ['KES'].includes(currency)
  }
}
