'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Application, UserProfile, PaymentRecord } from '@/types'
import { paymentService } from '@/lib/payments/PaymentService'
import { getPaymentsByApplicationId } from '@/lib/database-client'
import { applicationFeeClient } from '@/lib/application-fees/ApplicationFeeClient'
import ModernPaymentForm from './ModernPaymentForm'
import ModernPaymentStatus from './ModernPaymentStatus'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

import { 
  CreditCard, 
  DollarSign, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  ArrowLeft,
  FileText
} from 'lucide-react'

interface ModernPaymentManagerProps {
  application: Application
  userProfile: UserProfile | null
  documents: any[]
  existingPayments: PaymentRecord[]
}

type PaymentStep = 'form' | 'processing' | 'verification' | 'completed' | 'failed'

export default function ModernPaymentManager({ 
  application, 
  userProfile, 
  documents, 
  existingPayments 
}: ModernPaymentManagerProps) {
  const router = useRouter()
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>(existingPayments)
  const [currentPayment, setCurrentPayment] = useState<PaymentRecord | null>(null)
  const [applicationFee, setApplicationFee] = useState<number>(300.00)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paymentStep, setPaymentStep] = useState<PaymentStep>('form')

  useEffect(() => {
    loadPaymentData()
  }, [application.id])

  const loadPaymentData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Determine payment mode based on environment
      const paymentMode = process.env.NODE_ENV === 'production' ? 'live' : 'test'
      
      // Load application fee and payment records
      const [payments, fee] = await Promise.all([
        getPaymentsByApplicationId(application.id),
        applicationFeeClient.getApplicationFee(paymentMode)
      ])
      
      setPaymentRecords(payments)
      setApplicationFee(fee)
      
      // Check current payment status
      const completedPayment = payments.find(p => p.status === 'completed')
      const pendingPayment = payments.find(p => p.status === 'pending')
      
      if (completedPayment) {
        setCurrentPayment(completedPayment)
        setPaymentStep('completed')
      } else if (pendingPayment) {
        setCurrentPayment(pendingPayment)
        setPaymentStep('verification')
      } else {
        setPaymentStep('form')
      }
      
    } catch (error) {
      console.error('Failed to load payment data:', error)
      setError('Failed to load payment information. Please refresh the page.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaymentInitiated = async (paymentData: {
    amount: number
    currency: string
    paymentMethod: string
    reference: string
  }) => {
    try {
      setError(null)
      setPaymentStep('processing')

      // Here you would typically create a payment record and redirect to gateway
      // The actual payment processing happens in the payment form component
      
    } catch (error) {
      console.error('Payment initiation failed:', error)
      setError('Failed to initiate payment. Please try again.')
      setPaymentStep('failed')
    }
  }

  const handlePaymentCompleted = async (paymentRecord: PaymentRecord) => {
    setCurrentPayment(paymentRecord)
    setPaymentRecords(prev => [...prev, paymentRecord])
    setPaymentStep('completed')
  }

  const handlePaymentFailed = (errorMessage: string) => {
    setError(errorMessage)
    setPaymentStep('failed')
  }

  const getStepProgress = () => {
    switch (paymentStep) {
      case 'form': return 25
      case 'processing': return 50
      case 'verification': return 75
      case 'completed': return 100
      case 'failed': return 0
      default: return 0
    }
  }

  const getStepDescription = () => {
    switch (paymentStep) {
      case 'form': return 'Complete payment information'
      case 'processing': return 'Processing your payment...'
      case 'verification': return 'Verifying payment status'
      case 'completed': return 'Payment completed successfully'
      case 'failed': return 'Payment failed'
      default: return ''
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Loading payment information...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl flex items-center">
                <CreditCard className="h-6 w-6 mr-3 text-primary" />
                Application Fee Payment
              </CardTitle>
              <CardDescription>
                Complete your loan application by paying the processing fee
              </CardDescription>
            </div>
            <div className="flex items-center space-x-3">
              <Badge 
                variant={paymentStep === 'completed' ? "default" : "secondary"}
                className="text-sm"
              >
                {paymentStep === 'completed' ? 'Paid' : 'Pending'}
              </Badge>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  ${applicationFee.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">USD</div>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{getStepDescription()}</span>
              <span>{getStepProgress()}%</span>
            </div>
            <Progress value={getStepProgress()} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Payment Content */}
      {paymentStep === 'completed' ? (
        <ModernPaymentStatus
          payment={currentPayment!}
          application={application}
          onContinue={() => router.push(`/application/${application.id}/nda`)}
        />
      ) : paymentStep === 'verification' ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <Clock className="h-12 w-12 text-primary mx-auto animate-pulse" />
              <div>
                <h3 className="text-lg font-semibold">Payment Verification</h3>
                <p className="text-muted-foreground">
                  We're verifying your payment status. This may take a few minutes.
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={loadPaymentData}
                className="mt-4"
              >
                Check Status
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <ModernPaymentForm
              application={application}
              userProfile={userProfile}
              amount={applicationFee}
              currency="USD"
              onPaymentInitiated={handlePaymentInitiated}
              onPaymentCompleted={handlePaymentCompleted}
              onPaymentFailed={handlePaymentFailed}
              isProcessing={paymentStep === 'processing'}
            />
          </div>

          {/* Payment Summary */}
          <div className="space-y-6">
            {/* Fee Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Fee Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Application Processing Fee</span>
                  <span className="font-medium">${applicationFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gateway Fee</span>
                  <span className="font-medium">Included</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total Amount</span>
                  <span className="text-primary">${applicationFee.toFixed(2)} USD</span>
                </div>
              </CardContent>
            </Card>

            {/* Security Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Security & Trust
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>256-bit SSL encryption</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>PCI DSS compliant</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Secure payment processing</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Instant verification</span>
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <Card>
              <CardContent className="pt-6">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/application/${application.id}/documents`)}
                  className="w-full"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Documents
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
