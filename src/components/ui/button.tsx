import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-95",
  {
    variants: {
      variant: {
        default:
          "bg-cyber-cyan/20 border border-cyber-cyan/50 text-cyber-cyan hover:bg-cyber-cyan/30 hover:border-cyber-cyan hover:shadow-[0_0_20px_rgba(0,240,255,0.4)]",
        primary:
          "bg-gradient-to-r from-[#00f0ff] to-[#7000ff] text-black font-semibold hover:opacity-90 hover:shadow-[0_0_25px_rgba(0,240,255,0.5)]",
        destructive:
          "bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 hover:border-red-400 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]",
        outline:
          "border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/30 text-foreground",
        secondary:
          "bg-cyber-purple/20 border border-cyber-purple/50 text-purple-300 hover:bg-cyber-purple/30 hover:shadow-[0_0_20px_rgba(112,0,255,0.4)]",
        ghost:
          "hover:bg-white/10 text-muted-foreground hover:text-foreground",
        link:
          "text-primary underline-offset-4 hover:underline",
        cyber:
          "relative overflow-hidden bg-black/40 border border-cyber-cyan/40 text-cyber-cyan hover:border-cyber-cyan hover:shadow-[0_0_20px_rgba(0,240,255,0.5)] backdrop-blur-md",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
