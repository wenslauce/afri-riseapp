import { requireAuth } from '@/lib/auth'
import { getApplicationById, getUserProfile } from '@/lib/database'
import { notFound } from 'next/navigation'
import ApplicationView from '@/components/application/ApplicationView'

interface ApplicationPageProps {
  params: {
    id: string
  }
}

export default async function ApplicationPage({ params }: ApplicationPageProps) {
  const user = await requireAuth()
  const { id } = await params
  const application = await getApplicationById(id)
  
  if (!application || application.user_id !== user.id) {
    notFound()
  }
  
  const userProfile = await getUserProfile(user.id)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <ApplicationView 
          application={application}
          userProfile={userProfile}
        />
      </div>
    </div>
  )
}