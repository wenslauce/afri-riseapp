import { requireAuth } from '@/lib/auth'
import { getApplicationById, getUserProfile, getDocumentsByApplicationId } from '@/lib/database'
import { notFound } from 'next/navigation'
import ModernDocumentUploadManager from '@/components/documents/ModernDocumentUploadManager'

interface DocumentsPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function DocumentsPage({ params }: DocumentsPageProps) {
  const user = await requireAuth()
  const { id } = await params
  const application = await getApplicationById(id)
  
  if (!application || application.user_id !== user.id) {
    notFound()
  }
  
  const userProfile = await getUserProfile(user.id)
  const existingDocuments = await getDocumentsByApplicationId(application.id)

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container px-4 sm:px-6 lg:px-8">
        <ModernDocumentUploadManager 
          application={application}
          userProfile={userProfile}
          existingDocuments={existingDocuments}
        />
      </div>
    </div>
  )
}