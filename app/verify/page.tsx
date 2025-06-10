"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"

export default function VerifyPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [resendLoading, setResendLoading] = useState(false)
  const [canResend, setCanResend] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const resendTimeout = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Optionally, check if user is now verified and redirect
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user && user.email_confirmed_at) {
        router.replace("/dashboard")
      } else if (user && user.email) {
        setEmail(user.email)
      }
    })
    return () => {
      if (resendTimeout.current) clearTimeout(resendTimeout.current)
    }
  }, [router])

  const handleResendVerification = async () => {
    if (!email) {
      setError("No email found. Please log in again.")
      return
    }
    setResendLoading(true)
    setError(null)
    setSuccess(null)
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    })
    setResendLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    setSuccess("Verification email sent! Check your inbox.")
    setCanResend(false)
    resendTimeout.current = setTimeout(() => setCanResend(true), 60000)
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
            <h1 className="mobile-heading-xl font-bold font-display mb-6 cyber-title">Verify your email</h1>
            <p className="text-gray-300 mb-8 text-lg md:text-xl leading-relaxed mobile-optimized-text">
              Please check your inbox and click the verification link to activate your account.<br />
              Once verified, you can return here and access your dashboard.
            </p>
            <Button
              onClick={handleResendVerification}
              className="cyber-button-primary w-full touch-target-large text-lg md:text-xl py-4 md:py-5 rounded-xl mt-4"
              disabled={resendLoading || !canResend}
              type="button"
            >
              {resendLoading ? "Sending..." : canResend ? "Resend verification email" : "Wait 1 minute to resend"}
            </Button>
            {error && <div className="text-red-400 mt-4">{error}</div>}
            {success && <div className="text-green-400 mt-4">{success}</div>}
          </Card>
        </div>
      </section>
    </div>
  )
}
