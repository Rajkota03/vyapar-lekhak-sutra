
import React from "react";
import { cn } from "@/lib/utils";

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
}

export const Heading1: React.FC<TypographyProps> = ({ children, className }) => (
  <h1 className={cn("text-2xl font-bold text-foreground", className)}>
    {children}
  </h1>
);

export const Heading2: React.FC<TypographyProps> = ({ children, className }) => (
  <h2 className={cn("text-xl font-semibold text-foreground", className)}>
    {children}
  </h2>
);

export const Heading3: React.FC<TypographyProps> = ({ children, className }) => (
  <h3 className={cn("text-lg font-medium text-foreground", className)}>
    {children}
  </h3>
);

export const BodyText: React.FC<TypographyProps> = ({ children, className }) => (
  <p className={cn("text-sm text-foreground leading-relaxed", className)}>
    {children}
  </p>
);

export const CaptionText: React.FC<TypographyProps> = ({ children, className }) => (
  <span className={cn("text-xs text-muted-foreground", className)}>
    {children}
  </span>
);

export const LabelText: React.FC<TypographyProps> = ({ children, className }) => (
  <label className={cn("text-sm font-medium text-foreground", className)}>
    {children}
  </label>
);
