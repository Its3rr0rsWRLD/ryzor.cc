"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Home, Settings } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [activePage, setActivePage] = useState("home")
  const [userInfo, setUserInfo] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace("/signup")
        return
      }
      if (user && !user.email_confirmed_at) {
        router.replace("/verify")
        return
      }
      setLoading(false)
    })
  }, [router])

  // Sidebar navigation
  const sidebar = (
    <div className="fixed left-0 top-0 h-full w-20 bg-black/80 border-r border-red-700 flex flex-col items-center py-8 z-20 justify-between">
      <div className="flex flex-col items-center w-full">
        <button
          className={`mb-8 ${activePage === "home" ? "text-red-400" : "text-gray-400 hover:text-red-400"}`}
          onClick={() => setActivePage("home")}
          aria-label="Home"
        >
          <Home size={32} />
        </button>
      </div>
      <div className="flex flex-col items-center w-full mb-4">
        <button
          className={`${activePage === "settings" ? "text-red-400" : "text-gray-400 hover:text-red-400"}`}
          onClick={() => setActivePage("settings")}
          aria-label="Settings"
        >
          <Settings size={32} />
        </button>
      </div>
    </div>
  )

  // Settings page content
  const [settingsToken, setSettingsToken] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("ryzor_token") || ""
    }
    return ""
  })
  const [settingsStatus, setSettingsStatus] = useState<string | null>(null)
  const [settingsLoading, setSettingsLoading] = useState(false)

  // Save token to localStorage and validate
  const handleSaveToken = async () => {
    setSettingsLoading(true)
    setSettingsStatus(null)
    try {
      localStorage.setItem("ryzor_token", settingsToken)
      const res = await fetch("/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: settingsToken })
      })
      const data = await res.json()
      if (data.ok && data.user) {
        setUserInfo(data.user)
        setSettingsStatus("Token saved! User: " + data.user.username + "#" + data.user.discriminator)
      } else {
        setSettingsStatus("Invalid token: " + (data.error || "Unknown error"))
      }
    } catch (e: any) {
      setSettingsStatus("Error: " + e.message)
    }
    setSettingsLoading(false)
  }

  // On mount, load token from localStorage and fetch user info if present
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("ryzor_token") : null
    if (token) {
      setSettingsToken(token)
      fetch("/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
      })
        .then(res => res.json())
        .then(data => {
          if (data.ok && data.user) setUserInfo(data.user)
        })
    }
  }, [])

  // Move handleStart and presence state to top-level so they are available in mainContent
  const [presence, setPresence] = useState("desktop")
  const [status, setStatus] = useState<string | null>(null)
  const [isStarting, setIsStarting] = useState(false)

  const handleStart = async () => {
    setIsStarting(true)
    setStatus(null)
    try {
      if (!userInfo || !settingsToken) {
        setStatus("Please set your token in settings first.")
        setIsStarting(false)
        return
      }
      // Send request to presence API with token and presence
      const res = await fetch("/api/presence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: settingsToken, presence })
      })
      const data = await res.json()
      if (data.ok) {
        setStatus("Presence changed successfully!")
      } else {
        setStatus("Failed: " + (data.error || "Unknown error"))
      }
    } catch (e: any) {
      setStatus("Error: " + e.message)
    }
    setIsStarting(false)
  }

  // User info bar logic: only show if userInfo is available
  const userBar = userInfo ? (
    <div className="flex items-center bg-black/70 border border-red-500 rounded-xl px-6 py-4 mb-8 w-full max-w-2xl shadow-lg">
      <img src={userInfo.avatar ? `https://cdn.discordapp.com/avatars/${userInfo.id}/${userInfo.avatar}.png` : "/placeholder-user.jpg"} alt="User avatar" className="w-16 h-16 rounded-full border-2 border-red-500 shadow-lg mr-4" />
      <div className="flex-1 min-w-0">
        <div className="text-xl font-bold text-white truncate">{userInfo.username}#{userInfo.discriminator}</div>
        <div className="text-red-300 text-sm truncate">ID: {userInfo.id}</div>
      </div>
      <Button
        className="bg-red-600 hover:bg-red-700 text-white font-bold border-none px-8 py-3 rounded-xl text-lg ml-4"
        onClick={handleStart}
        disabled={isStarting}
      >
        {isStarting ? "Starting..." : "Start"}
      </Button>
    </div>
  ) : null

  // Main content switching
  let mainContent
  if (activePage === "settings") {
    mainContent = (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Card className="cyber-glass-card p-8 md:p-10 rounded-2xl w-full max-w-lg mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-red-400">Settings</h2>
          <input
            type="password"
            placeholder="Your Discord Token"
            className="w-full p-3 rounded-lg bg-black/60 border border-red-500 text-white focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
            value={settingsToken}
            onChange={e => setSettingsToken(e.target.value)}
            autoComplete="off"
          />
          <Button
            className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold border-none"
            onClick={handleSaveToken}
            disabled={settingsLoading || !settingsToken}
          >
            {settingsLoading ? "Saving..." : "Save Token"}
          </Button>
          {settingsStatus && <div className="mt-2 text-red-300">{settingsStatus}</div>}
          {userInfo && (
            <div className="mt-6 flex flex-col items-center">
              <img src={userInfo.avatar ? `https://cdn.discordapp.com/avatars/${userInfo.id}/${userInfo.avatar}.png` : "/placeholder-user.jpg"} alt="User avatar" className="w-20 h-20 rounded-full border-2 border-red-500 shadow-lg mb-2" />
              <div className="text-lg font-bold text-white">{userInfo.username}#{userInfo.discriminator}</div>
            </div>
          )}
        </Card>
      </div>
    )
  } else {
    mainContent = (
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
        {userBar}
        {/* Tool card */}
        <Card className="cyber-glass-card p-8 md:p-10 rounded-2xl w-full max-w-lg mx-auto">
          <h2 className="text-xl font-bold mb-4 text-red-400">Presence Changer</h2>
          <div className="mb-4 flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 w-full">
              <label className="block text-red-300 mb-1 text-left" htmlFor="presence-select">Select Presence</label>
              <div className="relative">
                <select
                  id="presence-select"
                  className="w-full p-3 rounded-lg bg-black/60 border border-red-500 text-white focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none pr-10"
                  value={presence}
                  onChange={e => setPresence(e.target.value)}
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M5 8L10 13L15 8\' stroke=\'%23ff0033\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1.5em' }}
                >
                  <option value="desktop">Desktop</option>
                  <option value="web">Web</option>
                  <option value="mobile">Mobile</option>
                  <option value="console">Console</option>
                </select>
              </div>
            </div>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white font-bold border-none px-8 py-3 rounded-xl text-lg mt-4 md:mt-0"
              onClick={handleStart}
              disabled={isStarting}
            >
              Set
            </Button>
          </div>
          {status && <div className="mt-2 text-red-300">{status}</div>}
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <span className="animate-pulse text-xl">Loading...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen text-white overflow-x-hidden spotlight-container flex">
      {sidebar}
      <div className="flex-1 ml-20">
        <div className="cyber-background">
          <div className="animated-grid parallax-slow" />
          <div className="digital-fog parallax-medium">
            <div className="fog-layer-1" />
            <div className="fog-layer-2" />
            <div className="fog-layer-3" />
          </div>
          <div className="scanlines-overlay" />
          <div className="digital-noise-overlay" />
          <div className="crt-glow" />
        </div>
        <section className="relative min-h-screen flex flex-col items-center justify-center mobile-container-padding">
          <div className="container mx-auto text-center z-10 max-w-2xl px-4">
            <Button
              className="cyber-button-primary w-32 touch-target-large text-lg md:text-xl py-3 md:py-4 rounded-xl mt-4 absolute top-4 right-4"
              onClick={async () => {
                await supabase.auth.signOut()
                router.replace("/signup")
              }}
            >
              Log out
            </Button>
            {mainContent}
          </div>
        </section>
      </div>
    </div>
  )
}
