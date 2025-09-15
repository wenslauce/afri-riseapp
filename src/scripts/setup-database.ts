/**
 * Database setup script
 * 
 * This script should be run to set up the initial database schema and seed data.
 * 
 * Usage:
 * 1. Set up your Supabase project
 * 2. Add your Supabase credentials to .env.local
 * 3. Run the SQL files in the Supabase SQL editor in this order:
 *    - src/database/migrations/001_initial_schema.sql
 *    - src/database/migrations/002_rls_policies.sql
 *    - src/database/migrations/003_storage_setup.sql
 *    - src/database/seed/african_countries.sql
 * 
 * Alternatively, you can run this script with: npm run setup-db
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runSQLFile(filePath: string, description: string) {
  console.log(`Running ${description}...`)
  
  try {
    const sql = readFileSync(filePath, 'utf-8')
    const { error } = await supabase.rpc('exec_sql', { sql })
    
    if (error) {
      console.error(`Error in ${description}:`, error)
      return false
    }
    
    console.log(`✅ ${description} completed successfully`)
    return true
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error)
    return false
  }
}

async function setupDatabase() {
  console.log('🚀 Setting up Afri-Rise Loan Application Database...\n')
  
  const migrations = [
    {
      file: join(process.cwd(), 'src/database/migrations/001_initial_schema.sql'),
      description: 'Initial schema creation'
    },
    {
      file: join(process.cwd(), 'src/database/migrations/002_rls_policies.sql'),
      description: 'Row Level Security policies'
    },
    {
      file: join(process.cwd(), 'src/database/migrations/003_storage_setup.sql'),
      description: 'Storage buckets and policies'
    },
    {
      file: join(process.cwd(), 'src/database/seed/african_countries.sql'),
      description: 'African countries seed data'
    }
  ]
  
  let success = true
  
  for (const migration of migrations) {
    const result = await runSQLFile(migration.file, migration.description)
    if (!result) {
      success = false
      break
    }
  }
  
  if (success) {
    console.log('\n🎉 Database setup completed successfully!')
    console.log('\nNext steps:')
    console.log('1. Update your .env.local file with Supabase credentials')
    console.log('2. Run: npm run dev')
    console.log('3. Visit http://localhost:3000 to start using the application')
  } else {
    console.log('\n❌ Database setup failed. Please check the errors above.')
    process.exit(1)
  }
}

// Create a simple SQL execution function for Supabase
async function createExecSQLFunction() {
  console.log('Creating SQL execution function...')
  
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE OR REPLACE FUNCTION exec_sql(sql text)
      RETURNS void
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        EXECUTE sql;
      END;
      $$;
    `
  })
  
  if (error && !error.message.includes('already exists')) {
    console.error('Error creating exec_sql function:', error)
    return false
  }
  
  return true
}

// Run the setup
async function main() {
  const funcCreated = await createExecSQLFunction()
  if (funcCreated) {
    await setupDatabase()
  }
}

main().catch(console.error)