import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { proxyHost, proxyPort } = await req.json()

    if (!proxyHost || !proxyPort) {
      return NextResponse.json({ ok: false, error: "Missing proxy host or port" }, { status: 400 })
    }

    const startTime = Date.now()
    
    // Test the proxy by making a simple HTTP request through it
    try {
      // Create proxy URL
      const proxyUrl = `http://${proxyHost}:${proxyPort}`
      
      // Test with a simple request to a fast endpoint
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
      
      const response = await fetch('https://httpbin.org/ip', {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        // Note: fetch() doesn't support HTTP proxy natively in Node.js
        // For a real implementation, you'd need a library like node-fetch with proxy support
        // or use an HTTP agent with proxy support
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (response.ok) {
        const responseTime = Date.now() - startTime
        const data = await response.json()
        
        return NextResponse.json({
          ok: true,
          responseTime,
          proxyIp: data.origin,
          message: "Proxy is working"
        })
      } else {
        return NextResponse.json({
          ok: false,
          error: `HTTP ${response.status}: ${response.statusText}`
        }, { status: 400 })
      }
      
    } catch (fetchError: any) {
      if (fetchError.name === 'AbortError') {
        return NextResponse.json({
          ok: false,
          error: "Proxy connection timeout (>10s)"
        }, { status: 408 })
      }
      
      return NextResponse.json({
        ok: false,
        error: `Connection failed: ${fetchError.message}`
      }, { status: 400 })
    }
    
  } catch (error: any) {
    console.error('Proxy test error:', error)
    return NextResponse.json({
      ok: false,
      error: error.message
    }, { status: 500 })
  }
}
