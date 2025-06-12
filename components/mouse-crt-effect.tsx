"use client"

import { useEffect, useState } from 'react'

export function MouseCRTEffect() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
      setIsVisible(true)

      // Hide effect after mouse stops moving
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setIsVisible(false)
      }, 1000)
    }

    const handleMouseLeave = () => {
      setIsVisible(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      clearTimeout(timeoutId)
    }
  }, [])

  return (
    <div
      className="mouse-crt-effect"
      style={{
        left: mousePosition.x,
        top: mousePosition.y,
        opacity: isVisible ? 1 : 0,
      }}
    />
  )
}
