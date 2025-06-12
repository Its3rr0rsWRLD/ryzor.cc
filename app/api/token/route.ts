import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { token } = await req.json()
    if (!token) {
      return NextResponse.json({ ok: false, error: "Missing token" }, { status: 400 })
    }
    const discordRes = await fetch("https://discord.com/api/v9/users/@me", {
      headers: {
        "Authorization": token
      }
    })
    if (!discordRes.ok) {
      const err = await discordRes.json().catch(() => ({}))
      return NextResponse.json({ ok: false, error: err.message || discordRes.statusText }, { status: discordRes.status })
    }
    const user = await discordRes.json()
    return NextResponse.json({ ok: true, user })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
