import { requireAuth } from '@/lib/auth'
import { getUserProfile } from '@/lib/database'
import { redirect } from 'next/navigation'
import ModernApplicationForm from '@/components/application/ModernApplicationForm'

export default async function NewApplicationPage() {
  const user = await requireAuth()
  const userProfile = await getUserProfile(user.id)

  // Redirect to profile completion if profile is not complete
  if (!userProfile) {
    redirect('/profile?redirect=/application/new')
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container px-4 sm:px-6 lg:px-8">
        <ModernApplicationForm user={user} userProfile={userProfile} />
      </div>
    </div>
  )
}
