import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 hover:-translate-y-px [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-btn-background text-btn-foreground border border-btn-border backdrop-blur-lg shadow-inner-white-sm hover:bg-btn-background-hover",
        destructive:
          "bg-btn-destructive-background text-btn-destructive-foreground border border-transparent backdrop-blur-lg shadow-inner-red-sm hover:bg-btn-destructive-background-hover",
        success:
          "bg-green-600 text-white hover:bg-green-600/90",
        outline:
          "border border-btn-border bg-transparent backdrop-blur-md text-btn-foreground hover:bg-btn-background-hover",
        secondary:
          "gradient-secondary text-white dark:text-slate-800 border border-slate-200 dark:border-slate-700",
        ghost: "hover:bg-btn-background-hover text-btn-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        gradient: "text-primary-foreground dark:text-secondary-foreground border-transparent bg-transparent",

        "gradient-primary": "gradient-primary text-white dark:text-slate-800 border border-transparent",
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
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const internalRef = React.useRef<HTMLButtonElement>(null);

    React.useImperativeHandle(ref, () => internalRef.current!);



    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={internalRef}

        {...props}
      />
    );
  }
);
Button.displayName = "Button"

export { Button, buttonVariants }
