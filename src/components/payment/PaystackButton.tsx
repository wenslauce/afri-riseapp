'use client'

import { PaystackButton } from '@makozi/paystack-react-pay'
import { Application, UserProfile } from '@/types'
import { createPaymentRecord } from '@/lib/database-client'

interface PaystackButtonProps {
  application: Application
  userProfile: UserProfile | null
  amount: number
  currency: string
  onPaymentInitiated: (paymentData: { amount: number; currency: string; paymentMethod: string }) => Promise<void>
  isProcessing: boolean
  setIsProcessing: (processing: boolean) => void
  paymentData: {
    email: string
    first_name: string
    last_name: string
    phone: string
  }
}

export default function PaystackPaymentButton({
  application,
  userProfile,
  amount,
  currency,
  onPaymentInitiated,
  isProcessing,
  setIsProcessing,
  paymentData
}: PaystackButtonProps) {
  const handleSuccess = async (response: any) => {
    try {
      // Create payment record in database
      const paymentRecord = await createPaymentRecord({
        application_id: application.id,
        payment_gateway: 'paystack',
        gateway_transaction_id: response.reference,
        amount: amount,
        currency: currency,
        status: 'completed',
        gateway_response: response
      })

      await onPaymentInitiated({
        amount,
        currency,
        paymentMethod: 'paystack'
      })

      // Redirect to completion page
      window.location.href = `/application/${application.id}/complete`
    } catch (error) {
      console.error('Payment success handling failed:', error)
      alert('Payment completed but there was an error processing the result. Please contact support.')
    }
  }

  const handleClose = () => {
    console.log('Payment modal closed')
    setIsProcessing(false)
  }

  return (
    <PaystackButton
      publicKey={process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || ''}
      email={paymentData.email}
      amount={amount * 100} // Convert to kobo for NGN, or cents for USD
      currency={currency}
      reference={`APP-${application.id}-${Date.now()}`}
      metadata={{
        application_id: application.id,
        customer_name: `${paymentData.first_name} ${paymentData.last_name}`,
        phone: paymentData.phone
      }}
      onSuccess={handleSuccess}
      onClose={handleClose}
      text={isProcessing ? 'Processing...' : `Pay ${new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount / 100)}`}
      className="w-full bg-primary-600 text-white py-3 px-4 rounded-md font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
    />
  )
}
