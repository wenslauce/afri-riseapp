import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { DocumentUpload } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 }
      )
    }
    
    // Get the document data from the request body
    const documentData = await request.json()
    
    // Verify that the user owns the application
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select('id, user_id')
      .eq('id', documentData.application_id)
      .eq('user_id', user.id)
      .single()
    
    if (appError || !application) {
      return NextResponse.json(
        { success: false, error: 'Application not found or access denied' },
        { status: 403 }
      )
    }
    
    // Create the document upload record using the database function
    const { data, error } = await supabase.rpc('create_document_upload', {
      application_id: documentData.application_id,
      document_type: documentData.document_type,
      file_path: documentData.file_path,
      file_name: documentData.file_name,
      file_size: documentData.file_size
    })
    
    if (error) {
      console.error('Document upload error:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json({
      success: true,
      document: data
    })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
