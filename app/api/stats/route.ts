import { NextResponse } from "next/server"

const globalStats = {
  totalUsers: 1247,
  activeTools: 0,
  totalServers: 47,
  successRate: 94.7,
  recentActivity: [
    { type: "success", message: "Nitro claimed in 0.29s", time: "2 min ago", color: "green" },
    { type: "info", message: "Joined server: Gaming Hub", time: "5 min ago", color: "blue" },
    { type: "warning", message: "Backup completed: 2.3GB", time: "12 min ago", color: "yellow" },
    { type: "success", message: "Token vault updated", time: "18 min ago", color: "green" },
    { type: "info", message: "Scraped 450 members", time: "25 min ago", color: "purple" },
  ]
}

export async function GET(req: Request) {
  try {
    const token = req.headers.get('authorization')

    if (!token) {
      return NextResponse.json({ ok: false, error: "Missing token" }, { status: 400 })
    }    const userRes = await fetch("https://discord.com/api/v9/users/@me", {
      headers: { "Authorization": token }
    })

    if (!userRes.ok) {
      return NextResponse.json({ ok: false, error: "Invalid token" }, { status: 401 })
    }

    const user = await userRes.json()

    const stats = {
      user: {
        id: user.id,
        username: user.username,
        discriminator: user.discriminator,
        avatar: user.avatar
      },
      personalStats: {
        nitroSniped: Math.floor(Math.random() * 50) + 47,
        serversJoined: Math.floor(Math.random() * 30) + 23,
        backupsCreated: 5,
        tokensStored: 8,
        successRate: 94.7 + (Math.random() * 2 - 1),
        uptime: "99.8%"
      },
      globalStats: {
        totalUsers: globalStats.totalUsers + Math.floor(Math.random() * 10),
        activeTools: Math.floor(Math.random() * 500) + 450,
        totalServers: globalStats.totalServers,
        onlineUsers: Math.floor(Math.random() * 100) + 1200,
        successRate: globalStats.successRate,
        serverUsage: Math.floor(Math.random() * 30) + 15,
        recentActivity: globalStats.recentActivity
      },
      toolStatus: {
        nitroSniper: {
          active: true,
          monitoring: 47,
          claimed: Math.floor(Math.random() * 50) + 47,
          successRate: 94.7 + (Math.random() * 2 - 1)
        },
        autoJoiner: {
          active: true,
          queue: Math.floor(Math.random() * 5) + 1,
          joined: Math.floor(Math.random() * 30) + 23
        },
        presenceSpoofer: {
          active: false,
          changes: 156
        },
        serverScraper: {
          active: false,
          scraped: 12,
          members: 45231
        },
        accountBackup: {
          active: true,
          size: "2.3GB",
          lastBackup: "2 hours ago"
        },
        tokenVault: {
          active: true,
          tokens: 8,
          encrypted: true
        }
      },
      performance: {
        averageClaimTime: "0.29s",
        uptime: "99.8%",
        responseTime: Math.floor(Math.random() * 50) + 45 + "ms",
        serverLoad: Math.floor(Math.random() * 30) + 15 + "%"
      }
    }

    return NextResponse.json({
      ok: true,
      stats,
      timestamp: new Date().toISOString()
    })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { action, data } = await req.json()

    switch (action) {
      case "update_activity":
        if (data.message) {
          globalStats.recentActivity.unshift({
            type: data.type || "info",
            message: data.message,
            time: "now",
            color: data.color || "blue"
          })
          globalStats.recentActivity = globalStats.recentActivity.slice(0, 10)
        }
        break
      case "increment_stat":
        if (data.stat === "totalUsers") {
          globalStats.totalUsers += 1
        }
        break
      default:
        return NextResponse.json({ ok: false, error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json({ ok: true, message: "Stats updated" })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
