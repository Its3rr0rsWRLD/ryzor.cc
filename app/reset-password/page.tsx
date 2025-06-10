"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)
    const accessToken = searchParams.get("access_token")
    if (!accessToken) {
      setError("Invalid or missing token.")
      setLoading(false)
      return
    }
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setSuccess("Password updated! Redirecting to login...")
      setTimeout(() => router.replace("/login"), 2000)
    }
  }

  return (
    <div className="min-h-screen text-white overflow-x-hidden spotlight-container">
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
      <section className="relative min-h-screen flex items-center justify-center mobile-container-padding">
        <div className="container mx-auto text-center z-10 max-w-md px-4">
          <Card className="cyber-glass-card p-8 md:p-10 slide-in-up rounded-2xl">
            <h1 className="mobile-heading-xl font-bold font-display mb-6 cyber-title">Reset your password</h1>
            <form onSubmit={handleReset} className="space-y-6">
              <input
                type="password"
                required
                placeholder="New password"
                className="w-full p-3 rounded-lg bg-black/60 border border-cyan-400 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="new-password"
              />
              <Button
                type="submit"
                className="cyber-button-primary w-full touch-target-large text-lg md:text-xl py-4 md:py-5 rounded-xl mt-2"
                disabled={loading}
              >
                {loading ? "Resetting..." : "Reset password"}
              </Button>
            </form>
            {error && <div className="text-red-400 mt-4">{error}</div>}
            {success && <div className="text-green-400 mt-4">{success}</div>}
          </Card>
        </div>
      </section>
    </div>
  )
}
