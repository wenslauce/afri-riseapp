import { adminAuthService } from '@/lib/admin/AdminAuth'
import ApplicationManagement from '@/components/admin/ApplicationManagement'
import { redirect } from 'next/navigation'

export default async function AdminApplicationsPage() {
  const admin = await adminAuthService.getCurrentAdmin()
  
  if (!admin) {
    redirect('/admin/login')
  }

  return <ApplicationManagement admin={admin} />
}