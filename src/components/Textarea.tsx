"use client";

import { cn } from "@/lib/utils";
import { forwardRef, TextareaHTMLAttributes } from "react";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

/**
 * Accessible Textarea component with:
 * - 16px font size (prevents iOS zoom)
 * - Focus visible indicators
 * - ARIA support
 */
const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, rows = 4, ...props }, ref) => {
    const textareaId =
      id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = error ? `${textareaId}-error` : undefined;
    const helperId = helperText ? `${textareaId}-helper` : undefined;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-base font-medium text-gray-700 mb-2"
          >
            {label}
            {props.required && <span className="text-red-500 ms-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={cn(
            // Base styles with 16px font to prevent iOS zoom
            "w-full px-4 py-3 text-base rounded-lg border transition-all duration-200 resize-vertical",

            // Default state
            "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400",

            // Focus state with visible indicator
            "focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500",
            "focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2",

            // Hover state
            "hover:border-gray-400",

            // Disabled state
            "disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed disabled:opacity-60",

            // Error state
            error && "border-red-500 focus:ring-red-500 focus:border-red-500",

            // RTL support (using logical properties)
            "text-start",

            className,
          )}
          {...props}
        />
        {error && (
          <p id={errorId} className="mt-1.5 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="mt-1.5 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";

export default Textarea;
