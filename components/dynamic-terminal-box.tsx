"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { TypeAnimation } from "react-type-animation"
import { Terminal } from "lucide-react"

interface TextLine {
  text: string
  className?: string
  typingSpeed?: number
  startDelayOffset?: number // Delay relative to box expansion completion
  cursorBlinksAfterDone?: boolean
}

interface DynamicTerminalBoxProps {
  boxId: string // For unique key if multiple instances
  title: string
  textLines: TextLine[]
  initialDelay?: number // Delay before the box starts expanding
  expansionDuration?: number // Duration of the box expansion animation
  onAllLinesTyped?: () => void
  titleIsTyped?: boolean // Optional: to type the title itself
  titleTypingSpeed?: number
  titleStartDelayOffset?: number
}

export function DynamicTerminalBox({
  boxId,
  title,
  textLines,
  initialDelay = 0,
  expansionDuration = 500, // ms
  onAllLinesTyped,
  titleIsTyped = false,
  titleTypingSpeed = 50,
  titleStartDelayOffset = 0,
}: DynamicTerminalBoxProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [canStartTypingTitle, setCanStartTypingTitle] = useState(false)
  const [canStartTypingContent, setCanStartTypingContent] = useState(false)
  const linesCompletedRef = useRef(0)

  useEffect(() => {
    const boxExpandTimer = setTimeout(() => {
      setIsExpanded(true)
    }, initialDelay)

    return () => clearTimeout(boxExpandTimer)
  }, [initialDelay])

  useEffect(() => {
    if (isExpanded) {
      const titleTypingStartTimer = setTimeout(
        () => {
          setCanStartTypingTitle(true)
          // If title is not typed, content can start typing immediately after expansion
          if (!titleIsTyped) {
            setCanStartTypingContent(true)
          }
        },
        expansionDuration + (titleIsTyped ? titleStartDelayOffset || 0 : 0),
      ) // Start title typing after expansion (plus its own offset if typed)

      return () => clearTimeout(titleTypingStartTimer)
    }
  }, [isExpanded, expansionDuration, titleIsTyped, titleStartDelayOffset])

  const handleTitleTyped = () => {
    if (titleIsTyped) {
      setCanStartTypingContent(true)
    }
  }

  const handleLineComplete = () => {
    linesCompletedRef.current++
    if (linesCompletedRef.current === textLines.length) {
      onAllLinesTyped?.()
    }
  }

  const contentContainerStyle: React.CSSProperties = {
    transformOrigin: "top", // Content still expands top-down within the box
    transition: `transform ${expansionDuration}ms cubic-bezier(0.4, 0, 0.2, 1), opacity ${expansionDuration * 0.8}ms ease-out ${expansionDuration * 0.2}ms`,
    opacity: isExpanded ? 1 : 0,
    transform: isExpanded ? "scaleY(1)" : "scaleY(0)",
    overflow: "hidden",
    padding: "1.5rem", // p-6
    textAlign: "center",
    fontFamily: `"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", "Consolas", "Courier New", monospace`,
    fontSize: "0.875rem", // text-sm
  }

  // The entire box (cyber-terminal) expansion style
  const boxExpansionStyle: React.CSSProperties = {
    transformOrigin: "bottom", // For the whole box to expand from bottom
    transition: `transform ${expansionDuration}ms cubic-bezier(0.4, 0, 0.2, 1), opacity ${expansionDuration * 0.8}ms ease-out ${expansionDuration * 0.2}ms`,
    opacity: isExpanded ? 1 : 0,
    transform: isExpanded ? "scaleY(1)" : "scaleY(0)",
  }

  return (
    <div key={boxId} className="cyber-terminal my-8" style={boxExpansionStyle}>
      <div className="cyber-terminal-header">
        <Terminal className="h-5 w-5 text-[#ff0033]" />
        {titleIsTyped && canStartTypingTitle ? (
          <TypeAnimation
            sequence={[title, () => handleTitleTyped()]}
            speed={titleTypingSpeed}
            className="text-[#ff0033] font-mono"
            cursor={false} // Usually no cursor for titles after typing
            repeat={0}
            wrapper="span"
          />
        ) : !titleIsTyped ? (
          <span className="text-[#ff0033] font-mono">{title}</span>
        ) : null}
      </div>
      {/* Content container style is for the inner content, not the whole box expansion */}
      <div
        style={
          isExpanded && canStartTypingContent
            ? {
                // Only apply padding etc. when content is ready
                padding: "1.5rem",
                textAlign: "center",
                fontFamily: `"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", "Consolas", "Courier New", monospace`,
                fontSize: "0.875rem",
              }
            : { height: 0, overflow: "hidden" }
        }
      >
        {isExpanded &&
          canStartTypingContent &&
          textLines.map((line, index) => (
            <div key={index} className="mb-2 last:mb-0">
              <TypeAnimation
                sequence={[line.startDelayOffset || 0, line.text, () => handleLineComplete()]}
                speed={line.typingSpeed || 50}
                className={line.className || "text-gray-300"}
                cursor={
                  line.cursorBlinksAfterDone !== undefined ? line.cursorBlinksAfterDone : index === textLines.length - 1
                }
                repeat={0}
                wrapper="span"
              />
            </div>
          ))}
      </div>
    </div>
  )
}
