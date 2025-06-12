"use client"

import { useState, useEffect } from "react"
import { CyberCard } from "./cyber-card"
import { EnhancedTextGlow } from "./enhanced-text-glow"
import { Button } from "./ui/button"
import { Check, X, AlertCircle, Info } from "lucide-react"

interface NotificationPopupProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  type?: 'success' | 'error' | 'warning' | 'info' | 'confirm'
  onConfirm?: () => void
  confirmText?: string
  cancelText?: string
}

export function NotificationPopup({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'info',
  onConfirm,
  confirmText = 'OK',
  cancelText = 'Cancel'
}: NotificationPopupProps) {
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
      onClose()
      setIsAnimatingOut(false)
    }, 300)
  }

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm()
    }
    handleClose()
  }

  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: <Check className="w-8 h-8 text-green-400" />,
          color: '#00ff00',
          iconBg: 'bg-green-600/20',
          borderColor: 'border-green-600/50'
        }
      case 'error':
        return {
          icon: <X className="w-8 h-8 text-red-400" />,
          color: '#ff0033',
          iconBg: 'bg-red-600/20',
          borderColor: 'border-red-600/50'        }
      case 'warning':
        return {
          icon: <AlertCircle className="w-8 h-8 text-yellow-400" />,
          color: '#ffaa00',
          iconBg: 'bg-yellow-600/20',
          borderColor: 'border-yellow-600/50'
        }
      case 'confirm':
        return {
          icon: <AlertCircle className="w-8 h-8 text-red-400" />,
          color: '#ff0033',
          iconBg: 'bg-red-600/20',
          borderColor: 'border-red-600/50'
        }
      default:
        return {
          icon: <Info className="w-8 h-8 text-red-400" />,
          color: '#ff0033',
          iconBg: 'bg-red-600/20',
          borderColor: 'border-red-600/50'
        }
    }
  }

  const typeConfig = getTypeConfig()
  const animationClass = isAnimatingOut ? "animate-fadeOutScaleDown" : "animate-fadeInScaleUp"

  return (
    <div
      className={`fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-out ${
        isAnimatingOut ? "opacity-0" : "opacity-100"
      }`}
      onClick={type === 'confirm' ? undefined : handleClose}
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
        className={`p-6 md:p-8 text-center relative max-w-sm sm:max-w-md w-full mx-4 ${animationClass} rounded-3xl`}
        hoverEffect={false}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className={`mx-auto mb-6 w-16 h-16 ${typeConfig.iconBg} ${typeConfig.borderColor} border-2 rounded-full flex items-center justify-center`}>
          {typeConfig.icon}
        </div>

        {/* Title */}
        <div className="mb-4">
          <EnhancedTextGlow intensity="medium" color={typeConfig.color}>
            <h2
              className="text-2xl sm:text-3xl font-bold font-display cyber-title !filter-none"
              style={{ WebkitTextFillColor: "unset" }}
            >
              {title}
            </h2>
          </EnhancedTextGlow>
        </div>

        {/* Message */}        <p className="text-base sm:text-lg text-red-300 mb-6 leading-relaxed whitespace-pre-line">
          {message}
        </p>

        {/* Divider */}
        <div 
          className="w-16 h-1 mx-auto mb-6 rounded-full shadow-lg"
          style={{ 
            backgroundColor: typeConfig.color,
            boxShadow: `0 0 10px ${typeConfig.color}, 0 0 20px ${typeConfig.color}66`
          }}
        ></div>

        {/* Buttons */}
        <div className="flex gap-3 justify-center">
          {type === 'confirm' && (
            <>
              <Button 
                className="cyber-button-secondary px-6 py-3 rounded-full flex-1 sm:flex-none min-w-[100px]" 
                onClick={handleClose}
              >
                {cancelText}
              </Button>
              <Button 
                className="cyber-button-primary px-6 py-3 rounded-full flex-1 sm:flex-none min-w-[100px]" 
                onClick={handleConfirm}
              >
                {confirmText}
              </Button>
            </>
          )}
          {type !== 'confirm' && (
            <Button 
              className="cyber-button-primary px-6 py-3 rounded-full w-full sm:w-auto min-w-[120px]" 
              onClick={handleClose}
            >
              {confirmText}
            </Button>
          )}
        </div>
      </CyberCard>
    </div>
  )
}
