
import React from "react";
import { PremiumButton } from "@/components/ui/primitives/PremiumButton";

interface FloatingAction {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "outline";
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
}

interface FloatingActionBarProps {
  actions: FloatingAction[];
  show: boolean;
}

export const FloatingActionBar: React.FC<FloatingActionBarProps> = ({
  actions,
  show
}) => {
  if (!show || actions.length === 0) return null;

  // For single action, show as FAB
  if (actions.length === 1) {
    const action = actions[0];
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={action.onClick}
          disabled={action.disabled || action.loading}
          className="h-14 w-14 rounded-full bg-black hover:bg-gray-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
        >
          {action.icon}
        </button>
      </div>
    );
  }

  // For multiple actions, show as bottom bar
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border p-4 safe-area-pb">
      <div className="max-w-2xl mx-auto flex gap-3">
        {actions.map((action, index) => (
          <PremiumButton
            key={index}
            variant={action.variant || "primary"}
            size="lg"
            onClick={action.onClick}
            loading={action.loading}
            disabled={action.disabled}
            className="flex-1"
          >
            {action.icon}
            {action.label}
          </PremiumButton>
        ))}
      </div>
    </div>
  );
};
