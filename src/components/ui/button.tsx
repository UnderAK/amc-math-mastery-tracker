import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "relative overflow-hidden inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 before:absolute before:inset-0 before:bg-[radial-gradient(400px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(255,255,255,0.2),transparent)] before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100 bg-noise [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-btn-background text-btn-foreground border border-btn-border backdrop-blur-lg shadow-inner-white-sm hover:bg-btn-background-hover",
        destructive:
          "bg-btn-destructive-background text-btn-destructive-foreground border border-transparent backdrop-blur-lg shadow-inner-red-sm hover:bg-btn-destructive-background-hover",
        outline:
          "border border-btn-border bg-transparent backdrop-blur-md text-btn-foreground hover:bg-btn-background-hover",
        secondary:
          "bg-btn-primary-background text-btn-primary-foreground border border-transparent backdrop-blur-lg shadow-inner-blue-sm hover:bg-btn-primary-background-hover",
        ghost: "hover:bg-btn-background-hover text-btn-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        gradient: "text-primary-foreground dark:text-secondary-foreground border-transparent bg-transparent",
        "gradient-secondary": "gradient-secondary text-secondary-foreground",
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

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      internalRef.current?.style.setProperty("--mouse-x", `${x}px`);
      internalRef.current?.style.setProperty("--mouse-y", `${y}px`);
    };

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={internalRef}
        onMouseMove={handleMouseMove}
        {...props}
      />
    );
  }
);
Button.displayName = "Button"

export { Button, buttonVariants }
