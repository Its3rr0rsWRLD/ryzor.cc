"use client"

import type { ReactNode } from "react"

interface EnhancedTextGlowProps {
  children: ReactNode
  className?: string
  intensity?: "low" | "medium" | "high"
}

export function EnhancedTextGlow({ children, className = "", intensity = "medium" }: EnhancedTextGlowProps) {
  const glowStyles = {
    low: {
      textShadow: "0 0 5px #ff0033, 0 0 10px #ff0033",
      filter: "brightness(1.05)",
    },
    medium: {
      textShadow: "0 0 5px #ff0033, 0 0 10px #ff0033, 0 0 20px #ff0033, 0 0 35px #ff0033",
      filter: "brightness(1.1)",
    },
    high: {
      textShadow: "0 0 10px #ff0033, 0 0 20px #ff0033, 0 0 30px #ff0033, 0 0 40px #ff0033, 0 0 50px #ff0033",
      filter: "brightness(1.2) saturate(1.1)",
    },
  }

  return (
    <span className={`inline-block ${className}`} style={glowStyles[intensity]}>
      {children}
    </span>
  )
}
