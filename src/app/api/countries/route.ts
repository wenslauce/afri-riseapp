import { NextResponse } from 'next/server'
import { getCountries } from '@/lib/database'

export async function GET() {
  try {
    const countries = await getCountries()
    return NextResponse.json({ countries, count: countries.length })
  } catch (error) {
    console.error('API: Failed to fetch countries:', error)
    return NextResponse.json(
      { error: 'Failed to fetch countries', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}