"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [resendLoading, setResendLoading] = useState(false)
  const [canResend, setCanResend] = useState(true)
  const [showResetPopup, setShowResetPopup] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [resetLoading, setResetLoading] = useState(false)
  const [resetError, setResetError] = useState<string | null>(null)
  const [resetSuccess, setResetSuccess] = useState<string | null>(null)
  const resendTimeout = useRef<NodeJS.Timeout | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    setLoading(false)
    if (error) {
      if (
        error.message.toLowerCase().includes("invalid login credentials") ||
        error.message.toLowerCase().includes("invalid password") ||
        error.message.toLowerCase().includes("wrong password")
      ) {
        setError("Incorrect password. Please try again.")
      } else {
        setError(error.message)
      }
      return
    }
    if (data.user && !data.user.email_confirmed_at) {
      setSuccess("Check your email to verify your account.")
      router.replace("/verify")
      return
    }
    if (data.user) {
      setSuccess("Login successful! Redirecting...")
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

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetLoading(true)
    setResetError(null)
    setResetSuccess(null)
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setResetLoading(false)
    if (error) {
      setResetError(error.message)
    } else {
      setResetSuccess("Password reset email sent! Check your inbox.")
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
            <h1 className="mobile-heading-xl font-bold font-display mb-6 cyber-title text-red-400">Log in to Ryzor.cc</h1>
            <form onSubmit={handleLogin} className="space-y-6">
              <input
                type="email"
                required
                placeholder="Email"
                className="w-full p-3 rounded-lg bg-black/60 border border-red-400 text-white focus:outline-none focus:ring-2 focus:ring-red-400"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
              <input
                type="password"
                required
                placeholder="Password"
                className="w-full p-3 rounded-lg bg-black/60 border border-red-400 text-white focus:outline-none focus:ring-2 focus:ring-red-400"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <Button
                type="submit"
                className="cyber-button-primary w-full touch-target-large text-lg md:text-xl py-4 md:py-5 rounded-xl mt-2 bg-red-600 hover:bg-red-700 border-none"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Log in"}
              </Button>
            </form>            <Button
              onClick={handleOAuth}
              className="cyber-button-primary w-full touch-target-large text-lg md:text-xl py-4 md:py-5 rounded-xl mt-4 bg-red-600 hover:bg-red-700 border-none"
              disabled={loading}
            >
              {loading ? "Loading..." : "Log in with Discord"}
            </Button>
            {error && <div className="text-red-400 mt-4">{error}</div>}
            {success && <div className="text-green-400 mt-4">{success}</div>}
            {/* Password reset link */}
            <div className="mt-4 text-red-200 text-sm">
              <button
                type="button"
                className="underline hover:text-red-400 transition-colors"
                onClick={() => setShowResetPopup(true)}
              >
                Forgot your password?
              </button>
            </div>
            {/* Reset password popup */}
            {showResetPopup && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
                <div className="bg-[#1a0a0a] border border-red-500 rounded-2xl p-8 w-full max-w-md shadow-xl relative">
                  <button
                    className="absolute top-2 right-3 text-red-400 text-2xl font-bold hover:text-red-200"
                    onClick={() => setShowResetPopup(false)}
                    aria-label="Close"
                  >
                    ×
                  </button>
                  <h2 className="text-2xl font-bold mb-4 text-red-400">Reset your password</h2>
                  <form onSubmit={handlePasswordReset} className="space-y-4">
                    <input
                      type="email"
                      required
                      placeholder="Enter your email"
                      className="w-full p-3 rounded-lg bg-black/60 border border-red-400 text-white focus:outline-none focus:ring-2 focus:ring-red-400"
                      value={resetEmail}
                      onChange={e => setResetEmail(e.target.value)}
                      autoComplete="email"
                    />
                    <Button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold border-none"
                      disabled={resetLoading}
                    >
                      {resetLoading ? "Sending..." : "Send reset email"}
                    </Button>
                  </form>
                  {resetError && <div className="text-red-400 mt-2">{resetError}</div>}
                  {resetSuccess && <div className="text-green-400 mt-2">{resetSuccess}</div>}
                </div>
              </div>
            )}
            {/* Signup link */}
            <div className="mt-6 text-red-300">
              Don't have an account? <a href="/signup" className="underline">Sign up</a>
            </div>
          </Card>
        </div>
      </section>
    </div>
  )
}
