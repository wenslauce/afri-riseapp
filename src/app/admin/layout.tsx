import { redirect } from 'next/navigation'
import { adminAuthService } from '@/lib/admin/AdminAuth'
import AdminLayout from '@/components/admin/AdminLayout'

export default async function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  // Check if user is authenticated as admin
  const admin = await adminAuthService.getCurrentAdmin()
  
  if (!admin) {
    redirect('/admin-auth/login')
  }

  return <AdminLayout admin={admin}>{children}</AdminLayout>
}
