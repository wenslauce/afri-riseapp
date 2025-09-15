import { requireAuth } from '@/lib/auth'
import { 
  getUserProfile, 
  getApplicationsByUserId, 
  getPaymentsByUserId,
  getDocumentsByUserId,
  getNDASignaturesByUserId
} from '@/lib/database'
import ModernMainDashboard from '@/components/dashboard/ModernMainDashboard'

export default async function DashboardPage() {
  const user = await requireAuth()
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
}