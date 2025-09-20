'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { XCircle, ArrowLeft, CreditCard, Loader2 } from 'lucide-react'

function PaymentCancelContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const transactionId = searchParams.get('reference') || 
                       searchParams.get('pesapal_merchant_reference') || 
                       searchParams.get('trxref')

  const handleRetry = () => {
    // Go back to payment page
    router.back()
  }

  const handleDashboard = () => {
    // Redirect to dashboard
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full">
        <Card className="text-center border-orange-200 bg-orange-50 dark:bg-orange-950/20">
          <CardHeader className="pb-4">
            <div className="flex justify-center mb-4">
              <XCircle className="h-16 w-16 text-orange-500" />
            </div>
            <CardTitle className="text-2xl text-orange-900 dark:text-orange-100">
              Payment Cancelled
            </CardTitle>
            <CardDescription className="text-lg text-orange-700 dark:text-orange-300">
              Your payment was cancelled. No charges were made to your account.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {transactionId && (
              <Alert className="border-orange-200 bg-orange-100 dark:bg-orange-950">
                <CreditCard className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800 dark:text-orange-200">
                  <strong>Reference:</strong> {transactionId}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4 text-sm text-orange-800 dark:text-orange-200">
              <p>
                Your payment was not processed. This could be because:
              </p>
              <ul className="text-left space-y-1 pl-4">
                <li>• You clicked "Cancel" or closed the payment window</li>
                <li>• You decided not to proceed with the payment</li>
                <li>• There was a network issue during payment</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2 pt-4">
              <Button onClick={handleRetry} size="lg" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Try Payment Again
              </Button>
              
              <Button 
                onClick={handleDashboard} 
                variant="outline" 
                size="lg" 
                className="w-full"
              >
                Go to Dashboard
              </Button>
            </div>

            <div className="pt-4 border-t border-orange-200">
              <p className="text-xs text-orange-600 dark:text-orange-400">
                Need help? Contact our support team and provide the reference number above.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function PaymentCancelPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-md w-full">
          <Card className="text-center border-orange-200 bg-orange-50 dark:bg-orange-950/20">
            <CardHeader className="pb-4">
              <div className="flex justify-center mb-4">
                <Loader2 className="h-16 w-16 animate-spin text-orange-500" />
              </div>
              <CardTitle className="text-2xl text-orange-900 dark:text-orange-100">
                Loading...
              </CardTitle>
              <CardDescription className="text-lg text-orange-700 dark:text-orange-300">
                Processing payment cancellation...
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    }>
      <PaymentCancelContent />
    </Suspense>
  )
}
