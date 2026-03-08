"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
}

/**
 * Accessible Button component with:
 * - 44px minimum touch target (WCAG 2.1 Level AAA)
 * - Focus visible indicators
 * - Loading state
 * - Multiple variants
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed";

    const variantStyles = {
      primary:
        "bg-gold-500 text-white hover:bg-gold-600 focus-visible:ring-gold-500 shadow-md hover:shadow-lg active:scale-[0.98]",
      secondary:
        "bg-teal-500 text-white hover:bg-teal-600 focus-visible:ring-teal-500 shadow-md hover:shadow-lg active:scale-[0.98]",
      outline:
        "bg-transparent border-2 border-gold-500 text-gold-700 hover:bg-gold-50 focus-visible:ring-gold-500",
      ghost:
        "bg-transparent text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-400",
      danger:
        "bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500 shadow-md hover:shadow-lg active:scale-[0.98]",
    };

    const sizeStyles = {
      sm: "px-3 py-2 text-sm min-h-9", // 36px - acceptable for secondary actions
      md: "px-5 py-3 text-base min-h-11", // 44px - WCAG AAA
      lg: "px-6 py-3.5 text-lg min-h-12", // 48px - extra comfortable
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && "w-full",
          className,
        )}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ms-1 me-2 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

export default Button;
