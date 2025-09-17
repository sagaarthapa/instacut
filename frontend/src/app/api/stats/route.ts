import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetch('http://localhost:8000/api/v1/stats', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      return NextResponse.json(
        { 
          totalProcessed: 0,
          averageTime: 0,
          successRate: 100
        },
        { status: 200 }
      )
    }
    
    const data = await response.json()
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('Stats API error:', error)
    return NextResponse.json(
      { 
        totalProcessed: 0,
        averageTime: 0,
        successRate: 100
      },
      { status: 200 }
    )
  }
}