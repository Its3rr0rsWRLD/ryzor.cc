"use client"

import type { ReactNode } from "react"

interface EnhancedTextGlowProps {
  children: ReactNode
  className?: string
  intensity?: "low" | "medium" | "high"
  color?: string
}

export function EnhancedTextGlow({
  children,
  className = "",
  intensity = "low",
  color = "#ff0033", // Ryzor red
}: EnhancedTextGlowProps) {
  let filterValue = ""

  // Drastically reduced opacity values to make the glow very subtle.
  switch (intensity) {
    case "low":
      // Barely visible glow, ~2% opacity
      filterValue = `drop-shadow(0 0 2px ${color}05)`
      break
    case "medium":
      // A very soft glow, around 5% opacity as requested
      filterValue = `drop-shadow(0 0 4px ${color}0D) drop-shadow(0 0 8px ${color}08)`
      // 0D = 5% opacity, 08 = 3% opacity
      break
    case "high":
      // The strongest glow, but still very subtle, maxing at ~10% opacity
      filterValue = `drop-shadow(0 0 5px ${color}1A) drop-shadow(0 0 10px ${color}0D)`
      // 1A = 10% opacity, 0D = 5% opacity
      break
    default: // Fallback to 'low'
      filterValue = `drop-shadow(0 0 2px ${color}05)`
  }

  return (
    <span
      className={`inline-block ${className}`}
      style={{
        color: color,
        WebkitTextFillColor: color,
        background: "transparent",
        WebkitBackgroundClip: "initial",
        backgroundClip: "initial",
        filter: filterValue,
      }}
    >
      {children}
    </span>
  )
}
