import { NextRequest, NextResponse } from 'next/server'
import { pusherServer } from '@/lib/pusher-server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'

export async function POST(req: NextRequest) {
  try {
    // For admin authentication, check session
    const session = await getServerSession(authOptions)
    
    const body = await req.text()
    const params = new URLSearchParams(body)
    const socketId = params.get('socket_id')
    const channelName = params.get('channel_name')

    if (!socketId || !channelName) {
      return NextResponse.json(
        { error: 'Missing socket_id or channel_name' },
        { status: 400 }
      )
    }

    // For private channels, authenticate the user
    if (channelName.startsWith('private-')) {
      // Extract cafeId from channel name (e.g., private-cafe-123)
      const cafeId = channelName.replace('private-cafe-', '')
      
      // If session exists (admin), verify they own this cafe
      if (session?.user?.cafeId) {
        if (session.user.cafeId !== cafeId) {
          return NextResponse.json(
            { error: 'Unauthorized - cafe mismatch' },
            { status: 403 }
          )
        }
      }
      // For customers viewing order status, allow subscription
      // (You can add customer verification here if needed)
    }

    // Authenticate the channel subscription
    if (!pusherServer) {
      return NextResponse.json(
        { error: 'Pusher not configured' },
        { status: 500 }
      )
    }

    const authResponse = pusherServer.authorizeChannel(socketId, channelName)

    return NextResponse.json(authResponse)
  } catch (error) {
    console.error('Pusher auth error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}

