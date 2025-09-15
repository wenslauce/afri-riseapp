import { requireAuth } from '@/lib/auth'
import { getApplicationById, getUserProfile, getNDASignatureByApplicationId } from '@/lib/database'
import { notFound } from 'next/navigation'
import SignatureVerification from '@/components/nda/SignatureVerification'
import Link from 'next/link'

interface CompletePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function CompletePage({ params }: CompletePageProps) {
  const user = await requireAuth()
  const { id } = await params
  const application = await getApplicationById(id)
  
  if (!application || application.user_id !== user.id) {
    notFound()
  }
  
  const userProfile = await getUserProfile(user.id)
  const ndaSignature = await getNDASignatureByApplicationId(application.id)
  
  if (!ndaSignature) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">
              Application Completed
            </h1>
            <p className="text-gray-600">
              Your loan application has been successfully submitted
            </p>
          </div>
          
          <div className="px-6 py-6 space-y-8">
            {/* Success Message */}
            <div className="text-center py-8">
              <div className="mx-auto h-16 w-16 text-green-600 mb-4">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Congratulations!
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Your loan application has been successfully submitted and is now under review.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">What happens next?</h3>
                <ul className="space-y-2 text-blue-800">
                  <li className="flex items-start">
                    <span className="flex-shrink-0 h-5 w-5 text-blue-600 mt-0.5 mr-3">
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                    Our team will review your application within 5-7 business days
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 h-5 w-5 text-blue-600 mt-0.5 mr-3">
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                    You&apos;ll receive email updates on your application status
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 h-5 w-5 text-blue-600 mt-0.5 mr-3">
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                    We may contact you for additional information if needed
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 h-5 w-5 text-blue-600 mt-0.5 mr-3">
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                    Upon approval, we&apos;ll schedule a call to discuss loan terms
                  </li>
                </ul>
              </div>
            </div>

            {/* Application Summary */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Summary</h3>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Application ID</dt>
                  <dd className="text-sm text-gray-900 font-mono">{application.id}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Company</dt>
                  <dd className="text-sm text-gray-900">{userProfile?.company_name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Contact Person</dt>
                  <dd className="text-sm text-gray-900">{userProfile?.contact_person}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Financing Amount</dt>
                  <dd className="text-sm text-gray-900">
                    ${application.application_data.financing_amount?.toLocaleString() || 'Not specified'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Submitted</dt>
                  <dd className="text-sm text-gray-900">
                    {new Date(application.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="text-sm">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Under Review
                    </span>
                  </dd>
                </div>
              </dl>
            </div>

            {/* NDA Signature Verification */}
            <SignatureVerification signature={ndaSignature} />

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4 pt-6 border-t border-gray-200">
              <Link
                href="/dashboard"
                className="btn-primary"
              >
                Go to Dashboard
              </Link>
              
              <button
                onClick={() => window.print()}
                className="btn-secondary"
              >
                Print Summary
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}