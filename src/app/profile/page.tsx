import { requireAuth } from '@/lib/auth'
import { getUserProfile, getCountries } from '@/lib/database'
import ProfileForm from '@/components/profile/ProfileForm'

export default async function ProfilePage() {
  const user = await requireAuth()
  const userProfile = await getUserProfile(user.id)
  const countries = await getCountries()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">
              {userProfile ? 'Edit Profile' : 'Complete Your Profile'}
            </h1>
            <p className="text-gray-600">
              {userProfile 
                ? 'Update your company information and contact details'
                : 'Please complete your profile to start the loan application process'
              }
            </p>
          </div>
          
          <div className="px-6 py-6">
            <ProfileForm 
              user={user}
              userProfile={userProfile}
              countries={countries}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
