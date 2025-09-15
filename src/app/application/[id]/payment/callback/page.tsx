'use client'

import { useEffect, useState, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, AlertCircle, Loader2, ArrowRight } from 'lucide-react'

interface PaymentCallbackPageProps {
  params: Promise<{
    id: string
  }>
}

export default function PaymentCallbackPage({ params }: PaymentCallbackPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const handlePaymentCallback = async () => {
      try {
        const reference = searchParams.get('reference')
        const trxref = searchParams.get('trxref')
        
        // Paystack uses 'reference' or 'trxref' parameter
        const transactionId = reference || trxref
        
        if (!transactionId) {
          throw new Error('Transaction reference not found')
        }

        // Verify payment with Paystack
        try {
          const response = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ reference: transactionId })
          })

          const result = await response.json()

          if (result.success && result.status === 'completed') {
            setStatus('success')
            setMessage('Payment completed successfully!')
          } else {
            setStatus('error')
            setMessage('Payment verification failed. Please contact support.')
          }
        } catch (verifyError) {
          console.error('Payment verification error:', verifyError)
          setStatus('error')
          setMessage('Payment verification failed. Please contact support.')
        }
      } catch (error) {
        console.error('Payment callback error:', error)
        setStatus('error')
        setMessage('An error occurred while processing your payment.')
      }
    }

    handlePaymentCallback()
  }, [searchParams, router, id])

  // Countdown and redirect logic
  useEffect(() => {
    if (status !== 'loading') {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            if (status === 'success') {
              router.push(`/application/${id}/complete`)
            } else {
              router.push(`/application/${id}/payment`)
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [status, router, id])

  const handleManualRedirect = () => {
    if (status === 'success') {
      router.push(`/application/${id}/complete`)
    } else {
      router.push(`/application/${id}/payment`)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="glass-card">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-6">
              {status === 'loading' && (
                <>
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-foreground mb-2">
                      Processing Payment
                    </h2>
                    <p className="text-muted-foreground">
                      Please wait while we verify your payment...
                    </p>
                  </div>
                </>
              )}

              {status === 'success' && (
                <>
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mx-auto">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-foreground mb-2">
                      Payment Successful!
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      Your application fee has been paid successfully.
                    </p>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Redirecting to next step in {countdown} seconds...
                      </p>
                      <Button 
                        onClick={handleManualRedirect}
                        className="w-full"
                      >
                        Continue to NDA Signing
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </>
              )}

              {status === 'error' && (
                <>
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mx-auto">
                    <AlertCircle className="h-8 w-8 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-foreground mb-2">
                      Payment Verification Failed
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      {message}
                    </p>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Redirecting back to payment in {countdown} seconds...
                      </p>
                      <Button 
                        variant="outline"
                        onClick={handleManualRedirect}
                        className="w-full"
                      >
                        Return to Payment
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
