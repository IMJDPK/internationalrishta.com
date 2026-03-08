"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import Button from "./Button";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  size?: "sm" | "md" | "lg";
}

/**
 * Empty state component for when there's no data to display
 * Used in discover, messages, profile matches, etc.
 */
export default function EmptyState({
  icon,
  title,
  description,
  action,
  size = "md",
}: EmptyStateProps) {
  const iconSizes = {
    sm: "text-4xl mb-3",
    md: "text-6xl mb-4",
    lg: "text-8xl mb-6",
  };

  const titleSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
    >
      {/* Icon */}
      {icon && <div className={`${iconSizes[size]} text-gray-300`}>{icon}</div>}

      {/* Title */}
      <h3
        className={`${titleSizes[size]} font-semibold text-gray-900 mb-2 max-w-md`}
      >
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-base text-gray-500 max-w-md mb-6">{description}</p>
      )}

      {/* Action Button */}
      {action && (
        <Button onClick={action.onClick} size={size === "sm" ? "sm" : "md"}>
          {action.label}
        </Button>
      )}

      {/* Decorative element */}
      <svg
        className="mt-8 w-48 h-32 text-gray-100"
        viewBox="0 0 200 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="50" cy="50" r="8" fill="currentColor" opacity="0.3" />
        <circle cx="100" cy="50" r="12" fill="currentColor" opacity="0.5" />
        <circle cx="150" cy="50" r="8" fill="currentColor" opacity="0.3" />
      </svg>
    </motion.div>
  );
}
