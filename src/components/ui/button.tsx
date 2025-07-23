import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-white/20 dark:bg-white/10 border border-white/30 dark:border-white/20 backdrop-blur-md shadow-lg hover:bg-white/30 hover:dark:bg-white/20 hover:shadow-xl active:bg-white/40 active:dark:bg-white/30 hover:border-white/50 active:border-white/70 text-gray-900 dark:text-gray-100",
        destructive: "bg-red-600/70 dark:bg-red-700/60 border border-white/30 dark:border-white/20 backdrop-blur-md shadow-lg text-white hover:bg-red-700/80 active:bg-red-800/90 hover:shadow-xl active:shadow-lg",
        outline: "bg-white/10 dark:bg-white/5 border border-white/40 dark:border-white/20 backdrop-blur-md shadow-md hover:bg-white/20 hover:dark:bg-white/10 hover:shadow-lg active:bg-white/30 active:dark:bg-white/20 text-gray-900 dark:text-gray-100",
        secondary: "bg-white/30 dark:bg-white/20 border border-white/30 dark:border-white/20 backdrop-blur-md shadow-lg hover:bg-white/40 hover:dark:bg-white/30 hover:shadow-xl active:bg-white/50 active:dark:bg-white/40 text-gray-900 dark:text-gray-100",
        ghost: "bg-transparent border border-transparent hover:bg-white/10 hover:dark:bg-white/10 hover:shadow focus:bg-white/10 text-gray-900 dark:text-gray-100",
        link: "bg-transparent border-none underline-offset-4 hover:underline text-primary hover:text-primary/80",
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
