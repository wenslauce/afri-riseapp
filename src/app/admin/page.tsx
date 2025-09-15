import { adminAuthService } from '@/lib/admin/AdminAuth'
import AdminDashboard from '@/components/admin/AdminDashboard'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  const admin = await adminAuthService.getCurrentAdmin()
  
  if (!admin) {
    redirect('/admin/login')
  }

  return <AdminDashboard admin={admin} />
}
