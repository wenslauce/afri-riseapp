/**
 * Script to create the first super admin user
 * Run this script to set up your initial super admin account
 */

import { createClient } from '@supabase/supabase-js'

// You'll need to replace these with your actual Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials!')
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment variables.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createSuperAdmin() {
  try {
    console.log('🚀 Creating super admin account...')
    
    // Get admin details from command line arguments or use defaults
    const email = process.argv[2] || 'admin@afri-rise.com'
    const password = process.argv[3] || 'Admin123!@#'
    
    console.log(`📧 Email: ${email}`)
    console.log(`🔑 Password: ${password}`)
    
    // Create user in Supabase Auth
    console.log('👤 Creating user in Supabase Auth...')
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    if (authError) {
      console.error('❌ Failed to create user in Auth:', authError.message)
      return
    }

    console.log('✅ User created in Auth successfully')

      // Create admin record
      console.log('👨‍💼 Creating admin record...')
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .insert({
          user_id: authData.user.id,
          email,
          role: 'super_admin',
          is_active: true,
          created_by: null, // First admin user, no creator
          created_at: new Date().toISOString()
        })
        .select()
        .single()

    if (adminError) {
      console.error('❌ Failed to create admin record:', adminError.message)
      // Cleanup: delete the auth user if admin creation failed
      await supabase.auth.admin.deleteUser(authData.user.id)
      return
    }

    console.log('✅ Admin record created successfully')
    console.log('🎉 Super admin account created successfully!')
    console.log('')
    console.log('📋 Login Details:')
    console.log(`   Email: ${email}`)
    console.log(`   Password: ${password}`)
    console.log(`   Role: super_admin`)
    console.log('')
    console.log('🔗 You can now login at: http://localhost:3000/admin-auth/login')
    console.log('')
    console.log('⚠️  Important Security Notes:')
    console.log('   1. Change your password after first login')
    console.log('   2. Keep your credentials secure')
    console.log('   3. Consider setting up 2FA for additional security')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Run the script
createSuperAdmin()
