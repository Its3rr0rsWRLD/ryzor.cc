"use client"

import { useState, useEffect } from "react"
import { CyberCard } from "./cyber-card"
import { EnhancedTextGlow } from "./enhanced-text-glow"
import { Button } from "./ui/button"

interface ComingSoonPopupProps {
  isOpen: boolean
  onClose: () => void
}

export function ComingSoonPopup({ isOpen, onClose }: ComingSoonPopupProps) {
  const [isAnimatingOut, setIsAnimatingOut] = useState(false)

  // Effect to handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!isOpen && !isAnimatingOut) {
    return null
  }

  const handleClose = () => {
    setIsAnimatingOut(true)
    setTimeout(() => {
      onClose() // This will set isOpen to false in the parent
      setIsAnimatingOut(false) // Reset for next time
    }, 300) // Match animation duration
  }

  const animationClass = isAnimatingOut ? "animate-fadeOutScaleDown" : "animate-fadeInScaleUp"

  return (
    <div
      className={`fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-out ${
        isAnimatingOut ? "opacity-0" : "opacity-100"
      }`}
      onClick={handleClose} // Close on overlay click
    >
      <style jsx global>{`
        @keyframes fadeInScaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fadeInScaleUp {
          animation: fadeInScaleUp 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        @keyframes fadeOutScaleDown {
          from { transform: scale(1); opacity: 1; }
          to { transform: scale(0.95); opacity: 0; }
        }
        .animate-fadeOutScaleDown {
          animation: fadeOutScaleDown 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}</style>
      <CyberCard
        className={`p-6 md:p-8 lg:p-10 text-center relative max-w-sm sm:max-w-md lg:max-w-lg w-full mx-4 ${animationClass}`}
        hoverEffect={false}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside card
      >
        <div className="mb-6 md:mb-8">
          <EnhancedTextGlow intensity="high" color="#ff0033">
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold font-display cyber-title !filter-none"
              style={{ WebkitTextFillColor: "unset" }}
            >
              Coming Soon!
            </h2>
          </EnhancedTextGlow>
        </div>

        <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 md:mb-8 leading-relaxed mobile-optimized-text">
          This feature is under construction. We are working hard to bring you the complete Ryzor.cc experience. Check
          back soon!
        </p>

        <div className="w-16 md:w-20 h-1 bg-red-500 mx-auto mb-6 md:mb-8 rounded-full shadow-[0_0_10px_#ff0033,0_0_20px_#ff003366]"></div>

        <Button className="cyber-button touch-target-large text-base md:text-lg px-6 md:px-8 py-3 md:py-4 w-full sm:w-auto" onClick={handleClose}>
          Understood
        </Button>
      </CyberCard>
    </div>
  )
}