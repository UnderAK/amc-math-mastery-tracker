import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-white/40 dark:bg-white/20 border border-white/70 dark:border-white/40 backdrop-blur-2xl shadow-2xl hover:bg-white/60 hover:dark:bg-white/40 hover:shadow-2xl active:bg-white/80 active:dark:bg-white/60 hover:border-white/90 active:border-white/100 text-black dark:text-white font-semibold",
        destructive: "bg-red-600/80 dark:bg-red-700/70 border border-white/80 dark:border-white/50 backdrop-blur-2xl shadow-2xl text-white font-bold hover:bg-red-700/90 active:bg-red-800/100 hover:shadow-2xl active:shadow-xl hover:border-white/100 active:border-white/100",
        outline: "bg-white/30 dark:bg-white/10 border border-white/80 dark:border-white/40 backdrop-blur-2xl shadow-xl hover:bg-white/60 hover:dark:bg-white/30 hover:shadow-2xl active:bg-white/80 active:dark:bg-white/50 text-black dark:text-white font-semibold",
        secondary: "bg-white/50 dark:bg-white/30 border border-white/80 dark:border-white/50 backdrop-blur-2xl shadow-2xl hover:bg-white/70 hover:dark:bg-white/50 hover:shadow-2xl active:bg-white/90 active:dark:bg-white/70 text-black dark:text-white font-semibold",
        ghost: "bg-white/20 dark:bg-white/10 border border-white/40 dark:border-white/20 backdrop-blur-2xl shadow-md hover:bg-white/40 hover:dark:bg-white/20 hover:shadow-lg active:bg-white/60 active:dark:bg-white/40 text-black dark:text-white font-semibold",
        link: "bg-white/30 dark:bg-white/10 border-none underline-offset-4 hover:underline text-blue-700 dark:text-blue-300 hover:text-blue-900 hover:dark:text-blue-100 font-semibold backdrop-blur-lg",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
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
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
