'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, Loader2, CreditCard } from 'lucide-react'

export default function PaymentCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'cancelled'>('loading')
  const [message, setMessage] = useState('')
  const [transactionId, setTransactionId] = useState('')

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Get parameters from URL (Pesapal sends these)
        const pesapalMerchantReference = searchParams.get('pesapal_merchant_reference')
        const pesapalTransactionTrackingId = searchParams.get('pesapal_transaction_tracking_id')
        const pesapalStatus = searchParams.get('status')

        // Get parameters from Paystack (if applicable)
        const paystackReference = searchParams.get('reference')
        const paystackTrxref = searchParams.get('trxref')

        const reference = pesapalMerchantReference || paystackReference || paystackTrxref
        const trackingId = pesapalTransactionTrackingId
        const paymentStatus = pesapalStatus || searchParams.get('status')

        if (!reference) {
          setStatus('failed')
          setMessage('Invalid payment reference. Please contact support.')
          return
        }

        setTransactionId(reference)

        // Determine status based on URL parameters
        if (paymentStatus?.toLowerCase() === 'completed' || paymentStatus?.toLowerCase() === 'success') {
          setStatus('success')
          setMessage('Payment completed successfully! Your application has been processed.')
        } else if (paymentStatus?.toLowerCase() === 'failed') {
          setStatus('failed')
          setMessage('Payment failed. Please try again or contact support.')
        } else if (paymentStatus?.toLowerCase() === 'cancelled') {
          setStatus('cancelled')
          setMessage('Payment was cancelled. You can try again when ready.')
        } else {
          // For pending or unknown status, we'll show loading and redirect to dashboard
          setStatus('success')
          setMessage('Payment is being processed. Please check your dashboard for updates.')
        }

      } catch (error) {
        console.error('Payment callback processing error:', error)
        setStatus('failed')
        setMessage('An error occurred while processing your payment callback.')
      }
    }

    processCallback()
  }, [searchParams])

  const handleContinue = () => {
    // Redirect to dashboard or application page
    router.push('/dashboard')
  }

  const handleRetry = () => {
    // Go back to payment page
    router.back()
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-16 w-16 animate-spin text-blue-500" />
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500" />
      case 'failed':
        return <XCircle className="h-16 w-16 text-red-500" />
      case 'cancelled':
        return <XCircle className="h-16 w-16 text-orange-500" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'border-blue-200 bg-blue-50'
      case 'success':
        return 'border-green-200 bg-green-50'
      case 'failed':
        return 'border-red-200 bg-red-50'
      case 'cancelled':
        return 'border-orange-200 bg-orange-50'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full">
        <Card className={`text-center ${getStatusColor()}`}>
          <CardHeader className="pb-4">
            <div className="flex justify-center mb-4">
              {getStatusIcon()}
            </div>
            <CardTitle className="text-2xl">
              {status === 'loading' && 'Processing Payment...'}
              {status === 'success' && 'Payment Successful!'}
              {status === 'failed' && 'Payment Failed'}
              {status === 'cancelled' && 'Payment Cancelled'}
            </CardTitle>
            <CardDescription className="text-lg">
              {message}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {transactionId && (
              <Alert>
                <CreditCard className="h-4 w-4" />
                <AlertDescription>
                  <strong>Transaction ID:</strong> {transactionId}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col gap-2">
              {(status === 'success' || status === 'cancelled') && (
                <Button onClick={handleContinue} size="lg" className="w-full">
                  Continue to Dashboard
                </Button>
              )}
              
              {status === 'failed' && (
                <>
                  <Button onClick={handleRetry} size="lg" className="w-full">
                    Try Payment Again
                  </Button>
                  <Button 
                    onClick={handleContinue} 
                    variant="outline" 
                    size="lg" 
                    className="w-full"
                  >
                    Go to Dashboard
                  </Button>
                </>
              )}

              {status === 'loading' && (
                <Button disabled size="lg" className="w-full">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </Button>
              )}
            </div>

            <p className="text-xs text-gray-500 mt-4">
              If you have any issues, please contact support with your transaction ID.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
