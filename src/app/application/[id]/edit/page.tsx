import { requireAuth } from '@/lib/auth'
import { getApplicationById, getUserProfile } from '@/lib/database'
import { notFound } from 'next/navigation'
import ModernEditApplicationForm from '@/components/application/ModernEditApplicationForm'

interface EditApplicationPageProps {
  params: {
    id: string
  }
}

export default async function EditApplicationPage({ params }: EditApplicationPageProps) {
  const user = await requireAuth()
  const { id } = await params
  const application = await getApplicationById(id)
  
  if (!application || application.user_id !== user.id) {
    notFound()
  }
  
  // Only allow editing of draft applications
  if (application.status !== 'draft') {
    notFound()
  }
  
  const userProfile = await getUserProfile(user.id)

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container px-4 sm:px-6 lg:px-8">
        <ModernEditApplicationForm 
          application={application}
          userProfile={userProfile}
        />
      </div>
    </div>
  )
}