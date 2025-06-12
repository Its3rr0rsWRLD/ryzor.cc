import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { token, presence } = await req.json()
    if (!token || !presence) {
      return NextResponse.json({ ok: false, error: "Missing token or presence" }, { status: 400 })
    }

    const clientTypeMap: Record<string, { os: string, browser: string, device: string }> = {
      desktop: { os: "Windows", browser: "Discord Client", device: "desktop" },
      web: { os: "Windows", browser: "Chrome", device: "browser" },
      mobile: { os: "Android", browser: "Discord Android", device: "mobile" },
      console: { os: "PlayStation", browser: "Discord Console", device: "console" }
    }

    const clientProps = clientTypeMap[presence as string]
    if (!clientProps) {
      return NextResponse.json({ ok: false, error: "Invalid presence type" }, { status: 400 })
    }

    const gatewayIdentifyPayload = {
      op: 2,
      d: {
        token,
        capabilities: 61,
        properties: {
          $os: clientProps.os,
          $browser: clientProps.browser,
          $device: clientProps.device
        },
        presence: {
          status: "online",
          since: 0,
          activities: [],
          afk: false
        },
        compress: false
      }
    }

    return NextResponse.json({ ok: true, payload: gatewayIdentifyPayload })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}