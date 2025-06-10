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
import { ArrowRight, ExternalLink, ListTree, Copy, Code } from "lucide-react"
import { TypeAnimation } from "react-type-animation"
import Link from "next/link" // Import Link from next/link

export default function RyzorLanding() {
  const [isHoveringTitle, setIsHoveringTitle] = useState(false)
  const glitchIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const hoverGlitchIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const originalText = "Ryzor.cc"
  const [glitchText, setGlitchText] = useState(originalText)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const [isHeroTerminalVisible, setIsHeroTerminalVisible] = useState(false)

  // Generates a more subtle character glitch
  const generateSubtleGlitchedText = (textToGlitch: string) => {
    let glitched = ""
    let changesMade = 0
    const maxChanges = 1

    for (let i = 0; i < textToGlitch.length; i++) {
      const char = textToGlitch[i]
      const randomThreshold = Math.random()

      if (changesMade < maxChanges && randomThreshold < 0.1) {
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
    if (changesMade === 0 && textToGlitch.length > 0) {
      const randomIndex = Math.floor(Math.random() * textToGlitch.length)
      const charToChange = textToGlitch[randomIndex]
      if (charToChange.match(/[a-zA-Z]/)) {
        const originalChars = glitched.split("")
        originalChars[randomIndex] = Math.random() < 0.5 ? charToChange.toUpperCase() : charToChange.toLowerCase()
        if (originalChars[randomIndex] === charToChange && charToChange.toLowerCase() === "o") {
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
      const glitchDuration = Math.random() * 100 + 50
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
        hoverGlitchLogic()
        hoverGlitchIntervalRef.current = setInterval(hoverGlitchLogic, 150)
      }
    } else {
      if (hoverGlitchIntervalRef.current) {
        clearInterval(hoverGlitchIntervalRef.current)
        hoverGlitchIntervalRef.current = null
      }
      setGlitchText(originalText)
      if (!glitchIntervalRef.current) {
        setTimeout(normalGlitchLogic, Math.random() * 1500 + 800)
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

  // Hero terminal visibility logic
  useEffect(() => {
    const cardAnimationEndTime = 1100 // slide-in-up (0.8s) + delay-300 (0.3s)
    const timer = setTimeout(() => {
      setIsHeroTerminalVisible(true)
    }, cardAnimationEndTime)
    return () => clearTimeout(timer)
  }, [])

  const features = [
    { icon: Zap, title: "Nitro Sniper", description: "Ultra-fast, cloud-based, never sleeps" },
    { icon: Database, title: "Account Backups", description: "Full server/DM/sticker archive" },
    { icon: Key, title: "Token Vault", description: "AES-256, encrypted client-side only" },
    { icon: Users, title: "Auto Joiner", description: "Mass-join links instantly" },
    { icon: Eye, title: "Presence Spoofer", description: "Fake online status, any mode" },
    { icon: Cloud, title: "Cloud Control", description: "Full control from any device, no install" },
    { icon: ListTree, title: "Server Scraper", description: "Extract member lists, channels, roles, and more." },
    { icon: Copy, title: "Server Cloner", description: "Duplicate entire Discord servers with ease." },
    { icon: Code, title: "Open Source", description: "Transparency and community-driven development." },
  ]

  const testimonials = [
    { user: "@ariadne", message: "Looks nice, and you can view without JS!" },
    { user: "@sn1peGod", message: "Actually secure. Been waiting for this." },
    { user: "@w1zard", message: "Cleanest UI I've used. Period." },
  ]

  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const openPopup = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsPopupOpen(true)
  }
  const closePopup = () => setIsPopupOpen(false)

  const heroCardAnimationDuration = 800
  const heroCardDelay = 300
  const heroTerminalExpansionDelayStart = heroCardAnimationDuration + heroCardDelay
  const heroTerminalExpansionDuration = 500 // Duration of the bottom-up expansion
  // const promptStartDelay = heroTerminalExpansionDelayStart + heroTerminalExpansionDuration + 100; // No longer needed for ryzor@cloud:~$

  const securityTerminalCardAnimationDelay = 200
  const securityTerminalCardAnimationDuration = 800
  const securityTerminalBaseDelay = securityTerminalCardAnimationDelay + securityTerminalCardAnimationDuration

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

      <section className="relative min-h-screen flex items-center justify-center mobile-container-padding">
        <div className="container mx-auto text-center z-10 max-w-6xl px-4">
          <div className="mb-8 md:mb-12 slide-in-up" style={{ minHeight: "fit-content", overflow: "visible" }}>
            <div className="mb-6 md:mb-8" style={{ overflow: "visible", minHeight: "fit-content" }}>
              <h1
                className="mobile-heading-xl font-bold font-display mb-4 md:mb-6 cyber-title"
                onMouseEnter={handleTitleMouseEnter}
                onMouseLeave={handleTitleMouseLeave}
                style={{ cursor: "pointer" }}
              >
                {glitchText}
              </h1>
            </div>
            <div className="text-lg md:text-xl lg:text-2xl text-gray-300 mb-6 md:mb-8 max-w-4xl mx-auto leading-relaxed mobile-optimized-text">
              <div className="mb-2">Your cloud-based Discord arsenal. Always-on.</div>
              <div>
                Always one step ahead.{" "}
                <EnhancedTextGlow intensity="high" className="font-bold">
                  100% Free.
                </EnhancedTextGlow>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center mb-12 md:mb-16 slide-in-up delay-200">
            <Button className="cyber-button touch-target-large text-base md:text-lg px-8 md:px-10 py-4 md:py-5" onClick={openPopup}>
              Launch Dashboard
              <ArrowRight className="ml-2 md:ml-3 h-4 w-4 md:h-5 md:w-5" />
            </Button>
            <Button className="cyber-button touch-target-large text-base md:text-lg px-8 md:px-10 py-4 md:py-5" onClick={openPopup}>
              Join Telegram
              <ExternalLink className="ml-2 md:ml-3 h-4 w-4 md:h-5 md:w-5" />
            </Button>
          </div>

          <div className="cyber-glass-card max-w-5xl mx-auto p-4 md:p-8 slide-in-up delay-300">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="flex space-x-2 md:space-x-3">
                <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-red-500 shadow-lg shadow-red-500/50"></div>
                <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/50"></div>
                <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-green-500 shadow-lg shadow-green-500/50"></div>
              </div>
              <span className="font-mono text-xs md:text-sm text-gray-400">ryzor.cc/dashboard</span>
            </div>
            {/* This is the container that will expand from the bottom */}
            <div
              className={`terminal-content-container ${isHeroTerminalVisible ? "terminal-content-container-expanded" : ""}`}
            >
              <div className="cyber-terminal">
                {" "}
                {/* This is the actual terminal box style */}
                {/* Removed the ryzor@cloud:~$ TypeAnimation and its header */}
                <div className="p-4 md:p-6 font-mono text-xs md:text-sm space-y-2">
                  <div className="text-green-400 flex items-center justify-center w-full">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2 md:mr-3 animate-pulse"></span>✓ NITRO CLAIMED — in
                    0.29s
                  </div>
                  <div className="text-blue-400">→ Monitoring 47 servers...</div>
                  <div className="text-yellow-400">⚡ Queue: 3 pending</div>
                  <div className="text-[#ff0033]">Status: ONLINE | Tokens: SECURE</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mobile-section-padding">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12 md:mb-20 slide-in-up">
            <h2 className="mobile-heading-lg font-bold mb-4 md:mb-6 slide-in-up cyber-title">
              Unleash Discord. On Your Terms.{" "}
              <EnhancedTextGlow intensity="high" className="font-bold">
                For Free.
              </EnhancedTextGlow>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto relative z-0">
            {features.map((feature, index) => (
              <CyberCard key={index} className={`p-6 md:p-8 slide-in-up delay-${(index + 1) * 100}`}>
                <div className="flex items-center mb-4 md:mb-6">
                  <div className="p-2 md:p-3 rounded-lg bg-[#ff0033]/10 border border-[#ff0033]/20 mr-3 md:mr-4">
                    <feature.icon className="h-6 w-6 md:h-8 md:w-8 text-[#ff0033]" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold">{feature.title}</h3>
                </div>
                <p className="text-gray-300 mb-4 md:mb-6 leading-relaxed mobile-optimized-text">{feature.description}</p>
                <Badge className="cyber-badge">FREE ACCESS</Badge>
              </CyberCard>
            ))}
          </div>
        </div>
      </section>

      <section className="mobile-section-padding">
        <div className="container mx-auto max-w-7xl">
          <div className="cyber-glass-card p-6 md:p-10 slide-in-up">
            <div className="flex flex-wrap gap-3 md:gap-4 mb-6 md:mb-8">
              <Button className="cyber-button active bg-[#ff0033]/20 border-[#ff0033] touch-target">Sniper</Button>
              <Button className="cyber-button touch-target">Backup</Button>
              <Button className="cyber-button touch-target">Joiner</Button>
              <Button className="cyber-button touch-target">Vault</Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
              <div className="space-y-4 md:space-y-6 slide-in-left delay-200">
                <div className="cyber-glass-card p-4 md:p-6">
                  <h4 className="text-lg md:text-xl font-bold mb-3 md:mb-4">
                    <EnhancedTextGlow intensity="medium">Nitro Sniper Status</EnhancedTextGlow>
                  </h4>
                  <div className="space-y-3 md:space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="mobile-optimized-text">Speed:</span>
                      <span className="text-green-400 font-mono text-sm md:text-base">0.29s avg</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="mobile-optimized-text">Success Rate:</span>
                      <span className="text-green-400 font-mono text-sm md:text-base">94.7%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="mobile-optimized-text">Servers Monitored:</span>
                      <span className="text-blue-400 font-mono text-sm md:text-base">47</span>
                    </div>
                  </div>
                </div>
                <div className="cyber-glass-card p-4 md:p-6">
                  <div className="flex items-center justify-between mb-3 md:mb-4">
                    <span className="font-semibold mobile-optimized-text">Auto-Claim</span>
                    <div className="toggle-switch active"></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold mobile-optimized-text">Delay (ms)</span>
                    <input type="range" className="slider" min="0" max="1000" defaultValue="290" />
                  </div>
                </div>
              </div>
              <div className="slide-in-right delay-300">
                <div className="cyber-terminal">
                  <div className="cyber-terminal-header">
                    <Terminal className="h-3 w-3 md:h-4 md:w-4 text-[#ff0033]" />
                    <span className="text-[#ff0033] font-mono">Live Terminal</span>
                  </div>
                  <div className="p-4 md:p-6 font-mono text-xs md:text-sm space-y-2 md:space-y-3">
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

      <section className="mobile-section-padding">
        <div className="container mx-auto text-center max-w-6xl">
          <h2 className="mobile-heading-lg font-bold mb-8 md:mb-12 cyber-title slide-in-up">
            We Don't Want Your Token.{" "}
            <EnhancedTextGlow intensity="high" className="font-bold">
              Period.
            </EnhancedTextGlow>
          </h2>
          <div className="max-w-5xl mx-auto">
            <div className="cyber-terminal mb-8 md:mb-12 slide-in-up delay-200">
              <div className="cyber-terminal-header">
                <Terminal className="h-4 w-4 md:h-5 md:w-5 text-[#ff0033]" />
                <TypeAnimation
                  sequence={[securityTerminalBaseDelay + 200, "Security Protocol"]}
                  speed={50}
                  className="text-[#ff0033] font-mono"
                  cursor={true}
                  repeat={0}
                  wrapper="span"
                />
              </div>
              <div className="p-4 md:p-8 text-left font-mono">
                <TypeAnimation
                  sequence={[securityTerminalBaseDelay + 800, "$ encrypt --token ************ --AES256"]}
                  speed={30}
                  className="text-[#ff0033] mb-2 block text-xs md:text-sm"
                  cursor={false}
                  repeat={0}
                  wrapper="span"
                />
                <TypeAnimation
                  sequence={[securityTerminalBaseDelay + 2200, "✔ Success. Your token doesn't save to the server."]}
                  speed={30}
                  className="text-green-400 mb-2 block text-xs md:text-sm"
                  cursor={false}
                  repeat={0}
                  wrapper="span"
                />
                <TypeAnimation
                  sequence={[securityTerminalBaseDelay + 3700, "→ Client-side encryption active"]}
                  speed={30}
                  className="text-blue-400 mb-2 block text-xs md:text-sm"
                  cursor={false}
                  repeat={0}
                  wrapper="span"
                />
                <TypeAnimation
                  sequence={[securityTerminalBaseDelay + 5000, "→ Zero server retention policy"]}
                  speed={30}
                  className="text-yellow-400 mb-2 block text-xs md:text-sm"
                  cursor={false}
                  repeat={0}
                  wrapper="span"
                />
                <TypeAnimation
                  sequence={[securityTerminalBaseDelay + 6300, "→ Open source verification available"]}
                  speed={30}
                  className="text-purple-400 block text-xs md:text-sm"
                  cursor={true}
                  repeat={0}
                  wrapper="span"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {[
                { icon: Shield, title: "Zero Token Retention", desc: "Your tokens are never saved" },
                { icon: Key, title: "Client-Side Only", desc: "All encryption happens in your browser" },
                { icon: Terminal, title: "Open Source Frontend", desc: "Verify our security claims yourself" },
              ].map((item, index) => (
                <div key={index} className={`cyber-glass-card p-6 md:p-8 slide-in-up delay-${(index + 3) * 100}`}>
                  <div className="p-3 md:p-4 rounded-lg bg-[#ff0033]/10 border border-[#ff0033]/20 w-fit mx-auto mb-4 md:mb-6">
                    <item.icon className="h-8 w-8 md:h-12 md:w-12 text-[#ff0033]" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4">{item.title}</h3>
                  <p className="text-gray-300 leading-relaxed mobile-optimized-text">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mobile-section-padding">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className={`cyber-glass-card p-6 md:p-8 chat-log slide-in-up delay-${(index + 1) * 100}`}>
                <div className="flex items-center mb-3 md:mb-4">
                  <div className="w-2 h-2 md:w-3 md:h-3 bg-green-400 rounded-full mr-2 md:mr-3 animate-pulse"></div>
                  <span className="font-mono font-bold text-gray-200 text-sm md:text-base">{testimonial.user}</span>
                </div>
                <p className="text-gray-300 mb-3 md:mb-4 text-base md:text-lg mobile-optimized-text">"{testimonial.message}"</p>
                <div className="text-xs md:text-sm text-gray-500">— Using Ryzor.cc Free</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mobile-section-padding">
        <div className="container mx-auto text-center max-w-4xl">
          <h2 className="mobile-heading-lg font-bold mb-12 md:mb-16 cyber-title slide-in-up">
            Zero Limits.{" "}
            <EnhancedTextGlow intensity="high" className="font-bold">
              Zero Cost.
            </EnhancedTextGlow>
          </h2>
          <div className="max-w-lg mx-auto slide-in-up delay-200">
            <Card className="cyber-glass-card p-8 md:p-10 pulse-glow">
              <div className="text-4xl md:text-6xl mb-4 md:mb-6">🔓</div>
              <h3 className="text-2xl md:text-4xl font-bold mb-6 md:mb-8">
                <EnhancedTextGlow intensity="high" className="font-bold">
                  Free Forever
                </EnhancedTextGlow>
              </h3>
              <div className="space-y-3 md:space-y-4 mb-8 md:mb-10 text-left">
                {["Full tool access", "No usage limits", "Encrypted backups", "No credit cards"].map(
                  (feature, index) => (
                    <div key={index} className="flex items-center">
                      <Check className="h-5 w-5 md:h-6 md:w-6 text-green-400 mr-3 md:mr-4 flex-shrink-0" />
                      <span className="text-base md:text-lg mobile-optimized-text">{feature}</span>
                    </div>
                  ),
                )}
              </div>
              <Button className="cyber-button-primary w-full touch-target-large text-lg md:text-xl py-5 md:py-6 mb-4 md:mb-6">Start Using Ryzor – 100% Free</Button>
              <p className="text-gray-400 mobile-optimized-text">No credit card. No trials. Just power.</p>
            </Card>
          </div>
        </div>
      </section>

      <footer className="py-12 md:py-16 px-4 border-t border-red-900/30">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-gray-400 text-base md:text-lg">Ryzor.cc © 2025</p>
              <p className="font-mono text-sm text-gray-500 mt-2">
                This platform is free for all. Built for the underground.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 md:gap-8 text-sm text-center">
              <Link
                href="/zero-access-security-policy"
                className="text-gray-400 hover:text-[#ff0033] transition-colors duration-300 touch-target"
              >
                Zero-Access Security Policy
              </Link>
              <Link
                href="/discord-tos-disclaimer"
                className="text-gray-400 hover:text-[#ff0033] transition-colors duration-300 touch-target"
              >
                Discord TOS Disclaimer
              </Link>
              <a href="#" className="text-gray-400 hover:text-[#ff0033] transition-colors duration-300 touch-target">
                Contact: support@ryzor.cc
              </a>
            </div>
          </div>
        </div>
      </footer>
      <ComingSoonPopup isOpen={isPopupOpen} onClose={closePopup} />
    </div>
  )
}