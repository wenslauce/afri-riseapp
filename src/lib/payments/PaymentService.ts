import { PaymentGateway, PaymentInitParams, PaymentResponse, PaymentStatus, WebhookResult } from '@/types'
import { PaystackGateway } from './PaystackGateway'
import { PesapalGateway } from './PesapalGateway'

export class PaymentService {
  private gateways: Map<string, PaymentGateway> = new Map()
  private defaultGateway: string = 'paystack'

  constructor() {
    this.initializeGateways()
  }

  private initializeGateways() {
    // Initialize Paystack gateway
    if (process.env.PAYSTACK_SECRET_KEY) {
      const paystackGateway = new PaystackGateway({
        publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
        secretKey: process.env.PAYSTACK_SECRET_KEY,
        environment: (process.env.PAYSTACK_ENVIRONMENT as 'test' | 'live') || 'test'
      })
      this.gateways.set('paystack', paystackGateway)
      console.log('Paystack gateway initialized in', process.env.PAYSTACK_ENVIRONMENT || 'test', 'mode')
    } else {
      console.error('Paystack credentials not found. Please configure PAYSTACK_SECRET_KEY and NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY')
    }

    // Initialize Pesapal gateway
    if (process.env.PESAPAL_CONSUMER_KEY && process.env.PESAPAL_CONSUMER_SECRET) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      
      const pesapalGateway = new PesapalGateway({
        consumer_key: process.env.PESAPAL_CONSUMER_KEY,
        consumer_secret: process.env.PESAPAL_CONSUMER_SECRET,
        debug: process.env.NODE_ENV !== 'production',
        callbackUrl: `${baseUrl}/payment/callback`,
        ipnUrl: `${baseUrl}/api/webhooks/pesapal`
      })
      this.gateways.set('pesapal', pesapalGateway)
      console.log('Pesapal gateway initialized in', process.env.NODE_ENV === 'production' ? 'live' : 'test', 'mode')
    } else {
      console.warn('Pesapal credentials not found. Please configure PESAPAL_CONSUMER_KEY and PESAPAL_CONSUMER_SECRET to enable Pesapal payments')
    }
  }

  getAvailableGateways(): string[] {
    return Array.from(this.gateways.keys())
  }

  getGateway(name?: string): PaymentGateway {
    const gatewayName = name || this.defaultGateway
    const gateway = this.gateways.get(gatewayName)
    
    if (!gateway) {
      throw new Error(`Payment gateway '${gatewayName}' not found or not configured`)
    }
    
    return gateway
  }

  async initializePayment(params: PaymentInitParams, gatewayName?: string): Promise<PaymentResponse> {
    const gateway = this.getGateway(gatewayName)
    return gateway.initializePayment(params)
  }

  async verifyPayment(transactionId: string, gatewayName?: string): Promise<PaymentStatus> {
    const gateway = this.getGateway(gatewayName)
    return gateway.verifyPayment(transactionId)
  }

  async handleWebhook(payload: any, signature?: string, gatewayName?: string): Promise<WebhookResult> {
    const gateway = this.getGateway(gatewayName)
    return gateway.handleWebhook(payload, signature)
  }

  formatAmount(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount / 100) // Convert from cents
  }
}

// Export singleton instance
export const paymentService = new PaymentService()