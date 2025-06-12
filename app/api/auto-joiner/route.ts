import { NextResponse } from "next/server"

const joinerSessions = new Map<string, {
  token: string,
  active: boolean,
  queue: string[],
  stats: {
    joined: number,
    failed: number,
    successRate: number,
    lastJoin: string | null
  }
}>()

export async function POST(req: Request) {
  try {
    const { action, token, invites } = await req.json()

    if (!token) {
      return NextResponse.json({ ok: false, error: "Missing Discord token" }, { status: 400 })
    }

    const sessionId = token.substring(0, 10) + "..."

    switch (action) {
      case "start":
        if (!invites || !Array.isArray(invites) || invites.length === 0) {
          return NextResponse.json({ ok: false, error: "Missing invite links" }, { status: 400 })
        }

        // Validate token
        const discordRes = await fetch("https://discord.com/api/v9/users/@me", {
          headers: { "Authorization": token }
        })

        if (!discordRes.ok) {
          return NextResponse.json({ ok: false, error: "Invalid Discord token" }, { status: 401 })
        }

        const user = await discordRes.json()        // Process invite links to extract codes
        const inviteCodes = invites
          .map((invite: string) => {
            const match = invite.match(/(?:discord\.gg\/|discord\.com\/invite\/)([a-zA-Z0-9]+)/)
            return match ? match[1] : null
          })
          .filter((code): code is string => code !== null)

        if (inviteCodes.length === 0) {
          return NextResponse.json({ ok: false, error: "No valid invite links found" }, { status: 400 })
        }

        // Start auto joiner session
        joinerSessions.set(sessionId, {
          token,
          active: true,
          queue: inviteCodes,
          stats: {
            joined: joinerSessions.get(sessionId)?.stats.joined || 0,
            failed: joinerSessions.get(sessionId)?.stats.failed || 0,
            successRate: joinerSessions.get(sessionId)?.stats.successRate || 0,
            lastJoin: joinerSessions.get(sessionId)?.stats.lastJoin || null
          }
        })

        return NextResponse.json({
          ok: true,
          message: `Auto Joiner started for ${user.username}`,
          queueSize: inviteCodes.length,
          sessionId
        })

      case "stop":
        const session = joinerSessions.get(sessionId)
        if (session) {
          session.active = false
          session.queue = []
          return NextResponse.json({
            ok: true,
            message: "Auto Joiner stopped",
            stats: session.stats
          })
        }
        return NextResponse.json({ ok: false, error: "No active session found" }, { status: 404 })

      case "status":
        const statusSession = joinerSessions.get(sessionId)
        if (statusSession) {
          return NextResponse.json({
            ok: true,
            active: statusSession.active,
            queueSize: statusSession.queue.length,
            stats: statusSession.stats
          })
        }
        return NextResponse.json({
          ok: true,
          active: false,
          queueSize: 0,
          stats: { joined: 0, failed: 0, successRate: 0, lastJoin: null }
        })

      case "join":
        // Process next invite in queue
        const joinSession = joinerSessions.get(sessionId)
        if (!joinSession || !joinSession.active || joinSession.queue.length === 0) {
          return NextResponse.json({ ok: false, error: "No active session or empty queue" }, { status: 404 })
        }

        const inviteCode = joinSession.queue.shift()!
        
        try {
          // Attempt to join server (simulate API call)
          const joinRes = await fetch(`https://discord.com/api/v9/invites/${inviteCode}`, {
            method: "POST",
            headers: {
              "Authorization": joinSession.token,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({})
          })

          if (joinRes.ok) {
            const serverData = await joinRes.json()
            joinSession.stats.joined += 1
            joinSession.stats.lastJoin = new Date().toISOString()
            joinSession.stats.successRate = (joinSession.stats.joined / (joinSession.stats.joined + joinSession.stats.failed)) * 100

            return NextResponse.json({
              ok: true,
              joined: true,
              serverName: serverData.guild?.name || "Unknown Server",
              remaining: joinSession.queue.length,
              stats: joinSession.stats
            })
          } else {
            joinSession.stats.failed += 1
            joinSession.stats.successRate = (joinSession.stats.joined / (joinSession.stats.joined + joinSession.stats.failed)) * 100
            
            const errorData = await joinRes.json().catch(() => ({}))
            return NextResponse.json({
              ok: true,
              joined: false,
              error: errorData.message || "Failed to join server",
              remaining: joinSession.queue.length,
              stats: joinSession.stats
            })
          }
        } catch (error) {
          joinSession.stats.failed += 1
          joinSession.stats.successRate = (joinSession.stats.joined / (joinSession.stats.joined + joinSession.stats.failed)) * 100
          
          return NextResponse.json({
            ok: true,
            joined: false,
            error: "Network error",
            remaining: joinSession.queue.length,
            stats: joinSession.stats
          })
        }

      case "add":
        // Add new invites to queue
        const addSession = joinerSessions.get(sessionId)
        if (!addSession) {
          return NextResponse.json({ ok: false, error: "No session found" }, { status: 404 })
        }

        if (!invites || !Array.isArray(invites)) {
          return NextResponse.json({ ok: false, error: "Missing invite links" }, { status: 400 })
        }        const newInviteCodes = invites
          .map((invite: string) => {
            const match = invite.match(/(?:discord\.gg\/|discord\.com\/invite\/)([a-zA-Z0-9]+)/)
            return match ? match[1] : null
          })
          .filter((code): code is string => code !== null)

        addSession.queue.push(...newInviteCodes)

        return NextResponse.json({
          ok: true,
          message: `Added ${newInviteCodes.length} invites to queue`,
          queueSize: addSession.queue.length
        })

      default:
        return NextResponse.json({ ok: false, error: "Invalid action" }, { status: 400 })
    }
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    // Get global stats for all joiner sessions
    const activeJoiners = Array.from(joinerSessions.values()).filter(s => s.active).length
    const totalJoined = Array.from(joinerSessions.values()).reduce((sum, s) => sum + s.stats.joined, 0)
    const totalQueued = Array.from(joinerSessions.values()).reduce((sum, s) => sum + s.queue.length, 0)
    
    return NextResponse.json({
      ok: true,
      globalStats: {
        activeJoiners,
        totalJoined,
        totalQueued,
        totalUsers: joinerSessions.size
      }
    })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
