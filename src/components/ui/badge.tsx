import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-cyber-cyan/40 bg-cyber-cyan/15 text-cyber-cyan shadow-[0_0_10px_rgba(0,240,255,0.2)]",
        secondary:
          "border-cyber-purple/40 bg-cyber-purple/15 text-purple-300",
        destructive:
          "border-red-500/40 bg-red-500/15 text-red-300",
        outline:
          "border-white/20 bg-white/5 text-foreground",
        success:
          "border-emerald-500/40 bg-emerald-500/15 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]",
        amber:
          "border-amber-500/40 bg-amber-500/15 text-amber-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
