import { NextRequest, NextResponse } from 'next/server'
import { updateApplicationStatusOnCompletion } from '@/lib/application-status-updater'

export async function POST(request: NextRequest) {
  try {
    const { applicationId, trigger } = await request.json()
    
    if (!applicationId) {
      return NextResponse.json(
        { error: 'Application ID is required' },
        { status: 400 }
      )
    }
    
    console.log(`Updating application status for ${applicationId}, trigger: ${trigger}`)
    
    // Update application status based on completion
    await updateApplicationStatusOnCompletion(applicationId)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Application status updated successfully' 
    })
    
  } catch (error) {
    console.error('Error updating application status:', error)
    return NextResponse.json(
      { error: 'Failed to update application status' },
      { status: 500 }
    )
  }
}
