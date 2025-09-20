'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Application, UserProfile, PaymentRecord } from '@/types'
import { createPaymentRecord, updatePaymentRecordByReference } from '@/lib/database-client'
import { usePaystack } from '@makozi/paystack-react-pay'
import { 
  paymentFormSchema, 
  PaymentFormData, 
  countryOptions, 
  paymentGatewayOptions,
  currencyOptions,
  formatCurrency,
  convertToLowestUnit 
} from '@/lib/validation/payment-schema'
import { CurrencyService } from '@/lib/payments/CurrencyService'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import { 
  CreditCard, 
  User, 
  MapPin, 
  Smartphone, 
  Mail,
  AlertCircle,
  Loader2,
  Shield,
  CheckCircle
} from 'lucide-react'

interface ModernPaymentFormProps {
  application: Application
  userProfile: UserProfile | null
  amount: number
  currency: string
  onPaymentInitiated: (paymentData: { amount: number; currency: string; paymentMethod: string; reference: string }) => Promise<void>
  onPaymentCompleted: (payment: PaymentRecord) => void
  onPaymentFailed: (error: string) => void
  isProcessing: boolean
}

interface ConversionDisplayProps {
  fromAmount: number
  fromCurrency: string
  toCurrency: string
}

export default function ModernPaymentForm({
  application,
  userProfile,
  amount,
  currency,
  onPaymentInitiated,
  onPaymentCompleted,
  onPaymentFailed,
  isProcessing
}: ModernPaymentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [conversionInfo, setConversionInfo] = useState<{
    displayText: string
    convertedAmount: number
    exchangeRate: number
  } | null>(null)

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      first_name: userProfile?.contact_person?.split(' ')[0] || '',
      last_name: userProfile?.contact_person?.split(' ').slice(1).join(' ') || '',
      email: userProfile?.email || '',
      phone: userProfile?.phone || '',
      address: userProfile?.official_address || '',
      city: userProfile?.city || '',
      country_code: 'KE', // Default to Kenya since business is Kenya-based
      payment_gateway: 'paystack',
      payment_currency: currency || 'USD',
      accept_terms: false,
      payment_method: 'card',
    },
    mode: 'onChange',
  })

  const { handleSubmit, watch, formState: { errors, isValid } } = form
  const watchedValues = watch()
  
  // Update conversion info when currency changes
  useEffect(() => {
    const updateConversionInfo = async () => {
      if ((watchedValues.payment_currency || currency || 'USD') === 'USD') {
        try {
          const conversion = await CurrencyService.convertCurrency({
            amount: amount,
            fromCurrency: 'USD',
            toCurrency: 'KES'
          })
          
          setConversionInfo({
            displayText: conversion.displayText,
            convertedAmount: conversion.convertedAmount,
            exchangeRate: conversion.exchangeRate
          })
        } catch (error) {
          console.error('Failed to get conversion info:', error)
          setConversionInfo(null)
        }
      } else {
        setConversionInfo(null)
      }
    }
    
    updateConversionInfo()
  }, [watchedValues.payment_currency, currency, amount])

  // Initialize Pesapal payment
  const initializePesapalPayment = async (data: PaymentFormData, reference: string) => {
    try {
      const response = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          gateway: 'pesapal',
          amount: conversionInfo?.convertedAmount || amount,
          currency: conversionInfo ? 'KES' : (watchedValues.payment_currency || currency || 'USD'),
          description: 'Application Fee Payment',
          reference: reference,
          customerEmail: data.email,
          customerName: `${data.first_name} ${data.last_name}`,
          callbackUrl: `${window.location.origin}/payment/callback`,
          cancelUrl: `${window.location.origin}/payment/cancel`,
          metadata: {
            application_id: application.id,
            customer_name: `${data.first_name} ${data.last_name}`,
            phone: data.phone,
            address: data.address,
            city: data.city,
            country: data.country_code,
            originalAmount: amount,
            originalCurrency: currency,
            conversionRate: conversionInfo?.exchangeRate,
            convertedAmount: conversionInfo?.convertedAmount
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to initialize Pesapal payment')
      }

      const result = await response.json()

      if (result.success && result.redirectUrl) {
        // Redirect to Pesapal payment page
        window.location.href = result.redirectUrl
      } else {
        throw new Error(result.error || 'Failed to initialize payment')
      }
    } catch (error) {
      console.error('Pesapal initialization error:', error)
      throw error
    }
  }

  // Paystack integration
  const paymentReference = `APP-${application.id}-${Date.now()}`
  
  const { initializePayment: initializePaystackPayment } = usePaystack({
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
    email: watchedValues.email,
    amount: convertToLowestUnit(conversionInfo?.convertedAmount || amount, conversionInfo ? 'KES' : (watchedValues.payment_currency || currency || 'USD')),
    currency: conversionInfo ? 'KES' : (watchedValues.payment_currency || currency || 'USD'),
    reference: paymentReference,
    metadata: {
      application_id: application.id,
      customer_name: `${watchedValues.first_name} ${watchedValues.last_name}`,
      phone: watchedValues.phone,
      address: watchedValues.address,
      city: watchedValues.city,
      country: watchedValues.country_code,
    },
    onSuccess: async (response) => {
      try {
        setIsSubmitting(true)
        console.log('Paystack payment success callback triggered:', response)
        
        // Update the existing pending payment record to completed
        // Use response.reference (the actual transaction ID) not our generated paymentReference
        const paymentRecord = await updatePaymentRecordByReference(response.reference, {
          status: 'completed',
          paid_at: new Date().toISOString(),
          gateway_response: {
            ...response,
            payment_completed_at: new Date().toISOString()
          }
        })

        console.log('Payment record updated successfully:', paymentRecord)

        // Notify parent component
        onPaymentCompleted(paymentRecord)
        
      } catch (error) {
        console.error('Payment success handling failed:', error)
        console.error('Error details:', {
          error: error,
          responseReference: response?.reference,
          originalPaymentReference: paymentReference,
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        })
        onPaymentFailed('Payment completed but there was an error processing the result. Please contact support.')
      } finally {
        setIsSubmitting(false)
      }
    },
    onClose: () => {
      setIsSubmitting(false)
      // Payment was cancelled by user
    },
    config: {
      currency: currency,
      channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
    }
  })

  const onSubmit = async (data: PaymentFormData) => {
    try {
      setIsSubmitting(true)
      setSubmitError(null)

      // Validate payment gateway selection
      if (!['paystack', 'pesapal'].includes(data.payment_gateway)) {
        throw new Error('Please select a valid payment gateway')
      }

      // Create payment record as pending
      let pendingPaymentRecord
      console.log('Creating pending payment record with reference:', paymentReference)
      try {
        pendingPaymentRecord = await createPaymentRecord({
          application_id: application.id,
          payment_gateway: data.payment_gateway,
          gateway_transaction_id: paymentReference,
          gateway_reference: paymentReference,
          amount: conversionInfo?.convertedAmount || amount,
          currency: conversionInfo ? 'KES' : (watchedValues.payment_currency || currency || 'USD'),
          status: 'pending',
          gateway_response: {
            customer_data: {
              first_name: data.first_name,
              last_name: data.last_name,
              email: data.email,
              phone: data.phone,
              address: data.address,
              city: data.city,
              country_code: data.country_code,
            },
            conversion_info: conversionInfo,
            original_amount: amount,
            original_currency: currency,
            final_amount: conversionInfo?.convertedAmount || amount,
            final_currency: conversionInfo ? 'KES' : (watchedValues.payment_currency || currency)
          }
        })
        console.log('Pending payment record created:', pendingPaymentRecord)
      } catch (dbError) {
        console.error('Failed to create payment record:', dbError)
        const errorMessage = dbError instanceof Error ? dbError.message : 'Database error'
        throw new Error(`Database error: ${errorMessage}. Please check your connection and try again.`)
      }

      // Notify parent that payment is being initiated
      await onPaymentInitiated({
        amount: conversionInfo?.convertedAmount || amount,
        currency: conversionInfo ? 'KES' : (watchedValues.payment_currency || currency || 'USD'),
        paymentMethod: data.payment_gateway,
        reference: paymentReference
      })

      // Initialize payment based on selected gateway
      if (data.payment_gateway === 'paystack') {
        initializePaystackPayment()
      } else if (data.payment_gateway === 'pesapal') {
        // For Pesapal, we need to make an API call to initialize payment
        await initializePesapalPayment(data, paymentReference)
      }

    } catch (error) {
      console.error('Payment submission failed:', error)
      setSubmitError(error instanceof Error ? error.message : 'Payment failed. Please try again.')
      onPaymentFailed(error instanceof Error ? error.message : 'Payment failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Payment Information</CardTitle>
        <CardDescription>
          Please provide your payment details to complete the application process
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Customer Information */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <User className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Personal Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+234 801 234 5678" {...field} />
                      </FormControl>
                      <FormDescription>
                        Include country code (e.g., +234 for Nigeria)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Address Information */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <MapPin className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Billing Address</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Street Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main Street, Area Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="Lagos" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="country_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {countryOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Currency Selection */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <CreditCard className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Payment Currency</h3>
              </div>
              
              <FormField
                control={form.control}
                name="payment_currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Payment Currency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {currencyOptions.map((currency) => (
                          <SelectItem key={currency.value} value={currency.value}>
                            <div className="flex flex-col">
                              <span>{currency.label}</span>
                              {currency.conversionNote && (
                                <span className="text-xs text-muted-foreground">
                                  {currency.conversionNote}
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Currency Conversion Display */}
              {conversionInfo && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Currency Conversion
                    </span>
                  </div>
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <div><strong>Original fee:</strong> {CurrencyService.formatCurrency(amount, 'USD')}</div>
                    <div><strong>Processing amount:</strong> {CurrencyService.formatCurrency(conversionInfo.convertedAmount, 'KES')}</div>
                    <div className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                      Exchange rate: 1 USD = {conversionInfo.exchangeRate.toFixed(2)} KES
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-300">
                      Payment processed in KES • Settled to Kenya-based account
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Payment Gateway Selection */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Payment Method</h3>
              </div>
              
              <FormField
                control={form.control}
                name="payment_gateway"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RadioGroup 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        className="grid grid-cols-1 gap-4"
                      >
                        {paymentGatewayOptions.map((gateway) => (
                          <div key={gateway.value} className="flex items-center space-x-2">
                            <RadioGroupItem value={gateway.value} id={gateway.value} />
                            <label
                              htmlFor={gateway.value}
                              className="flex-1 flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-muted/50"
                            >
                              <div className="flex-1">
                                <div className="font-medium">{gateway.label}</div>
                                <div className="text-sm text-muted-foreground mb-2">
                                  {gateway.description}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <div className="flex flex-wrap gap-1">
                                    {gateway.currencies.map(curr => (
                                      <Badge key={curr} variant="outline" className="text-xs">
                                        {curr}
                                      </Badge>
                                    ))}
                                  </div>
                                  {gateway.features && (
                                    <div className="flex flex-wrap gap-1">
                                      {gateway.features.slice(0, 2).map(feature => (
                                        <Badge key={feature} variant="secondary" className="text-xs">
                                          {feature}
                                        </Badge>
                                      ))}
                                      {gateway.features.length > 2 && (
                                        <Badge variant="secondary" className="text-xs">
                                          +{gateway.features.length - 2} more
                                        </Badge>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </label>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Terms and Conditions */}
            <FormField
              control={form.control}
              name="accept_terms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      I accept the terms and conditions
                    </FormLabel>
                    <FormDescription>
                      By proceeding with payment, you agree to our{' '}
                      <a href="/terms" className="text-primary hover:underline">
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a href="/privacy" className="text-primary hover:underline">
                        Privacy Policy
                      </a>
                    </FormDescription>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            {/* Error Alert */}
            {submitError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2 p-4 bg-muted/50 rounded-lg">
                <Shield className="h-5 w-5 text-green-600" />
                <span className="text-sm text-muted-foreground">
                  Your payment is secured with 256-bit SSL encryption
                </span>
              </div>
              
              <Button 
                type="submit"
                size="lg"
                className="w-full"
                disabled={isSubmitting || isProcessing || !isValid}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay {conversionInfo ? 
                      CurrencyService.formatCurrency(conversionInfo.convertedAmount, 'KES') :
                      CurrencyService.formatCurrency(amount, watchedValues.payment_currency || currency || 'USD')
                    }
                  </>
                )}
              </Button>
              
              <p className="text-center text-xs text-muted-foreground">
                This payment will be processed by {watchedValues.payment_gateway === 'pesapal' ? 'Pesapal' : 'Paystack'}, our secure payment partner
              </p>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
