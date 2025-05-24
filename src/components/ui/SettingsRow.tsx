
import React from "react";
import { ChevronRight } from "lucide-react";

interface SettingsRowProps {
  label: string;
  right?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const SettingsRow: React.FC<SettingsRowProps> = ({ 
  label, 
  right, 
  onClick,
  className = ""
}) => (
  <div 
    className={`flex items-center justify-between py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${className}`}
    onClick={onClick}
  >
    <span className="text-sm">{label}</span>
    {right ?? <ChevronRight size={18} className="text-gray-400" />}
  </div>
);
