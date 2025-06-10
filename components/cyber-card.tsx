"use client"

import type { ReactNode } from "react"
import { Card } from "@/components/ui/card"

interface CyberCardProps {
  children: ReactNode
  className?: string
  hoverEffect?: boolean
  onClick?: (e: React.MouseEvent) => void
}

export function CyberCard({ children, className = "", hoverEffect = true, onClick }: CyberCardProps) {
  const baseClasses = `
  bg-black/40 
  backdrop-blur-xl 
  border 
  border-red-500/20 
  rounded-2xl 
  shadow-2xl 
  shadow-black/50
  transition-all 
  duration-500 
  ease-out
  relative
  overflow-hidden
  touch-target
`

  const hoverClasses = hoverEffect
    ? `
  hover:transform 
  hover:translate-y-[-8px] 
  hover:scale-[1.02] 
  hover:border-red-500/50 
  hover:shadow-red-500/20 
  hover:shadow-[0_20px_60px_rgba(0,0,0,0.4),0_0_40px_rgba(255,0,51,0.3)] 
  hover:z-20
  group
  cursor-pointer
`
    : ""

  return (
    <Card 
      className={`${baseClasses} ${hoverClasses} ${className}`}
      onClick={onClick}
      style={{ WebkitTapHighlightColor: 'rgba(255, 0, 51, 0.1)' }}
    >
      {hoverEffect && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      )}
      <div className="relative z-10">{children}</div>
    </Card>
  )
}