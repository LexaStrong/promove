import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variantStyles = {
      default:
        "bg-[var(--pm-blue-600)] text-white hover:bg-[var(--pm-blue-700)] shadow-sm font-semibold",
      outline:
        "border border-[var(--pm-border)] bg-transparent hover:bg-[var(--pm-bg-subtle)] text-[var(--pm-text)]",
      secondary:
        "bg-[var(--pm-bg-subtle)] text-[var(--pm-text)] hover:bg-[var(--pm-bg-muted)] border border-[var(--pm-border)]",
      ghost:
        "hover:bg-[var(--pm-bg-subtle)] text-[var(--pm-text)]",
      link:
        "text-[var(--pm-blue-600)] underline-offset-4 hover:underline p-0 h-auto",
    };

    const sizeStyles = {
      default: "h-10 px-4 py-2",
      sm: "h-8 rounded-md px-3 text-xs",
      lg: "h-11 rounded-md px-8 text-base",
      icon: "h-10 w-10 p-0 flex items-center justify-center",
    };

    return (
      <button
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pm-blue-500)] disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
