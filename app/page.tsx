"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Zap, Database, Key, Users, Eye, Cloud, Terminal, Check } from "lucide-react"
import { EnhancedTextGlow } from "@/components/enhanced-text-glow"
import { CyberCard } from "@/components/cyber-card"
import { ComingSoonPopup } from "@/components/coming-soon-popup"
import { ArrowRight, ExternalLink } from "lucide-react" // Ensure these are imported if not already

export default function RyzorLanding() {
  const [isHoveringTitle, setIsHoveringTitle] = useState(false)
  const glitchIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const hoverGlitchIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const originalText = "Ryzor.cc"
  const [glitchText, setGlitchText] = useState(originalText)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  // Generates a more subtle character glitch
  const generateSubtleGlitchedText = (textToGlitch: string) => {
    let glitched = ""
    let changesMade = 0
    const maxChanges = 1 // Allow only 1 or 2 character changes per glitch update

    for (let i = 0; i < textToGlitch.length; i++) {
      const char = textToGlitch[i]
      const randomThreshold = Math.random()

      if (changesMade < maxChanges && randomThreshold < 0.1) {
        // Low chance to change a char
        if ((char === "o" || char === "O") && Math.random() < 0.7) {
          glitched += "0"
          changesMade++
        } else if (char.match(/[a-zA-Z]/) && Math.random() < 0.3) {
          glitched += Math.random() < 0.5 ? char.toUpperCase() : char.toLowerCase()
          changesMade++
        } else {
          glitched += char
        }
      } else {
        glitched += char
      }
    }
    // If no changes were made but we wanted one (e.g. for a noticeable flicker)
    // ensure at least one very minor change like a case flip if possible.
    if (changesMade === 0 && textToGlitch.length > 0) {
      const randomIndex = Math.floor(Math.random() * textToGlitch.length)
      const charToChange = textToGlitch[randomIndex]
      if (charToChange.match(/[a-zA-Z]/)) {
        const originalChars = glitched.split("")
        originalChars[randomIndex] = Math.random() < 0.5 ? charToChange.toUpperCase() : charToChange.toLowerCase()
        if (originalChars[randomIndex] === charToChange && charToChange.toLowerCase() === "o") {
          // if case flip didn't change 'o'
          originalChars[randomIndex] = "0"
        }
        glitched = originalChars.join("")
      } else if (charToChange === "o" || charToChange === "O") {
        const originalChars = glitched.split("")
        originalChars[randomIndex] = "0"
        glitched = originalChars.join("")
      }
    }
    return glitched
  }

  useEffect(() => {
    const normalGlitchLogic = () => {
      const glitchDuration = Math.random() * 100 + 50 // 50-150ms visible glitch
      setGlitchText(generateSubtleGlitchedText(originalText))
      setTimeout(() => {
        if (!isHoveringTitle) {
          setGlitchText(originalText)
        }
      }, glitchDuration)
    }

    const hoverGlitchLogic = () => {
      setGlitchText(generateSubtleGlitchedText(originalText))
    }

    if (isHoveringTitle) {
      if (glitchIntervalRef.current) {
        clearInterval(glitchIntervalRef.current)
        glitchIntervalRef.current = null
      }
      if (!hoverGlitchIntervalRef.current) {
        hoverGlitchLogic() // Initial glitch on hover
        hoverGlitchIntervalRef.current = setInterval(hoverGlitchLogic, 150) // Subtle changes every 150ms on hover
      }
    } else {
      if (hoverGlitchIntervalRef.current) {
        clearInterval(hoverGlitchIntervalRef.current)
        hoverGlitchIntervalRef.current = null
      }
      setGlitchText(originalText)
      if (!glitchIntervalRef.current) {
        setTimeout(normalGlitchLogic, Math.random() * 1500 + 800) // Normal interval: 0.8-2.3 seconds
        glitchIntervalRef.current = setInterval(normalGlitchLogic, Math.random() * 2000 + 1000)
      }
    }

    return () => {
      if (glitchIntervalRef.current) clearInterval(glitchIntervalRef.current)
      if (hoverGlitchIntervalRef.current) clearInterval(hoverGlitchIntervalRef.current)
    }
  }, [isHoveringTitle])

  const handleTitleMouseEnter = () => {
    setIsHoveringTitle(true)
  }

  const handleTitleMouseLeave = () => {
    setIsHoveringTitle(false)
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100
        setMousePosition({ x, y })

        containerRef.current.style.setProperty("--mouse-x", `${x}%`)
        containerRef.current.style.setProperty("--mouse-y", `${y}%`)
      }
    }

    document.addEventListener("mousemove", handleMouseMove)
    return () => document.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const features = [
    {
      icon: Zap,
      title: "Nitro Sniper",
      description: "Ultra-fast, cloud-based, never sleeps",
    },
    {
      icon: Database,
      title: "Account Backups",
      description: "Full server/DM/sticker archive",
    },
    {
      icon: Key,
      title: "Token Vault",
      description: "AES-256, encrypted client-side only",
    },
    {
      icon: Users,
      title: "Auto Joiner",
      description: "Mass-join links instantly",
    },
    {
      icon: Eye,
      title: "Presence Spoofer",
      description: "Fake online status, any mode",
    },
    {
      icon: Cloud,
      title: "Cloud Control",
      description: "Full control from any device, no install",
    },
  ]

  const testimonials = [
    {
      user: "@rooted",
      message: "Faster snipes, zero crashes.",
    },
    {
      user: "@sn1peGod",
      message: "Actually secure. Been waiting for this.",
    },
    {
      user: "@w1zard",
      message: "Cleanest UI I've used. Period.",
    },
  ]

  const [isPopupOpen, setIsPopupOpen] = useState(false)

  const openPopup = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent default anchor behavior if buttons were links
    setIsPopupOpen(true)
  }
  const closePopup = () => setIsPopupOpen(false)

  return (
    <div ref={containerRef} className="min-h-screen text-white overflow-x-hidden spotlight-container">
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

      <section className="relative min-h-screen flex items-center justify-center px-4">
        <div className="container mx-auto text-center z-10 max-w-6xl px-4">
          <div className="mb-12 slide-in-up" style={{ minHeight: "fit-content", overflow: "visible" }}>
            <div className="mb-8" style={{ overflow: "visible", minHeight: "fit-content" }}>
              <h1
                className="text-7xl md:text-9xl font-bold font-display mb-6 cyber-title" // cyber-title now includes subtle visual glitch animation
                onMouseEnter={handleTitleMouseEnter}
                onMouseLeave={handleTitleMouseLeave}
                style={{ cursor: "pointer" }}
              >
                {glitchText}
              </h1>
            </div>
            <div className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              <div className="mb-2">Your cloud-based Discord arsenal. Always-on.</div>
              <div>
                Always one step ahead.{" "}
                <EnhancedTextGlow intensity="high" className="font-bold">
                  100% Free.
                </EnhancedTextGlow>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16 slide-in-up delay-200">
            <Button className="cyber-button text-lg px-10 py-5" onClick={openPopup}>
              Launch Dashboard
              <ArrowRight className="ml-3 h-5 w-5" />
            </Button>
            <Button className="cyber-button text-lg px-10 py-5" onClick={openPopup}>
              Join Telegram
              <ExternalLink className="ml-3 h-5 w-5" />
            </Button>
          </div>

          <div className="cyber-glass-card max-w-5xl mx-auto p-8 slide-in-up delay-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex space-x-3">
                <div className="w-4 h-4 rounded-full bg-red-500 shadow-lg shadow-red-500/50"></div>
                <div className="w-4 h-4 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/50"></div>
                <div className="w-4 h-4 rounded-full bg-green-500 shadow-lg shadow-green-500/50"></div>
              </div>
              <span className="font-mono text-sm text-gray-400">ryzor.cc/dashboard</span>
            </div>
            <div className="cyber-terminal">
              <div className="cyber-terminal-header">
                <span className="text-[#ff0033] font-mono">ryzor@cloud:~$</span>
              </div>
              <div className="p-6 font-mono text-sm space-y-2">
                <div className="text-green-400 flex items-center justify-center w-full">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse"></span>✓ NITRO CLAIMED — in
                  0.29s
                </div>
                <div className="text-blue-400">→ Monitoring 47 servers...</div>
                <div className="text-yellow-400">⚡ Queue: 3 pending</div>
                <div className="text-[#ff0033]">Status: ONLINE | Tokens: SECURE</div>
                <div className="terminal-cursor"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-20 slide-in-up">
            <h2 className="text-5xl md:text-7xl font-bold mb-6 slide-in-up cyber-title">
              Unleash Discord. On Your Terms.{" "}
              <EnhancedTextGlow intensity="high" className="font-bold">
                For Free.
              </EnhancedTextGlow>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto relative z-0">
            {features.map((feature, index) => (
              <CyberCard key={index} className={`p-8 slide-in-up delay-${(index + 1) * 100}`}>
                <div className="flex items-center mb-6">
                  <div className="p-3 rounded-lg bg-[#ff0033]/10 border border-[#ff0033]/20 mr-4">
                    <feature.icon className="h-8 w-8 text-[#ff0033]" />
                  </div>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed">{feature.description}</p>
                <Badge className="cyber-badge">FREE ACCESS</Badge>
              </CyberCard>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="cyber-glass-card p-10 slide-in-up">
            <div className="flex flex-wrap gap-4 mb-8">
              <Button className="cyber-button active bg-[#ff0033]/20 border-[#ff0033]">Sniper</Button>
              <Button className="cyber-button">Backup</Button>
              <Button className="cyber-button">Joiner</Button>
              <Button className="cyber-button">Vault</Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-6 slide-in-left delay-200">
                <div className="cyber-glass-card p-6">
                  <h4 className="text-xl font-bold mb-4">
                    <EnhancedTextGlow intensity="medium">Nitro Sniper Status</EnhancedTextGlow>
                  </h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Speed:</span>
                      <span className="text-green-400 font-mono">0.29s avg</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Success Rate:</span>
                      <span className="text-green-400 font-mono">94.7%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Servers Monitored:</span>
                      <span className="text-blue-400 font-mono">47</span>
                    </div>
                  </div>
                </div>

                <div className="cyber-glass-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-semibold">Auto-Claim</span>
                    <div className="toggle-switch active"></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Delay (ms)</span>
                    <input type="range" className="slider" min="0" max="1000" defaultValue="290" />
                  </div>
                </div>
              </div>

              <div className="slide-in-right delay-300">
                <div className="cyber-terminal">
                  <div className="cyber-terminal-header">
                    <Terminal className="h-4 w-4 text-[#ff0033] mr-2" />
                    <span className="text-[#ff0033] font-mono">Live Terminal</span>
                  </div>
                  <div className="p-6 font-mono text-sm space-y-3">
                    <div className="text-green-400">✓ CLAIMED — Nitro Gift in 0.29s</div>
                    <div className="text-blue-400">→ Monitoring discord.gg/example...</div>
                    <div className="text-yellow-400">⚡ Queue: 3 pending</div>
                    <div className="text-purple-400">🔄 Backup: 2.3GB synced</div>
                    <div className="text-[#ff0033]">Status: ACTIVE | Uptime: 99.8%</div>
                    <div className="terminal-cursor"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 px-4">
        <div className="container mx-auto text-center max-w-6xl">
          <h2 className="text-5xl md:text-7xl font-bold mb-12 cyber-title slide-in-up">
            We Don't Want Your Token.{" "}
            <EnhancedTextGlow intensity="high" className="font-bold">
              Period.
            </EnhancedTextGlow>
          </h2>

          <div className="max-w-5xl mx-auto">
            <div className="cyber-terminal mb-12 slide-in-up delay-200">
              <div className="cyber-terminal-header">
                <Terminal className="h-5 w-5 text-[#ff0033] mr-2" />
                <span className="text-[#ff0033]">Security Protocol</span>
              </div>
              <div className="p-8 text-left font-mono">
                <div className="text-[#ff0033] mb-2">$ encrypt --token ************ --AES256</div>
                <div className="text-green-400 mb-2">✔ Success. Your token never left your browser.</div>
                <div className="text-blue-400 mb-2">→ Client-side encryption active</div>
                <div className="text-yellow-400 mb-2">→ Zero server retention policy</div>
                <div className="text-purple-400">→ Open source verification available</div>
                <div className="terminal-cursor mt-4"></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: Shield, title: "Zero Token Retention", desc: "Your tokens are never saved" },
                { icon: Key, title: "Client-Side Only", desc: "All encryption happens in your browser" },
                { icon: Terminal, title: "Open Source Frontend", desc: "Verify our security claims yourself" },
              ].map((item, index) => (
                <div key={index} className={`cyber-glass-card p-8 slide-in-up delay-${(index + 3) * 100}`}>
                  <div className="p-4 rounded-lg bg-[#ff0033]/10 border border-[#ff0033]/20 w-fit mx-auto mb-6">
                    <item.icon className="h-12 w-12 text-[#ff0033]" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className={`cyber-glass-card p-8 chat-log slide-in-up delay-${(index + 1) * 100}`}>
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-3 animate-pulse"></div>
                  <span className="font-mono font-bold text-gray-200">{testimonial.user}</span>
                </div>
                <p className="text-gray-300 mb-4 text-lg">"{testimonial.message}"</p>
                <div className="text-sm text-gray-500">— Using Ryzor.cc Free</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h2 className="text-5xl md:text-7xl font-bold mb-16 cyber-title slide-in-up">
            Zero Limits.{" "}
            <EnhancedTextGlow intensity="high" className="font-bold">
              Zero Cost.
            </EnhancedTextGlow>
          </h2>

          <div className="max-w-lg mx-auto slide-in-up delay-200">
            <Card className="cyber-glass-card p-10 pulse-glow">
              <div className="text-6xl mb-6">🔓</div>
              <h3 className="text-4xl font-bold mb-8">
                <EnhancedTextGlow intensity="high" className="font-bold">
                  Free Forever
                </EnhancedTextGlow>
              </h3>
              <div className="space-y-4 mb-10 text-left">
                {["Full tool access", "No usage limits", "Encrypted backups", "No credit cards, no signups"].map(
                  (feature, index) => (
                    <div key={index} className="flex items-center">
                      <Check className="h-6 w-6 text-green-400 mr-4" />
                      <span className="text-lg">{feature}</span>
                    </div>
                  ),
                )}
              </div>
              <Button className="cyber-button-primary w-full text-xl py-6 mb-6">
                Start Using Ryzor – No Signups, No BS
              </Button>
              <p className="text-gray-400">No credit card. No trials. Just power.</p>
            </Card>
          </div>
        </div>
      </section>

      <footer className="py-16 px-4 border-t border-red-900/30">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0 text-center md:text-left">
              <p className="text-gray-400 text-lg">Ryzor.cc © 2025</p>
              <p className="font-mono text-sm text-gray-500 mt-2">
                This platform is free for all. Built for the underground.
              </p>
            </div>

            <div className="flex flex-wrap gap-8 text-sm">
              {["Zero-Access Security Policy", "Discord TOS Disclaimer", "Contact: support@ryzor.cc"].map(
                (link, index) => (
                  <a key={index} href="#" className="text-gray-400 hover:text-[#ff0033] transition-colors duration-300">
                    {link}
                  </a>
                ),
              )}
            </div>
          </div>
        </div>
      </footer>
      <ComingSoonPopup isOpen={isPopupOpen} onClose={closePopup} />
    </div>
  )
}
