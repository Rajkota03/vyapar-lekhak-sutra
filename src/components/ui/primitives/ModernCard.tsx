
import React from "react";
import { cn } from "@/lib/utils";

interface ModernCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "outlined" | "elevated";
  padding?: "sm" | "md" | "lg";
}

export const ModernCard: React.FC<ModernCardProps> = ({ 
  children, 
  className,
  variant = "default",
  padding = "md"
}) => {
  const baseClasses = "bg-card text-card-foreground rounded-xl border";
  
  const variantClasses = {
    default: "border-border shadow-sm",
    outlined: "border-border shadow-none",
    elevated: "border-border shadow-lg"
  };
  
  const paddingClasses = {
    sm: "p-3",
    md: "p-4",
    lg: "p-6"
  };

  return (
    <div className={cn(
      baseClasses,
      variantClasses[variant],
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  );
};
