'use client'

import { useState } from 'react'
import { Application, PaymentRecord } from '@/types'
import { format } from 'date-fns'
import { formatCurrency } from '@/lib/validation/payment-schema'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'

import { 
  CheckCircle, 
  ArrowRight, 
  Download, 
  Calendar,
  CreditCard,
  Hash,
  Building,
  FileText,
  Clock,
  AlertTriangle
} from 'lucide-react'

interface ModernPaymentStatusProps {
  payment: PaymentRecord
  application: Application
  onContinue: () => void
}

export default function ModernPaymentStatus({
  payment,
  application,
  onContinue
}: ModernPaymentStatusProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'success':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>
      case 'failed':
      case 'error':
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const downloadReceipt = async () => {
    try {
      setIsDownloading(true)
      // Here you would implement receipt download functionality
      // For now, we'll simulate the download
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Create a simple receipt text
      const receiptContent = `
PAYMENT RECEIPT
===============

Application ID: ${application.id}
Payment Date: ${payment.paid_at ? format(new Date(payment.paid_at), 'PPP') : 'N/A'}
Amount: ${formatCurrency(payment.amount, payment.currency)}
Transaction ID: ${payment.gateway_transaction_id}
Payment Gateway: ${payment.payment_gateway}
Status: ${payment.status}

Thank you for your payment!
      `
      
      // Create and trigger download
      const blob = new Blob([receiptContent], { type: 'text/plain' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `payment-receipt-${payment.gateway_transaction_id}.txt`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Receipt download failed:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  const isPaymentCompleted = payment.status === 'completed' || payment.status === 'success'

  return (
    <div className="space-y-6">
      {/* Success Status */}
      {isPaymentCompleted ? (
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-green-800">Payment Successful!</h3>
                <p className="text-green-700">
                  Your application fee has been processed successfully
                </p>
              </div>
            </div>
            
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Your payment has been confirmed and your loan application is now being processed. 
                You can proceed to the next step: signing the digital NDA.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-orange-800">Payment Pending</h3>
                <p className="text-orange-700">
                  We're still processing your payment
                </p>
              </div>
            </div>
            
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Your payment is being verified. This usually takes a few minutes. 
                You'll receive an email confirmation once the payment is processed.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Payment Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Payment Details
          </CardTitle>
          <CardDescription>
            Summary of your payment transaction
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount Paid:</span>
                <span className="font-medium">
                  {formatCurrency(payment.amount, payment.currency)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                {getStatusBadge(payment.status)}
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method:</span>
                <span className="font-medium capitalize">
                  {payment.payment_gateway}
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transaction ID:</span>
                <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                  {payment.gateway_transaction_id}
                </span>
              </div>
              
              {payment.paid_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Date:</span>
                  <span className="font-medium">
                    {format(new Date(payment.paid_at), 'PPP')}
                  </span>
                </div>
              )}
              
              {payment.gateway_reference && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reference:</span>
                  <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                    {payment.gateway_reference}
                  </span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Application Reference */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Building className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">Application Reference</div>
                <div className="text-sm text-muted-foreground">
                  {application.id.slice(0, 8).toUpperCase()}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadReceipt}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>Generating...</>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Receipt
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
          <CardDescription>
            What happens after your payment is confirmed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 mt-0.5">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <div className="font-medium">Payment Confirmed</div>
                <div className="text-sm text-muted-foreground">
                  Your application fee has been successfully processed
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className={`flex h-6 w-6 items-center justify-center rounded-full mt-0.5 ${
                isPaymentCompleted 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                <span className="text-xs font-medium">2</span>
              </div>
              <div>
                <div className="font-medium">Digital NDA Signing</div>
                <div className="text-sm text-muted-foreground">
                  Sign the Non-Disclosure Agreement digitally
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground mt-0.5">
                <span className="text-xs font-medium">3</span>
              </div>
              <div>
                <div className="font-medium">Application Review</div>
                <div className="text-sm text-muted-foreground">
                  Our team will review your complete application
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground mt-0.5">
                <span className="text-xs font-medium">4</span>
              </div>
              <div>
                <div className="font-medium">Loan Decision</div>
                <div className="text-sm text-muted-foreground">
                  Receive notification about your loan application status
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {isPaymentCompleted ? (
            <Button 
              onClick={onContinue}
              size="lg"
              className="w-full"
            >
              Continue to NDA Signing
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Once your payment is confirmed, you can proceed to the next step
              </p>
              <Button 
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Refresh Status
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
