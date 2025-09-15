import { requireAuth } from '@/lib/auth'
import { getApplicationById, getUserProfile, getDocumentsByApplicationId, getPaymentsByApplicationId } from '@/lib/database'
import { notFound } from 'next/navigation'
import ModernPaymentManager from '@/components/payment/ModernPaymentManager'

interface PaymentPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function PaymentPage({ params }: PaymentPageProps) {
  const user = await requireAuth()
  const { id } = await params
  const application = await getApplicationById(id)
  
  if (!application || application.user_id !== user.id) {
    notFound()
  }
  
  const userProfile = await getUserProfile(user.id)
  const documents = await getDocumentsByApplicationId(application.id)
  const payments = await getPaymentsByApplicationId(application.id)
  
  // Check if all required documents are uploaded
  // This is a simplified check - in reality, you'd verify against country requirements
  const hasRequiredDocuments = documents.length > 0
  
  if (!hasRequiredDocuments) {
    notFound() // Redirect to documents page
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container px-4 sm:px-6 lg:px-8">
        <ModernPaymentManager 
          application={application}
          userProfile={userProfile}
          documents={documents}
          existingPayments={payments}
        />
      </div>
    </div>
  )
}