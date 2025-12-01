"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import { motion, MotionProps } from "framer-motion"
import { buttonVariants as glassButtonVariants } from "@/lib/glass-morphism"
import { glassButtonVariants as motionVariants } from "@/lib/animations"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-sage-500 to-sage-600 text-white shadow-lg hover:shadow-xl hover:from-sage-600 hover:to-sage-700 hover:scale-105 active:scale-95 backdrop-blur-sm border border-white/20",
        destructive:
          "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:shadow-xl hover:from-red-600 hover:to-red-700 hover:scale-105 active:scale-95",
        outline:
          "backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 hover:scale-105 active:scale-95 shadow-glass text-foreground hover:text-sage-600",
        secondary:
          "bg-gradient-to-r from-beauty-500 to-beauty-600 text-white shadow-lg hover:shadow-xl hover:from-beauty-600 hover:to-beauty-700 hover:scale-105 active:scale-95",
        ghost:
          "hover:bg-white/10 hover:text-sage-600 hover:backdrop-blur-sm transition-all duration-300",
        link: "text-sage-600 underline-offset-4 hover:underline hover:text-sage-700 transition-colors",
        glass:
          "backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 hover:backdrop-blur-lg hover:scale-105 active:scale-95 shadow-glass",
        glassPrimary:
          "backdrop-blur-sm bg-sage-500/20 border border-sage-400/30 text-sage-700 hover:bg-sage-500/30 hover:text-sage-800 hover:scale-105 active:scale-95",
        glassSecondary:
          "backdrop-blur-sm bg-beauty-500/20 border border-beauty-400/30 text-beauty-700 hover:bg-beauty-500/30 hover:text-beauty-800 hover:scale-105 active:scale-95",
        neumorphic:
          "bg-gray-100 shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#d1d9e6,-2px_-2px_4px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] text-gray-700 hover:text-gray-800",
      },
      size: {
        default: "h-11 px-6 py-3 has-[>svg]:px-4",
        sm: "h-9 rounded-lg gap-1.5 px-4 has-[>svg]:px-3",
        xs: "h-7 rounded-md gap-1 px-3 has-[>svg]:px-2.5 text-xs",
        lg: "h-12 rounded-xl px-8 has-[>svg]:px-6 text-base",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  leftIcon,
  rightIcon,
  loading,
  animated = true,
  onClick,
  onMouseEnter,
  onMouseLeave,
  disabled,
  type,
  form,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
    loading?: boolean
    animated?: boolean
  }) {
  const Comp = asChild ? Slot : (animated ? motion.button : "button")
  
  const content = (
    <>
      {loading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="animate-spin" />
        </motion.div>
      ) : leftIcon}
      {children}
      {!loading && rightIcon}
    </>
  )

  const motionProps = animated && !asChild ? {
    initial: "rest",
    whileHover: "hover", 
    whileTap: "tap",
    variants: motionVariants
  } : {}

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={loading || disabled}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      type={type}
      form={form}
      {...motionProps}
      {...(asChild ? props : props)}
    >
      {asChild ? (
        // When asChild is true, we need to pass a single React element
        React.isValidElement(children) ? (
          React.cloneElement(children as React.ReactElement, {
            children: (
              <>
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 className="animate-spin" />
                  </motion.div>
                ) : leftIcon}
                {React.isValidElement(children) ? (children as any).props?.children || children : children}
                {!loading && rightIcon}
              </>
            ),
          } as any)
        ) : (
          <span>{content}</span>
        )
      ) : (
        content
      )}
    </Comp>
  )
}

export { Button, buttonVariants }