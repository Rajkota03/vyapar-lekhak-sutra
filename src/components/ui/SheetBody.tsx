
import React from "react";
import { cn } from "@/lib/utils";

interface SheetBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const SheetBody: React.FC<SheetBodyProps> = ({ children, className }) => (
  <div className={cn("overflow-y-auto max-h-[calc(100dvh-120px)] px-4 pb-24", className)}>
    {children}
  </div>
);
