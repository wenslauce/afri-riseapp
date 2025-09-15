import { getUser } from '@/lib/auth'
import { 
  getUserProfile, 
  getApplicationsByUserId, 
  getPaymentsByUserId,
  getDocumentsByUserId,
  getNDASignaturesByUserId
} from '@/lib/database'
import ModernMainDashboard from '@/components/dashboard/ModernMainDashboard'
import AuthInterface from '@/components/auth/AuthInterface'

export default async function Home() {
  // Check if user is authenticated
  const user = await getUser()

  // If user is authenticated, show their dashboard
  if (user) {
    try {
      const userProfile = await getUserProfile(user.id)
      const applications = await getApplicationsByUserId(user.id)
      const payments = await getPaymentsByUserId(user.id)
      const documents = await getDocumentsByUserId(user.id)
      const signatures = await getNDASignaturesByUserId(user.id)

      return (
        <ModernMainDashboard 
          user={user}
          userProfile={userProfile}
          applications={applications}
          payments={payments}
          documents={documents}
          signatures={signatures}
        />
      )
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      // If there's an error loading user data, fall back to auth interface
      return <AuthInterface />
    }
  }

  // If user is not authenticated, show login/signup interface
  return <AuthInterface />
}