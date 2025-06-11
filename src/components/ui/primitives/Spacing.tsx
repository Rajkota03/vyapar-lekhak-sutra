
import React from "react";
import { cn } from "@/lib/utils";

interface SpacingProps {
  children: React.ReactNode;
  className?: string;
}

export const Section: React.FC<SpacingProps> = ({ children, className }) => (
  <section className={cn("space-y-6", className)}>
    {children}
  </section>
);

export const Container: React.FC<SpacingProps> = ({ children, className }) => (
  <div className={cn("max-w-2xl mx-auto px-4", className)}>
    {children}
  </div>
);

export const Stack: React.FC<SpacingProps> = ({ children, className }) => (
  <div className={cn("space-y-4", className)}>
    {children}
  </div>
);

export const Group: React.FC<SpacingProps> = ({ children, className }) => (
  <div className={cn("space-y-2", className)}>
    {children}
  </div>
);
