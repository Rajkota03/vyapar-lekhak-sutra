
import React from "react";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";

interface ToggleRowProps {
  label: string;
  checked: boolean;
  onToggle: (checked: boolean) => Promise<void>;
  className?: string;
}

export const ToggleRow: React.FC<ToggleRowProps> = ({ 
  label, 
  checked, 
  onToggle,
  className = ""
}) => {
  const handleToggle = async (newChecked: boolean) => {
    try {
      await onToggle(newChecked);
      toast({
        title: "Success",
        description: "Setting saved",
      });
    } catch (error) {
      console.error('Error toggling setting:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save setting",
      });
    }
  };

  return (
    <div className={`flex items-center justify-between py-3 border-b border-gray-100 ${className}`}>
      <span className="text-sm">{label}</span>
      <Switch checked={checked} onCheckedChange={handleToggle} />
    </div>
  );
};
