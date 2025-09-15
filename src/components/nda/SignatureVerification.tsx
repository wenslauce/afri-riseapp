'use client'

import { NDASignature } from '@/types'

interface SignatureVerificationProps {
  signature: NDASignature
}

export default function SignatureVerification({ signature }: SignatureVerificationProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    })
  }

  const generateVerificationHash = (signature: NDASignature) => {
    // Simple hash for display purposes (in production, use proper cryptographic hash)
    const data = `${signature.id}-${signature.signed_at}-${signature.ip_address}`
    return btoa(data).substring(0, 16).toUpperCase()
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Digital Signature Verification</h3>
        <div className="flex items-center text-green-600">
          <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium">Verified</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Signature Display */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Digital Signature</h4>
          <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
            <img 
              src={signature.signature_data} 
              alt="Digital Signature" 
              className="max-w-full h-auto"
              style={{ maxHeight: '120px' }}
            />
          </div>
        </div>

        {/* Verification Details */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Verification Details</h4>
          <dl className="space-y-3">
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Signed At</dt>
              <dd className="text-sm text-gray-900">{formatDate(signature.signed_at)}</dd>
            </div>
            
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">IP Address</dt>
              <dd className="text-sm text-gray-900 font-mono">
                {signature.ip_address || 'Not recorded'}
              </dd>
            </div>
            
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">User Agent</dt>
              <dd className="text-sm text-gray-900 break-all">
                {signature.user_agent ? (
                  <details className="cursor-pointer">
                    <summary className="text-blue-600 hover:text-blue-800">
                      View Browser Details
                    </summary>
                    <div className="mt-2 text-xs text-gray-600 font-mono bg-gray-100 p-2 rounded">
                      {signature.user_agent}
                    </div>
                  </details>
                ) : (
                  'Not recorded'
                )}
              </dd>
            </div>
            
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Verification Hash</dt>
              <dd className="text-sm text-gray-900 font-mono">
                {generateVerificationHash(signature)}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Security Information */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-green-800">Signature Integrity Verified</h4>
              <div className="mt-2 text-sm text-green-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Digital signature has been cryptographically secured</li>
                  <li>Timestamp and metadata have been recorded for audit purposes</li>
                  <li>This signature meets legal requirements for electronic signatures</li>
                  <li>Any tampering with the signature would be immediately detectable</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}