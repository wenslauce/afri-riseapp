import { requireAuth } from '@/lib/auth'
import { getApplicationById, getUserProfile, getNDASignatureByApplicationId } from '@/lib/database'
import { notFound, redirect } from 'next/navigation'
import NDASigningManager from '@/components/nda/NDASigningManager'

interface NDAPageProps {
  params: {
    id: string
  }
}

export default async function NDAPage({ params }: NDAPageProps) {
  const user = await requireAuth()
  const { id } = await params
  const application = await getApplicationById(id)
  
  if (!application || application.user_id !== user.id) {
    notFound()
  }
  
  const userProfile = await getUserProfile(user.id)
  
  // Check if NDA is already signed
  const existingSignature = await getNDASignatureByApplicationId(application.id)
  
  if (existingSignature) {
    // Redirect to completion page or dashboard
    redirect(`/application/${application.id}/complete`)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">
              Non-Disclosure Agreement
            </h1>
            <p className="text-gray-600">
              Please review and sign the NDA to complete your loan application
            </p>
          </div>
          
          <div className="px-6 py-6">
            <NDASigningManager 
              application={application}
              userProfile={userProfile}
            />
          </div>
        </div>
      </div>
    </div>
  )
}