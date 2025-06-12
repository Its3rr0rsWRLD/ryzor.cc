import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 touch-target",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-red-600/90 focus:bg-red-700 focus:text-white",
        destructive: "bg-destructive text-destructive-foreground hover:bg-red-700 focus:bg-red-800 focus:text-white",
        outline: "border border-input bg-background hover:bg-red-100 hover:text-red-600 focus:bg-red-200 focus:text-red-700",
        secondary: "bg-secondary text-secondary-foreground hover:bg-red-100 hover:text-red-600 focus:bg-red-200 focus:text-red-700",
        ghost: "hover:bg-red-100 hover:text-red-600 focus:bg-red-200 focus:text-red-700",
        link: "text-primary underline-offset-4 hover:underline hover:text-red-600 focus:text-red-700",
      },
      size: {
        default: "h-10 px-4 py-2 rounded-full",
        sm: "h-9 rounded-full px-3",
        lg: "h-11 rounded-full px-8",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, style, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp 
        className={cn(buttonVariants({ variant, size, className }))} 
        ref={ref} 
        style={{
          WebkitTapHighlightColor: 'rgba(255, 0, 51, 0.2)',
          touchAction: 'manipulation',
          ...style
        }}
        {...props} 
      />
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }