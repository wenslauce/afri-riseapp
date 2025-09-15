import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import UsersManagement from '@/components/admin/UsersManagement'

export default async function UsersPage() {
  const supabase = await createClient()
  
  // Get current user from auth
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/admin-auth/login')
  }

  // Check if user is an admin
  const { data: adminUser, error: adminError } = await supabase
    .from('admin_users')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (adminError || !adminUser) {
    redirect('/admin-auth/login')
  }

  return <UsersManagement />
}
