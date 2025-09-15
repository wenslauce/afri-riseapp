import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import ApplicationFeeManager from '@/components/admin/ApplicationFeeManager'
import PaymentModeManager from '@/components/admin/PaymentModeManager'

export default async function SettingsPage() {
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

  // Check if user is super admin
  const isSuperAdmin = adminUser.role === 'super_admin'

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage system settings and configuration
          </p>
        </div>

        <div className="space-y-8">
          {/* Payment Mode Management */}
          {isSuperAdmin && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Payment Mode Management</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Switch between test and live payment modes
                </p>
              </div>
              <div className="p-6">
                <PaymentModeManager />
              </div>
            </div>
          )}

          {/* Application Fee Management */}
          {isSuperAdmin && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Application Fee Management</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Control application fees and payment settings
                </p>
              </div>
              <div className="p-6">
                <ApplicationFeeManager />
              </div>
            </div>
          )}

          {/* General Settings */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">General Settings</h2>
              <p className="text-sm text-gray-600 mt-1">
                Basic system configuration
              </p>
            </div>
            <div className="p-6">
              <div className="text-center py-8">
                <div className="mx-auto h-12 w-12 text-gray-400">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">General Settings Coming Soon</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Additional system settings will be available here.
                </p>
              </div>
            </div>
          </div>

          {/* Access Control Notice */}
          {!isSuperAdmin && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <div className="text-yellow-400">
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Limited Access</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    You need super admin privileges to access payment and fee management settings.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
