import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get IP address from various headers
    const forwarded = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const cfConnectingIp = request.headers.get('cf-connecting-ip')
    
    // Priority order: CF-Connecting-IP, X-Real-IP, X-Forwarded-For, remote address
    let ip = cfConnectingIp || realIp || forwarded?.split(',')[0] || 'unknown'
    
    // Clean up the IP address
    ip = ip.trim()
    
    return NextResponse.json({ 
      ip,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to get IP address:', error)
    return NextResponse.json({ 
      ip: 'unknown',
      timestamp: new Date().toISOString()
    })
  }
}