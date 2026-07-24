"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "secondary";

type ButtonProps = {
  variant?: ButtonVariant;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const variantClasses: Record<ButtonVariant, string> = {
  default:
    "bg-sky-600 text-white shadow-sm hover:bg-sky-500 focus-visible:bg-sky-500",
  secondary:
    "bg-white text-slate-900 border border-slate-200 hover:bg-slate-100 focus-visible:bg-slate-100",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex min-h-12 min-w-0 max-w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium leading-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60",
          variantClasses[variant],
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
