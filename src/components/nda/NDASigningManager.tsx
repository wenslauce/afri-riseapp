'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Application, UserProfile } from '@/types'
import { createNDASignature } from '@/lib/database-client'
import NDADocument from './NDADocument'
import SignatureCapture from './SignatureCapture'

interface NDASigningManagerProps {
  application: Application
  userProfile: UserProfile | null
}

export default function NDASigningManager({ application, userProfile }: NDASigningManagerProps) {
  const router = useRouter()
  const [hasReadDocument, setHasReadDocument] = useState(false)
  const [isSigningMode, setIsSigningMode] = useState(false)
  const [signatureData, setSignatureData] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDocumentRead = () => {
    setHasReadDocument(true)
  }

  const handleStartSigning = () => {
    setIsSigningMode(true)
  }

  const handleSignatureComplete = (signature: string) => {
    setSignatureData(signature)
  }

  const handleSignatureClear = () => {
    setSignatureData(null)
  }

  const handleSubmitSignature = async () => {
    if (!signatureData) {
      setError('Please provide your signature before submitting')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      // Get user's IP address and user agent for audit trail
      const userAgent = navigator.userAgent
      const ipResponse = await fetch('/api/get-ip')
      const ipData = await ipResponse.json()

      await createNDASignature({
        application_id: application.id,
        signature_data: signatureData,
        ip_address: ipData.ip || 'unknown',
        user_agent: userAgent
      })

      // Redirect to completion page
      router.push(`/application/${application.id}/complete`)
    } catch (error) {
      console.error('Failed to submit signature:', error)
      setError(error instanceof Error ? error.message : 'Failed to submit signature')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Signature Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {!isSigningMode ? (
        <>
          {/* NDA Document Display */}
          <NDADocument 
            application={application}
            userProfile={userProfile}
            onDocumentRead={handleDocumentRead}
          />

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <button
              onClick={() => router.push(`/application/${application.id}/payment`)}
              className="btn-secondary"
            >
              Back to Payment
            </button>
            
            <button
              onClick={handleStartSigning}
              disabled={!hasReadDocument}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {hasReadDocument ? 'Proceed to Sign' : 'Please Read Document First'}
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Signature Capture */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              Digital Signature Required
            </h2>
            <p className="text-sm text-blue-700">
              By signing below, you acknowledge that you have read, understood, and agree to the terms of the Non-Disclosure Agreement.
            </p>
          </div>

          <SignatureCapture
            onSignatureComplete={handleSignatureComplete}
            onSignatureClear={handleSignatureClear}
            signatureData={signatureData}
          />

          {/* Signature Actions */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <button
              onClick={() => setIsSigningMode(false)}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Back to Document
            </button>
            
            <div className="flex space-x-4">
              <button
                onClick={handleSignatureClear}
                className="btn-secondary"
                disabled={isSubmitting || !signatureData}
              >
                Clear Signature
              </button>
              
              <button
                onClick={handleSubmitSignature}
                disabled={isSubmitting || !signatureData}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  'Submit Signature'
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}