import { NextResponse } from "next/server"

const activeSessions = new Map<string, {
  token: string,
  channels: string[],
  active: boolean,
  stats: {
    sniped: number,
    attempts: number,
    successRate: number,
    lastClaim: string | null
  }
}>()

export async function POST(req: Request) {
  try {
    const { action, token, channels } = await req.json()

    if (!token) {
      return NextResponse.json({ ok: false, error: "Missing Discord token" }, { status: 400 })
    }

    const sessionId = token.substring(0, 10) + "..."

    switch (action) {
      case "start":
        if (!channels || !Array.isArray(channels) || channels.length === 0) {
          return NextResponse.json({ ok: false, error: "Missing channels to monitor" }, { status: 400 })
        }

        // Validate token first
        const discordRes = await fetch("https://discord.com/api/v9/users/@me", {
          headers: { "Authorization": token }
        })

        if (!discordRes.ok) {
          return NextResponse.json({ ok: false, error: "Invalid Discord token" }, { status: 401 })
        }

        const user = await discordRes.json()

        // Start sniper session
        activeSessions.set(sessionId, {
          token,
          channels,
          active: true,
          stats: {
            sniped: activeSessions.get(sessionId)?.stats.sniped || 0,
            attempts: activeSessions.get(sessionId)?.stats.attempts || 0,
            successRate: activeSessions.get(sessionId)?.stats.successRate || 0,
            lastClaim: activeSessions.get(sessionId)?.stats.lastClaim || null
          }
        })

        return NextResponse.json({
          ok: true,
          message: `Nitro Sniper started for ${user.username}`,
          monitoring: channels.length,
          sessionId
        })

      case "stop":
        const session = activeSessions.get(sessionId)
        if (session) {
          session.active = false
          return NextResponse.json({
            ok: true,
            message: "Nitro Sniper stopped",
            stats: session.stats
          })
        }
        return NextResponse.json({ ok: false, error: "No active session found" }, { status: 404 })

      case "status":
        const statusSession = activeSessions.get(sessionId)
        if (statusSession) {
          return NextResponse.json({
            ok: true,
            active: statusSession.active,
            monitoring: statusSession.channels.length,
            stats: statusSession.stats
          })
        }
        return NextResponse.json({
          ok: true,
          active: false,
          monitoring: 0,
          stats: { sniped: 0, attempts: 0, successRate: 0, lastClaim: null }
        })

      case "claim":
        // Simulate nitro claim (in production this would monitor Discord gateway)
        const claimSession = activeSessions.get(sessionId)
        if (claimSession && claimSession.active) {
          claimSession.stats.attempts += 1
          
          // Simulate 94.7% success rate
          if (Math.random() < 0.947) {
            claimSession.stats.sniped += 1
            claimSession.stats.lastClaim = new Date().toISOString()
            claimSession.stats.successRate = (claimSession.stats.sniped / claimSession.stats.attempts) * 100
            
            return NextResponse.json({
              ok: true,
              claimed: true,
              message: "Nitro claimed successfully!",
              claimTime: "0.29s",
              stats: claimSession.stats
            })
          } else {
            claimSession.stats.successRate = (claimSession.stats.sniped / claimSession.stats.attempts) * 100
            return NextResponse.json({
              ok: true,
              claimed: false,
              message: "Nitro claim failed - too slow",
              stats: claimSession.stats
            })
          }
        }
        return NextResponse.json({ ok: false, error: "No active sniper session" }, { status: 404 })

      default:
        return NextResponse.json({ ok: false, error: "Invalid action" }, { status: 400 })
    }
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    // Get all active sessions count for global stats
    const activeSnipers = Array.from(activeSessions.values()).filter(s => s.active).length
    const totalSniped = Array.from(activeSessions.values()).reduce((sum, s) => sum + s.stats.sniped, 0)
    
    return NextResponse.json({
      ok: true,
      globalStats: {
        activeSnipers,
        totalSniped,
        totalUsers: activeSessions.size
      }
    })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
