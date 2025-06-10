"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { EnhancedTextGlow } from "@/components/enhanced-text-glow"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user && user.email_confirmed_at) {
        router.replace("/dashboard")
      } else if (user && !user.email_confirmed_at) {
        router.replace("/verify")
      }
    })
  }, [router])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    if (data.user && !data.user.email_confirmed_at) {
      setSuccess("Check your email to verify your account.")
      router.replace("/verify")
      return
    }
    if (data.user && data.user.email_confirmed_at) {
      setSuccess("Signup successful! Redirecting...")
      router.replace("/dashboard")
    }
  }

  const handleOAuth = async () => {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    })
    setLoading(false)
    if (error) setError(error.message)
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
            <h1 className="mobile-heading-xl font-bold font-display mb-6 cyber-title">Sign up for Ryzor.cc</h1>
            <form onSubmit={handleSignup} className="space-y-6">
              <input
                type="email"
                required
                placeholder="Email"
                className="w-full p-3 rounded-lg bg-black/60 border border-cyan-400 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
              <input
                type="password"
                required
                placeholder="Password"
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
                {loading ? "Signing up..." : "Sign up"}
              </Button>
            </form>
            <Button
              onClick={handleOAuth}
              className="cyber-button-primary w-full touch-target-large text-lg md:text-xl py-4 md:py-5 rounded-xl mt-4"
              disabled={loading}
            >
              {loading ? "Loading..." : "Sign up with Discord"}
            </Button>
            {error && <div className="text-red-400 mt-4">{error}</div>}
            {success && <div className="text-green-400 mt-4">{success}</div>}
            <div className="mt-6 text-cyan-300">
              Already have an account? <a href="/login" className="underline">Log in</a>
            </div>
          </Card>
        </div>
      </section>
    </div>
  )
}