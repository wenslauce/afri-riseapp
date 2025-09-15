'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PaymentService } from '@/lib/payments/PaymentService'
import { updatePaymentRecord, getPaymentsByApplicationId } from '@/lib/database-client'
import { PaymentRecord } from '@/types'

interface PaymentCallbackProps {
  applicationId: string
  orderTrackingId: string
  merchantReference?: string
  notificationType?: string
}

export default function PaymentCallback({
  applicationId,
  orderTrackingId,
  merchantReference,
  notificationType
}: PaymentCallbackProps) {
  const router = useRouter()
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed' | 'error'>('verifying')
  const [message, setMessage] = useState('Verifying your payment...')
  const [paymentRecord, setPaymentRecord] = useState<PaymentRecord | null>(null)

  useEffect(() => {
    verifyPayment()
  }, [orderTrackingId])

  const verifyPayment = async () => {
    try {
      setStatus('verifying')
      setMessage('Verifying your payment...')

      // Get payment records for this application
      const payments = await getPaymentsByApplicationId(applicationId)
      const currentPayment = payments.find(p => p.gateway_transaction_id === orderTrackingId)

      if (!currentPayment) {
        throw new Error('Payment record not found')
      }

      setPaymentRecord(currentPayment)

      // Verify payment with gateway
      const paymentService = new PaymentService()
      const paymentStatus = await paymentService.verifyPayment(orderTrackingId)

      // Update payment record
      const updatedPayment = await updatePaymentRecord(currentPayment.id, {
        status: paymentStatus.status,
        paid_at: paymentStatus.paidAt,
        gateway_reference: paymentStatus.gatewayReference
      })

      setPaymentRecord(updatedPayment)

      if (paymentStatus.status === 'completed') {
        setStatus('success')
        setMessage('Payment completed successfully!')
        
        // Redirect to NDA signing after a short delay
        setTimeout(() => {
          router.push(`/application/${applicationId}/nda`)
        }, 3000)
      } else if (paymentStatus.status === 'failed') {
        setStatus('failed')
        setMessage('Payment failed. Please try again.')
      } else {
        setStatus('error')
        setMessage('Payment is still being processed. Please check back later.')
      }
    } catch (error) {
      console.error('Payment verification failed:', error)
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Failed to verify payment')
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount / 100) // Convert from cents
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'verifying':
        return (
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
        )
      case 'success':
        return (
          <div className="mx-auto h-16 w-16 text-green-600">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )
      case 'failed':
        return (
          <div className="mx-auto h-16 w-16 text-red-600">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
        )
      default:
        return (
          <div className="mx-auto h-16 w-16 text-yellow-600">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        )
    }
  }

  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="mb-8">
        {getStatusIcon()}
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        {status === 'verifying' && 'Verifying Payment'}
        {status === 'success' && 'Payment Successful'}
        {status === 'failed' && 'Payment Failed'}
        {status === 'error' && 'Payment Status Unknown'}
      </h2>

      <p className="text-gray-600 mb-8">{message}</p>

      {paymentRecord && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h3>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div>
              <dt className="text-sm font-medium text-gray-500">Amount</dt>
              <dd className="text-sm text-gray-900">
                {formatCurrency(paymentRecord.amount, paymentRecord.currency)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Transaction ID</dt>
              <dd className="text-sm text-gray-900 font-mono">
                {paymentRecord.gateway_transaction_id}
              </dd>
            </div>
            {paymentRecord.gateway_reference && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Reference</dt>
                <dd className="text-sm text-gray-900 font-mono">
                  {paymentRecord.gateway_reference}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="text-sm text-gray-900 capitalize">
                {paymentRecord.status}
              </dd>
            </div>
          </dl>
        </div>
      )}

      <div className="space-y-4">
        {status === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <p className="text-sm text-green-700">
              You will be redirected to the NDA signing page in a few seconds...
            </p>
          </div>
        )}

        <div className="flex justify-center space-x-4">
          {status === 'success' && (
            <button
              onClick={() => router.push(`/application/${applicationId}/nda`)}
              className="btn-primary"
            >
              Continue to NDA Signing
            </button>
          )}
          
          {status === 'failed' && (
            <button
              onClick={() => router.push(`/application/${applicationId}/payment`)}
              className="btn-primary"
            >
              Try Payment Again
            </button>
          )}
          
          {status === 'error' && (
            <>
              <button
                onClick={verifyPayment}
                className="btn-secondary"
              >
                Check Again
              </button>
              <button
                onClick={() => router.push(`/application/${applicationId}/payment`)}
                className="btn-primary"
              >
                Back to Payment
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}